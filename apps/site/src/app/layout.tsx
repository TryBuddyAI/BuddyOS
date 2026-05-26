import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/Layout/SmoothScroll";
import { CompanionStage } from "@/components/Companion/CompanionStage";
import { SpeechBubbleLayer } from "@/components/Companion/SpeechBubbleLayer";
import { ChatDock } from "@/components/Chat/ChatDock";
import { WaypointController } from "@/components/Companion/WaypointController";
import { ClientBoot } from "@/components/Layout/ClientBoot";
import { LoadingGate } from "@/components/Layout/LoadingGate";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BUDDY — A companion made of light",
  description:
    "BUDDY is a small AI companion that lives on your desktop. Click to ask anything. He disappears the moment you focus.",
  keywords: ["ai", "desktop assistant", "claude", "productivity", "companion"],
  openGraph: {
    title: "BUDDY — A companion made of light",
    description:
      "BUDDY lives quietly at the edge of your screen. Click to ask anything.",
    type: "website",
    siteName: "BUDDY",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0F1419",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ClientBoot />
        <LoadingGate />
        <SmoothScroll>
          <main className="relative">{children}</main>
        </SmoothScroll>
        <CompanionStage />
        <SpeechBubbleLayer />
        <WaypointController />
        <ChatDock />
      </body>
    </html>
  );
}
