import { apiClient } from "@/lib/api/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await apiClient.get("/categories");
    return (response as { data: Category[] }).data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export async function getCategory(id: string): Promise<Category> {
  try {
    const response = await apiClient.get(`/categories/${id}`);
    return (response as { data: Category }).data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
}

export async function createCategory(
  data: Partial<Category>,
): Promise<Category> {
  try {
    const response = await apiClient.post("/categories", data);
    return (response as { data: Category }).data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

export async function updateCategory(
  id: string,
  data: Partial<Category>,
): Promise<Category> {
  try {
    const response = await apiClient.put(`/categories/${id}`, data);
    return (response as { data: Category }).data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await apiClient.delete(`/categories/${id}`);
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
}
