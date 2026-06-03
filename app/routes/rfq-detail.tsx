import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { apiGet, apiPost } from "../lib/api";
import { 
  ArrowLeft, Calendar, Building2, Package, User, ClipboardList, MapPin, 
  Loader2, AlertCircle, ShieldCheck, ChevronRight, Award, Trophy, Info, CheckCircle2 
} from "lucide-react";

export default function RfqDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [awardingProposal, setAwardingProposal] = useState<string | number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setAwardingProposal(proposalId);
    setError(null);
    try {
      await apiPost(`/api/proposals/${proposalId}/award`, {
        proposal_id: proposalId,
        rfq_id: rfqId,
      });
      setSuccessMessage("✓ Proposal awarded! Sent to manager for approval.");
      if (id) {
        const response = await apiGet(`/api/rfqs/${id}`);
        const data = response?.rfq ?? response?.data ?? response;
        setRfq(data);
        if (data?.id) {
          fetchRankings(data.id);
        }
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to award proposal");
    } finally {
      setAwardingProposal(null);
    }
  };

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

  return (
    <Layout title="RFQ Detail" subtitle="View technical specifications and company profile before submitting your proposal.">
      <div style={{ width: "100%", paddingBottom: 60 }}>
        
        {/* Navigation & Status Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
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
             <div style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                  ACTIVE
                </div>
                <div style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, background: "var(--ui-bg-card)", color: "var(--ui-text-primary)", border: "1px solid var(--ui-border)" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
            
            {/* Main Content Area (Left) */}
            <div style={{ display: "grid", gap: 24 }}>
              
              {/* RFQ Header & Description */}
              <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 24, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "4px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1 }}>Purchase Requisition</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-muted)" }}>#{rfq.id ? String(rfq.id).substring(0, 8).toUpperCase() : ""}</span>
                  </div>
                  <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "var(--ui-text-primary)", lineHeight: 1.2 }}>{rfq.title}</h1>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, padding: 24, background: "var(--ui-bg-input)", borderRadius: 20, border: "1px solid var(--ui-border-input)" }}>
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
                    const isBuyer = activeCompany?.type === 'buyer';
                    const topRankData = rankings.find(r => r.rank === 1);
                    const isRfqAlreadyAwarded = rankings.some(r => r.is_winner || r.proposal.winner_status === 'awarded' || r.proposal.winner_status === 'approved');

                    return (
                      <div style={{ marginTop: 32, background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 24, padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                          <ShieldCheck size={18} color="#f97316" />
                          <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Participant Rankings & Evaluation</div>
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
                            Kriteria Penilaian Sistem
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 4 }}>
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

                        {/* Rekomendasi Pemenang dari Sistem */}
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
                                  <div style={{ fontWeight: 800, fontSize: 11, color: "#f97316", textTransform: "uppercase", letterSpacing: 0.5 }}>Rekomendasi Sistem (Pemenang Terpilih)</div>
                                  <div style={{ fontWeight: 800, fontSize: 16, color: "var(--ui-text-primary)", marginTop: 4 }}>
                                    {topRankData.proposal.company?.name || "Unknown Vendor"}
                                  </div>
                                </div>
                              </div>
                              {isBuyer && !isRfqAlreadyAwarded && (
                                <button
                                  onClick={() => handleAwardWinner(topRankData.proposal.id, rfq.id)}
                                  disabled={awardingProposal === topRankData.proposal.id}
                                  style={{
                                    background: "var(--huntr-orange)",
                                    border: "none",
                                    borderRadius: 10,
                                    padding: "8px 16px",
                                    color: "#fff",
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: awardingProposal === topRankData.proposal.id ? "wait" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    boxShadow: "0 4px 12px rgba(249,115,22,0.2)"
                                  }}
                                >
                                  {awardingProposal === topRankData.proposal.id ? <Loader2 size={12} className="animate-spin" /> : <Award size={12} />} Award Proposal Ini
                                </button>
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
                            const topProposal = topRankData?.proposal;
                            
                            let dynamicReason = "";
                            if (rankData.rank === 1) {
                              dynamicReason = "Penawaran paling efisien dan ekonomis berdasarkan prioritas kriteria evaluasi sistem (Harga terendah & waktu pengiriman optimal).";
                            } else if (topProposal) {
                              const diffPrice = Number(rankData.proposal.price_offer) - Number(topProposal.price_offer);
                              const percentDiff = ((diffPrice / Number(topProposal.price_offer)) * 100).toFixed(1);
                              dynamicReason = `Harga penawaran lebih mahal ${percentDiff}% (+Rp ${diffPrice.toLocaleString('id-ID')}) dibandingkan peringkat pertama.`;
                            }

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
                                      <button
                                        onClick={() => handleAwardWinner(rankData.proposal.id, rfq.id)}
                                        disabled={awardingProposal === rankData.proposal.id}
                                        style={{
                                          background: idx === 0 ? "var(--huntr-orange)" : "var(--ui-bg-input)",
                                          border: idx === 0 ? "none" : "1px solid var(--ui-border)",
                                          borderRadius: 10,
                                          padding: "6px 12px",
                                          color: idx === 0 ? "#fff" : "var(--ui-text-primary)",
                                          fontSize: 12,
                                          fontWeight: 700,
                                          cursor: awardingProposal === rankData.proposal.id ? "wait" : "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 6
                                        }}
                                      >
                                        {awardingProposal === rankData.proposal.id ? <Loader2 size={12} className="animate-spin" /> : <Award size={12} />} Award
                                      </button>
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
                                  <span><strong>Alasan Peringkat:</strong> {dynamicReason}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--ui-border)" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ui-text-muted)", fontSize: 14 }}>
                     <Calendar size={16} /> Published {new Date(rfq.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ui-text-muted)", fontSize: 14 }}>
                     <MapPin size={16} /> {rfq.company?.address || "Location not specified"}
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
            <div style={{ position: "sticky", top: 24, display: "grid", gap: 24 }}>
              
              {/* Action Card */}
              <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 24, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 13, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Tender Summary</h3>
                
                <div style={{ display: "grid", gap: 16 }}>
                  <SummaryRow label="Total Quantity" value={`${totalItems} Units`} />
                  <SummaryRow label="Tender Duration" value={`${rfq.duration_days ?? 7} day${(rfq.duration_days ?? 7) > 1 ? 's' : ''}`} />
                  <SummaryRow label="Time Remaining" value={getTenderSummary()} />
                </div>

                {activeCompany?.type === 'vendor' && (
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
