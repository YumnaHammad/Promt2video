import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { decrypt } from "../encryption";
import { isDemoMode } from "../demo-mode";
import type { ApiProvider } from "@/generated/prisma/client";

export interface ScriptScene {
  title: string;
  narration: string;
  visualPrompt: string;
  duration: number;
}

export interface GeneratedScript {
  title: string;
  description: string;
  scenes: ScriptScene[];
  totalDuration: number;
}

const SCRIPT_SYSTEM_PROMPT = `You are an expert video scriptwriter. Generate engaging video scripts with clear scene breakdowns.
Return valid JSON with this structure:
{
  "title": "Video title",
  "description": "Brief description",
  "scenes": [
    {
      "title": "Scene title",
      "narration": "Voiceover text for this scene",
      "visualPrompt": "Detailed visual description for asset search",
      "duration": 5
    }
  ]
}
Keep scenes between 3-8 seconds. Total video should be 30-90 seconds unless specified otherwise.`;

async function getUserApiKey(
  userId: string,
  provider: ApiProvider
): Promise<string | null> {
  const apiKey = await db.apiKey.findUnique({
    where: { userId_provider: { userId, provider } },
  });
  if (!apiKey?.isValid) return null;
  return decrypt(apiKey.encryptedKey);
}

export async function generateScript(
  prompt: string,
  userId: string,
  options?: { duration?: number; style?: string; useOwnKeys?: boolean }
): Promise<GeneratedScript> {
  const userPrompt = `Create a video script for: "${prompt}"
${options?.duration ? `Target duration: ${options.duration} seconds` : ""}
${options?.style ? `Style: ${options.style}` : ""}
Return only valid JSON.`;

  if (isDemoMode() && !options?.useOwnKeys) {
    return generateMockScript(prompt, options?.duration, options?.style);
  }

  if (options?.useOwnKeys) {
    const openaiKey = await getUserApiKey(userId, "OPENAI");
    if (openaiKey) {
      return generateWithOpenAI(userPrompt, openaiKey);
    }
    const anthropicKey = await getUserApiKey(userId, "ANTHROPIC");
    if (anthropicKey) {
      return generateWithAnthropic(userPrompt, anthropicKey);
    }
    const geminiKey = await getUserApiKey(userId, "GEMINI");
    if (geminiKey) {
      return generateWithGemini(userPrompt, geminiKey);
    }
  }

  if (isValidEnvKey(process.env.OPENROUTER_API_KEY)) {
    try {
      return await generateWithOpenRouter(userPrompt);
    } catch {
      if (isDemoMode()) return generateMockScript(prompt, options?.duration, options?.style);
    }
  }
  if (isValidEnvKey(process.env.GEMINI_API_KEY)) {
    try {
      return await generateWithGemini(userPrompt, process.env.GEMINI_API_KEY!);
    } catch {
      if (isDemoMode()) return generateMockScript(prompt, options?.duration, options?.style);
    }
  }

  if (isDemoMode()) {
    return generateMockScript(prompt, options?.duration, options?.style);
  }

  throw new Error("No AI provider configured");
}

function isValidEnvKey(key?: string): boolean {
  if (!key) return false;
  const placeholders = ["xxx", "your-", "pk_test_xxx", "sk_test_xxx"];
  return !placeholders.some((p) => key.includes(p)) && key.length > 12;
}

function generateMockScript(
  prompt: string,
  duration = 30,
  style?: string
): GeneratedScript {
  const sceneCount = Math.max(3, Math.min(6, Math.floor(duration / 8)));
  const sceneDuration = Math.floor(duration / sceneCount);

  const scenes: ScriptScene[] = Array.from({ length: sceneCount }, (_, i) => ({
    title: `Scene ${i + 1}`,
    narration: [
      `Welcome! Today we're exploring: ${prompt.slice(0, 80)}.`,
      `Here's what makes this truly special and worth your attention.`,
      `Let's dive deeper into the key benefits and features.`,
      `See how this can transform the way you work and create.`,
      `The results speak for themselves — impressive and powerful.`,
      `Ready to get started? Take the next step today.`,
    ][i] ?? `Discover more about this amazing topic in scene ${i + 1}.`,
    visualPrompt: `${prompt} ${style ?? "cinematic"} professional scene ${i + 1}`,
    duration: sceneDuration,
  }));

  return {
    title: prompt.slice(0, 60) + (prompt.length > 60 ? "..." : ""),
    description: `A ${style ?? "engaging"} video about: ${prompt.slice(0, 100)}`,
    scenes,
    totalDuration: scenes.reduce((sum, s) => sum + s.duration, 0),
  };
}

async function generateWithGemini(
  prompt: string,
  apiKey: string
): Promise<GeneratedScript> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent([
    { text: SCRIPT_SYSTEM_PROMPT },
    { text: prompt },
  ]);
  const text = result.response.text();
  return parseScriptResponse(text);
}

async function generateWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<GeneratedScript> {
  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SCRIPT_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });
  return parseScriptResponse(response.choices[0]?.message?.content ?? "{}");
}

async function generateWithAnthropic(
  prompt: string,
  apiKey: string
): Promise<GeneratedScript> {
  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SCRIPT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return parseScriptResponse(text);
}

async function generateWithOpenRouter(
  prompt: string
): Promise<GeneratedScript> {
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });
  const response = await openai.chat.completions.create({
    model: "google/gemini-2.0-flash-exp:free",
    messages: [
      { role: "system", content: SCRIPT_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  return parseScriptResponse(response.choices[0]?.message?.content ?? "{}");
}

function parseScriptResponse(text: string): GeneratedScript {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse script response");
  const parsed = JSON.parse(jsonMatch[0]) as GeneratedScript;
  parsed.totalDuration = parsed.scenes.reduce((sum, s) => sum + s.duration, 0);
  return parsed;
}

export async function validateApiKey(
  provider: ApiProvider,
  key: string
): Promise<boolean> {
  try {
    switch (provider) {
      case "OPENAI": {
        const openai = new OpenAI({ apiKey: key });
        await openai.models.list();
        return true;
      }
      case "GEMINI": {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        await model.generateContent("test");
        return true;
      }
      case "ANTHROPIC": {
        const anthropic = new Anthropic({ apiKey: key });
        await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 10,
          messages: [{ role: "user", content: "hi" }],
        });
        return true;
      }
      case "ELEVENLABS": {
        const res = await fetch("https://api.elevenlabs.io/v1/user", {
          headers: { "xi-api-key": key },
        });
        return res.ok;
      }
      default:
        return true;
    }
  } catch {
    return false;
  }
}
