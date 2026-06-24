import type { LayoutShellProps } from "./index";

export function FullWidthLayout({ title, body, blocks, suppressTitle }: LayoutShellProps) {
  const showTitle = !suppressTitle && Boolean(title?.trim());

  return (
    <article>
      {showTitle ? (
        <header className="mx-auto max-w-7xl border-b border-gray-200 px-6 pb-8 pt-12">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">{title}</h1>
        </header>
      ) : null}
      {blocks}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="prose-content max-w-none">{body}</div>
      </div>
    </article>
  );
}
