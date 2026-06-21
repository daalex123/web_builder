import { NextResponse } from "next/server";
import type { CmsAssistantChatMessage } from "@cms/shared/cms-assistant";
import { buildCmsAssistantPrompt } from "@/lib/ai/cms-assistant-context";
import { completeCmsAssistantChat } from "@/lib/ai/cms-assistant-chat";
import { isAiConfigured } from "@/lib/ai/generate";

export async function POST(request: Request) {
  try {
    if (!isAiConfigured()) {
      return NextResponse.json(
        {
          error:
            "AI is not configured. Add OPENAI_API_KEY to apps/admin/.env.local and restart the server.",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      messages?: CmsAssistantChatMessage[];
      currentPath?: string;
    };
    const history = body.messages ?? [];
    if (!history.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const system = await buildCmsAssistantPrompt(body.currentPath);
    const messages = [
      { role: "system" as const, content: system },
      ...history.slice(-16).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const reply = await completeCmsAssistantChat(messages);
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
