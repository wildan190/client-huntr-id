import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Package, Loader2, ChevronRight, ArrowRight, Truck, ShieldCheck } from "lucide-react";
import { getCatalogues } from "../../lib/api";
import { getAssetUrl } from "../../lib/assets";
import ThemeToggle from "../ThemeToggle";

const CATEGORIES = [
  "All",
  "Hardware",
  "Software",
  "Furniture",
  "Office Supplies",
  "Services",
  "Spareparts",
  "Electronics",
  "Mechanical",
  "Chemicals",
  "Construction",
  "Stationery",
  "Pantry & F&B",
  "Logistics",
  "Marketing",
  "Other"
];

export function GuestMarketplaceView() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchItems(1);
  }, [activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchItems = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await getCatalogues({ 
        search: searchTerm, 
        category: activeCategory === "All" ? undefined : activeCategory,
        page: pageNum
      });
      const data = res.data || res || [];
      if (res && res.data && Array.isArray(res.data)) {
        setItems(res.data);
        setCurrentPage(res.current_page || 1);
        setTotalPages(res.last_page || 1);
      } else {
        setItems(Array.isArray(data) ? data : []);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch guest items", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchItems(newPage);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ui-bg-page-grad)", color: "var(--ui-text-primary)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://app.huntr.id/#organization",
                "name": "Huntr.id",
                "url": "https://app.huntr.id/",
                "logo": "https://app.huntr.id/assets/img/logo/sidebar.png",
                "description": "Enterprise B2B E-Procurement Ecosystem connecting verified vendors and buyers."
              },
              {
                "@type": "WebSite",
                "@id": "https://app.huntr.id/#website",
                "url": "https://app.huntr.id/",
                "name": "Huntr.id",
                "publisher": {
                  "@id": "https://app.huntr.id/#organization"
                }
              }
            ]
          })
        }}
      />
      {/* ── Guest Header ────────────────────────────────────────────────── */}
      <header style={{
        padding: "clamp(12px, 4vw, 20px) clamp(16px, 5vw, 40px)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        borderBottom: "1px solid var(--ui-border)", 
        background: "var(--ui-bg-header)",
        backdropFilter: "blur(20px)", 
        position: "sticky", 
        top: 0, 
        zIndex: 100,
        flexWrap: "wrap",
        gap: "clamp(8px, 2vw, 12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 12px)" }}>
          <img 
            src="/assets/img/logo/sidebar.png" 
            alt="Huntr Logo" 
            style={{ width: "clamp(160px, 40vw, 220px)", height: "clamp(48px, 12vw, 64px)", borderRadius: 0, objectFit: "contain" }} 
          />
        </div>
        <div style={{ display: "flex", gap: "clamp(6px, 1.5vw, 10px)", alignItems: "center" }}>
          {/* Desktop Only Tools */}
          <div className="hidden md:flex items-center gap-[clamp(6px,1.5vw,10px)]">
            {/* Track Order — icon button */}
            <Link to="/track" title="Track Order" style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 10px", borderRadius: 10,
              background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
              color: "var(--ui-text-muted)", textDecoration: "none",
            }}>
              <Truck size={16} color="#f97316" />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1 }}>Track</span>
            </Link>
            {/* Verify Doc — icon button */}
            <Link to="/verify" title="Verify Document" style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 10px", borderRadius: 10,
              background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
              color: "var(--ui-text-muted)", textDecoration: "none",
            }}>
              <ShieldCheck size={16} color="#f59e0b" />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1 }}>Verify</span>
            </Link>
          </div>
          <Link to="/register" style={{
            padding: "clamp(8px, 2vw, 10px) clamp(14px, 3vw, 24px)",
            borderRadius: 12,
            fontSize: "clamp(12px, 2.5vw, 14px)",
            fontWeight: 700,
            background: "linear-gradient(135deg,#f97316,#f59e0b)",
            color: "#fff",
            textDecoration: "none",
            boxShadow: "0 10px 20px rgba(249,115,22,0.2)",
            whiteSpace: "nowrap"
          }}>Get Started</Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: "var(--ui-bg-card)",
              border: "1px solid var(--ui-border)",
              color: "var(--ui-text-primary)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s"
            }}
          >
            ☰
          </button>
        </div>
      </header>

      {/* ── Sidebar Overlay ─────────────────────────────────────────────── */}
      {isSidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            backdropFilter: "blur(4px)"
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "clamp(250px, 80vw, 350px)",
        height: "100vh",
        background: "var(--ui-bg-page)",
        borderLeft: "1px solid var(--ui-border)",
        zIndex: 201,
        transform: isSidebarOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "auto"
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: "clamp(16px, 4vw, 20px)",
          borderBottom: "1px solid var(--ui-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h3 style={{ margin: 0, fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 700 }}>Menu</h3>
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "var(--ui-text-primary)",
              cursor: "pointer",
              fontSize: 24,
              padding: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* Sidebar Content */}
        <div style={{ flex: 1, padding: "clamp(16px, 4vw, 20px)", display: "flex", flexDirection: "column", gap: "clamp(10px, 2vw, 12px)" }}>
          {/* Theme Toggle */}
          <div style={{
            padding: "clamp(12px, 3vw, 16px)",
            borderRadius: 12,
            background: "var(--ui-bg-card)",
            border: "1px solid var(--ui-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "clamp(12px, 2.5vw, 14px)", fontWeight: 600 }}>Theme</span>
            <ThemeToggle />
          </div>

          {/* Quick tools row — icon + caption */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/track" onClick={() => setIsSidebarOpen(false)} style={{
              flex: 1, padding: "14px 10px", borderRadius: 12,
              background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
              color: "var(--ui-text-muted)", textDecoration: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <Truck size={22} color="#f97316" />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em" }}>Track Order</span>
            </Link>
            <Link to="/verify" onClick={() => setIsSidebarOpen(false)} style={{
              flex: 1, padding: "14px 10px", borderRadius: 12,
              background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
              color: "var(--ui-text-muted)", textDecoration: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <ShieldCheck size={22} color="#f59e0b" />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em" }}>Verify Doc</span>
            </Link>
          </div>

          {/* Sign In Link */}
          <Link to="/login" style={{
            padding: "clamp(12px, 3vw, 16px)",
            borderRadius: 12, fontSize: "clamp(12px, 2.5vw, 14px)", fontWeight: 600,
            color: "var(--ui-text-primary)", textDecoration: "none", transition: "all 0.2s",
            background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
            textAlign: "center", cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(249,115,22,0.1)";
            e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--ui-bg-card)";
            e.currentTarget.style.borderColor = "var(--ui-border)";
          }}
          >
            Sign In
          </Link>
        </div>

        {/* Sidebar Footer */}
        <div style={{
          padding: "clamp(16px, 4vw, 20px)",
          borderTop: "1px solid var(--ui-border)",
          fontSize: "clamp(10px, 2vw, 12px)",
          color: "var(--ui-text-muted)",
          textAlign: "center"
        }}>
          <p style={{ margin: 0 }}>Huntr.id © 2026</p>
        </div>
      </div>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section style={{
        padding: "clamp(40px, 10vw, 80px) clamp(16px, 5vw, 40px) clamp(30px, 8vw, 60px)", 
        textAlign: "center", 
        maxWidth: 900, 
        margin: "0 auto",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)",
          width: "clamp(300px, 80vw, 600px)", 
          height: "clamp(200px, 50vw, 400px)", 
          background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)",
          pointerEvents: "none", 
          zIndex: -1
        }} />
        <h1 style={{ 
          fontSize: "clamp(28px, 7vw, 52px)", 
          fontWeight: 900, 
          marginBottom: "clamp(12px, 3vw, 20px)", 
          letterSpacing: "-1.5px", 
          lineHeight: 1.1, 
          color: "var(--ui-text-primary)" 
        }}>
          The Future of <span style={{ color: "#fb923c" }}>B2B Procurement</span>
        </h1>
        <p style={{ 
          fontSize: "clamp(14px, 3.5vw, 18px)", 
          color: "var(--ui-text-secondary)", 
          marginBottom: "clamp(24px, 5vw, 40px)", 
          lineHeight: 1.6 
        }}>
          Connect with verified vendors, streamline your RFQ process, and manage purchase orders in one high-fidelity enterprise ecosystem.
        </p>

        {/* Search Bar */}
        <div style={{ 
          maxWidth: 600, 
          margin: "0 auto", 
          position: "relative",
          background: "var(--ui-bg-card)", 
          border: "1px solid var(--ui-border)",
          borderRadius: 20, 
          padding: 6, 
          display: "flex", 
          gap: 8,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          flexDirection: "column",
        }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={20} color="#f59e0b" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="What are you looking for today?"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: "100%", 
                padding: "clamp(10px, 2vw, 14px) clamp(10px, 2vw, 14px) clamp(10px, 2vw, 14px) 50px", 
                borderRadius: 16,
                background: "transparent", 
                border: "none", 
                color: "var(--ui-text-primary)", 
                outline: "none", 
                fontSize: "clamp(12px, 2.5vw, 16px)",
              }}
            />
          </div>
          <button style={{
            padding: "clamp(8px, 2vw, 12px) clamp(12px, 3vw, 24px)", 
            borderRadius: 14, 
            background: "#f59e0b", 
            color: "#fff",
            border: "none", 
            fontWeight: 700, 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: 8,
            fontSize: "clamp(12px, 2.5vw, 14px)",
            whiteSpace: "nowrap"
          }}>
            Search <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Content Section ─────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(20px, 5vw, 40px) clamp(16px, 5vw, 40px)", maxWidth: 1200, margin: "0 auto" }}>
        {/* Categories */}
        <div style={{ display: "flex", gap: "clamp(6px, 2vw, 10px)", overflowX: "auto", paddingBottom: 24, scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "clamp(8px, 1.5vw, 10px) clamp(12px, 2.5vw, 20px)", 
                borderRadius: 12, 
                fontSize: "clamp(12px, 2vw, 14px)", 
                fontWeight: 600,
                background: activeCategory === cat ? "rgba(249,115,22,0.15)" : "var(--ui-bg-card)",
                border: "1px solid",
                borderColor: activeCategory === cat ? "rgba(249,115,22,0.3)" : "var(--ui-border)",
                color: activeCategory === cat ? "#fb923c" : "var(--ui-text-secondary)",
                cursor: "pointer", 
                whiteSpace: "nowrap", 
                transition: "all 0.2s"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        {loading ? (
          <div style={{ padding: "clamp(40px, 10vw, 80px) 0", textAlign: "center" }}>
            <Loader2 className="animate-spin" size={40} color="#f59e0b" style={{ margin: "0 auto" }} />
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: "clamp(40px, 10vw, 80px) 0", textAlign: "center", color: "var(--ui-text-muted)" }}>
            <Package size={64} style={{ opacity: 0.1, margin: "0 auto 20px" }} />
            <p style={{ fontSize: "clamp(14px, 3vw, 18px)" }}>No items found matching your search.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(160px, 40vw, 280px), 1fr))", 
            gap: "clamp(12px, 3vw, 24px)" 
          }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: "var(--ui-bg-card)", 
                borderRadius: 24, 
                border: "1px solid var(--ui-border)",
                padding: "clamp(12px, 3vw, 20px)", 
                display: "flex", 
                flexDirection: "column", 
                gap: "clamp(8px, 2vw, 16px)", 
                transition: "all 0.3s",
                position: "relative", 
                overflow: "hidden", 
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.background = "var(--ui-bg-card-hover)";
                e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "var(--ui-bg-card)";
                e.currentTarget.style.borderColor = "var(--ui-border)";
              }}
              onClick={() => navigate(`/marketplace/${item.id}`)}
              >
                <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 16, background: "var(--ui-bg-input)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.image_path ? (
                    <img
                      src={getAssetUrl(item.image_path)}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Package size={48} color="rgba(249,115,22,0.15)" />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{item.category || "General"}</div>
                  <h3 style={{
                    fontSize: "clamp(14px, 3vw, 18px)",
                    fontWeight: 700,
                    color: "var(--ui-text-primary)",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.35,
                    minHeight: "2.7em",
                  }}>{item.name}</h3>
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fb923c" }}>
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Smart Pagination */}
        {totalPages > 1 && (() => {
          // Build page list with ellipsis
          const delta = 1;
          const pages: (number | '...')[] = [];
          const left = Math.max(2, currentPage - delta);
          const right = Math.min(totalPages - 1, currentPage + delta);

          pages.push(1);
          if (left > 2) pages.push('...');
          for (let i = left; i <= right; i++) pages.push(i);
          if (right < totalPages - 1) pages.push('...');
          if (totalPages > 1) pages.push(totalPages);

          return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 40 }}>
              {/* Prev */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "9px 16px", borderRadius: 12,
                  border: "1px solid var(--ui-border)",
                  background: currentPage === 1 ? "transparent" : "var(--ui-bg-card)",
                  color: currentPage === 1 ? "var(--ui-text-muted)" : "var(--ui-text-primary)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 700, transition: "all 0.2s",
                  opacity: currentPage === 1 ? 0.4 : 1,
                }}
              >
                ← Prev
              </button>

              {/* Page numbers */}
              {pages.map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ width: 36, textAlign: "center", color: "var(--ui-text-muted)", fontSize: 13, fontWeight: 700 }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    style={{
                      width: 38, height: 38, borderRadius: 12,
                      border: currentPage === p ? "none" : "1px solid var(--ui-border)",
                      background: currentPage === p
                        ? "linear-gradient(135deg,#f97316,#f59e0b)"
                        : "var(--ui-bg-card)",
                      color: currentPage === p ? "#fff" : "var(--ui-text-primary)",
                      cursor: "pointer", fontSize: 13, fontWeight: 800,
                      boxShadow: currentPage === p ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "9px 16px", borderRadius: 12,
                  border: "1px solid var(--ui-border)",
                  background: currentPage === totalPages ? "transparent" : "var(--ui-bg-card)",
                  color: currentPage === totalPages ? "var(--ui-text-muted)" : "var(--ui-text-primary)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 700, transition: "all 0.2s",
                  opacity: currentPage === totalPages ? 0.4 : 1,
                }}
              >
                Next →
              </button>
            </div>
          );
        })()}
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ 
        padding: "clamp(40px, 8vw, 80px) clamp(16px, 5vw, 40px) clamp(20px, 5vw, 40px)", 
        marginTop: "clamp(40px, 10vw, 80px)", 
        borderTop: "1px solid var(--ui-border)", 
        background: "var(--ui-bg-page)" 
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(150px, 40vw, 200px), 1fr))", gap: "clamp(20px, 5vw, 40px)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <img
                src="/assets/img/logo/sidebar.png"
                alt="Huntr Logo"
                style={{ width: 120, height: 32, borderRadius: 0, objectFit: "contain" }}
              />
            </div>
            <p style={{ fontSize: "clamp(12px, 2vw, 13px)", color: "var(--ui-text-muted)", lineHeight: 1.6 }}>The most advanced e-procurement platform for enterprise business connectivity.</p>
          </div>
          <div>
            <h4 style={{ fontSize: "clamp(12px, 2.5vw, 14px)", fontWeight: 700, color: "var(--ui-text-primary)", marginBottom: 20 }}>Platform</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li><Link to="/marketplace" style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--ui-text-muted)", textDecoration: "none" }}>Marketplace</Link></li>
              <li><Link to="/register" style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--ui-text-muted)", textDecoration: "none" }}>Vendor Registration</Link></li>
              <li><Link to="/login" style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--ui-text-muted)", textDecoration: "none" }}>Buyer Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "clamp(12px, 2.5vw, 14px)", fontWeight: 700, color: "var(--ui-text-primary)", marginBottom: 20 }}>Tools</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li>
                <Link to="/track" style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--ui-text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  <Truck size={12} color="#f97316" /> Track Order
                </Link>
              </li>
              <li>
                <Link to="/verify" style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--ui-text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck size={12} color="#f59e0b" /> Verify Document
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "clamp(12px, 2.5vw, 14px)", fontWeight: 700, color: "var(--ui-text-primary)", marginBottom: 20 }}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li><a href="#" style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--ui-text-muted)", textDecoration: "none" }}>About Us</a></li>
              <li><a href="#" style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--ui-text-muted)", textDecoration: "none" }}>Privacy Policy</a></li>
              <li><a href="#" style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "var(--ui-text-muted)", textDecoration: "none" }}>Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "clamp(30px, 5vw, 60px)", fontSize: "clamp(10px, 2vw, 12px)", color: "var(--ui-text-muted)" }}>
          © 2026 Huntr.id - Enterprise Procurement Ecosystem. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
