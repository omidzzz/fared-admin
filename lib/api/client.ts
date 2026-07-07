const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth-token");
  }
  return null;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const token = getAuthToken();
  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token");
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.error || data.message || "Request failed"
    );
  }

  return data;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, options),
  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: "POST", body, ...options }),
  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: "PUT", body, ...options }),
  patch: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: "PATCH", body, ...options }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};
