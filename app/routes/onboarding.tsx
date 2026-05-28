import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, MapPin, CreditCard, UploadCloud, FileText,
  CheckCircle2, ChevronRight, ChevronLeft, Loader2,
  FileSpreadsheet, ArrowRight, LogIn, Sparkles, X, Plus,
  AlertCircle,
} from "lucide-react";
import { useOnboardingViewModel } from "../features/onboarding/hooks/useOnboardingViewModel";
import { SlideSection, Field } from "../features/onboarding/components/OnboardingUI";

const TOTAL_SLIDES = 6;

const STEP_META = [
  { id: 1, icon: Building2, label: "Company Profile", color: "#a855f7", desc: "Basic info & identity" },
  { id: 2, icon: MapPin,     label: "Location",        color: "#6366f1", desc: "Address & region" },
  { id: 3, icon: CreditCard, label: "Banking",          color: "#3b82f6", desc: "Settlement details" },
  { id: 4, icon: FileText,   label: "Documents",        color: "#f59e0b", desc: "Legal docs (mandatory)" },
  { id: 5, icon: UploadCloud,label: "Upload Data",      color: "#10b981", desc: "PO / Catalogue CSV" },
  { id: 6, icon: LogIn,      label: "Enter Workspace",  color: "#ec4899", desc: "Select & activate" },
];

export default function Onboarding() {
  const vm = useOnboardingViewModel();
  const navigate = useNavigate();
  const docInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("NPWP");

  const validateCurrentSlide = (): string | null => {
    if (vm.slide === 1) {
      if (!vm.formData.company_name.trim()) return "Company name is required.";
      if (!vm.formData.type) return "Please select a business type.";
      if (!vm.npwpVerifiedData) return "Please verify your NPWP before proceeding.";
    }
    if (vm.slide === 4) {
      if (vm.uploadedDocs.length === 0) return "Please upload at least one legal document.";
    }
    if (vm.slide === 5) {
      if (!vm.selectedFile) return "Please select a CSV or Excel file to import.";
    }
    return null;
  };

  const nextSlide = async () => {
    const err = validateCurrentSlide();
    if (err) { vm.setError(err); return; }
    vm.setError(null);
    if (vm.slide === 5) { await vm.handleCompanySubmit(); return; }
    if (vm.slide < TOTAL_SLIDES) vm.setSlide(p => p + 1);
  };

  const handleLoginAsCompany = () => {
    if (!vm.selectedCompany) return;
    localStorage.setItem("active_company", JSON.stringify(vm.selectedCompany));
    navigate("/");
  };

  const progress = ((vm.slide - 1) / (TOTAL_SLIDES - 1)) * 100;

  // Styles
  const lbl = { fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)", color: "#fff", outline: "none", fontSize: 14,
    transition: "all 0.2s", boxSizing: "border-box" as const,
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px 16px", boxSizing: "border-box",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", left: "-8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 65%)" }} />
      </div>

      {/* Branding */}
      <div style={{ position: "fixed", top: 20, left: 28, display: "flex", alignItems: "center", gap: 10, zIndex: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#a855f7,#6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff",
          boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
        }}>H</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#f3f4f6", letterSpacing: "-0.3px" }}>Huntr.id</div>
          <div style={{ fontSize: 8, color: "#6366f1", letterSpacing: "0.12em", fontWeight: 700 }}>COMPANY ONBOARDING</div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 700, position: "relative", zIndex: 1 }}>
        {/* Step Tracker */}
        <div style={{ marginBottom: 28, padding: "0 4px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
            {STEP_META.map((step, i) => {
              const isDone = vm.slide > step.id;
              const isActive = vm.slide === step.id;
              const Icon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 1 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                      background: isDone ? "linear-gradient(135deg,#34d399,#10b981)" : isActive ? `linear-gradient(135deg,${step.color},${step.color}cc)` : "rgba(255,255,255,0.04)",
                      border: isDone ? "2px solid rgba(52,211,153,0.4)" : isActive ? `2px solid ${step.color}60` : "2px solid rgba(255,255,255,0.08)",
                      boxShadow: isActive ? `0 0 20px ${step.color}40` : isDone ? "0 0 16px rgba(52,211,153,0.25)" : "none",
                    }}>
                      {isDone ? <CheckCircle2 size={18} color="#fff" /> : <Icon size={16} color={isActive ? "#fff" : "#4b5563"} />}
                    </div>
                    <div style={{ marginTop: 6, textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isDone ? "#34d399" : isActive ? "#f3f4f6" : "#4b5563", letterSpacing: "0.02em", transition: "color 0.3s", whiteSpace: "nowrap" }}>{step.label}</div>
                    </div>
                  </div>
                  {i < STEP_META.length - 1 && (
                    <div style={{ flex: 1, height: 2, marginTop: 19, background: vm.slide > step.id ? "linear-gradient(90deg,#34d399,#10b981)" : "rgba(255,255,255,0.06)", transition: "background 0.5s" }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Slide Card */}
        <div style={{ background: "rgba(12,12,28,0.92)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 28, backdropFilter: "blur(32px)", overflow: "hidden" }}>
          <div style={{ height: 3, background: `linear-gradient(90deg,${STEP_META[Math.min(vm.slide - 1, 5)].color},${STEP_META[Math.min(vm.slide - 1, 5)].color}80)` }} />
          <div style={{ padding: "36px 44px 40px" }}>
            {vm.error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} /> {vm.error}
              </div>
            )}

            {vm.slide === 1 && (
              <SlideSection title="Company Profile" subtitle="Basic info & identity" icon={<Building2 size={22} color="#a855f7" />} accentColor="#a855f7">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={lbl}>Tax ID (NPWP) *</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input type="text" placeholder="01.234.567.8-901.000" value={vm.formData.tax_id} onChange={e => vm.updateField("tax_id", e.target.value)} style={inputStyle} />
                    <button onClick={vm.handleVerifyNpwp} disabled={vm.isVerifyingNpwp || !vm.formData.tax_id} style={{ padding: "0 20px", borderRadius: 12, background: vm.npwpVerifiedData ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.1)", border: vm.npwpVerifiedData ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(99,102,241,0.2)", color: vm.npwpVerifiedData ? "#4ade80" : "#818cf8", cursor: "pointer", fontWeight: 700 }}>
                      {vm.isVerifyingNpwp ? <Loader2 size={16} className="animate-spin" /> : vm.npwpVerifiedData ? <CheckCircle2 size={16} /> : "Verify"}
                    </button>
                  </div>
                  {vm.npwpVerifiedData && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f3f4f6" }}>{vm.npwpVerifiedData.nama}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Status: <span style={{ color: "#4ade80" }}>{vm.npwpVerifiedData.statusWp}</span></div>
                    </div>
                  )}
                </div>
                <Field label="Company Name *" value={vm.formData.company_name} onChange={(v:any) => vm.updateField("company_name", v)} placeholder="e.g. PT Tunas Global Teknologi" />
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={lbl}>Industry Type</label>
                    <select
                      value={vm.formData.industry_type}
                      onChange={e => vm.updateField("industry_type", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select Industry...</option>
                      <option value="Technology">Technology</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Retail">Retail</option>
                      <option value="Finance">Finance</option>
                      <option value="Construction">Construction</option>
                      <option value="Services">Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Phone" value={vm.formData.phone} onChange={(v:any) => vm.updateField("phone", v)} />
                  <Field label="Email" value={vm.formData.email} onChange={(v:any) => vm.updateField("email", v)} type="email" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={lbl}>Business Type *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[{ v: "buyer", l: "Buyer" }, { v: "vendor", l: "Vendor" }].map(opt => (
                      <button key={opt.v} type="button" onClick={() => vm.updateField("type", opt.v)} style={{ padding: "14px", borderRadius: 12, background: vm.formData.type === opt.v ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", border: vm.formData.type === opt.v ? "1.5px solid rgba(99,102,241,0.5)" : "1.5px solid rgba(255,255,255,0.07)", cursor: "pointer", color: vm.formData.type === opt.v ? "#a5b4fc" : "#9ca3af" }}>{opt.l}</button>
                    ))}
                  </div>
                </div>
              </SlideSection>
            )}

            {vm.slide === 2 && (
              <SlideSection title="Location" subtitle="Business address" icon={<MapPin size={22} color="#6366f1" />} accentColor="#6366f1">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Province" value={vm.formData.provincy_country} onChange={(v:any) => vm.updateField("provincy_country", v)} placeholder="e.g. Jawa Barat" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={lbl}>Region</label>
                    <select
                      value={vm.formData.region}
                      onChange={e => vm.updateField("region", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select Region...</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="City" value={vm.formData.city} onChange={(v:any) => vm.updateField("city", v)} placeholder="e.g. Bandung" />
                  <Field label="Regency / District" value={vm.formData.regency} onChange={(v:any) => vm.updateField("regency", v)} placeholder="e.g. Coblong" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Zip Code" value={vm.formData.zip_code} onChange={(v:any) => vm.updateField("zip_code", v)} placeholder="e.g. 40132" />
                  <div />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={lbl}>Full Address</label>
                  <textarea 
                    value={vm.formData.address} 
                    onChange={e => vm.updateField("address", e.target.value)} 
                    placeholder="e.g. Jl. Kalidosok Raya No. 21"
                    style={{ ...inputStyle, height: 80, resize: "none" }} 
                  />
                </div>
              </SlideSection>
            )}

            {vm.slide === 3 && (
              <SlideSection title="Banking" subtitle="Payment details" icon={<CreditCard size={22} color="#3b82f6" />} accentColor="#3b82f6">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={lbl}>Bank Name</label>
                  <select
                    value={vm.formData.bank_name}
                    onChange={e => vm.updateField("bank_name", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select Bank...</option>
                    <option value="BNI">BNI</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BCA">BCA</option>
                    <option value="BRI">BRI</option>
                  </select>
                </div>
                <Field label="Account Number" value={vm.formData.bank_account} onChange={(v:any) => vm.updateField("bank_account", v)} />
                <Field label="Holder Name" value={vm.formData.bank_account_name} onChange={(v:any) => vm.updateField("bank_account_name", v)} />
              </SlideSection>
            )}

            {vm.slide === 4 && (
              <SlideSection title="Documents" subtitle="Legal docs" icon={<FileText size={22} color="#f59e0b" />} accentColor="#f59e0b">
                <div style={{ display: "flex", gap: 10 }}>
                  <select value={docType} onChange={e => setDocType(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                    {["NPWP", "SIUP", "NIB"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => docInputRef.current?.click()} style={{ padding: "0 20px", borderRadius: 12, background: "#6366f1", color: "#fff", cursor: "pointer", border: "none" }}>
                    {vm.isUploadingDoc ? <Loader2 className="animate-spin" /> : <Plus />}
                  </button>
                </div>
                <input ref={docInputRef} type="file" style={{ display: "none" }} onChange={e => e.target.files?.[0] && vm.handleDocUpload(e.target.files[0], docType)} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {vm.uploadedDocs.map((d, i) => (
                    <div key={i} style={{ padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#fff" }}>{d.name} ({d.type})</span>
                      <X size={16} color="#f87171" style={{ cursor: "pointer" }} onClick={() => vm.setUploadedDocs(p => p.filter((_, idx) => idx !== i))} />
                    </div>
                  ))}
                </div>
              </SlideSection>
            )}

            {vm.slide === 5 && (
              <SlideSection title="Upload Data" subtitle="Import Data" icon={<UploadCloud size={22} color="#10b981" />} accentColor="#10b981">
                <div style={{ padding: 40, border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 20, textAlign: "center" }}>
                  <FileSpreadsheet size={40} color="#6b7280" />
                  <p style={{ color: "#9ca3af", marginTop: 12 }}>{vm.selectedFile ? vm.selectedFile.name : "Select Excel or CSV to import"}</p>
                  <input type="file" accept=".csv, .xlsx, .xls" onChange={e => vm.setSelectedFile(e.target.files?.[0] || null)} style={{ marginTop: 12 }} />
                </div>
              </SlideSection>
            )}

            {vm.slide === 6 && (
              <SlideSection title="Success" subtitle="Workspace ready" icon={<LogIn size={22} color="#ec4899" />} accentColor="#ec4899">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {vm.companies.map(c => (
                    <button key={c.id} onClick={() => vm.setSelectedCompany(c)} style={{ padding: 16, borderRadius: 16, background: vm.selectedCompany?.id === c.id ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)", border: vm.selectedCompany?.id === c.id ? "1.5px solid #6366f1" : "1px solid rgba(255,255,255,0.07)", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ color: "#fff", fontWeight: 700 }}>{c.name}</div>
                    </button>
                  ))}
                  <button onClick={handleLoginAsCompany} style={{ padding: 16, background: "#6366f1", borderRadius: 12, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", marginTop: 12 }}>Enter Workspace</button>
                </div>
              </SlideSection>
            )}

            <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between" }}>
              {vm.slide > 1 && vm.slide < 6 && <button onClick={() => vm.setSlide(vm.slide - 1)} style={{ padding: "12px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 12, cursor: "pointer" }}>Back</button>}
              <div style={{ flex: 1 }} />
              {vm.slide < 6 && (
                <button onClick={nextSlide} disabled={vm.isLoading} style={{ padding: "12px 32px", background: "#6366f1", color: "#fff", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  {vm.isLoading ? <Loader2 className="animate-spin" size={18} /> : vm.slide === 5 ? "Finish" : "Next"} <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
