import { normalizeOtp, normalizeWhatsapp, isValidWhatsapp } from "./whatsapp";

let BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
if (BASE_URL.includes(":8443") && BASE_URL.startsWith("http://")) {
  BASE_URL = BASE_URL.replace("http://", "https://");
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { 
      Accept: "application/json",
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") || "",
    },
    credentials: "include",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg = data?.message || "Server error";
    throw new Error(msg as string);
  }
  return data as T;
}

export async function apiPost<T = any>(
  path: string,
  body: Record<string, any>
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") || "",
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
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
      Accept: "application/json",
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") || "",
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
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
    headers: { 
      Accept: "application/json",
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") || "",
    },
    credentials: "include",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg = data?.message || "Server error";
    throw new Error(msg as string);
  }
  return data as T;
}

export async function apiPostForm<T = any>(
  path: string,
  formData: FormData
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { 
      Accept: "application/json",
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") || "",
    },
    body: formData,
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(", ") : "Server error");
    throw new Error(msg as string);
  }

  return data as T;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  return null;
}

let csrfInitialized = false;

async function ensureCsrfCookie(): Promise<void> {
  if (csrfInitialized && getCookie("XSRF-TOKEN")) return;
  await apiGet("/sanctum/csrf-cookie");
  csrfInitialized = true;
}

export const getCsrfCookie = () => ensureCsrfCookie();

export const register = async (payload: {
  name: string; whatsapp: string; password: string; email?: string;
}) => {
  await getCsrfCookie();
  const normalized = {
    ...payload,
    whatsapp: normalizeWhatsapp(payload.whatsapp),
  };
  await apiPost("/register", normalized);
  return getAuthenticatedUser();
};

export const login = async (payload: { email: string; password: string }) => {
  await getCsrfCookie();
  const res = await apiPost("/login", { ...payload, login: payload.email });
  if (res.two_factor) {
    return { two_factor: true };
  }
  return getAuthenticatedUser();
};

export const logout = () => apiPost("/logout", {});

export const getAuthenticatedUser = () => apiGet("/api/user");

export const sendOtp = async (payload: { whatsapp: string }) => {
  await ensureCsrfCookie();
  const whatsapp = normalizeWhatsapp(payload.whatsapp);
  if (!isValidWhatsapp(payload.whatsapp)) {
    throw new Error("Format nomor WhatsApp tidak valid. Gunakan 08xxxxxxxxxx (contoh: 085156334793).");
  }
  const res = await apiPost<{
    message: string;
    otp?: string;
    whatsapp?: string;
    expires_in?: number;
    whatsapp_sent?: boolean;
    delivery_error?: string;
  }>("/api/auth/otp/send", { whatsapp });
  return { ...res, whatsapp: res.whatsapp || whatsapp };
};

export const verifyOtp = async (payload: { whatsapp: string; otp: string }) => {
  await ensureCsrfCookie();
  const whatsapp = normalizeWhatsapp(payload.whatsapp);
  const otp = normalizeOtp(payload.otp);
  if (otp.length !== 6) {
    throw new Error("Kode OTP harus 6 digit.");
  }
  return apiPost("/api/auth/otp/verify", { whatsapp, otp });
};

// ── Account ──────────────────────────────────────────────────────────────────
export const updatePassword = (payload: Record<string, any>) =>
  apiPut("/api/account/password", payload);

export const updateWhatsapp = async (payload: { whatsapp: string }) => {
  await getCsrfCookie();
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
      Accept: "application/json",
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
      Accept: "application/json",
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
    headers: { Accept: "application/json" },
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to fetch companies");
    return data as { companies: any[] };
  });
