import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { 
  Building2, MapPin, CreditCard, FileText, UploadCloud, 
  LogIn, ChevronRight, ChevronLeft, Loader2, AlertCircle 
} from "lucide-react";

// --- MVVM: ViewModel ---
import { useOnboardingViewModel } from "../features/onboarding/hooks/useOnboardingViewModel";

// --- UI: Components ---
import { StepTracker } from "../features/onboarding/components/StepTracker";
import { SlideContent } from "../features/onboarding/components/SlideContent";
import ThemeToggle from "../components/ThemeToggle";

// --- Config: Metadata ---
const TOTAL_SLIDES = 6;
const STEP_META = [
  { id: 1, icon: Building2, label: "Profil", color: "#f97316" },
  { id: 2, icon: MapPin,     label: "Lokasi", color: "#f59e0b" },
  { id: 3, icon: CreditCard, label: "Bank",   color: "#fbbf24" },
  { id: 4, icon: FileText,   label: "Dokumen", color: "#f59e0b" },
  { id: 5, icon: UploadCloud,label: "Data",   color: "#10b981" },
  { id: 6, icon: LogIn,      label: "Selesai", color: "#fb923c" },
];

/**
 * Onboarding Route Component
 * 
 * Tanggung jawab: Entry point untuk fitur onboarding.
 * Mengoordinasikan ViewModel, StepTracker, dan SlideContent.
 */
export default function Onboarding() {
  const vm = useOnboardingViewModel();
  const navigate = useNavigate();
  const docInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("NPWP");

  /**
   * Validasi lokal sebelum pindah slide
   */
  const validateCurrentSlide = (): string | null => {
    if (vm.slide === 1) {
      if (!vm.formData.company_name.trim()) return "Nama perusahaan wajib diisi.";
      if (!vm.formData.type) return "Pilih tipe bisnis Anda.";
      if (!vm.npwpVerifiedData) return "Mohon verifikasi NPWP sebelum melanjutkan.";
    }
    if (vm.slide === 4 && vm.uploadedDocs.length === 0) {
      return "Mohon unggah setidaknya satu dokumen legal.";
    }
    if (vm.slide === 5 && !vm.selectedFile) {
      return "Mohon pilih file CSV atau Excel untuk diimpor.";
    }
    return null;
  };

  /**
   * Navigasi ke slide berikutnya
   */
  const nextSlide = async () => {
    const err = validateCurrentSlide();
    if (err) {
      vm.setError(err);
      return;
    }
    
    vm.setError(null);
    if (vm.slide === 5) {
      try {
        await vm.handleCompanySubmit();
      } catch (err: any) {
        console.error("Submission failed:", err);
      }
      return;
    }
    
    if (vm.slide < TOTAL_SLIDES) {
      vm.setSlide(p => p + 1);
    }
  };

  /**
   * Menangani aksi masuk ke workspace setelah berhasil onboarding
   */
  const handleLoginAsCompany = () => {
    if (!vm.selectedCompany) return;
    localStorage.setItem("active_company", JSON.stringify(vm.selectedCompany));
    vm.resetForm();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[var(--ui-bg-page-grad)]">
      
      {/* Visual Decor: Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-8%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 65%)" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[350px] md:w-[700px] h-[350px] md:h-[700px] rounded-full bg-radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 65%)" />
      </div>

      {/* Branding Header */}
      <header className="fixed top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/img/logo/emblem.jpg" 
            alt="Huntr Logo" 
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover shadow-[0_4px_16px_rgba(249,115,22,0.35)]"
          />
          <div className="hidden sm:block">
            <div className="font-black text-sm md:text-base text-[var(--ui-text-primary)] tracking-tight">Huntr.id</div>
            <div className="text-[8px] md:text-[9px] text-orange-400 tracking-[0.12em] font-bold uppercase">Onboarding</div>
          </div>
        </div>
        
        <ThemeToggle />
      </header>

      <main className="w-full max-w-2xl relative z-1">
        {/* Step Tracker UI */}
        <StepTracker steps={STEP_META} currentSlide={vm.slide} />

        {/* Main Card Container */}
        <div className="bg-[var(--ui-bg-card)] border border-[var(--ui-border)] rounded-3xl backdrop-blur-3xl overflow-hidden shadow-2xl">
          {/* Top Progress Bar */}
          <div 
            className="h-1 transition-all duration-500" 
            style={{ 
              background: `linear-gradient(90deg, ${STEP_META[Math.min(vm.slide - 1, 5)].color}, ${STEP_META[Math.min(vm.slide - 1, 5)].color}80)`,
              width: `${(vm.slide / TOTAL_SLIDES) * 100}%` 
            }} 
          />
          
          <div className="p-6 md:p-10">
            {/* Global Error Display */}
            {vm.error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-red-400 text-sm mb-6 flex items-center gap-2 animate-shake">
                <AlertCircle size={16} /> {vm.error}
              </div>
            )}

            {/* Render Slide Content */}
            <SlideContent 
              vm={vm} 
              docType={docType} 
              setDocType={setDocType} 
              docInputRef={docInputRef}
              handleLoginAsCompany={handleLoginAsCompany}
            />

            {/* Navigation Buttons */}
            <footer className="mt-8 md:mt-12 flex items-center justify-between gap-4">
              {vm.slide > 1 && vm.slide < 6 && (
                <button 
                  onClick={() => vm.setSlide((p: any) => p - 1)} 
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--ui-border)] text-[var(--ui-text-muted)] font-bold text-sm hover:bg-[var(--ui-bg-input)] hover:text-[var(--ui-text-primary)] transition-all"
                >
                  <ChevronLeft size={18} /> Kembali
                </button>
              )}
              <div className="flex-1" />
              {vm.slide < 6 && (
                <button 
                  onClick={nextSlide} 
                  disabled={vm.isLoading} 
                  className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25"
                >
                  {vm.isLoading ? <Loader2 className="animate-spin" size={18} /> : vm.slide === 5 ? "Selesai" : "Lanjut"} 
                  {!vm.isLoading && <ChevronRight size={18} />}
                </button>
              )}
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
