import { getAssistantAiConfig } from "./config";

export type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function extractReplyText(message: {
  content?: string | null;
  reasoning_content?: string | null;
}): string {
  let text = (message.content ?? "").trim();
  text = text.replace(/[\s\S]*?<\/think>/gi, "").trim();
  if (!text) {
    text = (message.reasoning_content ?? "").trim();
  }
  return text;
}

/** Sales-assistant chat — always uses ASSISTANT_AI_MODEL, not AI_MODEL. */
export async function completeChat(
  messages: ChatCompletionMessage[],
): Promise<string> {
  const config = getAssistantAiConfig();

  const body: Record<string, unknown> = {
    model: config.model,
    temperature: Math.min(config.temperature, 0.85),
    top_p: config.topP,
    max_tokens: config.maxTokens,
    stream: false,
    messages,
  };

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `AI provider error (${response.status}): ${errorBody.slice(0, 400)}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: { content?: string; reasoning_content?: string };
    }>;
  };
  const text = extractReplyText(payload.choices?.[0]?.message ?? {});
  if (!text) {
    throw new Error("AI returned an empty response");
  }
  return text;
}
