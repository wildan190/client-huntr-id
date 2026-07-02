import { apiGet, apiPost, apiPut, apiPostForm } from "../client";

/**
 * Company API
 * 
 * Tanggung jawab: Mengelola profil perusahaan, NPWP, dan dokumen legalitas.
 */

export const registerCompany = (payload: Record<string, any>) =>
  apiPost("/api/companies", payload);

export const updateCompany = (id: string | number, payload: Record<string, any>) =>
  apiPut(`/api/companies/${id}`, payload);

export const verifyNpwp = (npwp: string) =>
  apiPost("/api/companies/verify-npwp", { npwp });

export const uploadCompanyDocument = (fd: FormData) =>
  apiPostForm("/api/companies/documents/upload", fd);

export const uploadCompanyLogo = (formData: FormData) =>
  apiPostForm("/api/companies/logo/upload", formData);

export const getMyCompanies = (userId: number | string) => 
  apiGet(`/api/companies/my?user_id=${userId}`);

export const getHistoricalPos = (companyId: string | number) =>
  apiGet(`/api/orders/historical?company_id=${companyId}`);

export const inviteUser = (payload: { company_id: string | number, whatsapp: string, email?: string, role: string }) =>
  apiPost("/api/companies/invite", payload);

export const acceptInvitation = (token: string) =>
  apiPost("/api/companies/accept-invitation", { token });

export const getTeamMembers = (companyId: string | number) =>
  apiGet(`/api/companies/${companyId}/members`);

export const getInvitationInfo = (token: string) =>
  apiGet(`/api/invitations/info?token=${token}`);
