"use client";

import type { PageSection } from "@cms/shared/layouts";
import type { NestedSection } from "@cms/shared/nested-sections";
import type { SlideItem } from "@cms/shared/widgets/slider-types";
import { Button, Card, Collapse, Form, Input, Segmented, Select, Slider, Space, Switch, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

type SliderSection = Extract<PageSection | NestedSection, { type: "slider" }>;

export function SliderEditor({
  section,
  onChange,
  onPickSlideImage,
}: {
  section: SliderSection;
  onChange: (section: SliderSection) => void;
  onPickSlideImage: (index: number) => void;
}) {
  function updateSlide(index: number, patch: Partial<SlideItem>) {
    const slides = section.slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide));
    onChange({ ...section, slides });
  }

  function updatePrimaryButton(index: number, patch: Partial<NonNullable<SlideItem["primaryButton"]>>) {
    const slide = section.slides[index];
    updateSlide(index, {
      primaryButton: { label: "Button", href: "/", ...slide.primaryButton, ...patch },
    });
  }

  function updateSecondaryButton(index: number, patch: Partial<NonNullable<SlideItem["secondaryButton"]>>) {
    const slide = section.slides[index];
    updateSlide(index, {
      secondaryButton: { label: "Button", href: "/", ...slide.secondaryButton, ...patch },
    });
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Card size="small" title="Slider settings" type="inner">
        <Form layout="vertical">
          <Form.Item label="Transition effect">
            <Select
              value={section.effect ?? "fade"}
              onChange={(effect) => onChange({ ...section, effect })}
              options={[
                { value: "fade", label: "Fade" },
                { value: "crossfade", label: "Crossfade" },
                { value: "slide", label: "Slide" },
                { value: "zoom", label: "Zoom" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Height">
            <Segmented
              block
              value={section.height ?? "lg"}
              onChange={(height) => onChange({ ...section, height: height as SliderSection["height"] })}
              options={[
                { label: "S", value: "sm" },
                { label: "M", value: "md" },
                { label: "L", value: "lg" },
                { label: "XL", value: "xl" },
                { label: "2XL", value: "2xl" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Overlay">
            <Segmented
              block
              value={section.overlay ?? "gradient"}
              onChange={(overlay) => onChange({ ...section, overlay: overlay as SliderSection["overlay"] })}
              options={[
                { label: "Gradient", value: "gradient" },
                { label: "Solid", value: "solid" },
                { label: "None", value: "none" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Arrow style">
            <Select
              value={section.arrowStyle ?? "circle"}
              onChange={(arrowStyle) => onChange({ ...section, arrowStyle })}
              options={[
                { value: "circle", label: "Circle" },
                { value: "square", label: "Square" },
                { value: "minimal", label: "Minimal" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Pagination">
            <Select
              value={section.dotStyle ?? "dots"}
              onChange={(dotStyle) => onChange({ ...section, dotStyle })}
              options={[
                { value: "dots", label: "Dots" },
                { value: "bars", label: "Bars" },
                { value: "fraction", label: "Fraction (1/3)" },
              ]}
            />
          </Form.Item>
          <Form.Item label={`Autoplay interval (${section.interval ?? 5}s)`}>
            <Slider
              min={2}
              max={20}
              value={section.interval ?? 5}
              onChange={(interval) => onChange({ ...section, interval })}
            />
          </Form.Item>
          <Space wrap>
            <Switch checked={section.autoplay !== false} onChange={(autoplay) => onChange({ ...section, autoplay })} />
            <Typography.Text>Autoplay</Typography.Text>
            <Switch checked={section.pauseOnHover !== false} onChange={(pauseOnHover) => onChange({ ...section, pauseOnHover })} />
            <Typography.Text>Pause on hover</Typography.Text>
            <Switch checked={section.loop !== false} onChange={(loop) => onChange({ ...section, loop })} />
            <Typography.Text>Loop</Typography.Text>
            <Switch checked={section.kenBurns === true} onChange={(kenBurns) => onChange({ ...section, kenBurns })} />
            <Typography.Text>Ken Burns</Typography.Text>
          </Space>
          <Space wrap style={{ marginTop: 12 }}>
            <Switch checked={section.showArrows !== false} onChange={(showArrows) => onChange({ ...section, showArrows })} />
            <Typography.Text>Arrows</Typography.Text>
            <Switch checked={section.showDots !== false} onChange={(showDots) => onChange({ ...section, showDots })} />
            <Typography.Text>Dots</Typography.Text>
            <Switch checked={section.showProgress !== false} onChange={(showProgress) => onChange({ ...section, showProgress })} />
            <Typography.Text>Progress bar</Typography.Text>
          </Space>
        </Form>
      </Card>

      <Collapse
        size="small"
        items={section.slides.map((slide, index) => ({
          key: String(index),
          label: `Slide ${index + 1}: ${slide.mainText ?? slide.title ?? "Untitled"}`,
          extra: (
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={section.slides.length <= 1}
              onClick={(event) => {
                event.stopPropagation();
                onChange({ ...section, slides: section.slides.filter((_, i) => i !== index) });
              }}
            />
          ),
          children: (
            <Form layout="vertical">
              <Button block style={{ marginBottom: 12 }} onClick={() => onPickSlideImage(index)}>
                Change background image
              </Button>
              <Form.Item label="Eyebrow (small text)">
                <Input
                  value={slide.eyebrow ?? ""}
                  onChange={(e) => updateSlide(index, { eyebrow: e.target.value })}
                  placeholder="NEW COLLECTION"
                />
              </Form.Item>
              <Form.Item label="Main text">
                <Input
                  value={slide.mainText ?? slide.title ?? ""}
                  onChange={(e) => updateSlide(index, { mainText: e.target.value, title: e.target.value })}
                  placeholder="Headline"
                />
              </Form.Item>
              <Form.Item label="Sub text">
                <Input.TextArea
                  rows={2}
                  value={slide.subText ?? slide.subtitle ?? ""}
                  onChange={(e) => updateSlide(index, { subText: e.target.value, subtitle: e.target.value })}
                  placeholder="Supporting message"
                />
              </Form.Item>
              <Form.Item label="Content align">
                <Segmented
                  block
                  value={slide.align ?? "left"}
                  onChange={(align) => updateSlide(index, { align: align as SlideItem["align"] })}
                  options={[
                    { label: "Left", value: "left" },
                    { label: "Center", value: "center" },
                    { label: "Right", value: "right" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Vertical position">
                <Segmented
                  block
                  value={slide.valign ?? "center"}
                  onChange={(valign) => updateSlide(index, { valign: valign as SlideItem["valign"] })}
                  options={[
                    { label: "Top", value: "top" },
                    { label: "Center", value: "center" },
                    { label: "Bottom", value: "bottom" },
                  ]}
                />
              </Form.Item>
              <Card size="small" type="inner" title="Primary button">
                <Form.Item label="Label">
                  <Input
                    value={slide.primaryButton?.label ?? ""}
                    onChange={(e) => updatePrimaryButton(index, { label: e.target.value })}
                    placeholder="Shop Now"
                  />
                </Form.Item>
                <Form.Item label="Link">
                  <Input
                    value={slide.primaryButton?.href ?? slide.link ?? ""}
                    onChange={(e) => updatePrimaryButton(index, { href: e.target.value })}
                    placeholder="/shop/"
                  />
                </Form.Item>
                <Form.Item label="Style">
                  <Select
                    value={slide.primaryButton?.variant ?? "primary"}
                    onChange={(variant) => updatePrimaryButton(index, { variant })}
                    options={[
                      { value: "primary", label: "Primary (filled)" },
                      { value: "outline", label: "Outline" },
                      { value: "ghost", label: "Ghost / link" },
                    ]}
                  />
                </Form.Item>
              </Card>
              <Card size="small" type="inner" title="Secondary button">
                <Form.Item label="Label">
                  <Input
                    value={slide.secondaryButton?.label ?? ""}
                    onChange={(e) => updateSecondaryButton(index, { label: e.target.value })}
                    placeholder="Learn More"
                  />
                </Form.Item>
                <Form.Item label="Link">
                  <Input
                    value={slide.secondaryButton?.href ?? ""}
                    onChange={(e) => updateSecondaryButton(index, { href: e.target.value })}
                    placeholder="/about/"
                  />
                </Form.Item>
                <Form.Item label="Style">
                  <Select
                    value={slide.secondaryButton?.variant ?? "outline"}
                    onChange={(variant) => updateSecondaryButton(index, { variant })}
                    options={[
                      { value: "primary", label: "Primary" },
                      { value: "outline", label: "Outline" },
                      { value: "ghost", label: "Ghost" },
                    ]}
                  />
                </Form.Item>
              </Card>
            </Form>
          ),
        }))}
      />

      <Button
        block
        type="dashed"
        onClick={() =>
          onChange({
            ...section,
            slides: [
              ...section.slides,
              {
                image: "/uploads/placeholder.jpg",
                eyebrow: "New slide",
                mainText: "Slide headline",
                subText: "Add your message here",
                primaryButton: { label: "Get Started", href: "/", variant: "primary" },
                align: "left",
                valign: "center",
              },
            ],
          })
        }
      >
        Add slide
      </Button>
    </Space>
  );
}
