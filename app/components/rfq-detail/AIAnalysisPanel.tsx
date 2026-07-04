import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface AIAnalysisPanelProps {
  showAiPanel: boolean;
  aiRankLoading: boolean;
  aiRankError: string | null;
  aiRankings: any;
}

export function AIAnalysisPanel({ showAiPanel, aiRankLoading, aiRankError, aiRankings }: AIAnalysisPanelProps) {
  if (!showAiPanel) return null;

  return (
    <div style={{
      marginTop: 16,
      background: "linear-gradient(135deg, rgba(168,85,247,0.07), rgba(99,102,241,0.04))",
      border: "1px solid rgba(168,85,247,0.25)",
      borderRadius: 12,
      padding: 12,
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-primary)" }}>Huntr AI Assessment</div>
          <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 600 }}>Analisis multikriteria: harga 40% · delivery 30% · garansi 20% · kelengkapan 10%</div>
        </div>
      </div>

      {aiRankLoading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0", color: "var(--ui-text-muted)" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite", color: "#a855f7" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Huntr AI sedang mengevaluasi semua proposal...</span>
        </div>
      ) : aiRankError ? (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: 12, color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
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
                borderRadius: 8,
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: isAiWinner ? "linear-gradient(135deg, #a855f7, #6366f1)" : "var(--ui-bg-card)",
                      color: isAiWinner ? "#fff" : "var(--ui-text-muted)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13,
                    }}>#{rank.rank}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ui-text-primary)" }}>
                        {rank.proposal?.company?.name || "Unknown Vendor"}
                      </div>
                      {isAiWinner && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.06em" }}>✦ AI Recommendation</div>
                      )}
                    </div>
                  </div>
                  {/* Total score */}
                  <div style={{
                    padding: "4px 12px", borderRadius: 12,
                    background: isAiWinner ? "rgba(168,85,247,0.15)" : "var(--ui-bg-card)",
                    border: isAiWinner ? "1px solid rgba(168,85,247,0.3)" : "1px solid var(--ui-border)",
                    fontSize: 14, fontWeight: 700,
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
                          <span style={{ fontSize: 10, fontWeight: 700, color: isAiWinner ? "#a855f7" : "var(--ui-text-secondary)" }}>{rank.score_breakdown[key] ?? "—"}</span>
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
  );
}