import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { submitProposal, apiGet } from "../lib/api";
import { 
  Briefcase, Gavel, Loader2, FileText, CheckCircle2, 
  ShieldCheck, Upload, ChevronLeft, Calendar, Info, Package, 
  Building2, ArrowRight, DollarSign, Clock, AlertCircle,
  RefreshCw, MessageSquare, Trophy, X
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";

/**
 * Proposals Page
 * Focused on Vendor's experience for submitting and tracking quotations.
 * Follows enterprise UI standards with full light/dark theme support.
 */
// --- Components & Helpers ---

function NegotiationModal({ proposal, onClose, onSuccess }: { proposal: any, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [paymentScheme, setPaymentScheme] = useState(proposal.payment_term || "");
  const [deliveryTerms, setDeliveryTerms] = useState(proposal.delivery_time || "");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Force items to be an array and try different keys
    const rawItems = proposal.items || proposal.proposal_items || [];
    
    console.log("NegotiationModal - Proposal Items:", rawItems);

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
      const { apiPost } = await import("../lib/api");
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
              {items.map((it, idx) => (
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

export default function Proposals() {
  const location = useLocation();
  const [activeCompany, setActiveCompany] = useState<any>(null);

  // Buyer state
  const [receivedProposals, setReceivedProposals] = useState<any[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [showNegModal, setShowNegModal] = useState(false);
  const [selectedNegProposal, setSelectedNegProposal] = useState<any>(null);
  const [awardingId, setAwardingId] = useState<string | null>(null);

  // Vendor/Tenders state
  const [openRfqs, setOpenRfqs] = useState<any[]>([]);
  const [vendorSubmissions, setVendorSubmissions] = useState<any[]>([]);
  const [rfqsLoading, setRfqsLoading] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);
  const [vendorSubmittedRfqIds, setVendorSubmittedRfqIds] = useState<string[]>([]);
  const [hasSubmittedForSelectedRfq, setHasSubmittedForSelectedRfq] = useState(false);

  // Proposal form state
  const [form, setForm] = useState<any>({
    delivery_days: "7", 
    warranty_months: "12",
    payment_term: "30 days",
    document: null as File | null,
    items: [] // { rfq_item_id, price_offer }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    const activeComp = localStorage.getItem("active_company");
    if (activeComp) {
      const comp = JSON.parse(activeComp);
      setActiveCompany(comp);
      if (comp.type === 'vendor') {
        fetchOpenTenders().then((rfqs) => {
          if (location.state?.rfqId && rfqs) {
            const rfq = rfqs.find((r: any) => r.id === location.state.rfqId);
            if (rfq) handleSelectRfq(rfq);
          }
        });
        fetchVendorSubmissions(comp.id);
      } else {
        fetchReceivedProposals(comp.id);
      }
    }
    
    // Listen for new notifications to refresh data
    const handleRefreshData = () => {
      const activeComp = localStorage.getItem("active_company");
      if (activeComp) {
        const comp = JSON.parse(activeComp);
        if (comp.type === 'vendor') {
          fetchOpenTenders();
          fetchVendorSubmissions(comp.id);
        } else {
          fetchReceivedProposals(comp.id);
        }
      }
    };
    
    window.addEventListener('huntr:notification_received', handleRefreshData);
    
    return () => {
      window.removeEventListener('huntr:notification_received', handleRefreshData);
    };
  }, [location.state]);

  const fetchReceivedProposals = async (companyId: string | number) => {
    setProposalsLoading(true);
    try {
      const data = await apiGet(`/api/proposals?company_id=${companyId}`);
      setReceivedProposals(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Failed to fetch received proposals", err);
    } finally {
      setProposalsLoading(false);
    }
  };

  const handleAward = async (proposalId: string) => {
    if (!activeCompany) return;
    const userSession = localStorage.getItem("user_session");
    const user = userSession ? JSON.parse(userSession) : null;
    
    setAwardingId(proposalId);
    try {
      const { apiPost } = await import("../lib/api");
      await apiPost(`/api/proposals/${proposalId}/award`, {
        rfq_id: receivedProposals.find(p => p.id === proposalId)?.rfq_id,
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
      fetchReceivedProposals(activeCompany.id);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to award winner.'
      });
    } finally {
      setAwardingId(null);
    }
  };

  const fetchOpenTenders = async () => {
    setRfqsLoading(true);
    try {
      const data = await apiGet("/api/rfqs?status=active");
      const rfqs = Array.isArray(data) ? data : data.data || [];
      setOpenRfqs(rfqs);
      return rfqs;
    } catch (err) {
      console.error("Failed to fetch tenders", err);
    } finally {
      setRfqsLoading(false);
    }
  };

  const fetchVendorSubmissions = async (companyId: string | number) => {
    try {
      const data = await apiGet(`/api/proposals/my-rank?company_id=${companyId}`);
      const rankings = Array.isArray(data) ? data : data.rankings || [];
      setVendorSubmittedRfqIds(rankings.map((item: any) => String(item.rfq_id)));
    } catch (err) {
      console.error("Failed to fetch vendor submissions", err);
    }
  };

  const updateForm = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSelectRfq = (rfq: any) => {
    const alreadySubmitted = vendorSubmittedRfqIds.includes(rfq.id);
    setSelectedRfq(rfq);
    setHasSubmittedForSelectedRfq(alreadySubmitted);
    setError(alreadySubmitted ? "Your company already submitted an offer for this tender." : null);
    if (rfq) {
      setForm((p: any) => ({
        ...p,
        items: rfq.items?.map((item: any) => ({
          rfq_item_id: item.id,
          price_offer: "",
          catalogue: item.catalogue
        })) || []
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      updateForm("document", e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !selectedRfq) return;

    // Prevent double submit
    if (isProcessing.current || loading) {
      console.warn("Request already in progress");
      return;
    }
    
    const missingPrices = form.items.some((it: any) => !it.price_offer || parseFloat(it.price_offer) <= 0);
    if (missingPrices) {
      setError("Please provide a valid price offer for all items.");
      return;
    }

    isProcessing.current = true;
    setLoading(true); 
    setError(null);
    try {
      const formData = new FormData();
      formData.append("company_id", activeCompany.id.toString());
      formData.append("rfq_id", selectedRfq.id.toString());
      formData.append("delivery_days", form.delivery_days);
      formData.append("warranty_months", form.warranty_months);
      formData.append("payment_term", form.payment_term);
      
      if (form.document) formData.append("document", form.document);

      form.items.forEach((it: any, idx: number) => {
        formData.append(`items[${idx}][rfq_item_id]`, it.rfq_item_id.toString());
        formData.append(`items[${idx}][price_offer]`, it.price_offer.toString());
      });

      const data = await submitProposal(formData);
      setResult(data.proposal);
      setVendorSubmittedRfqIds(prev => selectedRfq ? [...new Set([...prev, selectedRfq.id])] : prev);
      setSelectedRfq(null);
      setHasSubmittedForSelectedRfq(false);
      setForm({ delivery_days: "7", warranty_months: "12", payment_term: "30 days", document: null, items: [] });
      setTimeout(() => setResult(null), 5000);
      fetchOpenTenders();
    } catch (err: any) {
      setError(err.message || "Failed to submit proposal");
      isProcessing.current = false;
    } finally {
      setLoading(false);
      setTimeout(() => {
        isProcessing.current = false;
      }, 1000);
    }
  };

  const isVendor = activeCompany?.type === 'vendor';
  const isBuyer = activeCompany?.type === 'buyer';

  if (!activeCompany) {
    return (
      <Layout title="Proposals" subtitle="Loading your workspace...">
        <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
          <Loader2 className="animate-spin" color="var(--huntr-orange)" size={40} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Proposals" subtitle={isBuyer ? "Review, negotiate, and award vendor proposals for your RFQs." : "Manage your bids, submit quotations, and review active tender opportunities."}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 32 }}>
        
        <div style={{ width: "100%" }}>
          {isBuyer ? (
            /* Buyer Review View */
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>Received Proposals ({receivedProposals.length})</h2>
                  <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", marginTop: 4 }}>Evaluate vendor offers and proceed to negotiation or award.</p>
                </div>
                <button onClick={() => fetchReceivedProposals(activeCompany.id)} style={secondaryBtnStyle}>
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
                            onClick={() => {
                              setSelectedNegProposal(p);
                              setShowNegModal(true);
                            }}
                            style={{ ...secondaryBtnStyle, display: "flex", alignItems: "center", gap: 8, color: "var(--huntr-orange)" }}
                          >
                            <MessageSquare size={16} /> Negotiate
                          </button>
                          <button 
                            onClick={() => handleAward(p.id)}
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
          ) : isVendor && !selectedRfq ? (
            /* Vendor Tenders Grid View */
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>Available Opportunities</h2>
                  <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", marginTop: 4 }}>Review and participate in active buyer requests.</p>
                </div>
                <button onClick={fetchOpenTenders} style={secondaryBtnStyle}>
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
                  {openRfqs.map(rfq => (
                    <div 
                      key={rfq.id} 
                      style={{
                        ...cardStyle,
                        ...(vendorSubmittedRfqIds.includes(rfq.id) ? { cursor: "default" } : {})
                      }} 
                      onClick={() => {
                        if (!vendorSubmittedRfqIds.includes(rfq.id)) {
                          handleSelectRfq(rfq);
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

                      {isVendor && (
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
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* My Submissions Section for Vendor */}
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
                          <div>
                            <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: 0 }}>{p.rfq?.title}</h4>
                            <p style={{ fontSize: 12, color: "var(--ui-text-brand)", fontWeight: 700, marginTop: 4 }}>Total Bid: Rp {Number(p.price_offer).toLocaleString()}</p>
                          </div>
                          <div style={{ ...badgeStyle, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>SUBMITTED</div>
                        </div>
                        <div style={{ display: "flex", gap: 20, marginTop: 16, padding: "16px 0", borderTop: "1px solid var(--ui-border)" }}>
                          <div style={itemDetailStyle}><Clock size={14} /> {p.delivery_days} Days</div>
                          <div style={itemDetailStyle}><ShieldCheck size={14} /> {p.payment_term}</div>
                          <div style={itemDetailStyle}><Calendar size={14} /> {new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : isVendor && selectedRfq ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                   <button onClick={() => setSelectedRfq(null)} style={iconButtonStyle} aria-label="Back to tender list" title="Back to tender list">
                     <ChevronLeft size={20} />
                   </button>
                   <div>
                     <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-brand)", textTransform: "uppercase", letterSpacing: 1 }}>SUBMIT PROPOSAL</div>
                     <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--ui-text-primary)" }}>{selectedRfq.title}</h2>
                   </div>
                </div>

                <div style={formContainerStyle}>
                  {/* RFQ Reference Panel */}
                  <div style={formHeaderStyle}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                       <div style={{ ...iconContainerStyle, width: 36, height: 36 }}><Building2 size={18} /></div>
                       <div>
                         <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>TARGET BUYER</div>
                         <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>{selectedRfq.company?.name}</div>
                       </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>Purchase Req ID</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>PR-{selectedRfq.id ? String(selectedRfq.id).substring(0, 8).toUpperCase() : ""}</div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
                    {/* 1. Item Pricing */}
                    <section>
                      <SectionHeader icon={<DollarSign size={18} />} title="Itemized Price Offers" />
                      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                        {form.items.map((item: any, idx: number) => {
                          const rfqItem = selectedRfq.items?.find((i:any) => i.id === item.rfq_item_id);
                          return (
                            <div key={item.rfq_item_id} style={formItemRowStyle}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>{item.catalogue?.name}</div>
                                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                  <span style={{ fontSize: 11, color: "var(--ui-text-muted)" }}>{item.catalogue?.item_code} · {rfqItem?.qty} Units Requested</span>
                                </div>
                              </div>
                              <div style={{ position: "relative", width: 220 }}>
                                <span style={currencyPrefixStyle}>Rp</span>
                                <input 
                                  value={item.price_offer} 
                                  onChange={e => {
                                    const newItems = [...form.items];
                                    newItems[idx].price_offer = e.target.value;
                                    updateForm("items", newItems);
                                  }}
                                  type="number" min="0" required placeholder="0"
                                  style={inputStyle} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* 2. Logistics & Docs */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                      <section>
                          <SectionHeader icon={<Clock size={18} />} title="SERVICE TERMS" />
                          <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                            <div style={fieldGroupStyle}>
                              <label style={labelStyle}>LEAD TIME (DAYS TO DELIVERY)</label>
                              <select value={form.delivery_days} onChange={e => updateForm("delivery_days", e.target.value)} style={selectStyle}>
                                <option value="3">3 Days (Express)</option>
                                <option value="7">7 Days (Standard)</option>
                                <option value="14">14 Days</option>
                                <option value="30">30 Days</option>
                              </select>
                            </div>
                            <div style={fieldGroupStyle}>
                              <label style={labelStyle}>WARRANTY PERIOD (MONTHS)</label>
                              <select value={form.warranty_months} onChange={e => updateForm("warranty_months", e.target.value)} style={selectStyle}>
                                <option value="0">No Warranty</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months (1 Year)</option>
                                <option value="24">24 Months (2 Years)</option>
                                <option value="36">36 Months (3 Years)</option>
                              </select>
                            </div>
                            <div style={fieldGroupStyle}>
                              <label style={labelStyle}>PAYMENT SCHEME</label>
                              <select value={form.payment_term} onChange={e => updateForm("payment_term", e.target.value)} style={selectStyle}>
                                <option value="7 days">Net 7 Days</option>
                                <option value="14 days">Net 14 Days</option>
                                <option value="30 days">Net 30 Days</option>
                                <option value="60 days">Net 60 Days</option>
                              </select>
                            </div>
                          </div>
                        </section>

                      <section>
                        <SectionHeader icon={<Upload size={18} />} title="Supporting Documents" />
                        <div style={{ marginTop: 16 }}>
                          <div 
                            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{ 
                              ...dropzoneStyle,
                              borderColor: isDragging ? "var(--ui-text-brand)" : "var(--ui-border)",
                              background: isDragging ? "var(--ui-bg-badge)" : "var(--ui-bg-input)"
                            }}
                          >
                            <input type="file" ref={fileInputRef} onChange={e => updateForm("document", e.target.files?.[0] || null)} style={{ display: "none" }} />
                            <div style={dropzoneIconStyle}>
                              {form.document ? <CheckCircle2 size={24} color="var(--ui-status-active)" /> : <Upload size={24} color="var(--ui-text-muted)" />}
                            </div>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-primary)" }}>
                                {form.document ? form.document.name : "Drag & Drop Supporting Document"}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 4 }}>
                                {form.document ? "File ready for upload" : "PDF, JPG, or PNG (Max 5MB)"}
                              </div>
                            </div>
                          </div>
                          <div style={infoBoxStyle}>
                            <Info size={14} color="var(--ui-text-brand)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ margin: 0, fontSize: 11, color: "var(--ui-text-secondary)", lineHeight: 1.5 }}>
                              <strong>Optional:</strong> Attaching company profile, additional technical specifications, or vendor certifications will increase your evaluation score.
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* Footer Actions */}
                    <div style={formFooterStyle}>
                      <button type="button" onClick={() => { setSelectedRfq(null); setHasSubmittedForSelectedRfq(false); setError(null); }} style={secondaryBtnStyle}>Cancel</button>
                      <button 
                        type="submit" 
                        disabled={loading || hasSubmittedForSelectedRfq || isProcessing.current}
                        style={{
                          ...primaryBtnStyle,
                          background: (loading || hasSubmittedForSelectedRfq || isProcessing.current) ? "#9ca3af" : "var(--huntr-gradient)",
                          cursor: (loading || hasSubmittedForSelectedRfq || isProcessing.current) ? "not-allowed" : "pointer",
                          boxShadow: (loading || hasSubmittedForSelectedRfq || isProcessing.current) ? "none" : "0 4px 12px rgba(249,115,22,0.2)",
                          opacity: 1
                        }}
                      >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><ShieldCheck size={18} /> Submit Official Proposal</>}
                      </button>
                    </div>
                    {hasSubmittedForSelectedRfq && (
                      <div style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700, marginTop: 8 }}>
                        Duplicate submission is not allowed for this RFQ.
                      </div>
                    )}
                    {error && <ErrorBox message={error} />}
                  </form>
                </div>
              </div>
          ) : (
            <div style={emptyStateStyle}>
              <Briefcase size={48} color="var(--ui-text-muted)" style={{ marginBottom: 16, opacity: 0.2 }} />
              <div style={{ color: "var(--ui-text-primary)", fontSize: 15, fontWeight: 700 }}>Workspace Not Found</div>
              <div style={{ color: "var(--ui-text-muted)", fontSize: 13, marginTop: 4 }}>Please ensure you are logged in correctly.</div>
            </div>
          )}
        </div>

        {/* Floating Success Notification */}
        {result && (
          <div style={floatingSuccessStyle}>
            <CheckCircle2 size={20} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>Quotation Submitted!</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Your offer is now active in the tender system.</div>
            </div>
            <button onClick={() => setResult(null)} style={closeButtonStyle}>×</button>
          </div>
        )}
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
            if (activeCompany) fetchReceivedProposals(activeCompany.id);
          }}
        />
      )}
    </Layout>
  );
}

// ── Components & Helpers ───────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ color: "var(--ui-text-brand)" }}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ui-text-primary)", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h3>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={errorBoxStyle}>
      <AlertCircle size={16} /> {message}
    </div>
  );
}

// ── Shared Styles ──────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
  borderRadius: 20, padding: 24, cursor: "pointer", transition: "all 0.2s ease",
  display: "flex", flexDirection: "column",
};

const iconContainerStyle: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 12, background: "var(--ui-bg-badge)",
  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ui-text-brand)"
};

const badgeStyle: React.CSSProperties = {
  padding: "4px 10px", borderRadius: 8, background: "var(--ui-bg-input)",
  border: "1px solid var(--ui-border)", fontSize: 10, fontWeight: 800, color: "var(--ui-text-muted)"
};

const itemDetailStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, color: "var(--ui-text-secondary)", fontSize: 12, fontWeight: 600
};

const iconButtonStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 12, background: "var(--ui-bg-card)",
  border: "1px solid var(--ui-border)", color: "var(--ui-text-primary)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const formContainerStyle: React.CSSProperties = {
  background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
  borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.02)"
};

const formHeaderStyle: React.CSSProperties = {
  padding: "20px 32px", background: "var(--ui-bg-input)",
  borderBottom: "1px solid var(--ui-border)", display: "flex", justifyContent: "space-between", alignItems: "center"
};

const formItemRowStyle: React.CSSProperties = {
  background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-subtle)",
  borderRadius: 14, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20
};

const currencyPrefixStyle: React.CSSProperties = {
  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
  fontSize: 11, fontWeight: 800, color: "var(--ui-text-muted)"
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", paddingLeft: 44, borderRadius: 10,
  background: "var(--ui-bg-card)", border: "1px solid var(--ui-border-input)",
  color: "var(--ui-text-primary)", outline: "none", fontSize: 14, fontWeight: 600
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, paddingLeft: 14, appearance: "auto"
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", marginBottom: 6
};

const fieldGroupStyle: React.CSSProperties = { display: "flex", flexDirection: "column" };

const dropzoneStyle: React.CSSProperties = {
  border: "2px dashed var(--ui-border)", borderRadius: 16, padding: "24px",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.2s"
};

const dropzoneIconStyle: React.CSSProperties = {
  width: 48, height: 48, borderRadius: "50%", background: "var(--ui-bg-card)",
  border: "1px solid var(--ui-border)", display: "flex", alignItems: "center", justifyContent: "center"
};

const infoBoxStyle: React.CSSProperties = {
  marginTop: 12, display: "flex", gap: 10, alignItems: "start",
  background: "var(--ui-bg-badge)", padding: 12, borderRadius: 12, border: "1px solid var(--ui-border-badge)"
};

const formFooterStyle: React.CSSProperties = {
  marginTop: 8, paddingTop: 24, borderTop: "1px solid var(--ui-border)",
  display: "flex", justifyContent: "flex-end", gap: 16
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "12px 24px", borderRadius: 12, background: "var(--huntr-gradient)",
  border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(249,115,22,0.2)",
  transition: "all 0.2s ease"
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "10px 16px", borderRadius: 10, background: "var(--ui-bg-input)",
  border: "1px solid var(--ui-border)", color: "var(--ui-text-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer"
};

const emptyStateStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  padding: 80, background: "var(--ui-bg-card)", borderRadius: 24, border: "1px dashed var(--ui-border)"
};

const floatingSuccessStyle: React.CSSProperties = {
  position: "fixed", bottom: 32, right: 32, background: "var(--ui-status-active)", color: "#fff",
  padding: "14px 20px", borderRadius: 14, display: "flex", alignItems: "center", gap: 12,
  boxShadow: "0 10px 30px rgba(34,197,94,0.3)", zIndex: 1000
};

const closeButtonStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.1)", border: "none", color: "#fff", cursor: "pointer",
  width: 20, height: 20, borderRadius: "50%", fontWeight: 900, fontSize: 14
};

const errorBoxStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
  borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171",
  display: "flex", alignItems: "center", gap: 8, fontWeight: 600
};
