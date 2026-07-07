import { apiClient } from "@/lib/api/client";
import { uploadFile } from "@/lib/api/upload";

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

type MediaResponse = { success: boolean; data: { items: MediaItem[]; total: number } };

type GetParams = { page?: number; limit?: number; type?: string };

export async function getMedia(
  params: GetParams = {}
): Promise<{ items: MediaItem[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.type) query.set("type", params.type);

  const res = await apiClient.get<MediaResponse>(`/api/media?${query}`);
  return { items: res.data.items, total: res.data.total };
}

export async function uploadMedia(
  file: File
): Promise<{ url: string; id: string }> {
  const result = await uploadFile("/api/media/upload", file, "file");
  return result as { url: string; id: string };
}

export async function deleteMedia(id: string): Promise<void> {
  await apiClient.delete(`/api/media/${id}`);
}
