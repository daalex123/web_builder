"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CMS_ASSISTANT_SUGGESTED_TOPICS,
  type CmsAssistantChatMessage,
} from "@cms/shared/cms-assistant";
import { QuestionCircleOutlined, SendOutlined } from "@ant-design/icons";
import { Alert, Avatar, Button, Empty, Input, Spin, Typography } from "antd";

const GREETING =
  "Hi! I'm your CMS Guide. Ask me anything about building pages, using the visual editor, publishing, media, navigation, ecommerce, or AI tools in this admin.";

function renderMessageContent(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isExternal = href.startsWith("http");
      if (isExternal) {
        return (
          <a key={i} href={href} target="_blank" rel="noreferrer">
            {label}
          </a>
        );
      }
      return (
        <Link key={i} href={href}>
          {label}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

type AiStatus =
  | { configured: false }
  | { configured: true; cmsAssistantModel?: string; provider?: string };

export function CmsAssistantChat({
  compact = false,
  showSuggestedTopics = true,
}: {
  compact?: boolean;
  showSuggestedTopics?: boolean;
}) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<CmsAssistantChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: false }));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || !status?.configured) return;

      const userMsg: CmsAssistantChatMessage = { role: "user", content: text.trim() };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const apiMessages = nextMessages.filter(
          (m) => !(m.role === "assistant" && m.content === GREETING),
        );
        const res = await fetch("/api/ai/cms-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, currentPath: pathname }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok) {
          throw new Error(data.error ?? "Could not reach CMS Guide");
        }
        if (!data.reply?.trim()) {
          throw new Error("CMS Guide returned an empty reply. Try again.");
        }
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, pathname, status?.configured],
  );

  const showTopics =
    showSuggestedTopics && messages.length <= 1 && status?.configured && !loading;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: compact ? "100%" : "min(640px, calc(100vh - 280px))",
        minHeight: compact ? 0 : 420,
      }}
    >
      {status && !status.configured ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="AI API key required"
          description={
            <>
              Add <Typography.Text code>OPENAI_API_KEY</Typography.Text> to{" "}
              <Typography.Text code>apps/admin/.env.local</Typography.Text> to use the CMS Guide.
            </>
          }
        />
      ) : null}

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: compact ? "8px 0" : "16px 0",
          minHeight: 0,
        }}
      >
        {messages.length === 0 ? (
          <Empty description="Start a conversation" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: 8,
                }}
              >
                {msg.role === "assistant" ? (
                  <Avatar
                    size="small"
                    icon={<QuestionCircleOutlined />}
                    style={{ backgroundColor: "#1677ff", flexShrink: 0 }}
                  />
                ) : null}
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "8px 12px",
                    borderRadius: 12,
                    background: msg.role === "user" ? "#1677ff" : "#f5f5f5",
                    color: msg.role === "user" ? "#fff" : "inherit",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                    fontSize: 14,
                  }}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#888" }}>
                <Spin size="small" />
                <Typography.Text type="secondary">CMS Guide is thinking…</Typography.Text>
              </div>
            ) : null}

            {error ? (
              <Typography.Text type="danger" style={{ display: "block", textAlign: "center" }}>
                {error}
              </Typography.Text>
            ) : null}
          </div>
        )}
      </div>

      {showTopics ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {CMS_ASSISTANT_SUGGESTED_TOPICS.map((topic) => (
            <Button key={topic} size="small" onClick={() => sendMessage(topic)}>
              {topic}
            </Button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        style={{ display: "flex", gap: 8, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask how to use the CMS…"
          disabled={loading || !status?.configured}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
        />
        <Button
          type="primary"
          htmlType="submit"
          icon={<SendOutlined />}
          disabled={loading || !input.trim() || !status?.configured}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
