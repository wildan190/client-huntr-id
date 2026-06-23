import { apiGet, apiPost } from "../client";
import { saveOtpSession, loadOtpSession, getDeviceIdentity, SessionManager } from "../session";
import { normalizeWhatsapp, isValidWhatsapp, normalizeOtp } from "../whatsapp";

/**
 * Auth API
 * 
 * Tanggung jawab: Mengelola endpoint autentikasi, registrasi, dan OTP.
 */

export const login = async (payload: { email: string; password: string; rememberMe?: boolean }) => {
  const res = await apiPost("/api/auth/login", { 
    login: payload.email, 
    email: payload.email, 
    password: payload.password,
    remember_me: payload.rememberMe || false,
    device_name: getDeviceIdentity(),
  });
  
  if (res.two_factor) return { two_factor: true };
  
  const user = res.user || res;
  if (user.token && typeof localStorage !== "undefined") {
    localStorage.setItem("user_session", JSON.stringify(user));
  }
  
  try {
    const freshUser = await getAuthenticatedUser();
    if (user.token) freshUser.token = user.token;
    return freshUser;
  } catch {
    return user;
  }
};

export const register = async (payload: {
  name: string; whatsapp: string; password: string; email?: string;
}) => {
  const normalized = {
    ...payload,
    whatsapp: normalizeWhatsapp(payload.whatsapp),
    device_name: getDeviceIdentity(),
  };
  await apiPost("/api/auth/register", normalized);
  return login({ email: payload.email || payload.whatsapp, password: payload.password });
};

export const logout = () => apiPost("/api/auth/logout", {});

export const getAuthenticatedUser = () => apiGet("/api/user");

export const getCsrfCookie = async () => {
  try {
    const response = await fetch(`${resolveBaseUrl()}/sanctum/csrf-cookie`, {
      credentials: 'include',
    });
    console.log("[API] CSRF cookie initialized");
    return response;
  } catch (err) {
    console.warn("[API] Failed to fetch CSRF cookie:", err);
  }
};

function resolveBaseUrl(): string {
  let url = import.meta.env.VITE_API_URL || "http://localhost:8000";
  if (url.includes(":8443") && url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }
  return url.replace(/\/$/, "");
}

export const sendOtp = async (payload: { whatsapp: string }) => {
  const whatsapp = normalizeWhatsapp(payload.whatsapp);
  if (!isValidWhatsapp(payload.whatsapp)) {
    throw new Error("Format nomor WhatsApp tidak valid.");
  }
  
  const res = await apiPost<{
    message: string;
    otp?: string;
    whatsapp?: string;
    otp_token?: string;
    expires_in?: number;
    whatsapp_sent?: boolean;
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
};

export const verifyOtp = async (payload: { whatsapp?: string; otp: string; otp_token?: string }) => {
  const otp = normalizeOtp(payload.otp);
  if (otp.length !== 6) throw new Error("Kode OTP harus 6 digit.");

  const session = loadOtpSession();
  const otp_token = payload.otp_token || session?.otp_token;

  if (otp_token) {
    return apiPost("/api/auth/otp/verify", { otp_token, otp });
  }

  const whatsapp = normalizeWhatsapp(payload.whatsapp || session?.whatsapp || "");
  return apiPost("/api/auth/otp/verify", { whatsapp, otp });
};

export const switchRole = async (role: string) => {
  const res = await apiPost("/api/role-switch", { role });
  
  // Update user in local storage
  const currentUser = SessionManager.getUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...res.user };
    SessionManager.setUser(updatedUser);
  }
  
  return res;
};
