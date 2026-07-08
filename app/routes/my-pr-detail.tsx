import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { getRfq, apiGet, apiPost } from "../lib/api";
import { getAssetUrl, getRfqDocumentUrl } from "../lib/assets";
import { 
  ArrowLeft, Calendar, Package, MapPin, 
  Loader2, Building2, Info, 
  AlertCircle, RefreshCw, BarChart3, AlertTriangle
} from "lucide-react";
import Swal from "sweetalert2";
import { useAppShell } from "../routes/_app";

// Import our new components
import { NegotiationModal } from "../components/pr-detail/NegotiationModal";
import { PRStatusCard } from "../components/pr-detail/PRStatusCard";
import { PRActions } from "../components/pr-detail/PRActions";
import { PRSummary } from "../components/pr-detail/PRSummary";
import { ProposalRankings } from "../components/pr-detail/ProposalRankings";

export default function MyPurchaseRequisitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, company: activeCompany } = useAppShell();
  
  // State management
  const [request, setRequest] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Negotiation & Awarding State
  const [showNegModal, setShowNegModal] = useState(false);
  const [selectedNegProposal, setSelectedNegProposal] = useState<any>(null);
  const [awardingProposal, setAwardingProposal] = useState<string | number | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Data fetching
  const fetchRankings = React.useCallback(async (rfqId: string | number) => {
    try {
      const response = await apiGet(`/api/rfqs/${rfqId}/rankings`);
      setRankings(response.rankings || (Array.isArray(response) ? response : []));
    } catch (err) {
      console.error("Failed to load rankings", err);
      setRankings([]);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (!id || id === "NaN" || id === "undefined") {
      setError("Invalid Purchase Requisition ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    getRfq(id)
      .then((response) => {
        const rfq = response?.rfq ?? response?.data ?? response;
        console.log("=== FULL RFQ DATA ===");
        console.log(rfq);
        console.log("=== RFQ ITEMS ===");
        console.log(rfq.items);
        if (rfq.items && rfq.items.length > 0) {
          console.log("=== FIRST ITEM ===");
          console.log(rfq.items[0]);
          console.log("=== FIRST ITEM CATALOGUE ===");
          console.log(rfq.items[0].catalogue);
        }
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
      .finally(() => {
        setLoading(false);
      });
  }, [id, fetchRankings]);

  // Award winner handler
  const handleAwardWinner = React.useCallback(async (proposalId: string | number, rfqId: string | number) => {
    if (!user) return;
    
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
  }, [user, id, fetchRankings]);

  // Negotiation handlers
  const handleOpenNegotiation = (proposal: any) => {
    setSelectedNegProposal(proposal);
    setShowNegModal(true);
  };

  const handleCloseNegModal = () => {
    setShowNegModal(false);
    setSelectedNegProposal(null);
  };

  const handleNegotiationSuccess = () => {
    handleCloseNegModal();
    if (id) {
      fetchRankings(id);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout title="Purchase Request Details" subtitle="Loading details...">
        <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
          <Loader2 className="animate-spin" color="var(--huntr-orange)" size={40} />
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !request) {
    return (
      <Layout title="Purchase Request Details" subtitle="Error loading details">
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: 100, 
          textAlign: "center" 
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", margin: 0 }}>
            {error || "Request not found"}
          </h3>
          <p style={{ color: "var(--ui-text-muted)", marginTop: 8 }}>
            Please check the URL or try again later.
          </p>
          <button 
            onClick={() => navigate("/my-pr")}
            style={{
              marginTop: 20,
              padding: "12px 20px",
              borderRadius: 12,
              background: "var(--huntr-gradient)",
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Back to My PRs
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={`PR #${String(request.id).substring(0, 8).toUpperCase()}`} 
      subtitle={request.title}
    >
      {/* Header Navigation */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 16, 
        marginBottom: 32 
      }}>
        <button 
          onClick={() => navigate("/my-pr")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "var(--ui-bg-card)",
            border: "1px solid var(--ui-border)",
            color: "var(--ui-text-primary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          aria-label="Back to My PRs"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: 11, 
            fontWeight: 800, 
            color: "var(--ui-text-brand)", 
            textTransform: "uppercase", 
            letterSpacing: 1, 
            marginBottom: 4 
          }}>
            Purchase Requisition
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: 24, 
            fontWeight: 900, 
            color: "var(--ui-text-primary)" 
          }}>
            {request.title}
          </h1>
        </div>

        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--ui-border-input)",
            color: "var(--ui-text-secondary)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 300px", 
        gap: 32, 
        alignItems: "start" 
      }}>
        {/* Left Column - Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Request Description */}
          {request.description && (
            <div style={{ 
              padding: 20, 
              borderRadius: 16, 
              background: "var(--ui-bg-card)", 
              border: "1px solid var(--ui-border)" 
            }}>
              <div style={{ 
                fontSize: 11, 
                fontWeight: 700, 
                textTransform: "uppercase", 
                letterSpacing: 1, 
                color: "#9ca3af", 
                marginBottom: 12 
              }}>
                Description
              </div>
              <p style={{ 
                fontSize: 14, 
                color: "var(--ui-text-primary)", 
                lineHeight: 1.6, 
                margin: 0 
              }}>
                {request.description}
              </p>
            </div>
          )}

          {/* PR Summary */}
          <PRSummary request={request} />

          {/* Items List */}
          <div style={{ 
            padding: 20, 
            borderRadius: 16, 
            background: "var(--ui-bg-card)", 
            border: "1px solid var(--ui-border)" 
          }}>
            <div style={{ 
              fontSize: 11, 
              fontWeight: 700, 
              textTransform: "uppercase", 
              letterSpacing: 1, 
              color: "#9ca3af", 
              marginBottom: 16 
            }}>
              Requested Items ({request.items?.length || 0})
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {request.items?.map((item: any, index: number) => {
                console.log(`=== RENDERING ITEM ${index} ===`);
                console.log(item);
                const catalogue = item.catalogue;
                return (
                <div 
                  key={index} 
                  style={{ 
                    padding: 16, 
                    background: "var(--ui-bg-input)", 
                    borderRadius: 12, 
                    border: "1px solid var(--ui-border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
                    <div style={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: 12, 
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: catalogue?.image_path ? "transparent" : "var(--ui-bg-card)",
                      border: "1px solid var(--ui-border)"
                    }}>
                      {catalogue?.image_path ? (
                        <img 
                          src={getAssetUrl(catalogue.image_path)} 
                          alt={catalogue?.name}
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            console.log("Image failed to load:", catalogue.image_path);
                            const img = e.target as HTMLImageElement;
                            img.style.display = "none";
                          }}
                        />
                      ) : (
                        <div style={{ 
                          fontSize: 24, 
                          color: "var(--ui-text-muted)",
                          opacity: 0.5
                        }}>📦</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {catalogue?.category && (
                        <div style={{ 
                          fontSize: 11, 
                          color: "#f59e0b", 
                          fontWeight: 700, 
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: 4
                        }}>
                          {catalogue.category}
                        </div>
                      )}
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 800, 
                        color: "var(--ui-text-primary)",
                        marginBottom: 2
                      }}>
                        {catalogue?.name || "Unknown Item"}
                      </div>
                      <div style={{ 
                        fontSize: 12, 
                        color: "var(--ui-text-muted)",
                        marginBottom: 4
                      }}>
                        Qty: {item.qty} {catalogue?.uom || "pcs"}
                      </div>
                      {catalogue?.specifications && (
                        <div style={{ 
                          fontSize: 11, 
                          color: "var(--ui-text-muted)",
                          lineHeight: 1.4,
                          maxWidth: 400,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}>
                          {catalogue.specifications}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 800, 
                      color: "#f97316"
                    }}>
                      Rp {Number(item.estimated_price || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)" }}>per {catalogue?.uom || "pcs"}</div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Proposal Rankings */}
          {request.status === 'active' && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ 
                  padding: 10, 
                  borderRadius: 12, 
                  background: "rgba(249,115,22,0.1)", 
                  color: "var(--huntr-orange)" 
                }}>
                  <BarChart3 size={20} />
                </div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: 20, 
                  fontWeight: 800, 
                  color: "var(--ui-text-primary)" 
                }}>
                  Vendor Proposals
                </h2>
              </div>
              
              <ProposalRankings
                rankings={rankings}
                onAwardWinner={handleAwardWinner}
                onOpenNegotiation={handleOpenNegotiation}
                awardingProposal={awardingProposal}
                requestId={request.id}
              />
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Status Card */}
          <PRStatusCard status={request.status} />
          
          {/* Actions */}
          <PRActions 
            request={request}
            user={user}
            activeCompany={activeCompany}
            onUpdate={setRequest}
          />

          {/* Document Attachment */}
          {(request.document_url || request.document_path) && (
            <div style={{ 
              padding: 16, 
              borderRadius: 16, 
              background: "var(--ui-bg-card)", 
              border: "1px solid var(--ui-border)" 
            }}>
              <div style={{ 
                fontSize: 11, 
                fontWeight: 700, 
                textTransform: "uppercase", 
                letterSpacing: 1, 
                color: "#9ca3af", 
                marginBottom: 12 
              }}>
                Attachment
              </div>
              <a 
                href={getRfqDocumentUrl(request.id)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: 12,
                  background: "var(--ui-bg-input)",
                  borderRadius: 10,
                  textDecoration: "none",
                  color: "var(--ui-text-primary)",
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                <Package size={16} />
                View Document
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNegModal && selectedNegProposal && (
        <NegotiationModal
          proposal={selectedNegProposal}
          onClose={handleCloseNegModal}
          onSuccess={handleNegotiationSuccess}
        />
      )}
    </Layout>
  );
}