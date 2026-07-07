export type LeadStatus = "new" | "contacted" | "closed";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  source: string;
  createdAt: string;
}
