import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { createRfq, getMyCompanies, apiGet, apiPost } from "../lib/api";
import { ShoppingCart, Calendar, ClipboardList, CheckCircle2, Loader2, AlertCircle, ArrowRight, UserCheck } from "lucide-react";

interface RfqItem {
  catalogue_id: number;
  qty: number;
  expected_date: string;
  name?: string;
}

export default function Rfq() {
  const [user, setUser] = useState<any>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // RFQ List state
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [rfqsLoading, setRfqsLoading] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    const activeComp = localStorage.getItem("active_company");
    if (session) setUser(JSON.parse(session));
    if (activeComp) {
      const comp = JSON.parse(activeComp);
      setActiveCompany(comp);
      fetchRfqs(comp.id);
    }

    const savedCart = localStorage.getItem("rfq_cart");
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartItems(items.map((i: any) => ({
        ...i,
        catalogue_id: i.id,
        expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 7 days from now
      })));
    }
  }, []);

  const fetchRfqs = async (companyId: number) => {
    setRfqsLoading(true);
    try {
      // Assuming there's an endpoint for listing RFQs by company
      const data = await apiGet(`/api/rfqs?company_id=${companyId}`);
      setRfqs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to fetch RFQs", err);
    } finally {
      setRfqsLoading(false);
    }
  };

  const handleApproveRfq = async (rfqId: number) => {
    if (!user) return;
    try {
      await apiPost(`/api/rfqs/${rfqId}/approve`, { manager_id: user.id });
      if (activeCompany) fetchRfqs(activeCompany.id);
    } catch (err: any) {
      alert(err.message || "Failed to approve RFQ");
    }
  };

  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  
  const updateItemDate = (id: number, date: string) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, expected_date: date } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) { setError("No active company workspace"); return; }
    if (cartItems.length === 0) { setError("Cart is empty. Add items from Catalogue first."); return; }
    
    setLoading(true); setError(null);
    try {
      const data = await createRfq({
        company_id: activeCompany.id,
        title: form.title,
        description: form.description,
        items: cartItems.map(it => ({
          catalogue_id: it.catalogue_id,
          qty: it.qty,
          expected_date: it.expected_date,
        })),
      });
      setResult(data.rfq);
      localStorage.removeItem("rfq_cart");
      setCartItems([]);
      fetchRfqs(activeCompany.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Request for Quotation (RFQ)" subtitle="Manage purchase requests, approvals, and open tenders.">
      <div className="rfq-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Create RFQ Section */}
          <div className="rfq-form">
            {result ? (
              <div className="glass-panel" style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <CheckCircle2 size={32} color="#34d399" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>RFQ Berhasil Dibuat!</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Status: <span style={{ color: "#fbbf24", fontWeight: 700 }}>DRAFT</span> (Menunggu Approval Manager)</div>
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 16, padding: 20, marginBottom: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <KV label="RFQ ID" value={`#${result.id}`} />
                  <KV label="Title" value={result.title} />
                  <KV label="Items" value={`${cartItems.length} items`} />
                </div>
                <button onClick={() => setResult(null)} style={primaryBtn}>Buat RFQ Baru</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <ClipboardList size={20} color="#f59e0b" />
                  <Section>Create New Purchase Request</Section>
                </div>

                <Field label="RFQ Title" value={form.title} onChange={v => setF("title", v)} placeholder="e.g. Pengadaan Laptop Divisi IT Q3" required />
                
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={lbl}>Justification / Description</label>
                  <textarea value={form.description} onChange={e => setF("description", e.target.value)}
                    required rows={3} placeholder="Jelaskan kebutuhan pengadaan ini..."
                    style={{ ...inputStyle, resize: "none" }} />
                </div>

                {/* Items from Cart */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Section>Items to Procure ({cartItems.length})</Section>
                    <button type="button" onClick={() => window.location.href="/catalogue"} style={{ ...ghostBtn, fontSize: 11 }}>+ Add More Items</button>
                  </div>
                  
                  {cartItems.length === 0 ? (
                    <div style={{ padding: 30, textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12 }}>
                      <ShoppingCart size={24} color="#374151" style={{ marginBottom: 10 }} />
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Your cart is empty.</div>
                      <button type="button" onClick={() => window.location.href="/catalogue"} style={{ marginTop: 12, color: "#fb923c", background: "none", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Browse Catalogue</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {cartItems.map((item, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, display: "grid", gridTemplateColumns: "1fr 100px auto", gap: 12, alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#f3f4f6" }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>{item.item_code} · Qty: {item.qty}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={{ ...lbl, fontSize: 10 }}>Expected Date</label>
                            <input value={item.expected_date} onChange={e => updateItemDate(item.id, e.target.value)}
                              type="date" required style={{ ...inputStyle, padding: "6px 8px", fontSize: 11 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && <ErrorBox message={error} />}
                <button type="submit" disabled={loading || cartItems.length === 0} style={primaryBtn}>
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Submit for Approval"}
                </button>
              </form>
            )}
          </div>

          {/* RFQ Tracking Section */}
          <div className="rfq-tracking glass-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ClipboardList size={20} color="#f97316" />
                <Section>Your RFQs & Tenders</Section>
              </div>
              <button onClick={() => activeCompany && fetchRfqs(activeCompany.id)} style={{ background: "none", border: "none", color: "#fb923c", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Refresh</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 600 }}>
              {rfqsLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}><Loader2 className="animate-spin" color="#f59e0b" /></div>
              ) : rfqs.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#4b5563", fontSize: 13 }}>No RFQs found.</div>
              ) : (
                rfqs.map(rfq => (
                  <div key={rfq.id} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>#{rfq.id} · {new Date(rfq.created_at).toLocaleDateString()}</div>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: "#f3f4f6", margin: "4px 0" }}>{rfq.title}</h4>
                      </div>
                      <StatusTag status={rfq.status} />
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {rfq.items?.length || 0} items requested
                      </div>
                      
                      {/* Manager Approval Button */}
                      {rfq.status === 'draft' && user?.role === 'manager' && (
                        <button
                          onClick={() => handleApproveRfq(rfq.id)}
                          style={{
                            background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
                            borderRadius: 8, padding: "6px 12px", color: "#34d399",
                            fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                          }}
                        >
                          <UserCheck size={14} /> Approve RFQ
                        </button>
                      )}

                      {rfq.status === 'active' && (
                        <div style={{ fontSize: 11, color: "#f97316", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          Tender Open <ArrowRight size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
    </Layout>
  );
}

function StatusTag({ status }: { status: string }) {
  const colors: any = {
    draft: { bg: "rgba(156,163,175,0.1)", text: "#9ca3af", label: "DRAFT" },
    active: { bg: "rgba(52,211,153,0.1)", text: "#34d399", label: "OPEN TENDER" },
    closed: { bg: "rgba(239,68,68,0.1)", text: "#f87171", label: "CLOSED" },
    awarded: { bg: "rgba(251,146,60,0.1)", text: "#f97316", label: "AWARDED" },
  };
  const s = colors[status] || colors.draft;
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.text}30`,
      padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, letterSpacing: "0.05em"
    }}>
      {s.label}
    </span>
  );
}

function KV({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12 }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ color: "#f3f4f6", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = { yellow: "#fbbf24", green: "#34d399", red: "#f87171", indigo: "#fdba74" };
  return <span style={{ background: `${colors[color]}20`, color: colors[color], border: `1px solid ${colors[color]}40`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{children}</span>;
}
function Section({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</div>;
}
const lbl: React.CSSProperties = { fontSize: 12, color: "#9ca3af", fontWeight: 500 };
const inputStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#fff",
  outline: "none", width: "100%", boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer",
  border: "none", background: "linear-gradient(135deg,#f97316,#f59e0b)", color: "#fff",
};
const ghostBtn: React.CSSProperties = {
  padding: "7px 14px", borderRadius: 8, fontWeight: 600, cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#d1d5db",
};
interface FieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, value, onChange, type = "text", placeholder, required }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={lbl}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type}
        placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  );
}
function ErrorBox({ message }: { message: string }) {
  return <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171" }}>⚠ {message}</div>;
}
