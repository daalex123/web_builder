function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
      const id =
        parsed.searchParams.get("v") ??
        (parsed.hostname.includes("youtu.be") ? parsed.pathname.slice(1) : null);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function WidgetVideo({
  url,
  poster,
  caption,
  fullBleed = false,
}: {
  url: string;
  poster?: string;
  caption?: string;
  fullBleed?: boolean;
}) {
  const embed = getEmbedUrl(url);

  return (
    <figure>
      <div className={`overflow-hidden bg-black ${fullBleed ? "" : "rounded-2xl"}`}>
        {embed ? (
          <iframe
            src={embed}
            title={caption ?? "Video"}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={url}
            poster={poster}
            controls
            className="aspect-video w-full"
          />
        )}
      </div>
      {caption ? <figcaption className="mt-2 text-center text-sm text-gray-500">{caption}</figcaption> : null}
    </figure>
  );
}
