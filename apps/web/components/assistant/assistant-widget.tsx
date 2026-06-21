"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductCard, SiteSettings } from "@cms/shared/schemas";
import type { AssistantChatMessage } from "@cms/shared/assistant";
import { isAssistantEnabled } from "@cms/shared/assistant";
import { AssistantProductCard } from "./assistant-product-card";

function resolveApiBase(site: SiteSettings): string {
  const fromConfig = site.assistant?.apiBaseUrl?.replace(/\/$/, "");
  if (fromConfig) return fromConfig;
  const fromEnv = process.env.NEXT_PUBLIC_ASSISTANT_API_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "http://localhost:3001";
}

function renderMessageContent(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <Link key={i} href={href} className="font-medium text-blue-600 underline">
          {label}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function AssistantInitials({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = (name || "A").charAt(0).toUpperCase();
  const className =
    size === "sm"
      ? "flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white"
      : "flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white";

  return <div className={className}>{initials}</div>;
}

export function AssistantWidget({ site }: { site: SiteSettings }) {
  const cfg = site.assistant;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);

  const enabled = isAssistantEnabled(site) && cfg;

  useEffect(() => {
    if (!open || greeted.current || !cfg?.greeting) return;
    greeted.current = true;
    setMessages([{ role: "assistant", content: cfg.greeting }]);
  }, [open, cfg?.greeting]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || !cfg) return;

      const userMsg: AssistantChatMessage = { role: "user", content: text.trim() };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);
      setError(null);
      setLoadingHint(null);

      const slowHintTimer = window.setTimeout(() => {
        setLoadingHint("Still thinking — this usually takes a few seconds…");
      }, 8000);

      try {
        const apiBase = resolveApiBase(site);
        const apiMessages = nextMessages.filter(
          (m) => !(m.role === "assistant" && m.content === cfg.greeting),
        );
        const res = await fetch(`${apiBase}/api/assistant/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });
        const data = (await res.json()) as {
          reply?: string;
          products?: ProductCard[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error ?? "Could not reach assistant");
        }
        if (!data.reply?.trim()) {
          throw new Error("Assistant returned an empty reply. Try again.");
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply!,
            products: data.products?.length ? data.products : undefined,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        window.clearTimeout(slowHintTimer);
        setLoadingHint(null);
        setLoading(false);
      }
    },
    [cfg, loading, messages, site],
  );

  if (!enabled) return null;

  const assistantName = cfg.name || "Assistant";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="flex h-[min(520px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <header className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
            <AssistantInitials name={assistantName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-900">{assistantName}</p>
              <p className="truncate text-xs text-neutral-500">{cfg.role}</p>
            </div>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-neutral-500 hover:bg-neutral-200"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl bg-neutral-900 px-3 py-2 text-sm leading-relaxed text-white">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[95%] space-y-2">
                    <div className="rounded-2xl bg-neutral-100 px-3 py-2 text-sm leading-relaxed text-neutral-800">
                      <div className="whitespace-pre-wrap">{renderMessageContent(msg.content)}</div>
                    </div>
                    {msg.products?.length ? (
                      <div className="space-y-2">
                        {msg.products.map((product) => (
                          <AssistantProductCard
                            key={product.href ?? product.name}
                            product={product}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-neutral-100 px-4 py-2 text-sm text-neutral-500">
                  <p>{assistantName} is typing…</p>
                  {loadingHint ? (
                    <p className="mt-1 text-xs text-neutral-400">{loadingHint}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
          </div>

          {(cfg.suggestedTopics?.length ?? 0) > 0 && messages.length <= 1 ? (
            <div className="flex flex-wrap gap-2 border-t border-neutral-100 px-3 py-2">
              {cfg.suggestedTopics!.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 hover:border-neutral-400"
                  onClick={() => sendMessage(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          ) : null}

          {cfg.primaryCtaHref && cfg.primaryCtaLabel ? (
            <div className="border-t border-neutral-100 px-3 py-2">
              <Link
                href={cfg.primaryCtaHref}
                className="block rounded-lg bg-neutral-900 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-neutral-800"
              >
                {cfg.primaryCtaLabel}
              </Link>
            </div>
          ) : null}

          <form
            className="flex gap-2 border-t border-neutral-100 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={cfg.placeholder ?? "Type a message…"}
              className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-neutral-800"
      >
        <AssistantInitials name={assistantName} size="sm" />
        {open ? "Close" : `Chat with ${assistantName}`}
      </button>
    </div>
  );
}
