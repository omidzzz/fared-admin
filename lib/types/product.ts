import type { BaseFilters } from "./common";

export type ProductCategory =
  | "clothes"
  | "candles"
  | "accessories"
  | "stones"
  | "courses"
  | "mentorship";

export interface Product {
  id: string;
  nameEn: string;
  nameFa: string;
  slug: string;
  price: number;
  comparePrice?: number;
  stock: number;
  category: ProductCategory;
  images: string[];
  descriptionEn: string;
  descriptionFa: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters extends BaseFilters {
  category?: ProductCategory;
  active?: boolean;
  featured?: boolean;
}

export type CreateProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "slug"
>;
export type UpdateProductInput = Partial<CreateProductInput>;
