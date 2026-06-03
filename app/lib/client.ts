import { clearAuthSession, getAuthHeaders } from "./session";

/**
 * API Client Core
 * 
 * Tanggung jawab: Wrapper dasar untuk fetch API dengan penanganan error global.
 */

function resolveBaseUrl(): string {
  if (import.meta.env.DEV) {
    return "";
  }
  let url = import.meta.env.VITE_API_URL || "http://localhost:8000";
  if (url.includes(":8443") && url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }
  return url.replace(/\/$/, "");
}

const BASE_URL = resolveBaseUrl();

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = {};
  
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.error(`[API] Failed to parse JSON response:`, text);
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): ${text.substring(0, 100)}`);
    }
  }
  
  if (!res.ok) {
    if (res.status === 401) {
      clearAuthSession();
    }
    const msg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(", ") : "Server error");
    throw new Error(msg as string);
  }
  
  return data as T;
}

export async function apiGet<T = any>(path: string): Promise<T> {
  if (path.includes("NaN")) {
    console.warn(`[API] Warning: Path contains NaN: ${path}`);
  }
  console.log(`[API] GET ${path}`);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiPost<T = any>(path: string, body: Record<string, any>): Promise<T> {
  if (path.includes("NaN") || JSON.stringify(body).includes("NaN")) {
    console.warn(`[API] Warning: Path or Body contains NaN: ${path}`, body);
  }
  console.log(`[API] POST ${path}`, body);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiPut<T = any>(path: string, body: Record<string, any>): Promise<T> {
  console.log(`[API] PUT ${path}`, body);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  console.log(`[API] DELETE ${path}`);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiPostForm<T = any>(path: string, formData: FormData): Promise<T> {
  console.log(`[API] POST Form ${path}`);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
    credentials: "include",
  });
  return handleResponse<T>(res);
}
