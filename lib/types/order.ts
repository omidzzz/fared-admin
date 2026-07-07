import type { BaseFilters } from "./common";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  nameFa: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Address {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  street: string;
  postalCode: string;
}

export interface CustomerRef {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerRef;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  shippingAddress: Address;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters extends BaseFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
}
