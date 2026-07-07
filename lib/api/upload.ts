export async function uploadFile(
  endpoint: string,
  file: File,
  fieldName = "file"
): Promise<{ url: string }> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const formData = new FormData();
  formData.append(fieldName, file);

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Do NOT set Content-Type — browser sets it automatically with boundary
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Upload failed");
  }

  const data = await res.json();
  return data.data;
}
