import { NextResponse } from "next/server";
import { deleteMedia, getMediaById, updateMedia } from "@cms/db";
import { deleteUpload } from "@/lib/storage";

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
    await deleteUpload(media.url);
    await deleteMedia(id);
  }
  return NextResponse.json({ ok: true });
}
