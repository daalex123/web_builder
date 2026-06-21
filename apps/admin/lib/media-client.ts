export type UploadedMedia = {
  id: string;
  filename: string;
  url: string;
  alt: string | null;
  mimeType: string;
  size?: number | null;
};

export async function uploadMediaFiles(files: File[]): Promise<{
  uploaded: UploadedMedia[];
  errors: string[];
}> {
  if (!files.length) {
    return { uploaded: [], errors: [] };
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append("file", file);
  }

  const res = await fetch("/api/media", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok && !data.uploaded?.length) {
    throw new Error(data.errors?.[0] ?? data.error ?? "Upload failed");
  }

  return {
    uploaded: data.uploaded ?? [],
    errors: data.errors ?? [],
  };
}
