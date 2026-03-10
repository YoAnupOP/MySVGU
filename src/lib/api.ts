export interface ApiErrorPayload {
  error?: string;
  detail?: string;
  code?: string;
  errors?: unknown;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  data: ApiErrorPayload | null;

  constructor(message: string, status: number, data: ApiErrorPayload | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<TResponse>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(input, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? ((await response.json().catch(() => null)) as ApiErrorPayload | TResponse | null)
    : null;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload | null;
    throw new ApiError(
      errorPayload?.error || errorPayload?.detail || response.statusText || "Request failed",
      response.status,
      errorPayload,
    );
  }

  return payload as TResponse;
}