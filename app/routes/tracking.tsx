import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import {
  Search, Package, Truck, CheckCircle2, Clock, FileText,
  CreditCard, MapPin, Building, Calendar, ArrowRight, Loader2,
  AlertCircle, RefreshCw, ExternalLink
} from "lucide-react";
import { publicTrackShipment } from "../lib/api";
import { getAssetUrl } from "../lib/assets";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TrackingStep {
  status: string;
  label: string;
  timestamp: string | null;
  completed: boolean;
  actor_name?: string;
  note?: string;
  tracking_numbers?: string[];
  do_numbers?: string[];
}

interface TrackingResult {
  po_number: string;
  current_status: string;
  current_label: string;
  vendor_name: string;
  buyer_name: string;
  order_date: string;
  tracking_numbers: string[];
  timeline: TrackingStep[];
}

// ─── Step Config ──────────────────────────────────────────────────────────────
const STEP_CONFIG: Record<string, { icon: React.FC<any>; color: string; bgClass: string }> = {
  issued:     { icon: FileText,     color: "#f59e0b", bgClass: "rgba(245,158,11,0.15)" },
  confirmed:  { icon: CheckCircle2, color: "#f97316", bgClass: "rgba(249,115,22,0.15)" },
  paid:       { icon: CreditCard,   color: "#3b82f6", bgClass: "rgba(59,130,246,0.15)" },
  packing:    { icon: Package,      color: "#8b5cf6", bgClass: "rgba(139,92,246,0.15)" },
  in_transit: { icon: Truck,        color: "#06b6d4", bgClass: "rgba(6,182,212,0.15)"  },
  delivered:  { icon: CheckCircle2, color: "#22c55e", bgClass: "rgba(34,197,94,0.15)"  },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  const cfg = STEP_CONFIG[status] ?? STEP_CONFIG.issued;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 800,
      background: cfg.bgClass, color: cfg.color,
      border: `1px solid ${cfg.color}40`,
    }}>
      <cfg.icon size={14} />
      {label}
    </span>
  );
};

// ─── Timeline Step ────────────────────────────────────────────────────────────
const TimelineStep = ({ step, isLast }: { step: TrackingStep; isLast: boolean }) => {
  const cfg = STEP_CONFIG[step.status] ?? STEP_CONFIG.issued;
  const Icon = cfg.icon;

  return (
    <div style={{ display: "flex", gap: 16, position: "relative" }}>
      {/* Vertical line */}
      {!isLast && (
        <div style={{
          position: "absolute", left: 19, top: 40, width: 2, bottom: -16,
          background: step.completed ? `${cfg.color}40` : "rgba(255,255,255,0.06)",
          transition: "background 0.4s ease"
        }} />
      )}

      {/* Circle */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
        background: step.completed ? cfg.color : "rgba(255,255,255,0.05)",
        border: `2px solid ${step.completed ? cfg.color : "rgba(255,255,255,0.1)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: step.completed ? `0 0 0 4px ${cfg.color}20` : "none",
        transition: "all 0.4s ease",
        position: "relative", zIndex: 1,
      }}>
        <Icon size={16} color={step.completed ? "#fff" : "rgba(255,255,255,0.2)"} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 24 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          marginTop: 8,
        }}>
          <span style={{
            fontSize: 14, fontWeight: 800,
            color: step.completed ? "var(--ui-text-primary, #f1f5f9)" : "rgba(255,255,255,0.25)",
            transition: "color 0.4s ease",
          }}>
            {step.label}
          </span>
          {step.completed && (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
              background: cfg.bgClass, color: cfg.color, textTransform: "uppercase"
            }}>
              Done
            </span>
          )}
        </div>

        {step.timestamp && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2, fontWeight: 500 }}>
            {new Date(step.timestamp).toLocaleString("en-US", {
              year: "numeric", month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit"
            })}
            {step.actor_name && (
              <span style={{ color: cfg.color, marginLeft: 6, fontWeight: 700 }}>
                · by {step.actor_name}
              </span>
            )}
          </div>
        )}

        {step.note && (
          <div style={{
            marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.5)",
            padding: "4px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8,
            borderLeft: `3px solid ${cfg.color}`,
            display: "inline-block"
          }}>
            {step.note}
          </div>
        )}

        {step.tracking_numbers && step.tracking_numbers.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {step.tracking_numbers.map((resi, i) => (
              <span key={i} style={{
                fontSize: 11, fontWeight: 800, fontFamily: "monospace",
                padding: "3px 10px", borderRadius: 8,
                background: "rgba(6,182,212,0.12)", color: "#06b6d4",
                border: "1px solid rgba(6,182,212,0.25)"
              }}>
                🚚 Resi: {resi}
              </span>
            ))}
          </div>
        )}

        {!step.completed && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 4, fontStyle: "italic" }}>
            Pending…
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TrackingPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [poInput, setPoInput] = useState(params.get("po_number") ?? "");
  const [resiInput, setResiInput] = useState(params.get("tracking_number") ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if URL has params
  useEffect(() => {
    const pn = params.get("po_number");
    const tn = params.get("tracking_number");
    if (pn || tn) {
      handleSearch(pn ?? undefined, tn ?? undefined);
    }
  }, []);

  const handleSearch = async (pn?: string, tn?: string) => {
    const p = pn ?? poInput.trim();
    const t = tn ?? resiInput.trim();
    if (!p && !t) {
      setError("Please enter a PO Number or Tracking Number (Resi).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);
    try {
      const data = await publicTrackShipment({ po_number: p || undefined, tracking_number: t || undefined });
      setResult(data as TrackingResult);
    } catch (err: any) {
      setError(err.message || "Shipment not found. Please check your PO number or tracking number.");
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = result?.timeline.filter(s => s.completed).length ?? 0;
  const totalSteps = result?.timeline.length ?? 6;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
      padding: "0",
    }}>
      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#f97316,#f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
            }}>
              <Truck size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#f1f5f9" }}>huntr.id</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Order Tracking</div>
            </div>
          </div>
          <a
            href="/login"
            style={{
              fontSize: 12, fontWeight: 700, color: "#fb923c",
              textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
              padding: "6px 14px", borderRadius: 10,
              background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)"
            }}
          >
            Login to Dashboard <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* ── Hero Search ── */}
      <section style={{
        padding: "64px 24px 48px",
        background: "linear-gradient(180deg, rgba(249,115,22,0.04) 0%, transparent 100%)",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px",
            borderRadius: 20, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
            fontSize: 11, fontWeight: 800, color: "#f97316", textTransform: "uppercase",
            letterSpacing: "0.08em", marginBottom: 24,
          }}>
            <MapPin size={12} /> Real-Time Order Tracking
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, color: "#f1f5f9",
            margin: "0 0 12px", lineHeight: 1.15,
            background: "linear-gradient(135deg,#f1f5f9,#94a3b8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Track Your Shipment
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: "0 0 40px", fontWeight: 500, lineHeight: 1.6 }}>
            Enter your PO Number or Tracking Number (Resi) to see real-time delivery status and progress.
          </p>

          {/* Search Form */}
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24, padding: 24, backdropFilter: "blur(20px)",
          }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {/* PO Number */}
              <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
                <FileText size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="PO Number (e.g. PO-2024-001)"
                  value={poInput}
                  onChange={e => setPoInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  style={{
                    width: "100%", padding: "14px 16px 14px 44px",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14, color: "#f1f5f9", fontSize: 14, outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                />
              </div>

              {/* Separator */}
              <div style={{ display: "flex", alignItems: "center", color: "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 700 }}>OR</div>

              {/* Resi */}
              <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
                <Truck size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Tracking No. / Nomor Resi"
                  value={resiInput}
                  onChange={e => setResiInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  style={{
                    width: "100%", padding: "14px 16px 14px 44px",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14, color: "#f1f5f9", fontSize: 14, outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                />
              </div>

              {/* Search Button */}
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                style={{
                  padding: "14px 28px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg,#f97316,#f59e0b)",
                  color: "#fff", fontWeight: 800, fontSize: 14, cursor: loading ? "wait" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 20px rgba(249,115,22,0.35)", transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                {loading ? "Searching…" : "Track"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        {/* Error */}
        {error && (
          <div style={{
            padding: "16px 20px", borderRadius: 16,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171", display: "flex", alignItems: "center", gap: 12, marginBottom: 24
          }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", gap: 20,
            alignItems: "center",
          }}>
            <Loader2 size={32} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 600 }}>Looking up shipment…</span>
          </div>
        )}

        {/* Results card */}
        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Summary Card */}
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: 28, backdropFilter: "blur(20px)",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Purchase Order</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.5px" }}>{result.po_number}</div>
                </div>
                <StatusBadge status={result.current_status} label={result.current_label} />
              </div>

              {/* Meta info */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
                {[
                  { icon: Building, label: "Vendor", value: result.vendor_name, color: "#f97316" },
                  { icon: Building, label: "Buyer",  value: result.buyer_name,  color: "#3b82f6" },
                  { icon: Calendar, label: "Order Date", value: result.order_date, color: "#8b5cf6" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{
                    padding: "12px 16px", borderRadius: 14,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon size={13} color={color} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking Numbers */}
              {result.tracking_numbers.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Tracking Number(s) / Resi</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.tracking_numbers.map((resi, i) => (
                      <span key={i} style={{
                        fontSize: 13, fontWeight: 800, fontFamily: "monospace",
                        padding: "6px 14px", borderRadius: 10,
                        background: "rgba(6,182,212,0.1)", color: "#06b6d4",
                        border: "1px solid rgba(6,182,212,0.25)"
                      }}>
                        🚚 {resi}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Overall Progress
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>{progressPct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, #f97316, #22c55e)",
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, fontWeight: 600 }}>
                  {completedSteps} of {totalSteps} steps completed
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: 28, backdropFilter: "blur(20px)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={16} color="#f59e0b" />
                Delivery Timeline
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {result.timeline.map((step, i) => (
                  <TimelineStep
                    key={step.status}
                    step={step}
                    isLast={i === result.timeline.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Search again */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => { setResult(null); setPoInput(""); setResiInput(""); setSearched(false); setError(null); }}
                style={{
                  background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                  padding: "10px 20px", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s ease"
                }}
              >
                <RefreshCw size={14} /> Search Another Shipment
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && !searched && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
            }}>
              <Truck size={32} color="rgba(249,115,22,0.4)" />
            </div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 14, margin: 0, fontWeight: 500 }}>
              Enter a PO Number or Tracking Number above to start tracking
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 24px", textAlign: "center",
      }}>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>
          © {new Date().getFullYear()} huntr.id — Procurement & Supply Chain Platform
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(249,115,22,0.5) !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
