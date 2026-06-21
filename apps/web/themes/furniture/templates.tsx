import { RenderContent, type ContentDoc } from "@cms/shared";

export function PageTemplate({
  title,
  content,
}: {
  title: string;
  content: ContentDoc;
}) {
  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-10 border-b border-neutral-200 pb-8">
        <h1 className="text-4xl font-light tracking-wide text-neutral-900">{title}</h1>
      </header>
      <div className="prose-furniture">
        <RenderContent doc={content} />
      </div>
    </article>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
