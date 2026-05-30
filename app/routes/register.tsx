import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserPlus, Loader2, Eye, EyeOff, MessageSquareCode, ShieldCheck } from "lucide-react";
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

      const userPayload = await register(registerPayload);
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
    <div style={containerStyle}>
      {/* Ambient background effects */}
      <div style={ambientBlob1} />
      <div style={ambientBlob2} />

      <div className="glass-panel" style={authWrapper}>
        {/* Left Section: Visual */}
        <div style={visualSection}>
          <img 
            src="/assets/img/auth-assets/enterprise-building.jpg" 
            alt="Enterprise Building" 
            style={visualImage}
          />
          <div style={visualOverlay}>
            <div style={visualContent}>
              <h2 style={visualTitle}>Join the Ecosystem</h2>
              <p style={visualText}>Connect with verified business partners and expand your procurement reach.</p>
              <div style={visualFeatures}>
                <div style={featureTag}>✓ Seamless Onboarding</div>
                <div style={featureTag}>✓ High-Fidelity UX</div>
                <div style={featureTag}>✓ Secure Protocol</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Form */}
        <div style={formSection}>
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={{ marginBottom: 24 }}>
              <img 
                src="/assets/img/logo/emblem.jpg" 
                alt="Huntr Logo" 
                style={logoStyle} 
              />
              <h1 style={headingStyle}>Create Account</h1>
              <p style={subHeadingStyle}>Register and verify your workspace identity</p>
            </div>

            <div style={scrollArea}>
              <div style={inputGroup}>
                <label style={lbl}>Full Name</label>
                <input 
                  value={form.name} 
                  onChange={e => set("name", e.target.value)} 
                  type="text"
                  placeholder="e.g. Budi Santoso" 
                  required 
                  disabled={otpSent} 
                  style={inp} 
                />
              </div>

              <div style={inputGroup}>
                <label style={lbl}>WhatsApp Number</label>
                <div style={{ position: "relative" }}>
                  <input 
                    value={form.whatsapp} 
                    onChange={e => set("whatsapp", e.target.value)} 
                    type="tel"
                    placeholder="e.g. 085156334793" 
                    required 
                    disabled={otpSent} 
                    style={inp} 
                  />
                  {otpSent && (
                    <span 
                      onClick={() => setOtpSent(false)} 
                      style={changeNumLink}
                    >
                      Change
                    </span>
                  )}
                </div>
              </div>

              <div style={inputGroup}>
                <label style={lbl}>Work Email (Optional)</label>
                <input 
                  value={form.email} 
                  onChange={e => set("email", e.target.value)} 
                  type="email"
                  placeholder="budi@company.com" 
                  disabled={otpSent} 
                  style={inp} 
                />
              </div>

              <div style={inputGroup}>
                <label style={lbl}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    value={form.password} 
                    onChange={e => set("password", e.target.value)}
                    type={showPw ? "text" : "password"}
                    placeholder="min. 8 characters" 
                    required 
                    disabled={otpSent} 
                    style={{ ...inp, paddingRight: 42 }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} disabled={otpSent} style={eyeBtnStyle}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* OTP Code */}
              {otpSent && (
                <div style={otpContainer}>
                  <label style={{ ...lbl, color: "#a5b4fc", display: "flex", alignItems: "center", gap: 6 }}>
                    <MessageSquareCode size={14} /> Verification Code
                  </label>
                  <input 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    type="text"
                    placeholder="6-digit OTP" 
                    required 
                    maxLength={6} 
                    style={inp} 
                  />
                  {debugOtp && (
                    <div style={debugOtpStyle}>
                      🔧 Debug OTP: {debugOtp}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && <div style={errorStyle}>⚠ {error}</div>}
            {successMsg && <div style={successStyle}>✓ {successMsg}</div>}

            {!otpSent ? (
              <button type="button" onClick={handleSendOtp} disabled={loading} style={btnStyle}>
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> Sending...</>
                  : "Request OTP Code"
                }
              </button>
            ) : (
              <button type="submit" disabled={loading} style={{ ...btnStyle, background: "linear-gradient(135deg,#34d399,#10b981)" }}>
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                  : "Verify & Create Account"
                }
              </button>
            )}

            <p style={footerTextStyle}>
              Already have an account?{" "}
              <Link to="/login" style={linkStyle}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  position: "relative",
  overflow: "hidden",
};

const ambientBlob1: React.CSSProperties = {
  position: "absolute", top: "-10%", right: "-5%", width: 600, height: 600,
  borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
  pointerEvents: "none", zIndex: 0
};

const ambientBlob2: React.CSSProperties = {
  position: "absolute", bottom: "-10%", left: "-5%", width: 700, height: 700,
  borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
  pointerEvents: "none", zIndex: 0
};

const authWrapper: React.CSSProperties = {
  width: "100%",
  maxWidth: 1000,
  display: "flex",
  minHeight: 680,
  position: "relative",
  zIndex: 1,
  overflow: "hidden",
  borderRadius: 32,
};

const formSection: React.CSSProperties = {
  flex: 1,
  padding: "48px 60px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  background: "rgba(10, 10, 26, 0.4)",
};

const visualSection: React.CSSProperties = {
  flex: 1.2,
  position: "relative",
  display: "block",
};

// if (typeof window !== "undefined" && window.innerWidth > 768) {
//   visualSection.display = "block";
// }

const visualImage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const visualOverlay: React.CSSProperties = {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "linear-gradient(to bottom, rgba(15, 15, 30, 0.2), rgba(15, 15, 30, 0.9))",
  display: "flex",
  alignItems: "flex-end",
  padding: 48,
};

const visualContent: React.CSSProperties = {
  maxWidth: 400,
};

const visualTitle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  color: "#fff",
  marginBottom: 12,
  letterSpacing: "-0.5px",
};

const visualText: React.CSSProperties = {
  fontSize: 16,
  color: "#9ca3af",
  lineHeight: 1.6,
  marginBottom: 24,
};

const visualFeatures: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
};

const featureTag: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 20,
  background: "rgba(168, 85, 247, 0.2)",
  border: "1px solid rgba(168, 85, 247, 0.3)",
  color: "#d8b4fe",
  fontSize: 12,
  fontWeight: 600,
};

const formStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const scrollArea: React.CSSProperties = {
  maxHeight: "60vh",
  overflowY: "auto",
  paddingRight: 10,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const logoStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 14,
  marginBottom: 20,
  objectFit: "cover",
};

const headingStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: "#f3f4f6",
  margin: "0 0 6px",
  letterSpacing: "-0.5px",
};

const subHeadingStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
  margin: 0,
};

const inputGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const lbl: React.CSSProperties = {
  fontSize: 11,
  color: "#9ca3af",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inp: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 13,
  color: "#fff",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const changeNumLink: React.CSSProperties = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 11,
  color: "#818cf8",
  cursor: "pointer",
  textDecoration: "underline",
  fontWeight: 600,
};

const eyeBtnStyle: React.CSSProperties = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#6b7280",
  padding: 4,
};

const otpContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  background: "rgba(99, 102, 241, 0.05)",
  border: "1px solid rgba(99, 102, 241, 0.15)",
  borderRadius: 14,
  padding: "14px",
};

const debugOtpStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#34d399",
  marginTop: 4,
  fontWeight: 600,
};

const errorStyle: React.CSSProperties = {
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 12,
  color: "#f87171",
};

const successStyle: React.CSSProperties = {
  background: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 12,
  color: "#34d399",
};

const btnStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  border: "none",
  background: "linear-gradient(135deg, #a855f7, #6366f1)",
  color: "#fff",
  marginTop: 4,
};

const footerTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6b7280",
  textAlign: "center",
  margin: "8px 0 0",
};

const linkStyle: React.CSSProperties = {
  color: "#818cf8",
  textDecoration: "none",
  fontWeight: 600,
};
