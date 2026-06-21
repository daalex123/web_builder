import { RenderSections } from "../render-sections";
import { findFirstShowcaseSection } from "./utils";
import type { LayoutShellProps } from "./index";

export function ContactLayout({ title, body, blocks, sections }: LayoutShellProps) {
  const showcase = findFirstShowcaseSection(sections);

  return (
    <article>
      {showcase ? (
        <RenderSections sections={[showcase]} layout="full-width" />
      ) : (
        <header className="mx-auto max-w-6xl px-6 pb-8 pt-12">
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        </header>
      )}
      <div className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {blocks ? <div className="mb-8">{blocks}</div> : null}
            <div className="prose-content">{body}</div>
          </div>
          <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-6 lg:col-span-2 lg:self-start">
            <h2 className="text-lg font-semibold text-gray-900">Contact details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Email</dt>
                <dd className="text-gray-900">hello@example.com</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Phone</dt>
                <dd className="text-gray-900">+1 (555) 123-4567</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Hours</dt>
                <dd className="text-gray-900">Mon–Fri, 9am–5pm</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </article>
  );
}
