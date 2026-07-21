import React from "react";

export function VendorSubmissionsList({
  vendorSubmissions
}: {
  vendorSubmissions: any[];
}) {
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
  const badgeStyle: React.CSSProperties = {
    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800,
    background: "var(--ui-bg-input)", color: "var(--ui-text-primary)"
  };

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>My Submissions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 24 }}>
        {vendorSubmissions.length === 0 ? (
          <div style={{ ...emptyStateStyle, padding: 40 }}>
            <p style={{ color: "var(--ui-text-muted)", fontSize: 13 }}>No submissions yet.</p>
          </div>
        ) : (
          vendorSubmissions.map(p => (
            <div key={p.id} style={{ ...cardStyle, cursor: "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: 0 }}>{p.rfq?.title}</h4>
                  <p style={{ fontSize: 12, color: "var(--ui-text-muted)", margin: "4px 0" }}>Buyer: {p.buyer_name}</p>
                  <p style={{ fontSize: 12, color: "var(--ui-text-brand)", fontWeight: 700, margin: "4px 0" }}>Your Bid: Rp {Number(p.price_offer).toLocaleString()}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ 
                    ...badgeStyle, 
                    background: p.is_winner ? "rgba(34,197,94,0.1)" : p.rank <= 3 ? "rgba(249,115,22,0.1)" : "rgba(107,114,128,0.1)",
                    color: p.is_winner ? "#22c55e" : p.rank <= 3 ? "#f97316" : "#6b7280"
                  }}>
                    {p.is_winner ? "WINNER" : `RANK #${p.rank}`}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--ui-text-muted)", marginTop: 4 }}>
                    of {p.total_participants} vendors
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 16, padding: "16px 0", borderTop: "1px solid var(--ui-border)" }}>
                <div style={{ fontSize: 13, color: "var(--ui-text-muted)", fontWeight: 600 }}>
                  Submitted: {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
