import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Layout from "../components/Layout";
import { apiGet, apiPost } from "../lib/api";
import { 
  MessageSquare, Loader2, RefreshCw, Briefcase, 
  DollarSign, Clock, ShieldCheck, X, AlertCircle, 
  CheckCircle2, FileText, ChevronRight
} from "lucide-react";

// Negotiation Response Modal for Vendor
function NegotiationResponseModal({ negotiation, onClose, onSuccess }: { negotiation: any, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");

  const handleRespond = async (status: 'accepted' | 'declined') => {
    setLoading(true);
    try {
      await apiPost(`/api/orders/negotiate/${negotiation.id}/respond`, {
        status,
        vendor_remarks: remarks
      });
      alert(`Negotiation ${status} successfully!`);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to respond to negotiation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20 }}>
      <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 32, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--ui-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)" }}>Review Negotiation</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ui-text-muted)", fontWeight: 600 }}>Proposed terms for RFQ: {negotiation.proposal?.rfq?.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--ui-text-muted)", cursor: "pointer" }}><X size={24} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Terms Comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid var(--ui-border)" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: "var(--ui-text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Original Offer</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-primary)" }}>Rp {Number(negotiation.proposal?.price_offer).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>Term: {negotiation.proposal?.payment_term}</div>
            </div>
            <div style={{ padding: 16, background: "rgba(249,115,22,0.05)", borderRadius: 16, border: "1px solid rgba(249,115,22,0.2)" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: "var(--huntr-orange)", textTransform: "uppercase", marginBottom: 8 }}>Buyer's Counter</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--huntr-orange)" }}>Rp {negotiation.items?.reduce((acc: number, item: any) => acc + (Number(item.negotiated_price) * item.negotiated_qty), 0).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>Term: {negotiation.payment_scheme}</div>
            </div>
          </div>

          {/* Negotiated Items */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 900, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "block" }}>Negotiated Items</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {negotiation.items?.map((it: any, idx: number) => (
                <div key={idx} style={{ padding: 16, background: "var(--ui-bg-input)", borderRadius: 16, border: "1px solid var(--ui-border-input)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-primary)" }}>{it.proposal_item?.rfq_item?.catalogue?.name || "Item"}</div>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 600 }}>Qty: {it.negotiated_qty}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--huntr-orange)" }}>Rp {Number(it.negotiated_price).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--ui-text-muted)" }}>per Unit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 900, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>Your Response Remarks</label>
            <textarea 
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Any comments regarding your decision..."
              style={{ width: "100%", background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)", borderRadius: 12, padding: 16, fontSize: 14, color: "var(--ui-text-primary)", minHeight: 100, outline: "none", resize: "none" }}
            />
          </div>
        </div>

        <div style={{ padding: 32, borderTop: "1px solid var(--ui-border)", display: "flex", gap: 16 }}>
          <button 
            onClick={() => handleRespond('declined')}
            disabled={loading}
            style={{ flex: 1, padding: 16, borderRadius: 16, border: "1px solid #ef4444", background: "none", fontSize: 14, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}
          >
            Decline
          </button>
          <button 
            onClick={() => handleRespond('accepted')}
            disabled={loading}
            style={{ flex: 2, padding: 16, borderRadius: 16, background: "var(--huntr-gradient)", border: "none", color: "#fff", fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: "0 10px 20px rgba(249,115,22,0.2)" }}
          >
            {loading ? <Loader2 className="animate-spin" style={{ margin: "0 auto" }} /> : "Accept New Terms"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Negotiation() {
  const navigate = useNavigate();
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNeg, setSelectedNeg] = useState<any>(null);
  const [showRespondModal, setShowRespondModal] = useState(false);

  useEffect(() => {
    const comp = localStorage.getItem("active_company");
    if (comp) {
      const parsed = JSON.parse(comp);
      setActiveCompany(parsed);
      fetchNegotiations(parsed.id);
    } else {
      navigate("/login");
    }
  }, []);

  const fetchNegotiations = async (companyId: string) => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/orders/negotiations?company_id=${companyId}`);
      setNegotiations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch negotiations", err);
    } finally {
      setLoading(false);
    }
  };

  const isBuyer = activeCompany?.type === 'buyer';

  return (
    <Layout 
      title="Negotiations" 
      subtitle={isBuyer ? "Manage your counter-offers to vendors." : "Respond to buyer counter-offers and finalise terms."}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>
              {isBuyer ? "Sent Counter-Offers" : "Pending Counter-Offers"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", marginTop: 4 }}>
              Track all ongoing price and term negotiations.
            </p>
          </div>
          <button onClick={() => fetchNegotiations(activeCompany.id)} style={secondaryBtnStyle}>
            <RefreshCw size={16} style={{ marginRight: 8 }} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
            <Loader2 className="animate-spin" color="var(--huntr-orange)" size={40} />
          </div>
        ) : negotiations.length === 0 ? (
          <div style={emptyStateStyle}>
            <MessageSquare size={48} color="var(--ui-text-muted)" style={{ marginBottom: 16, opacity: 0.2 }} />
            <div style={{ color: "var(--ui-text-primary)", fontSize: 15, fontWeight: 700 }}>No Negotiations Found</div>
            <div style={{ color: "var(--ui-text-muted)", fontSize: 13, marginTop: 4 }}>You don't have any active negotiation records.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            {negotiations.map(neg => (
              <div key={neg.id} style={{ ...cardStyle, borderLeft: neg.status === 'pending' ? "4px solid var(--huntr-orange)" : "1px solid var(--ui-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: 0 }}>RFQ: {neg.proposal?.rfq?.title}</h4>
                      <div style={{ 
                        padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                        background: neg.status === 'pending' ? "rgba(249,115,22,0.1)" : neg.status === 'accepted' ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: neg.status === 'pending' ? "var(--huntr-orange)" : neg.status === 'accepted' ? "#22c55e" : "#ef4444"
                      }}>
                        {neg.status}
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>
                      {isBuyer ? `Vendor: ${neg.proposal?.company?.name}` : `Buyer: ${neg.proposal?.rfq?.company?.name || "Global Buyer"}`}
                    </p>
                  </div>
                  {!isBuyer && neg.status === 'pending' && (
                    <button 
                      onClick={() => {
                        setSelectedNeg(neg);
                        setShowRespondModal(true);
                      }}
                      style={primaryBtnStyle}
                    >
                      Review & Respond
                    </button>
                  )}
                  {isBuyer && neg.status === 'accepted' && (
                    <button 
                      onClick={() => navigate(`/my-pr/${neg.proposal?.rfq_id}`)}
                      style={secondaryBtnStyle}
                    >
                      Go to Award <ChevronRight size={14} style={{ marginLeft: 4 }} />
                    </button>
                  )}
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16, marginTop: 16, padding: "16px 0", borderTop: "1px solid var(--ui-border)" }}>
                  <div style={itemDetailStyle}>
                    <DollarSign size={14} /> Proposed: Rp {neg.items?.reduce((acc: number, item: any) => acc + (Number(item.negotiated_price) * item.negotiated_qty), 0).toLocaleString()}
                  </div>
                  <div style={itemDetailStyle}>
                    <Clock size={14} /> Lead Time: {neg.delivery_terms} Days
                  </div>
                  <div style={itemDetailStyle}>
                    <ShieldCheck size={14} /> Term: {neg.payment_scheme}
                  </div>
                </div>

                {(neg.buyer_remarks || neg.vendor_remarks) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                    {neg.buyer_remarks && (
                      <div style={{ flex: 1, minWidth: 200, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--ui-border)" }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "var(--ui-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Buyer's Note</div>
                        <div style={{ fontSize: 12, color: "var(--ui-text-secondary)" }}>"{neg.buyer_remarks}"</div>
                      </div>
                    )}
                    {neg.vendor_remarks && (
                      <div style={{ flex: 1, minWidth: 200, padding: 12, background: "rgba(34,197,94,0.02)", borderRadius: 12, border: "1px solid rgba(34,197,94,0.1)" }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#22c55e", textTransform: "uppercase", marginBottom: 4 }}>Vendor's Response</div>
                        <div style={{ fontSize: 12, color: "var(--ui-text-secondary)" }}>"{neg.vendor_remarks}"</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showRespondModal && selectedNeg && (
        <NegotiationResponseModal 
          negotiation={selectedNeg} 
          onClose={() => {
            setShowRespondModal(false);
            setSelectedNeg(null);
          }}
          onSuccess={() => {
            setShowRespondModal(false);
            setSelectedNeg(null);
            if (activeCompany) fetchNegotiations(activeCompany.id);
          }}
        />
      )}
    </Layout>
  );
}

// ── Shared Styles ──────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
  borderRadius: 20, padding: 24, transition: "all 0.2s ease",
  display: "flex", flexDirection: "column",
};

const itemDetailStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, color: "var(--ui-text-secondary)", fontSize: 12, fontWeight: 600
};

const emptyStateStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  padding: "80px 20px", background: "var(--ui-bg-card)", borderRadius: 24, border: "1px solid var(--ui-border)"
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "10px 20px", borderRadius: 12, background: "var(--huntr-gradient)",
  border: "none", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(249,115,22,0.2)"
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "10px 16px", borderRadius: 10, background: "var(--ui-bg-input)",
  border: "1px solid var(--ui-border)", color: "var(--ui-text-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer"
};
