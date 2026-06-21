"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@cms/shared/schemas";
import {
  ASSISTANT_MODES,
  ASSISTANT_ROLES,
  assistantConfigSchema,
} from "@cms/shared/assistant";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import { PageHeader } from "@/components/page-header";

const { TextArea } = Input;
const { Text } = Typography;

const DEFAULT_ASSISTANT = {
  enabled: false,
  name: assistantConfigSchema.name,
  role: assistantConfigSchema.role,
  mode: assistantConfigSchema.mode,
  persona: assistantConfigSchema.persona,
  greeting: assistantConfigSchema.greeting,
  placeholder: assistantConfigSchema.placeholder,
  conversionGoals: [...assistantConfigSchema.conversionGoals],
  suggestedTopics: [...assistantConfigSchema.suggestedTopics],
  primaryCtaLabel: assistantConfigSchema.primaryCtaLabel,
  primaryCtaHref: assistantConfigSchema.primaryCtaHref,
  apiBaseUrl: "",
};

export default function AssistantSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [assistantModel, setAssistantModel] = useState<string | null>(null);
  const [publishedProductCount, setPublishedProductCount] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const assistant = settings?.assistant ?? DEFAULT_ASSISTANT;

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          ...data,
          assistant: { ...DEFAULT_ASSISTANT, ...data.assistant },
        });
      });
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((data) => {
        setAiReady(data.configured === true);
        setAssistantModel(data.assistantModel ?? null);
      })
      .catch(() => setAiReady(false));
    fetch("/api/products?status=published")
      .then((r) => r.json())
      .then((data) => {
        setPublishedProductCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => setPublishedProductCount(null));
  }, []);

  function updateAssistant(patch: Partial<typeof assistant>) {
    if (!settings) return;
    setSettings({
      ...settings,
      assistant: { ...assistant, ...patch },
    });
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setMessage(
      res.ok
        ? { type: "success", text: "Assistant settings saved. Publish to update the live site." }
        : { type: "error", text: "Failed to save" },
    );
    setSaving(false);
  }

  if (!settings) {
    return null;
  }

  const adminUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";

  return (
    <div>
      <PageHeader
        title="Sales Assistant"
        description="Configure an on-site AI agent that guides visitors toward a purchase"
        extra={
          <Button type="primary" onClick={save} loading={saving}>
            Save Assistant
          </Button>
        }
      />

      {message ? (
        <Alert type={message.type} message={message.text} showIcon style={{ marginBottom: 16 }} />
      ) : null}

      {!aiReady ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="AI not configured"
          description="Add OPENAI_API_KEY to apps/admin/.env.local. The assistant uses the same AI provider as AI Page Builder."
        />
      ) : assistantModel ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Chat model"
          description={`Sales assistant uses ${assistantModel} (ASSISTANT_AI_MODEL). Page builder uses AI_MODEL separately.`}
        />
      ) : null}

      {settings.modules?.ecommerce?.enabled ? (
        publishedProductCount !== null ? (
          <Alert
            type={publishedProductCount > 0 ? "success" : "warning"}
            showIcon
            style={{ marginBottom: 16 }}
            message="Product catalog"
            description={
              publishedProductCount > 0
                ? `The assistant can recommend ${publishedProductCount} published product${publishedProductCount === 1 ? "" : "s"} by name, price, category, and stock. Add descriptions in Products for richer answers.`
                : "No published products yet. Publish products under Products so the assistant can recommend them."
            }
          />
        ) : null
      ) : (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="E-commerce disabled"
          description="Enable e-commerce in Site Settings so the assistant can access your product catalog."
        />
      )}

      <Card style={{ maxWidth: 800, marginBottom: 24 }}>
        <Form layout="vertical">
          <Form.Item label="Enable sales assistant">
            <Switch
              checked={assistant.enabled}
              onChange={(enabled) => updateAssistant({ enabled })}
            />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item label="Agent name">
              <Input
                value={assistant.name}
                onChange={(e) => updateAssistant({ name: e.target.value })}
                placeholder="e.g. Maya"
              />
            </Form.Item>
            <Form.Item label="Role">
              <Select
                value={assistant.role}
                onChange={(role) => updateAssistant({ role })}
                options={ASSISTANT_ROLES.map((r) => ({ value: r, label: r }))}
              />
            </Form.Item>
          </div>

          <Form.Item label="Mode" extra="Shapes how the agent sells and communicates">
            <Select
              value={assistant.mode}
              onChange={(mode) => updateAssistant({ mode })}
              options={ASSISTANT_MODES.map((m) => ({
                value: m.value,
                label: m.label,
              }))}
            />
            <Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
              {ASSISTANT_MODES.find((m) => m.value === assistant.mode)?.description}
            </Text>
          </Form.Item>

          <Form.Item label="Persona" extra="Describe voice, personality, and how they should behave">
            <TextArea
              rows={4}
              value={assistant.persona ?? ""}
              onChange={(e) => updateAssistant({ persona: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Opening greeting">
            <TextArea
              rows={2}
              value={assistant.greeting ?? ""}
              onChange={(e) => updateAssistant({ greeting: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Input placeholder">
            <Input
              value={assistant.placeholder ?? ""}
              onChange={(e) => updateAssistant({ placeholder: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Conversion goals (one per line)">
            <TextArea
              rows={4}
              value={(assistant.conversionGoals ?? []).join("\n")}
              onChange={(e) =>
                updateAssistant({
                  conversionGoals: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Form.Item>

          <Form.Item label="Suggested conversation starters (one per line)">
            <TextArea
              rows={3}
              value={(assistant.suggestedTopics ?? []).join("\n")}
              onChange={(e) =>
                updateAssistant({
                  suggestedTopics: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item label="Primary CTA label">
              <Input
                value={assistant.primaryCtaLabel ?? ""}
                onChange={(e) => updateAssistant({ primaryCtaLabel: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Primary CTA link">
              <Input
                value={assistant.primaryCtaHref ?? ""}
                onChange={(e) => updateAssistant({ primaryCtaHref: e.target.value })}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Chat API URL (optional)"
            extra="Leave blank to use the admin server URL. Required if your public site is on a different domain."
          >
            <Input
              value={assistant.apiBaseUrl ?? ""}
              onChange={(e) => updateAssistant({ apiBaseUrl: e.target.value })}
              placeholder={adminUrl}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="Preview" size="small" style={{ maxWidth: 400 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#1677ff",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {(assistant.name || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <Text strong>{assistant.name}</Text>
            <br />
            <Tag style={{ marginTop: 4 }}>{assistant.role}</Tag>
            <Tag>{ASSISTANT_MODES.find((m) => m.value === assistant.mode)?.label}</Tag>
            <p style={{ marginTop: 12, fontSize: 14, color: "#595959" }}>
              {assistant.greeting}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
