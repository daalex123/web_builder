"use client";

import type { NavigationSettings } from "@cms/shared/navigation";
import {
  NAV_ACTIVE_INDICATOR_OPTIONS,
  NAV_ALIGN_OPTIONS,
  NAV_BLUR_OPTIONS,
  NAV_CONTAINER_WIDTH_OPTIONS,
  NAV_DRAWER_SIDE_OPTIONS,
  NAV_DROPDOWN_ITEM_HOVER_OPTIONS,
  NAV_DROPDOWN_OFFSET_OPTIONS,
  NAV_DROPDOWN_OPTIONS,
  NAV_DROPDOWN_TRIGGER_OPTIONS,
  NAV_EFFECT_OPTIONS,
  NAV_HEADER_HEIGHT_OPTIONS,
  NAV_HEADER_MODE_OPTIONS,
  presetToHeaderRows,
  NAV_LINK_HOVER_OPTIONS,
  NAV_LINK_SIZE_OPTIONS,
  NAV_LOGO_HOVER_OPTIONS,
  NAV_LOGO_SHRINK_OPTIONS,
  NAV_MEGA_CARD_STYLE_OPTIONS,
  NAV_MEGA_COLUMNS_OPTIONS,
  NAV_MOBILE_ENTER_OPTIONS,
  NAV_MOBILE_OPTIONS,
  NAV_OVERLAY_OPTIONS,
  NAV_PILL_VARIANT_OPTIONS,
  NAV_ROUNDED_OPTIONS,
  NAV_SCROLL_THRESHOLD_OPTIONS,
  NAV_SHADOW_OPTIONS,
  NAV_SPACING_OPTIONS,
  NAV_STYLE_OPTIONS,
  NAV_TRANSITION_SPEED_OPTIONS,
  NAV_TRANSPARENCY_OPTIONS,
  NAV_TRANSPARENT_NAV_TONE_OPTIONS,
  NAV_UNDERLINE_THICKNESS_OPTIONS,
  NAV_MENU_FONT_WEIGHT_OPTIONS,
  NAV_MENU_LETTER_SPACING_OPTIONS,
  NAV_MENU_ITEM_PADDING_OPTIONS,
} from "@cms/shared/navigation";
import {
  Alert,
  Button,
  Card,
  Col,
  ColorPicker,
  Divider,
  Form,
  Input,
  Row,
  Segmented,
  Select,
  Switch,
  Tabs,
  Typography,
} from "antd";
import Link from "next/link";
import { HeaderBuilderEditor } from "@/components/header-builder-editor";
import { HeaderColorControls } from "@/components/header-color-controls";
import { LogoSizeControls } from "@/components/logo-size-controls";

const { Text, Title } = Typography;

type OptionCardProps<T extends string> = {
  value?: T;
  options: { value: T; label: string; description?: string }[];
  onChange: (value: T) => void;
};

function OptionCards<T extends string>({ value, options, onChange }: OptionCardProps<T>) {
  return (
    <Row gutter={[12, 12]}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Col xs={24} sm={12} key={opt.value}>
            <button
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 8,
                border: selected ? "2px solid #1677ff" : "1px solid #f0f0f0",
                background: selected ? "#f0f5ff" : "#fff",
                cursor: "pointer",
              }}
            >
              <Text strong>{opt.label}</Text>
              {opt.description ? (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {opt.description}
                  </Text>
                </div>
              ) : null}
            </button>
          </Col>
        );
      })}
    </Row>
  );
}

function EffectSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card size="small" style={{ marginTop: 16, background: "#fafafa" }}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
        {title}
      </Title>
      {children}
    </Card>
  );
}

type Props = {
  nav: NavigationSettings;
  onChange: (patch: Partial<NavigationSettings>) => void;
  siteName?: string;
  hasLogo?: boolean;
};

export function NavigationSettingsForm({ nav, onChange, siteName, hasLogo }: Props) {
  const fx = nav.effects ?? {};
  const headerFx = fx.header ?? {};
  const styleFx = fx.style ?? {};
  const dropdownFx = fx.dropdown ?? {};
  const mobileFx = fx.mobile ?? {};

  const effect = nav.effect ?? "default";
  const style = nav.style ?? "classic";
  const headerMode = nav.headerMode ?? "preset";
  const dropdown = nav.dropdown ?? "simple";
  const mobile = nav.mobile ?? "accordion";
  const menuStyle = nav.menuStyle ?? {};

  function patchEffects(
    section: "header" | "style" | "dropdown" | "mobile",
    patch: Record<string, string | number | undefined>,
  ) {
    onChange({
      effects: {
        ...fx,
        [section]: { ...fx[section], ...patch },
      },
    });
  }

  function patchMenuStyle(patch: Record<string, string | undefined>) {
    const next = { ...menuStyle };
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "") {
        delete next[key as keyof typeof next];
      } else {
        (next as Record<string, string>)[key] = value;
      }
    }
    onChange({ menuStyle: Object.keys(next).length ? next : undefined });
  }

  const layoutTab = {
      key: "layout",
      label: "Layout",
      children: (
        <Form layout="vertical">
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="7 header layout types"
            description={
              <>
                <strong>Classic</strong> — logo left, menu right ·{" "}
                <strong>Underline</strong> — animated underlines ·{" "}
                <strong>Pill</strong> — rounded nav buttons ·{" "}
                <strong>Centered</strong> — logo centered, menu below ·{" "}
                <strong>Minimal</strong> — clean sparse nav ·{" "}
                <strong>Mega</strong> — utility bar + wide dropdowns ·{" "}
                <strong>Split</strong> — logo left, menu center, CTA right.
                {hasLogo ? null : (
                  <>
                    {" "}
                    Text logo <strong>{siteName}</strong> is used until you upload an image in Site Settings.
                  </>
                )}
              </>
            }
          />
          <Form.Item label="Header layout style">
            <OptionCards
              value={nav.style}
              options={NAV_STYLE_OPTIONS}
              onChange={(s) => onChange({ style: s })}
            />
          </Form.Item>
          {(style === "underline" || nav.activeIndicator === "underline") && (
            <EffectSection title="Underline style effects">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Underline thickness">
                    <Select
                      value={styleFx.underlineThickness ?? "medium"}
                      onChange={(v) => patchEffects("style", { underlineThickness: v })}
                      options={NAV_UNDERLINE_THICKNESS_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Link hover">
                    <Select
                      value={styleFx.linkHover ?? "fade"}
                      onChange={(v) => patchEffects("style", { linkHover: v })}
                      options={NAV_LINK_HOVER_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </EffectSection>
          )}
          {(style === "pill" || nav.activeIndicator === "pill") && (
            <EffectSection title="Pill style effects">
              <Form.Item label="Pill variant">
                <Segmented
                  value={styleFx.pillVariant ?? "solid"}
                  onChange={(v) => patchEffects("style", { pillVariant: v })}
                  options={NAV_PILL_VARIANT_OPTIONS}
                />
              </Form.Item>
            </EffectSection>
          )}
          {(style === "minimal" || style === "centered" || style === "classic") && (
            <EffectSection title={`${NAV_STYLE_OPTIONS.find((o) => o.value === style)?.label ?? "Layout"} effects`}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Link spacing">
                    <Select
                      value={styleFx.spacing ?? "normal"}
                      onChange={(v) => patchEffects("style", { spacing: v })}
                      options={NAV_SPACING_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Link hover animation">
                    <Select
                      value={styleFx.linkHover ?? "fade"}
                      onChange={(v) => patchEffects("style", { linkHover: v })}
                      options={NAV_LINK_HOVER_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </EffectSection>
          )}
          <EffectSection title="Logo effects">
            <Form.Item label="Logo shrink on scroll" extra="Uses scroll threshold from Header effects tab">
              <OptionCards
                value={styleFx.logoShrink ?? "none"}
                options={NAV_LOGO_SHRINK_OPTIONS}
                onChange={(v) => patchEffects("style", { logoShrink: v })}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Logo hover">
                  <Select
                    value={styleFx.logoHover ?? "fade"}
                    onChange={(v) => patchEffects("style", { logoHover: v })}
                    options={NAV_LOGO_HOVER_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Header height">
                  <Segmented
                    block
                    value={nav.headerHeight ?? "default"}
                    onChange={(headerHeight) => onChange({ headerHeight })}
                    options={NAV_HEADER_HEIGHT_OPTIONS}
                  />
                </Form.Item>
              </Col>
            </Row>
            <LogoSizeControls nav={nav} onChange={onChange} />
          </EffectSection>
          <Form.Item label="Container width">
            <Select
              value={nav.containerWidth ?? "contained"}
              onChange={(containerWidth) => onChange({ containerWidth })}
              options={NAV_CONTAINER_WIDTH_OPTIONS}
            />
          </Form.Item>
        </Form>
      ),
    };

  const tabs = [
    ...(headerMode === "builder"
      ? [
          {
            key: "builder",
            label: "Visual builder",
            children: <HeaderBuilderEditor nav={nav} onChange={onChange} />,
          },
        ]
      : [layoutTab]),
    {
      key: "menu",
      label: "Menu items",
      children: (
        <Form layout="vertical">
          <EffectSection title="Position & spacing">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Menu alignment"
                  extra={
                    style === "split"
                      ? "Split layout keeps the menu centered between logo and CTA"
                      : style === "centered"
                        ? "Centered layout places the menu below the logo"
                        : undefined
                  }
                >
                  <Select
                    value={nav.navAlign ?? (style === "centered" ? "center" : "right")}
                    onChange={(navAlign) => onChange({ navAlign })}
                    options={NAV_ALIGN_OPTIONS}
                    disabled={style === "split" || style === "centered"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Gap between items">
                  <Select
                    value={styleFx.spacing ?? "normal"}
                    onChange={(v) => patchEffects("style", { spacing: v })}
                    options={NAV_SPACING_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Item padding (horizontal)">
                  <Select
                    value={menuStyle.itemPaddingX ?? "md"}
                    onChange={(v) => patchMenuStyle({ itemPaddingX: v })}
                    options={NAV_MENU_ITEM_PADDING_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Item padding (vertical)">
                  <Select
                    value={menuStyle.itemPaddingY ?? "md"}
                    onChange={(v) => patchMenuStyle({ itemPaddingY: v })}
                    options={NAV_MENU_ITEM_PADDING_OPTIONS}
                  />
                </Form.Item>
              </Col>
            </Row>
          </EffectSection>

          <EffectSection title="Typography">
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item label="Text size">
                  <Segmented
                    block
                    value={nav.linkSize ?? "xs"}
                    onChange={(linkSize) => onChange({ linkSize })}
                    options={NAV_LINK_SIZE_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Font weight">
                  <Select
                    value={menuStyle.fontWeight ?? "semibold"}
                    onChange={(v) => patchMenuStyle({ fontWeight: v })}
                    options={NAV_MENU_FONT_WEIGHT_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Letter spacing">
                  <Select
                    value={menuStyle.letterSpacing ?? "normal"}
                    onChange={(v) => patchMenuStyle({ letterSpacing: v })}
                    options={NAV_MENU_LETTER_SPACING_OPTIONS}
                  />
                </Form.Item>
              </Col>
            </Row>
          </EffectSection>

          <EffectSection title="Colors">
            <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
              Leave a color empty to use the theme default. Custom colors apply to desktop and mobile menu links.
            </Text>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Link color">
                  <ColorPicker
                    value={menuStyle.color ?? "#374151"}
                    onChange={(_, hex) => patchMenuStyle({ color: hex })}
                    showText
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Hover color">
                  <ColorPicker
                    value={menuStyle.hoverColor ?? "#6b7280"}
                    onChange={(_, hex) => patchMenuStyle({ hoverColor: hex })}
                    showText
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Active color">
                  <ColorPicker
                    value={menuStyle.activeColor ?? "#111827"}
                    onChange={(_, hex) => patchMenuStyle({ activeColor: hex })}
                    showText
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Active background" extra="Used for pill-style active items">
                  <ColorPicker
                    value={menuStyle.activeBackground ?? "#171717"}
                    onChange={(_, hex) => patchMenuStyle({ activeBackground: hex })}
                    showText
                  />
                </Form.Item>
              </Col>
            </Row>
            <Button
              onClick={() => {
                const { color, hoverColor, activeColor, activeBackground, ...rest } = menuStyle;
                onChange({ menuStyle: Object.keys(rest).length ? rest : undefined });
              }}
            >
              Reset colors to theme default
            </Button>
          </EffectSection>

          <Divider />
          <Form.Item label="Active page indicator">
            <Select
              value={nav.activeIndicator ?? "none"}
              onChange={(activeIndicator) => onChange({ activeIndicator })}
              options={NAV_ACTIVE_INDICATOR_OPTIONS}
            />
          </Form.Item>
          <Form.Item label="Link hover animation">
            <Select
              value={styleFx.linkHover ?? "fade"}
              onChange={(v) => patchEffects("style", { linkHover: v })}
              options={NAV_LINK_HOVER_OPTIONS}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "effects",
      label: "Header effects",
      children: (
        <Form layout="vertical">
          <Form.Item label="Header background effect">
            <OptionCards
              value={nav.effect}
              options={NAV_EFFECT_OPTIONS}
              onChange={(e) => onChange({ effect: e })}
            />
          </Form.Item>
          {effect === "default" && (
            <EffectSection title="Solid header effects">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Shadow depth">
                    <Select
                      value={headerFx.shadow ?? "sm"}
                      onChange={(v) => patchEffects("header", { shadow: v })}
                      options={NAV_SHADOW_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Transition speed">
                    <Select
                      value={headerFx.transitionSpeed ?? "normal"}
                      onChange={(v) => patchEffects("header", { transitionSpeed: v })}
                      options={NAV_TRANSITION_SPEED_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </EffectSection>
          )}
          {effect === "blur" && (
            <EffectSection title="Glass blur effects">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label="Blur strength">
                    <Select
                      value={headerFx.blurStrength ?? "md"}
                      onChange={(v) => patchEffects("header", { blurStrength: v })}
                      options={NAV_BLUR_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Scroll threshold">
                    <Select
                      value={headerFx.scrollThreshold ?? "24"}
                      onChange={(v) => patchEffects("header", { scrollThreshold: v })}
                      options={NAV_SCROLL_THRESHOLD_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Scrolled shadow">
                    <Select
                      value={headerFx.shadow ?? "sm"}
                      onChange={(v) => patchEffects("header", { shadow: v })}
                      options={NAV_SHADOW_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </EffectSection>
          )}
          {effect === "transparent" && (
            <EffectSection title="Transparent → solid effects">
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Transparent at top, solid on scroll"
                description="The header floats over your hero or slider with no background. After you scroll past the threshold, it switches to a white bar with shadow."
              />
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Nav text on hero"
                    extra="Light text for dark sliders; dark text for light backgrounds"
                  >
                    <Select
                      value={headerFx.transparentNavTone ?? "light"}
                      onChange={(v) => patchEffects("header", { transparentNavTone: v })}
                      options={NAV_TRANSPARENT_NAV_TONE_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Scroll threshold">
                    <Select
                      value={headerFx.scrollThreshold ?? "24"}
                      onChange={(v) => patchEffects("header", { scrollThreshold: v })}
                      options={NAV_SCROLL_THRESHOLD_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Solid state shadow">
                    <Select
                      value={headerFx.shadow ?? "sm"}
                      onChange={(v) => patchEffects("header", { shadow: v })}
                      options={NAV_SHADOW_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Transition speed">
                    <Select
                      value={headerFx.transitionSpeed ?? "normal"}
                      onChange={(v) => patchEffects("header", { transitionSpeed: v })}
                      options={NAV_TRANSITION_SPEED_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </EffectSection>
          )}
          {effect === "bordered" && (
            <EffectSection title="Bordered header effects">
              <Form.Item label="Transition speed">
                <Select
                  value={headerFx.transitionSpeed ?? "normal"}
                  onChange={(v) => patchEffects("header", { transitionSpeed: v })}
                  options={NAV_TRANSITION_SPEED_OPTIONS}
                />
              </Form.Item>
            </EffectSection>
          )}
          <EffectSection title="Header colors & transparency">
            <HeaderColorControls
              headerFx={headerFx}
              effect={effect}
              onPatch={(patch) => patchEffects("header", patch)}
            />
          </EffectSection>
          <Divider />
          <Form.Item label="Sticky header">
            <Switch checked={nav.sticky ?? true} onChange={(sticky) => onChange({ sticky })} />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "dropdown",
      label: "Dropdown menus",
      children: (
        <Form layout="vertical">
          <Form.Item label="Dropdown panel type">
            <OptionCards
              value={nav.dropdown}
              options={NAV_DROPDOWN_OPTIONS}
              onChange={(d) => onChange({ dropdown: d })}
            />
          </Form.Item>
          <EffectSection title={`${NAV_DROPDOWN_OPTIONS.find((o) => o.value === dropdown)?.label ?? "Dropdown"} effects`}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Open animation speed">
                  <Select
                    value={dropdownFx.duration ?? "normal"}
                    onChange={(v) => patchEffects("dropdown", { duration: v })}
                    options={NAV_TRANSITION_SPEED_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Panel offset (gap)">
                  <Select
                    value={dropdownFx.offset ?? "sm"}
                    onChange={(v) => patchEffects("dropdown", { offset: v })}
                    options={NAV_DROPDOWN_OFFSET_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Panel shadow">
                  <Select
                    value={dropdownFx.shadow ?? "lg"}
                    onChange={(v) => patchEffects("dropdown", { shadow: v })}
                    options={NAV_SHADOW_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Corner radius">
                  <Select
                    value={dropdownFx.rounded ?? "lg"}
                    onChange={(v) => patchEffects("dropdown", { rounded: v })}
                    options={NAV_ROUNDED_OPTIONS}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Item hover effect">
                  <Select
                    value={dropdownFx.itemHover ?? "highlight"}
                    onChange={(v) => patchEffects("dropdown", { itemHover: v })}
                    options={NAV_DROPDOWN_ITEM_HOVER_OPTIONS}
                  />
                </Form.Item>
              </Col>
              {dropdown === "mega" && (
                <Col xs={24} md={12}>
                  <Form.Item label="Mega card style">
                    <Select
                      value={dropdownFx.megaCardStyle ?? "flat"}
                      onChange={(v) => patchEffects("dropdown", { megaCardStyle: v })}
                      options={NAV_MEGA_CARD_STYLE_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </EffectSection>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Open trigger">
                <Select
                  value={nav.dropdownTrigger ?? "hover"}
                  onChange={(dropdownTrigger) => onChange({ dropdownTrigger })}
                  options={NAV_DROPDOWN_TRIGGER_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Mega menu columns">
                <Select
                  value={nav.megaColumns ?? "2"}
                  onChange={(megaColumns) => onChange({ megaColumns })}
                  options={NAV_MEGA_COLUMNS_OPTIONS}
                  disabled={dropdown !== "mega" && style !== "mega"}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      key: "mobile",
      label: "Mobile",
      children: (
        <Form layout="vertical">
          <Form.Item label="Mobile menu type">
            <OptionCards
              value={nav.mobile}
              options={NAV_MOBILE_OPTIONS}
              onChange={(m) => onChange({ mobile: m })}
            />
          </Form.Item>
          <EffectSection title={`${NAV_MOBILE_OPTIONS.find((o) => o.value === mobile)?.label ?? "Mobile"} effects`}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Enter animation">
                  <Select
                    value={mobileFx.enterAnimation ?? "slide"}
                    onChange={(v) => patchEffects("mobile", { enterAnimation: v })}
                    options={NAV_MOBILE_ENTER_OPTIONS}
                  />
                </Form.Item>
              </Col>
              {mobile === "drawer" && (
                <>
                  <Col xs={24} md={12}>
                    <Form.Item label="Drawer side">
                      <Select
                        value={mobileFx.drawerSide ?? "right"}
                        onChange={(v) => patchEffects("mobile", { drawerSide: v })}
                        options={NAV_DRAWER_SIDE_OPTIONS}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Backdrop overlay">
                      <Select
                        value={mobileFx.overlay ?? "medium"}
                        onChange={(v) => patchEffects("mobile", { overlay: v })}
                        options={NAV_OVERLAY_OPTIONS}
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
              {mobile === "fullscreen" && (
                <Col xs={24} md={12}>
                  <Form.Item label="Enter animation style">
                    <Select
                      value={mobileFx.enterAnimation ?? "fade"}
                      onChange={(v) => patchEffects("mobile", { enterAnimation: v })}
                      options={NAV_MOBILE_ENTER_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              )}
              {mobile === "accordion" && (
                <Col xs={24} md={12}>
                  <Form.Item label="Expand animation">
                    <Select
                      value={mobileFx.enterAnimation ?? "slide"}
                      onChange={(v) => patchEffects("mobile", { enterAnimation: v })}
                      options={NAV_MOBILE_ENTER_OPTIONS}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </EffectSection>
        </Form>
      ),
    },
    {
      key: "topbar",
      label: "Top bar",
      children: (
        <Form layout="vertical">
          <Form.Item label="Show announcement top bar">
            <Switch
              checked={nav.showTopBar ?? false}
              onChange={(showTopBar) => onChange({ showTopBar })}
            />
          </Form.Item>
          {nav.showTopBar ? (
            <>
              <Form.Item label="Top bar message">
                <Input
                  value={nav.topBarText ?? ""}
                  onChange={(e) => onChange({ topBarText: e.target.value })}
                  placeholder="e.g. Free shipping on orders over $99"
                />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Top bar link label">
                    <Input
                      value={nav.topBarLinkLabel ?? ""}
                      onChange={(e) => onChange({ topBarLinkLabel: e.target.value })}
                      placeholder="Shop now"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Top bar link URL">
                    <Input
                      value={nav.topBarLinkHref ?? ""}
                      onChange={(e) => onChange({ topBarLinkHref: e.target.value })}
                      placeholder="/shop/"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : null}
          <Form.Item label="Show utility bar">
            <Switch
              checked={nav.showUtilityBar ?? false}
              onChange={(showUtilityBar) => onChange({ showUtilityBar })}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "cta",
      label: "Call to action",
      children: (
        <Form layout="vertical">
          <Form.Item label="Show header CTA button">
            <Switch checked={nav.showCta ?? false} onChange={(showCta) => onChange({ showCta })} />
          </Form.Item>
          {nav.showCta ? (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Button label">
                  <Input
                    value={nav.ctaLabel ?? ""}
                    onChange={(e) => onChange({ ctaLabel: e.target.value })}
                    placeholder="Contact"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Button URL">
                  <Input
                    value={nav.ctaHref ?? ""}
                    onChange={(e) => onChange({ ctaHref: e.target.value })}
                    placeholder="/contact-us/"
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : null}
        </Form>
      ),
    },
  ];

  return (
    <div>
      <Form layout="vertical" style={{ marginBottom: 16 }}>
        <Form.Item label="Header design mode">
          <OptionCards
            value={headerMode}
            options={NAV_HEADER_MODE_OPTIONS}
            onChange={(mode) => {
              if (mode === "builder" && !nav.headerBuilder?.rows?.length) {
                onChange({
                  headerMode: mode,
                  headerBuilder: {
                    rows: presetToHeaderRows(nav.style ?? "classic", nav.showCta, nav.ctaLabel, nav.ctaHref),
                    showTopRow: false,
                  },
                });
              } else {
                onChange({ headerMode: mode });
              }
            }}
          />
        </Form.Item>
      </Form>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          <>
            Menu links are edited under <Link href="/menus">Menus</Link>. Effect options appear based on
            your selected layout, header, dropdown, and mobile types.
          </>
        }
      />
      <Tabs items={tabs} />
    </div>
  );
}
