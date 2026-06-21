import { z } from "zod";
import type { CSSProperties } from "react";

export const sectionStylesSchema = z.object({
  paddingTop: z.number().min(0).max(120).optional(),
  paddingBottom: z.number().min(0).max(120).optional(),
  paddingLeft: z.number().min(0).max(120).optional(),
  paddingRight: z.number().min(0).max(120).optional(),
  marginTop: z.number().min(0).max(120).optional(),
  marginBottom: z.number().min(0).max(120).optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  /** Subtitle / supporting text color (sliders, hero) */
  subTextColor: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  titleSize: z.enum(["sm", "md", "lg", "xl"]).optional(),
  borderRadius: z.number().min(0).max(48).optional(),
  /** Full = edge-to-edge; contained = inside page max-width column */
  width: z.enum(["contained", "full"]).optional(),
});

export type SectionStyles = z.infer<typeof sectionStylesSchema>;

const TITLE_SIZES: Record<NonNullable<SectionStyles["titleSize"]>, string> = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
};

export function sectionStylesToCss(styles?: SectionStyles): CSSProperties {
  if (!styles) return {};

  return {
    paddingTop: styles.paddingTop !== undefined ? `${styles.paddingTop}px` : undefined,
    paddingBottom: styles.paddingBottom !== undefined ? `${styles.paddingBottom}px` : undefined,
    paddingLeft: styles.paddingLeft !== undefined ? `${styles.paddingLeft}px` : undefined,
    paddingRight: styles.paddingRight !== undefined ? `${styles.paddingRight}px` : undefined,
    marginTop: styles.marginTop !== undefined ? `${styles.marginTop}px` : undefined,
    marginBottom: styles.marginBottom !== undefined ? `${styles.marginBottom}px` : undefined,
    backgroundColor: styles.backgroundColor,
    color: styles.textColor,
    textAlign: styles.textAlign,
    borderRadius: styles.borderRadius !== undefined ? `${styles.borderRadius}px` : undefined,
    fontSize: styles.titleSize ? TITLE_SIZES[styles.titleSize] : undefined,
  };
}
