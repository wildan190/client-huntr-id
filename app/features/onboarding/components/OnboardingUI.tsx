import React from "react";

export const SlideSection = ({ title, subtitle, icon, children, accentColor }: any) => (
  <div className="flex flex-col gap-6 animate-fade-in">
    <div className="flex items-center gap-3 md:gap-4">
      <div 
        className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: `rgba(${accentColor === '#f97316' ? '249,115,22' : accentColor === '#f59e0b' ? '245,158,11' : '251,191,36'}, 0.12)`,
        }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-black text-gray-100 leading-tight">{title}</h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);

export const Field = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white outline-none text-sm transition-all focus:border-orange-500/50"
    />
  </div>
);
