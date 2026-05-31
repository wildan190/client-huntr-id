import React from "react";
import { Sun, Moon, Settings } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, resetToAuto, isAuto, isDark } = useTheme();

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        style={{
          padding: "8px 12px", borderRadius: 8,
          fontSize: 12, fontWeight: 600,
          background: !isAuto ? "rgba(249,115,22,0.2)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          border: !isAuto ? "1px solid rgba(249,115,22,0.4)" : isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.15)",
          color: !isAuto ? "#f97316" : isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all 0.2s",
        }}
      >
        {isDark ? <Sun size={13} /> : <Moon size={13} />}
        {isDark ? "Light" : "Dark"}
      </button>
      <button
        onClick={resetToAuto}
        title="Follow system theme preference"
        style={{
          padding: "8px 12px", borderRadius: 8,
          fontSize: 12, fontWeight: 600,
          background: isAuto ? "rgba(249,115,22,0.2)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          border: isAuto ? "1px solid rgba(249,115,22,0.4)" : isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.15)",
          color: isAuto ? "#f97316" : isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all 0.2s",
        }}
      >
        <Settings size={13} />
        Auto
      </button>
    </div>
  );
}
