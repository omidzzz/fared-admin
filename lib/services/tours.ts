import { apiClient } from "@/lib/api/client";
import type { Tour } from "@/lib/types";

type ToursResponse = { success: boolean; data: { tours: Tour[]; total: number } };
type TourResponse = { success: boolean; data: { tour: Tour } };

type GetParams = { page?: number; limit?: number; search?: string };

export async function getTours(params: GetParams = {}): Promise<{ tours: Tour[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  const res = await apiClient.get<ToursResponse>(`/api/admin/tours?${query}`);
  return { tours: res.data.tours, total: res.data.total };
}

export async function getTourById(id: string): Promise<Tour> {
  const res = await apiClient.get<TourResponse>(`/api/admin/tours/${id}`);
  return res.data.tour;
}

export async function createTour(data: Partial<Tour>): Promise<Tour> {
  const res = await apiClient.post<TourResponse>("/api/admin/tours", data);
  return res.data.tour;
}

export async function updateTour(id: string, data: Partial<Tour>): Promise<Tour> {
  const res = await apiClient.put<TourResponse>(`/api/admin/tours/${id}`, data);
  return res.data.tour;
}

export async function deleteTour(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/tours/${id}`);
}
