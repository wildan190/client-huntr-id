import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { apiGet, apiPost } from "../lib/api";
import { aiRankProposals } from "../lib/api/ai";
import { useEventBusListener } from "../lib/EventBus";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../hooks/useMediaQuery";
import { 
  ArrowLeft, Calendar, Building2, Package, User, ClipboardList, MapPin, 
  Loader2, AlertCircle, ShieldCheck, ChevronRight, Award, Trophy, Info, CheckCircle2,
  MessageSquare, X, DollarSign, Clock, RefreshCw, AlertTriangle, Sparkles, Brain
} from "lucide-react";
import Swal from "sweetalert2";

// Negotiation Modal Component
function NegotiationModal({ proposal, onClose, onSuccess }: { proposal: any, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [paymentScheme, setPaymentScheme] = useState(proposal.payment_term || "");
  const [deliveryTerms, setDeliveryTerms] = useState(proposal.delivery_time || "");
  const [notes, setNotes] = useState("");
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  useEffect(() => {
    // Force items to be an array and try different keys
    const rawItems = proposal.items || proposal.proposal_items || [];
    
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      const mappedItems = rawItems.map((it: any) => {
        const rfqItem = it.rfq_item || it.rfqItem;
        const catalogue = rfqItem?.catalogue || it.catalogue;
        return {
          proposal_item_id: it.id,
          inventory_name: catalogue?.name || rfqItem?.catalogue?.name || it.name || "Item",
          original_price: it.price_offer || 0,
          negotiated_price: it.price_offer || 0,
          negotiated_qty: rfqItem?.qty || it.qty || 1,
          uom: catalogue?.uom || rfqItem?.catalogue?.uom || it.uom || "Pc"
        };
      });
      setItems(mappedItems);
    } else if (proposal.price_offer) {
      // Fallback for legacy proposals or when items are not loaded
      setItems([{
        proposal_item_id: "legacy",
        inventory_name: proposal.rfq?.title || "Total Proposal Offer",
        original_price: proposal.price_offer,
        negotiated_price: proposal.price_offer,
        negotiated_qty: 1,
        uom: "Package"
      }]);
    }
  }, [proposal]);

  const handleItemPriceChange = (proposalItemId: string, newPrice: string) => {
    setItems(prev => prev.map(it => it.proposal_item_id === proposalItemId ? { ...it, negotiated_price: Number(newPrice) } : it));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiPost("/api/orders/negotiate", {
        proposal_id: proposal.id,
        items: items,
        payment_scheme: paymentScheme,
        delivery_terms: deliveryTerms,
        buyer_remarks: notes
      });
      Swal.fire({
        icon: 'success',
        title: 'Negotiation Sent!',
        text: 'Negotiation request sent to vendor!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to send negotiation.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: isMobile ? 16 : 20 }}>
      <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: isMobile ? 24 : 32, width: "100%", maxWidth: isMobile ? "100%" : 600, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: isMobile ? "20px 24px" : "24px 32px", borderBottom: "1px solid var(--ui-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)" }}>Negotiation Request</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ui-text-muted)", fontWeight: 600 }}>Proposal by {proposal.company?.name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--ui-text-muted)", cursor: "pointer" }}><X size={24} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 20 : 32, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Items Negotiation */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 900, color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "block" }}>Proposed Unit Prices</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ padding: 16, background: "var(--ui-bg-input)", borderRadius: 16, border: "1px solid var(--ui-border-input)", display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-primary)" }}>{it.inventory_name}</div>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 600 }}>Qty: {it.negotiated_qty} {it.uom} · Original: Rp {Number(it.original_price).toLocaleString()}</div>
                  </div>
                  <div style={{ width: isMobile ? "100%" : 140 }}>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 800, color: "var(--ui-text-muted)" }}>Rp</span>
                      <input 
                        type="number"
                        value={it.negotiated_price}
                        onChange={(e) => handleItemPriceChange(it.proposal_item_id, e.target.value)}
                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "8px 12px 8px 32px", fontSize: 14, fontWeight: 800, color: "#f97316", outline: "none" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 900, color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>Payment Scheme</label>
              <select 
                value={paymentScheme}
                onChange={e => setPaymentScheme(e.target.value)}
                style={{ width: "100%", background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)", borderRadius: 12, padding: 12, fontSize: 14, color: "var(--ui-text-primary)", fontWeight: 700, appearance: "auto" }}
              >
                <option value="7 days">Net 7 Days</option>
                <option value="14 days">Net 14 Days</option>
                <option value="30 days">Net 30 Days</option>
                <option value="60 days">Net 60 Days</option>
                <option value="COD">Cash on Delivery (COD)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 900, color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>Delivery Info</label>
              <select 
                value={deliveryTerms}
                onChange={e => setDeliveryTerms(e.target.value)}
                style={{ width: "100%", background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)", borderRadius: 12, padding: 12, fontSize: 14, color: "var(--ui-text-primary)", fontWeight: 700, appearance: "auto" }}
              >
                <option value="3">3 Days (Express)</option>
                <option value="7">7 Days (Standard)</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 900, color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>Negotiation Notes</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Tell vendor why you are negotiating..."
              style={{ width: "100%", background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)", borderRadius: 12, padding: 16, fontSize: 14, color: "var(--ui-text-primary)", minHeight: 100, outline: "none", resize: "none" }}
            />
          </div>
        </div>

        <div style={{ padding: isMobile ? 20 : 32, borderTop: "1px solid var(--ui-border)", display: "flex", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
          <button onClick={onClose} style={{ flex: 1, padding: 16, borderRadius: 16, border: "1px solid var(--ui-border-input)", background: "none", fontSize: 14, fontWeight: 700, color: "var(--ui-text-secondary)", cursor: "pointer" }}>Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            style={{ flex: 2, padding: 16, borderRadius: 16, background: "var(--huntr-gradient)", border: "none", color: "#fff", fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: "0 10px 20px rgba(249,115,22,0.2)", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? <Loader2 className="animate-spin" style={{ margin: "0 auto" }} /> : "Submit Negotiation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RfqDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const [rfq, setRfq] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [awardingProposal, setAwardingProposal] = useState<string | number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Double submit prevention
  const isProcessing = useRef(false);

  const isBuyer = activeCompany?.type === 'buyer';
  const isVendor = activeCompany?.type === 'vendor';

  // Negotiation State
  const [showNegModal, setShowNegModal] = useState(false);
  const [selectedNegProposal, setSelectedNegProposal] = useState<any>(null);

  // AI Ranking State
  const [aiRankings, setAiRankings] = useState<any>(null);
  const [aiRankLoading, setAiRankLoading] = useState(false);
  const [aiRankError, setAiRankError] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const handleAiRank = async () => {
    if (!rfq?.id) return;
    setAiRankLoading(true);
    setAiRankError(null);
    setShowAiPanel(true);
    try {
      const res = await aiRankProposals(rfq.id);
      if (res.success) {
        setAiRankings(res.data);
      } else {
        setAiRankError(res.error || 'AI ranking tidak tersedia.');
      }
    } catch {
      setAiRankError('Gagal menghubungi AI. Periksa koneksi Anda.');
    } finally {
      setAiRankLoading(false);
    }
  };

  useEffect(() => {
    const companySession = localStorage.getItem("active_company");
    if (companySession) {
      setActiveCompany(JSON.parse(companySession));
    }

    if (!id || id === "NaN" || id === "undefined") {
      setError("Invalid RFQ ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    apiGet(`/api/rfqs/${id}`)
      .then((response) => {
        const data = response?.rfq ?? response?.data ?? response;
        setRfq(data);
        setError(null);
        if (data?.id) {
          fetchRankings(data.id);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load RFQ detail. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fetchRankings = async (rfqId: string | number) => {
    try {
      const data = await apiGet(`/api/rfqs/${rfqId}/rankings`);
      setRankings(Array.isArray(data) ? data : data.rankings || []);
    } catch (err) {
      console.error("Failed to load RFQ rankings", err);
      setRankings([]);
    }
  };

  const handleAwardWinner = async (proposalId: string | number, rfqId: string | number) => {
    // Prevent double submit
    if (isProcessing.current) {
      console.warn("Request already in progress");
      return;
    }

    const userSession = localStorage.getItem("user_session");
    const user = userSession ? JSON.parse(userSession) : null;
    
    isProcessing.current = true;
    setAwardingProposal(proposalId);
    setError(null);
    try {
      const response = await apiPost(`/api/proposals/${proposalId}/award`, {
        rfq_id: rfqId,
        user_id: user?.id,
      });
      
      setSuccessMessage("✓ Proposal awarded! Sent to manager for approval.");
      
      if (id) {
        // Refresh RFQ data completely
        const rfqResponse = await apiGet(`/api/rfqs/${id}`);
        const newRfqData = rfqResponse?.rfq ?? rfqResponse?.data ?? rfqResponse;
        setRfq(newRfqData);
        // Refresh rankings
        fetchRankings(id);
      }
      
      setTimeout(() => {
        setSuccessMessage(null);
        setAwardingProposal(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to award proposal");
      setAwardingProposal(null);
    } finally {
      // Reset processing state
      setTimeout(() => {
        isProcessing.current = false;
      }, 500);
    }
  };

  // EventBus listener for negotiation responses
  useEventBusListener(['negotiation.responded'], (event) => {
    if (id) {
      // Refresh RFQ and rankings when negotiation is responded to
      apiGet(`/api/rfqs/${id}`).then((response) => {
        const data = response?.rfq ?? response?.data ?? response;
        setRfq(data);
        fetchRankings(id);
      });
    }
  });

  const totalItems = rfq?.items?.reduce((sum: number, item: any) => {
    return sum + (item.qty || 0);
  }, 0);

  const getTenderSummary = (): string => {
    const duration = rfq?.duration_days ?? 7;
    if (rfq?.status === 'active' && rfq.approved_at) {
      const endsAt = new Date(rfq.approved_at);
      endsAt.setDate(endsAt.getDate() + duration);
      const now = new Date();
      const diffMs = endsAt.getTime() - now.getTime();
      if (diffMs <= 0) {
        return 'Closed';
      }
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
    }

    if (rfq?.status === 'draft' || rfq?.status === 'pending_approval') {
      return `Tender length ${duration} days after approval`;
    }

    return `${duration} day${duration > 1 ? 's' : ''}`;
  };

  // Helper function to check if tender is expired
  const isTenderExpired = (): boolean => {
    if (!rfq || rfq.status !== 'active' || !rfq.approved_at) {
      return false; // If not active or no approval date, not expired yet
    }

    const duration = rfq?.duration_days ?? 7;
    const endsAt = new Date(rfq.approved_at);
    endsAt.setDate(endsAt.getDate() + duration);
    const now = new Date();
    
    return now.getTime() > endsAt.getTime();
  };

  // Helper function to check if proposals can be submitted
  const canSubmitProposal = (): boolean => {
    if (!rfq) return false;
    
    // Check if RFQ is active and approved
    if (rfq.status !== 'active' || !rfq.approved_at) {
      return false;
    }
    
    // Check if tender hasn't expired
    if (isTenderExpired()) {
      return false;
    }
    
    // Check if user is a vendor
    if (!isVendor) {
      return false;
    }
    
    return true;
  };

  return (
    <Layout title="RFQ Detail" subtitle="View technical specifications and company profile before submitting your proposal.">
      <div style={{ width: "100%", paddingBottom: 60, padding: isMobile ? "0 16px 80px" : "0 0 60px" }}>
        
        {/* Navigation & Status Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: isMobile ? "flex-start" : "center", 
          marginBottom: 24,
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
                  fontWeight: 800, 
                  background: isTenderExpired() ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", 
                  color: isTenderExpired() ? "#ef4444" : "#22c55e", 
                  border: `1px solid ${isTenderExpired() ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}` 
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: isTenderExpired() ? "#ef4444" : "#22c55e" }} />
                  {isTenderExpired() ? "CLOSED" : "ACTIVE"}
                </div>
                <div style={{ padding: "6px 12px", borderRadius: 8, fontSize: isMobile ? 11 : 12, fontWeight: 800, background: "var(--ui-bg-card)", color: "var(--ui-text-primary)", border: "1px solid var(--ui-border)" }}>
                  PR #{rfq.id ? String(rfq.id).substring(0, 8).toUpperCase() : ""}
                </div>
             </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
            <Loader2 className="animate-spin" size={40} color="#f59e0b" />
          </div>
        ) : error ? (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, padding: 24, color: "#ef4444", display: "flex", gap: 12, alignItems: "center" }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
        ) : rfq ? (
          <div 
            className="huntr-grid-2col"
            style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", 
              gap: 24, 
              alignItems: "start" 
            }}
          >
            
            {/* Main Content Area (Left) */}
            <div style={{ display: "grid", gap: 24 }}>
              
              {/* RFQ Header & Description */}
              <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 24, padding: isMobile ? 20 : 32, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "4px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1 }}>Purchase Requisition</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-muted)" }}>#{rfq.id ? String(rfq.id).substring(0, 8).toUpperCase() : ""}</span>
                  </div>
                  <h1 style={{ margin: 0, fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "var(--ui-text-primary)", lineHeight: 1.2 }}>{rfq.title}</h1>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, padding: isMobile ? 16 : 24, background: "var(--ui-bg-input)", borderRadius: 20, border: "1px solid var(--ui-border-input)" }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Requested By</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                        <User size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 15 }}>{rfq.user?.name || "Unknown User"}</div>
                        <div style={{ fontSize: 12, color: "var(--ui-text-muted)" }}>Procurement Officer</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Target Company</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 15 }}>{rfq.company?.name || "Unknown Company"}</div>
                        <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700 }}>VERIFIED ENTERPRISE</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <ClipboardList size={18} color="#f59e0b" />
                    <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Project Requirements</div>
                  </div>
                  <div style={{ color: "var(--ui-text-secondary)", fontSize: 16, lineHeight: 1.8 }}>
                    {rfq.description || "No detailed description provided for this request."}
                  </div>

                  {successMessage && (
                    <div style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      borderRadius: 16,
                      padding: 16,
                      color: "#10b981",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginTop: 24,
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={20} />
                      {successMessage}
                    </div>
                  )}

                  {rankings.length > 0 && (() => {
                    const topRankData = rankings.find(r => r.rank === 1);
                    const isRfqAlreadyAwarded = rankings.some(r => r.is_winner || r.proposal.winner_status === 'awarded' || r.proposal.winner_status === 'approved');

                    return (
                      <div style={{ marginTop: 32, background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 24, padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <ShieldCheck size={18} color="#f97316" />
                            <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Participant Rankings & Evaluation</div>
                          </div>
                          {/* AI Analyse Button */}
                          {isBuyer && (
                            <button
                              onClick={handleAiRank}
                              disabled={aiRankLoading}
                              style={{
                                padding: "8px 16px", borderRadius: 12,
                                background: showAiPanel
                                  ? "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.1))"
                                  : "linear-gradient(135deg, #a855f7, #6366f1)",
                                border: showAiPanel ? "1px solid rgba(168,85,247,0.3)" : "none",
                                color: showAiPanel ? "#a855f7" : "#fff",
                                fontSize: 12, fontWeight: 800, cursor: aiRankLoading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", gap: 6,
                                boxShadow: showAiPanel ? "none" : "0 4px 14px rgba(168,85,247,0.35)",
                                transition: "all 0.2s ease",
                                opacity: aiRankLoading ? 0.7 : 1,
                              }}
                            >
                              {aiRankLoading
                                ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> AI Menganalisis...</>
                                : <><Sparkles size={13} /> {showAiPanel ? "Refresh AI Analisis" : "🤖 Analisis AI"}</>
                              }
                            </button>
                          )}
                        </div>

                        {/* Metodologi Penilaian (Evaluation Criteria Info) */}
                        <div style={{
                          background: "var(--ui-bg-input)",
                          border: "1px solid var(--ui-border-input)",
                          borderRadius: 16,
                          padding: 16,
                          marginBottom: 20,
                          fontSize: 12,
                          color: "var(--ui-text-secondary)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 13 }}>
                            <Info size={14} color="#f97316" />
                            System Evaluation Criteria
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 4 }}>
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--ui-text-primary)" }}>1. Harga (Prioritas Utama)</div>
                              <div style={{ color: "var(--ui-text-muted)", marginTop: 2, fontSize: 11 }}>Mengutamakan total penawaran harga terendah dari seluruh vendor.</div>
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--ui-text-primary)" }}>2. Waktu Pengiriman (Lead Time)</div>
                              <div style={{ color: "var(--ui-text-muted)", marginTop: 2, fontSize: 11 }}>Jika harga sama, mengutamakan durasi pengiriman paling cepat (hari).</div>
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--ui-text-primary)" }}>3. Garansi Layanan</div>
                              <div style={{ color: "var(--ui-text-muted)", marginTop: 2, fontSize: 11 }}>Jika harga & lead time sama, mengutamakan masa garansi terpanjang (bulan).</div>
                            </div>
                          </div>
                        </div>

                        {/* System Winner Recommendation */}
                        {topRankData && (
                          <div style={{
                            background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)",
                            border: "1px solid rgba(249, 115, 22, 0.25)",
                            borderRadius: 20,
                            padding: 20,
                            marginBottom: 24,
                            display: "flex",
                            flexDirection: "column",
                            gap: 12
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                              <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                                <Trophy size={20} color="#f97316" style={{ marginTop: 2 }} />
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: 11, color: "#f97316", textTransform: "uppercase", letterSpacing: 0.5 }}>System Recommendation (Selected Winner)</div>
                                  <div style={{ fontWeight: 800, fontSize: 16, color: "var(--ui-text-primary)", marginTop: 4 }}>
                                    {topRankData.proposal.company?.name || "Unknown Vendor"}
                                  </div>
                                </div>
                              </div>
                              {isBuyer && !isRfqAlreadyAwarded && (
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    onClick={() => {
                                      setSelectedNegProposal(topRankData.proposal);
                                      setShowNegModal(true);
                                    }}
                                    style={{
                                      background: "rgba(249,115,22,0.1)",
                                      border: "1px solid rgba(249,115,22,0.2)",
                                      borderRadius: 10,
                                      padding: "8px 16px",
                                      color: "#f97316",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <MessageSquare size={12} /> Negotiate
                                  </button>
                                  <button
                                    onClick={() => handleAwardWinner(topRankData.proposal.id, rfq.id)}
                                    disabled={awardingProposal === topRankData.proposal.id || isProcessing.current}
                                    style={{
                                      background: (awardingProposal === topRankData.proposal.id || isProcessing.current) ? "#9ca3af" : "var(--huntr-orange)",
                                      border: "none",
                                      borderRadius: 10,
                                      padding: "8px 16px",
                                      color: "#fff",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      cursor: (awardingProposal === topRankData.proposal.id || isProcessing.current) ? "not-allowed" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      boxShadow: (awardingProposal === topRankData.proposal.id || isProcessing.current) ? "none" : "0 4px 12px rgba(249,115,22,0.2)",
                                      transition: "all 0.2s ease"
                                    }}
                                  >
                                    {awardingProposal === topRankData.proposal.id ? <Loader2 size={12} className="animate-spin" /> : <Award size={12} />} Award Proposal Ini
                                  </button>
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--ui-text-secondary)", lineHeight: 1.5, borderTop: "1px solid rgba(249, 115, 22, 0.1)", paddingTop: 10 }}>
                              <strong>Alasan Rekomendasi:</strong> Vendor ini menawarkan kombinasi parameter paling optimal dengan harga terendah sebesar <strong>Rp {Number(topRankData.proposal.price_offer).toLocaleString('id-ID')}</strong>, pengiriman dalam waktu <strong>{topRankData.proposal.delivery_days} hari</strong>, dan jaminan garansi <strong>{topRankData.proposal.warranty_months} bulan</strong>.
                            </div>
                          </div>
                        )}

                        {/* List Detail Perbandingan Ranking */}
                        <div style={{ display: "grid", gap: 16 }}>
                          {rankings.map((rankData: any, idx: number) => {
                            const isWinnerOrAwarded = rankData.is_winner || rankData.proposal.winner_status === 'awarded' || rankData.proposal.winner_status === 'approved';

                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 12,
                                  padding: "20px 24px",
                                  background: idx === 0 ? "rgba(249,115,22,0.04)" : "var(--ui-bg-card)",
                                  border: idx === 0 ? "1px solid rgba(249,115,22,0.2)" : "1px solid var(--ui-border)",
                                  borderRadius: 20,
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 8,
                                      background: idx === 0 ? "var(--huntr-orange)" : "var(--ui-bg-input)",
                                      color: idx === 0 ? "#fff" : "var(--ui-text-muted)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: 900,
                                      fontSize: 14
                                    }}>
                                      #{rankData.rank}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 15 }}>
                                        {rankData.proposal.company?.name || "Unknown Vendor"}
                                      </div>
                                      <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 2 }}>
                                        Tanggal Kirim: {new Date(rankData.proposal.created_at).toLocaleDateString('id-ID')}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    {isBuyer && !isRfqAlreadyAwarded && (
                                      <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                          onClick={() => {
                                            setSelectedNegProposal(rankData.proposal);
                                            setShowNegModal(true);
                                          }}
                                          style={{
                                            background: "rgba(249,115,22,0.1)",
                                            border: "1px solid rgba(249,115,22,0.2)",
                                            borderRadius: 10,
                                            padding: "6px 12px",
                                            color: "#f97316",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                          }}
                                        >
                                          <MessageSquare size={12} /> Negotiate
                                        </button>
                                        <button
                                          onClick={() => handleAwardWinner(rankData.proposal.id, rfq.id)}
                                          disabled={awardingProposal === rankData.proposal.id || isProcessing.current}
                                          style={{
                                            background: (awardingProposal === rankData.proposal.id || isProcessing.current) ? "#9ca3af" : (idx === 0 ? "var(--huntr-orange)" : "var(--ui-bg-input)"),
                                            border: (awardingProposal === rankData.proposal.id || isProcessing.current) ? "none" : (idx === 0 ? "none" : "1px solid var(--ui-border)"),
                                            borderRadius: 10,
                                            padding: "6px 12px",
                                            color: "#fff",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: (awardingProposal === rankData.proposal.id || isProcessing.current) ? "not-allowed" : "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            transition: "all 0.2s ease"
                                          }}
                                        >
                                          {awardingProposal === rankData.proposal.id ? <Loader2 size={12} className="animate-spin" /> : <Award size={12} />} Award
                                        </button>
                                      </div>
                                    )}

                                    {isWinnerOrAwarded ? (
                                      <div style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "6px 12px",
                                        borderRadius: 10,
                                        background: "rgba(34,197,94,0.1)",
                                        color: "#22c55e",
                                        fontSize: 11,
                                        fontWeight: 800,
                                      }}>
                                        <CheckCircle2 size={12} /> PEMENANG (AWARDED)
                                      </div>
                                    ) : rankData.proposal.winner_status === 'rejected' ? (
                                      <div style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: "6px 12px",
                                        borderRadius: 10,
                                        background: "rgba(239,68,68,0.06)",
                                        color: "#ef4444",
                                        fontSize: 11,
                                        fontWeight: 800,
                                      }}>
                                        DIELIMINASI
                                      </div>
                                    ) : (
                                      <div style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: "6px 12px",
                                        borderRadius: 10,
                                        background: "var(--ui-bg-input)",
                                        color: "var(--ui-text-secondary)",
                                        fontSize: 11,
                                        fontWeight: 800,
                                      }}>
                                        PESERTA
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Vendor Stats */}
                                {rankData.vendor_stats && (
                                  <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                                    gap: 12,
                                    background: "rgba(59, 130, 246, 0.05)",
                                    padding: 12,
                                    borderRadius: 12,
                                    border: "1px solid rgba(59, 130, 246, 0.1)"
                                  }}>
                                    <div>
                                      <span style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", display: "block" }}>TOTAL TENDER</span>
                                      <strong style={{ fontSize: 14, color: "var(--ui-text-primary)" }}>{rankData.vendor_stats.total_tenders}</strong>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", display: "block" }}>TOTAL MENANG</span>
                                      <strong style={{ fontSize: 14, color: "var(--ui-text-primary)" }}>{rankData.vendor_stats.total_wins}</strong>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", display: "block" }}>PERSENTASE KEMENANGAN</span>
                                      <strong style={{ fontSize: 14, color: "var(--ui-text-primary)" }}>{rankData.vendor_stats.win_rate}%</strong>
                                    </div>
                                  </div>
                                )}

                                {/* Kriteria Evaluasi Detail */}
                                <div style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                                  gap: 12,
                                  background: "var(--ui-bg-input)",
                                  padding: 12,
                                  borderRadius: 12,
                                  border: "1px solid var(--ui-border-subtle)",
                                  marginTop: 4
                                }}>
                                  <div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", display: "block" }}>HARGA PENAWARAN</span>
                                    <strong style={{ fontSize: 14, color: "var(--ui-text-primary)" }}>
                                      Rp {Number(rankData.proposal.price_offer).toLocaleString('id-ID')}
                                    </strong>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", display: "block" }}>WAKTU PENGIRIMAN</span>
                                    <strong style={{ fontSize: 14, color: "var(--ui-text-primary)" }}>
                                      {rankData.proposal.delivery_days} Hari
                                    </strong>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", display: "block" }}>GARANSI</span>
                                    <strong style={{ fontSize: 14, color: "var(--ui-text-primary)" }}>
                                      {rankData.proposal.warranty_months} Bulan
                                    </strong>
                                  </div>
                                </div>

                                <div style={{ fontSize: 12, color: "var(--ui-text-muted)", lineHeight: 1.4, display: "flex", gap: 6, alignItems: "start" }}>
                                  <Info size={14} color="var(--ui-text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
                                  <span><strong>Alasan Peringkat:</strong> {rankData.detailed_reason?.summary || "Tidak ada alasan yang tersedia"}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* ── AI Assessment Panel ── */}
                        {showAiPanel && (
                          <div style={{
                            marginTop: 24,
                            background: "linear-gradient(135deg, rgba(168,85,247,0.07), rgba(99,102,241,0.04))",
                            border: "1px solid rgba(168,85,247,0.25)",
                            borderRadius: 20,
                            padding: 24,
                            animation: "fadeSlideIn 0.4s ease",
                          }}>
                            {/* Panel Header */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: "linear-gradient(135deg, #a855f7, #6366f1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(168,85,247,0.35)",
                              }}>
                                <Sparkles size={18} color="#fff" />
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: "var(--ui-text-primary)" }}>Huntr AI Assessment</div>
                                <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 600 }}>Analisis multikriteria: harga 40% · delivery 30% · garansi 20% · kelengkapan 10%</div>
                              </div>
                            </div>

                            {aiRankLoading ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0", color: "var(--ui-text-muted)" }}>
                                <Loader2 size={18} style={{ animation: "spin 1s linear infinite", color: "#a855f7" }} />
                                <span style={{ fontSize: 13, fontWeight: 600 }}>Huntr AI sedang mengevaluasi semua proposal...</span>
                              </div>
                            ) : aiRankError ? (
                              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: 16, color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
                                {aiRankError}
                              </div>
                            ) : aiRankings ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {/* Overall analysis */}
                                {aiRankings.overall_analysis && (
                                  <div style={{ fontSize: 13, color: "var(--ui-text-secondary)", lineHeight: 1.7, padding: "12px 16px", background: "rgba(168,85,247,0.06)", borderRadius: 12, borderLeft: "3px solid #a855f7" }}>
                                    {aiRankings.overall_analysis}
                                  </div>
                                )}
                                {/* Per-proposal AI scores */}
                                {(aiRankings.rankings || []).map((rank: any, idx: number) => {
                                  const isAiWinner = rank.proposal_id === aiRankings.recommended_winner_id;
                                  return (
                                    <div key={rank.proposal_id || idx} style={{
                                      padding: "16px 20px",
                                      background: isAiWinner ? "rgba(168,85,247,0.06)" : "var(--ui-bg-input)",
                                      border: isAiWinner ? "1px solid rgba(168,85,247,0.3)" : "1px solid var(--ui-border-input)",
                                      borderRadius: 16,
                                      display: "flex", flexDirection: "column", gap: 10,
                                    }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                          <div style={{
                                            width: 28, height: 28, borderRadius: 8,
                                            background: isAiWinner ? "linear-gradient(135deg, #a855f7, #6366f1)" : "var(--ui-bg-card)",
                                            color: isAiWinner ? "#fff" : "var(--ui-text-muted)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontWeight: 900, fontSize: 13,
                                          }}>#{rank.rank}</div>
                                          <div>
                                            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ui-text-primary)" }}>
                                              {rank.proposal?.company?.name || "Unknown Vendor"}
                                            </div>
                                            {isAiWinner && (
                                              <div style={{ fontSize: 10, fontWeight: 900, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.06em" }}>✦ AI Recommendation</div>
                                            )}
                                          </div>
                                        </div>
                                        {/* Total score */}
                                        <div style={{
                                          padding: "4px 12px", borderRadius: 20,
                                          background: isAiWinner ? "rgba(168,85,247,0.15)" : "var(--ui-bg-card)",
                                          border: isAiWinner ? "1px solid rgba(168,85,247,0.3)" : "1px solid var(--ui-border)",
                                          fontSize: 14, fontWeight: 900,
                                          color: isAiWinner ? "#a855f7" : "var(--ui-text-secondary)",
                                        }}>
                                          {rank.total_score ? `${rank.total_score.toFixed(1)} pts` : "—"}
                                        </div>
                                      </div>
                                      {/* Score breakdown bars */}
                                      {rank.score_breakdown && (
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
                                          {([
                                            { key: "price_score", label: "Harga", weight: "40%" },
                                            { key: "delivery_score", label: "Delivery", weight: "30%" },
                                            { key: "warranty_score", label: "Garansi", weight: "20%" },
                                            { key: "completeness_score", label: "Kelengkapan", weight: "10%" },
                                          ] as const).map(({ key, label, weight }) => (
                                            <div key={key}>
                                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)" }}>{label} <span style={{ opacity: 0.6 }}>({weight})</span></span>
                                                <span style={{ fontSize: 10, fontWeight: 900, color: isAiWinner ? "#a855f7" : "var(--ui-text-secondary)" }}>{rank.score_breakdown[key] ?? "—"}</span>
                                              </div>
                                              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${rank.score_breakdown[key] || 0}%`, background: isAiWinner ? "linear-gradient(90deg, #a855f7, #6366f1)" : "rgba(255,255,255,0.15)", borderRadius: 2 }} />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {/* Recommendation text */}
                                      {rank.recommendation && (
                                        <div style={{ fontSize: 12, color: "var(--ui-text-muted)", lineHeight: 1.6 }}>
                                          <strong style={{ color: "var(--ui-text-secondary)" }}>AI:</strong> {rank.recommendation}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        )}

                      </div>
                    );
                  })()}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--ui-border)" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ui-text-muted)", fontSize: 14 }}>
                     <Calendar size={16} /> Published {new Date(rfq.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ui-text-muted)", fontSize: 14 }}>
                     <MapPin size={16} /> {rfq.delivery_point || rfq.company?.address || "Delivery location not specified"}
                   </div>
                </div>
              </div>

              {/* Items Table Section */}
              <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--ui-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.01)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Package size={18} color="#f97316" />
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)" }}>Technical Specifications</h2>
                  </div>
                  <span style={{ fontSize: 12, background: "var(--ui-bg-input)", padding: "4px 10px", borderRadius: 6, color: "var(--ui-text-muted)", fontWeight: 700 }}>
                    {rfq.items?.length || 0} ITEMS
                  </span>
                </div>
                
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--ui-border)", background: "rgba(0,0,0,0.02)" }}>
                        <th style={{ padding: "14px 24px", textAlign: "left", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Product & Catalog Details</th>
                        <th style={{ padding: "14px 24px", textAlign: "center", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Quantity</th>
                        <th style={{ padding: "14px 24px", textAlign: "right", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Required Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rfq.items || []).map((item: any, idx: number) => (
                        <tr key={item.id} style={{ borderBottom: idx === (rfq.items.length - 1) ? "none" : "1px solid var(--ui-border)", transition: "background 0.2s" }}>
                          <td style={{ padding: "20px 24px" }}>
                            <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 15 }}>{item.catalogue?.name}</div>
                            <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>Code: <span style={{ fontFamily: "monospace", color: "#f59e0b" }}>{item.catalogue?.item_code}</span></div>
                          </td>
                          <td style={{ padding: "20px 24px", textAlign: "center" }}>
                            <span style={{ display: "inline-block", padding: "6px 16px", background: "var(--ui-bg-input)", borderRadius: 10, fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 15 }}>
                              {item.qty} <span style={{ fontWeight: 500, color: "var(--ui-text-muted)", fontSize: 12, marginLeft: 2 }}>Units</span>
                            </span>
                          </td>
                          <td style={{ padding: "20px 24px", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, color: "var(--ui-text-secondary)", fontSize: 14, fontWeight: 600 }}>
                              <Calendar size={14} style={{ opacity: 0.6 }} />
                              {item.expected_date}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Sticky (Right) */}
            <div 
              className={isMobile ? "huntr-split-layout-aside--mobile-hidden" : ""}
              style={{ 
                position: isMobile ? "static" : "sticky", 
                top: 24, 
                display: "grid", 
                gap: 24 
              }}
            >
              
              {/* Action Card */}
              <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 24, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 13, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Tender Summary</h3>
                
                <div style={{ display: "grid", gap: 16 }}>
                  <SummaryRow label="Total Quantity" value={`${totalItems} Units`} />
                  <SummaryRow label="Tender Duration" value={`${rfq.duration_days ?? 7} day${(rfq.duration_days ?? 7) > 1 ? 's' : ''}`} />
                  <SummaryRow label="Time Remaining" value={getTenderSummary()} />
                </div>

                {canSubmitProposal() && (
                  <button
                    onClick={() => navigate("/proposals", { state: { rfqId: rfq.id } })}
                    style={{
                      width: "100%",
                      marginTop: 28,
                      padding: "16px",
                      borderRadius: 14,
                      background: "linear-gradient(135deg,#f97316,#f59e0b)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 15,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 8px 24px rgba(249,115,22,0.3)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    Submit Proposal <ArrowLeft size={18} style={{ transform: "rotate(180deg)" }} />
                  </button>
                )}

                {/* Tender Expired Message for Vendors */}
                {isVendor && rfq && isTenderExpired() && (
                  <div style={{
                    width: "100%",
                    marginTop: 28,
                    padding: "16px",
                    borderRadius: 14,
                    background: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: 14,
                    border: "1px solid rgba(239,68,68,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    textAlign: "center",
                  }}>
                    <AlertTriangle size={18} />
                    Tender Period Ended
                  </div>
                )}

                {/* Not Vendor Message */}
                {!isVendor && rfq && rfq.status === 'active' && !isTenderExpired() && (
                  <div style={{
                    width: "100%",
                    marginTop: 28,
                    padding: "16px",
                    borderRadius: 14,
                    background: "rgba(156,163,175,0.1)",
                    color: "var(--ui-text-muted)",
                    fontWeight: 600,
                    fontSize: 14,
                    border: "1px solid rgba(156,163,175,0.2)",
                    textAlign: "center",
                  }}>
                    Only vendors can submit proposals
                  </div>
                )}
              </div>

              {/* Delivery Point */}
              <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={14} /> Delivery Point
                </div>
                <div style={{ fontSize: 13, color: "var(--ui-text-primary)", lineHeight: 1.6 }}>
                  {rfq.delivery_point || rfq.company?.address || "Not specified"}
                </div>
              </div>

              {/* Security Box */}
              <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 20, padding: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
                  <ShieldCheck size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ui-text-secondary)", lineHeight: 1.6 }}>
                    Your proposal is protected by Huntr's enterprise security. Only the target buyer can access your commercial data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: "var(--ui-text-primary)", background: "var(--ui-bg-card)", padding: 60, borderRadius: 24, textAlign: "center", border: "1px solid var(--ui-border)" }}>
            <AlertCircle size={40} color="var(--ui-text-muted)" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 800 }}>PR Record Not Found</div>
            <div style={{ color: "var(--ui-text-muted)", fontSize: 14, marginTop: 4 }}>This request may have been closed or the ID is invalid.</div>
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button for Vendors */}
      {isMobile && canSubmitProposal() && rfq && (
        <button
          onClick={() => navigate("/proposals", { state: { rfqId: rfq.id } })}
          style={{
            position: "fixed",
            bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
            right: 20,
            zIndex: 90,
            padding: "16px 24px",
            borderRadius: 16,
            background: "linear-gradient(135deg,#f97316,#f59e0b)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(249,115,22,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          Submit Proposal <ArrowLeft size={18} style={{ transform: "rotate(180deg)" }} />
        </button>
      )}

      {/* Mobile Tender Expired Message */}
      {isMobile && isVendor && rfq && isTenderExpired() && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
            left: 20,
            right: 20,
            zIndex: 90,
            padding: "16px 20px",
            borderRadius: 16,
            background: "rgba(239,68,68,0.1)",
            color: "#ef4444",
            fontWeight: 700,
            fontSize: 14,
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={18} />
          Tender Period Ended - No More Proposals Accepted
        </div>
      )}

      {showNegModal && selectedNegProposal && (
        <NegotiationModal 
          proposal={selectedNegProposal} 
          onClose={() => {
            setShowNegModal(false);
            setSelectedNegProposal(null);
          }}
          onSuccess={() => {
            setShowNegModal(false);
            setSelectedNegProposal(null);
            if (id) {
              // Refresh RFQ data and rankings after negotiation
              apiGet(`/api/rfqs/${id}`).then((response) => {
                const data = response?.rfq ?? response?.data ?? response;
                setRfq(data);
                fetchRankings(id);
              });
            }
          }}
        />
      )}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}

function SummaryRow({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
      <span style={{ color: "var(--ui-text-secondary)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 800, color: "var(--ui-text-primary)" }}>{value}</span>
    </div>
  );
}
