import React from "react";
import { FileText, Building2, ClipboardList, FileCheck2, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type FeatureVariant = "orange" | "amber" | "indigo" | "purple";

interface AuthLayoutProps {
  variant?: "login" | "register";
  visualTitle: string;
  visualText: string;
  features: string[];
  featureVariant?: FeatureVariant;
  children: React.ReactNode;
}

export default function AuthLayout({
  variant = "login",
  visualTitle,
  visualText,
  features,
  featureVariant = "orange",
  children,
}: AuthLayoutProps) {
  const isRegister = variant === "register";

  return (
    <div className="min-h-screen flex w-full bg-[var(--ui-bg-page-grad)]">
      {/* Left Side: Form Container */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar with Logo and Theme toggle */}
        <div className="p-6 md:p-8 flex items-center justify-between">
          <img 
            src="/assets/img/logo/sidebar.png" 
            alt="HUNTR" 
            className="h-8 object-contain" 
          />
          <ThemeToggle />
        </div>
        
        {/* Form Area */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-12 lg:px-24">
          <div className="w-full max-w-[420px] mx-auto">
            {children}
          </div>
        </div>
        
        {/* Simple Footer */}
        <div className="p-6 text-center text-xs text-[var(--ui-text-muted)] font-medium">
          &copy; 2026 Huntr.id &bull; Secure Environment
        </div>
      </div>

      {/* Right Side: Visuals (Hidden on Mobile/Tablet) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden bg-slate-900">
        <img
          src="/assets/img/auth-assets/enterprise-building.jpg"
          alt="Enterprise building"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/95" />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-center px-12 xl:px-20">
          {!isRegister ? (
            <div className="max-w-[480px]">
              <h2 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
                {visualTitle}
              </h2>
              <p className="text-slate-300 text-base mb-8 leading-relaxed">
                {visualText}
              </p>
              <div className="flex flex-wrap gap-3">
                {features.map((feature) => (
                  <span
                    key={feature}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-[480px]">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
                  Dokumen yang Perlu Disiapkan
                </h3>
                <ul className="space-y-4">
                  {[
                    { icon: FileText, text: "NIB (Nomor Induk Berusaha)" },
                    { icon: Building2, text: "NPWP (Nomor Pokok Wajib Pajak)" },
                    { icon: ClipboardList, text: "SIUP (Surat Izin Usaha Perdagangan)" },
                    { icon: FileCheck2, text: "Akta Pendirian Perusahaan" },
                    { icon: User, text: "KTP Direktur/Penanggung Jawab" },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 bg-white/5 rounded-xl p-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <item.icon size={18} />
                      </div>
                      <span className="text-sm text-slate-200 font-medium">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
