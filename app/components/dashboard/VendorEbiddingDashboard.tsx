import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "../Layout";
import CurrencyWidget from "../CurrencyWidget";
import WeatherWidget from "../WeatherWidget";
import { SummaryWidget, MiniStat } from "./SummaryWidget";
import { apiGet } from "../../lib/api";
import { ClipboardList, Trophy, Timer } from "lucide-react";

const VENDOR_DASHBOARD_HINTS = [
  "Monitoring tender aktif",
  "Draft proposal tersimpan",
  "Pengiriman submisi terdekat",
];

function getRfqDeadline(rfq: any): number | null {
  const base = rfq?.approved_at || rfq?.created_at;
  if (!base) return null;
  const durationDays = Number(rfq?.duration_days || 7);
  const start = new Date(base);
  if (Number.isNaN(start.getTime())) return null;
  return start.getTime() + (durationDays * 24 * 60 * 60 * 1000);
}

function formatCountdown(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "00j 00m 00d";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) {
    return `${days}h ${String(hours).padStart(2, "0")}j ${String(minutes).padStart(2, "0")}m`;
  }
  return `${String(hours).padStart(2, "0")}j ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}d`;
}

export function VendorEbiddingDashboard({ user, activeCompany }: { user: any, activeCompany: any }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openRfqs, setOpenRfqs] = useState<any[]>([]);
  const [vendorProposals, setVendorProposals] = useState<any[]>([]);
  const [vendorRankings, setVendorRankings] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeCompany?.id) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [rfqRes, proposalRes, rankRes] = await Promise.all([
          apiGet("/api/rfqs?status=active"),
          apiGet(`/api/proposals?company_id=${activeCompany.id}`),
          apiGet(`/api/proposals/my-rank?company_id=${activeCompany.id}`),
        ]);

        if (cancelled) return;

        setOpenRfqs(Array.isArray(rfqRes) ? rfqRes : rfqRes.data || []);
        setVendorProposals(Array.isArray(proposalRes) ? proposalRes : proposalRes.data || []);
        setVendorRankings(Array.isArray(rankRes) ? rankRes : rankRes.rankings || []);
      } catch (err) {
        console.error("Failed to load vendor dashboard", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeCompany?.id]);

  const proposalMap = new Map(vendorProposals.map((proposal: any) => [String(proposal.rfq_id), proposal]));
  const rankingMap = new Map(vendorRankings.map((ranking: any) => [String(ranking.rfq_id || ranking.proposal?.rfq_id), ranking]));
  const participatedCount = new Set(vendorRankings.map((ranking: any) => String(ranking.rfq_id || ranking.proposal?.rfq_id))).size || new Set(vendorProposals.map((proposal: any) => String(proposal.rfq_id))).size;
  const wins = vendorRankings.filter((ranking: any) => ranking.is_winner || ["awarded", "approved"].includes(String(ranking.proposal?.winner_status || ranking.winner_status || ""))).length;
  const winRate = participatedCount > 0 ? Math.round((wins / participatedCount) * 100) : 0;

  const deadlines = openRfqs
    .map((rfq: any) => getRfqDeadline(rfq))
    .filter((value: number | null): value is number => typeof value === "number")
    .sort((a: number, b: number) => a - b);
  const nearestDeadline = deadlines[0] || null;
  const countdown = nearestDeadline ? formatCountdown(nearestDeadline - now) : "Belum ada tender aktif";

  const tableRows = [...openRfqs]
    .sort((a: any, b: any) => (getRfqDeadline(a) || Number.MAX_SAFE_INTEGER) - (getRfqDeadline(b) || Number.MAX_SAFE_INTEGER))
    .slice(0, 12)
    .map((rfq: any) => {
      const proposal = proposalMap.get(String(rfq.id));
      const ranking = rankingMap.get(String(rfq.id));
      const submittedAt = proposal?.created_at ? new Date(proposal.created_at).toLocaleDateString("id-ID") : "-";
      const deadline = getRfqDeadline(rfq);
      const deadlineText = deadline ? new Date(deadline).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";
      const status = proposal
        ? (["awarded", "approved"].includes(String(proposal.winner_status)) ? "Awarded" : "Submitted")
        : "Draft";

      return {
        rfq,
        proposal,
        ranking,
        submittedAt,
        deadlineText,
        status,
      };
    });

  return (
    <Layout title="Vendor E-Bidding Dashboard" subtitle="Pantau tender aktif, draft proposal, dan submisi yang sedang berjalan.">
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 24, boxSizing: "border-box" }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "stretch" }}>
          <WeatherWidget embedded />
          <CurrencyWidget embedded />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <SummaryWidget
            label="Total Tender Diikuti"
            value={loading ? "..." : String(participatedCount)}
            hint="Tender unik yang sudah pernah Anda submit"
            icon={ClipboardList}
          />
          <SummaryWidget
            label="Menang Tender"
            value={loading ? "..." : `${wins}`}
            hint={`${winRate}% win rate dari tender yang diikuti`}
            icon={Trophy}
            accent="green"
          />
          <SummaryWidget
            label="Sisa Waktu Submisi Terdekat"
            value={loading ? "..." : countdown}
            hint="Deadline RFQ aktif paling dekat"
            icon={Timer}
            accent="blue"
          />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 20, alignItems: "start" }}>
          <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: "1px solid var(--ui-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Modul E-Bidding</div>
                  <h2 style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 900, color: "var(--ui-text-primary)" }}>Draft dan Pengajuan Proposal</h2>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {VENDOR_DASHBOARD_HINTS.map((item) => (
                    <span key={item} style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(249,115,22,0.1)", color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ui-text-muted)" }}>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--ui-border)" }}>Tender</th>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--ui-border)" }}>Buyer</th>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--ui-border)" }}>Status</th>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--ui-border)" }}>Submisi</th>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--ui-border)" }}>Deadline</th>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--ui-border)" }} />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--ui-text-muted)" }}>Memuat tender aktif...</td>
                    </tr>
                  ) : tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--ui-text-muted)" }}>Belum ada tender aktif yang bisa dipantau.</td>
                    </tr>
                  ) : (
                    tableRows.map(({ rfq, proposal, ranking, submittedAt, deadlineText, status }) => (
                      <tr key={rfq.id} style={{ borderBottom: "1px solid var(--ui-border-subtle)" }}>
                        <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 800, color: "var(--ui-text-primary)", lineHeight: 1.4, fontSize: 13 }}>{rfq.title}</div>
                          <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 2 }}>{rfq.items?.length || 0} item</div>
                        </td>
                        <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 700, color: "var(--ui-text-primary)", fontSize: 13 }}>{rfq.company?.name || "Buyer"}</div>
                          <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 2 }}>RFQ {String(rfq.id).slice(0, 8)}</div>
                        </td>
                        <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 800,
                            background: status === "Draft" ? "rgba(59,130,246,0.12)" : status === "Submitted" ? "rgba(249,115,22,0.12)" : "rgba(34,197,94,0.12)",
                            color: status === "Draft" ? "#60a5fa" : status === "Submitted" ? "#f59e0b" : "#34d399",
                          }}>
                            {status}
                          </span>
                          <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 6 }}>
                            {proposal ? `Winner: ${proposal.winner_status || "submitted"}` : "No proposal"}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 700, color: "var(--ui-text-primary)", fontSize: 13 }}>{proposal ? `Rp ${Number(proposal.price_offer || 0).toLocaleString("id-ID")}` : "Draft"}</div>
                          <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 2 }}>
                            {ranking ? `Rank #${ranking.rank}` : submittedAt === "-" ? "Not submitted" : `Sent ${submittedAt}`}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 700, color: "var(--ui-text-primary)", fontSize: 13 }}>{deadlineText}</div>
                          <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 2 }}>
                            {proposal ? `Sent ${submittedAt}` : "Ready"}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", verticalAlign: "top", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => navigate("/proposals", { state: { rfqId: rfq.id } })}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid rgba(249,115,22,0.22)",
                              background: "rgba(249,115,22,0.08)",
                              color: "#f59e0b",
                              fontSize: 11,
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            {proposal ? "Lihat" : "Buka"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Company</div>
              <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4, color: "var(--ui-text-primary)" }}>{activeCompany?.name}</div>
              <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 4 }}>{user?.name}</div>
            </div>

            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Quick Stats</div>
              <MiniStat label="Open Tenders" value={String(openRfqs.length)} />
              <MiniStat label="Proposal Drafts" value={String(Math.max(openRfqs.length - vendorProposals.length, 0))} />
              <MiniStat label="Submitted Proposals" value={String(vendorProposals.length)} />
            </div>

            <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Submission Focus</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Review item scope and deadline first",
                  "Keep draft pricing ready before closing time",
                  "Open proposal detail from the table when the tender is live",
                ].map((item) => (
                  <div key={item} style={{ fontSize: 12, lineHeight: 1.4, color: "var(--ui-text-secondary)", padding: "6px 10px", borderRadius: 10, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.08)" }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
