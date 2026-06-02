import { apiGet, apiPost } from "../client";

/**
 * Admin API
 * 
 * Tanggung jawab: Endpoint khusus untuk administrator (audit, list perusahaan).
 */

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
