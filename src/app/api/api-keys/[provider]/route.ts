import { z } from "zod";
type ApiProvider =
  | "OPENAI"
  | "GEMINI"
  | "ANTHROPIC"
  | "OPENROUTER"
  | "ELEVENLABS"
  | "KLING"
  | "RUNWAY"
  | "VEO";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { validateApiKey } from "@/lib/ai/script";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, handleApiError, jsonResponse } from "@/lib/api-utils";

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

type RouteContext = { params: Promise<{ provider: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { provider: providerParam } = await context.params;
    const parsed = providerSchema.safeParse(providerParam.toUpperCase());
    if (!parsed.success) {
      return errorResponse("Invalid provider", 400);
    }

    const result = await db.apiKey.deleteMany({
      where: { userId: user.id, provider: parsed.data },
    });

    if (result.count === 0) {
      return errorResponse("API key not found", 404);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { success: rateOk } = await checkRateLimit(
      `api-keys:validate:${user.id}`,
      20,
      60000
    );
    if (!rateOk) return errorResponse("Rate limit exceeded", 429);

    const { provider: providerParam } = await context.params;
    const parsed = providerSchema.safeParse(providerParam.toUpperCase());
    if (!parsed.success) {
      return errorResponse("Invalid provider", 400);
    }

    const provider = parsed.data as ApiProvider;

    const apiKey = await db.apiKey.findUnique({
      where: { userId_provider: { userId: user.id, provider } },
    });

    if (!apiKey) {
      return errorResponse("API key not found", 404);
    }

    const decryptedKey = decrypt(apiKey.encryptedKey);
    const isValid = await validateApiKey(provider, decryptedKey);

    const updated = await db.apiKey.update({
      where: { id: apiKey.id },
      data: {
        isValid,
        lastValidated: new Date(),
      },
    });

    return jsonResponse({
      provider: updated.provider,
      isValid: updated.isValid,
      lastValidated: updated.lastValidated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
