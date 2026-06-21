import type { LayoutShellProps } from "./index";

export function GalleryLayout({ title, body, blocks, sections }: LayoutShellProps) {
  const gallery = sections.find((s) => s.type === "gallery");

  return (
    <article className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
      </header>
      {gallery && gallery.type === "gallery" ? (
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {gallery.images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={img.src} alt={img.alt ?? ""} className="aspect-square w-full rounded-xl object-cover shadow-sm" />
          ))}
        </div>
      ) : null}
      {blocks ? <div className="mb-10">{blocks}</div> : null}
      <div className="prose-content mx-auto max-w-3xl">{body}</div>
    </article>
  );
}
