import { z } from "zod";
import type { ApiProvider } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { validateApiKey } from "@/lib/ai/script";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, handleApiError, jsonResponse } from "@/lib/api-utils";
import type { ApiKeyInfo } from "@/types/video";

const API_PROVIDERS = [
  "OPENAI",
  "GEMINI",
  "ANTHROPIC",
  "OPENROUTER",
  "ELEVENLABS",
  "KLING",
  "RUNWAY",
  "VEO",
] as const;

const providerSchema = z.enum(API_PROVIDERS);

const createApiKeySchema = z.object({
  provider: providerSchema,
  key: z.string().min(8).max(500),
  label: z.string().max(100).optional(),
  validate: z.boolean().default(true),
});

const PROVIDER_META: Record<
  ApiProvider,
  Pick<ApiKeyInfo, "pricingUrl" | "docsUrl" | "estimatedCostPerVideo">
> = {
  OPENAI: {
    pricingUrl: "https://openai.com/api/pricing",
    docsUrl: "https://platform.openai.com/docs",
    estimatedCostPerVideo: 0.15,
  },
  GEMINI: {
    pricingUrl: "https://ai.google.dev/pricing",
    docsUrl: "https://ai.google.dev/docs",
    estimatedCostPerVideo: 0.05,
  },
  ANTHROPIC: {
    pricingUrl: "https://www.anthropic.com/pricing",
    docsUrl: "https://docs.anthropic.com",
    estimatedCostPerVideo: 0.2,
  },
  OPENROUTER: {
    pricingUrl: "https://openrouter.ai/docs#models",
    docsUrl: "https://openrouter.ai/docs",
    estimatedCostPerVideo: 0.1,
  },
  ELEVENLABS: {
    pricingUrl: "https://elevenlabs.io/pricing",
    docsUrl: "https://elevenlabs.io/docs",
    estimatedCostPerVideo: 0.08,
  },
  KLING: {
    pricingUrl: "https://klingai.com",
    docsUrl: "https://klingai.com/docs",
    estimatedCostPerVideo: 0.5,
  },
  RUNWAY: {
    pricingUrl: "https://runwayml.com/pricing",
    docsUrl: "https://docs.runwayml.com",
    estimatedCostPerVideo: 0.75,
  },
  VEO: {
    pricingUrl: "https://deepmind.google/technologies/veo",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    estimatedCostPerVideo: 1.0,
  },
};

function maskKey(provider: string): string {
  return `••••••••${provider.slice(0, 3).toLowerCase()}`;
}

export async function GET() {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`api-keys:list:${user.id}`);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const keys = await db.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { provider: "asc" },
    });

    const apiKeys: ApiKeyInfo[] = keys.map((key: (typeof keys)[number]) => ({
      provider: key.provider,
      label: key.label ?? key.provider,
      isValid: key.isValid,
      lastValidated: key.lastValidated,
      usageCount: key.usageCount,
      ...PROVIDER_META[key.provider as ApiProvider],
    }));

    const availableProviders = API_PROVIDERS.filter(
      (p) => !keys.some((k: (typeof keys)[number]) => k.provider === p)
    ).map((provider) => ({
      provider,
      ...PROVIDER_META[provider],
    }));

    return jsonResponse({ apiKeys, availableProviders });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`api-keys:create:${user.id}`, 10, 60000);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const body = await request.json();
    const parsed = createApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const { provider, key, label, validate } = parsed.data;

    let isValid = false;
    if (validate) {
      isValid = await validateApiKey(provider, key);
      if (!isValid) {
        return errorResponse("API key validation failed", 400);
      }
    }

    const encryptedKey = encrypt(key);

    const apiKey = await db.apiKey.upsert({
      where: { userId_provider: { userId: user.id, provider } },
      create: {
        userId: user.id,
        provider,
        encryptedKey,
        label: label ?? provider,
        isValid,
        lastValidated: validate ? new Date() : null,
      },
      update: {
        encryptedKey,
        label: label ?? provider,
        isValid,
        lastValidated: validate ? new Date() : null,
      },
    });

    return jsonResponse(
      {
        provider: apiKey.provider,
        label: apiKey.label,
        isValid: apiKey.isValid,
        lastValidated: apiKey.lastValidated,
        maskedKey: maskKey(provider),
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
