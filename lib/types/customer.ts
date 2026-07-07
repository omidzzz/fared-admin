export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  lifetimeValue: number;
  createdAt: string;
  lastOrderAt?: string;
}
