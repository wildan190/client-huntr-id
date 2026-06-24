import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import {
  ShieldCheck, ShieldX, FileText, Truck, ClipboardList,
  Building, Calendar, CheckCircle2, AlertCircle, ExternalLink,
  Loader2, User, Clock, Hash, ReceiptText
} from "lucide-react";
import { apiGet } from "../lib/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SignatureEntry {
  role: string;
  label: string;
  signer_name?: string;
  signer_position?: string;
  signed_at?: string;
  is_signed: boolean;
}

interface VerifyResult {
  valid: boolean;
  doc_type: "invoice" | "do" | "bast";
  doc_number: string;
  doc_label: string;
  issued_at?: string;
  status?: string;
  tracking_number?: string;
  vendor_name: string;
  buyer_name: string;
  signatures: SignatureEntry[];
}

// ─── Config ───────────────────────────────────────────────────────────────────
const DOC_CONFIG: Record<string, { icon: React.FC<any>; color: string; accent: string; bg: string }> = {
  invoice: { icon: ReceiptText,    color: "#f59e0b", accent: "#fef3c7", bg: "rgba(245,158,11,0.08)" },
  do:      { icon: Truck,          color: "#3b82f6", accent: "#dbeafe", bg: "rgba(59,130,246,0.08)"  },
  bast:    { icon: ClipboardList,  color: "#8b5cf6", accent: "#ede9fe", bg: "rgba(139,92,246,0.08)"  },
};

// ─── Signature Card ───────────────────────────────────────────────────────────
const SignatureCard = ({ sig }: { sig: SignatureEntry }) => (
  <div style={{
    padding: "18px 20px", borderRadius: 16,
    background: sig.is_signed ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${sig.is_signed ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
    display: "flex", flexDirection: "column", gap: 8,
  }}>
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {sig.label}
      </span>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800,
        background: sig.is_signed ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
        color: sig.is_signed ? "#22c55e" : "rgba(255,255,255,0.3)",
        border: `1px solid ${sig.is_signed ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
      }}>
        {sig.is_signed ? <CheckCircle2 size={10} /> : <Clock size={10} />}
        {sig.is_signed ? "SIGNED" : "PENDING"}
      </span>
    </div>

    {/* Signer info */}
    {sig.signer_name && (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <User size={15} color="rgba(255,255,255,0.4)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>{sig.signer_name}</div>
          {sig.signer_position && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{sig.signer_position}</div>
          )}
        </div>
      </div>
    )}

    {/* Timestamp */}
    {sig.signed_at && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#22c55e", fontWeight: 600 }}>
        <Clock size={12} />
        {new Date(sig.signed_at).toLocaleString("en-US", {
          year: "numeric", month: "long", day: "numeric",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        })}
      </div>
    )}

    {!sig.is_signed && (
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>
        Awaiting signature…
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VerifyPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const docType = params.get("type") ?? "";
  const docId   = params.get("id") ?? "";
  const role    = params.get("role") ?? "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (docType && docId) {
      verify();
    }
  }, [docType, docId]);

  const verify = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qs = new URLSearchParams({ type: docType, id: docId, ...(role ? { role } : {}) });
      const data = await apiGet<VerifyResult>(`/api/verify?${qs}`);
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? "Document not found or verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? (DOC_CONFIG[result.doc_type] ?? DOC_CONFIG.invoice) : null;
  const DocIcon = cfg?.icon ?? FileText;
  const allSigned = result?.signatures.every(s => s.is_signed) ?? false;
  const noneSigned = result?.signatures.every(s => !s.is_signed) ?? false;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
    }}>
      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
            }}>
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#f1f5f9" }}>huntr.id</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Document Verification</div>
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
            Login <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 64px" }}>
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Loader2 size={40} color="#22c55e" style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: 0, fontWeight: 600 }}>Verifying document authenticity…</p>
          </div>
        )}

        {/* No params */}
        {!loading && !docType && !docId && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
            }}>
              <ShieldCheck size={36} color="rgba(255,255,255,0.2)" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9", margin: "0 0 12px" }}>Document Verification</h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, margin: 0, maxWidth: 400, marginInline: "auto" }}>
              This page verifies the authenticity of documents from huntr.id. Scan a QR code on an Invoice, Delivery Order, or BAST to verify.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(239,68,68,0.15)",
            }}>
              <ShieldX size={44} color="#ef4444" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#f87171", marginBottom: 8 }}>Verification Failed</div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0, maxWidth: 420, marginInline: "auto" }}>{error}</p>
            </div>
            <div style={{
              padding: "16px 24px", borderRadius: 16,
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <AlertCircle size={18} color="#f87171" />
              <span style={{ fontSize: 13, color: "#f87171", fontWeight: 600 }}>
                This document could not be found or the QR code is invalid.
              </span>
            </div>
          </div>
        )}

        {/* Success result */}
        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Validity Banner */}
            <div style={{
              padding: "28px 32px", borderRadius: 24, textAlign: "center",
              background: allSigned
                ? "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.06))"
                : "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.04))",
              border: `1px solid ${allSigned ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
              boxShadow: allSigned ? "0 8px 32px rgba(34,197,94,0.1)" : "none",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
                background: allSigned ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.12)",
                border: `2px solid ${allSigned ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 32px ${allSigned ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.15)"}`,
              }}>
                {allSigned
                  ? <ShieldCheck size={34} color="#22c55e" />
                  : <ShieldCheck size={34} color="#f59e0b" />
                }
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: allSigned ? "#22c55e" : "#f59e0b", marginBottom: 6 }}>
                {allSigned ? "Document Verified ✓" : "Document Authentic — Partial Signatures"}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                {allSigned
                  ? "All signatures are valid and this document is fully executed."
                  : "This document is authentic but not all signatures are complete yet."}
              </div>
            </div>

            {/* Document Info */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: cfg?.bg, border: `1px solid ${cfg?.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <DocIcon size={22} color={cfg?.color} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
                    {result.doc_label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: cfg?.color, letterSpacing: "-0.5px" }}>
                    {result.doc_number}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                {[
                  { icon: Building, label: "Vendor",     value: result.vendor_name, color: "#f97316" },
                  { icon: Building, label: "Buyer",      value: result.buyer_name,  color: "#3b82f6" },
                  { icon: Calendar, label: "Issued At",  value: result.issued_at ? new Date(result.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—", color: "#8b5cf6" },
                  ...(result.status ? [{ icon: Hash, label: "Status", value: result.status.toUpperCase(), color: "#06b6d4" }] : []),
                  ...(result.tracking_number ? [{ icon: Truck, label: "Tracking No.", value: result.tracking_number, color: "#22c55e" }] : []),
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{
                    padding: "12px 14px", borderRadius: 12,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon size={12} color={color} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: 24,
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={16} color="#22c55e" />
                Signature Verification
                <span style={{
                  marginLeft: "auto", fontSize: 11, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 20,
                  background: allSigned ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                  color: allSigned ? "#22c55e" : "#f59e0b",
                  border: `1px solid ${allSigned ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
                }}>
                  {result.signatures.filter(s => s.is_signed).length}/{result.signatures.length} signed
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.signatures.map((sig, i) => (
                  <SignatureCard key={i} sig={sig} />
                ))}
              </div>
            </div>

            {/* Platform attestation */}
            <div style={{
              padding: "14px 20px", borderRadius: 14,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <ShieldCheck size={16} color="rgba(255,255,255,0.2)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                Verified by <strong style={{ color: "rgba(255,255,255,0.5)" }}>huntr.id</strong> Procurement Platform · This verification is generated in real-time from our database.
              </span>
            </div>
          </div>
        )}
      </main>

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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
