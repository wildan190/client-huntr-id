import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { apiGet, apiPost } from "../lib/api";
import { aiRankProposals } from "../lib/api/ai";
import { useEventBusListener } from "../lib/EventBus";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../hooks/useMediaQuery";
import { useAppShell } from "./_app";
import { 
  ArrowLeft, AlertCircle, Loader2, AlertTriangle
} from "lucide-react";
import Swal from "sweetalert2";

// Import our new components
import { NegotiationModal } from "../components/rfq-detail/NegotiationModal";
import { RFQHeader } from "../components/rfq-detail/RFQHeader";
import { RFQDescription } from "../components/rfq-detail/RFQDescription";
import { RFQItemsTable } from "../components/rfq-detail/RFQItemsTable";
import { ProposalRankings } from "../components/rfq-detail/ProposalRankings";
import { AIAnalysisPanel } from "../components/rfq-detail/AIAnalysisPanel";
import { RFQSidebar } from "../components/rfq-detail/RFQSidebar";

export default function RfqDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const { user, company } = useAppShell();
  const [rfq, setRfq] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [awardingProposal, setAwardingProposal] = useState<string | number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Double submit prevention
  const isProcessing = useRef(false);

  const isBuyer = company?.type === 'buyer';
  const isVendor = company?.type === 'vendor';
  const isOwner = company?.owner_id === user?.id;
  const isManager = user?.role === "manager" || isOwner;
  const canApproveOrAward = isBuyer && isManager;

  // Negotiation State
  const [showNegModal, setShowNegModal] = useState(false);
  const [selectedNegProposal, setSelectedNegProposal] = useState<any>(null);

  // AI Ranking State
  const [aiRankings, setAiRankings] = useState<any>(null);
  const [aiRankLoading, setAiRankLoading] = useState(false);
  const [aiRankError, setAiRankError] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Invite Vendor State
  const [inviteWhatsapp, setInviteWhatsapp] = useState("");
  const [inviting, setInviting] = useState(false);

  const handleInviteVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteWhatsapp) return;
    setInviting(true);
    try {
      await apiPost(`/api/rfqs/${id}/invite-vendor`, { whatsapp: inviteWhatsapp });
      Swal.fire({
        icon: 'success',
        title: 'Invitation Sent!',
        text: 'The vendor has been invited via WhatsApp.',
        timer: 3000,
        showConfirmButton: false
      });
      setInviteWhatsapp("");
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to send invitation.'
      });
    } finally {
      setInviting(false);
    }
  };
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

    isProcessing.current = true;
    setAwardingProposal(proposalId);
    setError(null);
    try {
      const response = await apiPost(`/api/proposals/${proposalId}/award`, {
        rfq_id: rfqId,
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

  const handleNegotiate = (proposal: any) => {
    setSelectedNegProposal(proposal);
    setShowNegModal(true);
  };

  const handleNegotiationSuccess = () => {
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

  const isRfqAlreadyAwarded = rankings.some(r => r.is_winner || r.proposal.winner_status === 'awarded' || r.proposal.winner_status === 'approved');
  return (
    <Layout title="RFQ Detail" subtitle="View technical specifications and company profile before submitting your proposal.">
      <div style={{ width: "100%", paddingBottom: 60, padding: isMobile ? "0 16px 80px" : "0 0 60px" }}>
        
        {/* Navigation & Status Header */}
        <RFQHeader rfq={rfq} isTenderExpired={isTenderExpired} />

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
            <Loader2 className="animate-spin" size={40} color="#f59e0b" />
          </div>
        ) : error ? (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: 12, color: "#ef4444", display: "flex", gap: 12, alignItems: "center" }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
        ) : rfq ? (
          <div 
            className="huntr-grid-2col"
            style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", 
              gap: 16, 
              alignItems: "start" 
            }}
          >
            
            {/* Main Content Area (Left) */}
            <div style={{ display: "grid", gap: 16 }}>
              
              {/* RFQ Header & Description */}
              <RFQDescription rfq={rfq} successMessage={successMessage} />

              {/* Proposal Rankings */}
              <ProposalRankings
                rankings={rankings}
                canApproveOrAward={canApproveOrAward}
                isRfqAlreadyAwarded={isRfqAlreadyAwarded}
                awardingProposal={awardingProposal}
                isProcessing={isProcessing.current}
                onNegotiate={handleNegotiate}
                onAward={handleAwardWinner}
                onAIRank={handleAiRank}
                aiRankLoading={aiRankLoading}
                showAiPanel={showAiPanel}
              />

              {/* AI Analysis Panel */}
              <AIAnalysisPanel
                showAiPanel={showAiPanel}
                aiRankLoading={aiRankLoading}
                aiRankError={aiRankError}
                aiRankings={aiRankings}
              />

              {/* Items Table */}
              <RFQItemsTable rfq={rfq} />
            </div>
            {/* Sidebar Sticky (Right) */}
            <RFQSidebar
              rfq={rfq}
              canSubmitProposal={canSubmitProposal}
              canApproveOrAward={canApproveOrAward}
              isTenderExpired={isTenderExpired}
              isVendor={isVendor}
              getTenderSummary={getTenderSummary}
              totalItems={totalItems}
              onNavigateToProposals={() => navigate("/proposals", { state: { rfqId: rfq.id } })}
              onInviteVendor={handleInviteVendor}
              inviteWhatsapp={inviteWhatsapp}
              setInviteWhatsapp={setInviteWhatsapp}
              inviting={inviting}
            />
          </div>
        ) : (
          <div style={{ color: "var(--ui-text-primary)", background: "var(--ui-bg-card)", padding: 60, borderRadius: 12, textAlign: "center", border: "1px solid var(--ui-border)" }}>
            <AlertCircle size={40} color="var(--ui-text-muted)" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>PR Record Not Found</div>
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
            borderRadius: 8,
            background: "linear-gradient(135deg,#f97316,#f59e0b)",
            color: "#fff",
            fontWeight: 600,
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
            borderRadius: 8,
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
          onSuccess={handleNegotiationSuccess}
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