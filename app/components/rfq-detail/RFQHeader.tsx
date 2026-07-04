import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../../hooks/useMediaQuery";

interface RFQHeaderProps {
  rfq: any;
  isTenderExpired: () => boolean;
}

export function RFQHeader({ rfq, isTenderExpired }: RFQHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: isMobile ? "flex-start" : "center", 
      marginBottom: 16,
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? 12 : 0
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            background: "var(--ui-bg-card)",
            border: "1px solid var(--ui-border)",
            color: "var(--ui-text-primary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      
      {rfq && (
         <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 6, 
              padding: "6px 12px", 
              borderRadius: 8, 
              fontSize: isMobile ? 11 : 12, 
              fontWeight: 600, 
              background: isTenderExpired() ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", 
              color: isTenderExpired() ? "#ef4444" : "#22c55e", 
              border: `1px solid ${isTenderExpired() ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}` 
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: isTenderExpired() ? "#ef4444" : "#22c55e" }} />
              {isTenderExpired() ? "CLOSED" : "ACTIVE"}
            </div>
            <div style={{ padding: "6px 12px", borderRadius: 8, fontSize: isMobile ? 11 : 12, fontWeight: 600, background: "var(--ui-bg-card)", color: "var(--ui-text-primary)", border: "1px solid var(--ui-border)" }}>
              PR #{rfq.id ? String(rfq.id).substring(0, 8).toUpperCase() : ""}
            </div>
         </div>
      )}
    </div>
  );
}