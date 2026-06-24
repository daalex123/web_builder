import { NextResponse } from "next/server";
import { deleteMedia, getMediaById, updateMedia } from "@cms/db";
import { deleteMediaFile } from "@/lib/media-storage";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const media = await getMediaById(id);
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(media);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const media = await updateMedia(id, {
    alt: body.alt,
    filename: body.filename,
  });
  return NextResponse.json(media);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const media = await getMediaById(id);
  if (media) {
    try {
      await deleteMediaFile(media.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
    await deleteMedia(id);
  }
  return NextResponse.json({ ok: true });
}
