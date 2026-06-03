import { apiGet, apiPost } from "../client";

export const initiatePayment = (invoiceId: string, method: string) => {
  return apiPost("/api/payments", { invoice_id: invoiceId, method });
};

export const getPaymentStatus = (paymentId: string) => {
  return apiGet(`/api/payments/${paymentId}`);
};
