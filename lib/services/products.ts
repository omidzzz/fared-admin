import { apiClient } from "@/lib/api/client";
import type { Product } from "@/lib/types";

type ProductsResponse = {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
};

type ProductResponse = { success: boolean; data: { product: Product } };

type GetProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
};

export async function getProducts(
  params: GetProductsParams = {}
): Promise<{ products: Product[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.featured) query.set("featured", "true");

  const res = await apiClient.get<ProductsResponse>(
    `/api/admin/products?${query}`
  );
  return { products: res.data.products, total: res.data.total };
}

export async function getProductById(id: string): Promise<Product> {
  const res = await apiClient.get<ProductResponse>(`/api/admin/products/${id}`);
  return res.data.product;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const res = await apiClient.post<ProductResponse>("/api/admin/products", data);
  return res.data.product;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product> {
  const res = await apiClient.put<ProductResponse>(
    `/api/admin/products/${id}`,
    data
  );
  return res.data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/products/${id}`);
}
