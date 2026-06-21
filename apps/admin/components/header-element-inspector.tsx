"use client";

import type { HeaderElement } from "@cms/shared/navigation";
import { HEADER_ELEMENT_LABELS } from "@cms/shared/navigation";
import { Button, Card, Form, Input, Select, Slider, Switch, Typography } from "antd";
import { LogoSizeControls } from "@/components/logo-size-controls";

const { Text } = Typography;

export function HeaderElementInspector({
  element,
  onChange,
  onDelete,
}: {
  element: HeaderElement | null;
  onChange: (patch: Partial<HeaderElement>) => void;
  onDelete: () => void;
}) {
  if (!element) {
    return (
      <Card size="small" title="Element settings">
        <Text type="secondary">Select an element on the canvas to edit its properties.</Text>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={HEADER_ELEMENT_LABELS[element.type]}
      extra={
        <Button size="small" danger onClick={onDelete}>
          Remove
        </Button>
      }
    >
      <Form layout="vertical" size="small">
        <Form.Item label="Hide on desktop">
          <Switch checked={element.hidden ?? false} onChange={(hidden) => onChange({ hidden })} />
        </Form.Item>
        <Form.Item label="Hide on mobile">
          <Switch
            checked={element.hiddenMobile ?? false}
            onChange={(hiddenMobile) => onChange({ hiddenMobile })}
          />
        </Form.Item>

        {element.type === "logo" ? (
          <>
            <LogoSizeControls
              nav={{
                logoSize: element.size,
                logoHeight: element.height,
                logoMaxWidth: element.maxWidth,
              }}
              onChange={(patch) =>
                onChange({
                  size: patch.logoSize ?? element.size,
                  height: patch.logoHeight ?? element.height,
                  maxWidth: patch.logoMaxWidth ?? element.maxWidth,
                })
              }
            />
          </>
        ) : null}

        {element.type === "cta" ? (
          <>
            <Form.Item label="Button label">
              <Input value={element.label} onChange={(e) => onChange({ label: e.target.value })} />
            </Form.Item>
            <Form.Item label="Button URL">
              <Input value={element.href} onChange={(e) => onChange({ href: e.target.value })} />
            </Form.Item>
            <Form.Item label="Style">
              <Select
                value={element.variant ?? "solid"}
                onChange={(variant) => onChange({ variant })}
                options={[
                  { value: "solid", label: "Solid" },
                  { value: "outline", label: "Outline" },
                  { value: "ghost", label: "Ghost" },
                ]}
              />
            </Form.Item>
          </>
        ) : null}

        {element.type === "text" ? (
          <>
            <Form.Item label="Text">
              <Input.TextArea
                rows={2}
                value={element.content}
                onChange={(e) => onChange({ content: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Size">
              <Select
                value={element.size ?? "sm"}
                onChange={(size) => onChange({ size })}
                options={[
                  { value: "xs", label: "XS" },
                  { value: "sm", label: "SM" },
                  { value: "base", label: "Base" },
                  { value: "lg", label: "LG" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Color (optional)">
              <Input
                value={element.color ?? ""}
                onChange={(e) => onChange({ color: e.target.value || undefined })}
                placeholder="#111827"
              />
            </Form.Item>
          </>
        ) : null}

        {element.type === "html" ? (
          <Form.Item label="HTML">
            <Input.TextArea
              rows={4}
              value={element.html}
              onChange={(e) => onChange({ html: e.target.value })}
            />
          </Form.Item>
        ) : null}

        {element.type === "spacer" ? (
          <Form.Item label={`Width (${element.width ?? 24}px)`}>
            <Slider
              min={8}
              max={160}
              value={element.width ?? 24}
              onChange={(width) => onChange({ width })}
            />
          </Form.Item>
        ) : null}

        {element.type === "phone" ? (
          <>
            <Form.Item label="Phone number" extra="Leave empty to use site contact phone">
              <Input
                value={element.phone ?? ""}
                onChange={(e) => onChange({ phone: e.target.value || undefined })}
              />
            </Form.Item>
            <Form.Item label="Show icon">
              <Switch
                checked={element.showIcon !== false}
                onChange={(showIcon) => onChange({ showIcon })}
              />
            </Form.Item>
          </>
        ) : null}

        {element.type === "search" ? (
          <>
            <Form.Item label="Placeholder">
              <Input
                value={element.placeholder ?? ""}
                onChange={(e) => onChange({ placeholder: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Width">
              <Select
                value={element.width ?? "md"}
                onChange={(width) => onChange({ width })}
                options={[
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                ]}
              />
            </Form.Item>
          </>
        ) : null}

        {element.type === "social" ? (
          <>
            <Form.Item label="Networks">
              <Select
                mode="multiple"
                value={element.networks ?? ["instagram"]}
                onChange={(networks) =>
                  onChange({
                    networks: networks as NonNullable<Extract<HeaderElement, { type: "social" }>["networks"]>,
                  })
                }
                options={[
                  { value: "instagram", label: "Instagram" },
                  { value: "facebook", label: "Facebook" },
                  { value: "twitter", label: "X / Twitter" },
                  { value: "linkedin", label: "LinkedIn" },
                  { value: "youtube", label: "YouTube" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Icon size">
              <Select
                value={element.iconSize ?? "md"}
                onChange={(iconSize) => onChange({ iconSize })}
                options={[
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                ]}
              />
            </Form.Item>
          </>
        ) : null}

        {element.type === "icon-link" ? (
          <>
            <Form.Item label="Label">
              <Input value={element.label} onChange={(e) => onChange({ label: e.target.value })} />
            </Form.Item>
            <Form.Item label="URL">
              <Input value={element.href} onChange={(e) => onChange({ href: e.target.value })} />
            </Form.Item>
            <Form.Item label="Icon">
              <Select
                value={element.icon ?? "user"}
                onChange={(icon) => onChange({ icon })}
                options={[
                  { value: "user", label: "User" },
                  { value: "cart", label: "Cart" },
                  { value: "heart", label: "Heart" },
                  { value: "mail", label: "Mail" },
                  { value: "phone", label: "Phone" },
                  { value: "search", label: "Search" },
                ]}
              />
            </Form.Item>
          </>
        ) : null}

        {element.type === "menu" ? (
          <Text type="secondary">
            Menu links are managed under <strong>Menus</strong>. Use the Menu items tab for colors and typography.
          </Text>
        ) : null}
      </Form>
    </Card>
  );
}
