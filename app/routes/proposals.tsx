import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { submitProposal, apiGet } from "../lib/api";
import { Briefcase, Gavel, Award, TrendingUp, Search, Loader2, FileText, CheckCircle2, AlertCircle, Clock, ShieldCheck } from "lucide-react";

export default function Proposals() {
  const [user, setUser] = useState<any>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("tenders"); // tenders, my_proposals, rankings

  // Tenders state
  const [openRfqs, setOpenRfqs] = useState<any[]>([]);
  const [rfqsLoading, setRfqsLoading] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);

  // Proposal form state
  const [form, setForm] = useState({
    price_offer: "", delivery_days: "", warranty_months: "12",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Rankings state
  const [rankings, setRankings] = useState<any[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [rankingRfqId, setRankingRfqId] = useState<number | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    const activeComp = localStorage.getItem("active_company");
    if (session) setUser(JSON.parse(session));
    if (activeComp) {
      const comp = JSON.parse(activeComp);
      setActiveCompany(comp);
      if (comp.type === 'vendor') fetchOpenTenders();
    }
  }, []);

  const fetchOpenTenders = async () => {
    setRfqsLoading(true);
    try {
      const data = await apiGet("/api/rfqs?status=active");
      setOpenRfqs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to fetch tenders", err);
    } finally {
      setRfqsLoading(false);
    }
  };

  const fetchRankings = async (rfqId: number) => {
    setRankingsLoading(true);
    setRankingRfqId(rfqId);
    try {
      const data = await apiGet(`/api/rfqs/${rfqId}/rankings`);
      setRankings(data.rankings || []);
    } catch (err) {
      console.error("Failed to fetch rankings", err);
    } finally {
      setRankingsLoading(false);
    }
  };

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !selectedRfq) return;
    setLoading(true); setError(null);
    try {
      const data = await submitProposal({
        company_id: activeCompany.id,
        rfq_id: selectedRfq.id,
        price_offer: Number(form.price_offer),
        delivery_days: Number(form.delivery_days),
        warranty_months: Number(form.warranty_months),
      });
      setResult(data.proposal);
      setSelectedRfq(null);
      setForm({ price_offer: "", delivery_days: "", warranty_months: "12" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Vendor Tenders & Proposals" subtitle="Participate in open tenders, submit offers, and track your ranking.">
      <style>{`
        @media (max-width: 768px) {
          .proposals-container {
            grid-template-columns: 1fr !important;
          }
          .proposals-sidebar {
            display: none !important;
          }
          .proposals-tabs {
            flex-wrap: wrap !important;
          }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Tabs */}
        <div className="proposals-tabs" style={{ display: "flex", gap: 12, borderBottom: `1px solid var(--ui-border)`, paddingBottom: 1 }}>
          {[
            { id: "tenders", label: "Open Tenders", icon: Gavel },
            { id: "rankings", label: "My Rank & SAW Analysis", icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "12px 20px",
                background: "none", border: "none", cursor: "pointer",
                color: activeTab === tab.id ? "var(--ui-text-nav-active)" : "var(--ui-text-nav-idle)",
                fontWeight: activeTab === tab.id ? 700 : 500, fontSize: 13,
                borderBottom: activeTab === tab.id ? `2px solid var(--huntr-amber)` : "2px solid transparent",
                marginBottom: -1, transition: "all 0.2s"
              }}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "tenders" && (
          <div className="proposals-container" style={{ display: "grid", gridTemplateColumns: selectedRfq ? "1fr 400px" : "1fr", gap: 24 }}>
            {/* Tenders List */}
            <div className="glass-panel" style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <SectionTitle>Available Open Tenders</SectionTitle>
                <button onClick={fetchOpenTenders} style={{ background: "none", border: "none", color: "#fb923c", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Refresh</button>
              </div>

              {rfqsLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}><Loader2 className="animate-spin" color="#f59e0b" /></div>
              ) : openRfqs.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, background: "rgba(255,255,255,0.01)", borderRadius: 20, border: "1px dashed rgba(255,255,255,0.05)" }}>
                  <Briefcase size={32} color="#374151" style={{ marginBottom: 16 }} />
                  <div style={{ color: "#6b7280", fontSize: 14 }}>No active tenders at the moment.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {openRfqs.map(rfq => (
                    <div key={rfq.id} style={{
                      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 20, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "all 0.2s", cursor: "pointer",
                    }} onClick={() => setSelectedRfq(rfq)}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#fb923c", marginBottom: 6 }}>ID #{rfq.id} · {rfq.company?.name}</div>
                        <h4 style={{ fontSize: 17, fontWeight: 800, color: "#f3f4f6", margin: 0 }}>{rfq.title}</h4>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8, display: "flex", gap: 16 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={14} /> {rfq.items?.length || 0} items</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> Created {new Date(rfq.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button style={{
                        background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)",
                        borderRadius: 12, padding: "10px 18px", color: "#fdba74",
                        fontSize: 13, fontWeight: 700, cursor: "pointer"
                      }}>
                        Submit Proposal
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Proposal Form (Sidebar) */}
            {selectedRfq && (
              <div className="proposals-sidebar" style={{ display: "grid" }}>
                <div className="glass-panel" style={{ padding: 28, position: "sticky", top: 24, height: "fit-content" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <SectionTitle>Submit Proposal</SectionTitle>
                  <button onClick={() => setSelectedRfq(null)} style={{ background: "none", border: "none", color: "var(--ui-text-muted)", cursor: "pointer" }}>×</button>
                </div>
                
                <div style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: 14, padding: 16, marginBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--ui-text-brand)", textTransform: "uppercase" }}>Target RFQ</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)", marginTop: 4 }}>{selectedRfq.title}</div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={lbl}>Offer Price (IDR)</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#6b7280" }}>Rp</span>
                      <input value={form.price_offer} onChange={e => set("price_offer", e.target.value)}
                        type="number" min="0" required placeholder="0"
                        style={{ ...inputStyle, paddingLeft: 38 }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={lbl}>Delivery Days</label>
                      <input value={form.delivery_days} onChange={e => set("delivery_days", e.target.value)}
                        type="number" min="1" required placeholder="7" style={inputStyle} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={lbl}>Warranty (mos)</label>
                      <input value={form.warranty_months} onChange={e => set("warranty_months", e.target.value)}
                        type="number" min="0" required placeholder="12" style={inputStyle} />
                    </div>
                  </div>

                  {error && <ErrorBox message={error} />}
                  <button type="submit" disabled={loading} style={{ ...primaryBtn, marginTop: 10 }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Offer"}
                  </button>
                </form>
                </div>
              </div>
            )}
            
            {result && (
              <div style={{ position: "fixed", bottom: 24, right: 24, background: "#10b981", color: "#fff", padding: "16px 24px", borderRadius: 16, boxShadow: "0 10px 30px rgba(16,185,129,0.3)", display: "flex", alignItems: "center", gap: 12, zIndex: 100 }}>
                <CheckCircle2 size={20} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Proposal Submitted Successfully!</div>
                  <div style={{ fontSize: 11, opacity: 0.9 }}>Check your ranking in the My Rank tab.</div>
                </div>
                <button onClick={() => setResult(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: 900 }}>×</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "rankings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Rankings RFQ Selection */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <SectionTitle>Select RFQ to View Ranking</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                {openRfqs.map(rfq => (
                  <button
                    key={rfq.id}
                    onClick={() => fetchRankings(rfq.id)}
                    style={{
                      padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                      background: rankingRfqId === rfq.id ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.03)",
                      border: rankingRfqId === rfq.id ? "1.5px solid #f59e0b" : "1.5px solid rgba(255,255,255,0.06)",
                      color: rankingRfqId === rfq.id ? "#fdba74" : "#9ca3af",
                      fontSize: 12, fontWeight: 700, transition: "all 0.2s"
                    }}
                  >
                    #{rfq.id} {rfq.title}
                  </button>
                ))}
              </div>
            </div>

            {/* SAW Results */}
            {rankingRfqId && (
              <div className="glass-panel" style={{ padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <SectionTitle>My Rank (SAW Score)</SectionTitle>
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Scoring based on Price (50%), Delivery (30%), and Warranty (20%)</p>
                  </div>
                  <button onClick={() => fetchRankings(rankingRfqId)} style={{ background: "none", border: "none", color: "#fb923c", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Recalculate</button>
                </div>

                {rankingsLoading ? (
                  <div style={{ textAlign: "center", padding: 40 }}><Loader2 className="animate-spin" color="#f59e0b" /></div>
                ) : rankings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#4b5563" }}>No proposals submitted for this RFQ yet.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <th style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Rank</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Vendor ID</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Price Offer</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Delivery</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Warranty</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280", textTransform: "uppercase", textAlign: "right" }}>SAW Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankings.map((r, idx) => {
                          const isMe = r.proposal.company_id === activeCompany?.id;
                          return (
                            <tr key={r.proposal.id} style={{
                              borderBottom: "1px solid rgba(255,255,255,0.03)",
                              background: isMe ? "rgba(249,115,22,0.06)" : "transparent"
                            }}>
                              <td style={{ padding: "16px" }}>
                                <div style={{
                                  width: 24, height: 24, borderRadius: "50%",
                                  background: idx === 0 ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "rgba(255,255,255,0.05)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 12, fontWeight: 900, color: idx === 0 ? "#000" : "#9ca3af"
                                }}>
                                  {idx + 1}
                                </div>
                              </td>
                              <td style={{ padding: "16px", fontSize: 13, fontWeight: 700, color: isMe ? "#fdba74" : "#f3f4f6" }}>
                                Vendor #{r.proposal.company_id} {isMe && "(YOU)"}
                              </td>
                              <td style={{ padding: "16px", fontSize: 13, color: "#e5e7eb" }}>
                                Rp {Number(r.proposal.price_offer).toLocaleString("id-ID")}
                              </td>
                              <td style={{ padding: "16px", fontSize: 13, color: "#e5e7eb" }}>
                                {r.proposal.delivery_days} days
                              </td>
                              <td style={{ padding: "16px", fontSize: 13, color: "#e5e7eb" }}>
                                {r.proposal.warranty_months} mos
                              </td>
                              <td style={{ padding: "16px", textAlign: "right" }}>
                                <div style={{ fontSize: 15, fontWeight: 900, color: idx === 0 ? "#34d399" : "#f3f4f6" }}>
                                  {(r.score * 100).toFixed(1)}%
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-brand)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{children}</div>;
}

function KV({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12 }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ color: "#f3f4f6", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  const c: Record<string, string> = { yellow: "#fbbf24", green: "#34d399", indigo: "#fdba74" };
  return <span style={{ background: `${c[color]}20`, color: c[color], border: `1px solid ${c[color]}40`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{children}</span>;
}
function Section({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</div>;
}
const lbl: React.CSSProperties = { fontSize: 12, color: "var(--ui-text-secondary)", fontWeight: 500 };
const inputStyle: React.CSSProperties = {
  background: "var(--ui-bg-input)", border: `1px solid var(--ui-border-input)`,
  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--ui-text-primary)",
  outline: "none", width: "100%", boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer",
  border: "none", background: "linear-gradient(135deg,#f97316,#f59e0b)", color: "#fff",
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
