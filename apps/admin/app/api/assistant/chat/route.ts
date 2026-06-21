import { NextResponse } from "next/server";
import {
  buildAssistantSystemPrompt,
  isAssistantEnabled,
  resolveMentionedProductCards,
  type AssistantChatMessage,
} from "@cms/shared/assistant";
import { dbProductToExport, getSiteSettings, listProducts } from "@cms/db";
import { isAiConfigured } from "@/lib/ai/generate";
import { completeChat } from "@/lib/ai/chat";
import { getWebPreviewUrl } from "@/lib/utils";

function corsHeaders(origin: string | null) {
  const allowed =
    getWebPreviewUrl() ||
    process.env.ASSISTANT_CORS_ORIGIN?.trim() ||
    origin ||
    "*";

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    if (!isAiConfigured()) {
      return NextResponse.json(
        { error: "Assistant is not configured on the server." },
        { status: 503, headers: corsHeaders(origin) },
      );
    }

    const site = await getSiteSettings();
    if (!site || !isAssistantEnabled(site)) {
      return NextResponse.json(
        { error: "Assistant is disabled." },
        { status: 403, headers: corsHeaders(origin) },
      );
    }

    const body = (await request.json()) as { messages?: AssistantChatMessage[] };
    const history = body.messages ?? [];
    if (!history.length) {
      return NextResponse.json(
        { error: "messages required" },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const productRows = await listProducts("published");
    const products = productRows.map(dbProductToExport);
    const system = buildAssistantSystemPrompt(site, products);

    const messages = [
      { role: "system" as const, content: system },
      ...history.slice(-12).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const reply = await completeChat(messages);
    const mentionedProducts = resolveMentionedProductCards(products, reply);

    return NextResponse.json(
      { reply, products: mentionedProducts },
      { headers: corsHeaders(origin) },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
