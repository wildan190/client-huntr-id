import { apiGet, apiPost, apiPut, apiPostForm } from "../client";

/**
 * Catalogue API
 * 
 * Tanggung jawab: Mengelola item katalog produk.
 */

export const createCatalogue = (payload: {
  company_id: number;
  item_code: string;
  name: string;
  category?: string;
  specifications?: string;
  uom: string;
  price: number;
}) => apiPost("/api/catalogues", payload);

export const updateCatalogue = (id: number, payload: {
  company_id: number;
  item_code: string;
  name: string;
  category?: string;
  specifications?: string;
  uom: string;
  price: number;
}) => apiPut(`/api/catalogues/${id}`, payload);

export const importCatalogue = (formData: FormData) =>
  apiPostForm("/api/catalogues/import", formData);

export const getCatalogues = (params?: { company_id?: number; search?: string; category?: string; page?: number }) => {
  let url = `/api/catalogues?page=${params?.page || 1}`;
  if (params?.company_id) url += `&company_id=${params.company_id}`;
  if (params?.search) url += `&search=${encodeURIComponent(params.search)}`;
  if (params?.category) url += `&category=${encodeURIComponent(params.category)}`;
  return apiGet(url);
};

export const getCatalogue = (id: number) =>
  apiGet(`/api/catalogues/${id}`);
