import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, LogIn, Plus, Loader2, CheckCircle2, ArrowRight,
  LayoutGrid, LogOut, Sparkles,
} from "lucide-react";
import { getMyCompanies } from "../lib/api";

export default function SelectCompany() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) { navigate("/login"); return; }
    const u = JSON.parse(session);
    setUser(u);
    getMyCompanies(u.id)
      .then(data => {
        const list = data.companies || [];
        setCompanies(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(() => setCompanies([]))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const handleLogin = () => {
    if (!selected) return;
    localStorage.setItem("active_company", JSON.stringify(selected));
    navigate("/");
  };

  const handleRegisterNew = () => navigate("/onboarding");
  const handleSignOut = () => { localStorage.clear(); navigate("/login"); };

  const statusMeta: Record<string, { color: string; bg: string; label: string }> = {
    approved: { color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Verified" },
    pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  label: "Pending"  },
    rejected: { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "Rejected" },
  };

  const getMeta = (s: string) => statusMeta[s] || { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", label: s || "Unknown" };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-8%", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.11) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 650, height: 650, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.09) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "50%", left: "30%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }} />
      </div>

      {/* Top bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img 
            src="/assets/img/logo/emblem.jpg" 
            alt="Huntr Logo" 
            style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }} 
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#f3f4f6", letterSpacing: "-0.3px" }}>Huntr.id</div>
            <div style={{ fontSize: 8, color: "#f59e0b", letterSpacing: "0.12em", fontWeight: 700 }}>WORKSPACE</div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#6b7280", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8,
            padding: "7px 14px", cursor: "pointer", fontWeight: 500,
          }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 500, position: "relative", zIndex: 1,
      }}>
        <div style={{
          background: "rgba(12,12,28,0.92)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 28,
          backdropFilter: "blur(32px)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset",
          overflow: "hidden",
        }}>
          {/* Top accent */}
          <div style={{ height: 3, background: "linear-gradient(90deg,#f97316,#f59e0b,#fbbf24)" }} />

          <div style={{ padding: "36px 40px 40px" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: "linear-gradient(135deg,#f97316,#f59e0b)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px",
                boxShadow: "0 8px 24px rgba(249,115,22,0.35)",
              }}>
                <LayoutGrid size={28} color="#fff" />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f3f4f6", margin: "0 0 8px", letterSpacing: "-0.4px" }}>
                Choose a Workspace
              </h1>
              {user && (
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                  Welcome back,{" "}
                  <span style={{ color: "#fdba74", fontWeight: 600 }}>
                    {user.name}
                  </span>
                </p>
              )}
            </div>

            {/* Body */}
            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "32px 0" }}>
                <Loader2 size={28} color="#f59e0b" className="animate-spin" />
                <span style={{ fontSize: 13, color: "#4b5563" }}>Loading workspaces...</span>
              </div>
            ) : companies.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <Building2 size={26} color="#374151" />
                </div>
                <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
                  You don't have any registered company yet.
                </p>
                <button
                  onClick={handleRegisterNew}
                  style={{
                    width: "100%", padding: "14px 20px", borderRadius: 14,
                    fontWeight: 700, fontSize: 14, border: "none",
                    background: "linear-gradient(135deg,#f97316,#f59e0b)",
                    color: "#fff", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 6px 20px rgba(249,115,22,0.3)",
                  }}
                >
                  <Plus size={16} /> Register a Company
                </button>
              </div>
            ) : (
              <>
                {/* Company list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {companies.map(c => {
                    const isSelected = selected?.id === c.id;
                    const meta = getMeta(c.status);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelected(c)}
                        style={{
                          padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                          background: isSelected ? "rgba(249,115,22,0.09)" : "rgba(255,255,255,0.025)",
                          border: isSelected
                            ? "1.5px solid rgba(249,115,22,0.45)"
                            : "1.5px solid rgba(255,255,255,0.07)",
                          display: "flex", alignItems: "center", gap: 14,
                          transition: "all 0.2s", textAlign: "left",
                          boxShadow: isSelected ? "0 0 24px rgba(249,115,22,0.12)" : "none",
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                          background: isSelected
                            ? "linear-gradient(135deg,#f97316,#f59e0b)"
                            : "rgba(255,255,255,0.07)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s",
                          boxShadow: isSelected ? "0 4px 16px rgba(249,115,22,0.3)" : "none",
                        }}>
                          <Building2 size={21} color={isSelected ? "#fff" : "#4b5563"} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 14, fontWeight: 700,
                            color: isSelected ? "#f3f4f6" : "#9ca3af",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            transition: "color 0.2s",
                          }}>
                            {c.name}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                              color: "#4b5563", textTransform: "uppercase",
                            }}>{c.type}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                              background: meta.bg, color: meta.color, letterSpacing: "0.04em",
                            }}>{meta.label}</span>
                          </div>
                        </div>

                        {isSelected && <CheckCircle2 size={20} color="#fb923c" />}
                      </button>
                    );
                  })}
                </div>

                {/* Enter button */}
                <button
                  onClick={handleLogin}
                  disabled={!selected}
                  style={{
                    width: "100%", padding: "16px 20px", borderRadius: 14,
                    fontWeight: 800, fontSize: 14, border: "none",
                    cursor: selected ? "pointer" : "not-allowed",
                    background: selected
                      ? "linear-gradient(135deg,#f97316,#f59e0b)"
                      : "rgba(255,255,255,0.04)",
                    color: selected ? "#fff" : "#374151",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "all 0.25s",
                    boxShadow: selected ? "0 8px 24px rgba(249,115,22,0.3)" : "none",
                    letterSpacing: "-0.2px",
                  }}
                >
                  <LogIn size={17} />
                  {selected ? `Enter as ${selected.name}` : "Select a workspace"}
                  {selected && <ArrowRight size={16} />}
                </button>

                {/* Register another */}
                {user?.role === "owner" && (
                  <div style={{ textAlign: "center", marginTop: 18 }}>
                    <button
                      onClick={handleRegisterNew}
                      style={{
                        fontSize: 12, color: "#f59e0b", background: "none",
                        border: "none", cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontWeight: 600, textDecoration: "none",
                      }}
                    >
                      <Sparkles size={12} /> Register a new company
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
