import { apiClient } from "@/lib/api/client";
import type { BusinessSettings } from "@/lib/types";

type SettingsResponse = { success: boolean; data: { settings: BusinessSettings } };
type StatusResponse = { success: boolean; message: string };

export async function getSettings(): Promise<BusinessSettings> {
  try {
    const res = await apiClient.get<SettingsResponse>("/api/admin/settings");
    return res.data.settings;
  } catch {
    // Return mock defaults if endpoint doesn't exist yet
    return {
      businessNameFa: "اورا میستیک",
      businessNameEn: "Aura Mystic",
      phone: "",
      email: "",
      address: "",
      seo: { titleFa: "", descriptionFa: "", keywords: "" },
      social: { instagram: "", telegram: "", whatsapp: "" },
      emailNotifications: { newOrder: true, newLead: true, lowStock: false },
    };
  }
}

export async function updateSettings(
  data: Partial<BusinessSettings>
): Promise<BusinessSettings> {
  const res = await apiClient.put<SettingsResponse>("/api/admin/settings", data);
  return res.data.settings;
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<string> {
  const res = await apiClient.put<StatusResponse>("/api/auth/password", data);
  return res.message;
}

export async function updateProfile(data: {
  name: string;
  email: string;
  avatar?: string;
}): Promise<unknown> {
  const res = await apiClient.put("/api/users/me", data);
  return res;
}
