"use client";

import { useMemo, useState } from "react";

export function ProductImageGallery({
  image,
  gallery,
  alt,
}: {
  image: string;
  gallery: string[];
  alt: string;
}) {
  const images = useMemo(
    () => Array.from(new Set([image, ...gallery].filter(Boolean))),
    [image, gallery],
  );
  const [activeSrc, setActiveSrc] = useState(image);

  return (
    <div>
      <div className="overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSrc}
          alt={alt}
          className="aspect-square w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((url) => {
            const selected = url === activeSrc;
            return (
              <button
                key={url}
                type="button"
                onClick={() => setActiveSrc(url)}
                className={`overflow-hidden bg-neutral-100 transition ${
                  selected
                    ? "ring-2 ring-neutral-900 ring-offset-2"
                    : "opacity-80 hover:opacity-100"
                }`}
                aria-label={selected ? "Selected product image" : "Show product image"}
                aria-pressed={selected}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
