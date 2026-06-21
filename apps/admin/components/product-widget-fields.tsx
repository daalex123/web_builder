"use client";

import { Form, Input, Select, Slider, Switch } from "antd";
import type { NestedSection } from "@cms/shared/nested-sections";
import type { PageSection } from "@cms/shared/layouts";
import { ProductPicker } from "@/components/product-picker";

const { TextArea } = Input;

export function ProductWidgetFields({
  section,
  onChange,
}: {
  section: PageSection | NestedSection;
  onChange: (section: PageSection | NestedSection) => void;
}) {
  if (section.type === "featured-products") {
    return (
      <Form layout="vertical">
        <Form.Item label="Heading">
          <Input
            value={section.heading ?? ""}
            onChange={(e) => onChange({ ...section, heading: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Columns">
          <Select
            value={section.columns ?? 4}
            onChange={(columns) => onChange({ ...section, columns })}
            options={[
              { value: 2, label: "2 columns" },
              { value: 3, label: "3 columns" },
              { value: 4, label: "4 columns" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Products">
          <ProductPicker
            value={section.productSlugs}
            onChange={(productSlugs) => onChange({ ...section, productSlugs })}
            placeholder="Select featured products"
          />
        </Form.Item>
      </Form>
    );
  }

  if (section.type === "category-products") {
    return (
      <Form layout="vertical">
        <Form.Item label="Title">
          <Input value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })} />
        </Form.Item>
        <Form.Item label="Subtitle">
          <TextArea
            rows={2}
            value={section.subtitle}
            onChange={(e) => onChange({ ...section, subtitle: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="CTA label">
          <Input
            value={section.ctaLabel}
            onChange={(e) => onChange({ ...section, ctaLabel: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="CTA link">
          <Input
            value={section.ctaHref}
            onChange={(e) => onChange({ ...section, ctaHref: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Products">
          <ProductPicker
            value={section.productSlugs}
            onChange={(productSlugs) => onChange({ ...section, productSlugs })}
            placeholder="Select category products"
          />
        </Form.Item>
      </Form>
    );
  }

  if (section.type === "product-slider") {
    return (
      <Form layout="vertical">
        <Form.Item label="Heading">
          <Input
            value={section.heading ?? ""}
            onChange={(e) => onChange({ ...section, heading: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Products">
          <ProductPicker
            value={section.productSlugs}
            onChange={(productSlugs) => onChange({ ...section, productSlugs })}
            placeholder="Select slider products"
          />
        </Form.Item>
        <Form.Item label="Autoplay">
          <Switch
            checked={section.autoplay ?? true}
            onChange={(autoplay) => onChange({ ...section, autoplay })}
          />
        </Form.Item>
        <Form.Item label={`Interval (${section.interval ?? 5}s)`}>
          <Slider
            min={2}
            max={30}
            value={section.interval ?? 5}
            onChange={(interval) => onChange({ ...section, interval })}
          />
        </Form.Item>
        <Form.Item label="Show arrows">
          <Switch
            checked={section.showArrows ?? true}
            onChange={(showArrows) => onChange({ ...section, showArrows })}
          />
        </Form.Item>
        <Form.Item label="Show dots">
          <Switch
            checked={section.showDots ?? true}
            onChange={(showDots) => onChange({ ...section, showDots })}
          />
        </Form.Item>
      </Form>
    );
  }

  return null;
}
