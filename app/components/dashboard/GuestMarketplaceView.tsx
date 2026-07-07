import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Package, Loader2, ChevronDown, ShieldCheck, Truck, ChevronLeft, ChevronRight as ChevronRightIcon, Menu, X } from "lucide-react";
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
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const catMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    logo: { height: "36px", width: "auto", objectFit: "contain" as const, flexShrink: 0 },
    searchInput: {
      flex: 1, border: "none", outline: "none", padding: "0 16px",
      fontSize: "14px", background: "transparent", color: "#111", height: "40px",
    },
    searchBtn: {
      background: "#f97316", border: "none", cursor: "pointer",
      padding: "0 20px", display: "flex", alignItems: "center", gap: "8px",
      color: "#fff", fontSize: "13px", fontWeight: 700, flexShrink: 0,
    },
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
    /* category chips */
    catChip: (active: boolean): React.CSSProperties => ({
      padding: "7px 14px", fontSize: "12px", cursor: "pointer",
      color: active ? "#f97316" : "#444", fontWeight: active ? 700 : 500,
      borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap",
      background: active ? "#fff4eb" : "transparent",
      transition: "all 0.15s",
    }),
    /* product grid */
    productCard: {
      background: "#fff", border: "1px solid #e5e5e5", borderRadius: "3px",
      cursor: "pointer", overflow: "hidden", transition: "box-shadow 0.15s",
    },
    productImg: {
      width: "100%", aspectRatio: "1/1", background: "#f8f8f8",
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    },
    productBody: { padding: "10px" },
    /* section header */
    sectionHead: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderBottom: "2px solid #f97316", paddingBottom: "8px",
    },
    inner: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
  };

  return (
    <div style={s.page}>
      {/* ── TOP HEADER (dark, Ralali-style) ───────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] shadow-[0_2px_8px_rgba(0,0,0,0.5)] px-4 sm:px-6 md:px-7 py-3 md:py-0 md:h-[62px] flex flex-col md:flex-row md:items-center gap-3 md:gap-5 justify-between">
        {/* Row 1: Logo & Hamburger */}
        <div className="flex items-center justify-between w-full md:w-auto flex-shrink-0">
          <Link to="/">
            <img src="/assets/img/logo/sidebar.png" alt="Huntr Logo" style={s.logo} />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden text-white hover:text-[#f97316] transition-colors p-1"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search Bar - Full width on mobile, centered on desktop */}
        <div className="w-full md:flex-1 md:max-w-[600px] flex items-stretch bg-white rounded overflow-hidden shadow-[0_0_0_2px_#f97316] h-[38px] md:h-[40px]">
          <input
            type="text"
            placeholder="Cari produk atau penjual..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={s.searchInput}
            className="flex-1 border-none outline-none px-4 text-sm bg-transparent text-[#111] h-full"
          />
          <button
            onClick={() => fetchItems(1)}
            style={s.searchBtn}
            className="bg-[#f97316] border-none cursor-pointer px-5 flex items-center gap-2 text-white text-xs md:text-sm font-bold flex-shrink-0"
          >
            <Search size={15} />
            <span className="hidden sm:inline">Cari</span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 ml-auto flex-shrink-0">
          <Link to="/track" style={s.topLink}>
            <Truck size={13} /> Track Order
          </Link>
          <Link to="/verify" style={s.topLink}>
            <ShieldCheck size={13} /> Verify
          </Link>
          <div style={s.divider} />
          <Link to="/register" style={{ ...s.topLink, color: "#f97316", fontWeight: 700 }}>Jadi Vendor</Link>
          <div style={s.divider} />
          <Link to="/login" style={s.btnOutline}>Masuk</Link>
          <Link to="/register" style={s.btnFill}>Daftar</Link>
        </nav>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#1a1a1a] border-t border-[#333] shadow-lg p-5 flex flex-col gap-4 z-40 transition-all duration-300">
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white flex items-center gap-3 text-sm py-2"
            >
              <Truck size={16} className="text-[#f97316]" /> Track Order
            </Link>
            <Link
              to="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white flex items-center gap-3 text-sm py-2"
            >
              <ShieldCheck size={16} className="text-[#f97316]" /> Verify
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#f97316] font-bold flex items-center gap-3 text-sm py-2"
            >
              Jadi Vendor
            </Link>
            <div className="h-px bg-[#333] my-1" />
            <div className="flex gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center border border-[#f97316] rounded text-[#f97316] font-bold text-sm bg-transparent"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center rounded bg-[#f97316] text-white font-bold text-sm"
              >
                Daftar
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── SUB-NAV (white, thin) ──────────────────────────────────────────── */}
      <nav className="fixed top-[115px] md:top-[62px] left-0 right-0 z-40 h-[38px] bg-white flex items-center border-b border-[#e5e5e5] px-4 md:px-7 gap-7 shadow-sm">
        {/* Hamburger kategori trigger */}
        <div ref={catMenuRef} className="relative">
          <button
            onClick={() => setCategoryMenuOpen(v => !v)}
            style={{
              fontSize: "12px", fontWeight: 700, color: categoryMenuOpen ? "#f97316" : "#222",
              background: categoryMenuOpen ? "#fff4eb" : "transparent",
              border: "1px solid " + (categoryMenuOpen ? "#f97316" : "#e5e5e5"),
              borderRadius: "3px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              padding: "4px 12px", whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            ☰ Kategori
          </button>

          {/* Dropdown panel */}
          {categoryMenuOpen && (
            <div className="fixed top-[153px] md:top-[100px] left-0 right-0 bg-white border-t-2 border-[#f97316] border-b border-[#e5e5e5] shadow-lg z-30 p-5 md:px-7">
              <div className="max-w-[1200px] mx-auto">
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
                  Semua Kategori
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setCategoryMenuOpen(false); }}
                      style={{
                        textAlign: "left", padding: "8px 12px",
                        fontSize: "13px", fontWeight: activeCategory === cat ? 700 : 400,
                        color: activeCategory === cat ? "#f97316" : "#333",
                        background: activeCategory === cat ? "#fff4eb" : "#f8f8f8",
                        border: "1px solid " + (activeCategory === cat ? "#f97316" : "#e8e8e8"),
                        borderRadius: "3px", cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { if (activeCategory !== cat) { (e.currentTarget as HTMLElement).style.background = "#fff4eb"; (e.currentTarget as HTMLElement).style.color = "#f97316"; } }}
                      onMouseLeave={e => { if (activeCategory !== cat) { (e.currentTarget as HTMLElement).style.background = "#f8f8f8"; (e.currentTarget as HTMLElement).style.color = "#333"; } }}
                    >
                      {cat === "All" ? "🏷 Semua Produk" : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── PAGE CONTENT (below fixed headers) ───────────────────────── */}
      <div className="pt-[210px] sm:pt-[200px] md:pt-[120px] pb-[60px]">

        {/* ── HERO BANNER ────────────────────────────────────────────────── */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main banner */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#fff4eb] to-[#fde8cc] border border-[#f7d9b0] rounded py-8 px-6 sm:py-10 sm:px-10 flex flex-col justify-center min-h-[180px] sm:min-h-[220px]">
              <span className="text-[#f97316] font-extrabold text-xs uppercase tracking-wider">
                Huntr.id Platform
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111] my-3 leading-tight">
                Enterprise E-Procurement Ecosystem
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-[480px]">
                Hubungkan perusahaan Anda dengan ribuan vendor terverifikasi dalam satu ekosistem B2B yang efisien.
              </p>
            </div>

            {/* Side banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="bg-white border border-[#e5e5e5] rounded p-4 flex items-center gap-3.5">
                <div className="bg-[#fff4eb] text-[#f97316] w-[38px] h-[38px] rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💼</span>
                </div>
                <div>
                  <div className="font-bold text-sm text-[#111]">E-Bidding</div>
                  <div className="text-xs text-gray-500 mt-0.5">Sistem proposal digital transparan</div>
                </div>
              </div>
              <div className="bg-white border border-[#e5e5e5] rounded p-4 flex items-center gap-3.5">
                <div className="bg-[#fff4eb] text-[#f97316] w-[38px] h-[38px] rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🛡️</span>
                </div>
                <div>
                  <div className="font-bold text-sm text-[#111]">Verified Vendors</div>
                  <div className="text-xs text-gray-500 mt-0.5">Keamanan transaksi terjamin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FEATURE CARDS ROW ─────────────────────────────────────────── */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {FEATURE_CARDS.map(c => (
              <div key={c.title} className="bg-[#1e293b] text-white rounded p-4 flex items-start gap-3 cursor-pointer hover:bg-[#334155] transition-colors">
                <span className="text-xl sm:text-2xl flex-shrink-0">{c.icon}</span>
                <div>
                  <div className="font-bold text-xs sm:text-sm">{c.title}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORY CHIPS ─────────────────────────────────────────────── */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
          <div className="flex overflow-x-auto scrollbar-none border border-[#e5e5e5] rounded bg-white">
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
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
          <div style={s.sectionHead}>
            <h2 className="m-0 text-base font-extrabold text-[#111]">
              Rekomendasi Produk
            </h2>
            <span className="text-[#f97316] text-xs font-bold cursor-pointer">
              Lihat Semua →
            </span>
          </div>

          {loading ? (
            <div className="py-[60px] text-center">
              <Loader2 className="animate-spin" size={36} color="#f97316" style={{ margin: "0 auto" }} />
            </div>
          ) : items.length === 0 ? (
            <div className="py-[60px] text-center text-[#999]">
              <Package size={48} style={{ opacity: 0.15, margin: "0 auto 16px" }} />
              <p className="text-sm">Belum ada produk yang tersedia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mt-4">
              {items.map(item => (
                <div
                  key={item.id}
                  style={s.productCard}
                  onClick={() => navigate(`/marketplace/${item.id}`)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.12)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                  className="bg-white border border-[#e5e5e5] rounded cursor-pointer overflow-hidden transition-all duration-150"
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
                <li><a href="https://www.huntr.id/our-company" target="_blank" style={{ fontSize: "12px", color: "#888", textDecoration: "none" }}>Tentang Kami</a></li>
                <li><a href="https://www.huntr.id/privacy-policy" target="_blank" style={{ fontSize: "12px", color: "#888", textDecoration: "none" }}>Kebijakan Privasi</a></li>
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
