import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { getRfq, apiGet, apiPost } from "../lib/api";
import { 
  ArrowLeft, Calendar, CheckCircle2, Clock, Package, User, ClipboardList, MapPin, 
  Loader2, Trophy, Building2, ShieldCheck, ChevronRight, Award, Info, MessageSquare, 
  X, DollarSign, AlertCircle, RefreshCw, BarChart3, AlertTriangle, Briefcase
} from "lucide-react";
import Swal from "sweetalert2";

// Negotiation Modal Component (Reused)
function NegotiationModal({ proposal, onClose, onSuccess }: { proposal: any, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [paymentScheme, setPaymentScheme] = useState(proposal.payment_term || "");
  const [deliveryTerms, setDeliveryTerms] = useState(proposal.delivery_time || "");
  const [notes, setNotes] = useState("");

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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20 }}>
      <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 32, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--ui-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)" }}>Negotiation Request</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ui-text-muted)", fontWeight: 600 }}>Proposal by {proposal.company?.name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--ui-text-muted)", cursor: "pointer" }}><X size={24} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 900, color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "block" }}>Proposed Unit Prices</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px dashed var(--ui-border)", color: "var(--ui-text-muted)", fontSize: 13 }}>
                  No items found in this proposal.
                </div>
              ) : items.map((it, idx) => (
                <div key={idx} style={{ padding: 16, background: "var(--ui-bg-input)", borderRadius: 16, border: "1px solid var(--ui-border-input)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-primary)" }}>{it.inventory_name}</div>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 600 }}>Qty: {it.negotiated_qty} {it.uom} · Original: Rp {Number(it.original_price).toLocaleString()}</div>
                  </div>
                  <div style={{ width: 140 }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
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

        <div style={{ padding: 32, borderTop: "1px solid var(--ui-border)", display: "flex", gap: 16 }}>
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

function getStatusStyle(status: string) {
  switch (status) {
    case "pending_approval": return { bg: "rgba(249,115,22,0.1)", color: "#f97316", label: "Pending Approval", icon: Clock };
    case "approved": return { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Approved", icon: CheckCircle2 };
    case "active": return { bg: "rgba(249,115,22,0.1)", color: "#fb923c", label: "Open Tender", icon: Package };
    case "rejected": return { bg: "rgba(239,68,68,0.1)", color: "#f87171", label: "Rejected", icon: Clock };
    default: return { bg: "rgba(107,114,128,0.1)", color: "#9ca3af", label: status, icon: Clock };
  }
}

export default function MyPurchaseRequisitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);

  // Negotiation & Awarding State
  const [showNegModal, setShowNegModal] = useState(false);
  const [selectedNegProposal, setSelectedNegProposal] = useState<any>(null);
  const [awardingProposal, setAwardingProposal] = useState<string | number | null>(null);

  useEffect(() => {
    const activeComp = localStorage.getItem("active_company");
    if (activeComp) setActiveCompany(JSON.parse(activeComp));

    if (!id || id === "NaN" || id === "undefined") {
      setError("Invalid Purchase Requisition ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    getRfq(id)
      .then((response) => {
        const rfq = response?.rfq ?? response?.data ?? response;
        setRequest(rfq);
        setError(null);
        if (rfq?.id) {
          fetchRankings(rfq.id);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load PR detail. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fetchRankings = async (rfqId: string | number) => {
    try {
      const response = await apiGet(`/api/rfqs/${rfqId}/rankings`);
      setRankings(response.rankings || (Array.isArray(response) ? response : []));
    } catch (err) {
      console.error("Failed to load rankings", err);
      setRankings([]);
    }
  };

  const handleAwardWinner = async (proposalId: string | number, rfqId: string | number) => {
    const userSession = localStorage.getItem("user_session");
    const user = userSession ? JSON.parse(userSession) : null;
    
    setAwardingProposal(proposalId);
    try {
      await apiPost(`/api/proposals/${proposalId}/award`, {
        rfq_id: rfqId,
        user_id: user?.id,
      });
      Swal.fire({
        icon: 'success',
        title: 'Winner Awarded!',
        text: '✓ Winner awarded! Notification sent to manager for final approval.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      if (id) {
        getRfq(id).then(res => setRequest(res?.rfq ?? res?.data ?? res));
        fetchRankings(id);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to award winner. Please check your permissions.'
      });
    } finally {
      setAwardingProposal(null);
    }
  };

  const totalItems = request?.items?.reduce((sum: number, item: any) => {
    const price = item?.estimated_price || 0;
    return sum + price * (item.qty || 1);
  }, 0);

  const status = request ? getStatusStyle(request.status) : null;
  const StatusIcon = status?.icon;
  const isRfqAlreadyAwarded = request?.proposals?.some((p: any) => p.winner_status === 'approved' || p.winner_status === 'awarded');

  return (
    <Layout title="Purchase Requisition Detail" subtitle="Review PR metadata, approval status, and item scope.">
      <div style={{ width: "100%", paddingBottom: 60 }}>
        <button
          type="button"
          onClick={() => navigate("/my-pr")}
          style={{
            marginBottom: 24,
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e5e7eb",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={18} style={{ marginRight: 8 }} /> Back to PR list
        </button>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Loader2 className="animate-spin" size={32} color="#f59e0b" />
          </div>
        ) : error ? (
          <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: 28, color: "#fca5a5" }}>
            {error}
          </div>
        ) : request ? (
          <div style={{ display: "grid", gap: 28 }}>
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fb923c", textTransform: "uppercase", letterSpacing: 1.1 }}>PR #{request.id ? String(request.id).substring(0, 8).toUpperCase() : ""}</span>
                  <h1 style={{ margin: "12px 0 0", fontSize: "clamp(22px, 5vw, 32px)", color: "var(--ui-text-primary)" }}>{request.title}</h1>
                  <p style={{ margin: "10px 0 0", color: "#9ca3af", maxWidth: 720, lineHeight: 1.7 }}>{request.description || "No description provided."}</p>
                </div>
                <div style={{ alignSelf: "center" }}>
                  <div style={{ background: status?.bg || "var(--ui-bg-badge)", color: status?.color || "var(--ui-text-muted)", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 16, fontWeight: 700, fontSize: 13 }}>
                    {StatusIcon && <StatusIcon size={16} />} {status?.label || "Unknown"}
                  </div>
                </div>
              </div>

              <div className="huntr-grid-stats">
                <MetaCard icon={<User size={18} />} label="Requested by" value={request.user?.name || "Unknown"} />
                <MetaCard icon={<MapPin size={18} />} label="Company" value={request.company?.name || "Unknown"} />
                <MetaCard icon={<Calendar size={18} />} label="Submitted" value={new Date(request.created_at).toLocaleString()} />
                <MetaCard icon={<Calendar size={18} />} label="Approval" value={request.approved_at ? new Date(request.approved_at).toLocaleString() : "Pending"} />
              </div>
            </div>

            <div className="huntr-grid-2col pr-detail-grid">
              <section style={{ padding: 28, borderRadius: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, color: "#94a3b8", fontWeight: 700 }}>Item Summary</div>
                    <h2 style={{ margin: "10px 0 0", fontSize: 20, color: "#f8fafc" }}>{request.items?.length || 0} items requested</h2>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9ca3af", fontSize: 12 }}>
                    <Package size={16} /> Total estimated
                  </div>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                  {(request.items || []).map((item: any) => (
                    <div key={item.id || item.catalogue_id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: 18, borderRadius: 20, background: "rgba(15,23,42,0.85)", border: "1px solid rgba(148,163,184,0.1)" }}>
                      <div>
                        <div style={{ color: "#f8fafc", fontWeight: 700 }}>{item.catalogue?.name || `Item ${item.catalogue_id}`}</div>
                        <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>{item.catalogue?.item_code || "No code"}</div>
                        <div style={{ color: "#cbd5e1", fontSize: 12, marginTop: 8 }}>Qty: {item.qty} · Expected {item.expected_date}</div>
                      </div>
                      {item.estimated_price && Number(item.estimated_price) > 0 ? (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "#f8fafc" }}>IDR {Number(item.estimated_price).toLocaleString()}</div>
                      <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>Unit Price</div>
                    </div>
                  ) : null}
                    </div>
                  ))}
                </div>

                {rankings.length > 0 && (
                  <div style={{ marginTop: 32, padding: 24, borderRadius: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <BarChart3 size={18} color="#f97316" />
                        <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Participant Rankings & Analysis</div>
                      </div>
                      <button 
                        onClick={() => navigate(`/proposals?search=${encodeURIComponent(request.title)}`)}
                        style={{ background: "none", border: "none", color: "var(--huntr-orange)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        Detailed Comparison <ChevronRight size={14} />
                      </button>
                    </div>

                    <div style={{ display: "grid", gap: 16 }}>
                      {rankings.map((rankData: any) => {
                        const isWinner = rankData.proposal.winner_status === 'approved' || rankData.proposal.winner_status === 'awarded';
                        
                        // Dynamic Recommendation Reason
                        let recommendationReason = "";
                        if (rankData.rank === 1) {
                          recommendationReason = "Penyedia ini menawarkan efisiensi biaya tertinggi (Best Price) dengan jangka waktu pengiriman yang kompetitif.";
                        } else if (rankData.rank === 2) {
                          recommendationReason = "Alternatif terbaik dengan selisih harga tipis, namun memiliki skor reputasi vendor yang sangat baik.";
                        }

                        return (
                          <div 
                            key={rankData.proposal.id} 
                            style={{ 
                              display: "flex", 
                              flexDirection: "column",
                              gap: 16, 
                              padding: 24, 
                              borderRadius: 20, 
                              background: rankData.rank === 1 ? "rgba(249,115,22,0.04)" : "var(--ui-bg-card)", 
                              border: `1px solid ${rankData.rank === 1 ? "rgba(249,115,22,0.2)" : "var(--ui-border)"}`,
                              position: "relative",
                              overflow: "hidden"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                {/* Rank Badge */}
                                <div style={{ 
                                  width: 40, 
                                  height: 40, 
                                  borderRadius: 12, 
                                  background: rankData.rank === 1 ? "#f97316" : "rgba(255,255,255,0.05)", 
                                  color: rankData.rank === 1 ? "#fff" : "var(--ui-text-muted)",
                                  display: "grid", 
                                  placeItems: "center", 
                                  fontSize: 16, 
                                  fontWeight: 900 
                                }}>
                                  {rankData.rank}
                                </div>
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 16 }}>{rankData.proposal.company?.name}</div>
                                    {rankData.rank === 1 && (
                                      <div style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5 }}>BEST PRICE & RECOMMENDED</div>
                                    )}
                                    {isWinner && (
                                      <div style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5 }}>SELECTED WINNER</div>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4, display: "flex", gap: 12 }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> Delivery: {rankData.proposal.delivery_days} days</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><ShieldCheck size={12} /> {rankData.proposal.warranty_months}mo Warranty</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", marginBottom: 2 }}>TOTAL PROPOSAL</div>
                                <div style={{ fontSize: 20, fontWeight: 900, color: rankData.rank === 1 ? "#f97316" : "var(--ui-text-primary)" }}>
                                  IDR {Number(rankData.proposal.price_offer).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* System Recommendation Reason */}
                            {recommendationReason && (
                              <div style={{ display: "flex", gap: 10, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                                <Info size={16} color="var(--huntr-orange)" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div style={{ fontSize: 12, color: "var(--ui-text-secondary)", lineHeight: 1.5 }}>
                                  <strong style={{ color: "var(--ui-text-primary)" }}>System Recommendation:</strong> {recommendationReason}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {request.status === 'active' && !isRfqAlreadyAwarded && (
                              <div style={{ display: "flex", gap: 12, marginTop: 8, borderTop: "1px solid var(--ui-border)", paddingTop: 16 }}>
                                <button 
                                  onClick={() => {
                                    setSelectedNegProposal(rankData.proposal);
                                    setShowNegModal(true);
                                  }}
                                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--ui-border)", background: "none", color: "var(--ui-text-primary)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                                >
                                  <MessageSquare size={16} /> Negotiate
                                </button>
                                <button 
                                  onClick={() => handleAwardWinner(rankData.proposal.id, request.id)}
                                  disabled={awardingProposal === rankData.proposal.id}
                                  style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "var(--huntr-gradient)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(249,115,22,0.2)" }}
                                >
                                  {awardingProposal === rankData.proposal.id ? <Loader2 size={16} className="animate-spin" /> : <><Award size={16} /> Award Proposal Ini</>}
                                </button>
                              </div>
                            )}
                            
                            {rankData.rank === 1 && (
                              <div style={{ position: "absolute", right: -15, top: -15, opacity: 0.05 }}>
                                <Trophy size={100} color="#f97316" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              <aside className="pr-detail-aside" style={{ display: "grid", gap: 20 }}>
                <div className="pr-detail-sticky" style={{ padding: 24, borderRadius: 28, background: "var(--ui-bg-card)", border: `1px solid var(--ui-border)` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#94a3b8", marginBottom: 16 }}>Delivery Point</div>
                  <div style={{ fontSize: 14, color: "var(--ui-text-primary)", lineHeight: 1.6, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {request.delivery_point || request.company?.address || "Not specified"}
                  </div>
                </div>

                <div className="pr-detail-sticky" style={{ padding: 24, borderRadius: 28, background: "var(--ui-bg-card)", border: `1px solid var(--ui-border)` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#94a3b8", marginBottom: 16 }}>Approval Detail</div>
                  <DetailRow label="Approver" value={request.approved_by || "Not yet approved"} />
                  <DetailRow label="Status" value={status?.label || "Unknown"} valueColor={status?.color || "var(--ui-text-muted)"} />
                  <DetailRow label="PR Type" value={request.status === "active" ? "Open RFQ" : "Internal Request"} />
                  <div style={{ marginTop: 18, padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>Lifecycle</div>
                    <div style={{ fontSize: 14, color: "#f8fafc", lineHeight: 1.6 }}>
                      {request.status === "pending_approval" && "Waiting for manager approval before the RFQ is published."}
                      {request.status === "active" && "This request is live as a global RFQ and open for vendor proposals."}
                      {request.status === "approved" && "The PR has been approved and is ready for next procurement steps."}
                      {request.status === "rejected" && "This request was rejected and needs a revision before resubmission."}
                    </div>
                  </div>
                </div>

                <div style={{ padding: 24, borderRadius: 28, background: "var(--ui-bg-card)", border: `1px solid var(--ui-border)` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#94a3b8", marginBottom: 16 }}>PR Summary</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>Line items</span>
                    <span style={{ color: "#f8fafc", fontWeight: 700 }}>{request.items?.length || 0}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>Estimated total</span>
                    <span style={{ color: "#f8fafc", fontWeight: 700 }}>IDR {Number(totalItems).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>Vendor proposals</span>
                    <span style={{ color: "#f87171", fontWeight: 700 }}>{request.proposals?.length || 0}</span>
                  </div>
                </div>

                {request.proposals?.some((p: any) => p.winner_status === 'approved' || p.winner_status === 'awarded') && (
                  <div style={{ padding: 24, borderRadius: 28, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#22c55e", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Trophy size={16} /> Selected Winner
                    </div>
                    {request.proposals.filter((p: any) => p.winner_status === 'approved' || p.winner_status === 'awarded').map((winner: any) => (
                      <div key={winner.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(34,197,94,0.2)", display: "grid", placeItems: "center", color: "#22c55e" }}>
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{winner.company?.name}</div>
                            <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>Winner · {winner.winner_status.toUpperCase()}</div>
                          </div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>Price Offer</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>IDR {Number(winner.price_offer).toLocaleString()}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>Delivery</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>{winner.delivery_days} days</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          </div>
        ) : null}
      </div>

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
            if (id) fetchRankings(id);
          }}
        />
      )}
    </Layout>
  );
}

function MetaCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ padding: 20, borderRadius: 24, background: "var(--ui-bg-card)", border: `1px solid var(--ui-border)`, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(249,115,22,0.16)", display: "grid", placeItems: "center", color: "#8b5cf6" }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
        <div style={{ marginTop: 4, color: "var(--ui-text-primary)", fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ color: "var(--ui-text-secondary)", fontSize: 12 }}>{label}</span>
      <span style={{ color: valueColor || "var(--ui-text-primary)", fontWeight: 700, textAlign: "right", maxWidth: 180 }}>{value}</span>
    </div>
  );
}
