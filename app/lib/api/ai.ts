import { apiGet, apiPost } from "../client";

/**
 * AI API
 *
 * Endpoint untuk semua fitur AI di platform Huntr.
 */

/**
 * Natural language search katalog.
 * Otomatis aktif ketika query > 20 karakter (atau mengandung kata deskriptif).
 */
export const aiSearch = (query: string, params?: { company_id?: string }) =>
  apiPost("/api/ai/search", { query, ...params });

/**
 * Generate teks perbandingan produk dari query natural language.
 * Menggunakan pengetahuan AI eksternal — tidak perlu produk ada di DB.
 */
export const aiCompareText = (query: string) =>
  apiPost("/api/ai/compare-text", { query });

/**
 * Bandingkan 2–5 produk katalog menggunakan AI (by product IDs dari DB).
 */
export const aiCompare = (catalogueIds: string[]) =>
  apiPost("/api/ai/compare", { catalogue_ids: catalogueIds });

/**
 * AI assessment dan ranking proposal tender.
 * Memerlukan auth.
 */
export const aiRankProposals = (rfqId: string) =>
  apiPost("/api/ai/rank-proposals", { rfq_id: rfqId });

/**
 * Auto-generate draft PR dari natural language prompt.
 * Memerlukan auth.
 */
export const aiGeneratePr = (query: string, catalogueIds?: string[]) =>
  apiPost("/api/ai/generate-pr", {
    query,
    catalogue_ids: catalogueIds ?? [],
  });

/**
 * Helper: deteksi apakah query cukup deskriptif untuk AI search.
 * Minimal 20 karakter ATAU mengandung kata sifat/deskriptif.
 */
export const isAiQuery = (query: string): boolean => {
  if (!query || query.trim().length < 15) return false;
  const descriptiveWords = [
    // Intentional AI queries
    "compare", "bandingkan", "perbandingan", "vs", "versus",
    "rekomendasi", "rekomendasikan", "sarankan", "pilihkan",
    // Need-based queries
    "yang bisa", "yang dapat", "untuk", "butuh", "perlu", "ingin",
    "mampu", "dengan fitur", "kapasitas", "kualitas", "spesifikasi",
    "cocok", "digunakan", "berfungsi", "support", "kompatibel",
    // Spec-based queries
    "ram", "ssd", "processor", "prosesor", "layar", "baterai",
    "minimum", "maksimum", "minimal", "terbaik", "murah", "mahal",
    "gb", "ghz", "inch", "watt",
  ];
  const lower = query.toLowerCase();
  return descriptiveWords.some((w) => lower.includes(w)) || query.trim().length > 25;
};
