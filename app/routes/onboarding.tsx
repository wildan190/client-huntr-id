import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, MapPin, CreditCard, UploadCloud, FileText,
  CheckCircle2, ChevronRight, ChevronLeft, Loader2,
  FileSpreadsheet, LogIn, X, Plus,
  AlertCircle,
} from "lucide-react";
import { useOnboardingViewModel } from "../features/onboarding/hooks/useOnboardingViewModel";
import { SlideSection, Field } from "../features/onboarding/components/OnboardingUI";

const TOTAL_SLIDES = 6;

const STEP_META = [
  { id: 1, icon: Building2, label: "Company Profile", color: "#f97316", desc: "Basic info & identity" },
  { id: 2, icon: MapPin,     label: "Location",        color: "#f59e0b", desc: "Address & region" },
  { id: 3, icon: CreditCard, label: "Banking",          color: "#fbbf24", desc: "Settlement details" },
  { id: 4, icon: FileText,   label: "Documents",        color: "#f59e0b", desc: "Legal docs (mandatory)" },
  { id: 5, icon: UploadCloud,label: "Upload Data",      color: "#10b981", desc: "PO / Catalogue CSV" },
  { id: 6, icon: LogIn,      label: "Enter Workspace",  color: "#fb923c", desc: "Select & activate" },
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#050510]">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-8%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 65%)" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[350px] md:w-[700px] h-[350px] md:h-[700px] rounded-full bg-radial-gradient(circle, rgba(251,146,60,0.10) 0%, transparent 65%)" />
      </div>

      {/* Branding */}
      <div className="fixed top-4 left-4 md:top-8 md:left-8 flex items-center gap-3 z-10">
        <img 
          src="/assets/img/logo/emblem.jpg" 
          alt="Huntr Logo" 
          className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover shadow-[0_4px_16px_rgba(249,115,22,0.35)]"
        />
        <div className="hidden sm:block">
          <div className="font-black text-sm md:text-base text-gray-100 tracking-tight">Huntr.id</div>
          <div className="text-[8px] md:text-[9px] text-orange-400 tracking-[0.12em] font-bold uppercase">Company Onboarding</div>
        </div>
      </div>

      <div className="w-full max-w-2xl relative z-1">
        {/* Step Tracker */}
        <div className="mb-6 md:mb-10 px-1">
          <div className="flex items-center justify-between relative">
            {STEP_META.map((step, i) => {
              const isDone = vm.slide > step.id;
              const isActive = vm.slide === step.id;
              const Icon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1 relative z-1">
                    <div 
                      className={`
                        w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-500
                        ${isDone 
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-emerald-500/40 shadow-[0_0_16px_rgba(52,211,153,0.25)]" 
                          : isActive 
                            ? "bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.4)]" 
                            : "bg-white/5 border-2 border-white/10"
                        }
                      `}
                    >
                      {isDone ? <CheckCircle2 size={18} className="text-white" /> : <Icon size={16} className={isActive ? "text-white" : "text-gray-500"} />}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`
                        text-[9px] md:text-[10px] font-bold tracking-wide transition-colors duration-300 whitespace-nowrap hidden md:block
                        ${isDone ? "text-emerald-400" : isActive ? "text-gray-100" : "text-gray-600"}
                      `}>
                        {step.label}
                      </div>
                      {/* Mobile minimal label */}
                      {isActive && (
                        <div className="text-[8px] font-black text-orange-400 uppercase tracking-tighter md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          {step.label}
                        </div>
                      )}
                    </div>
                  </div>
                  {i < STEP_META.length - 1 && (
                    <div className={`
                      flex-1 h-[2px] -mt-4 transition-all duration-700
                      ${vm.slide > step.id ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-white/5"}
                    `} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Slide Card */}
        <div className="bg-[#0c0c1c]/95 border border-white/8 rounded-3xl backdrop-blur-3xl overflow-hidden shadow-2xl">
          <div 
            className="h-1 transition-all duration-500" 
            style={{ 
              background: `linear-gradient(90deg, ${STEP_META[Math.min(vm.slide - 1, 5)].color}, ${STEP_META[Math.min(vm.slide - 1, 5)].color}80)`,
              width: `${(vm.slide / TOTAL_SLIDES) * 100}%` 
            }} 
          />
          <div className="p-6 md:p-10">
            {vm.error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} /> {vm.error}
              </div>
            )}

            {vm.slide === 1 && (
              <SlideSection title="Company Profile" subtitle="Basic info & identity" icon={<Building2 size={22} className="text-orange-500" />} accentColor="#f97316">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tax ID (NPWP) *</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="01.234.567.8-901.000" value={vm.formData.tax_id} onChange={e => vm.updateField("tax_id", e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white outline-none text-sm" />
                    <button 
                      onClick={vm.handleVerifyNpwp} 
                      disabled={vm.isVerifyingNpwp || !vm.formData.tax_id} 
                      className={`px-4 md:px-6 rounded-xl font-bold text-xs transition-all ${vm.npwpVerifiedData ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20"}`}
                    >
                      {vm.isVerifyingNpwp ? <Loader2 size={16} className="animate-spin" /> : vm.npwpVerifiedData ? <CheckCircle2 size={16} /> : "Verify"}
                    </button>
                  </div>
                  {vm.npwpVerifiedData && (
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="text-sm font-bold text-gray-200">{vm.npwpVerifiedData.nama}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Status: <span className="text-emerald-400 font-bold">{vm.npwpVerifiedData.statusWp}</span></div>
                    </div>
                  )}
                </div>
                <Field label="Company Name *" value={vm.formData.company_name} onChange={(v:any) => vm.updateField("company_name", v)} placeholder="e.g. PT Tunas Global Teknologi" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Industry Type</label>
                    <select
                      value={vm.formData.industry_type}
                      onChange={e => vm.updateField("industry_type", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white outline-none text-sm appearance-none"
                    >
                      <option value="" className="bg-[#0c0c1c]">Select Industry...</option>
                      <option value="Technology" className="bg-[#0c0c1c]">Technology</option>
                      <option value="Manufacturing" className="bg-[#0c0c1c]">Manufacturing</option>
                      <option value="Logistics" className="bg-[#0c0c1c]">Logistics</option>
                      <option value="Healthcare" className="bg-[#0c0c1c]">Healthcare</option>
                      <option value="Retail" className="bg-[#0c0c1c]">Retail</option>
                      <option value="Finance" className="bg-[#0c0c1c]">Finance</option>
                      <option value="Construction" className="bg-[#0c0c1c]">Construction</option>
                      <option value="Services" className="bg-[#0c0c1c]">Services</option>
                      <option value="Other" className="bg-[#0c0c1c]">Other</option>
                    </select>
                  </div>
                  <div className="hidden md:block" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Phone" value={vm.formData.phone} onChange={(v:any) => vm.updateField("phone", v)} />
                  <Field label="Email" value={vm.formData.email} onChange={(v:any) => vm.updateField("email", v)} type="email" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Business Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ v: "buyer", l: "Buyer" }, { v: "vendor", l: "Vendor" }].map(opt => (
                      <button 
                        key={opt.v} 
                        type="button" 
                        onClick={() => vm.updateField("type", opt.v)} 
                        className={`
                          py-3 rounded-xl font-bold text-sm transition-all border-2
                          ${vm.formData.type === opt.v 
                            ? "bg-orange-500/10 border-orange-500/40 text-orange-400" 
                            : "bg-white/3 border-white/5 text-gray-500 hover:border-white/10"
                          }
                        `}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </SlideSection>
            )}

            {vm.slide === 2 && (
              <SlideSection title="Location" subtitle="Business address" icon={<MapPin size={22} className="text-amber-500" />} accentColor="#f59e0b">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Province" value={vm.formData.provincy_country} onChange={(v:any) => vm.updateField("provincy_country", v)} placeholder="e.g. Jawa Barat" />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Region</label>
                    <select
                      value={vm.formData.region}
                      onChange={e => vm.updateField("region", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white outline-none text-sm appearance-none"
                    >
                      <option value="" className="bg-[#0c0c1c]">Select Region...</option>
                      <option value="Indonesia" className="bg-[#0c0c1c]">Indonesia</option>
                      <option value="Malaysia" className="bg-[#0c0c1c]">Malaysia</option>
                      <option value="Singapore" className="bg-[#0c0c1c]">Singapore</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="City" value={vm.formData.city} onChange={(v:any) => vm.updateField("city", v)} placeholder="e.g. Bandung" />
                  <Field label="Regency / District" value={vm.formData.regency} onChange={(v:any) => vm.updateField("regency", v)} placeholder="e.g. Coblong" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Zip Code" value={vm.formData.zip_code} onChange={(v:any) => vm.updateField("zip_code", v)} placeholder="e.g. 40132" />
                  <div className="hidden md:block" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Full Address</label>
                  <textarea 
                    value={vm.formData.address} 
                    onChange={e => vm.updateField("address", e.target.value)} 
                    placeholder="e.g. Jl. Kalidosok Raya No. 21"
                    className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white outline-none text-sm h-24 resize-none transition-all focus:border-orange-500/50"
                  />
                </div>
              </SlideSection>
            )}

            {vm.slide === 3 && (
              <SlideSection title="Banking" subtitle="Payment details" icon={<CreditCard size={22} className="text-yellow-500" />} accentColor="#fbbf24">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bank Name</label>
                  <select
                    value={vm.formData.bank_name}
                    onChange={e => vm.updateField("bank_name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white outline-none text-sm appearance-none"
                  >
                    <option value="" className="bg-[#0c0c1c]">Select Bank...</option>
                    <option value="BNI" className="bg-[#0c0c1c]">BNI</option>
                    <option value="Mandiri" className="bg-[#0c0c1c]">Mandiri</option>
                    <option value="BCA" className="bg-[#0c0c1c]">BCA</option>
                    <option value="BRI" className="bg-[#0c0c1c]">BRI</option>
                  </select>
                </div>
                <Field label="Account Number" value={vm.formData.bank_account} onChange={(v:any) => vm.updateField("bank_account", v)} />
                <Field label="Holder Name" value={vm.formData.bank_account_name} onChange={(v:any) => vm.updateField("bank_account_name", v)} />
              </SlideSection>
            )}

            {vm.slide === 4 && (
              <SlideSection title="Documents" subtitle="Legal docs" icon={<FileText size={22} className="text-orange-500" />} accentColor="#f59e0b">
                <div className="flex gap-2">
                  <select 
                    value={docType} 
                    onChange={e => setDocType(e.target.value)} 
                    className="flex-1 px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white outline-none text-sm appearance-none"
                  >
                    {["NPWP", "SIUP", "NIB"].map(t => <option key={t} value={t} className="bg-[#0c0c1c]">{t}</option>)}
                  </select>
                  <button 
                    onClick={() => docInputRef.current?.click()} 
                    className="w-12 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shrink-0"
                  >
                    {vm.isUploadingDoc ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  </button>
                </div>
                <input ref={docInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && vm.handleDocUpload(e.target.files[0], docType)} />
                <div className="flex flex-col gap-3 mt-2">
                  {vm.uploadedDocs.map((d, i) => (
                    <div key={i} className="p-4 bg-white/3 border border-white/5 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <FileText size={16} className="text-orange-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-200">{d.name} <span className="text-gray-500 text-xs ml-1">({d.type})</span></span>
                      </div>
                      <button onClick={() => vm.setUploadedDocs(p => p.filter((_, idx) => idx !== i))} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                        <X size={16} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </SlideSection>
            )}

            {vm.slide === 5 && (
              <SlideSection title="Upload Data" subtitle="Import Data" icon={<UploadCloud size={22} className="text-emerald-500" />} accentColor="#10b981">
                <div className="p-8 md:p-12 border-2 border-dashed border-white/10 rounded-3xl text-center bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet size={32} className="text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400 mb-6">{vm.selectedFile ? vm.selectedFile.name : "Select Excel or CSV to import"}</p>
                  <label className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white cursor-pointer transition-all">
                    Browse Files
                    <input type="file" accept=".csv, .xlsx, .xls" onChange={e => vm.setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                </div>
              </SlideSection>
            )}

            {vm.slide === 6 && (
              <SlideSection title="Success" subtitle="Workspace ready" icon={<LogIn size={22} className="text-pink-500" />} accentColor="#ec4899">
                <div className="flex flex-col gap-3">
                  {vm.companies.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => vm.setSelectedCompany(c)} 
                      className={`
                        p-5 rounded-2xl text-left transition-all border-2
                        ${vm.selectedCompany?.id === c.id 
                          ? "bg-orange-500/10 border-orange-500/50" 
                          : "bg-white/3 border-white/5 hover:border-white/10"
                        }
                      `}
                    >
                      <div className={`font-bold ${vm.selectedCompany?.id === c.id ? "text-orange-400" : "text-gray-200"}`}>{c.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Active Company</div>
                    </button>
                  ))}
                  <button 
                    onClick={handleLoginAsCompany} 
                    className="w-full p-4 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 mt-4"
                  >
                    Enter Workspace
                  </button>
                </div>
              </SlideSection>
            )}

            <div className="mt-8 md:mt-12 flex items-center justify-between gap-4">
              {vm.slide > 1 && vm.slide < 6 && (
                <button 
                  onClick={() => vm.setSlide(vm.slide - 1)} 
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 hover:text-white transition-all"
                >
                  <ChevronLeft size={18} /> Back
                </button>
              )}
              <div className="flex-1" />
              {vm.slide < 6 && (
                <button 
                  onClick={nextSlide} 
                  disabled={vm.isLoading} 
                  className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25"
                >
                  {vm.isLoading ? <Loader2 className="animate-spin" size={18} /> : vm.slide === 5 ? "Finish" : "Next"} 
                  {!vm.isLoading && <ChevronRight size={18} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
