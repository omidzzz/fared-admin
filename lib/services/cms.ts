import { apiClient } from "@/lib/api/client";

export type Article = {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  image?: string;
  category: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
};

type ArticlesResponse = { success: boolean; data: { articles: Article[]; total: number } };
type ArticleResponse = { success: boolean; data: { article: Article } };

type GetParams = { page?: number; limit?: number; category?: string; published?: boolean };

export async function getArticles(params: GetParams = {}): Promise<{ articles: Article[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.category) query.set("category", params.category);
  if (params.published !== undefined) query.set("published", String(params.published));
  const res = await apiClient.get<ArticlesResponse>(`/api/admin/articles?${query}`);
  return { articles: res.data.articles, total: res.data.total };
}

export async function getArticleById(id: string): Promise<Article> {
  const res = await apiClient.get<ArticleResponse>(`/api/admin/articles/${id}`);
  return res.data.article;
}

export async function createArticle(data: Partial<Article>): Promise<Article> {
  const res = await apiClient.post<ArticleResponse>("/api/admin/articles", data);
  return res.data.article;
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article> {
  const res = await apiClient.put<ArticleResponse>(`/api/admin/articles/${id}`, data);
  return res.data.article;
}

export async function deleteArticle(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/articles/${id}`);
}
