/**
 * Asset Utility
 * 
 * Tanggung jawab: Mengelola URL untuk asset (gambar, dokumen) secara konsisten
 * antara lingkungan lokal dan produksi.
 */

export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return "";
  
  // Jika path sudah merupakan URL lengkap (misal dari S3 atau external)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Ambil base URL dari environment variable
  const baseUrl = import.meta.env.VITE_BASE_URL_IMAGE;
  
  if (!baseUrl) {
    // Fallback jika env tidak diset (misal di produksi lupa set)
    // Kita coba ambil dari origin saat ini
    if (typeof window !== "undefined") {
      return `${window.location.origin}/storage/${path.replace(/^\//, "")}`;
    }
    return `/storage/${path.replace(/^\//, "")}`;
  }

  // Gabungkan base URL dengan path, pastikan tidak ada double slash
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  
  return `${cleanBase}/${cleanPath}`;
}
