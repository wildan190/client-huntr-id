import React from "react";
import { ChevronLeft, Building2, DollarSign, Clock, Upload, CheckCircle2, Info, ShieldCheck, Loader2 } from "lucide-react";

export function VendorProposalForm({
  selectedRfq,
  form,
  loading,
  error,
  hasSubmittedForSelectedRfq,
  isProcessing,
  isDragging,
  fileInputRef,
  updateForm,
  handleDrag,
  handleDrop,
  handleSubmit,
  onCancel,
}: {
  selectedRfq: any;
  form: any;
  loading: boolean;
  error: string | null;
  hasSubmittedForSelectedRfq: boolean;
  isProcessing: React.MutableRefObject<boolean>;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  updateForm: (k: string, v: any) => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const iconButtonStyle: React.CSSProperties = {
    background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
    color: "var(--ui-text-primary)", width: 40, height: 40, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
  };
  const formContainerStyle: React.CSSProperties = {
    background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
    borderRadius: 24, overflow: "hidden"
  };
  const formHeaderStyle: React.CSSProperties = {
    padding: "24px 32px", borderBottom: "1px solid var(--ui-border)",
    background: "var(--ui-bg-page)", display: "flex", justifyContent: "space-between", alignItems: "center"
  };
  const iconContainerStyle: React.CSSProperties = {
    width: 48, height: 48, borderRadius: 14, background: "rgba(249,115,22,0.1)",
    color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center"
  };
  const formItemRowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 16, padding: 16,
    background: "var(--ui-bg-input)", borderRadius: 16, border: "1px solid var(--ui-border-input)"
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
    borderRadius: 10, padding: "10px 12px 10px 32px", fontSize: 14,
    fontWeight: 800, color: "var(--ui-text-primary)", outline: "none"
  };
  const currencyPrefixStyle: React.CSSProperties = {
    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
    fontSize: 10, fontWeight: 800, color: "var(--ui-text-muted)"
  };
  const fieldGroupStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: 8
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 900, color: "var(--ui-text-brand)",
    textTransform: "uppercase", letterSpacing: 1
  };
  const selectStyle: React.CSSProperties = {
    ...inputStyle, padding: "10px 12px", appearance: "auto"
  };
  const dropzoneStyle: React.CSSProperties = {
    border: "2px dashed var(--ui-border)", borderRadius: 16, padding: "40px 20px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    cursor: "pointer", transition: "all 0.2s"
  };
  const dropzoneIconStyle: React.CSSProperties = {
    width: 48, height: 48, borderRadius: "50%", background: "var(--ui-bg-page)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  };
  const infoBoxStyle: React.CSSProperties = {
    display: "flex", gap: 12, padding: 16, background: "rgba(249,115,22,0.05)",
    borderRadius: 12, border: "1px solid rgba(249,115,22,0.1)", marginTop: 16
  };
  const formFooterStyle: React.CSSProperties = {
    padding: 32, borderTop: "1px solid var(--ui-border)", display: "flex",
    justifyContent: "flex-end", gap: 16, background: "var(--ui-bg-page)"
  };
  const secondaryBtnStyle: React.CSSProperties = {
    background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
    color: "var(--ui-text-secondary)", padding: "10px 20px", borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center"
  };
  const primaryBtnStyle: React.CSSProperties = {
    background: "var(--ui-text-primary)", color: "var(--ui-bg-page)",
    border: "none", padding: "10px 20px", borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
  };

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--ui-border)", paddingBottom: 12 }}>
      <div style={{ color: "var(--ui-text-brand)" }}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "var(--ui-text-primary)", textTransform: "uppercase", letterSpacing: 1 }}>{title}</h3>
    </div>
  );

  const ErrorBox = ({ message }: { message: string }) => (
    <div style={{ padding: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", fontSize: 13, fontWeight: 600, marginTop: 16 }}>
      {message}
    </div>
  );

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
         <button onClick={onCancel} style={iconButtonStyle} aria-label="Back to tender list" title="Back to tender list">
           <ChevronLeft size={20} />
         </button>
         <div>
           <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-brand)", textTransform: "uppercase", letterSpacing: 1 }}>SUBMIT PROPOSAL</div>
           <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--ui-text-primary)" }}>{selectedRfq.title}</h2>
         </div>
      </div>

      <div style={formContainerStyle}>
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
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>PR-{selectedRfq.id ? String(selectedRfq.id).substring(0, 8).toUpperCase() : ""}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
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
                    <strong>Optional:</strong> Attaching company profile, additional technical specifications, or vendor certifications will increase your evaluation score.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div style={formFooterStyle}>
            <button type="button" onClick={onCancel} style={secondaryBtnStyle}>Cancel</button>
            <button 
              type="submit" 
              disabled={loading || hasSubmittedForSelectedRfq || isProcessing.current}
              style={{
                ...primaryBtnStyle,
                background: (loading || hasSubmittedForSelectedRfq || isProcessing.current) ? "#9ca3af" : "var(--huntr-gradient)",
                cursor: (loading || hasSubmittedForSelectedRfq || isProcessing.current) ? "not-allowed" : "pointer",
                boxShadow: (loading || hasSubmittedForSelectedRfq || isProcessing.current) ? "none" : "0 4px 12px rgba(249,115,22,0.2)",
                opacity: 1
              }}
            >
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
  );
}
