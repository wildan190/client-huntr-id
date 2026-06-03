/**
 * Shared Type Definitions
 */

export interface User {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  token?: string;
}

export interface Company {
  id: number;
  name: string;
  tax_id: string;
  formatted_tax_id?: string;
  country?: string;
  type: 'buyer' | 'vendor';
  status: 'pending' | 'approved' | 'rejected';
  logo_url?: string;
}

export interface OtpSession {
  otp_token: string;
  whatsapp: string;
  expires_at: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface CatalogueItem {
  id: number;
  company_id: number;
  item_code: string;
  name: string;
  category: string;
  uom: string;
  price: number;
}
