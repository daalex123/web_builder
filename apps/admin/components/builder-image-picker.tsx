"use client";

import { useRef, useState } from "react";
import { Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import { uploadMediaFiles } from "@/lib/media-client";

type BuilderImagePickerProps = {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  label?: string;
  onPickFromLibrary: () => void;
  onImageUrl: (url: string, alt?: string) => void;
};

export function BuilderImagePicker({
  src,
  alt = "",
  className = "builder-image-picker block w-full",
  imgClassName = "w-full rounded-xl object-cover",
  label = "Change image",
  onPickFromLibrary,
  onImageUrl,
}: BuilderImagePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) {
      message.warning("Please drop an image file");
      return;
    }

    setUploading(true);
    try {
      const { uploaded, errors } = await uploadMediaFiles([file]);
      const item = uploaded[0];
      if (item) {
        onImageUrl(item.url, item.alt ?? item.filename);
      } else {
        message.error(errors[0] ?? "Upload failed");
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const menuItems: MenuProps["items"] = [
    {
      key: "upload",
      label: "Upload image",
      onClick: () => fileRef.current?.click(),
    },
    {
      key: "library",
      label: "Media library",
      onClick: onPickFromLibrary,
    },
  ];

  return (
    <div
      className={dragOver ? "ring-2 ring-blue-500 ring-offset-2 rounded-xl" : undefined}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
        void handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFiles([file]);
        }}
      />
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <button
          type="button"
          className={className}
          onClick={(event) => event.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className={imgClassName} />
          <span className="builder-image-picker-label">
            {uploading ? "Uploading…" : dragOver ? "Drop image" : label}
          </span>
        </button>
      </Dropdown>
    </div>
  );
}
