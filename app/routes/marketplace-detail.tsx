import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams, useLoaderData } from "react-router";
import Layout from "../components/Layout";
import { getCatalogue } from "../lib/api";
import { getAssetUrl } from "../lib/assets";
import { addItemToCart, getCartItemCount, loadCart } from "../lib/cart";
import { Package, ShoppingCart, ArrowLeft, ArrowRight, X, CheckCircle2, Search, Truck, ShieldCheck } from "lucide-react";
import type { Route } from "./+types/marketplace-detail";

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const response = await getCatalogue(params.id);
    let product = response;
    if (response && typeof response === "object" && "data" in response) {
      product = response.data;
    }
    return { product };
  } catch (err) {
    console.error("Failed to load product details in loader", err);
    return { product: null };
  }
}

export function meta({ data }: Route.MetaArgs) {
  const product = data?.product;
  if (!product) {
    return [
      { title: "Product Not Found | Huntr.id" },
      { name: "description", content: "The requested product catalogue item was not found." },
    ];
  }

  const title = `${product.name} | Huntr.id`;
  const description = product.specifications || `Buy ${product.name} on Huntr.id. ${product.category || "General"} product from vendor.`;
  const canonical = `https://app.huntr.id/marketplace/${product.id}`;
  const imageUrl = product.image_url || product.image_path
    ? getAssetUrl(product.image_url || product.image_path)
    : (product.image || "https://app.huntr.id/assets/img/logo/sidebar.png");

  return [
    { title },
    { name: "description", content: description.substring(0, 160) },
    { rel: "canonical", href: canonical },
    { property: "og:type", content: "og:product" },
    { property: "og:url", content: canonical },
    { property: "og:title", content: title },
    { property: "og:description", content: description.substring(0, 160) },
    { property: "og:image", content: imageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: canonical },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description.substring(0, 160) },
    { name: "twitter:image", content: imageUrl },
  ];
}


interface CatalogueItem {
  id: string;
  item_code: string;
  name: string;
  category?: string;
  specifications?: string;
  price?: number;
  image?: string;
  image_url?: string;
  image_path?: string;
  uom: string;
  company_id: string;
  company?: {
    id: string;
    name: string;
    type: string;
  };
}

function SpecificationsBlock({ text, isGuest }: { text: string | undefined; isGuest: boolean }) {
  const color = isGuest ? "#555" : "var(--ui-text-primary)";
  const mutedColor = isGuest ? "#888" : "var(--ui-text-muted)";

  if (!text) {
    return (
      <p style={{ margin: 0, color: mutedColor, fontStyle: "italic" }}>
        No product specifications recorded.
      </p>
    );
  }

  const hasNewlines = text.includes("\n");

  if (hasNewlines) {
    return (
      <pre style={{
        margin: 0,
        fontFamily: "inherit",
        fontSize: 14,
        lineHeight: 1.8,
        color,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {text}
      </pre>
    );
  }

  return (
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color }}>
      {text}
    </p>
  );
}

/** Guest-styled top header matching GuestMarketplaceView */
function GuestHeader() {
  return (
    <header
      style={{
        background: "#1a1a1a",
        position: "sticky",
        top: 0,
        zIndex: 200,
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
      }}
      className="px-4 sm:px-6 md:px-7 py-3 flex items-center gap-4"
    >
      <Link to="/" className="flex-shrink-0">
        <img src="/assets/img/logo/sidebar.png" alt="Huntr Logo" style={{ height: "36px", width: "auto", objectFit: "contain" }} />
      </Link>

      <div className="hidden md:flex flex-1 items-stretch bg-white rounded overflow-hidden shadow-[0_0_0_2px_#f97316] h-[40px]">
        <input
          type="text"
          placeholder="Cari produk atau penjual..."
          readOnly
          className="flex-1 border-none outline-none px-4 text-sm bg-transparent text-[#111] cursor-pointer"
          onClick={() => window.history.back()}
        />
        <div className="bg-[#f97316] px-5 flex items-center gap-2 text-white text-sm font-bold flex-shrink-0 cursor-pointer"
          onClick={() => window.history.back()}>
          <Search size={15} />
          <span>Cari</span>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-5 ml-auto flex-shrink-0">
        <Link to="/track" style={{ fontSize: "12px", color: "#ccc", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
          <Truck size={13} /> Track Order
        </Link>
        <Link to="/verify" style={{ fontSize: "12px", color: "#ccc", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
          <ShieldCheck size={13} /> Verify
        </Link>
        <div style={{ width: "1px", height: "18px", background: "#444" }} />
        <Link to="/register" style={{ fontSize: "12px", color: "#f97316", fontWeight: 700, textDecoration: "none" }}>Jadi Vendor</Link>
        <div style={{ width: "1px", height: "18px", background: "#444" }} />
        <Link to="/login" style={{ padding: "5px 14px", border: "1px solid #f97316", borderRadius: "3px", color: "#f97316", background: "transparent", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>Masuk</Link>
        <Link to="/register" style={{ padding: "5px 14px", border: "none", borderRadius: "3px", background: "#f97316", color: "#fff", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>Daftar</Link>
      </nav>

      {/* Mobile: back button */}
      <div className="md:hidden ml-auto">
        <Link to="/" style={{ fontSize: "12px", color: "#f97316", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <ArrowLeft size={14} /> Katalog
        </Link>
      </div>
    </header>
  );
}

export default function MarketplaceDetail() {
  const loaderData = useLoaderData<typeof loader>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<CatalogueItem | null>(loaderData?.product || null);
  const [loading, setLoading] = useState(!loaderData?.product);
  const [error, setError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isSpecExpanded, setIsSpecExpanded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showQuantityModal) setShowQuantityModal(false);
    };
    if (showQuantityModal) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [showQuantityModal]);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    setIsGuest(!userSession);
    setCartCount(getCartItemCount(loadCart()));
    const onCartUpdate = () => setCartCount(getCartItemCount(loadCart()));
    window.addEventListener("huntr-cart-updated", onCartUpdate);
    return () => window.removeEventListener("huntr-cart-updated", onCartUpdate);
  }, []);

  useEffect(() => {
    if (!id) { setError("Product not found."); setLoading(false); return; }
    if (loaderData?.product && String(loaderData.product.id) === id) {
      setItem(loaderData.product); setLoading(false); return;
    }
    setLoading(true);
    getCatalogue(id)
      .then((response) => {
        let product = response;
        if (response && typeof response === "object" && "data" in response) product = response.data;
        if (product) { setItem(product); setError(null); sessionStorage.setItem(`/marketplace/${id}`, product.name); }
        else setError("Product data is empty.");
      })
      .catch(() => setError("Failed to load product details. Please try again."))
      .finally(() => setLoading(false));
  }, [id, loaderData]);

  const handleAddToCart = () => { setQuantity(1); setShowQuantityModal(true); };

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setShowQuantityModal(false);
  };

  const confirmAddToCart = () => {
    try {
      if (!item) return;
      addItemToCart(item as any, quantity);
      setCartCount(getCartItemCount(loadCart()));
      setCartMessage("Product added to cart.");
      setShowQuantityModal(false);
      window.setTimeout(() => setCartMessage(null), 4000);
    } catch {
      setCartMessage("Unable to add product to cart right now.");
    }
  };

  const imageUrl = item?.image_url || item?.image_path ? getAssetUrl(item.image_url || item.image_path) : (item?.image || null);
  const pageTitle = item?.name || "Marketplace Product";

  const productSchema = item ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": item.name,
    "image": imageUrl || undefined,
    "description": item.specifications || `Product details for ${item.name}`,
    "sku": item.item_code,
    "category": item.category || "General",
    ...(item.price && item.price > 0 ? {
      "offers": { "@type": "Offer", "price": item.price, "priceCurrency": "IDR", "availability": "https://schema.org/InStock", "url": `https://app.huntr.id/marketplace/${item.id}` }
    } : {}),
    ...(item.company?.name ? { "brand": { "@type": "Brand", "name": item.company.name } } : {})
  } : null;

  // ── Guest layout (matches GuestMarketplaceView theme) ───────────────────────
  if (isGuest) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f4f4", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#222" }}>
        {productSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
        )}

        <GuestHeader />

        {/* Quantity Modal */}
        {showQuantityModal && item && (
          <div onClick={handleModalBackdropClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20 }}>
            <div ref={modalRef} onClick={(e) => e.stopPropagation()} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, width: "100%", maxWidth: 400, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>Pilih Jumlah</h3>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "#666" }}>Berapa {item.uom} yang ingin Anda tambahkan?</p>
                </div>
                <button onClick={() => setShowQuantityModal(false)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", padding: 4 }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8f8f8", borderRadius: 8, padding: 12, border: "1px solid #e5e5e5" }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 40, height: 40, borderRadius: 6, border: "1px solid #ddd", background: "#fff", color: "#111", fontSize: 20, fontWeight: 800, cursor: "pointer" }}>−</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min={1} style={{ flex: 1, textAlign: "center", background: "transparent", border: "none", color: "#111", fontSize: 24, fontWeight: 800, outline: "none" }} />
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: 40, height: 40, borderRadius: 6, border: "1px solid #ddd", background: "#fff", color: "#111", fontSize: 20, fontWeight: 800, cursor: "pointer" }}>+</button>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowQuantityModal(false)} style={{ flex: 1, padding: 14, borderRadius: 6, border: "1px solid #ddd", background: "#f8f8f8", color: "#555", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Batal</button>
                <button onClick={confirmAddToCart} style={{ flex: 2, padding: 14, borderRadius: 6, border: "none", background: "#f97316", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  <ShoppingCart size={16} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />
                  Tambahkan ke Keranjang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {cartMessage && (
          <div style={{ position: "fixed", bottom: 32, right: 32, background: "#fff", border: "1px solid #e5e5e5", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "16px 20px", borderRadius: 8, display: "flex", alignItems: "center", gap: 12, zIndex: 1000, color: "#222", fontSize: 14, fontWeight: 600 }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span>{cartMessage}</span>
          </div>
        )}

        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Back link */}
          <div style={{ marginBottom: 20 }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#f97316", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
              <ArrowLeft size={15} /> Kembali ke Katalog
            </Link>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#999" }}>
              <div style={{ fontSize: 14 }}>Memuat detail produk...</div>
            </div>
          )}

          {error && (
            <div style={{ color: "#ef4444", padding: 16, borderRadius: 6, background: "rgba(239,68,68,0.08)", fontSize: 14 }}>
              {error}
            </div>
          )}

          {!loading && !error && item && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Category + title */}
              <div>
                <div style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  {item.category || "General"}
                </div>
                <h1 style={{ margin: "0 0 6px", fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 900, color: "#111", lineHeight: 1.2 }}>
                  {item.name}
                </h1>
                <div style={{ fontSize: 13, color: "#888" }}>SKU: {item.item_code}</div>
              </div>

              {/* Main content grid */}
              <div className="mp-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                <style>{`@media (min-width: 768px) { .mp-detail-grid { grid-template-columns: 1fr 380px !important; } }`}</style>

                {/* Image */}
                <div style={{ borderRadius: 6, overflow: "hidden", background: "#fff", width: "100%", minHeight: 280, maxHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e5e5" }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: "contain", display: "block" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#bbb" }}>
                      <Package size={64} strokeWidth={1} />
                      <span style={{ fontSize: 13 }}>No image available</span>
                    </div>
                  )}
                </div>

                {/* Details sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {item.price && item.price > 0 ? (
                    <div style={{ background: "#fff", borderRadius: 6, padding: 20, border: "1px solid #e5e5e5" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Estimasi Harga</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#10b981" }}>
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.price)}
                      </div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>per {item.uom}</div>
                    </div>
                  ) : null}

                  <div style={{ background: "#fff", borderRadius: 6, padding: 20, border: "1px solid #e5e5e5", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 12, borderBottom: "1px solid #eee" }}>
                      Detail Produk
                    </div>
                    {[
                      { label: "SKU / Kode Item", value: item.item_code },
                      { label: "Kategori", value: item.category || "General" },
                      { label: "Satuan", value: item.uom },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 14 }}>
                        <span style={{ color: "#888", flexShrink: 0 }}>{label}</span>
                        <span style={{ color: "#222", fontWeight: 600, textAlign: "right", maxWidth: "200px" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA button */}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    style={{ width: "100%", padding: "14px 18px", borderRadius: 6, background: "#f97316", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <ShoppingCart size={18} /> Buat permintaan sekarang
                  </button>

                  <div style={{ fontSize: 12, color: "#aaa", textAlign: "center" }}>
                    Belum punya akun?{" "}
                    <Link to="/register" style={{ color: "#f97316", fontWeight: 700, textDecoration: "none" }}>Daftar gratis</Link>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              {item.specifications && (
                <>
                  <div style={{ background: "#fff", borderRadius: 6, padding: 24, border: "1px solid #e5e5e5", marginTop: 4, position: "relative" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #eee" }}>
                      Spesifikasi
                    </div>
                    <div style={{
                      maxHeight: isSpecExpanded ? "none" : "120px",
                      overflow: "hidden",
                      position: "relative",
                      transition: "max-height 0.3s ease"
                    }}>
                      <SpecificationsBlock text={item.specifications} isGuest={true} />
                      {!isSpecExpanded && (
                        <div style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "50px",
                          background: "linear-gradient(transparent, #fff)",
                          pointerEvents: "none"
                        }} />
                      )}
                    </div>
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                      <button
                        onClick={() => setIsSpecExpanded(!isSpecExpanded)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#f97316",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                          outline: "none",
                          padding: "4px 8px"
                        }}
                      >
                        {isSpecExpanded ? "Lihat Lebih Sedikit" : "Lihat Selengkapnya"}
                      </button>
                    </div>
                  </div>

                  {/* CTA Block below Specifications */}
                  <div style={{
                    background: "linear-gradient(135deg, #fff4eb 0%, #fde8cc 100%)",
                    border: "1px solid #f7d9b0",
                    borderRadius: "8px",
                    padding: "24px",
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "12px"
                  }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#111" }}>
                      Belum menemukan produk yang tepat?
                    </h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: 1.6, maxWidth: "520px" }}>
                      Tim kami siap membantu Anda menemukan produk atau kategori yang paling sesuai dengan kebutuhan bisnis Anda.
                    </p>
                    <Link
                      to="/register"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#f97316",
                        color: "#fff",
                        textDecoration: "none",
                        fontWeight: 700,
                        fontSize: "13px",
                        padding: "10px 20px",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(249,115,22,0.2)"
                      }}
                    >
                      Hubungi Tim Kami
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {!loading && !error && !item && (
            <div style={{ color: "#999", background: "#fff", padding: 20, borderRadius: 6, border: "1px solid #e5e5e5" }}>
              No product details available to display.
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #e5e5e5", background: "#fff", marginTop: 40, padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#bbb" }}>
            © 2026 Huntr.id – Enterprise Procurement Ecosystem. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }

  // ── Authenticated layout (uses dark theme via Layout/AppShell) ───────────────
  return (
    <Layout title={pageTitle} subtitle="Product details from vendor catalog.">
      {productSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      )}

      {/* Quantity Modal */}
      {showQuantityModal && item && (
        <div onClick={handleModalBackdropClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20 }}>
          <div ref={modalRef} onClick={(e) => e.stopPropagation()} style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20, width: "100%", maxWidth: 400, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>Pilih Jumlah</h3>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ui-text-muted)" }}>Berapa {item.uom} yang ingin Anda tambahkan?</p>
              </div>
              <button onClick={() => setShowQuantityModal(false)} style={{ background: "none", border: "none", color: "var(--ui-text-muted)", cursor: "pointer", padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--ui-bg-input)", borderRadius: 16, padding: 12, border: "1px solid var(--ui-border)" }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--ui-border)", background: "var(--ui-bg-card)", color: "var(--ui-text-primary)", fontSize: 20, fontWeight: 800, cursor: "pointer" }}>−</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min={1} style={{ flex: 1, textAlign: "center", background: "transparent", border: "none", color: "var(--ui-text-primary)", fontSize: 24, fontWeight: 800, outline: "none" }} />
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--ui-border)", background: "var(--ui-bg-card)", color: "var(--ui-text-primary)", fontSize: 20, fontWeight: 800, cursor: "pointer" }}>+</button>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowQuantityModal(false)} style={{ flex: 1, padding: 14, borderRadius: 14, border: "1px solid var(--ui-border-input)", background: "var(--ui-bg-input)", color: "var(--ui-text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Batal</button>
              <button onClick={confirmAddToCart} style={{ flex: 2, padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 8px 24px rgba(16,185,129,0.25)" }}>
                <ShoppingCart size={16} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />
                Tambahkan ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {cartMessage && (
        <div style={{ position: "fixed", bottom: 32, right: 32, background: "var(--ui-bg-card)", border: "1px solid rgba(16,185,129,0.25)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", padding: "16px 20px", borderRadius: 16, display: "flex", alignItems: "center", gap: 12, zIndex: 1000, color: "var(--ui-text-primary)", fontSize: 14, fontWeight: 600 }}>
          <CheckCircle2 size={20} color="#10b981" />
          <span>{cartMessage}</span>
          <Link to="/cart" style={{ color: "#f59e0b", fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, marginLeft: 8 }}>
            Go to Cart <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 80, color: "var(--ui-text-muted)" }}>Loading product details...</div>
        )}
        {error && (
          <div style={{ color: "#fca5a5", padding: 20, borderRadius: 14, background: "rgba(239,68,68,0.08)" }}>{error}</div>
        )}

        {!loading && !error && item && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                {item.category || "General"}
              </div>
              <h1 style={{ margin: "0 0 8px", fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 900, color: "var(--ui-text-primary)", lineHeight: 1.2 }}>
                {item.name}
              </h1>
              <div style={{ fontSize: 14, color: "var(--ui-text-muted)", marginBottom: 12 }}>SKU: {item.item_code}</div>
            </div>

            <div className="mp-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>
              <style>{`@media (max-width: 768px) { .mp-detail-grid { grid-template-columns: 1fr !important; } .mp-image-box { min-height: 240px !important; max-height: 320px !important; } }`}</style>
              <div className="mp-image-box" style={{ borderRadius: 24, overflow: "hidden", background: "var(--ui-bg-card)", width: "100%", minHeight: 420, maxHeight: 520, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--ui-border)", boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)" }}>
                {imageUrl ? (
                  <img src={imageUrl} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: "contain", display: "block" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "var(--ui-text-muted)" }}>
                    <Package size={64} strokeWidth={1} />
                    <span style={{ fontSize: 13 }}>No image available</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {item.price && item.price > 0 ? (
                  <div style={{ background: "var(--ui-bg-card)", borderRadius: 20, padding: 20, border: "1px solid var(--ui-border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Estimated Price</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#10b981" }}>
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.price)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>per {item.uom}</div>
                  </div>
                ) : null}

                <div style={{ background: "var(--ui-bg-card)", borderRadius: 20, padding: 24, border: "1px solid var(--ui-border)", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 12, borderBottom: "1px solid var(--ui-border)" }}>Product Details</div>
                  {[
                    { label: "SKU / Item Code", value: item.item_code },
                    { label: "Category", value: item.category || "General" },
                    { label: "Unit of Measure", value: item.uom },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 14, padding: "6px 0" }}>
                      <span style={{ color: "var(--ui-text-muted)", flexShrink: 0 }}>{label}</span>
                      <span style={{ color: "var(--ui-text-primary)", fontWeight: 600, textAlign: "right", maxWidth: "200px" }}>{value}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart()}
                  style={{ width: "100%", padding: "15px 18px", borderRadius: 16, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15, boxShadow: "0 8px 24px rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            </div>

            <div style={{ background: "var(--ui-bg-card)", borderRadius: 20, padding: 28, border: "1px solid var(--ui-border)", marginTop: 16, boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--ui-border)" }}>Specifications</div>
              <div style={{ padding: "8px 0" }}>
                <SpecificationsBlock text={item.specifications} isGuest={false} />
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !item && (
          <div style={{ color: "var(--ui-text-primary)", background: "var(--ui-bg-input)", padding: 20, borderRadius: 18 }}>
            No product details available to display.
          </div>
        )}
      </div>
    </Layout>
  );
}
