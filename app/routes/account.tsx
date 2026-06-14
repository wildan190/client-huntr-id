import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Loader2, 
  Eye, 
  EyeOff, 
  MessageSquareCode, 
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2
} from "lucide-react";
import { 
  updatePassword, 
  updateWhatsapp, 
  getSessions, 
  logoutSession,
  sendOtp,
  verifyOtp,
  loadOtpSession,
  clearOtpSession,
  enable2FA,
  disable2FA,
  get2FAQRCode,
  get2FARecoveryCodes,
  confirm2FA
} from "../lib/api";
import Swal from "sweetalert2";

export default function AccountSettings() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"security" | "profile" | "sessions">("security");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [confirming2FA, setConfirming2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [showPw, setShowPw] = useState(false);

  // WhatsApp state
  const [newWhatsapp, setNewWhatsapp] = useState("");
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

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const u = JSON.parse(session);
      setUser(u);
      setNewWhatsapp(u.whatsapp || "");
      setTwoFactorEnabled(!!u.two_factor_confirmed_at);
    }
    fetchSessions();
  }, []);

  const handleEnable2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      await enable2FA();
      const qrRes = await get2FAQRCode();
      setQrCode(qrRes.svg);
      setConfirming2FA(true);
      setSuccess("2FA is being activated. Please scan the QR code.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      await confirm2FA(twoFactorCode);
      const codesRes = await get2FARecoveryCodes();
      setRecoveryCodes(codesRes);
      setTwoFactorEnabled(true);
      setConfirming2FA(false);
      setQrCode(null);
      setTwoFactorCode("");
      
      // Update local storage user object
      const updatedUser = { ...user, two_factor_confirmed_at: new Date().toISOString() };
      localStorage.setItem("user_session", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess("2FA successfully activated!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA?")) return;
    setLoading(true);
    setError(null);
    try {
      await disable2FA();
      setTwoFactorEnabled(false);
      setRecoveryCodes([]);
      
      // Update local storage
      const updatedUser = { ...user, two_factor_confirmed_at: null };
      localStorage.setItem("user_session", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess("2FA dinonaktifkan.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updatePassword(passwordForm);
      setSuccess("Password successfully updated!");
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (sendingOtp || (resendCooldown > 0 && otpSent)) return;
    if (!newWhatsapp) {
      setError("Please enter a new WhatsApp number.");
      return;
    }
    setSendingOtp(true);
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await sendOtp({ whatsapp: newWhatsapp });
      setOtpSent(true);
      setCanonicalWhatsapp(res.whatsapp || newWhatsapp);
      setOtpToken(res.otp_token || "");
      setResendCooldown(60);
      setSuccess("Kode OTP telah dikirim. Gunakan kode terbaru dari WhatsApp.");
      if (res.otp) setDebugOtp(String(res.otp));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
      setLoading(false);
    }
  };

  const handleUpdateWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Masukkan kode OTP 6 digit.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const session = loadOtpSession();
      const phone = session?.whatsapp || canonicalWhatsapp || newWhatsapp;
      await verifyOtp({ whatsapp: phone, otp, otp_token: otpToken || session?.otp_token });
      clearOtpSession();
      const data = await updateWhatsapp({ whatsapp: phone });

      const updatedUser = { ...user, whatsapp: data.user?.whatsapp || phone };
      localStorage.setItem("user_session", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess("WhatsApp number successfully updated!");
      setOtpSent(false);
      setOtp("");
      setCanonicalWhatsapp("");
      setOtpToken("");
      clearOtpSession();
      setDebugOtp(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId: string) => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Terminate Session?',
      text: 'Are you sure you want to terminate this session?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Terminate',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;
    
    try {
      await logoutSession(sessionId);
      fetchSessions();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message
      });
    }
  };

  return (
    <Layout title="Account Settings" subtitle="Manage your security and profile">
      <div style={{ maxWidth: "100%", width: "100%" }}>
        
        {/* Tabs */}
        <div className="huntr-tabs-row" style={{ marginBottom: 24, background: "var(--ui-bg-input)", padding: 6, borderRadius: 14, border: "1px solid var(--ui-border-subtle)", transition: "all 0.3s ease" }}>
          <TabBtn active={activeTab === "security"} onClick={() => setActiveTab("security")} Icon={Shield} label="Keamanan" />
          <TabBtn active={activeTab === "profile"} onClick={() => setActiveTab("profile")} Icon={Smartphone} label="Profil" />
          <TabBtn active={activeTab === "sessions"} onClick={() => setActiveTab("sessions")} Icon={Monitor} label="Sesi Aktif" />
        </div>

        {/* Feedback messages */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#f87171", fontSize: 14, display: "flex", alignItems: "center", gap: 10, transition: "all 0.3s ease" }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#34d399", fontSize: 14, display: "flex", alignItems: "center", gap: 10, transition: "all 0.3s ease" }}>
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 24, padding: "clamp(20px, 5vw, 32px)", transition: "all 0.3s ease" }}>
          
          {/* Security Tab */}
          {activeTab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ui-text-primary)", margin: "0 0 8px", transition: "color 0.3s ease" }}>Ganti Password</h2>
                
                <div style={inputGroup}>
                  <label style={labelStyle}>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter current password"
                    value={passwordForm.current_password} 
                    onChange={e => setPasswordForm(p => ({ ...p, current_password: e.target.value }))}
                    required 
                    style={inputStyle} 
                  />
                </div>

                <div style={inputGroup}>
                  <label style={labelStyle}>Password Baru</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showPw ? "text" : "password"} 
                      placeholder="Masukkan password baru"
                      value={passwordForm.password} 
                      onChange={e => setPasswordForm(p => ({ ...p, password: e.target.value }))}
                      required 
                      style={{ ...inputStyle, paddingRight: 45 }} 
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={eyeBtn}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={inputGroup}>
                  <label style={labelStyle}>Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    placeholder="Konfirmasi password baru"
                    value={passwordForm.password_confirmation} 
                    onChange={e => setPasswordForm(p => ({ ...p, password_confirmation: e.target.value }))}
                    required 
                    style={inputStyle} 
                  />
                </div>

                <button type="submit" disabled={loading} style={primaryBtn}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Simpan Perubahan"}
                </button>
              </form>

              <div style={{ height: "1px", background: "var(--ui-border)", transition: "all 0.3s ease" }} />

              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ui-text-primary)", margin: "0 0 16px", transition: "color 0.3s ease" }}>Autentikasi Dua Faktor (2FA)</h2>
                
                {!twoFactorEnabled && !confirming2FA && (
                  <div style={{ padding: 20, background: "rgba(249,115,22,0.05)", borderRadius: 16, border: "1px solid rgba(249,115,22,0.1)", transition: "all 0.3s ease" }}>
                    <p style={{ fontSize: 14, color: "var(--ui-text-secondary)", marginBottom: 20, transition: "color 0.3s ease" }}>Enhance your account security by enabling two-factor authentication.</p>
                    <button onClick={handleEnable2FA} disabled={loading} style={{ ...secondaryBtn, height: 44 }}>
                      Enable 2FA
                    </button>
                  </div>
                )}

                {confirming2FA && qrCode && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 20, background: "var(--ui-bg-input)", borderRadius: 16, border: "1px solid var(--ui-border-subtle)", transition: "all 0.3s ease" }}>
                    <p style={{ fontSize: 14, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>Scan the following QR code using your authenticator app (such as Google Authenticator):</p>
                    <div dangerouslySetInnerHTML={{ __html: qrCode }} style={{ background: "#fff", padding: 12, borderRadius: 12, width: "fit-content" }} />
                    
                    <div style={inputGroup}>
                      <label style={labelStyle}>Masukkan Kode Konfirmasi</label>
                      <input 
                        type="text" 
                        value={twoFactorCode} 
                        onChange={e => setTwoFactorCode(e.target.value)}
                        placeholder="Masukkan 6 digit kode dari aplikasi autentikator"
                        style={inputStyle} 
                      />
                    </div>
                    
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={handleConfirm2FA} disabled={loading} style={{ ...primaryBtn, flex: 1, marginTop: 0 }}>Konfirmasi</button>
                      <button onClick={() => { setConfirming2FA(false); setQrCode(null); }} style={{ ...secondaryBtn, flex: 1 }}>Batal</button>
                    </div>
                  </div>
                )}

                {twoFactorEnabled && (
                  <div style={{ padding: 20, background: "rgba(16,185,129,0.05)", borderRadius: 16, border: "1px solid rgba(16,185,129,0.1)", transition: "all 0.3s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#34d399", marginBottom: 12 }}>
                      <CheckCircle2 size={18} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>2FA Aktif</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", marginBottom: 20, transition: "color 0.3s ease" }}>Your account is now more secure. Use the code from your authenticator app when logging in.</p>
                    
                    {recoveryCodes.length > 0 && (
                      <div style={{ marginBottom: 20, padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 12, transition: "all 0.3s ease" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-primary)", marginBottom: 8, transition: "color 0.3s ease" }}>Simpan kode pemulihan ini di tempat yang aman:</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {recoveryCodes.map(code => <code key={code} style={{ fontSize: 11, color: "#fdba74" }}>{code}</code>)}
                        </div>
                      </div>
                    )}

                    <button onClick={handleDisable2FA} disabled={loading} style={{ ...secondaryBtn, borderColor: "rgba(239,68,68,0.3)", color: "#f87171", background: "rgba(239,68,68,0.05)" }}>
                      Nonaktifkan 2FA
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateWhatsapp} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ui-text-primary)", margin: "0 0 8px", transition: "color 0.3s ease" }}>Informasi WhatsApp</h2>
              
              <div style={inputGroup}>
                <label style={labelStyle}>Nomor WhatsApp</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input 
                    type="tel" 
                    placeholder="Contoh: +62812345678"
                    value={newWhatsapp} 
                    onChange={e => {
                      setNewWhatsapp(e.target.value);
                      if (otpSent) {
                        setOtpSent(false);
                        setCanonicalWhatsapp("");
                        setOtpToken("");
                        clearOtpSession();
                      }
                    }}
                    required 
                    disabled={otpSent}
                    style={{ ...inputStyle, flex: 1 }} 
                  />
                  {!otpSent && (
                    <button type="button" onClick={handleSendOtp} disabled={loading || newWhatsapp === user?.whatsapp} style={secondaryBtn}>
                      {loading ? <Loader2 size={16} className="animate-spin" /> : "Verifikasi Nomor"}
                    </button>
                  )}
                </div>
                {newWhatsapp === user?.whatsapp && (
                  <p style={{ fontSize: 12, color: "var(--ui-text-muted)", margin: "6px 0 0", transition: "color 0.3s ease" }}>This is your current WhatsApp number.</p>
                )}
              </div>

              {otpSent && (
                <div style={otpSection}>
                  <label style={{ ...labelStyle, color: "#fdba74" }}>
                    <MessageSquareCode size={14} style={{ marginRight: 6 }} /> Masukkan Kode OTP
                  </label>
                  <input 
                    type="text" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    placeholder="Masukkan 6 digit kode OTP dari WhatsApp"
                    required 
                    maxLength={6}
                    style={inputStyle} 
                  />
                  {debugOtp && (
                    <div style={{ fontSize: 11, color: "#34d399", marginTop: 8, fontWeight: 600 }}>
                      Debug OTP (local): {debugOtp}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || sendingOtp || resendCooldown > 0}
                    style={{ background: "none", border: "none", color: "#fb923c", fontSize: 12, cursor: "pointer", marginTop: 8, textDecoration: "underline", alignSelf: "flex-start" }}
                  >
                    {resendCooldown > 0
                      ? `Kirim ulang OTP (${resendCooldown}s)`
                      : sendingOtp
                        ? "Mengirim..."
                        : "Kirim ulang OTP"
                    }
                  </button>
                  <button type="submit" disabled={loading} style={{ ...primaryBtn, marginTop: 16, background: "linear-gradient(135deg,#34d399,#10b981)" }}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Konfirmasi & Perbarui"}
                  </button>
                  <button type="button" onClick={() => setOtpSent(false)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 12, cursor: "pointer", marginTop: 10, textDecoration: "underline" }}>
                    Batal / Ganti Nomor
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ui-text-primary)", margin: 0, transition: "color 0.3s ease" }}>Sesi Aktif</h2>
                <button onClick={fetchSessions} style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Refresh</button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sessions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
                    <Monitor size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p>No active session data.</p>
                  </div>
                ) : (
                  sessions.map((session) => {
                    const isMobile = session.name?.toLowerCase().includes('android') || session.name?.toLowerCase().includes('ios') || session.user_agent?.toLowerCase().includes('mobile');
                    const Icon = isMobile ? Smartphone : Monitor;

                    return (
                      <div key={session.id} style={{ 
                        background: "var(--ui-bg-input)", 
                        border: "1px solid var(--ui-border-subtle)", 
                        borderRadius: 16, 
                        padding: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{ 
                          width: 40, height: 40, borderRadius: 10, 
                          background: session.is_current_device ? "rgba(249,115,22,0.15)" : "var(--ui-bg-input)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: session.is_current_device ? "#fb923c" : "var(--ui-text-secondary)",
                          transition: "all 0.3s ease"
                        }}>
                          <Icon size={20} />
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                              {session.type === 'API Token' ? (session.name || 'Unknown Device') : session.ip_address}
                            </span>
                            <span style={{ 
                              fontSize: 9, fontWeight: 800, color: session.type === 'API Token' ? '#3b82f6' : '#9ca3af', 
                              background: session.type === 'API Token' ? 'rgba(59,130,246,0.1)' : 'rgba(156,163,175,0.1)', 
                              padding: "2px 6px", borderRadius: 4, textTransform: 'uppercase'
                            }}>
                              {session.type === 'API Token' ? 'API' : 'WEB'}
                            </span>
                            {session.is_current_device && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 20 }}>PERANGKAT INI</span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--ui-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2, transition: "color 0.3s ease" }}>
                            {session.type === 'API Token' ? `Authorized via Bearer Token` : session.user_agent}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ui-text-secondary)", marginTop: 4, display: "flex", alignItems: "center", gap: 4, transition: "color 0.3s ease" }}>
                            <Clock size={10} /> Aktif terakhir: {session.last_active}
                          </div>
                        </div>

                        {!session.is_current_device && (
                          <button 
                            onClick={() => handleLogoutSession(session.id)}
                            style={{ 
                              width: 32, height: 32, borderRadius: 8, 
                              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                              color: "#f87171", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.3s ease"
                            }}
                            title="Hentikan sesi"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              <div style={{ marginTop: 10, padding: 16, background: "rgba(249,115,22,0.05)", borderRadius: 14, border: "1px solid rgba(249,115,22,0.1)", transition: "all 0.3s ease" }}>
                <p style={{ fontSize: 12, color: "var(--ui-text-secondary)", margin: 0, lineHeight: 1.5, transition: "color 0.3s ease" }}>
                  <strong>Note:</strong> If you see any suspicious activity, change your password immediately and terminate all other active sessions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function TabBtn({ active, onClick, Icon, label }: any) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "10px 16px", borderRadius: 10, cursor: "pointer",
      background: active ? "rgba(249,115,22,0.1)" : "transparent",
      border: "none", color: active ? "#fdba74" : "var(--ui-text-secondary)",
      fontWeight: active ? 700 : 500, fontSize: 13, transition: "all 0.3s ease",
    }}>
      <Icon size={16} /> {label}
    </button>
  );
}

const inputGroup: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8 };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--ui-text-secondary)", transition: "color 0.3s ease" };
const inputStyle: React.CSSProperties = {
  background: "var(--ui-bg-input)",
  border: "1px solid var(--ui-border-input)",
  borderRadius: 12,
  padding: "12px 16px",
  color: "var(--ui-text-primary)",
  fontSize: 14,
  outline: "none",
  transition: "all 0.3s ease",
};
const eyeBtn: React.CSSProperties = {
  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer", color: "var(--ui-text-muted)", padding: 8, transition: "color 0.3s ease"
};
const primaryBtn: React.CSSProperties = {
  padding: "14px", borderRadius: 12, border: "none",
  background: "linear-gradient(135deg,#f97316,#f59e0b)",
  color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
  marginTop: 10
};
const secondaryBtn: React.CSSProperties = {
  padding: "0 20px", borderRadius: 12, border: "1px solid rgba(249,115,22,0.3)",
  background: "rgba(249,115,22,0.1)", color: "#fb923c", fontWeight: 600, fontSize: 13, cursor: "pointer"
};
const otpSection: React.CSSProperties = {
  marginTop: 10, padding: 20, background: "rgba(249,115,22,0.03)", border: "1px solid rgba(249,115,22,0.1)",
  borderRadius: 16, display: "flex", flexDirection: "column", gap: 8, transition: "all 0.3s ease"
};
