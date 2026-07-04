import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet, apiPost } from "../lib/api";
import { CheckCircle2, XCircle, Clock, Package, Calendar, User, Search, Loader2, AlertCircle, Trophy, Building2, DollarSign } from "lucide-react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function Approvals() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    const companySession = localStorage.getItem("active_company");
    
    if (userSession && companySession) {
      const u = JSON.parse(userSession);
      const c = JSON.parse(companySession);
      setUser(u);
      setActiveCompany(c);
      
      const isOwner = c.owner_id === u.id;
      if (u.role !== 'manager' && !isOwner || c.type !== 'buyer') {
        navigate("/");
        return;
      }

      fetchPendingRequests(c.id);
      fetchAwardedProposals(c.id);
    }
  }, []);

  const [awardedProposals, setAwardedProposals] = useState<any[]>([]);

  const fetchAwardedProposals = async (companyId: string) => {
    try {
      const res = await apiGet(`/api/proposals/manager/awaiting-approval?company_id=${companyId}`);
      setAwardedProposals(res.proposals || []);
    } catch (err) {
      console.error("Failed to fetch awarded proposals", err);
    }
  };

  const handleApproveWinner = async (proposalId: string) => {
    if (!user) return;
    setProcessingId(proposalId);
    try {
      await apiPost(`/api/proposals/${proposalId}/approve`, { user_id: user.id });
      setAwardedProposals(prev => prev.filter(p => p.id !== proposalId));
    } catch (err) {
      console.error("Failed to approve winner", err);
    } finally {
      setProcessingId(null);
    }
  };

  const fetchPendingRequests = async (companyId: string) => {
    try {
      // Data Isolation: Fetch only for this company
      const res = await apiGet(`/api/rfqs?status=pending_approval&company_id=${companyId}`);
      setRequests(res || []);
    } catch (err) {
      console.error("Failed to fetch pending PRs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (rfqId: string) => {
    if (!user) return;
    setProcessingId(rfqId);
    try {
      await apiPost(`/api/rfqs/${rfqId}/approve`, {});
      setRequests(prev => prev.filter(r => r.id !== rfqId));
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'PR has been approved and published.'
      });
    } catch (err) {
      console.error("Failed to approve PR", err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: "Failed to approve PR. Check console for details."
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (rfqId: string) => {
    if (!user) return;
    
    const { value: reason } = await Swal.fire({
      title: 'Reject Purchase Request',
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Please provide a reason for rejecting this PR...',
      inputAttributes: {
        'aria-label': 'Type your rejection reason here'
      },
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason for rejection!';
        }
        if (value.length < 10) {
          return 'Reason must be at least 10 characters long';
        }
      }
    });

    if (!reason) return;

    setProcessingId(rfqId);
    try {
      await apiPost(`/api/rfqs/${rfqId}/reject`, { 
        reason: reason 
      });
      setRequests(prev => prev.filter(r => r.id !== rfqId));
      Swal.fire({
        icon: 'success',
        title: 'Rejected!',
        text: 'PR has been rejected.'
      });
    } catch (err) {
      console.error("Failed to reject PR", err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: "Failed to reject PR. Check console for details."
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Layout title="Manager Approvals" subtitle="Review and approve purchase requisitions and awarded winners.">
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 40 }}>
        
        {/* Section 1: Pending PRs */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 10, borderRadius: 12, background: "rgba(249,115,22,0.1)", color: "var(--huntr-orange)" }}>
              <Clock size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>Pending Purchase Requisitions</h2>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Loader2 className="animate-spin" size={32} color="var(--huntr-orange)" />
            </div>
          ) : requests.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", background: "var(--ui-bg-input)", borderRadius: 32, border: "1px dashed var(--ui-border)" }}>
              <CheckCircle2 size={32} style={{ opacity: 0.1, marginBottom: 16 }} />
              <p style={{ margin: 0, fontSize: 14, color: "var(--ui-text-muted)" }}>No PRs awaiting approval.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {requests.map(req => (
                <div key={req.id} className="huntr-action-card" style={{
                  background: "var(--ui-bg-card)", borderRadius: 24, border: "1px solid var(--ui-border)",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ui-text-brand)", background: "var(--ui-bg-badge)", padding: "2px 8px", borderRadius: 6 }}>PR #{req.id ? String(req.id).substring(0, 8).toUpperCase() : ""}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ui-text-muted)" }}>
                        <Calendar size={12} /> {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)" }}>{req.title}</h3>
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ui-text-muted)" }}>
                      <User size={13} /> Requested by: <span style={{ color: "var(--ui-text-secondary)" }}>{req.user?.name || "Unknown"}</span>
                    </div>
                  </div>

                  <div className="huntr-action-card-meta" style={{ width: 180 }}>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Items to Purchase</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Package size={14} color="var(--ui-text-muted)" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>{req.items?.length || 0} products</span>
                    </div>
                  </div>

                  <div className="huntr-action-card-actions" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button 
                      onClick={() => navigate(`/my-pr/${req.id}`)}
                      style={{
                        padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--ui-border-input)", color: "var(--ui-text-secondary)", fontWeight: 700,
                        fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                      }}
                    >
                      <Package size={14} /> View Details
                    </button>
                    <button 
                      onClick={() => handleReject(req.id)}
                      disabled={processingId === req.id}
                      style={{
                        padding: "10px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontWeight: 700,
                        fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                      }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(req.id)}
                      disabled={processingId === req.id}
                      style={{
                        padding: "10px 20px", borderRadius: 12, background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontWeight: 700,
                        fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      {processingId === req.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Awarded Winners */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 10, borderRadius: 12, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              <Trophy size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>Awarded Winners Awaiting PO</h2>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Loader2 className="animate-spin" size={32} color="var(--huntr-orange)" />
            </div>
          ) : awardedProposals.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", background: "var(--ui-bg-input)", borderRadius: 32, border: "1px dashed var(--ui-border)" }}>
              <Trophy size={32} style={{ opacity: 0.1, marginBottom: 16 }} />
              <p style={{ margin: 0, fontSize: 14, color: "var(--ui-text-muted)" }}>No winners awaiting PO approval.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {awardedProposals.map(proposal => (
                <div key={proposal.id} className="huntr-action-card" style={{
                  background: "var(--ui-bg-card)", borderRadius: 24, border: "1px solid var(--ui-border)",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: 6 }}>AWARDED</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ui-text-muted)" }}>
                        <Calendar size={12} /> {new Date(proposal.awarded_at).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)" }}>{proposal.rfq_title}</h3>
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ui-text-secondary)", fontWeight: 700 }}>
                        <Building2 size={14} color="#22c55e" /> {proposal.company_name}
                      </div>
                      <div style={{ color: "var(--ui-border)", fontSize: 14 }}>•</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ui-text-brand)", fontWeight: 800 }}>
                        <DollarSign size={14} /> IDR {Number(proposal.price_offer).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="huntr-action-card-meta" style={{ width: 150 }}>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Terms</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-primary)" }}>{proposal.delivery_days} days delivery</div>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 2 }}>{proposal.payment_term}</div>
                  </div>

                  <div className="huntr-action-card-actions" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button 
                      onClick={() => navigate(`/my-pr/${proposal.rfq_id}`)}
                      style={{
                        padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--ui-border-input)", color: "var(--ui-text-secondary)", fontWeight: 700,
                        fontSize: 13, cursor: "pointer"
                      }}
                    >
                      Compare & Review
                    </button>
                    <button 
                      onClick={() => navigate(`/rfq/${proposal.rfq_id}`)}
                      style={{
                        padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--ui-border-input)", color: "var(--ui-text-secondary)", fontWeight: 700,
                        fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                      }}
                    >
                      <Package size={14} /> View PR
                    </button>
                    <button 
                      onClick={() => handleApproveWinner(proposal.id)}
                      disabled={processingId === proposal.id}
                      style={{
                        padding: "10px 20px", borderRadius: 12, background: "var(--huntr-orange)",
                        border: "none", color: "#fff", fontWeight: 700,
                        fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                        boxShadow: "0 4px 12px rgba(249,115,22,0.2)"
                      }}
                    >
                      {processingId === proposal.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve & Generate PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
