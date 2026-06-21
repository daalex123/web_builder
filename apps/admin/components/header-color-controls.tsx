"use client";

import type { HeaderEffectSettings } from "@cms/shared/navigation";
import { NAV_TRANSPARENCY_OPTIONS } from "@cms/shared/navigation";
import { Col, ColorPicker, Form, Row, Select, Slider, Typography } from "antd";

const { Text } = Typography;

type HeaderFx = HeaderEffectSettings;

export function HeaderColorControls({
  headerFx,
  effect,
  onPatch,
}: {
  headerFx: HeaderFx;
  effect: string;
  onPatch: (patch: Partial<Record<keyof HeaderFx, string | number | undefined>>) => void;
}) {
  const bg = headerFx.backgroundColor ?? "#ffffff";
  const scrolledBg = headerFx.scrolledBackgroundColor ?? bg;
  const border = headerFx.borderColor ?? "#e5e5e5";

  return (
    <Form layout="vertical" size="small">
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            label="Background color"
            extra={effect === "default" ? "Solid header fill" : "Top / glass tint base color"}
          >
            <ColorPicker
              value={bg}
              onChange={(_, hex) => onPatch({ backgroundColor: hex })}
              showText
            />
          </Form.Item>
        </Col>
        {(effect === "transparent" || effect === "blur") && (
          <Col xs={24} md={8}>
            <Form.Item label="Scrolled / solid color" extra="Color after scroll threshold">
              <ColorPicker
                value={scrolledBg}
                onChange={(_, hex) => onPatch({ scrolledBackgroundColor: hex })}
                showText
              />
            </Form.Item>
          </Col>
        )}
        {effect === "bordered" && (
          <Col xs={24} md={8}>
            <Form.Item label="Border color">
              <ColorPicker
                value={border}
                onChange={(_, hex) => onPatch({ borderColor: hex })}
                showText
              />
            </Form.Item>
          </Col>
        )}
      </Row>

      {(effect === "transparent" || effect === "blur") && (
        <>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Top transparency preset">
                <Select
                  value={headerFx.transparency ?? "none"}
                  onChange={(v) => onPatch({ transparency: v, topOpacity: undefined })}
                  options={NAV_TRANSPARENCY_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={`Top opacity (${headerFx.topOpacity ?? "preset"})`}
                extra="Fine-tune 0 = fully clear, 100 = solid"
              >
                <Slider
                  min={0}
                  max={100}
                  value={headerFx.topOpacity ?? (headerFx.transparency === "none" ? 0 : 40)}
                  onChange={(topOpacity) => onPatch({ topOpacity })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={`Scrolled opacity (${headerFx.scrolledOpacity ?? 100}%)`}>
            <Slider
              min={0}
              max={100}
              value={headerFx.scrolledOpacity ?? 100}
              onChange={(scrolledOpacity) => onPatch({ scrolledOpacity })}
            />
          </Form.Item>
        </>
      )}

      {effect === "default" && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Solid headers use the background color at full opacity. Adjust shadow under effect settings above.
        </Text>
      )}

      {effect === "bordered" && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Bordered headers use a solid background with a bottom border. Set both colors above.
        </Text>
      )}
    </Form>
  );
}
