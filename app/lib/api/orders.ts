import { apiGet, apiPost, apiPostForm } from "../client";

/**
 * Orders & RFQ API
 * 
 * Tanggung jawab: Mengelola siklus pengadaan mulai dari RFQ hingga Receipt.
 */

// --- Orders ---
export const getOrders = (companyId: string | number, page: number = 1, perPage: number = 10, search: string = "", type: string = "all") => {
  let url = `/api/orders?company_id=${companyId}&page=${page}&per_page=${perPage}&type=${type}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiGet(url);
};

export const importHistoricalPo = (formData: FormData) =>
  apiPostForm("/api/orders/historical/import", formData);

// --- RFQ ---
export const createRfq = (payload: any) => {
  if (payload instanceof FormData) {
    return apiPostForm("/api/rfqs", payload);
  }
  return apiPost("/api/rfqs", payload);
};

export const getRfq = (id: string | number) => apiGet(`/api/rfqs/${id}`);

export const approveRfq = (rfqId: string | number, managerId: string | number) => 
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
  rfq_id: string | number;
  proposal_id: string | number;
  manager_id: string | number;
}) => apiPost("/api/orders/award", payload);

// --- Receipts ---
export const createReceipt = (payload: {
  po_id: string | number;
  company_id: string | number;
  received_qty: number;
  handover_document_path: string;
}) => apiPost("/api/receipts", payload);

// --- Delivery & Invoice ---
export const arrangeDelivery = (poId: string | number, companyId: string | number, trackingNumber?: string) => 
  apiPost(`/api/orders/${poId}/arrange-delivery`, { company_id: companyId, tracking_number: trackingNumber });

export const publishInvoice = (invoiceId: string | number, companyId: string | number) => 
  apiPost(`/api/invoices/${invoiceId}/publish`, { company_id: companyId });
