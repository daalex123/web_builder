import type { LayoutShellProps } from "./index";

export function SidebarLayout({ title, body, blocks, sections, suppressTitle }: LayoutShellProps) {
  const sidebarItems = sections
    .filter((s) => s.type === "columns")
    .flatMap((s) => (s.type === "columns" ? s.columns : []));

  return (
    <article className="mx-auto max-w-6xl px-6 py-12">
      {!suppressTitle ? (
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
        </header>
      ) : null}
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {blocks ? <div className="mb-8">{blocks}</div> : null}
          <div className="prose-content">{body}</div>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Quick links</h2>
            <ul className="mt-4 space-y-3">
              {sidebarItems.length > 0 ? (
                sidebarItems.map((item, i) => (
                  <li key={i}>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.body}</p>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-600">Add column sections in the layout designer for sidebar content.</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
