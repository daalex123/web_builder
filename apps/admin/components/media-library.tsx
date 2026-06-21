"use client";

import { useCallback, useEffect, useState } from "react";
import { Input, List, Modal, Progress, Typography, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { uploadMediaFiles } from "@/lib/media-client";
import { formatFileSize } from "@/lib/upload";
import { getMediaUrl } from "@/lib/utils";

const { Dragger } = Upload;
const { Search } = Input;

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  alt: string | null;
  mimeType: string;
  size?: number | null;
};

type UploadItem = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

export function MediaUploader({
  onUploaded,
  accept = "image/*,application/pdf,video/mp4,video/webm",
}: {
  onUploaded?: (items: MediaItem[]) => void;
  accept?: string;
}) {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      const items: UploadItem[] = files.map((file) => ({
        file,
        progress: 0,
        status: "pending",
      }));
      setQueue(items);
      setUploading(true);
      setQueue((q) => q.map((i) => ({ ...i, status: "uploading", progress: 50 })));

      try {
        const { uploaded, errors } = await uploadMediaFiles(files);
        if (uploaded.length) {
          setQueue((q) => q.map((i) => ({ ...i, status: "done", progress: 100 })));
          onUploaded?.(uploaded);
          setTimeout(() => setQueue([]), 1500);
        } else {
          setQueue((q) =>
            q.map((i, idx) => ({
              ...i,
              status: "error",
              error: errors[idx] ?? errors[0] ?? "Upload failed",
            })),
          );
        }
      } catch (error) {
        setQueue((q) =>
          q.map((i) => ({
            ...i,
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          })),
        );
      }
      setUploading(false);
    },
    [onUploaded],
  );

  return (
    <div>
      <Dragger
        multiple
        accept={accept}
        showUploadList={false}
        disabled={uploading}
        beforeUpload={(file, fileList) => {
          if (fileList.indexOf(file) === 0) {
            uploadFiles(fileList as File[]);
          }
          return false;
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Drag & drop files here, or click to browse</p>
        <p className="ant-upload-hint">Images, PDF, MP4 — max 10 MB each</p>
      </Dragger>

      {queue.length > 0 ? (
        <List
          style={{ marginTop: 16 }}
          size="small"
          dataSource={queue}
          renderItem={(item, i) => (
            <List.Item>
              <List.Item.Meta
                title={item.file.name}
                description={formatFileSize(item.file.size)}
              />
              {item.status === "uploading" ? (
                <Progress percent={item.progress} size="small" style={{ width: 120 }} />
              ) : (
                <Typography.Text type={item.status === "done" ? "success" : item.status === "error" ? "danger" : "secondary"}>
                  {item.status === "done" ? "Uploaded" : item.status === "error" ? item.error : "Pending"}
                </Typography.Text>
              )}
            </List.Item>
          )}
        />
      ) : null}
    </div>
  );
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  filter = "all",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  filter?: "all" | "image";
}) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function loadMedia() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filter === "image") params.set("type", "image");
    fetch(`/api/media?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setMedia(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (!open) return;
    loadMedia();
  }, [open, search, filter, refreshKey]);

  return (
    <Modal
      title="Media Library"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      styles={{ body: { maxHeight: "60vh", overflowY: "auto" } }}
    >
      <MediaUploader
        accept={filter === "image" ? "image/*" : undefined}
        onUploaded={(items) => {
          setRefreshKey((key) => key + 1);
          const item = items[0];
          if (item) {
            onSelect(item);
            onClose();
          }
        }}
      />

      <Search
        placeholder="Search files..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ margin: "16px 0" }}
        allowClear
      />

      {loading ? (
        <Typography.Text type="secondary">Loading...</Typography.Text>
      ) : media.length === 0 ? (
        <Typography.Text type="secondary">No media found</Typography.Text>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {media.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item);
                onClose();
              }}
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                background: "#fff",
                padding: 0,
                textAlign: "left",
              }}
            >
              {item.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getMediaUrl(item.url)}
                  alt={item.alt ?? item.filename}
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fafafa",
                    fontSize: 11,
                    color: "#8c8c8c",
                  }}
                >
                  {item.filename}
                </div>
              )}
              <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.filename}
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
