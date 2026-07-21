import React from "react";
import { RefreshCw, Loader2, Briefcase, FileText, Package, Calendar, ArrowRight } from "lucide-react";

export function VendorTendersView({
  openRfqs,
  rfqsLoading,
  vendorSubmittedRfqIds,
  isTenderExpired,
  onRefresh,
  onSelectRfq
}: {
  openRfqs: any[];
  rfqsLoading: boolean;
  vendorSubmittedRfqIds: string[];
  isTenderExpired: (rfq: any) => boolean;
  onRefresh: () => void;
  onSelectRfq: (rfq: any) => void;
}) {
  const secondaryBtnStyle: React.CSSProperties = {
    background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
    color: "var(--ui-text-secondary)", padding: "10px 20px", borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center"
  };
  const primaryBtnStyle: React.CSSProperties = {
    background: "var(--ui-text-primary)", color: "var(--ui-bg-page)",
    border: "none", padding: "10px 20px", borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
  };
  const emptyStateStyle: React.CSSProperties = {
    padding: "60px 40px", textAlign: "center", background: "var(--ui-bg-card)",
    borderRadius: 24, border: "1px dashed var(--ui-border)",
    display: "flex", flexDirection: "column", alignItems: "center"
  };
  const cardStyle: React.CSSProperties = {
    background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
    borderRadius: 20, padding: 24, display: "flex", flexDirection: "column",
    cursor: "pointer", transition: "all 0.2s"
  };
  const iconContainerStyle: React.CSSProperties = {
    width: 48, height: 48, borderRadius: 14, background: "rgba(249,115,22,0.1)",
    color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center"
  };
  const badgeStyle: React.CSSProperties = {
    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800,
    background: "var(--ui-bg-input)", color: "var(--ui-text-primary)"
  };
  const itemDetailStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8, fontSize: 13,
    color: "var(--ui-text-muted)", fontWeight: 600
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>Available Opportunities</h2>
          <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", marginTop: 4 }}>Review and participate in active buyer requests.</p>
        </div>
        <button onClick={onRefresh} style={secondaryBtnStyle}>
          <RefreshCw size={16} style={{ marginRight: 8 }} /> Refresh
        </button>
      </div>

      {rfqsLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><Loader2 className="animate-spin" color="var(--huntr-orange)" size={40} /></div>
      ) : openRfqs.length === 0 ? (
        <div style={emptyStateStyle}>
          <Briefcase size={48} color="var(--ui-text-muted)" style={{ marginBottom: 16, opacity: 0.2 }} />
          <div style={{ color: "var(--ui-text-primary)", fontSize: 15, fontWeight: 700 }}>No Active Tenders</div>
          <div style={{ color: "var(--ui-text-muted)", fontSize: 13, marginTop: 4 }}>Check back later for new opportunities.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
          {openRfqs.filter((rfq: any) => !isTenderExpired(rfq)).map(rfq => (
            <div 
              key={rfq.id} 
              style={{
                ...cardStyle,
                ...(vendorSubmittedRfqIds.includes(rfq.id) ? { cursor: "default" } : {})
              }} 
              onClick={() => {
                if (!vendorSubmittedRfqIds.includes(rfq.id)) {
                  onSelectRfq(rfq);
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                 <div style={iconContainerStyle}><FileText size={20} /></div>
                 <div style={badgeStyle}>#{rfq.id ? String(rfq.id).substring(0, 8).toUpperCase() : ""}</div>
              </div>
              
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-brand)", textTransform: "uppercase", letterSpacing: 0.5 }}>{rfq.company?.name}</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: "4px 0 0", lineHeight: 1.4 }}>{rfq.title}</h4>
              </div>

              <div style={{ display: "flex", gap: 20, padding: "16px 0", borderTop: "1px solid var(--ui-border)", borderBottom: "1px solid var(--ui-border)", marginTop: 8 }}>
                <div style={itemDetailStyle}>
                  <Package size={14} color="var(--ui-text-brand)" /> {rfq.items?.length || 0} Items
                </div>
                <div style={itemDetailStyle}>
                  <Calendar size={14} color="var(--ui-text-brand)" /> {new Date(rfq.created_at).toLocaleDateString()}
                </div>
              </div>

              <button 
                disabled={vendorSubmittedRfqIds.includes(rfq.id)}
                style={{ 
                  ...primaryBtnStyle, 
                  width: "100%", 
                  marginTop: 12,
                  ...(vendorSubmittedRfqIds.includes(rfq.id) ? {
                    background: "var(--ui-border)",
                    color: "var(--ui-text-muted)",
                    cursor: "not-allowed",
                    boxShadow: "none"
                  } : {})
                }}
              >
                {vendorSubmittedRfqIds.includes(rfq.id) ? "Proposal Submitted" : "Submit Quotation"} <ArrowRight size={14} style={{ marginLeft: 8 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
