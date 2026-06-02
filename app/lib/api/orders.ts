import { apiGet, apiPost, apiPostForm } from "../client";

/**
 * Orders & RFQ API
 * 
 * Tanggung jawab: Mengelola siklus pengadaan mulai dari RFQ hingga Receipt.
 */

// --- Orders ---
export const getOrders = (companyId: number, page: number = 1, perPage: number = 10, search: string = "") => {
  let url = `/api/orders?company_id=${companyId}&page=${page}&per_page=${perPage}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiGet(url);
};

export const importHistoricalPo = (formData: FormData) =>
  apiPostForm("/api/orders/historical/import", formData);

// --- RFQ ---
export const createRfq = (payload: {
  company_id: number;
  title: string;
  description: string;
  duration_days?: number;
  items: { catalogue_id: number; qty: number; expected_date: string }[];
}) => apiPost("/api/rfqs", payload);

export const getRfq = (id: number) => apiGet(`/api/rfqs/${id}`);

export const approveRfq = (rfqId: number, managerId: number) => 
  apiPost(`/api/rfqs/${rfqId}/approve`, { manager_id: managerId });

// --- Proposals ---
export const submitProposal = (payload: any) => {
  if (payload instanceof FormData) {
    return apiPostForm("/api/proposals", payload);
  }
  return apiPost("/api/proposals", payload);
};

// --- Awarding ---
export const awardVendor = (payload: {
  rfq_id: number;
  proposal_id: number;
  manager_id: number;
}) => apiPost("/api/orders/award", payload);

// --- Receipts ---
export const createReceipt = (payload: {
  po_id: number;
  received_qty: number;
  handover_document_path: string;
}) => apiPost("/api/receipts", payload);
