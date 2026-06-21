"use client";

export function SeoPreview({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  const displayTitle = title || "Page title preview";
  const displayDesc =
    description || "Add a meta description to see how this page may appear in search results.";

  return (
    <div
      style={{
        border: "1px solid #f0f0f0",
        borderRadius: 8,
        padding: 16,
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#8c8c8c", marginBottom: 8 }}>
        Search preview
      </div>
      <div style={{ fontSize: 13, color: "#389e0d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {url || "https://example.com/page/"}
      </div>
      <div style={{ fontSize: 18, color: "#0958d9", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {displayTitle}
      </div>
      <div style={{ fontSize: 13, color: "#595959", marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {displayDesc}
      </div>
      <div style={{ fontSize: 11, color: "#bfbfbf", marginTop: 8 }}>
        {displayTitle.length}/60 title · {displayDesc.length}/160 description
      </div>
    </div>
  );
}
