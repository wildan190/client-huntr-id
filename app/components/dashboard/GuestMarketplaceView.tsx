import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Package, Loader2, ChevronDown, ShieldCheck, Truck, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { getCatalogues } from "../../lib/api";
import { getAssetUrl } from "../../lib/assets";

const CATEGORIES = [
  "All", "Hardware", "Software", "Furniture", "Office Supplies",
  "Services", "Spareparts", "Electronics", "Mechanical",
  "Chemicals", "Construction", "Stationery", "Pantry & F&B",
  "Logistics", "Marketing", "Other"
];

const FEATURE_CARDS = [
  { icon: "📦", title: "HuntrGrow", sub: "Kelola distribusi online dan offline" },
  { icon: "💳", title: "HuntrPlus", sub: "Akses modal & pembayaran fleksibel" },
  { icon: "🍲", title: "HuntrFood", sub: "Solusi F&B untuk kebutuhan kantor" },
  { icon: "🤝", title: "Solusi MBG", sub: "Supplier resmi program Makan Bergizi" },
];

export function GuestMarketplaceView() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchItems(1); }, [activeCategory]);

  useEffect(() => {
    const t = setTimeout(() => fetchItems(1), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchItems = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getCatalogues({
        search: searchTerm,
        category: activeCategory === "All" ? undefined : activeCategory,
        page,
      });
      if (res?.data && Array.isArray(res.data)) {
        setItems(res.data);
        setCurrentPage(res.current_page || 1);
        setTotalPages(res.last_page || 1);
      } else {
        const d = res?.data || res || [];
        setItems(Array.isArray(d) ? d : []);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    fetchItems(p);
  };

  /* ─── inline styles (no Tailwind, no heavy CSS) ─── */
  const s = {
    /* layout */
    page: { minHeight: "100vh", background: "#f4f4f4", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#222" } as React.CSSProperties,
    /* ── top header (dark, like ralali) ── */
    topBar: {
      background: "#1a1a1a", position: "fixed" as const, top: 0, left: 0, right: 0, zIndex: 200,
      height: "62px", display: "flex", alignItems: "center", gap: "20px", padding: "0 28px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
    },
    logo: { height: "42px", width: "auto", objectFit: "contain" as const, flexShrink: 0 },
    searchWrap: {
      flex: 1, maxWidth: "600px", display: "flex", alignItems: "stretch",
      background: "#fff", borderRadius: "4px", overflow: "hidden",
      boxShadow: "0 0 0 2px #f97316",
    },
    searchInput: {
      flex: 1, border: "none", outline: "none", padding: "0 16px",
      fontSize: "14px", background: "transparent", color: "#111", height: "40px",
    },
    searchBtn: {
      background: "#f97316", border: "none", cursor: "pointer",
      padding: "0 20px", display: "flex", alignItems: "center", gap: "8px",
      color: "#fff", fontSize: "13px", fontWeight: 700, flexShrink: 0,
    },
    topNav: { display: "flex", alignItems: "center", gap: "20px", marginLeft: "auto" },
    topLink: {
      fontSize: "12px", color: "#ccc", textDecoration: "none",
      display: "flex", alignItems: "center", gap: "4px", cursor: "pointer",
      whiteSpace: "nowrap" as const,
    },
    divider: { width: "1px", height: "18px", background: "#444" },
    btnOutline: {
      padding: "5px 14px", border: "1px solid #f97316", borderRadius: "3px",
      color: "#f97316", background: "transparent", cursor: "pointer",
      fontSize: "12px", fontWeight: 700, textDecoration: "none",
    },
    btnFill: {
      padding: "5px 14px", border: "none", borderRadius: "3px",
      background: "#f97316", color: "#fff", cursor: "pointer",
      fontSize: "12px", fontWeight: 700, textDecoration: "none",
    },
    /* ── sub nav (white, thin) ── */
    subNav: {
      background: "#fff", position: "fixed" as const, top: "62px", left: 0, right: 0, zIndex: 199,
      height: "38px", display: "flex", alignItems: "center", borderBottom: "1px solid #e5e5e5",
      padding: "0 28px", gap: "28px",
    },
    subNavLeft: { display: "flex", alignItems: "center", gap: "24px", flex: 1, overflowX: "auto" as const, scrollbarWidth: "none" as const },
    subNavItem: { fontSize: "12px", color: "#444", whiteSpace: "nowrap" as const, cursor: "pointer", fontWeight: 500 },
    subNavActive: { fontSize: "12px", color: "#f97316", whiteSpace: "nowrap" as const, cursor: "pointer", fontWeight: 700 },
    subNavRight: { display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 },
    /* ── inner content ── */
    inner: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
    /* ── hero banner grid ── */
    bannerGrid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" },
    bannerMain: {
      background: "linear-gradient(120deg,#fff4eb,#fde8cc)",
      border: "1px solid #f7d9b0", borderRadius: "3px",
      minHeight: "220px", padding: "36px 40px", display: "flex", flexDirection: "column" as const, justifyContent: "center",
    },
    bannerSide: { display: "grid", gridTemplateRows: "1fr 1fr", gap: "10px" },
    bannerSideCard: {
      background: "#fff", border: "1px solid #e5e5e5", borderRadius: "3px",
      padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px",
    },
    bannerSideIcon: {
      background: "#fff4eb", color: "#f97316", width: "38px", height: "38px",
      borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    /* ── feature cards row ── */
    featureRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" },
    featureCard: {
      background: "#1e293b", color: "#fff", borderRadius: "3px",
      padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
    },
    /* ── category chips ── */
    catRow: {
      display: "flex", alignItems: "center", gap: "0",
      background: "#fff", border: "1px solid #e5e5e5", borderRadius: "3px", overflow: "hidden",
    },
    catChip: (active: boolean): React.CSSProperties => ({
      padding: "7px 14px", fontSize: "12px", cursor: "pointer",
      color: active ? "#f97316" : "#444", fontWeight: active ? 700 : 500,
      borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap",
      background: active ? "#fff4eb" : "transparent",
      transition: "all 0.15s",
    }),
    /* ── product grid ── */
    productCard: {
      background: "#fff", border: "1px solid #e5e5e5", borderRadius: "3px",
      cursor: "pointer", overflow: "hidden", transition: "box-shadow 0.15s",
    },
    productImg: {
      width: "100%", aspectRatio: "1/1", background: "#f8f8f8",
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    },
    productBody: { padding: "10px" },
    /* ── section header ── */
    sectionHead: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderBottom: "2px solid #f97316", paddingBottom: "8px",
    },
  };

  return (
    <div style={s.page}>
      {/* ── TOP HEADER (dark, Ralali-style) ───────────────────────────────── */}
      <header style={s.topBar}>
        <img src="/assets/img/logo/sidebar.png" alt="Huntr Logo" style={s.logo} />

        {/* Search */}
        <div style={s.searchWrap}>
          <input
            type="text"
            placeholder="Cari produk atau penjual..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={s.searchInput}
          />
          <button style={s.searchBtn}><Search size={15} /><span>Cari</span></button>
        </div>

        {/* Top nav links */}
        <nav style={s.topNav}>
          <Link to="/track" style={s.topLink}>
            <Truck size={13} /> Track Order
          </Link>
          <Link to="/verify" style={s.topLink}>
            <ShieldCheck size={13} /> Verify
          </Link>
          <div style={s.divider} />
          <Link to="/login" style={s.btnOutline}>Masuk</Link>
          <Link to="/register" style={s.btnFill}>Daftar</Link>
        </nav>
      </header>

      {/* ── SUB-NAV (white, thin — category list) ─────────────────────────── */}
      <nav style={s.subNav}>
        <div style={s.subNavLeft}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#222", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap", flexShrink: 0 }}>
            ☰ Kategori
          </span>
          {CATEGORIES.filter(c => c !== "All").slice(0, 12).map(cat => (
            <span
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={activeCategory === cat ? s.subNavActive : s.subNavItem}
            >
              {cat}
            </span>
          ))}
        </div>
        <div style={s.subNavRight}>
          <Link to="/register" style={{ fontSize: "12px", color: "#f97316", fontWeight: 700, textDecoration: "none" }}>
            Jadi Vendor
          </Link>
        </div>
      </nav>

      {/* ── PAGE CONTENT (below 100px fixed headers) ───────────────────────── */}
      <div style={{ paddingTop: "100px", paddingBottom: "60px" }}>

        {/* ── HERO BANNER ────────────────────────────────────────────────── */}
        <div style={{ ...s.inner, marginTop: "16px" }}>
          <div style={s.bannerGrid}>
            {/* Main banner */}
            <div style={s.bannerMain}>
              <span style={{ color: "#f97316", fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Huntr.id Platform
              </span>
              <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#111", margin: "10px 0 12px 0", lineHeight: 1.2 }}>
                Enterprise<br />E-Procurement Ecosystem
              </h1>
              <p style={{ color: "#666", fontSize: "13px", margin: 0, lineHeight: 1.6, maxWidth: "400px" }}>
                Hubungkan perusahaan Anda dengan ribuan vendor terverifikasi dalam satu ekosistem B2B yang efisien.
              </p>
            </div>

            {/* Side banners */}
            <div style={s.bannerSide}>
              <div style={s.bannerSideCard}>
                <div style={s.bannerSideIcon}><span style={{ fontSize: "18px" }}>💼</span></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#111" }}>E-Bidding</div>
                  <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>Sistem proposal digital transparan</div>
                </div>
              </div>
              <div style={s.bannerSideCard}>
                <div style={s.bannerSideIcon}><span style={{ fontSize: "18px" }}>🛡️</span></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#111" }}>Verified Vendors</div>
                  <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>Keamanan transaksi terjamin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FEATURE CARDS ROW ─────────────────────────────────────────── */}
        <div style={{ ...s.inner, marginTop: "10px" }}>
          <div style={s.featureRow}>
            {FEATURE_CARDS.map(c => (
              <div key={c.title} style={s.featureCard}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "12px" }}>{c.title}</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px", lineHeight: 1.4 }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORY CHIPS ─────────────────────────────────────────────── */}
        <div style={{ ...s.inner, marginTop: "14px" }}>
          <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none", border: "1px solid #e5e5e5", borderRadius: "3px", background: "#fff" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={s.catChip(activeCategory === cat)}
              >
                {cat === "All" ? "🏷 Semua" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCT SECTION ─────────────────────────────────────────────── */}
        <div style={{ ...s.inner, marginTop: "18px" }}>
          <div style={s.sectionHead}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#111" }}>
              Rekomendasi Produk
            </h2>
            <span style={{ color: "#f97316", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              Lihat Semua →
            </span>
          </div>

          {loading ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <Loader2 className="animate-spin" size={36} color="#f97316" style={{ margin: "0 auto" }} />
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#999" }}>
              <Package size={48} style={{ opacity: 0.15, margin: "0 auto 16px" }} />
              <p style={{ fontSize: "14px" }}>Belum ada produk yang tersedia.</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "8px",
              marginTop: "14px",
            }}>
              {items.map(item => (
                <div
                  key={item.id}
                  style={s.productCard}
                  onClick={() => navigate(`/marketplace/${item.id}`)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.12)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div style={s.productImg}>
                    {item.image_path ? (
                      <img
                        src={getAssetUrl(item.image_path)}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <Package size={32} color="rgba(249,115,22,0.15)" />
                    )}
                  </div>
                  <div style={s.productBody}>
                    <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                      {item.category || "General"}
                    </div>
                    <div style={{
                      fontSize: "12px", fontWeight: 600, color: "#222",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden", lineHeight: 1.35, height: "2.7em",
                    }}>
                      {item.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (() => {
            const delta = 1;
            const pages: (number | "…")[] = [];
            const left = Math.max(2, currentPage - delta);
            const right = Math.min(totalPages - 1, currentPage + delta);
            pages.push(1);
            if (left > 2) pages.push("…");
            for (let i = left; i <= right; i++) pages.push(i);
            if (right < totalPages - 1) pages.push("…");
            if (totalPages > 1) pages.push(totalPages);

            const pgBtn = (label: React.ReactNode, page: number, disabled?: boolean, active?: boolean): React.ReactNode => (
              <button
                key={`pg-${page}-${label}`}
                onClick={() => handlePage(page)}
                disabled={disabled}
                style={{
                  minWidth: "32px", height: "32px", borderRadius: "3px",
                  border: active ? "none" : "1px solid #ddd",
                  background: active ? "#f97316" : disabled ? "#f4f4f4" : "#fff",
                  color: active ? "#fff" : disabled ? "#aaa" : "#333",
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontSize: "12px", fontWeight: 700, padding: "0 8px",
                }}
              >
                {label}
              </button>
            );

            return (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", marginTop: "32px" }}>
                {pgBtn(<ChevronLeft size={14} />, currentPage - 1, currentPage === 1)}
                {pages.map((p, i) =>
                  p === "…"
                    ? <span key={`dots-${i}`} style={{ padding: "0 4px", color: "#999", fontSize: "12px" }}>…</span>
                    : pgBtn(p, p as number, false, currentPage === p)
                )}
                {pgBtn(<ChevronRightIcon size={14} />, currentPage + 1, currentPage === totalPages)}
              </div>
            );
          })()}
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid #e5e5e5", background: "#fff", marginTop: "40px", padding: "32px 24px 16px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px" }}>
            <div>
              <img src="/assets/img/logo/sidebar.png" alt="Huntr Logo" style={{ height: "28px", marginBottom: "12px", objectFit: "contain" }} />
              <p style={{ fontSize: "12px", color: "#888", lineHeight: 1.6, margin: 0 }}>
                Platform B2B e-procurement enterprise untuk efisiensi pengadaan bisnis.
              </p>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#222", marginBottom: "12px" }}>Platform</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><Link to="/marketplace" style={{ fontSize: "12px", color: "#888", textDecoration: "none" }}>Marketplace</Link></li>
                <li><Link to="/register" style={{ fontSize: "12px", color: "#888", textDecoration: "none" }}>Vendor Registration</Link></li>
                <li><Link to="/login" style={{ fontSize: "12px", color: "#888", textDecoration: "none" }}>Buyer Portal</Link></li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#222", marginBottom: "12px" }}>Tools</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><Link to="/track" style={{ fontSize: "12px", color: "#888", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}><Truck size={11} color="#f97316" /> Track Order</Link></li>
                <li><Link to="/verify" style={{ fontSize: "12px", color: "#888", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}><ShieldCheck size={11} color="#f97316" /> Verify Document</Link></li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#222", marginBottom: "12px" }}>Perusahaan</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><a href="#" style={{ fontSize: "12px", color: "#888", textDecoration: "none" }}>Tentang Kami</a></li>
                <li><a href="#" style={{ fontSize: "12px", color: "#888", textDecoration: "none" }}>Kebijakan Privasi</a></li>
                <li><a href="#" style={{ fontSize: "12px", color: "#888", textDecoration: "none" }}>Syarat &amp; Ketentuan</a></li>
              </ul>
            </div>
          </div>
          <div style={{ maxWidth: "1200px", margin: "24px auto 0", borderTop: "1px solid #f0f0f0", paddingTop: "14px", textAlign: "center", fontSize: "11px", color: "#bbb" }}>
            © 2026 Huntr.id – Enterprise Procurement Ecosystem. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
