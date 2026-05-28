const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
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
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(", ") : "Server error");
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
    headers: { Accept: "application/json" },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(", ") : "Server error");
    throw new Error(msg as string);
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (payload: {
  name: string; whatsapp: string; password: string; email?: string;
}) => apiPost("/api/auth/register", payload);

export const login = (payload: { email: string; password: string }) =>
  apiPost("/api/auth/login", payload);

export const sendOtp = (payload: { whatsapp: string }) =>
  apiPost("/api/auth/otp/send", payload);

export const verifyOtp = (payload: { whatsapp: string; otp: string }) =>
  apiPost("/api/auth/otp/verify", payload);

// ── Admin Auth & Audit ────────────────────────────────────────────────────────
export const adminLogin = (payload: Record<string, any>) =>
  apiPost("/api/admin/auth/login", payload);

export const adminGetCompanies = () =>
  apiGet("/api/admin/companies");

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
