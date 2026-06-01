import { normalizeOtp, normalizeWhatsapp, isValidWhatsapp } from "./whatsapp";

/** Same-origin in dev (Vite proxy). Absolute URL in production build. */
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

function getAuthToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  const session = localStorage.getItem("user_session");
  if (!session) return null;
  try {
    const user = JSON.parse(session);
    return user.token || null;
  } catch {
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T = any>(path: string): Promise<T> {
  console.log(`[API] GET ${path}`);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
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
    const msg = data?.message || "Server error";
    throw new Error(msg as string);
  }
  return data as T;
}

export async function apiPost<T = any>(
  path: string,
  body: Record<string, any>
): Promise<T> {
  console.log(`[API] POST ${path}`, body);
  console.log(`[API] Full URL: ${BASE_URL}${path}`);
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
    credentials: "include",
  });
  console.log(`[API] Response status: ${res.status}`);

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
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(", ") : "Server error");
    throw new Error(msg as string);
  }

  return data as T;
}

export async function apiPut<T = any>(
  path: string,
  body: Record<string, any>
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

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
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(", ") : "Server error");
    throw new Error(msg as string);
  }

  return data as T;
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
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
    const msg = data?.message || "Server error";
    throw new Error(msg as string);
  }
  return data as T;
}

export async function apiPostForm<T = any>(
  path: string,
  formData: FormData
): Promise<T> {
  console.log(`[API] POST Form ${path}`);
  console.log(`[API] Full URL: ${BASE_URL}${path}`);
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
    credentials: "include",
  });

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
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(", ") : "Server error");
    throw new Error(msg as string);
  }

  return data as T;
}

function clearAuthSession(): void {
  if (typeof localStorage === "undefined") return;
  console.log("[API] Clearing auth session due to 401 response");
  localStorage.removeItem("user_session");
  localStorage.removeItem("active_company");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

const OTP_SESSION_KEY = "huntr_otp_session";

export type OtpSession = {
  otp_token: string;
  whatsapp: string;
  expires_at: number;
};

export function saveOtpSession(session: OtpSession): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
}

export function loadOtpSession(): OtpSession | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OTP_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as OtpSession;
    if (!data?.otp_token || Date.now() > data.expires_at) {
      sessionStorage.removeItem(OTP_SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearOtpSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(OTP_SESSION_KEY);
}

// No more CSRF cookie needed - using bearer tokens
export const getCsrfCookie = async () => {
  console.log("[API] CSRF cookie not needed - using bearer tokens");
};

export const register = async (payload: {
  name: string; whatsapp: string; password: string; email?: string;
}) => {
  const normalized = {
    ...payload,
    whatsapp: normalizeWhatsapp(payload.whatsapp),
  };
  await apiPost("/api/auth/register", normalized);
  // Auto-login after registration
  const user = await login({ email: payload.email || payload.whatsapp, password: payload.password });
  return user;
};

export const login = async (payload: { email: string; password: string; rememberMe?: boolean }) => {
  const res = await apiPost("/api/auth/login", { 
    login: payload.email, 
    email: payload.email, 
    password: payload.password,
    remember_me: payload.rememberMe || false,
  });
  if (res.two_factor) {
    return { two_factor: true };
  }
  const user = res.user || res;
  
  // Save token immediately from login response
  if (user.token && typeof localStorage !== "undefined") {
    console.log("[login] Saving token from login response");
    localStorage.setItem("user_session", JSON.stringify(user));
  }
  
  try {
    // Try to get fresh user data from /api/user endpoint
    const freshUser = await getAuthenticatedUser();
    // Preserve token from login response
    if (user.token) {
      freshUser.token = user.token;
    }
    return freshUser;
  } catch (err) {
    console.warn("[login] getAuthenticatedUser failed, using login response:", err);
    return user;
  }
};

export const logout = () => apiPost("/api/auth/logout", {});

export const getAuthenticatedUser = () => apiGet("/api/user");

export const sendOtp = async (payload: { whatsapp: string }) => {
  const whatsapp = normalizeWhatsapp(payload.whatsapp);
  console.log(`[sendOtp] Starting with whatsapp: ${whatsapp}`);
  if (!isValidWhatsapp(payload.whatsapp)) {
    throw new Error("Format nomor WhatsApp tidak valid. Gunakan 08xxxxxxxxxx (contoh: 085156334793).");
  }
  
  try {
    console.log(`[sendOtp] Calling apiPost with whatsapp: ${whatsapp}`);
    const res = await apiPost<{
      message: string;
      otp?: string;
      whatsapp?: string;
      otp_token?: string;
      expires_in?: number;
      whatsapp_sent?: boolean;
      delivery_error?: string;
    }>("/api/auth/otp/send", { whatsapp });
    console.log(`[sendOtp] Response received:`, res);

    const canonical = res.whatsapp || whatsapp;
    if (res.otp_token) {
      saveOtpSession({
        otp_token: res.otp_token,
        whatsapp: canonical,
        expires_at: Date.now() + (res.expires_in ?? 600) * 1000,
      });
    }

    return { ...res, whatsapp: canonical };
  } catch (error: any) {
    if (error.message && error.message.includes("token") && error.message.includes("expired")) {
      try {
        await refreshWhatsAppToken();
        const res = await apiPost<{
          message: string;
          otp?: string;
          whatsapp?: string;
          otp_token?: string;
          expires_in?: number;
          whatsapp_sent?: boolean;
          delivery_error?: string;
        }>("/api/auth/otp/send", { whatsapp });

        const canonical = res.whatsapp || whatsapp;
        if (res.otp_token) {
          saveOtpSession({
            otp_token: res.otp_token,
            whatsapp: canonical,
            expires_at: Date.now() + (res.expires_in ?? 600) * 1000,
          });
        }

        return { ...res, whatsapp: canonical };
      } catch (retryError) {
        throw error;
      }
    }
    throw error;
  }
};

export const verifyOtp = async (payload: { whatsapp?: string; otp: string; otp_token?: string }) => {
  const otp = normalizeOtp(payload.otp);
  if (otp.length !== 6) {
    throw new Error("Kode OTP harus 6 digit.");
  }

  const session = loadOtpSession();
  const otp_token = payload.otp_token || session?.otp_token;

  if (otp_token) {
    return apiPost("/api/auth/otp/verify", { otp_token, otp });
  }

  const whatsapp = normalizeWhatsapp(payload.whatsapp || session?.whatsapp || "");
  return apiPost("/api/auth/otp/verify", { whatsapp, otp });
};

// ── Account ──────────────────────────────────────────────────────────────────
export const updatePassword = (payload: Record<string, any>) =>
  apiPut("/api/account/password", payload);

export const updateWhatsapp = async (payload: { whatsapp: string }) => {
  return apiPut("/api/account/whatsapp", {
    whatsapp: normalizeWhatsapp(payload.whatsapp),
  });
};

export const getSessions = () => apiGet("/api/account/sessions");

export const logoutSession = (id: string) => apiDelete(`/api/account/sessions/${id}`);

// ── 2FA (Fortify) ────────────────────────────────────────────────────────────
export const enable2FA = () => apiPost("/user/two-factor-authentication", {});
export const disable2FA = () => apiDelete("/user/two-factor-authentication");
export const get2FAQRCode = () => apiGet("/user/two-factor-qr-code");
export const get2FARecoveryCodes = () => apiGet("/user/two-factor-recovery-codes");
export const confirm2FA = (code: string) => apiPost("/user/confirmed-two-factor-authentication", { code });
export const verify2FACode = (code: string) => apiPost("/two-factor-challenge", { code });
export const verify2FARecovery = (recovery_code: string) => apiPost("/two-factor-challenge", { recovery_code });

// ── Admin Auth & Audit ────────────────────────────────────────────────────────
export const adminLogin = (payload: Record<string, any>) =>
  apiPost("/api/admin/auth/login", payload);

export const adminGetCompanies = (params?: { page?: number; per_page?: number; search?: string; status?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.per_page) query.append("per_page", params.per_page.toString());
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  
  const queryString = query.toString();
  return apiGet(`/api/admin/companies${queryString ? `?${queryString}` : ""}`);
};

export const adminAuditCompany = (id: number, payload: { action: "approve" | "decline"; notes?: string }) =>
  apiPost(`/api/admin/companies/${id}/audit`, payload);

// ── Company ───────────────────────────────────────────────────────────────────
export const registerCompany = (payload: Record<string, any>) =>
  apiPost("/api/companies", payload);

export const updateCompany = (id: number, payload: Record<string, any>) =>
  fetch(`${BASE_URL}/api/companies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update company");
    return data;
  });

// ── Notifications ──────────────────────────────────────────────────────────────
export const getNotifications = (userId: number, page: number = 1) =>
  apiGet(`/api/notifications?user_id=${userId}&page=${page}`);

export const markNotificationAsRead = (id: string, userId: number) =>
  apiPost(`/api/notifications/${id}/read`, { user_id: userId });

export const markAllNotificationsAsRead = (userId: number) =>
  apiPost(`/api/notifications/read-all`, { user_id: userId });

export const uploadCompanyDocument = (fd: FormData) =>
  apiPostForm("/api/companies/documents/upload", fd);

export const verifyNpwp = (npwp: string) =>
  apiPost("/api/companies/verify-npwp", { npwp });

export const uploadCompanyLogo = (formData: FormData) =>
  apiPostForm("/api/companies/logo/upload", formData);

// ── Catalogue ─────────────────────────────────────────────────────────────────
export const createCatalogue = (payload: {
  company_id: number;
  item_code: string;
  name: string;
  category?: string;
  specifications?: string;
  uom: string;
  price: number;
}) => apiPost("/api/catalogues", payload);

export const updateCatalogue = (id: number, payload: {
  company_id: number;
  item_code: string;
  name: string;
  category?: string;
  specifications?: string;
  uom: string;
  price: number;
}) =>
  fetch(`${BASE_URL}/api/catalogues/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(", ") : "Server error");
      throw new Error(msg as string);
    }
    return data as any;
  });

export const importCatalogue = (formData: FormData) =>
  apiPostForm("/api/catalogues/import", formData);

export const importHistoricalPo = (formData: FormData) =>
  apiPostForm("/api/orders/historical/import", formData);

export const getCatalogues = (params?: { company_id?: number; search?: string; category?: string; page?: number }) => {
  let url = `/api/catalogues?page=${params?.page || 1}`;
  if (params?.company_id) url += `&company_id=${params.company_id}`;
  if (params?.search) url += `&search=${encodeURIComponent(params.search)}`;
  if (params?.category) url += `&category=${encodeURIComponent(params.category)}`;
  return apiGet(url);
};

export const getCatalogue = (id: number) =>
  apiGet(`/api/catalogues/${id}`);

export const getHistoricalPos = (companyId: number) =>
  apiGet(`/api/orders/historical?company_id=${companyId}`);

export const getOrders = (companyId: number, page: number = 1, perPage: number = 10, search: string = "") => {
  let url = `/api/orders?company_id=${companyId}&page=${page}&per_page=${perPage}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiGet(url);
};

// ── RFQ ───────────────────────────────────────────────────────────────────────
export const createRfq = (payload: {
  company_id: number;
  title: string;
  description: string;
  items: { catalogue_id: number; qty: number; expected_date: string }[];
}) => apiPost("/api/rfqs", payload);

export const getRfq = (id: number) => apiGet(`/api/rfqs/${id}`);
export const approveRfq = (rfqId: number, managerId: number) => apiPost(`/api/rfqs/${rfqId}/approve`, { manager_id: managerId });

// ── Proposal ──────────────────────────────────────────────────────────────────
export const submitProposal = (payload: {
  company_id: number;
  rfq_id: number;
  price_offer: number;
  delivery_days: number;
  warranty_months: number;
}) => apiPost("/api/proposals", payload);

// ── Order ─────────────────────────────────────────────────────────────────────
export const awardVendor = (payload: {
  rfq_id: number;
  proposal_id: number;
  manager_id: number;
}) => apiPost("/api/orders/award", payload);

// ── Receipt ───────────────────────────────────────────────────────────────────
export const createReceipt = (payload: {
  po_id: number;
  received_qty: number;
  handover_document_path: string;
}) => apiPost("/api/receipts", payload);

// ── My Companies ──────────────────────────────────────────────────────────────
export const getMyCompanies = (userId: number | string) =>
  fetch(`${BASE_URL}/api/companies/my?user_id=${userId}`, {
    headers: getAuthHeaders(),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to fetch companies");
    return data as { companies: any[] };
  });

// ── WhatsApp Communication ─────────────────────────────────────────────────────
export const refreshWhatsAppToken = () =>
  apiPost("/api/communication/whatsapp/refresh-token", {});
