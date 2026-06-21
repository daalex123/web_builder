import { getAiConfig } from "./config";
import { buildSystemPrompt, buildUserPrompt } from "./prompt";
import { extractJsonFromModelText, normalizeAiPageDraft } from "./normalize-output";
import { validateAiPageDraft } from "./validate";
import type { AiPageDraft, ReferenceContext } from "./types";

export { getAiStatus } from "./config";

type GenerateInput = {
  prompt: string;
  layoutHint?: string;
  titleHint?: string;
  reference?: ReferenceContext;
  referenceImageDataUrl?: string;
};

type ChatMessage =
  | { role: "system"; content: string }
  | {
      role: "user";
      content:
        | string
        | Array<
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } }
          >;
    };

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function buildRequestBody(
  config: ReturnType<typeof getAiConfig>,
  messages: ChatMessage[],
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: config.model,
    temperature: config.temperature,
    top_p: config.topP,
    max_tokens: config.maxTokens,
    stream: false,
    messages,
  };

  if (config.provider === "openai") {
    body.response_format = { type: "json_object" };
  }

  if (config.provider === "nvidia") {
    if (config.reasoningBudget !== undefined) {
      body.reasoning_budget = config.reasoningBudget;
    }
    if (config.enableThinking) {
      body.chat_template_kwargs = { enable_thinking: true };
    }
  }

  return body;
}

export async function generateAiPageDraft(input: GenerateInput): Promise<AiPageDraft> {
  const config = getAiConfig();
  const system = buildSystemPrompt();
  const userText = buildUserPrompt({
    prompt: input.prompt,
    layoutHint: input.layoutHint,
    titleHint: input.titleHint,
    reference: input.reference,
  });

  if (input.referenceImageDataUrl && config.provider === "nvidia") {
    throw new Error(
      "Reference images require a vision-capable model. Use text + reference URL with Nemotron, or switch to an OpenAI vision model.",
    );
  }

  const userContent: ChatMessage["content"] = input.referenceImageDataUrl
    ? [
        {
          type: "text",
          text: `${userText}\n\nA reference design image is attached. Match its visual hierarchy, section structure, and tone where appropriate.`,
        },
        {
          type: "image_url",
          image_url: { url: input.referenceImageDataUrl, detail: "high" },
        },
      ]
    : userText;

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: userContent },
  ];

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildRequestBody(config, messages)),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `AI provider error (${response.status}): ${errorBody.slice(0, 400)}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
  };
  const message = payload.choices?.[0]?.message;
  const text = message?.content?.trim();
  if (!text) {
    throw new Error("AI returned an empty response");
  }

  const raw = extractJsonFromModelText(text);
  const draft = normalizeAiPageDraft(raw, {
    title: input.titleHint,
    layout: input.layoutHint,
  });

  return validateAiPageDraft(draft);
}
