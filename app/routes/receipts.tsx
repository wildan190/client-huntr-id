import React, { useState } from "react";
import Layout from "../components/Layout";
import { createReceipt } from "../lib/api";

export default function Receipts() {
  const [form, setForm] = useState({
    po_id: "", received_qty: "", handover_document_path: "handover_docs/signed_document.pdf",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const data = await createReceipt({
        po_id: form.po_id,
        received_qty: Number(form.received_qty),
        handover_document_path: form.handover_document_path,
      });
      setResult(data.receipt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Goods Receipt" subtitle="POST /api/receipts — buyer confirms delivery, creates GR, triggers Final Invoice">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 860 }}>
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
          <Section>Goods Receipt Form</Section>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 4px" }}>
            Buyer confirms physical delivery and submits handover document. The Delivery Order must already be in <code style={{ color: "#fdba74" }}>delivered</code> status.
          </p>

          <Field label="Purchase Order ID (PO ID)" value={form.po_id} onChange={v => set("po_id", v)}
            placeholder="e.g. po-uuid" required type="text" />
          <Field label="Received Quantity" value={form.received_qty} onChange={v => set("received_qty", v)}
            placeholder="e.g. 5" required type="number" />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={lbl}>Handover Document Path</label>
            <input value={form.handover_document_path} onChange={e => set("handover_document_path", e.target.value)}
              required placeholder="handover_docs/signed_document.pdf" style={inputStyle} />
            <span style={{ fontSize: 11, color: "#4b5563" }}>
              Path to the signed handover document stored on server
            </span>
          </div>

          {error && <ErrorBox message={error} />}
          <button type="submit" disabled={loading} style={primaryBtn}>
            {loading ? "Submitting Receipt..." : "✅ Submit Goods Receipt"}
          </button>
        </form>

        {/* Result / Flow info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {result ? (
            <div className="glass-panel" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>✅</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff" }}>Goods Receipt Complete!</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Final Invoice has been released to Finance</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <KV label="Receipt ID" value={result.id ? String(result.id).substring(0, 8).toUpperCase() : ""} />
                <KV label="Received Qty" value={result.received_qty} />
                <KV label="Status" value={<Tag color="green">{result.status}</Tag>} />
                <KV label="DO Status" value={<Tag color="green">received</Tag>} />
                <KV label="PO Status" value={<Tag color="green">completed</Tag>} />
              </div>
              <div style={{ padding: "12px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, fontSize: 12, color: "#6ee7b7" }}>
                Final Invoice has been generated with status <strong>pending_finance</strong>. Finance department will review and approve payment.
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: 24 }}>
              <Section>Goods Receipt Flow</Section>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                {[
                  ["📦", "Vendor releases Delivery Order (DO)"],
                  ["🚚", "DO status: shipped → buyer confirms → delivered"],
                  ["✅", "Buyer submits Goods Receipt (this form)"],
                  ["📄", "DO status → received"],
                  ["🏁", "PO status → completed"],
                  ["🧾", "Final Invoice auto-generated (pending_finance)"],
                  ["💰", "Finance approves → payment forwarded to vendor"],
                ].map(([icon, desc], i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: 12, color: "#d1d5db", lineHeight: "1.5" }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function KV({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12 }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ color: "#f3f4f6", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  const c: Record<string, string> = { yellow: "#fbbf24", green: "#34d399", indigo: "#fdba74" };
  return <span style={{ background: `${c[color]}20`, color: c[color], border: `1px solid ${c[color]}40`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{children}</span>;
}
function Section({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</div>;
}
const lbl: React.CSSProperties = { fontSize: 12, color: "#9ca3af", fontWeight: 500 };
const inputStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#fff",
  outline: "none", width: "100%", boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer",
  border: "none", background: "linear-gradient(135deg,#f97316,#f59e0b)", color: "#fff",
};
interface FieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, value, onChange, type = "text", placeholder, required }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={lbl}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type}
        placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  );
}
function ErrorBox({ message }: { message: string }) {
  return <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171" }}>⚠ {message}</div>;
}
