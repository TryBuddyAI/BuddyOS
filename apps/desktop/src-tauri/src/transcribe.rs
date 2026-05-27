//! Voice transcription.
//!
//! Currently a scaffolded stub: accepts an audio blob from the renderer and
//! returns a placeholder transcript. The actual transcription happens in
//! one of three follow-up paths:
//!
//! 1. `whisper-rs` — link whisper.cpp into the binary (~10 MB) + a ~75 MB
//!    `ggml-tiny.en.bin` model downloaded at first use.
//! 2. Shell out to a system-installed `whisper-cli` (Homebrew, etc.).
//! 3. OpenAI Whisper API — tiny binary, ~$0.006/min, needs a key.
//!
//! The interface here (audio bytes in, transcript out) doesn't change.

use std::path::PathBuf;
use tauri::Manager;

/// Where we'd put the offline Whisper model file when option 1 ships.
fn model_path(app: &tauri::AppHandle) -> Option<PathBuf> {
    app.path()
        .app_data_dir()
        .ok()
        .map(|dir| dir.join("whisper-tiny.en.bin"))
}

#[tauri::command]
pub fn has_whisper_model(app: tauri::AppHandle) -> bool {
    model_path(&app)
        .map(|p| p.exists())
        .unwrap_or(false)
}

/// Transcribe a single audio blob. The blob is whatever MediaRecorder
/// produced in the renderer (typically WebM/Opus on macOS WKWebView).
///
/// Returns:
/// - Ok(transcript) when transcription succeeds.
/// - Err(message) for permission errors, missing models, etc. The renderer
///   surfaces these to the user via the input bar.
#[tauri::command]
pub async fn transcribe(
    app: tauri::AppHandle,
    audio: Vec<u8>,
) -> Result<String, String> {
    if audio.is_empty() {
        return Err("No audio captured".into());
    }

    let has_model = model_path(&app).map(|p| p.exists()).unwrap_or(false);
    if !has_model {
        return Err(
            "VOICE_MODEL_MISSING: Voice transcription needs the Whisper model. \
             Open Settings → Voice to download it (~75 MB)."
                .into(),
        );
    }

    // Once whisper-rs is plumbed in:
    //   1. Decode `audio` (WebM/Opus) to 16 kHz mono f32 PCM via symphonia.
    //   2. Load WhisperContext::new(model_path).
    //   3. Run state.full(params, &pcm) and concatenate the segments.
    //
    // For now, the model presence check above is the gate — when the model
    // file exists, swap this body out for the real call.
    Err("Whisper backend not yet linked. (Model file is present.)".into())
}

/// Stubbed download command — kicks off a background fetch of the
/// ggml-tiny.en.bin model from huggingface.co into the app data dir.
/// Returns the bytes downloaded so far via events; the renderer can show a
/// progress bar.
///
/// Not implemented yet. Returns an explanatory error so the UI can show
/// a "coming soon" state instead of a generic failure.
#[tauri::command]
pub async fn download_whisper_model(_app: tauri::AppHandle) -> Result<(), String> {
    Err(
        "Model download lands in a follow-up release. For now, you can drop \
         ggml-tiny.en.bin into the app data dir manually."
            .into(),
    )
}
