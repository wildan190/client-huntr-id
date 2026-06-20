import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Layout from "../components/Layout";
import ThemeToggle from "../components/ThemeToggle";
import CurrencyWidget from "../components/CurrencyWidget";
import WeatherWidget from "../components/WeatherWidget";

const chartTooltipStyle = (accent?: string) => ({
  contentStyle: {
    backgroundColor: "var(--ui-chart-tooltip-bg)",
    border: accent ?? "1px solid var(--ui-chart-tooltip-border)",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
  itemStyle: { color: "var(--ui-chart-tooltip-text)" },
  labelStyle: { color: "var(--ui-chart-legend)" },
});
import { apiGet, getCatalogues } from "../lib/api";
import { getAssetUrl } from "../lib/assets";
import { 
  PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  LineChart as RechartsLineChart, Line, AreaChart, Area
} from "recharts";
import { 
  Activity, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Database, 
  FileText, 
  HelpCircle, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  TrendingUp,
  Search,
  Filter,
  Package,
  Loader2,
  ChevronRight,
  ArrowRightCircle,
  ShoppingBag,
  PieChart,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Truck,
  ShieldCheck,
  PackageCheck,
  Inbox,
  Timer,
  Users,
  LineChart,
  PiggyBank,
  ArrowDownCircle,
  Building2,
  ClipboardList,
  Trophy,
} from "lucide-react";

// Mock initial data matching the workflow
const INITIAL_CATALOGUE = [
  { id: "1", item_code: "CAT-001", name: "Premium Laptop Pro", category: "Hardware", uom: "unit", price: 15000000 },
  { id: "2", item_code: "CAT-002", name: "Ergonomic Office Chair", category: "Furniture", uom: "pcs", price: 2500000 },
  { id: "3", item_code: "CAT-003", name: "4K IPS Design Monitor", category: "Hardware", uom: "unit", price: 6000000 },
];

const CATEGORIES = ["All", "Hardware", "Furniture", "Software", "Office Supplies", "Services"];

const VENDOR_DASHBOARD_HINTS = [
  "Monitoring tender aktif",
  "Draft proposal tersimpan",
  "Pengiriman submisi terdekat",
];

function getRfqDeadline(rfq: any): number | null {
  const base = rfq?.approved_at || rfq?.created_at;
  if (!base) return null;
  const durationDays = Number(rfq?.duration_days || 7);
  const start = new Date(base);
  if (Number.isNaN(start.getTime())) return null;
  return start.getTime() + (durationDays * 24 * 60 * 60 * 1000);
}

function formatCountdown(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "00j 00m 00d";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) {
    return `${days}h ${String(hours).padStart(2, "0")}j ${String(minutes).padStart(2, "0")}m`;
  }
  return `${String(hours).padStart(2, "0")}j ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}d`;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    const companySession = localStorage.getItem("active_company");
    if (userSession) setUser(JSON.parse(userSession));
    if (companySession) setActiveCompany(JSON.parse(companySession));
    setLoading(false);
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  if (user && activeCompany) {
    if (activeCompany.type === "buyer") {
      return <BuyerDashboard user={user} activeCompany={activeCompany} />;
    }
    return <VendorEbiddingDashboard user={user} activeCompany={activeCompany} />;
  }

  return <GuestMarketplaceView />;
}

function GuestMarketplaceView() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await getCatalogues({ 
        search: searchTerm, 
        category: activeCategory === "All" ? undefined : activeCategory 
      });
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch guest items", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ui-bg-page-grad)", color: "var(--ui-text-primary)" }}>
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
            src="/assets/img/logo/emblem.jpg" 
            alt="Huntr Logo" 
            style={{ width: "clamp(32px, 8vw, 40px)", height: "clamp(32px, 8vw, 40px)", borderRadius: 10, objectFit: "cover" }} 
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: "clamp(14px, 4vw, 16px)", letterSpacing: "-0.5px", color: "var(--ui-text-logo)" }}>Huntr.id</div>
            <div style={{ fontSize: "clamp(7px, 2vw, 9px)", color: "#f59e0b", letterSpacing: "0.1em", fontWeight: 700 }}>E-PROCUREMENT</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "clamp(8px, 2vw, 12px)", alignItems: "center" }}>
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
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--ui-bg-card)",
              border: "1px solid var(--ui-border)",
              color: "var(--ui-text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
        <div style={{ flex: 1, padding: "clamp(16px, 4vw, 20px)", display: "flex", flexDirection: "column", gap: "clamp(12px, 3vw, 16px)" }}>
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

          {/* Sign In Link */}
          <Link to="/login" style={{
            padding: "clamp(12px, 3vw, 16px)",
            borderRadius: 12,
            fontSize: "clamp(12px, 2.5vw, 14px)",
            fontWeight: 600,
            color: "var(--ui-text-primary)",
            textDecoration: "none",
            transition: "all 0.2s",
            background: "var(--ui-bg-card)",
            border: "1px solid var(--ui-border)",
            textAlign: "center",
            cursor: "pointer"
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
                src="/assets/img/logo/emblem.jpg" 
                alt="Huntr Logo" 
                style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} 
              />
              <span style={{ fontWeight: 800, fontSize: "clamp(14px, 3vw, 16px)", color: "var(--ui-text-logo)" }}>Huntr.id</span>
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

function VendorEbiddingDashboard({ user, activeCompany }: { user: any, activeCompany: any }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openRfqs, setOpenRfqs] = useState<any[]>([]);
  const [vendorProposals, setVendorProposals] = useState<any[]>([]);
  const [vendorRankings, setVendorRankings] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeCompany?.id) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [rfqRes, proposalRes, rankRes] = await Promise.all([
          apiGet("/api/rfqs?status=active"),
          apiGet(`/api/proposals?company_id=${activeCompany.id}`),
          apiGet(`/api/proposals/my-rank?company_id=${activeCompany.id}`),
        ]);

        if (cancelled) return;

        setOpenRfqs(Array.isArray(rfqRes) ? rfqRes : rfqRes.data || []);
        setVendorProposals(Array.isArray(proposalRes) ? proposalRes : proposalRes.data || []);
        setVendorRankings(Array.isArray(rankRes) ? rankRes : rankRes.rankings || []);
      } catch (err) {
        console.error("Failed to load vendor dashboard", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeCompany?.id]);

  const proposalMap = new Map(vendorProposals.map((proposal: any) => [String(proposal.rfq_id), proposal]));
  const rankingMap = new Map(vendorRankings.map((ranking: any) => [String(ranking.rfq_id || ranking.proposal?.rfq_id), ranking]));
  const participatedCount = new Set(vendorRankings.map((ranking: any) => String(ranking.rfq_id || ranking.proposal?.rfq_id))).size || new Set(vendorProposals.map((proposal: any) => String(proposal.rfq_id))).size;
  const wins = vendorRankings.filter((ranking: any) => ranking.is_winner || ["awarded", "approved"].includes(String(ranking.proposal?.winner_status || ranking.winner_status || ""))).length;
  const winRate = participatedCount > 0 ? Math.round((wins / participatedCount) * 100) : 0;

  const deadlines = openRfqs
    .map((rfq: any) => getRfqDeadline(rfq))
    .filter((value: number | null): value is number => typeof value === "number")
    .sort((a: number, b: number) => a - b);
  const nearestDeadline = deadlines[0] || null;
  const countdown = nearestDeadline ? formatCountdown(nearestDeadline - now) : "Belum ada tender aktif";

  const tableRows = [...openRfqs]
    .sort((a: any, b: any) => (getRfqDeadline(a) || Number.MAX_SAFE_INTEGER) - (getRfqDeadline(b) || Number.MAX_SAFE_INTEGER))
    .slice(0, 12)
    .map((rfq: any) => {
      const proposal = proposalMap.get(String(rfq.id));
      const ranking = rankingMap.get(String(rfq.id));
      const submittedAt = proposal?.created_at ? new Date(proposal.created_at).toLocaleDateString("id-ID") : "-";
      const deadline = getRfqDeadline(rfq);
      const deadlineText = deadline ? new Date(deadline).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";
      const status = proposal
        ? (["awarded", "approved"].includes(String(proposal.winner_status)) ? "Awarded" : "Submitted")
        : "Draft";

      return {
        rfq,
        proposal,
        ranking,
        submittedAt,
        deadlineText,
        status,
      };
    });

  return (
    <Layout title="Vendor E-Bidding Dashboard" subtitle="Pantau tender aktif, draft proposal, dan submisi yang sedang berjalan.">
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32, boxSizing: "border-box" }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "stretch" }}>
          <WeatherWidget embedded />
          <CurrencyWidget embedded />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <SummaryWidget
            label="Total Tender Diikuti"
            value={loading ? "..." : String(participatedCount)}
            hint="Tender unik yang sudah pernah Anda submit"
            icon={ClipboardList}
          />
          <SummaryWidget
            label="Menang Tender"
            value={loading ? "..." : `${wins}`}
            hint={`${winRate}% win rate dari tender yang diikuti`}
            icon={Trophy}
            accent="green"
          />
          <SummaryWidget
            label="Sisa Waktu Submisi Terdekat"
            value={loading ? "..." : countdown}
            hint="Deadline RFQ aktif paling dekat"
            icon={Timer}
            accent="blue"
          />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 20, alignItems: "start" }}>
          <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: "1px solid var(--ui-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Modul E-Bidding</div>
                  <h2 style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 900, color: "var(--ui-text-primary)" }}>Draft dan Pengajuan Proposal</h2>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {VENDOR_DASHBOARD_HINTS.map((item) => (
                    <span key={item} style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(249,115,22,0.1)", color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ui-text-muted)" }}>
                    <th style={{ padding: "14px 20px", borderBottom: "1px solid var(--ui-border)" }}>Tender</th>
                    <th style={{ padding: "14px 20px", borderBottom: "1px solid var(--ui-border)" }}>Buyer</th>
                    <th style={{ padding: "14px 20px", borderBottom: "1px solid var(--ui-border)" }}>Status</th>
                    <th style={{ padding: "14px 20px", borderBottom: "1px solid var(--ui-border)" }}>Submisi</th>
                    <th style={{ padding: "14px 20px", borderBottom: "1px solid var(--ui-border)" }}>Deadline</th>
                    <th style={{ padding: "14px 20px", borderBottom: "1px solid var(--ui-border)" }} />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--ui-text-muted)" }}>Memuat tender aktif...</td>
                    </tr>
                  ) : tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--ui-text-muted)" }}>Belum ada tender aktif yang bisa dipantau.</td>
                    </tr>
                  ) : (
                    tableRows.map(({ rfq, proposal, ranking, submittedAt, deadlineText, status }) => (
                      <tr key={rfq.id} style={{ borderBottom: "1px solid var(--ui-border-subtle)" }}>
                        <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", lineHeight: 1.4 }}>{rfq.title}</div>
                          <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>{rfq.items?.length || 0} item</div>
                        </td>
                        <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 700, color: "var(--ui-text-primary)" }}>{rfq.company?.name || "Buyer"}</div>
                          <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>RFQ {String(rfq.id).slice(0, 8)}</div>
                        </td>
                        <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                          <span style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 800,
                            background: status === "Draft" ? "rgba(59,130,246,0.12)" : status === "Submitted" ? "rgba(249,115,22,0.12)" : "rgba(34,197,94,0.12)",
                            color: status === "Draft" ? "#60a5fa" : status === "Submitted" ? "#f59e0b" : "#34d399",
                          }}>
                            {status}
                          </span>
                          <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 8 }}>
                            {proposal ? `Winner status: ${proposal.winner_status || "submitted"}` : "Belum ada proposal dikirim"}
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 700, color: "var(--ui-text-primary)" }}>{proposal ? `Rp ${Number(proposal.price_offer || 0).toLocaleString("id-ID")}` : "Draft"}</div>
                          <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>
                            {ranking ? `Rank #${ranking.rank}` : submittedAt === "-" ? "Belum disubmit" : `Dikirim ${submittedAt}`}
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 700, color: "var(--ui-text-primary)" }}>{deadlineText}</div>
                          <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>
                            {proposal ? `Submitted ${submittedAt}` : "Siap disiapkan sebagai draft"}
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", verticalAlign: "top", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => navigate("/proposals", { state: { rfqId: rfq.id } })}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 10,
                              border: "1px solid rgba(249,115,22,0.22)",
                              background: "rgba(249,115,22,0.08)",
                              color: "#f59e0b",
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            {proposal ? "Lihat Proposal" : "Buka Tender"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Company</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6, color: "var(--ui-text-primary)" }}>{activeCompany?.name}</div>
              <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 6 }}>{user?.name}</div>
            </div>

            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Quick Stats</div>
              <MiniStat label="Open Tenders" value={String(openRfqs.length)} />
              <MiniStat label="Proposal Drafts" value={String(Math.max(openRfqs.length - vendorProposals.length, 0))} />
              <MiniStat label="Submitted Proposals" value={String(vendorProposals.length)} />
            </div>

            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Submission Focus</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Review item scope and deadline first",
                  "Keep draft pricing ready before closing time",
                  "Open proposal detail from the table when the tender is live",
                ].map((item) => (
                  <div key={item} style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ui-text-secondary)", padding: "10px 12px", borderRadius: 12, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.08)" }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function SummaryWidget({
  label,
  value,
  hint,
  icon: Icon,
  accent = "orange",
}: {
  label: string;
  value: string;
  hint: string;
  icon: any;
  accent?: "orange" | "green" | "blue";
}) {
  const accentStyles = {
    orange: { bg: "rgba(249,115,22,0.1)", color: "#f59e0b" },
    green: { bg: "rgba(34,197,94,0.1)", color: "#34d399" },
    blue: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa" },
  }[accent];

  return (
    <div style={{
      background: "var(--ui-bg-card)",
      border: "1px solid var(--ui-border)",
      borderRadius: 20,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      minHeight: 150,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: accentStyles.bg, color: accentStyles.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1, color: "var(--ui-text-primary)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--ui-text-secondary)", lineHeight: 1.5 }}>{hint}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--ui-border-subtle)" }}>
      <div style={{ fontSize: 12, color: "var(--ui-text-muted)" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-primary)" }}>{value}</div>
    </div>
  );
}

function DashboardSimulation({ user, activeCompany }: { user: any, activeCompany: any }) {
  const [activeStep, setActiveStep] = useState(1);
  const [rfqTitle, setRfqTitle] = useState("Enterprise Workplace Hardware Provisioning");
  const [rfqDesc, setRfqDesc] = useState("Acquisition of premium development laptops and monitors for new engineers.");
  const [rfqItems, setRfqItems] = useState([
    { catalogue_id: 1, qty: 5, expected_date: "2026-06-15" },
    { catalogue_id: 3, qty: 3, expected_date: "2026-06-15" }
  ]);
  const [proposals, setProposals] = useState([
    { id: 1, company: "IndoTech Solutions", price_offer: 87000000, delivery_days: 5, warranty_months: 24, score: 0.92, status: "submitted" },
    { id: 2, company: "Nusantara Digital", price_offer: 93000000, delivery_days: 3, warranty_months: 36, score: 0.95, status: "submitted" },
    { id: 3, company: "Global Globalindo", price_offer: 82000000, delivery_days: 10, warranty_months: 12, score: 0.74, status: "submitted" }
  ]);
  const [poStatus, setPoStatus] = useState("draft");
  const [deliveryStatus, setDeliveryStatus] = useState("idle");
  const [goodsReceipt, setGoodsReceipt] = useState<any>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "System initialized. Database loaded successfully.", type: "info", time: "Just now" },
    { id: 2, text: "Verification module loaded for company registrations.", type: "success", time: "2 mins ago" }
  ]);

  const addNotification = (text: string, type: "success" | "info" | "warning") => {
    setNotifications(prev => [{ id: Date.now(), text, type, time: "Just now" }, ...prev]);
  };

  const advanceStep = () => {
    if (activeStep === 1) {
      addNotification(`RFQ "${rfqTitle}" has been created as DRAFT.`, "info");
      setActiveStep(2);
    } else if (activeStep === 2) {
      addNotification("RFQ approved by Purchasing Manager. Status: ACTIVE.", "success");
      setActiveStep(3);
    } else if (activeStep === 3) {
      addNotification("Three vendors successfully submitted competitive proposals.", "info");
      setActiveStep(4);
    } else if (activeStep === 4) {
      addNotification("SAW Scoring & Ranking calculations finished. Winner identified!", "success");
      setActiveStep(5);
    } else if (activeStep === 5) {
      addNotification("Purchase Order (PO-2026-0091) generated and released to Nusantara Digital.", "success");
      setPoStatus("pending_confirmation");
      setActiveStep(6);
    } else if (activeStep === 6) {
      addNotification("Vendor confirmed PO. Proforma Invoice generated. Status: PAID via Midtrans.", "success");
      setPoStatus("paid");
      setActiveStep(7);
    } else if (activeStep === 7) {
      addNotification("Vendor released Delivery Order DO-9811. Goods are now in transit.", "info");
      setDeliveryStatus("shipping");
      setActiveStep(8);
    } else if (activeStep === 8) {
      addNotification("Goods received. Handover document verified. final Invoice generated.", "success");
      setDeliveryStatus("received");
      setGoodsReceipt({
        id: "GR-00912",
        received_qty: 8,
        handover_document_path: "handover_docs/custom_signature.pdf",
        status: "completed"
      });
      setActiveStep(9);
    }
  };

  const resetWorkflow = () => {
    setActiveStep(1);
    setPoStatus("draft");
    setDeliveryStatus("idle");
    setGoodsReceipt(null);
    addNotification("Workflow simulator reset.", "warning");
  };

  return (
    <Layout title="B2B E-Procurement Dashboard" subtitle="Enterprise Sequential Procurement Lifecycle & Multi-agent Simulation.">
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ width: "100%", boxSizing: "border-box" }}>
        
        {/* Left column: Active Procurement & Step Simulator */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden" style={{ minHeight: 400 }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl -z-10" />
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">Step {activeStep} of 9</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium flex items-center gap-1.5">
                  <Activity size={12} className="animate-pulse" />
                  {activeStep === 9 ? "Workflow Completed" : "Simulation In Progress"}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Sequential Procurement Lifecycle</h2>
              <p className="text-gray-400 text-sm mb-6">
                Step through a full high-fidelity enterprise B2B procurement cycle. This follows the exact domain services and actions implemented on the backend.
              </p>

              {/* Progress Steps Visualizer */}
              <div className="grid grid-cols-3 md:grid-cols-9 gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(step => (
                  <div
                    key={step}
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      activeStep >= step ? "bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]" : "bg-gray-800"
                    }`}
                  />
                ))}
              </div>

              {/* Dynamic step detail card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
                {activeStep === 1 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><FileText size={18} className="text-orange-400" /> Step 1: Draft RFQ Creation</h3>
                    <p className="text-gray-300 text-sm mb-4">Buyer creates a Request for Quotation (RFQ) detailing catalog items, descriptions, and expected delivery dates.</p>
                    <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-lg text-xs">
                      <p><strong>Title:</strong> {rfqTitle}</p>
                      <p><strong>Description:</strong> {rfqDesc}</p>
                      <p><strong>Items:</strong> {rfqItems.length} categories requested</p>
                    </div>
                  </div>
                )}
                {activeStep === 2 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Clock size={18} className="text-yellow-400" /> Step 2: RFQ Manager Approval</h3>
                    <p className="text-gray-300 text-sm mb-4">The Purchasing Manager reviews the RFQ, verifies department budgets, and transitions its status to ACTIVE to allow bidding.</p>
                    <div className="flex items-center gap-3 text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 p-3 rounded-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                      Pending review by Finance Manager (Budget Code: DEPT-DEV-2026)
                    </div>
                  </div>
                )}
                {activeStep === 3 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><FileText size={18} className="text-amber-400" /> Step 3: Vendor Proposal Submission</h3>
                    <p className="text-gray-300 text-sm mb-4">Registered vendors analyze requirements and submit binding price offers, delivery dates, and warranty guarantees.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {proposals.map(p => (
                        <div key={p.id} className="bg-black/30 p-3 rounded-lg text-xs border border-white/5">
                          <p className="font-semibold text-white mb-1">{p.company}</p>
                          <p className="text-gray-400">Offer: Rp {(p.price_offer / 1000000).toFixed(0)}M</p>
                          <p className="text-gray-400">Delivery: {p.delivery_days} days</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeStep === 4 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><TrendingUp size={18} className="text-green-400" /> Step 4: SAW Scoring & Analytical Decision</h3>
                    <p className="text-gray-300 text-sm mb-4">The system utilizes the Simple Additive Weighting (SAW) algorithm to score proposals dynamically based on criteria weights (Price: 50%, Timeline: 30%, Warranty: 20%).</p>
                    <div className="flex flex-col gap-2">
                      {proposals.sort((a,b) => b.score - a.score).map((p, idx) => (
                        <div key={p.id} className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg text-xs">
                          <span className="font-medium text-white">{idx+1}. {p.company}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-orange-400 font-bold">Score: {p.score}</span>
                            {idx === 0 && <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/20 font-bold">WINNER</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeStep === 5 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><CheckCircle size={18} className="text-orange-400" /> Step 5: Awarding Vendor & PO Generation</h3>
                    <p className="text-gray-300 text-sm mb-4">The winning proposal is officially accepted, transitioning others to rejected. A formal Purchase Order (PO) is automatically drafted.</p>
                    <div className="bg-black/30 p-3 rounded-lg text-xs border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">Purchase Order: PO-2026-0091</p>
                        <p className="text-gray-400">Issued to: Nusantara Digital</p>
                      </div>
                      <span className="bg-yellow-500/20 text-yellow-300 px-2.5 py-1 rounded-full border border-yellow-500/30 font-bold uppercase tracking-wider text-[10px]">
                        Pending Manager Approval
                      </span>
                    </div>
                  </div>
                )}
                {activeStep === 6 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><CheckCircle size={18} className="text-green-400" /> Step 6: PO Confirmation & Proforma Invoice</h3>
                    <p className="text-gray-300 text-sm mb-4">Vendor confirms PO, releasing the Proforma Invoice. Buyer processes upfront payment seamlessly via integrated payment gateway.</p>
                    <div className="bg-green-500/10 border border-green-500/20 text-green-300 p-3 rounded-lg text-xs flex justify-between items-center">
                      <p><strong>Invoice:</strong> INV-PF-9801 (Proforma) - PAID via Midtrans</p>
                      <span className="bg-green-500 text-black px-2 py-0.5 rounded font-bold uppercase text-[9px] border-none">PAID</span>
                    </div>
                  </div>
                )}
                {activeStep === 7 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><ArrowRight size={18} className="text-orange-400" /> Step 7: Delivery Order released</h3>
                    <p className="text-gray-300 text-sm mb-4">Vendor ships the items and releases the Delivery Order (DO) with a trackable shipment number.</p>
                    <div className="bg-black/20 p-3 rounded-lg text-xs border border-white/5">
                      <p><strong>DO Number:</strong> DO-9811</p>
                      <p><strong>Shipment Status:</strong> <span className="text-orange-400 font-bold">SHIPPED</span></p>
                    </div>
                  </div>
                )}
                {activeStep === 8 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><CheckCircle size={18} className="text-orange-400" /> Step 8: Confirm Delivery & Goods Receipt</h3>
                    <p className="text-gray-300 text-sm mb-4">Buyer checks physical delivery, signs the handover document, and submits the Goods Receipt. Final Invoice is triggered automatically.</p>
                    <div className="bg-black/20 p-3 rounded-lg text-xs border border-white/5 flex justify-between items-center">
                      <div>
                        <p><strong>Goods Receipt:</strong> GR-00912</p>
                        <p className="text-gray-400">Handover Document: custom_signature.pdf</p>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase text-[9px] border border-green-500/30">RECEIVED</span>
                    </div>
                  </div>
                )}
                {activeStep === 9 && (
                  <div className="text-center py-4">
                    <span className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg shadow-green-500/20">
                      ✓
                    </span>
                    <h3 className="text-lg font-bold text-white mb-1">Procurement Cycle Complete!</h3>
                    <p className="text-gray-400 text-xs">All actions resolved via enterprise service domains flawlessly.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Control Panel */}
            <div className="flex gap-4">
              {activeStep < 9 ? (
                <button
                  onClick={advanceStep}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <Play size={16} /> Advance to Next Action
                </button>
              ) : (
                <button
                  onClick={resetWorkflow}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Restart Simulation
                </button>
              )}
            </div>
          </div>

          {/* Historical catalog reference */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Department Reference Catalogues
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-2.5">Code</th>
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">UOM</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {INITIAL_CATALOGUE.map(item => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 font-semibold text-orange-400">{item.item_code}</td>
                      <td className="py-3 text-white font-medium">{item.name}</td>
                      <td className="py-3 text-gray-400">{item.category}</td>
                      <td className="py-3 text-gray-400">{item.uom}</td>
                      <td className="py-3 text-right text-white">Rp {item.price.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right column: Notification Log & SAW weight configurations */}
        <section className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-400">
              <Database size={18} /> System Event Log
            </h3>
            <div className="flex flex-col gap-3">
              {notifications.map(n => (
                <div key={n.id} className="bg-black/20 p-3 rounded-lg border-l-2 border-orange-500 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-orange-400">{n.type}</span>
                    <span className="text-[10px] text-gray-500">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-300">{n.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-400">
              <ShieldAlert size={18} /> Security & Audits
            </h3>
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Encryption Active</p>
                  <p className="text-[10px] text-gray-500">AES-256 for all PO documents</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">OTP Verification</p>
                  <p className="text-[10px] text-gray-500">MANDATORY for new vendors</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}


function PageSkeleton() {
  return (
    <div style={{ padding: "40px", width: "100%", maxWidth: 1400, margin: "0 auto", height: "100vh", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header Skeleton */}
        <div>
          <div style={{ width: "200px", height: "32px", background: "var(--ui-bg-card)", borderRadius: "8px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          <div style={{ width: "400px", height: "16px", background: "var(--ui-bg-card)", borderRadius: "4px", marginTop: "12px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "100ms" }} />
        </div>
        
        {/* Metric Cards Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "16px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: "120px", background: "var(--ui-bg-card)", borderRadius: "16px", border: "1px solid var(--ui-border)", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: `${i * 100}ms` }} />
          ))}
        </div>

        {/* Large Chart Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
          <div style={{ height: "300px", background: "var(--ui-bg-card)", borderRadius: "16px", border: "1px solid var(--ui-border)", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          <div style={{ height: "300px", background: "var(--ui-bg-card)", borderRadius: "16px", border: "1px solid var(--ui-border)", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "200ms" }} />
        </div>
      </div>
    </div>
  );
}

function BuyerDashboard({ user, activeCompany }: { user: any, activeCompany: any }) {
  // Recharts Data
  const spendData = [
    { name: 'IT Equipment', value: 5600000000 },
    { name: 'HR Services', value: 3750000000 },
    { name: 'Production', value: 3150000000 },
  ];
  const COLORS = ['#fb923c', '#fbbf24', '#f87171'];

  const performanceData = [
    { month: 'Jan', otd: 92, fillRate: 95 },
    { month: 'Feb', otd: 94, fillRate: 96 },
    { month: 'Mar', otd: 91, fillRate: 94 },
    { month: 'Apr', otd: 95, fillRate: 98 },
    { month: 'May', otd: 96, fillRate: 99 },
    { month: 'Jun', otd: 94, fillRate: 98.5 },
  ];

  const cycleTimeData = [
    { month: 'Jan', time: 3.2 },
    { month: 'Feb', time: 2.8 },
    { month: 'Mar', time: 2.5 },
    { month: 'Apr', time: 2.1 },
    { month: 'May', time: 1.9 },
    { month: 'Jun', time: 1.8 },
  ];

  const savingsData = [
    { month: 'Jan', savings: 150000000 },
    { month: 'Feb', savings: 320000000 },
    { month: 'Mar', savings: 480000000 },
    { month: 'Apr', savings: 750000000 },
    { month: 'May', savings: 980000000 },
    { month: 'Jun', savings: 1200000000 },
  ];

  const formatRupiah = (value: number | string | null | undefined) => {
    const numeric = Number(value ?? 0);
    return `Rp ${(numeric / 1000000000).toFixed(1)}B`;
  };

  return (
    <Layout title="Procurement Dashboard" subtitle="Overview of your organization's spend, supplier performance, and operational efficiency.">
      <div className="flex flex-col gap-8 pb-10 w-full" style={{ paddingBottom: 40, boxSizing: "border-box" }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "stretch" }}>
          <WeatherWidget embedded />
          <CurrencyWidget embedded />
        </section>
        
        {/* 1. Spend Analysis */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-400">
            <PieChart size={24} /> Analisis Pengeluaran (Spend Analysis)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <div className="glass-panel p-5 lg:col-span-1 border-l-4 border-l-orange-500" style={{ background: "var(--ui-bg-card)", borderTop: "1px solid var(--ui-border)", borderRight: "1px solid var(--ui-border)", borderBottom: "1px solid var(--ui-border)", borderRadius: "0 16px 16px 0" }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">Total Pengeluaran</span>
                <DollarSign size={16} className="text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">Rp 12.5B</div>
              <div className="text-xs text-green-400 flex items-center gap-1 mb-6"><TrendingDown size={12}/> 4.2% vs last month</div>
              
              <div className="flex justify-between items-start mb-2 pt-4 border-t border-white/10">
                <span className="text-xs text-gray-400 font-semibold uppercase">Maverick Spend</span>
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div className="text-xl font-bold text-white">8.5%</div>
              <div className="text-xs text-red-400 flex items-center gap-1">Off-contract purchases</div>
            </div>

            <div className="glass-panel p-5 lg:col-span-2" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Pengeluaran per Departemen</h3>
              <div style={{ height: 250, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={spendData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {spendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--ui-chart-pie-stroke)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatRupiah(Number(value ?? 0)), "Total Spend"]}
                      {...chartTooltipStyle("1px solid rgba(249,115,22,0.35)")}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px", color: "var(--ui-chart-legend)" }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Supplier Performance */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
            <ShieldCheck size={24} /> Kinerja Pemasok (Supplier Performance)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <div className="glass-panel p-5 lg:col-span-2" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Delivery vs Fill Rate (6 Bulan)</h3>
              <div style={{ height: 250, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-chart-grid)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                    <Tooltip {...chartTooltipStyle("1px solid rgba(34,197,94,0.35)")} />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "var(--ui-chart-legend)" }} />
                    <Bar dataKey="otd" name="On-Time Delivery (%)" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fillRate" name="Fill Rate (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-1">
              <div className="glass-panel p-5 bg-gradient-to-br from-red-500/5 to-transparent h-full flex flex-col justify-center" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Average Defect Rate</span>
                  <AlertTriangle size={16} className="text-red-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">2.1%</div>
                <div className="text-xs text-gray-500 mt-1">Target: &lt;2.0%</div>
                <div className="w-full bg-gray-800 h-1.5 mt-4 rounded-full overflow-hidden"><div className="bg-red-500 h-full" style={{width: '15%'}}></div></div>
              </div>

              <div className="glass-panel p-5 h-full flex flex-col justify-center" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Lead Time Avg</span>
                  <Clock size={16} className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">7.2 Days</div>
                <div className="text-xs text-gray-500 mt-1">From PO Creation to Goods Receipt</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Operational Efficiency */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
            <Activity size={24} /> Efisiensi Operasional (Operational Efficiency)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <div className="glass-panel p-5 lg:col-span-2" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Rata-rata Waktu Siklus PO (Hari)</h3>
              <div style={{ height: 250, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={cycleTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-chart-grid)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
                    <Tooltip {...chartTooltipStyle("1px solid rgba(59,130,246,0.35)")} />
                    <Line type="monotone" dataKey="time" name="Cycle Time (Days)" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-1">
              <div className="glass-panel p-5 h-full flex flex-col justify-center" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-400 font-semibold uppercase">PO vs PR Workload</span>
                  <ClipboardList size={16} className="text-blue-400" />
                </div>
                <div className="flex justify-between items-center text-sm font-medium mt-3">
                  <span className="text-gray-400">Active PO (In-Transit):</span> <span className="text-orange-400">8</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium mt-2">
                  <span className="text-gray-400">Unprocessed PRs:</span> <span className="text-white">24</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium mt-2 pt-2 border-t border-white/10">
                  <span className="text-gray-400">Average POs/Staff/Mo:</span> <span className="text-pink-400 font-bold">45</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 4. Financial & Cost Management */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
            <LineChart size={24} /> Keuangan & Penghematan (Financial)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <div className="glass-panel p-5 lg:col-span-2" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16 }}>
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Kumulatif Penghematan Cost (YTD)</h3>
              <div style={{ height: 250, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={savingsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-chart-grid)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--ui-chart-axis)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatRupiah} />
                    <Tooltip 
                      formatter={(value) => [formatRupiah(Number(value ?? 0)), "Savings"]}
                      {...chartTooltipStyle("1px solid rgba(245,158,11,0.35)")}
                    />
                    <Area type="monotone" dataKey="savings" name="Cost Savings" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-1">
              <div className="glass-panel p-6 flex flex-col justify-center gap-2 h-full" style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20 }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
                  <ArrowDownCircle size={24} color="#fff" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-semibold uppercase mb-1">Purchase Price Variance (PPV)</div>
                  <div className="text-3xl font-bold text-emerald-400">- Rp 450M</div>
                  <div className="text-xs text-gray-500 mt-2 leading-relaxed">Below budget limit. Favorable variance achieved through bulk volume negotiation.</div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
}
