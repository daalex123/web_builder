"use client";

import type { NavigationSettings } from "@cms/shared/navigation";
import {
  LOGO_HEIGHT_MAX,
  LOGO_HEIGHT_MIN,
  LOGO_HEIGHT_PRESETS,
  LOGO_MAX_WIDTH_DEFAULT,
  LOGO_MAX_WIDTH_MAX,
  LOGO_MAX_WIDTH_MIN,
  NAV_LOGO_SIZE_OPTIONS,
  logoSizeFromHeight,
  resolveLogoHeight,
  resolveLogoMaxWidth,
} from "@cms/shared/navigation";
import { Col, Form, Row, Segmented, Slider, Typography } from "antd";

const { Text } = Typography;

export function LogoSizeControls({
  nav,
  onChange,
}: {
  nav: NavigationSettings;
  onChange: (patch: Partial<NavigationSettings>) => void;
}) {
  const height = resolveLogoHeight({
    logoSize: nav.logoSize ?? "md",
    logoHeight: nav.logoHeight,
  });
  const maxWidth = resolveLogoMaxWidth({ logoMaxWidth: nav.logoMaxWidth });

  return (
    <Form layout="vertical" size="small">
      <Form.Item label="Size preset">
        <Segmented
          block
          value={nav.logoSize ?? "md"}
          onChange={(logoSize) => {
            const preset = LOGO_HEIGHT_PRESETS[logoSize as keyof typeof LOGO_HEIGHT_PRESETS];
            onChange({ logoSize, logoHeight: preset });
          }}
          options={NAV_LOGO_SIZE_OPTIONS}
        />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label={`Logo height (${height}px)`} extra="Drag to enlarge or shrink the logo">
            <Slider
              min={LOGO_HEIGHT_MIN}
              max={LOGO_HEIGHT_MAX}
              value={height}
              onChange={(logoHeight) =>
                onChange({ logoHeight, logoSize: logoSizeFromHeight(logoHeight) })
              }
              marks={{
                32: "S",
                56: "L",
                96: "2XL",
                160: "Max",
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={`Max width (${maxWidth}px)`}
            extra={`Default ${LOGO_MAX_WIDTH_DEFAULT}px — increase for wide logos`}
          >
            <Slider
              min={LOGO_MAX_WIDTH_MIN}
              max={LOGO_MAX_WIDTH_MAX}
              value={maxWidth}
              onChange={(logoMaxWidth) => onChange({ logoMaxWidth })}
              marks={{
                120: "Narrow",
                220: "Default",
                400: "Wide",
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Changes apply to the header logo on the public site after save and publish.
      </Text>
    </Form>
  );
}
