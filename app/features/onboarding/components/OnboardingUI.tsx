import React from "react";

/**
 * SlideSection Component
 * 
 * Wadah untuk setiap langkah onboarding dengan animasi dan identitas visual.
 */
export const SlideSection = ({ title, subtitle, icon, children, accentColor }: any) => (
  <div className="flex flex-col gap-6 animate-fade-in">
    <div className="flex items-center gap-3 md:gap-4">
      <div 
        className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        style={{
          background: `rgba(${accentColor === '#f97316' ? '249,115,22' : accentColor === '#f59e0b' ? '245,158,11' : '251,191,36'}, 0.12)`,
        }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-black text-[var(--ui-text-primary)] leading-tight">{title}</h2>
        <p className="text-xs md:text-sm text-[var(--ui-text-secondary)] mt-1">{subtitle}</p>
      </div>
    </div>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);

/**
 * Field Component
 * 
 * Komponen input standar dengan label yang konsisten.
 */
export const Field = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] md:text-[11px] font-bold text-[var(--ui-text-muted)] uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm transition-all focus:border-orange-500/50"
    />
  </div>
);

/**
 * FormLabel Component
 * 
 * Label kecil yang digunakan secara konsisten di seluruh form.
 */
export const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] md:text-[11px] font-bold text-[var(--ui-text-muted)] uppercase tracking-wider">
    {children}
  </label>
);
