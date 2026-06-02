import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { submitProposal, apiGet } from "../lib/api";
import { 
  Briefcase, Gavel, Loader2, FileText, CheckCircle2, 
  ShieldCheck, Upload, ChevronLeft, Calendar, Info, Package, 
  Building2, ArrowRight, DollarSign, Clock, AlertCircle
} from "lucide-react";
import { useLocation } from "react-router";

/**
 * Proposals Page
 * Focused on Vendor's experience for submitting and tracking quotations.
 * Follows enterprise UI standards with full light/dark theme support.
 */
export default function Proposals() {
  const location = useLocation();
  const [activeCompany, setActiveCompany] = useState<any>(null);

  // Tenders state
  const [openRfqs, setOpenRfqs] = useState<any[]>([]);
  const [rfqsLoading, setRfqsLoading] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);
  const [vendorSubmittedRfqIds, setVendorSubmittedRfqIds] = useState<number[]>([]);
  const [hasSubmittedForSelectedRfq, setHasSubmittedForSelectedRfq] = useState(false);

  // Proposal form state
  const [form, setForm] = useState<any>({
    delivery_days: "7", 
    warranty_months: "12",
    payment_term: "30 days",
    document: null as File | null,
    items: [] // { rfq_item_id, price_offer }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const activeComp = localStorage.getItem("active_company");
    if (activeComp) {
      const comp = JSON.parse(activeComp);
      setActiveCompany(comp);
      fetchOpenTenders().then((rfqs) => {
        if (location.state?.rfqId && rfqs) {
          const rfq = rfqs.find((r: any) => r.id === location.state.rfqId);
          if (rfq) handleSelectRfq(rfq);
        }
      });
      fetchVendorSubmissions(comp.id);
    }
  }, [location.state]);

  const fetchOpenTenders = async () => {
    setRfqsLoading(true);
    try {
      const data = await apiGet("/api/rfqs?status=active");
      const rfqs = Array.isArray(data) ? data : data.data || [];
      setOpenRfqs(rfqs);
      return rfqs;
    } catch (err) {
      console.error("Failed to fetch tenders", err);
    } finally {
      setRfqsLoading(false);
    }
  };

  const fetchVendorSubmissions = async (companyId: number) => {
    try {
      const data = await apiGet(`/api/proposals/my-rank?company_id=${companyId}`);
      const rankings = Array.isArray(data) ? data : data.rankings || [];
      setVendorSubmittedRfqIds(rankings.map((item: any) => item.rfq_id));
    } catch (err) {
      console.error("Failed to fetch vendor submissions", err);
    }
  };

  const updateForm = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSelectRfq = (rfq: any) => {
    const alreadySubmitted = vendorSubmittedRfqIds.includes(rfq.id);
    setSelectedRfq(rfq);
    setHasSubmittedForSelectedRfq(alreadySubmitted);
    setError(alreadySubmitted ? "Your company already submitted an offer for this tender." : null);
    if (rfq) {
      setForm((p: any) => ({
        ...p,
        items: rfq.items?.map((item: any) => ({
          rfq_item_id: item.id,
          price_offer: "",
          catalogue: item.catalogue
        })) || []
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      updateForm("document", e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !selectedRfq) return;
    
    const missingPrices = form.items.some((it: any) => !it.price_offer || parseFloat(it.price_offer) <= 0);
    if (missingPrices) {
      setError("Please provide a valid price offer for all items.");
      return;
    }

    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append("company_id", activeCompany.id.toString());
      formData.append("rfq_id", selectedRfq.id.toString());
      formData.append("delivery_days", form.delivery_days);
      formData.append("warranty_months", form.warranty_months);
      formData.append("payment_term", form.payment_term);
      
      if (form.document) formData.append("document", form.document);

      form.items.forEach((it: any, idx: number) => {
        formData.append(`items[${idx}][rfq_item_id]`, it.rfq_item_id.toString());
        formData.append(`items[${idx}][price_offer]`, it.price_offer.toString());
      });

      const data = await submitProposal(formData);
      setResult(data.proposal);
      setVendorSubmittedRfqIds(prev => selectedRfq ? [...new Set([...prev, selectedRfq.id])] : prev);
      setSelectedRfq(null);
      setHasSubmittedForSelectedRfq(false);
      setForm({ delivery_days: "", warranty_months: "12", payment_term: "30 days", document: null, items: [] });
      setTimeout(() => setResult(null), 5000);
      fetchOpenTenders();
    } catch (err: any) {
      setError(err.message || "Failed to submit proposal");
    } finally {
      setLoading(false);
    }
  };

  const isVendor = activeCompany?.type === 'vendor';

  return (
    <Layout title="Proposals" subtitle="Manage your bids, submit quotations, and review active tender opportunities.">
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 32 }}>
        
        <div style={{ width: "100%" }}>
          {!selectedRfq ? (
            /* Tenders Grid View */
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>Available Opportunities</h2>
                  <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", marginTop: 4 }}>Review and participate in active buyer requests.</p>
                </div>
                <button onClick={fetchOpenTenders} style={secondaryBtnStyle}>
                  <Clock size={16} style={{ marginRight: 8 }} /> Refresh
                </button>
              </div>

              {rfqsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><Loader2 className="animate-spin" color="var(--huntr-orange)" size={40} /></div>
              ) : openRfqs.length === 0 ? (
                <div style={emptyStateStyle}>
                  <Briefcase size={48} color="var(--ui-text-muted)" style={{ marginBottom: 16, opacity: 0.2 }} />
                  <div style={{ color: "var(--ui-text-primary)", fontSize: 15, fontWeight: 700 }}>No Active Tenders</div>
                  <div style={{ color: "var(--ui-text-muted)", fontSize: 13, marginTop: 4 }}>Check back later for new opportunities.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
                  {openRfqs.map(rfq => (
                    <div key={rfq.id} style={cardStyle} onClick={() => handleSelectRfq(rfq)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                         <div style={iconContainerStyle}><FileText size={20} /></div>
                         <div style={badgeStyle}>#{rfq.id}</div>
                      </div>
                      
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-brand)", textTransform: "uppercase", letterSpacing: 0.5 }}>{rfq.company?.name}</div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: "4px 0 0", lineHeight: 1.4 }}>{rfq.title}</h4>
                      </div>

                      <div style={{ display: "flex", gap: 20, padding: "16px 0", borderTop: "1px solid var(--ui-border)", borderBottom: "1px solid var(--ui-border)", marginTop: 8 }}>
                        <div style={itemDetailStyle}>
                          <Package size={14} color="var(--ui-text-brand)" /> {rfq.items?.length || 0} Items
                        </div>
                        <div style={itemDetailStyle}>
                          <Calendar size={14} color="var(--ui-text-brand)" /> {new Date(rfq.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {vendorSubmittedRfqIds.includes(rfq.id) && (
                        <div style={{ marginTop: 8, fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>
                          ✅ Your company already submitted a proposal for this tender.
                        </div>
                      )}

                      {isVendor && (
                        <button style={{ ...primaryBtnStyle, width: "100%", marginTop: 4 }}>
                          Submit Quotation <ArrowRight size={14} style={{ marginLeft: 8 }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Quotation Submission Form */
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                 <button onClick={() => setSelectedRfq(null)} style={iconButtonStyle} aria-label="Back to tender list" title="Back to tender list">
                   <ChevronLeft size={20} />
                 </button>
                 <div>
                   <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-brand)", textTransform: "uppercase", letterSpacing: 1 }}>SUBMIT PROPOSAL</div>
                   <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--ui-text-primary)" }}>{selectedRfq.title}</h2>
                 </div>
              </div>

              <div style={formContainerStyle}>
                {/* RFQ Reference Panel */}
                <div style={formHeaderStyle}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                     <div style={{ ...iconContainerStyle, width: 36, height: 36 }}><Building2 size={18} /></div>
                     <div>
                       <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>TARGET BUYER</div>
                       <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>{selectedRfq.company?.name}</div>
                     </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>Purchase Req ID</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>PR-{selectedRfq.id}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
                  {/* 1. Item Pricing */}
                  <section>
                    <SectionHeader icon={<DollarSign size={18} />} title="Itemized Price Offers" />
                    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                      {form.items.map((item: any, idx: number) => {
                        const rfqItem = selectedRfq.items?.find((i:any) => i.id === item.rfq_item_id);
                        return (
                          <div key={item.rfq_item_id} style={formItemRowStyle}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>{item.catalogue?.name}</div>
                              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                <span style={{ fontSize: 11, color: "var(--ui-text-muted)" }}>{item.catalogue?.item_code} · {rfqItem?.qty} Units Requested</span>
                              </div>
                            </div>
                            <div style={{ position: "relative", width: 220 }}>
                              <span style={currencyPrefixStyle}>Rp</span>
                              <input 
                                value={item.price_offer} 
                                onChange={e => {
                                  const newItems = [...form.items];
                                  newItems[idx].price_offer = e.target.value;
                                  updateForm("items", newItems);
                                }}
                                type="number" min="0" required placeholder="0"
                                style={inputStyle} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* 2. Logistics & Docs */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                    <section>
                        <SectionHeader icon={<Clock size={18} />} title="SERVICE TERMS" />
                        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                          <div style={fieldGroupStyle}>
                            <label style={labelStyle}>LEAD TIME (DAYS TO DELIVERY)</label>
                            <select value={form.delivery_days} onChange={e => updateForm("delivery_days", e.target.value)} style={selectStyle}>
                              <option value="3">3 Days (Express)</option>
                              <option value="7">7 Days (Standard)</option>
                              <option value="14">14 Days</option>
                              <option value="30">30 Days</option>
                            </select>
                          </div>
                          <div style={fieldGroupStyle}>
                            <label style={labelStyle}>WARRANTY PERIOD (MONTHS)</label>
                            <select value={form.warranty_months} onChange={e => updateForm("warranty_months", e.target.value)} style={selectStyle}>
                              <option value="0">No Warranty</option>
                              <option value="6">6 Months</option>
                              <option value="12">12 Months (1 Year)</option>
                              <option value="24">24 Months (2 Years)</option>
                              <option value="36">36 Months (3 Years)</option>
                            </select>
                          </div>
                          <div style={fieldGroupStyle}>
                            <label style={labelStyle}>PAYMENT SCHEME</label>
                            <select value={form.payment_term} onChange={e => updateForm("payment_term", e.target.value)} style={selectStyle}>
                              <option value="7 days">Net 7 Days</option>
                              <option value="14 days">Net 14 Days</option>
                              <option value="30 days">Net 30 Days</option>
                              <option value="60 days">Net 60 Days</option>
                            </select>
                          </div>
                        </div>
                      </section>

                    <section>
                      <SectionHeader icon={<Upload size={18} />} title="Supporting Documents" />
                      <div style={{ marginTop: 16 }}>
                        <div 
                          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          style={{ 
                            ...dropzoneStyle,
                            borderColor: isDragging ? "var(--ui-text-brand)" : "var(--ui-border)",
                            background: isDragging ? "var(--ui-bg-badge)" : "var(--ui-bg-input)"
                          }}
                        >
                          <input type="file" ref={fileInputRef} onChange={e => updateForm("document", e.target.files?.[0] || null)} style={{ display: "none" }} />
                          <div style={dropzoneIconStyle}>
                            {form.document ? <CheckCircle2 size={24} color="var(--ui-status-active)" /> : <Upload size={24} color="var(--ui-text-muted)" />}
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-primary)" }}>
                              {form.document ? form.document.name : "Drag & Drop Supporting Document"}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 4 }}>
                              {form.document ? "File ready for upload" : "PDF, JPG, or PNG (Max 5MB)"}
                            </div>
                          </div>
                        </div>
                        <div style={infoBoxStyle}>
                          <Info size={14} color="var(--ui-text-brand)" style={{ flexShrink: 0, marginTop: 2 }} />
                          <p style={{ margin: 0, fontSize: 11, color: "var(--ui-text-secondary)", lineHeight: 1.5 }}>
                            <strong>Optional:</strong> Melampirkan profil perusahaan, spesifikasi teknis tambahan, atau sertifikasi vendor akan meningkatkan skor penilaian Anda.
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Footer Actions */}
                  <div style={formFooterStyle}>
                    <button type="button" onClick={() => { setSelectedRfq(null); setHasSubmittedForSelectedRfq(false); setError(null); }} style={secondaryBtnStyle}>Cancel</button>
                    <button type="submit" disabled={loading || hasSubmittedForSelectedRfq} style={primaryBtnStyle}>
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <><ShieldCheck size={18} /> Submit Official Proposal</>}
                    </button>
                  </div>
                  {hasSubmittedForSelectedRfq && (
                    <div style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700, marginTop: 8 }}>
                      Duplicate submission is not allowed for this RFQ.
                    </div>
                  )}
                  {error && <ErrorBox message={error} />}
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Floating Success Notification */}
        {result && (
          <div style={floatingSuccessStyle}>
            <CheckCircle2 size={20} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>Quotation Submitted!</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Your offer is now active in the tender system.</div>
            </div>
            <button onClick={() => setResult(null)} style={closeButtonStyle}>×</button>
          </div>
        )}
      </div>
    </Layout>
  );
}

// ── Components & Helpers ───────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ color: "var(--ui-text-brand)" }}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ui-text-primary)", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h3>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={errorBoxStyle}>
      <AlertCircle size={16} /> {message}
    </div>
  );
}

// ── Shared Styles ──────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
  borderRadius: 20, padding: 24, cursor: "pointer", transition: "all 0.2s ease",
  display: "flex", flexDirection: "column",
};

const iconContainerStyle: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 12, background: "var(--ui-bg-badge)",
  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ui-text-brand)"
};

const badgeStyle: React.CSSProperties = {
  padding: "4px 10px", borderRadius: 8, background: "var(--ui-bg-input)",
  border: "1px solid var(--ui-border)", fontSize: 10, fontWeight: 800, color: "var(--ui-text-muted)"
};

const itemDetailStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, color: "var(--ui-text-secondary)", fontSize: 12, fontWeight: 600
};

const iconButtonStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 12, background: "var(--ui-bg-card)",
  border: "1px solid var(--ui-border)", color: "var(--ui-text-primary)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const formContainerStyle: React.CSSProperties = {
  background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
  borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.02)"
};

const formHeaderStyle: React.CSSProperties = {
  padding: "20px 32px", background: "var(--ui-bg-input)",
  borderBottom: "1px solid var(--ui-border)", display: "flex", justifyContent: "space-between", alignItems: "center"
};

const formItemRowStyle: React.CSSProperties = {
  background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-subtle)",
  borderRadius: 14, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20
};

const currencyPrefixStyle: React.CSSProperties = {
  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
  fontSize: 11, fontWeight: 800, color: "var(--ui-text-muted)"
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", paddingLeft: 44, borderRadius: 10,
  background: "var(--ui-bg-card)", border: "1px solid var(--ui-border-input)",
  color: "var(--ui-text-primary)", outline: "none", fontSize: 14, fontWeight: 600
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, paddingLeft: 14, appearance: "auto"
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", marginBottom: 6
};

const fieldGroupStyle: React.CSSProperties = { display: "flex", flexDirection: "column" };

const dropzoneStyle: React.CSSProperties = {
  border: "2px dashed var(--ui-border)", borderRadius: 16, padding: "24px",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.2s"
};

const dropzoneIconStyle: React.CSSProperties = {
  width: 48, height: 48, borderRadius: "50%", background: "var(--ui-bg-card)",
  border: "1px solid var(--ui-border)", display: "flex", alignItems: "center", justifyContent: "center"
};

const infoBoxStyle: React.CSSProperties = {
  marginTop: 12, display: "flex", gap: 10, alignItems: "start",
  background: "var(--ui-bg-badge)", padding: 12, borderRadius: 12, border: "1px solid var(--ui-border-badge)"
};

const formFooterStyle: React.CSSProperties = {
  marginTop: 8, paddingTop: 24, borderTop: "1px solid var(--ui-border)",
  display: "flex", justifyContent: "flex-end", gap: 16
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "12px 24px", borderRadius: 12, background: "var(--huntr-gradient)",
  border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(249,115,22,0.2)"
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "10px 16px", borderRadius: 10, background: "var(--ui-bg-input)",
  border: "1px solid var(--ui-border)", color: "var(--ui-text-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer"
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: "center", padding: 80, background: "var(--ui-bg-card)",
  borderRadius: 24, border: "1px dashed var(--ui-border)"
};

const floatingSuccessStyle: React.CSSProperties = {
  position: "fixed", bottom: 32, right: 32, background: "var(--ui-status-active)", color: "#fff",
  padding: "14px 20px", borderRadius: 14, display: "flex", alignItems: "center", gap: 12,
  boxShadow: "0 10px 30px rgba(34,197,94,0.3)", zIndex: 1000
};

const closeButtonStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.1)", border: "none", color: "#fff", cursor: "pointer",
  width: 20, height: 20, borderRadius: "50%", fontWeight: 900, fontSize: 14
};

const errorBoxStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
  borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171",
  display: "flex", alignItems: "center", gap: 8, fontWeight: 600
};
