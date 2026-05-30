import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Loader2, Eye, EyeOff, ShieldCheck, Key } from "lucide-react";
import { login, verify2FACode, verify2FARecovery, getAuthenticatedUser } from "../lib/api";
import AuthLayout from "../components/AuthLayout";

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
    <AuthLayout
      variant="login"
      visualTitle="Enterprise Procurement"
      visualText="Streamline your business operations with our advanced B2B ecosystem."
      features={["✓ Verified Vendors", "✓ Automated RFQ", "✓ Secure PO"]}
      featureVariant="indigo"
    >
      {!show2FA ? (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__header">
            <img src="/assets/img/logo/emblem.jpg" alt="Huntr Logo" className="auth-logo" />
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subheading">Sign in to access your procurement dashboard</p>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email or WhatsApp</label>
            <input
              id="login-email"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="name@company.com"
              required
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="login-password"
                value={form.password}
                onChange={e => set("password", e.target.value)}
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="auth-input auth-input--with-icon"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="auth-eye-btn"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="auth-alert auth-alert--error">⚠ {error}</div>}

          <button type="submit" disabled={loading} className="auth-btn auth-btn--primary">
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="auth-footer">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="auth-link">Create an account</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handle2FASubmit} className="auth-form">
          <div className="auth-form__header auth-form__header--2fa">
            <div className="auth-2fa-icon">
              <ShieldCheck size={32} color="#fff" />
            </div>
            <h1 className="auth-heading">2FA Verification</h1>
            <p className="auth-subheading">
              {useRecovery ? "Enter recovery code" : "Enter authenticator code"}
            </p>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-2fa">
              {useRecovery ? "Recovery Code" : "Authentication Code"}
            </label>
            <input
              id="login-2fa"
              value={twoFactorCode}
              onChange={e => setTwoFactorCode(e.target.value)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={useRecovery ? "87654321" : "123456"}
              required
              className="auth-input auth-otp-input"
            />
          </div>

          {error && <div className="auth-alert auth-alert--error">⚠ {error}</div>}

          <button type="submit" disabled={loading} className="auth-btn auth-btn--primary">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Continue"}
          </button>

          <button
            type="button"
            onClick={() => { setUseRecovery(!useRecovery); setTwoFactorCode(""); }}
            className="auth-text-btn auth-text-btn--link"
          >
            <Key size={14} />
            {useRecovery ? "Use authenticator app" : "Use recovery code"}
          </button>

          <button
            type="button"
            onClick={() => { setShow2FA(false); setTwoFactorCode(""); }}
            className="auth-text-btn auth-text-btn--muted"
          >
            Back to Login
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
