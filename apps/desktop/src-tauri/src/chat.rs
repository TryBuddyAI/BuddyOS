use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

use crate::keychain;

const BASE_PROMPT: &str = r#"You are BUDDY, a desktop AI companion who lives at the edge of the user's screen and pops up when summoned. You have your own personality — confident, warm, slightly playful, never patronizing. Think of yourself as a brilliant professor with a dry sense of humor: precise in your answers, occasionally funny in your phrasing, never longer than necessary.

Hard rules:
- Minimum 1 sentence, maximum 10 sentences per response.
- Length scales with the question. A factual lookup gets 1–2 sentences. A nuanced topic gets 4–6. A code request gets the code block plus 1–3 sentences of explanation. Never pad to fill space.
- Cite sources inline as "(example.com)" when the web_search tool found verifiable claims used in the answer.
- Never refuse a benign question. If you don't know, say so honestly and offer what you can.
- Never break character. You are BUDDY, not "an AI assistant" or "an LLM" or "a language model".
- Never start with "Great question", "I'd be happy to", "Sure!", or any other filler — get straight into the answer.
- No exclamation marks unless the user used one first.

Tools:
- web_search: use whenever the question requires up-to-date information, real-world facts, recent events, prices, weather, sports, news, or specific verifiable claims.
- Do NOT use web_search for math, coding logic, opinions, follow-ups that don't need new data, or knowledge known to be stable.

Formatting:
- Plain prose by default. Markdown lists only when the answer is genuinely list-shaped (≥3 parallel items).
- Fenced code blocks with the correct language tag for any code.
- Inline `code` for short snippets, command names, or filenames.
- No emojis in serious answers; sparing use in playful exchanges."#;

/// Personality preset selected in Settings. Each appends a short directive
/// to BASE_PROMPT instead of replacing it — the 1-10 sentence rule and the
/// "never break character" rule always apply.
fn system_prompt_for(personality: Option<&str>) -> String {
    let extra = match personality.unwrap_or("default") {
        "brief" => Some(
            "STYLE OVERRIDE: Be especially terse. Cap at 3 sentences for almost everything. \
             One-line answers are great when the question allows. Skip explanations \
             unless the user asks for them.",
        ),
        "tutor" => Some(
            "STYLE OVERRIDE: Adopt a patient teaching tone. Use the upper end of the \
             1-10 sentence range (4-7 sentences). Briefly explain the why, not just the \
             what. End with one short follow-up suggestion when relevant. Stay encouraging \
             without being sycophantic.",
        ),
        "friend" => Some(
            "STYLE OVERRIDE: Lean more casual and warm. Light humor is welcome (still no \
             exclamation marks unless they used one). Contractions throughout. \
             Occasionally riff briefly on the question before answering — but never longer \
             than the answer itself.",
        ),
        _ => None,
    };
    match extra {
        Some(s) => format!("{BASE_PROMPT}\n\n{s}"),
        None => BASE_PROMPT.to_string(),
    }
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ChatChunk {
    Start { id: String },
    TextDelta { text: String },
    ToolUse { name: String },
    Citation { url: String, title: String },
    Done,
    Error { message: String },
}

#[tauri::command]
pub async fn stream_chat(
    app: AppHandle,
    request_id: String,
    messages: Vec<ChatMessage>,
    personality: Option<String>,
) -> Result<(), String> {
    let api_key = keychain::get_key("anthropic")
        .ok_or_else(|| "No Anthropic API key. Set one in Settings.".to_string())?;
    let system = system_prompt_for(personality.as_deref());

    let request_body = serde_json::json!({
        "model": "claude-opus-4-7",
        "max_tokens": 800,
        "stream": true,
        "system": system,
        "messages": messages,
        // First-party web search — lets BUDDY answer questions about recent
        // events, weather, prices, sports, news, etc. with citations.
        // The model decides when to call it; we cap at 3 uses per turn so a
        // confused chain of searches can't burn a token budget.
        "tools": [
            {
                "type": "web_search_20250305",
                "name": "web_search",
                "max_uses": 3
            }
        ],
    });

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", &api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        let msg = format!("Anthropic {status}: {body}");
        let _ = app.emit(
            &format!("chat-chunk:{request_id}"),
            ChatChunk::Error { message: msg.clone() },
        );
        return Err(msg);
    }

    let _ = app.emit(
        &format!("chat-chunk:{request_id}"),
        ChatChunk::Start {
            id: request_id.clone(),
        },
    );

    let mut stream = resp.bytes_stream();
    let mut buffer = String::new();

    while let Some(item) = stream.next().await {
        let bytes = match item {
            Ok(b) => b,
            Err(e) => {
                let _ = app.emit(
                    &format!("chat-chunk:{request_id}"),
                    ChatChunk::Error {
                        message: format!("Stream error: {e}"),
                    },
                );
                return Err(format!("Stream error: {e}"));
            }
        };
        buffer.push_str(&String::from_utf8_lossy(&bytes));

        // SSE messages are separated by \n\n; each message has one or more
        // lines like "event: name" and "data: payload".
        while let Some(idx) = buffer.find("\n\n") {
            let raw_event = buffer[..idx].to_string();
            buffer.drain(..=idx + 1);
            handle_sse_event(&app, &request_id, &raw_event);
        }
    }

    let _ = app.emit(&format!("chat-chunk:{request_id}"), ChatChunk::Done);
    Ok(())
}

fn handle_sse_event(app: &AppHandle, request_id: &str, raw: &str) {
    let mut data = String::new();
    for line in raw.lines() {
        if let Some(rest) = line.strip_prefix("data: ") {
            data.push_str(rest);
        }
    }
    if data.is_empty() {
        return;
    }
    let json: serde_json::Value = match serde_json::from_str(&data) {
        Ok(v) => v,
        Err(_) => return,
    };
    let kind = json.get("type").and_then(|v| v.as_str()).unwrap_or("");

    match kind {
        "content_block_delta" => {
            let Some(delta) = json.get("delta") else { return };
            let delta_type = delta.get("type").and_then(|v| v.as_str()).unwrap_or("");
            match delta_type {
                "text_delta" => {
                    if let Some(text) = delta.get("text").and_then(|v| v.as_str()) {
                        let _ = app.emit(
                            &format!("chat-chunk:{request_id}"),
                            ChatChunk::TextDelta {
                                text: text.to_string(),
                            },
                        );
                    }
                }
                // web_search and other server tools attach citations to text
                // blocks as they stream. Each citation has url + title.
                "citations_delta" => {
                    if let Some(citation) = delta.get("citation") {
                        let url = citation
                            .get("url")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();
                        let title = citation
                            .get("title")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();
                        if !url.is_empty() {
                            let _ = app.emit(
                                &format!("chat-chunk:{request_id}"),
                                ChatChunk::Citation { url, title },
                            );
                        }
                    }
                }
                _ => {}
            }
        }
        "content_block_start" => {
            let Some(cb) = json.get("content_block") else { return };
            let cb_type = cb.get("type").and_then(|v| v.as_str()).unwrap_or("");
            match cb_type {
                // Client-side tool call (we don't have any of these yet).
                "tool_use" | "server_tool_use" => {
                    if let Some(name) = cb.get("name").and_then(|v| v.as_str()) {
                        let _ = app.emit(
                            &format!("chat-chunk:{request_id}"),
                            ChatChunk::ToolUse {
                                name: name.to_string(),
                            },
                        );
                    }
                }
                _ => {}
            }
        }
        _ => {}
    }
}

#[tauri::command]
pub fn set_api_key(provider: String, key: String) -> Result<(), String> {
    keychain::set_key(&provider, &key)
}

#[tauri::command]
pub fn has_api_key(provider: String) -> bool {
    keychain::get_key(&provider).is_some()
}

#[tauri::command]
pub fn clear_api_key(provider: String) -> Result<(), String> {
    keychain::delete_key(&provider)
}
