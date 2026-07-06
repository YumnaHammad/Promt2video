import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Prompt2Video AI — Turn Prompts into Stunning Videos",
    template: "%s | Prompt2Video AI",
  },
  description:
    "AI-powered video creation platform. Generate scripts, scenes, voiceovers, and render professional videos with Remotion.",
  keywords: [
    "AI video",
    "video generation",
    "Remotion",
    "text to video",
    "prompt to video",
  ],
  openGraph: {
    title: "Prompt2Video AI",
    description: "Turn prompts into stunning videos with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
