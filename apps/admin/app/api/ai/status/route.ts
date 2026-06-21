import { NextResponse } from "next/server";
import { getAssistantAiConfig, getCmsAssistantAiConfig } from "@/lib/ai/config";
import { getAiStatus } from "@/lib/ai/generate";

export async function GET() {
  const status = getAiStatus();
  if (!status.configured) {
    return NextResponse.json({ configured: false });
  }

  const assistant = getAssistantAiConfig();
  const cmsAssistant = getCmsAssistantAiConfig();
  return NextResponse.json({
    ...status,
    assistantModel: assistant.model,
    cmsAssistantModel: cmsAssistant.model,
  });
}
