import { apiPost, apiPostForm, apiGet } from "../../../lib/api";

export const OnboardingService = {
  verifyNpwp: (npwp: string) => apiPost("/api/companies/verify-npwp", { npwp }),
  
  uploadDocument: (fd: FormData) => apiPostForm("/api/companies/documents/upload", fd),
  
  registerCompany: (payload: any) => apiPost("/api/companies", payload),
  
  importHistoricalPo: (fd: FormData) => apiPostForm("/api/orders/historical/import", fd),
  
  importCatalogue: (fd: FormData) => apiPostForm("/api/catalogues/import", fd),
  
  getMyCompanies: (userId: number | string) => apiGet(`/api/companies/my?user_id=${userId}`),
};
