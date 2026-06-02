import { apiGet, apiPost, apiPut, apiDelete, apiPostForm } from "../client";
import { normalizeWhatsapp } from "../whatsapp";

/**
 * Account API
 * 
 * Tanggung jawab: Mengelola data profil user, password, dan sesi aktif.
 */

export const updatePassword = (payload: Record<string, any>) =>
  apiPut("/api/account/password", payload);

export const updateWhatsapp = async (payload: { whatsapp: string }) => {
  return apiPut("/api/account/whatsapp", {
    whatsapp: normalizeWhatsapp(payload.whatsapp),
  });
};

export const getSessions = () => apiGet("/api/account/sessions");

export const logoutSession = (id: string) => apiDelete(`/api/account/sessions/${id}`);

// --- 2FA (Fortify) ---
export const enable2FA = () => apiPost("/user/two-factor-authentication", {});
export const disable2FA = () => apiDelete("/user/two-factor-authentication");
export const get2FAQRCode = () => apiGet("/user/two-factor-qr-code");
export const get2FARecoveryCodes = () => apiGet("/user/two-factor-recovery-codes");
export const confirm2FA = (code: string) => apiPost("/user/confirmed-two-factor-authentication", { code });
export const verify2FACode = (code: string) => apiPost("/two-factor-challenge", { code });
export const verify2FARecovery = (recovery_code: string) => apiPost("/two-factor-challenge", { recovery_code });
