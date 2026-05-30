import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LogIn, Loader2, Eye, EyeOff, ShieldCheck, Key } from "lucide-react";
import { login, verify2FACode, verify2FARecovery, getAuthenticatedUser } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);

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
      const userPayload = await login(form);

      if (userPayload.two_factor) {
        setShow2FA(true);
        setLoading(false);
        return;
      }

      const user = {
        id: userPayload.id,
        name: userPayload.name || "User",
        email: userPayload.email || "",
        whatsapp: userPayload.whatsapp || "",
        role: userPayload.role || "buyer",
        company_id: userPayload.company_id || null,
        two_factor_confirmed_at: userPayload.two_factor_confirmed_at || null,
      };

      localStorage.setItem("user_session", JSON.stringify(user));
      navigate("/select-company");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (useRecovery) {
        await verify2FARecovery(twoFactorCode);
      } else {
        await verify2FACode(twoFactorCode);
      }
      
      const userPayload = await getAuthenticatedUser();
      const user = {
        id: userPayload.id,
        name: userPayload.name || "User",
        email: userPayload.email || "",
        whatsapp: userPayload.whatsapp || "",
        role: userPayload.role || "buyer",
        company_id: userPayload.company_id || null,
        two_factor_confirmed_at: userPayload.two_factor_confirmed_at || null,
      };

      localStorage.setItem("user_session", JSON.stringify(user));
      navigate("/select-company");
    } catch (err: any) {
      setError(err.message || "Invalid 2FA code.");
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
        {/* Left Section: Form */}
        <div style={formSection}>
          {!show2FA ? (
            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={{ marginBottom: 32 }}>
                <img 
                  src="/assets/img/logo/emblem.jpg" 
                  alt="Huntr Logo" 
                  style={logoStyle} 
                />
                <h1 style={headingStyle}>Welcome back</h1>
                <p style={subHeadingStyle}>Sign in to access your procurement dashboard</p>
              </div>

              <div style={inputGroup}>
                <label style={lbl}>Email or WhatsApp</label>
                <input 
                  value={form.email} 
                  onChange={e => set("email", e.target.value)}
                  type="text" 
                  placeholder="name@company.com" 
                  required 
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
                    placeholder="••••••••" 
                    required
                    style={{ ...inp, paddingRight: 42 }} 
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={eyeBtnStyle}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div style={errorStyle}>⚠ {error}</div>}

              <button type="submit" disabled={loading} style={btnStyle}>
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                  : "Sign In"
                }
              </button>

              <p style={footerTextStyle}>
                Don't have an account?{" "}
                <Link to="/register" style={linkStyle}>Create an account</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} style={formStyle}>
              <div style={{ marginBottom: 32 }}>
                <div style={iconWrapper2FA}>
                  <ShieldCheck size={32} color="#fff" />
                </div>
                <h1 style={headingStyle}>2FA Verification</h1>
                <p style={subHeadingStyle}>
                  {useRecovery ? "Enter recovery code" : "Enter authenticator code"}
                </p>
              </div>

              <div style={inputGroup}>
                <label style={lbl}>{useRecovery ? "Recovery Code" : "Authentication Code"}</label>
                <input 
                  value={twoFactorCode} 
                  onChange={e => setTwoFactorCode(e.target.value)}
                  type="text" 
                  placeholder={useRecovery ? "87654321" : "123456"} 
                  required 
                  style={inp} 
                />
              </div>

              {error && <div style={errorStyle}>⚠ {error}</div>}

              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Continue"}
              </button>

              <button 
                type="button" 
                onClick={() => { setUseRecovery(!useRecovery); setTwoFactorCode(""); }}
                style={toggle2FABtn}
              >
                <Key size={14} />
                {useRecovery ? "Use authenticator app" : "Use recovery code"}
              </button>
              
              <button 
                type="button" 
                onClick={() => { setShow2FA(false); setTwoFactorCode(""); }}
                style={backBtn}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>

        {/* Right Section: Visual */}
        <div style={visualSection}>
          <img 
            src="/assets/img/auth-assets/enterprise-building.jpg" 
            alt="Enterprise Building" 
            style={visualImage}
          />
          <div style={visualOverlay}>
            <div style={visualContent}>
              <h2 style={visualTitle}>Enterprise Procurement</h2>
              <p style={visualText}>Streamline your business operations with our advanced B2B ecosystem.</p>
              <div style={visualFeatures}>
                <div style={featureTag}>✓ Verified Vendors</div>
                <div style={featureTag}>✓ Automated RFQ</div>
                <div style={featureTag}>✓ Secure PO</div>
              </div>
            </div>
          </div>
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
  position: "absolute", top: "-10%", left: "-5%", width: 600, height: 600,
  borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
  pointerEvents: "none", zIndex: 0
};

const ambientBlob2: React.CSSProperties = {
  position: "absolute", bottom: "-10%", right: "-5%", width: 700, height: 700,
  borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
  pointerEvents: "none", zIndex: 0
};

const authWrapper: React.CSSProperties = {
  width: "100%",
  maxWidth: 1000,
  display: "flex",
  minHeight: 640,
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
  display: "block", // Always display on desktop, we'll use CSS for responsive hidden
};

// Remove the JS-based width check which can fail during SSR
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
  background: "rgba(99, 102, 241, 0.2)",
  border: "1px solid rgba(99, 102, 241, 0.3)",
  color: "#a5b4fc",
  fontSize: 12,
  fontWeight: 600,
};

const formStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const logoStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 14,
  marginBottom: 24,
  objectFit: "cover",
  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
};

const headingStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: "#f3f4f6",
  margin: "0 0 8px",
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
  gap: 8,
};

const lbl: React.CSSProperties = {
  fontSize: 12,
  color: "#9ca3af",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inp: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 12,
  padding: "14px 16px",
  fontSize: 14,
  color: "#fff",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "all 0.2s",
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

const errorStyle: React.CSSProperties = {
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 13,
  color: "#f87171",
};

const btnStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: 14,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  border: "none",
  background: "linear-gradient(135deg, #a855f7, #6366f1)",
  color: "#fff",
  marginTop: 8,
  boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
};

const footerTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
  textAlign: "center",
  margin: "12px 0 0",
};

const linkStyle: React.CSSProperties = {
  color: "#818cf8",
  textDecoration: "none",
  fontWeight: 600,
};

const iconWrapper2FA: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 16,
  background: "linear-gradient(135deg, #10b981, #059669)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 24,
  boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
};

const toggle2FABtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#818cf8",
  fontSize: 13,
  cursor: "pointer",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  marginTop: 12,
};

const backBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#6b7280",
  fontSize: 13,
  cursor: "pointer",
  marginTop: 8,
};
