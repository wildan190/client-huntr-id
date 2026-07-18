import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Loader2, Eye, EyeOff, MessageSquareCode, ArrowLeft } from "lucide-react";
import { register, sendOtp, verifyOtp, loadOtpSession, clearOtpSession, getCsrfCookie } from "../lib/api";
import { isValidWhatsapp } from "../lib/whatsapp";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const initialWhatsapp = searchParams.get("whatsapp") || "";

  const [form, setForm] = useState({ name: "", email: "", password: "", whatsapp: initialWhatsapp });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [canonicalWhatsapp, setCanonicalWhatsapp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (k === "whatsapp" && otpSent) {
      setOtpSent(false);
      setOtp("");
      setCanonicalWhatsapp("");
      setOtpToken("");
      clearOtpSession();
      setDebugOtp(null);
      setError(null);
      setSuccessMsg(null);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const company = localStorage.getItem("active_company");
      navigate(company ? "/" : "/select-company");
    }
    
    // Initialize CSRF cookie on component mount
    getCsrfCookie().catch(err => {
      console.warn("Failed to initialize CSRF cookie:", err);
    });
  }, [navigate]);

  const handleSendOtp = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    console.log(`[handleSendOtp] Button clicked, sendingOtp: ${sendingOtp}, resendCooldown: ${resendCooldown}`);
    if (sendingOtp || (resendCooldown > 0 && otpSent)) return;
    if (!form.name || !form.whatsapp || !form.password) {
      setError("Please fill in Name, WhatsApp Number, and Password first.");
      return;
    }
    if (!isValidWhatsapp(form.whatsapp)) {
      setError("Invalid WhatsApp format. Use 08xxxxxxxxxx (e.g. 085156334793).");
      return;
    }
    setSendingOtp(true);
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      console.log(`[handleSendOtp] Calling sendOtp with whatsapp: ${form.whatsapp}`);
      const res = await sendOtp({ whatsapp: form.whatsapp });
      console.log(`[handleSendOtp] sendOtp response:`, res);
      setOtpSent(true);
      setCanonicalWhatsapp(res.whatsapp || form.whatsapp);
      setOtpToken(res.otp_token || "");
      setResendCooldown(60);
      const sentNote = res.whatsapp_sent === false
        ? " WhatsApp delivery failed — use Debug OTP below."
        : "";
      setSuccessMsg(`OTP ready.${sentNote} Number: ${res.whatsapp || form.whatsapp}`);
      if (res.otp) setDebugOtp(String(res.otp));
    } catch (err: any) {
      setError(err.message || "Failed to send OTP code. Please try again.");
    } finally {
      setSendingOtp(false);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!otpSent) return;
    if (!otp) {
      setError("Please enter the OTP verification code.");
      return;
    }
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const session = loadOtpSession();
      const phone = session?.whatsapp || canonicalWhatsapp || form.whatsapp;
      await verifyOtp({ whatsapp: phone, otp, otp_token: otpToken || session?.otp_token });

      clearOtpSession();

      const registerPayload = {
        name: form.name,
        whatsapp: phone,
        password: form.password,
        email: form.email || undefined,
      };

      const userPayload = await register(registerPayload);
      console.log("[handleSubmit] User payload after register:", userPayload);
      
      const user = {
        id: userPayload?.id,
        name: userPayload?.name || form.name,
        email: userPayload?.email || form.email,
        whatsapp: userPayload?.whatsapp || phone,
        role: userPayload?.role || null, // Don't default to 'buyer' - let backend handle proper role assignment
        token: userPayload?.token || null, // IMPORTANT: Save token!
      };

      console.log("[handleSubmit] Saving user session:", user);
      localStorage.setItem("user_session", JSON.stringify(user));
      localStorage.removeItem("active_company");
      
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "Verification or registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      variant="register"
      visualTitle="Join the Ecosystem"
      visualText="Connect with verified business partners and expand your procurement reach."
      features={["✓ Seamless Onboarding", "✓ High-Fidelity UX", "✓ Secure Protocol"]}
      featureVariant="amber"
    >
      <form className="auth-form">
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ui-text-muted)", marginBottom: 24, textDecoration: "none" }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="auth-form__header">
          <h1 className="auth-heading">Create Account</h1>
          <p className="auth-subheading">Register and verify your workspace identity</p>
        </div>

        <div className="auth-scroll-area">
          <div className="auth-field">
            <label className="auth-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              type="text"
              autoComplete="name"
              placeholder="e.g. Budi Santoso"
              required
              disabled={otpSent}
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="register-whatsapp">WhatsApp Number</label>
            <div className="auth-input-wrap">
              <input
                id="register-whatsapp"
                value={form.whatsapp}
                onChange={e => set("whatsapp", e.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="e.g. 085156334793"
                required
                disabled={otpSent}
                className="auth-input"
                style={otpSent ? { paddingRight: 72 } : undefined}
              />
              {otpSent && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => setOtpSent(false)}
                  onKeyDown={e => e.key === "Enter" && setOtpSent(false)}
                  className="auth-change-link"
                >
                  Change
                </span>
              )}
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="register-email">Work Email (Optional)</label>
            <input
              id="register-email"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="budi@company.com"
              disabled={otpSent}
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="register-password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="register-password"
                value={form.password}
                onChange={e => set("password", e.target.value)}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="min. 8 characters"
                required
                disabled={otpSent}
                className="auth-input auth-input--with-icon"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                disabled={otpSent}
                className="auth-eye-btn"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="auth-otp-box">
              <label
                className="auth-label"
                htmlFor="register-otp"
                style={{ color: "#fdba74", display: "flex", alignItems: "center", gap: 6, textTransform: "none", letterSpacing: 0 }}
              >
                <MessageSquareCode size={14} /> Verification Code
              </label>
              <input
                id="register-otp"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit OTP"
                required
                maxLength={6}
                className="auth-input auth-otp-input"
              />
              {debugOtp && (
                <div className="auth-debug-otp">Debug OTP (local): {debugOtp}</div>
              )}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || sendingOtp || resendCooldown > 0}
                className="auth-btn auth-btn--ghost"
              >
                {resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : sendingOtp
                    ? "Sending..."
                    : "Resend OTP"
                }
              </button>
            </div>
          )}
        </div>

        {error && <div className="auth-alert auth-alert--error">⚠ {error}</div>}
        {successMsg && <div className="auth-alert auth-alert--success">✓ {successMsg}</div>}

        {!otpSent ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || sendingOtp}
            className="auth-btn auth-btn--primary"
          >
            {loading || sendingOtp ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Sending...
              </>
            ) : (
              "Request OTP Code"
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="auth-btn auth-btn--success"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Verifying...
              </>
            ) : (
              "Verify & Create Account"
            )}
          </button>
        )}

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
