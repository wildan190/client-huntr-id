import React, { useEffect, useState } from "react";
import {
  Building2, ShieldCheck, LogOut, CheckCircle2, XCircle,
  Clock, Eye, FileText, ChevronDown, ChevronUp, Search,
  Loader2, AlertCircle, Users, TrendingUp, X, ExternalLink,
} from "lucide-react";
import { adminLogin, adminGetCompanies, adminAuditCompany } from "../lib/api";

const BASE_URL_IMAGE = import.meta.env.VITE_BASE_URL_IMAGE || `${import.meta.env.VITE_API_URL}/storage`;

/* ─────────────────────────────────────────────────────────────────── */
/*  Types                                                              */
/* ─────────────────────────────────────────────────────────────────── */

interface AdminUser {
  id: number;
  name: string;
  email: string;
}

interface CompanyDoc {
  id: number;
  name: string;
  type: string;
  file_path: string;
  url?: string;
}

interface Company {
  id: number;
  name: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  bank_name?: string;
  bank_account?: string;
  bank_account_name?: string;
  verification_notes?: string;
  created_at: string;
  documents: CompanyDoc[];
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Main component                                                     */
/* ─────────────────────────────────────────────────────────────────── */

export default function AdminPortal() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [view, setView] = useState<"login" | "dashboard">("login");

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_session");
    if (stored) {
      setAdmin(JSON.parse(stored));
      setView("dashboard");
    }
  }, []);

  const handleLogin = (a: AdminUser) => {
    sessionStorage.setItem("admin_session", JSON.stringify(a));
    setAdmin(a);
    setView("dashboard");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_session");
    setAdmin(null);
    setView("login");
  };

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: "var(--ui-bg-page)",
      color: "var(--ui-text-primary)",
      transition: "background 0.3s ease, color 0.3s ease",
    }}>
      {/* Import Inter font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--ui-bg-page); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--ui-scrollbar-track); }
        ::-webkit-scrollbar-thumb { background: var(--ui-scrollbar-thumb); border-radius: 3px; }
        select option { background: var(--ui-bg-card); color: var(--ui-text-primary); }
      `}</style>

      {view === "login" ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <AdminDashboard admin={admin!} onLogout={handleLogout} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Admin Login                                                        */
/* ─────────────────────────────────────────────────────────────────── */

function AdminLogin({ onLogin }: { onLogin: (a: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required."); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminLogin({ email, password });
      onLogin(res.admin);
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
      position: "relative", overflow: "hidden",
      background: "var(--ui-bg-page-grad)",
      transition: "background 0.3s ease",
    }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)" }} />
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "clamp(24px, 5vw, 40px)" }}>
          <div style={{
            width: "clamp(56px, 12vw, 72px)", height: "clamp(56px, 12vw, 72px)", borderRadius: 22, margin: "0 auto 20px",
            background: "linear-gradient(135deg,#f59e0b,#f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 40px rgba(249,115,22,0.35), 0 0 0 1px rgba(249,115,22,0.2)",
          }}>
            <ShieldCheck size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 900, color: "var(--ui-text-primary)", letterSpacing: "-0.5px", marginBottom: 8, transition: "color 0.3s ease" }}>
            Admin Portal
          </h1>
          <p style={{ fontSize: "clamp(12px, 3vw, 14px)", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
            Huntr.id · Global Administration
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--ui-glass-bg)", backdropFilter: "blur(32px)",
            border: "1px solid var(--ui-glass-border)",
            borderRadius: 24,
            boxShadow: "var(--ui-glass-shadow)",
            padding: "clamp(24px, 5vw, 40px) clamp(20px, 4vw, 36px)",
            display: "flex", flexDirection: "column", gap: 20,
            transition: "all 0.3s ease",
          }}
        >
          {/* Accent top bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "24px 24px 0 0",
            background: "linear-gradient(90deg,#f59e0b,#f97316,#ec4899)",
          }} />

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label style={lbl}>Admin Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@huntr.id"
              style={inp}
              autoComplete="email"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label style={lbl}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inp}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 8, padding: "14px 20px", borderRadius: 12,
              background: isLoading ? "rgba(249,115,22,0.5)" : "linear-gradient(135deg,#f59e0b,#f97316)",
              border: "none", color: "#fff", fontSize: 14, fontWeight: 800,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: isLoading ? "none" : "0 8px 28px rgba(249,115,22,0.35)",
              letterSpacing: "-0.2px", transition: "all 0.2s",
              minHeight: 48,
            }}
          >
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Authenticating…</> : <>Sign In as Admin →</>}
          </button>

          <div style={{ textAlign: "center", fontSize: 11, color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
            Restricted access · Huntr.id Global Operations
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Admin Dashboard                                                    */
/* ─────────────────────────────────────────────────────────────────── */

function AdminDashboard({ admin, onLogout }: { admin: AdminUser; onLogout: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [auditModal, setAuditModal] = useState<{ company: Company; action: "approve" | "decline" } | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  const fetchCompanies = async (page = currentPage, s = search, status = filterStatus) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await adminGetCompanies({
        page,
        per_page: perPage,
        search: s,
        status: status,
      });
      setCompanies(res.data || []);
      setCurrentPage(res.current_page || 1);
      setTotalPages(res.last_page || 1);
      setTotal(res.total || 0);
      
      if (res.stats) {
          setStats(res.stats);
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to load companies.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies(1, search, filterStatus);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filterStatus]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchCompanies(newPage);
    }
  };

  const statusMeta = {
    pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)",  icon: <Clock size={13} />,        label: "Pending" },
    approved: { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  icon: <CheckCircle2 size={13} />, label: "Approved" },
    rejected: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", icon: <XCircle size={13} />,      label: "Rejected" },
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Top bar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--ui-bg-header)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--ui-border)",
        padding: "0 clamp(16px, 4vw, 32px)", height: "clamp(56px, 10vw, 64px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.3s ease",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#f59e0b,#f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
            flexShrink: 0,
          }}>
            <ShieldCheck size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "clamp(13px, 2vw, 15px)", color: "var(--ui-text-primary)", letterSpacing: "-0.3px", transition: "color 0.3s ease" }}>
              Huntr.id Admin
            </div>
            <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: "0.1em", fontWeight: 700 }}>
              GLOBAL OPERATIONS
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ textAlign: "right", minWidth: 0 }}>
            <div style={{ fontSize: "clamp(12px, 2vw, 13px)", fontWeight: 700, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{admin.name}</div>
            <div style={{ fontSize: 11, color: "var(--ui-text-muted)", transition: "color 0.3s ease", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin.email}</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 10,
              background: "var(--ui-logout-bg)", border: "1px solid var(--ui-logout-border)",
              color: "var(--ui-logout-text)", fontSize: 12, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s",
              minHeight: 40,
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "clamp(16px, 4vw, 32px)", maxWidth: 1280, margin: "0 auto", width: "100%" }}>

        {/* ── Stats cards ── */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "clamp(12px, 2vw, 16px)", 
          marginBottom: "clamp(20px, 4vw, 32px)" 
        }}>
          {[
            { label: "Total Companies", value: total, icon: <Building2 size={22} />, color: "#f59e0b", gradient: "linear-gradient(135deg,#f59e0b,#ea580c)" },
            { label: "Pending Review",  value: stats.pending,  icon: <Clock size={22} />,       color: "#f59e0b", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
            { label: "Approved",        value: stats.approved, icon: <CheckCircle2 size={22} />, color: "#10b981", gradient: "linear-gradient(135deg,#10b981,#059669)" },
            { label: "Rejected",        value: stats.rejected, icon: <XCircle size={22} />,      color: "#ef4444", gradient: "linear-gradient(135deg,#ef4444,#dc2626)" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
              borderRadius: 20, padding: "clamp(16px, 3vw, 24px)",
              display: "flex", alignItems: "center", gap: 18,
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              transition: "transform 0.2s, background 0.3s ease",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: stat.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 6px 20px ${stat.color}30`,
              }}>
                {React.cloneElement(stat.icon as any, { color: "#fff" })}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "clamp(24px, 5vw, 30px)", fontWeight: 900, color: "var(--ui-text-primary)", lineHeight: 1, letterSpacing: "-1px", transition: "color 0.3s ease" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "clamp(11px, 2vw, 12px)", color: "var(--ui-text-muted)", marginTop: 4, fontWeight: 500, transition: "color 0.3s ease" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters & search ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 14px)",
          marginBottom: 20, flexWrap: "wrap",
        }}>
          {/* Search */}
          <div style={{
            flex: 1, minWidth: "clamp(200px, 100%, 220px)", display: "flex", alignItems: "center", gap: 10,
            background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
            borderRadius: 12, padding: "10px 16px",
            transition: "all 0.3s ease",
          }}>
            <Search size={15} color="var(--ui-text-muted)" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search company name or email…"
              style={{
                background: "none", border: "none", outline: "none",
                color: "var(--ui-text-primary)", fontSize: 13, width: "100%",
                transition: "color 0.3s ease",
              }}
            />
          </div>

          {/* Status filter chips */}
          {(["all", "pending", "approved", "rejected"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "9px 18px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
                background: filterStatus === s
                  ? (s === "all" ? "linear-gradient(135deg,#f59e0b,#f97316)" : s === "pending" ? "linear-gradient(135deg,#f59e0b,#d97706)" : s === "approved" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)")
                  : "var(--ui-bg-input)",
                border: filterStatus === s ? "none" : "1px solid var(--ui-border-input)",
                color: filterStatus === s ? "#fff" : "var(--ui-text-muted)",
                boxShadow: filterStatus === s ? "0 4px 14px rgba(0,0,0,0.25)" : "none",
                minHeight: 40,
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== "all" && (
                <span style={{
                  marginLeft: 6, fontSize: 10, padding: "1px 6px", borderRadius: 99,
                  background: "rgba(255,255,255,0.15)", color: "#fff",
                }}>
                  {s === "pending" ? stats.pending : s === "approved" ? stats.approved : stats.rejected}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => fetchCompanies(1)}
            style={{
              padding: "9px 18px", borderRadius: 12, fontSize: 12, fontWeight: 700,
              cursor: "pointer", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
              color: "#fb923c", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
              minHeight: 40,
            }}
          >
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <TrendingUp size={13} />}
            Refresh
          </button>
        </div>

        {/* ── Company list ── */}
        {fetchError ? (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16, padding: "24px", textAlign: "center", color: "#f87171",
          }}>
            <AlertCircle size={24} style={{ margin: "0 auto 8px", display: "block" }} />
            {fetchError}
          </div>
        ) : isLoading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 12px", display: "block", color: "#f59e0b" }} />
            Loading companies…
          </div>
        ) : companies.length === 0 ? (
          <div style={{
            background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
            borderRadius: 20, padding: "60px 24px", textAlign: "center", color: "var(--ui-text-muted)",
            transition: "all 0.3s ease",
          }}>
            <Building2 size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
            No companies found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {companies.map((company: Company) => {
              const sm = statusMeta[company.status] || statusMeta.pending;
              const isExpanded = expandedId === company.id;

              return (
                <div
                  key={company.id}
                  style={{
                    background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
                    borderRadius: 20, overflow: "hidden",
                    boxShadow: isExpanded ? "0 8px 40px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.25)",
                    transition: "box-shadow 0.3s, background 0.3s ease",
                  }}
                >
                  {/* Row */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 18px)", padding: "clamp(16px, 3vw, 20px) clamp(16px, 3vw, 24px)",
                    cursor: "pointer",
                    flexWrap: "wrap",
                  }}
                    onClick={() => setExpandedId(isExpanded ? null : company.id)}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      background: company.type === "buyer"
                        ? "linear-gradient(135deg,#f59e0b,#ea580c)"
                        : "linear-gradient(135deg,#10b981,#059669)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 4px 14px ${company.type === "buyer" ? "rgba(249,115,22,0.3)" : "rgba(16,185,129,0.3)"}`,
                    }}>
                      <Building2 size={24} color="#fff" />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "clamp(13px, 2vw, 15px)", fontWeight: 800, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{company.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 99,
                          background: company.type === "buyer" ? "rgba(249,115,22,0.15)" : "rgba(16,185,129,0.15)",
                          color: company.type === "buyer" ? "#fdba74" : "#34d399",
                          letterSpacing: "0.05em", textTransform: "uppercase",
                        }}>
                          {company.type}
                        </span>
                      </div>
                      <div style={{ fontSize: "clamp(11px, 2vw, 12px)", color: "var(--ui-text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", transition: "color 0.3s ease" }}>
                        {company.email && <span>{company.email}</span>}
                        {company.city && <span>📍 {company.city}{company.region ? `, ${company.region}` : ""}</span>}
                        <span>Registered {new Date(company.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <FileText size={11} /> {company.documents?.length || 0} doc{company.documents?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div style={{
                      padding: "6px 14px", borderRadius: 99, flexShrink: 0,
                      background: sm.bg, border: `1px solid ${sm.border}`, color: sm.color,
                      fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {sm.icon} {sm.label}
                    </div>

                    {/* Actions */}
                    {company.status === "pending" && (
                      <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setAuditModal({ company, action: "approve" })}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                            background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
                            color: "#34d399", cursor: "pointer", transition: "all 0.2s",
                            minHeight: 40,
                          }}
                        >
                          <CheckCircle2 size={13} /> Approve
                        </button>
                        <button
                          onClick={() => setAuditModal({ company, action: "decline" })}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                            background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)",
                            color: "#f87171", cursor: "pointer", transition: "all 0.2s",
                            minHeight: 40,
                          }}
                        >
                          <XCircle size={13} /> Decline
                        </button>
                      </div>
                    )}

                    {/* Expand toggle */}
                    <div style={{ flexShrink: 0, color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{
                      borderTop: "1px solid var(--ui-border)",
                      padding: "clamp(16px, 3vw, 24px)",
                      display: "grid", gridTemplateColumns: "1fr", gap: "clamp(16px, 3vw, 24px)",
                    }}>
                      {/* Company details */}
                      <div>
                        <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                          Company Details
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {[
                            { label: "Tax ID (NPWP)", value: company.tax_id },
                            { label: "Phone", value: company.phone },
                            { label: "Address", value: company.address },
                            { label: "Bank", value: company.bank_name ? `${company.bank_name} — ${company.bank_account} (${company.bank_account_name})` : null },
                          ].filter(r => r.value).map(row => (
                            <div key={row.label} style={{ display: "flex", gap: 12 }}>
                              <span style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 600, width: 110, flexShrink: 0, paddingTop: 1, transition: "color 0.3s ease" }}>
                                {row.label}
                              </span>
                              <span style={{ fontSize: 12, color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>{row.value}</span>
                            </div>
                          ))}
                          {company.verification_notes && (
                            <div style={{
                              marginTop: 8, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)",
                              borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#fbbf24",
                            }}>
                              <strong>Notes:</strong> {company.verification_notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Documents */}
                      <div>
                        <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                          Legal Documents ({company.documents?.length || 0})
                        </div>
                        {!company.documents?.length ? (
                          <div style={{
                            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                            borderRadius: 12, padding: "16px", fontSize: 12, color: "#f87171",
                            display: "flex", alignItems: "center", gap: 8,
                          }}>
                            <AlertCircle size={14} /> No documents uploaded.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {company.documents.map((doc: CompanyDoc, i: number) => (
                              <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
                                borderRadius: 12, padding: "10px 14px",
                                transition: "all 0.3s ease",
                              }}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                  background: "rgba(249,115,22,0.15)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  <FileText size={16} color="#fb923c" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "color 0.3s ease" }}>
                                    {doc.name}
                                  </div>
                                  <div style={{ fontSize: 10, color: "var(--ui-text-muted)", marginTop: 2, transition: "color 0.3s ease" }}>{doc.type}</div>
                                </div>
                                {doc.file_path && (
                                  <a
                                    href={`${BASE_URL_IMAGE}/${doc.file_path}`} target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                      display: "flex", alignItems: "center", gap: 4,
                                      fontSize: 11, color: "#fb923c", textDecoration: "none",
                                      padding: "5px 10px", borderRadius: 8,
                                      background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
                                      flexShrink: 0, fontWeight: 600,
                                    }}
                                  >
                                    <ExternalLink size={11} /> View
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                flexWrap: "wrap",
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  style={{
                    padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
                    color: currentPage === 1 ? "var(--ui-text-muted)" : "var(--ui-text-primary)",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    minHeight: 40,
                  }}
                >
                  Previous
                </button>
                <div style={{ fontSize: 13, color: "var(--ui-text-muted)", margin: "0 12px", transition: "color 0.3s ease" }}>
                  Page <span style={{ color: "var(--ui-text-primary)", fontWeight: 700, transition: "color 0.3s ease" }}>{currentPage}</span> of {totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  style={{
                    padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
                    color: currentPage === totalPages ? "var(--ui-text-muted)" : "var(--ui-text-primary)",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    minHeight: 40,
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Audit Modal ── */}
      {auditModal && (
        <AuditModal
          company={auditModal.company}
          action={auditModal.action}
          onClose={() => setAuditModal(null)}
          onDone={() => { setAuditModal(null); fetchCompanies(); }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Audit Modal                                                        */
/* ─────────────────────────────────────────────────────────────────── */

function AuditModal({
  company, action, onClose, onDone,
}: {
  company: Company;
  action: "approve" | "decline";
  onClose: () => void;
  onDone: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprove = action === "approve";
  const accentColor = isApprove ? "#34d399" : "#f87171";
  const accentBg    = isApprove ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)";

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await adminAuditCompany(company.id, { action, notes: notes || undefined });
      onDone();
    } catch (err: any) {
      setError(err.message || "Action failed.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--ui-glass-bg)", border: "1px solid var(--ui-glass-border)",
        borderRadius: 24, padding: "clamp(24px, 5vw, 36px)", width: "100%", maxWidth: 480,
        boxShadow: "var(--ui-glass-shadow)",
        display: "flex", flexDirection: "column", gap: 20,
        position: "relative",
        transition: "all 0.3s ease",
      }}>
        {/* Top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "24px 24px 0 0",
          background: `linear-gradient(90deg,${accentColor},${accentColor}80)`,
        }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 32, height: 32, borderRadius: 10, cursor: "pointer",
            background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ui-text-muted)",
            transition: "all 0.3s ease",
            minHeight: 44,
            minWidth: 44,
          }}
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: accentBg, border: `1px solid ${accentColor}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isApprove ? <CheckCircle2 size={26} color={accentColor} /> : <XCircle size={26} color={accentColor} />}
          </div>
          <div>
            <h3 style={{ fontSize: "clamp(15px, 3vw, 17px)", fontWeight: 800, color: "var(--ui-text-primary)", margin: 0, transition: "color 0.3s ease" }}>
              {isApprove ? "Approve Company" : "Decline Company"}
            </h3>
            <p style={{ fontSize: 12, color: "var(--ui-text-muted)", margin: "4px 0 0", transition: "color 0.3s ease" }}>{company.name}</p>
          </div>
        </div>

        {/* Notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={lbl}>
            {isApprove ? "Approval Notes (optional)" : "Reason for Decline *"}
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={isApprove
              ? "e.g. All documents verified, company approved."
              : "e.g. Incomplete documents, NPWP not valid."}
            rows={4}
            style={{
              background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
              borderRadius: 12, padding: "12px 14px",
              fontSize: 13, color: "var(--ui-text-primary)", outline: "none",
              width: "100%", resize: "none",
              fontFamily: "inherit",
              transition: "all 0.3s ease",
            }}
          />
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, minWidth: 100, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
              color: "var(--ui-text-muted)", cursor: "pointer", transition: "all 0.2s",
              minHeight: 44,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              flex: 2, minWidth: 120, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 800,
              background: isApprove
                ? "linear-gradient(135deg,#10b981,#059669)"
                : "linear-gradient(135deg,#ef4444,#dc2626)",
              border: "none", color: "#fff", cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: isLoading ? 0.75 : 1,
              boxShadow: isLoading ? "none" : `0 6px 20px ${accentColor}30`,
              transition: "all 0.2s",
              minHeight: 44,
            }}
          >
            {isLoading ? (
              <><Loader2 size={14} className="animate-spin" /> Processing…</>
            ) : (
              <>{isApprove ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
              {isApprove ? "Approve Company" : "Decline Registration"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Shared styles                                                      */
/* ─────────────────────────────────────────────────────────────────── */

const lbl: React.CSSProperties = {
  fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.07em",
  transition: "color 0.3s ease",
};

const inp: React.CSSProperties = {
  background: "var(--ui-bg-input)",
  border: "1px solid var(--ui-border-input)",
  borderRadius: 12, padding: "12px 16px",
  fontSize: 14, color: "var(--ui-text-primary)", outline: "none",
  width: "100%", fontFamily: "inherit",
  transition: "border-color 0.2s, background 0.3s ease, color 0.3s ease",
  minHeight: 48,
};
