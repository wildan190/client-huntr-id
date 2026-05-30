/**
 * Canonical Indonesian WhatsApp format — must match backend WhatsappNumber::normalize.
 */
export function normalizeWhatsapp(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  } else if (!digits.startsWith("62") && digits.startsWith("8")) {
    digits = "62" + digits;
  }

  return digits;
}

export function normalizeOtp(otp: string): string {
  return otp.replace(/\D/g, "").slice(0, 6);
}
