export type AiProvider = "openai" | "nvidia";

export type AiConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: AiProvider;
  temperature: number;
  topP: number;
  maxTokens: number;
  reasoningBudget?: number;
  enableThinking?: boolean;
};

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function detectAiProvider(apiKey: string): AiProvider {
  return apiKey.startsWith("nvapi-") ? "nvidia" : "openai";
}

/** Default chat model — sales assistant only (not used by page builder). */
export const DEFAULT_ASSISTANT_AI_MODEL = "meta/llama-3.1-8b-instruct";

/** Default model for admin CMS guide chat. */
export const DEFAULT_CMS_ASSISTANT_AI_MODEL = "gpt-4o-mini";

/**
 * AI config for sales-assistant chat only.
 * Uses ASSISTANT_AI_MODEL — never AI_MODEL.
 */
export function getAssistantAiConfig(): Pick<
  AiConfig,
  "apiKey" | "baseUrl" | "model" | "provider" | "temperature" | "topP" | "maxTokens"
> {
  const base = getAiConfig();
  const model =
    process.env.ASSISTANT_AI_MODEL?.trim() || DEFAULT_ASSISTANT_AI_MODEL;

  return {
    apiKey: base.apiKey,
    baseUrl: base.baseUrl,
    provider: base.provider,
    model,
    temperature: 0.7,
    topP: base.topP,
    maxTokens: 1024,
  };
}

/**
 * AI config for admin CMS guide chat.
 * Uses CMS_ASSISTANT_AI_MODEL, then ASSISTANT_AI_MODEL, then a sensible default.
 */
export function getCmsAssistantAiConfig(): Pick<
  AiConfig,
  "apiKey" | "baseUrl" | "model" | "provider" | "temperature" | "topP" | "maxTokens"
> {
  const base = getAiConfig();
  const provider = base.provider;
  const model =
    process.env.CMS_ASSISTANT_AI_MODEL?.trim() ||
    process.env.ASSISTANT_AI_MODEL?.trim() ||
    (provider === "nvidia" ? DEFAULT_ASSISTANT_AI_MODEL : DEFAULT_CMS_ASSISTANT_AI_MODEL);

  return {
    apiKey: base.apiKey,
    baseUrl: base.baseUrl,
    provider,
    model,
    temperature: 0.5,
    topP: base.topP,
    maxTokens: 2048,
  };
}

export function getAiConfig(): AiConfig {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to apps/admin/.env.local to use AI Page Builder.",
    );
  }

  const provider = detectAiProvider(apiKey);
  const isNvidia = provider === "nvidia";

  const baseUrl =
    process.env.AI_API_BASE_URL?.trim() ||
    (isNvidia ? "https://integrate.api.nvidia.com/v1" : "https://api.openai.com/v1");

  const model =
    process.env.AI_MODEL?.trim() ||
    (isNvidia ? "nvidia/nemotron-3-ultra-550b-a55b" : "gpt-4o-mini");

  return {
    apiKey,
    baseUrl,
    model,
    provider,
    temperature: parseNumber(process.env.AI_TEMPERATURE, isNvidia ? 1 : 0.7),
    topP: parseNumber(process.env.AI_TOP_P, isNvidia ? 0.95 : 1),
    maxTokens: parseNumber(process.env.AI_MAX_TOKENS, isNvidia ? 16384 : 4096),
    reasoningBudget: isNvidia
      ? parseNumber(process.env.AI_REASONING_BUDGET, 16384)
      : undefined,
    enableThinking: isNvidia
      ? parseBoolean(process.env.AI_ENABLE_THINKING, true)
      : undefined,
  };
}

export function getAiStatus() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { configured: false as const };
  }

  const provider = detectAiProvider(apiKey);
  const model =
    process.env.AI_MODEL?.trim() ||
    (provider === "nvidia" ? "nvidia/nemotron-3-ultra-550b-a55b" : "gpt-4o-mini");

  return {
    configured: true as const,
    provider,
    model,
    baseUrl:
      process.env.AI_API_BASE_URL?.trim() ||
      (provider === "nvidia"
        ? "https://integrate.api.nvidia.com/v1"
        : "https://api.openai.com/v1"),
  };
}
