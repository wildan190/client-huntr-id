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
  verifyOtp
} from "../lib/api";

export default function AccountSettings() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"security" | "profile" | "sessions">("security");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const u = JSON.parse(session);
      setUser(u);
      setNewWhatsapp(u.whatsapp || "");
    }
    fetchSessions();
  }, []);

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
    if (!newWhatsapp) {
      setError("Silakan masukkan nomor WhatsApp baru.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await sendOtp({ whatsapp: newWhatsapp });
      setOtpSent(true);
      setSuccess("Kode OTP telah dikirim ke nomor WhatsApp baru.");
      if (res.otp) setDebugOtp(res.otp);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await verifyOtp({ whatsapp: newWhatsapp, otp });
      const data = await updateWhatsapp({ whatsapp: newWhatsapp });
      
      // Update local storage
      const updatedUser = { ...user, whatsapp: newWhatsapp };
      localStorage.setItem("user_session", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess("Nomor WhatsApp berhasil diperbarui!");
      setOtpSent(false);
      setOtp("");
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
                      if (otpSent) setOtpSent(false);
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
                  <label style={{ ...labelStyle, color: "#a5b4fc" }}>
                    <MessageSquareCode size={14} style={{ marginRight: 6 }} /> Masukkan Kode OTP
                  </label>
                  <input 
                    type="text" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)}
                    placeholder="6 digit kode"
                    required 
                    maxLength={6}
                    style={inputStyle} 
                  />
                  {debugOtp && (
                    <div style={{ fontSize: 11, color: "#34d399", marginTop: 8, fontWeight: 600 }}>
                      🔧 Debug OTP: {debugOtp}
                    </div>
                  )}
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
                <button onClick={fetchSessions} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Refresh</button>
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
                        background: session.is_current_device ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: session.is_current_device ? "#818cf8" : "#9ca3af"
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
              
              <div style={{ marginTop: 10, padding: 16, background: "rgba(99,102,241,0.05)", borderRadius: 14, border: "1px solid rgba(99,102,241,0.1)" }}>
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
      background: active ? "rgba(99,102,241,0.1)" : "transparent",
      border: "none", color: active ? "#a5b4fc" : "#9ca3af",
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
  background: "linear-gradient(135deg,#a855f7,#6366f1)",
  color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
  marginTop: 10
};
const secondaryBtn: React.CSSProperties = {
  padding: "0 20px", borderRadius: 12, border: "1px solid rgba(99,102,241,0.3)",
  background: "rgba(99,102,241,0.1)", color: "#818cf8", fontWeight: 600, fontSize: 13, cursor: "pointer"
};
const otpSection: React.CSSProperties = {
  marginTop: 10, padding: 20, background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.1)",
  borderRadius: 16, display: "flex", flexDirection: "column", gap: 8
};
