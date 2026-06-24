import { RenderContent, type ContentDoc } from "@cms/shared";

export function PageTemplate({
  title,
  content,
}: {
  title: string;
  content: ContentDoc;
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
      </header>
      <div className="prose-content">
        <RenderContent doc={content} />
      </div>
    </article>
  );
}

export function HomeTemplate({
  title,
  content,
}: {
  title: string;
  content: ContentDoc;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="prose-content">
        <RenderContent doc={content} />
      </div>
      {!content.content?.length && (
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
      )}
    </section>
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
