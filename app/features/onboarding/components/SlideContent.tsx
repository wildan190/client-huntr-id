import React from "react";
import { 
  Building2, MapPin, CreditCard, UploadCloud, FileText, 
  LogIn, AlertCircle, Loader2, CheckCircle2, X, Plus, 
  FileSpreadsheet 
} from "lucide-react";
import { SlideSection, Field, FormLabel } from "./OnboardingUI";

/**
 * SlideContent Component
 * 
 * Tanggung jawab: Me-render konten form spesifik berdasarkan slide aktif.
 * Memisahkan logika render yang panjang dari file route utama.
 */
export const SlideContent = ({ vm, docType, setDocType, docInputRef, handleLoginAsCompany }: any) => {
  const { slide, formData, updateField, isVerifyingNpwp, npwpVerifiedData, handleVerifyNpwp, uploadedDocs, setUploadedDocs, isUploadingDoc, handleDocUpload, selectedFile, setSelectedFile, companies, selectedCompany, setSelectedCompany } = vm;

  /**
   * Check if country is Indonesia
   */
  const isIndonesia = (): boolean => {
    const country = formData.country?.toUpperCase();
    return country === "ID" || country === "INDONESIA";
  };

  switch (slide) {
    case 1:
      return (
        <SlideSection title="Profil Perusahaan" subtitle="Informasi dasar & identitas" icon={<Building2 size={22} className="text-orange-500" />} accentColor="#f97316">
          <div className="flex flex-col gap-2">
            <FormLabel>Negara & Tax ID{isIndonesia() ? " (NPWP) *" : ""}</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select
                value={formData.country}
                onChange={e => updateField("country", e.target.value)}
                className="px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none"
              >
                <option value="ID">Indonesia</option>
                <option value="MY">Malaysia</option>
                <option value="SG">Singapore</option>
              </select>
              <div className="md:col-span-2 flex gap-2">
                <input 
                  type="text" 
                  placeholder={formData.country === 'ID' ? "01.234.567.8-901.000" : "Tax ID / UEN"} 
                  value={formData.tax_id} 
                  onChange={e => updateField("tax_id", e.target.value)} 
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm" 
                />
                {isIndonesia() && (
                  <button 
                    onClick={handleVerifyNpwp} 
                    disabled={isVerifyingNpwp || !formData.tax_id} 
                    className={`px-4 md:px-6 rounded-xl font-bold text-xs transition-all ${npwpVerifiedData ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20"}`}
                  >
                    {isVerifyingNpwp ? <Loader2 size={16} className="animate-spin" /> : npwpVerifiedData ? <CheckCircle2 size={16} /> : "Verifikasi"}
                  </button>
                )}
              </div>
            </div>
            {npwpVerifiedData && (
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-sm font-bold text-[var(--ui-text-primary)]">{npwpVerifiedData.nama}</div>
                <div className="text-[10px] text-[var(--ui-text-muted)] uppercase tracking-widest mt-0.5">Status: <span className="text-emerald-400 font-bold">{npwpVerifiedData.statusWp || npwpVerifiedData.status || "Aktif"}</span></div>
              </div>
            )}
          </div>
          <Field label="Nama Perusahaan *" value={formData.company_name} onChange={(v:any) => updateField("company_name", v)} placeholder="Contoh: PT Tunas Global Teknologi" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <FormLabel>Jenis Industri</FormLabel>
              <select
                value={formData.industry_type}
                onChange={e => updateField("industry_type", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none"
              >
                <option value="" className="bg-[var(--ui-bg-page)]">Select Industry...</option>
                <option value="Technology" className="bg-[var(--ui-bg-page)]">Technology</option>
                <option value="Manufacturing" className="bg-[var(--ui-bg-page)]">Manufacturing</option>
                <option value="Logistics" className="bg-[var(--ui-bg-page)]">Logistics</option>
                <option value="Healthcare" className="bg-[var(--ui-bg-page)]">Healthcare</option>
                <option value="Retail" className="bg-[var(--ui-bg-page)]">Retail</option>
                <option value="Finance" className="bg-[var(--ui-bg-page)]">Finance</option>
                <option value="Construction" className="bg-[var(--ui-bg-page)]">Construction</option>
                <option value="Services" className="bg-[var(--ui-bg-page)]">Services</option>
                <option value="Other" className="bg-[var(--ui-bg-page)]">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Telepon" value={formData.phone} onChange={(v:any) => updateField("phone", v)} />
            <Field label="Email" value={formData.email} onChange={(v:any) => updateField("email", v)} type="email" />
          </div>
          <div className="flex flex-col gap-2">
            <FormLabel>Business Type *</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {[{ v: "buyer", l: "Buyer" }, { v: "vendor", l: "Vendor" }].map(opt => (
                <button 
                  key={opt.v} 
                  type="button" 
                  onClick={() => updateField("type", opt.v)} 
                  className={`
                    py-3 rounded-xl font-bold text-sm transition-all border-2
                    ${formData.type === opt.v 
                      ? "bg-orange-500/10 border-orange-500/40 text-orange-400" 
                      : "bg-[var(--ui-bg-input)] border-[var(--ui-border-subtle)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-input)]"
                    }
                  `}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </SlideSection>
      );
    
    case 2:
      return (
        <SlideSection title="Location" subtitle="Business address" icon={<MapPin size={22} className="text-amber-500" />} accentColor="#f59e0b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Province *" value={formData.provincy_country} onChange={(v:any) => updateField("provincy_country", v)} placeholder="E.g.: West Java" />
            <Field label="City *" value={formData.city} onChange={(v:any) => updateField("city", v)} placeholder="E.g.: Bandung" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="District" value={formData.regency} onChange={(v:any) => updateField("regency", v)} placeholder="E.g.: Coblong" />
            <Field label="Postal Code" value={formData.zip_code} onChange={(v:any) => updateField("zip_code", v)} placeholder="E.g.: 40132" />
          </div>
          <div className="flex flex-col gap-2">
            <FormLabel>Full Address *</FormLabel>
            <textarea 
              value={formData.address} 
              onChange={e => updateField("address", e.target.value)} 
              placeholder="E.g.: Jl. Kalidosok Raya No. 21"
              className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm h-24 resize-none transition-all focus:border-orange-500/50"
            />
          </div>
        </SlideSection>
      );

    case 3:
      return (
        <SlideSection title="Banking" subtitle="Payment details" icon={<CreditCard size={22} className="text-yellow-500" />} accentColor="#fbbf24">
          <div className="flex flex-col gap-1.5">
            <FormLabel>Bank Name</FormLabel>
            <select
              value={formData.bank_name}
              onChange={e => updateField("bank_name", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none"
            >
              <option value="" className="bg-[var(--ui-bg-page)]">Select Bank...</option>
              <option value="BNI" className="bg-[var(--ui-bg-page)]">BNI</option>
              <option value="Mandiri" className="bg-[var(--ui-bg-page)]">Mandiri</option>
              <option value="BCA" className="bg-[var(--ui-bg-page)]">BCA</option>
              <option value="BRI" className="bg-[var(--ui-bg-page)]">BRI</option>
            </select>
          </div>
          <Field label="Account Number" value={formData.bank_account} onChange={(v:any) => updateField("bank_account", v)} />
          <Field label="Nama Pemilik Rekening" value={formData.bank_account_name} onChange={(v:any) => updateField("bank_account_name", v)} />
        </SlideSection>
      );

    case 4:
      return (
        <SlideSection title="Dokumen" subtitle="Dokumen legalitas" icon={<FileText size={22} className="text-orange-500" />} accentColor="#f59e0b">
          <div className="flex gap-2">
            <select 
              value={docType} 
              onChange={e => setDocType(e.target.value)} 
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none"
            >
              {["NPWP", "SIUP", "NIB"].map(t => <option key={t} value={t} className="bg-[var(--ui-bg-page)]">{t}</option>)}
            </select>
            <button 
              onClick={() => docInputRef.current?.click()} 
              className="w-12 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shrink-0"
            >
              {isUploadingDoc ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            </button>
          </div>
          <input ref={docInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleDocUpload(e.target.files[0], docType)} />
          <div className="flex flex-col gap-3 mt-2">
            {uploadedDocs.map((d: any, i: number) => (
              <div key={i} className="p-4 bg-[var(--ui-bg-input)] border border-[var(--ui-border-subtle)] rounded-xl flex items-center justify-between group hover:border-[var(--ui-border-input)] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <FileText size={16} className="text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-[var(--ui-text-primary)]">{d.name} <span className="text-[var(--ui-text-muted)] text-xs ml-1">({d.type})</span></span>
                </div>
                <button onClick={() => setUploadedDocs((p: any) => p.filter((_: any, idx: number) => idx !== i))} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <X size={16} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </SlideSection>
      );

    case 5:
      return (
        <SlideSection title="Upload Data" subtitle="Import Initial Data" icon={<UploadCloud size={22} className="text-emerald-500" />} accentColor="#10b981">
          <div className="p-8 md:p-12 border-2 border-dashed border-[var(--ui-border-input)] rounded-3xl text-center bg-[var(--ui-bg-input)] hover:bg-[var(--ui-bg-input-focus)] transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-[var(--ui-bg-input)] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={32} className="text-[var(--ui-text-muted)]" />
            </div>
            <p className="text-sm text-[var(--ui-text-secondary)] mb-6">{selectedFile ? selectedFile.name : "Select an Excel or CSV file to import"}</p>
            <label className="inline-flex items-center px-6 py-3 bg-[var(--ui-bg-input)] hover:bg-[var(--ui-bg-input-focus)] border border-[var(--ui-border-input)] rounded-xl text-sm font-bold text-[var(--ui-text-primary)] cursor-pointer transition-all">
              Choose File
              <input type="file" accept=".csv, .xlsx, .xls" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
          </div>
        </SlideSection>
      );

    case 6:
      return (
        <SlideSection title="Success" subtitle="Your workspace is ready" icon={<LogIn size={22} className="text-pink-500" />} accentColor="#ec4899">
          <div className="flex flex-col gap-3">
            {companies.map((c: any) => (
              <button 
                key={c.id} 
                onClick={() => setSelectedCompany(c)} 
                className={`
                  p-5 rounded-2xl text-left transition-all border-2
                  ${selectedCompany?.id === c.id 
                    ? "bg-orange-500/10 border-orange-500/50" 
                    : "bg-[var(--ui-bg-input)] border-[var(--ui-border-subtle)] hover:border-[var(--ui-border-input)]"
                  }
                `}
              >
                <div className={`font-bold ${selectedCompany?.id === c.id ? "text-orange-400" : "text-[var(--ui-text-primary)]"}`}>{c.name}</div>
                <div className="text-[10px] text-[var(--ui-text-muted)] uppercase tracking-widest mt-1">Perusahaan Aktif</div>
              </button>
            ))}
            <button 
              onClick={handleLoginAsCompany} 
              className="w-full p-4 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 mt-4"
            >
              Masuk ke Workspace
            </button>
          </div>
        </SlideSection>
      );

    default:
      return null;
  }
};
