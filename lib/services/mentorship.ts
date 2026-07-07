import { apiClient } from "@/lib/api/client";

type Session = {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  active: boolean;
};

type Booking = {
  id: string;
  customerName: string;
  sessionName: string;
  date: string;
  status: string;
};

type SessionsResponse = { success: boolean; data: { sessions: Session[]; total: number } };
type SessionResponse = { success: boolean; data: { session: Session } };
type BookingsResponse = { success: boolean; data: { bookings: Booking[]; total: number } };
type BookingResponse = { success: boolean; data: { booking: Booking } };

type GetParams = { page?: number; limit?: number; search?: string };

// Sessions
export async function getSessions(params: GetParams = {}): Promise<{ sessions: Session[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  const res = await apiClient.get<SessionsResponse>(`/api/admin/sessions?${query}`);
  return { sessions: res.data.sessions, total: res.data.total };
}

export async function getSessionById(id: string): Promise<Session> {
  const res = await apiClient.get<SessionResponse>(`/api/admin/sessions/${id}`);
  return res.data.session;
}

export async function createSession(data: Partial<Session>): Promise<Session> {
  const res = await apiClient.post<SessionResponse>("/api/admin/sessions", data);
  return res.data.session;
}

export async function updateSession(id: string, data: Partial<Session>): Promise<Session> {
  const res = await apiClient.put<SessionResponse>(`/api/admin/sessions/${id}`, data);
  return res.data.session;
}

export async function deleteSession(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/sessions/${id}`);
}

// Bookings
export async function getBookings(params: { page?: number; limit?: number; status?: string } = {}): Promise<{ bookings: Booking[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  const res = await apiClient.get<BookingsResponse>(`/api/admin/bookings?${query}`);
  return { bookings: res.data.bookings, total: res.data.total };
}

export async function updateBookingStatus(id: string, status: string): Promise<Booking> {
  const res = await apiClient.put<BookingResponse>(`/api/admin/bookings/${id}`, { status });
  return res.data.booking;
}
