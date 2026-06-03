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

  switch (slide) {
    case 1:
      return (
        <SlideSection title="Profil Perusahaan" subtitle="Informasi dasar & identitas" icon={<Building2 size={22} className="text-orange-500" />} accentColor="#f97316">
          <div className="flex flex-col gap-2">
            <FormLabel>NPWP Perusahaan *</FormLabel>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="01.234.567.8-901.000" 
                value={formData.tax_id} 
                onChange={e => updateField("tax_id", e.target.value)} 
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm" 
              />
              <button 
                onClick={handleVerifyNpwp} 
                disabled={isVerifyingNpwp || !formData.tax_id} 
                className={`px-4 md:px-6 rounded-xl font-bold text-xs transition-all ${npwpVerifiedData ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20"}`}
              >
                {isVerifyingNpwp ? <Loader2 size={16} className="animate-spin" /> : npwpVerifiedData ? <CheckCircle2 size={16} /> : "Verifikasi"}
              </button>
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
                <option value="" className="bg-[var(--ui-bg-page)]">Pilih Industri...</option>
                <option value="Technology" className="bg-[var(--ui-bg-page)]">Teknologi</option>
                <option value="Manufacturing" className="bg-[var(--ui-bg-page)]">Manufaktur</option>
                <option value="Logistics" className="bg-[var(--ui-bg-page)]">Logistik</option>
                <option value="Healthcare" className="bg-[var(--ui-bg-page)]">Kesehatan</option>
                <option value="Retail" className="bg-[var(--ui-bg-page)]">Retail</option>
                <option value="Finance" className="bg-[var(--ui-bg-page)]">Keuangan</option>
                <option value="Construction" className="bg-[var(--ui-bg-page)]">Konstruksi</option>
                <option value="Services" className="bg-[var(--ui-bg-page)]">Jasa</option>
                <option value="Other" className="bg-[var(--ui-bg-page)]">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Telepon" value={formData.phone} onChange={(v:any) => updateField("phone", v)} />
            <Field label="Email" value={formData.email} onChange={(v:any) => updateField("email", v)} type="email" />
          </div>
          <div className="flex flex-col gap-2">
            <FormLabel>Tipe Bisnis *</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {[{ v: "buyer", l: "Pembeli (Buyer)" }, { v: "vendor", l: "Penjual (Vendor)" }].map(opt => (
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
        <SlideSection title="Lokasi" subtitle="Alamat bisnis" icon={<MapPin size={22} className="text-amber-500" />} accentColor="#f59e0b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Provinsi" value={formData.provincy_country} onChange={(v:any) => updateField("provincy_country", v)} placeholder="Contoh: Jawa Barat" />
            <div className="flex flex-col gap-1.5">
              <FormLabel>Wilayah</FormLabel>
              <select
                value={formData.region}
                onChange={e => updateField("region", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none"
              >
                <option value="" className="bg-[var(--ui-bg-page)]">Pilih Wilayah...</option>
                <option value="Indonesia" className="bg-[var(--ui-bg-page)]">Indonesia</option>
                <option value="Malaysia" className="bg-[var(--ui-bg-page)]">Malaysia</option>
                <option value="Singapore" className="bg-[var(--ui-bg-page)]">Singapore</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Kota" value={formData.city} onChange={(v:any) => updateField("city", v)} placeholder="Contoh: Bandung" />
            <Field label="Kecamatan" value={formData.regency} onChange={(v:any) => updateField("regency", v)} placeholder="Contoh: Coblong" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Kode Pos" value={formData.zip_code} onChange={(v:any) => updateField("zip_code", v)} placeholder="Contoh: 40132" />
          </div>
          <div className="flex flex-col gap-2">
            <FormLabel>Alamat Lengkap</FormLabel>
            <textarea 
              value={formData.address} 
              onChange={e => updateField("address", e.target.value)} 
              placeholder="Contoh: Jl. Kalidosok Raya No. 21"
              className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm h-24 resize-none transition-all focus:border-orange-500/50"
            />
          </div>
        </SlideSection>
      );

    case 3:
      return (
        <SlideSection title="Perbankan" subtitle="Detail pembayaran" icon={<CreditCard size={22} className="text-yellow-500" />} accentColor="#fbbf24">
          <div className="flex flex-col gap-1.5">
            <FormLabel>Nama Bank</FormLabel>
            <select
              value={formData.bank_name}
              onChange={e => updateField("bank_name", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none"
            >
              <option value="" className="bg-[var(--ui-bg-page)]">Pilih Bank...</option>
              <option value="BNI" className="bg-[var(--ui-bg-page)]">BNI</option>
              <option value="Mandiri" className="bg-[var(--ui-bg-page)]">Mandiri</option>
              <option value="BCA" className="bg-[var(--ui-bg-page)]">BCA</option>
              <option value="BRI" className="bg-[var(--ui-bg-page)]">BRI</option>
            </select>
          </div>
          <Field label="Nomor Rekening" value={formData.bank_account} onChange={(v:any) => updateField("bank_account", v)} />
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
        <SlideSection title="Unggah Data" subtitle="Impor Data Awal" icon={<UploadCloud size={22} className="text-emerald-500" />} accentColor="#10b981">
          <div className="p-8 md:p-12 border-2 border-dashed border-[var(--ui-border-input)] rounded-3xl text-center bg-[var(--ui-bg-input)] hover:bg-[var(--ui-bg-input-focus)] transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-[var(--ui-bg-input)] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={32} className="text-[var(--ui-text-muted)]" />
            </div>
            <p className="text-sm text-[var(--ui-text-secondary)] mb-6">{selectedFile ? selectedFile.name : "Pilih file Excel atau CSV untuk diimpor"}</p>
            <label className="inline-flex items-center px-6 py-3 bg-[var(--ui-bg-input)] hover:bg-[var(--ui-bg-input-focus)] border border-[var(--ui-border-input)] rounded-xl text-sm font-bold text-[var(--ui-text-primary)] cursor-pointer transition-all">
              Cari File
              <input type="file" accept=".csv, .xlsx, .xls" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
          </div>
        </SlideSection>
      );

    case 6:
      return (
        <SlideSection title="Berhasil" subtitle="Workspace Anda sudah siap" icon={<LogIn size={22} className="text-pink-500" />} accentColor="#ec4899">
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
