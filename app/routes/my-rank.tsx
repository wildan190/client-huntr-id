import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { apiGet, apiPost } from "../lib/api";
import { 
  Trophy, TrendingUp, AlertCircle, Loader2, 
  Calendar, Building2, Package, CheckCircle2,
  Medal, Star, Users, Award, Clock
} from "lucide-react";

/**
 * MyRank Page
 * Displays vendor's competitive standing and statistics across all participated tenders.
 */
export default function MyRank() {
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [awardingProposal, setAwardingProposal] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isBuyer = activeCompany?.type === 'buyer';

  useEffect(() => {
    const activeComp = localStorage.getItem("active_company");
    if (activeComp) {
      const comp = JSON.parse(activeComp);
      setActiveCompany(comp);
      fetchRankings(comp.id);
    }
  }, []);

  const fetchRankings = async (companyId: string) => {
    setLoading(true);
    try {
      const result = await apiGet(`/api/proposals/my-rank?company_id=${companyId}`);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch rankings");
    } finally {
      setLoading(false);
    }
  };

  const handleAwardWinner = async (proposalId: string, rfqId: string) => {
    const userSession = localStorage.getItem("user_session");
    const user = userSession ? JSON.parse(userSession) : null;

    setAwardingProposal(proposalId);
    setError(null);
    try {
      const response = await apiPost(`/api/proposals/${proposalId}/award`, {
        proposal_id: proposalId,
        rfq_id: rfqId,
        user_id: user?.id,
      });
      setSuccessMessage("✓ Proposal awarded! Sent to manager for approval.");
      
      // Refresh rankings
      if (activeCompany) {
        setTimeout(() => {
          fetchRankings(activeCompany.id);
          setSuccessMessage(null);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to award proposal");
    } finally {
      setAwardingProposal(null);
    }
  };

  if (loading) {
    return (
      <Layout title="My Rank" subtitle="Analyzing your competitive performance...">
        <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
          <Loader2 className="animate-spin" color="var(--huntr-orange)" size={48} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Rank" subtitle="Review your standing and win rate across all participated tenders.">
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 32, paddingBottom: 60 }}>
        
        {/* Statistics Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          <StatCard 
            icon={<Trophy size={24} color="#f59e0b" />} 
            label="Total Wins" 
            value={data?.total_wins || 0} 
            subtext="Tenders where you offered the lowest price"
            highlight
          />
          <StatCard 
            icon={<Package size={24} color="var(--ui-text-brand)" />} 
            label="Participations" 
            value={data?.total_participations || 0} 
            subtext="Total unique RFQs you have bid on"
          />
          <StatCard 
            icon={<TrendingUp size={24} color="#10b981" />} 
            label="Win Rate" 
            value={data?.total_participations ? `${((data.total_wins / data.total_participations) * 100).toFixed(1)}%` : "0%"} 
            subtext="Success ratio based on your bids"
          />
        </div>

        {/* Detailed Rankings List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ui-text-primary)" }}>Competitive Standings</h2>
              <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", marginTop: 4 }}>Your rank based on the lowest price offered for each tender.</p>
            </div>
          </div>

          {!data?.rankings || data.rankings.length === 0 ? (
            <div style={emptyStateStyle}>
              <Star size={48} color="var(--ui-text-muted)" style={{ marginBottom: 16, opacity: 0.2 }} />
              <div style={{ color: "var(--ui-text-primary)", fontSize: 15, fontWeight: 700 }}>No Ranking Data Yet</div>
              <div style={{ color: "var(--ui-text-muted)", fontSize: 13, marginTop: 4 }}>Submit your first proposal to start tracking your rank.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.rankings.map((item: any, idx: number) => (
                <div key={idx} style={rankingCardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
                    <div style={{
                      ...rankBadgeStyle,
                      background: item.is_winner ? "var(--huntr-gradient)" : "var(--ui-bg-input)",
                      color: item.is_winner ? "#fff" : "var(--ui-text-muted)"
                    }}>
                      {item.is_winner ? <Trophy size={14} /> : item.my_rank}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-brand)", textTransform: "uppercase", letterSpacing: 0.5 }}>{item.buyer_name}</div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: "2px 0 0" }}>{item.rfq_title}</h4>
                      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                        <div style={itemDetailStyle}><Calendar size={12} /> {new Date(item.submitted_at).toLocaleDateString()}</div>
                        <div style={itemDetailStyle}><Users size={12} /> {item.total_participants} Participants</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>Your Offer</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ui-text-primary)" }}>Rp {Number(item.my_price).toLocaleString("id-ID")}</div>
                    </div>
                    
                    <div style={{ width: 120, textAlign: "right" }}>
                      {item.is_winner ? (
                        <div style={winnerBadgeStyle}><CheckCircle2 size={14} /> Winner</div>
                      ) : (
                        <div style={rankTextStyle}>Rank #{item.my_rank}</div>
                      )}
                    </div>

                    {/* Award Button - Only if buyer and not yet awarded */}
                    {isBuyer && !item.is_winner && item.winner_status !== 'awarded' && (
                      <button
                        onClick={() => handleAwardWinner(item.proposal_id, item.rfq_id)}
                        disabled={awardingProposal === item.proposal_id}
                        style={{
                          background: "var(--huntr-orange)",
                          border: "none",
                          borderRadius: 12,
                          padding: "8px 16px",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: awardingProposal === item.proposal_id ? "wait" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          opacity: awardingProposal === item.proposal_id ? 0.7 : 1,
                          transition: "all 0.2s ease"
                        }}
                      >
                        {awardingProposal === item.proposal_id ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Awarding...
                          </>
                        ) : (
                          <>
                            <Award size={12} /> Award
                          </>
                        )}
                      </button>
                    )}

                    {/* Awarded Badge */}
                    {item.winner_status === 'awarded' && (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 10,
                        background: "rgba(251, 146, 60, 0.1)",
                        color: "#f97316",
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase"
                      }}>
                        <Clock size={12} /> Pending Approval
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div style={errorBoxStyle}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {successMessage && (
          <div style={{...errorBoxStyle, background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)", color: "#10b981"}}>
            {successMessage}
          </div>
        )}
      </div>
    </Layout>
  );
}

// ── Components & Helpers ───────────────────────────────────────────────────

function StatCard({ icon, label, value, subtext, highlight }: any) {
  return (
    <div style={{
      ...cardStyle,
      border: highlight ? "1px solid var(--ui-text-brand)" : "1px solid var(--ui-border)",
      background: highlight ? "var(--ui-bg-badge)" : "var(--ui-bg-card)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={statIconStyle}>{icon}</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "var(--ui-text-primary)" }}>{value}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ui-text-primary)", textTransform: "uppercase" }}>{label}</div>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--ui-text-muted)", lineHeight: 1.4 }}>{subtext}</p>
      </div>
    </div>
  );
}

// ── Shared Styles ──────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
  borderRadius: 20, padding: 24, display: "flex", flexDirection: "column",
};

const rankingCardStyle: React.CSSProperties = {
  background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)",
  borderRadius: 20, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
  transition: "all 0.2s ease"
};

const statIconStyle: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 12, background: "var(--ui-bg-input)",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const rankBadgeStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 16, fontWeight: 900
};

const winnerBadgeStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10,
  background: "rgba(34, 197, 94, 0.1)", color: "#10b981", fontSize: 12, fontWeight: 800, textTransform: "uppercase"
};

const rankTextStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase"
};

const itemDetailStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, color: "var(--ui-text-secondary)", fontSize: 12, fontWeight: 600
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: "center", padding: 80, background: "var(--ui-bg-card)",
  borderRadius: 24, border: "1px dashed var(--ui-border)"
};

const errorBoxStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
  borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171",
  display: "flex", alignItems: "center", gap: 8, fontWeight: 600
};
