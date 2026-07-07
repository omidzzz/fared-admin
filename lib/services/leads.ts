import { apiClient } from "@/lib/api/client";

export type Message = {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type MessagesResponse = {
  success: boolean;
  data: { messages: Message[]; total: number };
};
type MessageResponse = { success: boolean; data: { message: Message } };

type GetParams = { page?: number; limit?: number; read?: boolean };

export async function getLeads(
  params: GetParams = {}
): Promise<{ messages: Message[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.read !== undefined) query.set("read", String(params.read));

  const res = await apiClient.get<MessagesResponse>(
    `/api/admin/messages?${query}`
  );
  return { messages: res.data.messages, total: res.data.total };
}

export async function getLeadById(id: string): Promise<Message> {
  const res = await apiClient.get<MessageResponse>(`/api/admin/messages/${id}`);
  return res.data.message;
}

export async function markAsRead(id: string): Promise<Message> {
  const res = await apiClient.put<MessageResponse>("/api/admin/messages", {
    id,
    read: true,
  });
  return res.data.message;
}
