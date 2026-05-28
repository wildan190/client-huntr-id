import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserPlus, Loader2, Eye, EyeOff, MessageSquareCode } from "lucide-react";
import { register, sendOtp, verifyOtp } from "../lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    // Reset OTP status if they change their WhatsApp number
    if (k === "whatsapp" && otpSent) {
      setOtpSent(false);
      setOtp("");
      setDebugOtp(null);
      setError(null);
      setSuccessMsg(null);
    }
  };

  // If already logged in, redirect
  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const company = localStorage.getItem("active_company");
      navigate(company ? "/" : "/select-company");
    }
  }, [navigate]);

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!form.name || !form.whatsapp || !form.password) {
      setError("Please fill in Name, WhatsApp Number, and Password first.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await sendOtp({ whatsapp: form.whatsapp });
      setOtpSent(true);
      setSuccessMsg("OTP code sent successfully to WhatsApp!");
      if (res.otp) {
        setDebugOtp(res.otp);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) return;
    if (!otp) {
      setError("Please enter the OTP verification code.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      // 1. Verify OTP first
      await verifyOtp({ whatsapp: form.whatsapp, otp });

      // 2. Register user
      const registerPayload = {
        name: form.name,
        whatsapp: form.whatsapp,
        password: form.password,
        email: form.email || undefined,
      };

      const data = await register(registerPayload);
      const userPayload = data.user || data;
      const user = {
        id: userPayload.id,
        name: userPayload.name || form.name,
        email: userPayload.email || form.email,
        whatsapp: userPayload.whatsapp || form.whatsapp,
        role: userPayload.role || "buyer",
      };

      // Persist user session and send to company onboarding wizard
      localStorage.setItem("user_session", JSON.stringify(user));
      localStorage.removeItem("active_company"); // clear any stale company
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.message || "Verification or registration failed.");
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
      <div style={{ position: "absolute", top: "-15%", right: "-5%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440 }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(15,15,30,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            backdropFilter: "blur(24px)",
            padding: "36px 36px",
            display: "flex", flexDirection: "column", gap: 18,
            boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo + Heading */}
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg,#a855f7,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <UserPlus size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f3f4f6", margin: 0 }}>Create Account</h1>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 0" }}>
              Register and verify WhatsApp number
            </p>
          </div>

          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={lbl}>Full Name</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} type="text"
              placeholder="e.g. Budi Santoso" required disabled={otpSent} style={inp} />
          </div>

          {/* WhatsApp */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={lbl}>WhatsApp Number</label>
            <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} type="tel"
              placeholder="e.g. 085156334793" required disabled={otpSent} style={inp} />
            {otpSent && (
              <span onClick={() => setOtpSent(false)} style={{ fontSize: 11, color: "#818cf8", cursor: "pointer", textDecoration: "underline", marginTop: 2, alignSelf: "flex-start" }}>
                Change WhatsApp number
              </span>
            )}
          </div>

          {/* Email (Optional) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={lbl}>Work Email (Optional)</label>
            <input value={form.email} onChange={e => set("email", e.target.value)} type="email"
              placeholder="budi@company.com" disabled={otpSent} style={inp} />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={lbl}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                value={form.password} onChange={e => set("password", e.target.value)}
                type={showPw ? "text" : "password"}
                placeholder="min. 8 characters" required disabled={otpSent} style={{ ...inp, paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)} disabled={otpSent} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 0,
              }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* OTP Code */}
          {otpSent && (
            <div style={{
              display: "flex", flexDirection: "column", gap: 6,
              background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: 14, padding: 14, marginTop: 4,
            }}>
              <label style={{ ...lbl, color: "#a5b4fc", display: "flex", alignItems: "center", gap: 6 }}>
                <MessageSquareCode size={14} /> Enter Verification Code (OTP)
              </label>
              <input value={otp} onChange={e => setOtp(e.target.value)} type="text"
                placeholder="Enter 6-digit OTP code" required maxLength={6} style={inp} />
              {debugOtp && (
                <div style={{ fontSize: 11, color: "#34d399", marginTop: 4, fontWeight: 600 }}>
                  🔧 Debug OTP: {debugOtp}
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171",
            }}>
              ⚠ {error}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#34d399",
            }}>
              ✓ {successMsg}
            </div>
          )}

          {!otpSent ? (
            <button type="button" onClick={handleSendOtp} disabled={loading} style={{
              padding: "13px 20px", borderRadius: 11, fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer", border: "none",
              background: "linear-gradient(135deg,#a855f7,#6366f1)",
              color: "#fff", opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 4,
            }}>
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Requesting OTP...</>
                : "Send OTP Verification Code →"
              }
            </button>
          ) : (
            <button type="submit" disabled={loading} style={{
              padding: "13px 20px", borderRadius: 11, fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer", border: "none",
              background: "linear-gradient(135deg,#34d399,#10b981)",
              color: "#fff", opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 4,
            }}>
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Verifying & Registering...</>
                : "Verify & Create Account →"
              }
            </button>
          )}

          <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", margin: 0 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600 }}>
              Sign in
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
