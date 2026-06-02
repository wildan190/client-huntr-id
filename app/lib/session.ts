/**
 * Session Management Utilities
 * 
 * Tanggung jawab: Mengelola token autentikasi dan sesi OTP di storage.
 */

const OTP_SESSION_KEY = "huntr_otp_session";

export type OtpSession = {
  otp_token: string;
  whatsapp: string;
  expires_at: number;
};

/**
 * Mengambil token autentikasi dari localStorage
 */
export function getAuthToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  const session = localStorage.getItem("user_session");
  if (!session) return null;
  try {
    const user = JSON.parse(session);
    return user.token || null;
  } catch {
    return null;
  }
}

/**
 * Menghasilkan header HTTP standar dengan Authorization Bearer
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const token = getAuthToken();
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Menghapus sesi autentikasi dan mengarahkan ke halaman login
 */
export function clearAuthSession(): void {
  if (typeof localStorage === "undefined") return;
  console.log("[Session] Clearing auth session");
  localStorage.removeItem("user_session");
  localStorage.removeItem("active_company");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * Menyimpan sesi OTP ke sessionStorage
 */
export function saveOtpSession(session: OtpSession): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
}

/**
 * Mengambil sesi OTP yang masih valid
 */
export function loadOtpSession(): OtpSession | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OTP_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as OtpSession;
    if (!data?.otp_token || Date.now() > data.expires_at) {
      sessionStorage.removeItem(OTP_SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Menghapus sesi OTP
 */
export function clearOtpSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(OTP_SESSION_KEY);
}

/**
 * Mendapatkan identitas perangkat sederhana (Browser & OS)
 */
export function getDeviceIdentity(): string {
  if (typeof navigator === "undefined") return "Unknown Device";
  
  const ua = navigator.userAgent;
  let os = "Unknown OS";
  if (ua.indexOf("Win") !== -1) os = "Windows";
  if (ua.indexOf("Mac") !== -1) os = "macOS";
  if (ua.indexOf("X11") !== -1) os = "UNIX";
  if (ua.indexOf("Linux") !== -1) os = "Linux";
  if (ua.indexOf("Android") !== -1) os = "Android";
  if (ua.indexOf("like Mac") !== -1) os = "iOS";

  let browser = "Unknown Browser";
  if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
  else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
  else if (ua.indexOf("Safari") !== -1) browser = "Safari";
  else if (ua.indexOf("Edge") !== -1) browser = "Edge";

  return `${browser} on ${os}`;
}
