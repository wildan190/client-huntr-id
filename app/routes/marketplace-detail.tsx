import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { getCatalogue } from "../lib/api";

interface CatalogueItem {
  id: number;
  item_code: string;
  name: string;
  category?: string;
  specifications?: string;
  image?: string;
  uom: string;
  price: number;
  company_id: number;
  company?: {
    id: number;
    name: string;
    type: string;
  };
}

export default function MarketplaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<CatalogueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Produk tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    getCatalogue(Number(id))
      .then((response) => {
        const payload = response?.data ?? response;
        const product = payload?.data ?? payload;
        setItem(product);
        setError(null);
      })
      .catch(() => {
        setError("Gagal memuat detail produk. Coba lagi.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = (catalogueItem: CatalogueItem) => {
    try {
      const currentCart = JSON.parse(localStorage.getItem("huntr_cart") || "[]");
      const existing = currentCart.find((i: any) => i.id === catalogueItem.id);
      const nextCart = existing
        ? currentCart.map((i: any) => i.id === catalogueItem.id ? { ...i, qty: i.qty + 1 } : i)
        : [...currentCart, { ...catalogueItem, qty: 1 }];

      localStorage.setItem("huntr_cart", JSON.stringify(nextCart));
      setCartMessage("Produk berhasil ditambahkan ke keranjang.");
      window.setTimeout(() => setCartMessage(null), 3200);
    } catch (err) {
      console.error(err);
      setCartMessage("Tidak dapat menambahkan produk ke keranjang sekarang.");
    }
  };

  return (
    <Layout title="Marketplace Product" subtitle="Detail produk dari katalog vendor.">
      <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate("/marketplace")}
          style={{
            marginBottom: 24,
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e5e7eb",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ← Kembali ke Marketplace
        </button>

        {loading && <div style={{ color: "#d1d5db" }}>Memuat detail produk...</div>}
        {error && <div style={{ color: "#fca5a5" }}>{error}</div>}
        {!loading && !error && item ? (
          <div style={{ display: "grid", gap: 24 }}>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 700 }}>
                Marketplace Product
              </div>
              <h1 style={{ margin: 0, fontSize: 34, color: "#f8fafc" }}>{item.name}</h1>
              <p style={{ margin: 0, color: "#cbd5e1", maxWidth: 760, lineHeight: 1.7 }}>
                {item.specifications || "Tidak ada spesifikasi tambahan."}
              </p>
            </div>

            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.1fr 0.9fr" }}>
              <div style={{ borderRadius: 24, overflow: "hidden", background: "rgba(255,255,255,0.03)", minHeight: 360 }}>
                <img
                  src={item.image || "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80"}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              <div style={{ display: "grid", gap: 20, padding: 24, borderRadius: 24, background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(148, 163, 184, 0.12)" }}>
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ color: "#94a3b8", textTransform: "uppercase", fontSize: 12, letterSpacing: 1.2 }}>
                      Detail Produk
                    </span>
                    <span style={{ fontSize: 14, color: "#cbd5e1" }}>Vendor: {item.company?.name || "-"}</span>
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#e2e8f0" }}>
                      <span>ID Produk</span>
                      <span>{item.item_code}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#e2e8f0" }}>
                      <span>Kategori</span>
                      <span>{item.category || "Umum"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#e2e8f0" }}>
                      <span>Satuan</span>
                      <span>{item.uom}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#e2e8f0", fontSize: 18, fontWeight: 800 }}>
                      <span>Harga</span>
                      <span>IDR {Number(item.price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 700 }}>Spesifikasi</div>
                  <div style={{ color: "#e2e8f0", background: "rgba(15, 23, 42, 0.95)", padding: 16, borderRadius: 16, lineHeight: 1.8 }}>
                    {item.specifications || "Tidak ada spesifikasi produk yang tercatat."}
                  </div>
                </div>

                {cartMessage ? (
                  <div style={{ color: "#d1fae5", background: "rgba(16, 185, 129, 0.18)", padding: 14, borderRadius: 14, border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                    {cartMessage}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  style={{
                    width: "100%",
                    padding: "16px 18px",
                    borderRadius: 16,
                    background: "#10b981",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Tambah ke Keranjang
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/marketplace`)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#9ca3af",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Kembali ke Marketplace
                </button>
              </div>
            </div>
          </div>
        ) : (
        !loading && !error && (
          <div style={{ color: "#f8fafc", background: "rgba(255,255,255,0.04)", padding: 20, borderRadius: 18 }}>
            Tidak ada detail produk yang dapat ditampilkan.
          </div>
        )
      )}
    </div>
    </Layout>
  );
}
