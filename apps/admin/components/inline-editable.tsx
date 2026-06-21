"use client";

import { useEffect, useRef } from "react";

type InlineEditableProps = {
  tag: "h1" | "h2" | "h3" | "p" | "span";
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
};

export function InlineEditable({
  tag,
  value,
  onChange,
  className,
  placeholder,
  multiline = false,
}: InlineEditableProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = tag;

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  return (
    <Tag
      ref={ref as never}
      contentEditable
      suppressContentEditableWarning
      className={`builder-inline-edit ${className ?? ""}`}
      data-placeholder={placeholder}
      onBlur={(event) => onChange(event.currentTarget.textContent ?? "")}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}
