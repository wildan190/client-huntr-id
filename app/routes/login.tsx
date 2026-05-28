import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { login } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // If already fully authenticated, redirect away
  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const company = localStorage.getItem("active_company");
      navigate(company ? "/" : "/select-company", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(form);

      // The API wraps user in data.user
      const userPayload = data.user || data;
      const user = {
        id: userPayload.id,
        name: userPayload.name || "User",
        email: userPayload.email || "",
        whatsapp: userPayload.whatsapp || "",
        role: userPayload.role || "buyer",
        company_id: userPayload.company_id || null,
      };

      localStorage.setItem("user_session", JSON.stringify(user));
      // Always go to company selection after login
      navigate("/select-company");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      boxSizing: "border-box" as const,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient blobs */}
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420 }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(15,15,30,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24, backdropFilter: "blur(24px)",
            padding: "36px 36px",
            display: "flex", flexDirection: "column", gap: 18,
            boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo + heading */}
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg,#a855f7,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <LogIn size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f3f4f6", margin: 0 }}>Welcome back</h1>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 0" }}>
              Sign in using your WhatsApp number or Email
            </p>
          </div>

          {/* Login Identifier */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={lbl}>WhatsApp Number or Email</label>
            <input value={form.email} onChange={e => set("email", e.target.value)}
              type="text" placeholder="085156334793 or your@company.com" required style={inp} />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={lbl}>Password</label>
            <div style={{ position: "relative" }}>
              <input value={form.password} onChange={e => set("password", e.target.value)}
                type={showPw ? "text" : "password"} placeholder="••••••••" required
                style={{ ...inp, paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 0,
              }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171",
            }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: "13px 20px", borderRadius: 11, fontWeight: 700, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer", border: "none",
            background: "linear-gradient(135deg,#a855f7,#6366f1)",
            color: "#fff", opacity: loading ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginTop: 4,
          }}>
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Signing in...</>
              : "Sign In →"
            }
          </button>

          <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", margin: 0 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  fontSize: 11, color: "#9ca3af", fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.04em",
};
const inp: React.CSSProperties = {
  background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#fff",
  outline: "none", width: "100%", boxSizing: "border-box",
};
