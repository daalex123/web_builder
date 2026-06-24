import { RenderSections } from "../render-sections";
import { findFirstShowcaseSection } from "./utils";
import type { LayoutShellProps } from "./index";

export function LandingLayout({ title, body, blocks, sections, suppressTitle }: LayoutShellProps) {
  const showcase = findFirstShowcaseSection(sections);

  return (
    <article>
      {showcase ? (
        <RenderSections sections={[showcase]} layout="full-width" />
      ) : !suppressTitle ? (
        <header className="bg-gray-900 px-6 py-16 text-center text-white">
          <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
        </header>
      ) : null}
      <div className="mx-auto max-w-5xl px-6 py-12">
        {blocks ? <div className="mb-10">{blocks}</div> : null}
        <div className="prose-content">{body}</div>
      </div>
    </article>
  );
}
