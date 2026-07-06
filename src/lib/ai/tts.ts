import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import type { Readable } from "stream";
import { uploadFile } from "../storage";
import { nanoid } from "nanoid";
import { isDemoMode } from "../demo-mode";
import { DEMO_SILENT_AUDIO_PATH } from "../demo-audio";
import { DEFAULT_FREE_VOICE, FREE_VOICES, type FreeVoice } from "../voices";

export interface SubtitleWord {
  text: string;
  startMs: number;
  endMs: number;
}

export interface SubtitleSegment {
  text: string;
  startMs: number;
  endMs: number;
  words: SubtitleWord[];
}

const MIN_AUDIO_BYTES = 100;
const SYNTHESIS_TIMEOUT_MS = 10_000;

// Minimal valid MP3 used only when every Edge voice fails (e.g. offline).
const SILENT_MP3 = Buffer.from(
  "/+MYxAAAAANIAAAAAExBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
  "base64"
);

export async function generateTTS(
  text: string,
  voice = DEFAULT_FREE_VOICE,
  options?: { fast?: boolean }
): Promise<{
  audioUrl: string;
  duration: number;
  subtitles: SubtitleSegment[];
  voiceId: string;
}> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Narration text is required for voice generation");
  }

  if (options?.fast && isDemoMode()) {
    const duration = estimateDuration(trimmed);
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const audioUrl = base
      ? `${base.replace(/\/$/, "")}/api/demo/silent-audio`
      : "/api/demo/silent-audio";

    return {
      audioUrl,
      duration,
      subtitles: generateSubtitlesFromText(trimmed, duration),
      voiceId: voice,
    };
  }

  const { buffer, voiceId } = await synthesizeSpeech(trimmed, voice);
  const key = `audio/${nanoid()}.mp3`;
  const audioUrl = await uploadFile(buffer, key, "audio/mpeg");
  const duration = estimateDuration(trimmed);
  const subtitles = generateSubtitlesFromText(trimmed, duration);

  return { audioUrl, duration, subtitles, voiceId };
}

async function synthesizeSpeech(
  text: string,
  voice: string
): Promise<{ buffer: Buffer; voiceId: string }> {
  const voicesToTry = [
    voice,
    ...FREE_VOICES.map((v) => v.id).filter((id) => id !== voice),
  ];

  for (const tryVoice of voicesToTry) {
    try {
      const buffer = await synthesizeSpeechOnce(text, tryVoice);
      if (buffer.length >= MIN_AUDIO_BYTES) {
        if (tryVoice !== voice) {
          console.warn(
            `Edge TTS voice "${voice}" unavailable, used "${tryVoice}" instead`
          );
        }
        return { buffer, voiceId: tryVoice };
      }
    } catch (error) {
      console.warn(`Edge TTS failed for voice "${tryVoice}":`, error);
    }
  }

  console.warn("All Edge TTS voices failed, using silent placeholder audio");
  return { buffer: SILENT_MP3, voiceId: voice };
}

async function synthesizeSpeechOnce(
  text: string,
  voice: string
): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(text);

  try {
    return await collectAudioStream(audioStream, tts);
  } finally {
    tts.close();
  }
}

async function collectAudioStream(
  audioStream: Readable,
  tts: MsEdgeTTS
): Promise<Buffer> {
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      tts.close();
      resolve();
    }, SYNTHESIS_TIMEOUT_MS);

    const finish = () => {
      clearTimeout(timeout);
      resolve();
    };

    audioStream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    audioStream.on("end", finish);
    audioStream.on("close", finish);
    audioStream.on("error", (err: Error) => {
      clearTimeout(timeout);
      reject(err);
    });
  });

  return Buffer.concat(chunks);
}

function estimateDuration(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(2, (words / 150) * 60);
}

function generateSubtitlesFromText(
  text: string,
  totalDuration: number
): SubtitleSegment[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const wordDuration = (totalDuration * 1000) / words.length;
  const segments: SubtitleSegment[] = [];
  const wordsPerSegment = 6;

  for (let i = 0; i < words.length; i += wordsPerSegment) {
    const segmentWords = words.slice(i, i + wordsPerSegment);
    const startMs = i * wordDuration;
    const endMs = (i + segmentWords.length) * wordDuration;

    segments.push({
      text: segmentWords.join(" "),
      startMs,
      endMs,
      words: segmentWords.map((w, j) => ({
        text: w,
        startMs: (i + j) * wordDuration,
        endMs: (i + j + 1) * wordDuration,
      })),
    });
  }

  return segments;
}

export async function generateElevenLabsTTS(
  text: string,
  apiKey: string,
  voiceId = "21m00Tcm4TlvDq8ikWAM"
): Promise<{
  audioUrl: string;
  duration: number;
  subtitles: SubtitleSegment[];
  voiceId: string;
}> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    }
  );

  if (!response.ok) {
    return generateTTS(text);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const key = `audio/${nanoid()}.mp3`;
  const audioUrl = await uploadFile(audioBuffer, key, "audio/mpeg");
  const duration = estimateDuration(text);
  const subtitles = generateSubtitlesFromText(text, duration);

  return { audioUrl, duration, subtitles, voiceId };
}

export type { FreeVoice };
export { FREE_VOICES, DEFAULT_FREE_VOICE };
