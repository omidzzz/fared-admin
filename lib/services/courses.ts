import { apiClient } from "@/lib/api/client";
import type { Course } from "@/lib/types";

type CoursesResponse = { success: boolean; data: { courses: Course[]; total: number } };
type CourseResponse = { success: boolean; data: { course: Course } };

type GetParams = { page?: number; limit?: number; search?: string };

export async function getCourses(params: GetParams = {}): Promise<{ courses: Course[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  const res = await apiClient.get<CoursesResponse>(`/api/admin/courses?${query}`);
  return { courses: res.data.courses, total: res.data.total };
}

export async function getCourseById(id: string): Promise<Course> {
  const res = await apiClient.get<CourseResponse>(`/api/admin/courses/${id}`);
  return res.data.course;
}

export async function createCourse(data: Partial<Course>): Promise<Course> {
  const res = await apiClient.post<CourseResponse>("/api/admin/courses", data);
  return res.data.course;
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<Course> {
  const res = await apiClient.put<CourseResponse>(`/api/admin/courses/${id}`, data);
  return res.data.course;
}

export async function deleteCourse(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/courses/${id}`);
}
