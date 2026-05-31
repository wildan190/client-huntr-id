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
      setSuccess("2FA sedang diaktifkan. Silakan pindai kode QR.");
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
      
      setSuccess("2FA Berhasil diaktifkan!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Apakah Anda yakin ingin menonaktifkan 2FA?")) return;
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
      setSuccess("Password berhasil diperbarui!");
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
      setError("Silakan masukkan nomor WhatsApp baru.");
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
      
      setSuccess("Nomor WhatsApp berhasil diperbarui!");
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
    if (!confirm("Apakah Anda yakin ingin menghentikan sesi ini?")) return;
    try {
      await logoutSession(sessionId);
      fetchSessions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Layout title="Pengaturan Akun" subtitle="Kelola keamanan dan profil Anda">
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 0" }}>
        
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.03)", padding: 6, borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
          <TabBtn active={activeTab === "security"} onClick={() => setActiveTab("security")} Icon={Shield} label="Keamanan" />
          <TabBtn active={activeTab === "profile"} onClick={() => setActiveTab("profile")} Icon={Smartphone} label="Profil" />
          <TabBtn active={activeTab === "sessions"} onClick={() => setActiveTab("sessions")} Icon={Monitor} label="Sesi Aktif" />
        </div>

        {/* Feedback messages */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#f87171", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#34d399", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <div style={{ background: "rgba(15,15,30,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 32 }}>
          
          {/* Security Tab */}
          {activeTab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Ganti Password</h2>
                
                <div style={inputGroup}>
                  <label style={labelStyle}>Password Saat Ini</label>
                  <input 
                    type="password" 
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

              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Autentikasi Dua Faktor (2FA)</h2>
                
                {!twoFactorEnabled && !confirming2FA && (
                  <div style={{ padding: 20, background: "rgba(249,115,22,0.05)", borderRadius: 16, border: "1px solid rgba(249,115,22,0.1)" }}>
                    <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 20 }}>Tingkatkan keamanan akun Anda dengan mengaktifkan autentikasi dua faktor.</p>
                    <button onClick={handleEnable2FA} disabled={loading} style={{ ...secondaryBtn, height: 44 }}>
                      Aktifkan 2FA
                    </button>
                  </div>
                )}

                {confirming2FA && qrCode && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 14, color: "#fff" }}>Pindai kode QR berikut menggunakan aplikasi autentikator Anda (seperti Google Authenticator):</p>
                    <div dangerouslySetInnerHTML={{ __html: qrCode }} style={{ background: "#fff", padding: 12, borderRadius: 12, width: "fit-content" }} />
                    
                    <div style={inputGroup}>
                      <label style={labelStyle}>Masukkan Kode Konfirmasi</label>
                      <input 
                        type="text" 
                        value={twoFactorCode} 
                        onChange={e => setTwoFactorCode(e.target.value)}
                        placeholder="6 digit kode"
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
                  <div style={{ padding: 20, background: "rgba(16,185,129,0.05)", borderRadius: 16, border: "1px solid rgba(16,185,129,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#34d399", marginBottom: 12 }}>
                      <CheckCircle2 size={18} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>2FA Aktif</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>Akun Anda sekarang lebih aman. Gunakan kode dari aplikasi autentikator Anda saat login.</p>
                    
                    {recoveryCodes.length > 0 && (
                      <div style={{ marginBottom: 20, padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Simpan kode pemulihan ini di tempat yang aman:</p>
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
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Informasi WhatsApp</h2>
              
              <div style={inputGroup}>
                <label style={labelStyle}>Nomor WhatsApp</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input 
                    type="tel" 
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
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "6px 0 0" }}>Ini adalah nomor WhatsApp Anda saat ini.</p>
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
                    placeholder="6 digit kode"
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
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Sesi Aktif</h2>
                <button onClick={fetchSessions} style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Refresh</button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sessions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
                    <Monitor size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p>Tidak ada data sesi aktif.</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} style={{ 
                      background: "rgba(255,255,255,0.03)", 
                      border: "1px solid rgba(255,255,255,0.05)", 
                      borderRadius: 16, 
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 16
                    }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: 10, 
                        background: session.is_current_device ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: session.is_current_device ? "#fb923c" : "#9ca3af"
                      }}>
                        <Monitor size={20} />
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#f3f4f6" }}>{session.ip_address}</span>
                          {session.is_current_device && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 20 }}>PERANGKAT INI</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                          {session.user_agent}
                        </div>
                        <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
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
                            transition: "all 0.2s"
                          }}
                          title="Hentikan sesi"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div style={{ marginTop: 10, padding: 16, background: "rgba(249,115,22,0.05)", borderRadius: 14, border: "1px solid rgba(249,115,22,0.1)" }}>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>
                  <strong>Catatan:</strong> Jika Anda melihat aktivitas yang mencurigakan, segera ganti password Anda dan hentikan semua sesi aktif lainnya.
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
      border: "none", color: active ? "#fdba74" : "#9ca3af",
      fontWeight: active ? 700 : 500, fontSize: 13, transition: "all 0.2s",
    }}>
      <Icon size={16} /> {label}
    </button>
  );
}

const inputGroup: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8 };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#9ca3af" };
const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: "12px 16px",
  color: "#fff",
  fontSize: 14,
  outline: "none",
};
const eyeBtn: React.CSSProperties = {
  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 8
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
  borderRadius: 16, display: "flex", flexDirection: "column", gap: 8
};
