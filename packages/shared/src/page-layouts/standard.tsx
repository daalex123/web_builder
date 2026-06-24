import type { LayoutShellProps } from "./index";

export function StandardLayout({ title, body, blocks, suppressTitle }: LayoutShellProps) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      {!suppressTitle ? (
        <header className="mb-8 border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
        </header>
      ) : null}
      {blocks ? <div className="mb-10">{blocks}</div> : null}
      <div className="prose-content">{body}</div>
    </article>
  );
}
