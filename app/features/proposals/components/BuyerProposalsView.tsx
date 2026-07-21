import React from "react";
import { RefreshCw, Loader2, Briefcase, Building2, Clock, ShieldCheck, DollarSign, Calendar, MessageSquare, Trophy } from "lucide-react";

export function BuyerProposalsView({ 
  receivedProposals, 
  proposalsLoading, 
  activeCompany, 
  awardingId, 
  onRefresh, 
  onNegotiate, 
  onAward 
}: { 
  receivedProposals: any[]; 
  proposalsLoading: boolean; 
  activeCompany: any; 
  awardingId: string | null;
  onRefresh: (companyId: string | number) => void;
  onNegotiate: (proposal: any) => void;
  onAward: (proposalId: string) => void;
}) {
  const secondaryBtnStyle: React.CSSProperties = {
    background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
    color: "var(--ui-text-secondary)", padding: "10px 20px", borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center"
  };
  const primaryBtnStyle: React.CSSProperties = {
    background: "var(--ui-text-primary)", color: "var(--ui-bg-page)",
    border: "none", padding: "10px 20px", borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center"
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
  const itemDetailStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8, fontSize: 13,
    color: "var(--ui-text-muted)", fontWeight: 600
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>Received Proposals ({receivedProposals.length})</h2>
          <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", marginTop: 4 }}>Evaluate vendor offers and proceed to negotiation or award.</p>
        </div>
        <button onClick={() => onRefresh(activeCompany.id)} style={secondaryBtnStyle}>
          <RefreshCw size={16} style={{ marginRight: 8 }} /> Refresh
        </button>
      </div>

      {proposalsLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><Loader2 className="animate-spin" color="var(--huntr-orange)" size={40} /></div>
      ) : receivedProposals.length === 0 ? (
        <div style={emptyStateStyle}>
          <Briefcase size={48} color="var(--ui-text-muted)" style={{ marginBottom: 16, opacity: 0.2 }} />
          <div style={{ color: "var(--ui-text-primary)", fontSize: 15, fontWeight: 700 }}>No Proposals Received</div>
          <div style={{ color: "var(--ui-text-muted)", fontSize: 13, marginTop: 4 }}>Vendors haven't submitted any offers for your RFQs yet.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          {receivedProposals.map(p => (
            <div key={p.id} style={{ ...cardStyle, cursor: "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                 <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                   <div style={iconContainerStyle}><Building2 size={20} /></div>
                   <div>
                     <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", margin: 0 }}>{p.company?.name}</h4>
                     <div style={{ fontSize: 12, color: "var(--ui-text-brand)", fontWeight: 700, marginTop: 2 }}>RFQ: {p.rfq?.title}</div>
                   </div>
                 </div>
                 <div style={{ textAlign: "right" }}>
                   <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>TOTAL OFFER</div>
                   <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)" }}>Rp {Number(p.price_offer).toLocaleString('id-ID')}</div>
                 </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 20, padding: "20px 0", borderTop: "1px solid var(--ui-border)", borderBottom: "1px solid var(--ui-border)", marginTop: 20 }}>
                <div style={itemDetailStyle}><Clock size={14} /> Lead Time: {p.delivery_days} Days</div>
                <div style={itemDetailStyle}><ShieldCheck size={14} /> Warranty: {p.warranty_months} Months</div>
                <div style={itemDetailStyle}><DollarSign size={14} /> Terms: {p.payment_term}</div>
                <div style={itemDetailStyle}><Calendar size={14} /> Submitted: {new Date(p.created_at).toLocaleDateString()}</div>
              </div>

              {p.rfq?.status === 'active' && p.winner_status !== 'rejected' && p.winner_status !== 'awarded' && p.winner_status !== 'approved' && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
                  <button 
                    onClick={() => onNegotiate(p)}
                    style={{ ...secondaryBtnStyle, display: "flex", alignItems: "center", gap: 8, color: "var(--huntr-orange)" }}
                  >
                    <MessageSquare size={16} /> Negotiate
                  </button>
                  <button 
                    onClick={() => onAward(p.id)}
                    disabled={awardingId === p.id}
                    style={{ ...primaryBtnStyle, minWidth: 160 }}
                  >
                    {awardingId === p.id ? <Loader2 size={18} className="animate-spin" /> : <><Trophy size={16} style={{ marginRight: 8 }} /> Award Proposal</>}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
