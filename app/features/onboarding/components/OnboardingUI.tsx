import React from "react";

export const SlideSection = ({ title, subtitle, icon, children, accentColor }: any) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 16,
        background: `rgba(${accentColor === '#f97316' ? '249,115,22' : accentColor === '#f59e0b' ? '245,158,11' : '251,191,36'}, 0.12)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</div>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#f3f4f6", margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>{subtitle}</p>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{children}</div>
  </div>
);

export const Field = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)", color: "#fff", outline: "none", fontSize: 14,
      }}
    />
  </div>
);
