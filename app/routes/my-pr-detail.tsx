import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { getRfq } from "../lib/api";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Package, User, ClipboardList, MapPin, Loader2 } from "lucide-react";

function getStatusStyle(status: string) {
  switch (status) {
    case "pending_approval": return { bg: "rgba(249,115,22,0.1)", color: "#f97316", label: "Pending Approval", icon: Clock };
    case "approved": return { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Approved", icon: CheckCircle2 };
    case "active": return { bg: "rgba(249,115,22,0.1)", color: "#fb923c", label: "Open Tender", icon: Package };
    case "rejected": return { bg: "rgba(239,68,68,0.1)", color: "#f87171", label: "Rejected", icon: Clock };
    default: return { bg: "rgba(107,114,128,0.1)", color: "#9ca3af", label: status, icon: Clock };
  }
}

export default function MyPurchaseRequisitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Purchase requisition not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    getRfq(Number(id))
      .then((response) => {
        const rfq = response?.rfq ?? response?.data ?? response;
        setRequest(rfq);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load PR detail. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const totalItems = request?.items?.reduce((sum: number, item: any) => {
    const price = item?.estimated_price || 0;
    return sum + price * (item.qty || 1);
  }, 0);

  const status = request ? getStatusStyle(request.status) : null;
  const StatusIcon = status?.icon;

  return (
    <Layout title="Purchase Requisition Detail" subtitle="Review PR metadata, approval status, and item scope.">
      <style>{`
        @media (max-width: 768px) {
          .pr-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .pr-detail-aside {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
          .pr-detail-sticky {
            position: static !important;
            top: auto !important;
          }
        }
      `}</style>
      <div style={{ padding: 24, maxWidth: 1040, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate("/my-pr")}
          style={{
            marginBottom: 24,
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e5e7eb",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={18} style={{ marginRight: 8 }} /> Back to PR list
        </button>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Loader2 className="animate-spin" size={32} color="#f59e0b" />
          </div>
        ) : error ? (
          <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: 28, color: "#fca5a5" }}>
            {error}
          </div>
        ) : request ? (
          <div style={{ display: "grid", gap: 28 }}>
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fb923c", textTransform: "uppercase", letterSpacing: 1.1 }}>PR #{request.id}</span>
                  <h1 style={{ margin: "12px 0 0", fontSize: 32, color: "#f8fafc" }}>{request.title}</h1>
                  <p style={{ margin: "10px 0 0", color: "#9ca3af", maxWidth: 720, lineHeight: 1.7 }}>{request.description || "No description provided."}</p>
                </div>
                <div style={{ alignSelf: "center" }}>
                  <div style={{ background: status.bg, color: status.color, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 16, fontWeight: 700, fontSize: 13 }}>
                    {StatusIcon && <StatusIcon size={16} />} {status.label}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
                <MetaCard icon={<User size={18} />} label="Requested by" value={request.user?.name || "Unknown"} />
                <MetaCard icon={<MapPin size={18} />} label="Company" value={request.company?.name || "Unknown"} />
                <MetaCard icon={<Calendar size={18} />} label="Submitted" value={new Date(request.created_at).toLocaleString()} />
                <MetaCard icon={<Calendar size={18} />} label="Approval" value={request.approved_at ? new Date(request.approved_at).toLocaleString() : "Pending"} />
              </div>
            </div>

            <div className="pr-detail-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 24 }}>
              <section style={{ padding: 28, borderRadius: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, color: "#94a3b8", fontWeight: 700 }}>Item Summary</div>
                    <h2 style={{ margin: "10px 0 0", fontSize: 20, color: "#f8fafc" }}>{request.items?.length || 0} items requested</h2>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9ca3af", fontSize: 12 }}>
                    <Package size={16} /> Total estimated
                  </div>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                  {(request.items || []).map((item: any) => (
                    <div key={item.id || item.catalogue_id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: 18, borderRadius: 20, background: "rgba(15,23,42,0.85)", border: "1px solid rgba(148,163,184,0.1)" }}>
                      <div>
                        <div style={{ color: "#f8fafc", fontWeight: 700 }}>{item.catalogue?.name || `Item ${item.catalogue_id}`}</div>
                        <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>{item.catalogue?.item_code || "No code"}</div>
                        <div style={{ color: "#cbd5e1", fontSize: 12, marginTop: 8 }}>Qty: {item.qty} · Expected {item.expected_date}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "#f8fafc" }}>IDR {Number(item.estimated_price || 0).toLocaleString()}</div>
                        <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>Unit Price</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="pr-detail-aside" style={{ display: "grid", gap: 20 }}>
                <div className="pr-detail-sticky" style={{ padding: 24, borderRadius: 28, background: "var(--ui-bg-card)", border: `1px solid var(--ui-border)` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#94a3b8", marginBottom: 16 }}>Delivery Address</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <DetailRow label="Address" value={request.company?.address || "Not specified"} />
                    <DetailRow label="City" value={request.company?.city || "Not specified"} />
                    <DetailRow label="Regency" value={request.company?.regency || "Not specified"} />
                    <DetailRow label="Province" value={request.company?.provincy_country || "Not specified"} />
                    <DetailRow label="Zip Code" value={request.company?.zip_code || "Not specified"} />
                  </div>
                </div>

                <div className="pr-detail-sticky" style={{ padding: 24, borderRadius: 28, background: "var(--ui-bg-card)", border: `1px solid var(--ui-border)` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#94a3b8", marginBottom: 16 }}>Approval Detail</div>
                  <DetailRow label="Approver" value={request.approved_by || "Not yet approved"} />
                  <DetailRow label="Status" value={status.label} valueColor={status.color} />
                  <DetailRow label="PR Type" value={request.status === "active" ? "Open RFQ" : "Internal Request"} />
                  <div style={{ marginTop: 18, padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>Lifecycle</div>
                    <div style={{ fontSize: 14, color: "#f8fafc", lineHeight: 1.6 }}>
                      {request.status === "pending_approval" && "Waiting for manager approval before the RFQ is published."}
                      {request.status === "active" && "This request is live as a global RFQ and open for vendor proposals."}
                      {request.status === "approved" && "The PR has been approved and is ready for next procurement steps."}
                      {request.status === "rejected" && "This request was rejected and needs a revision before resubmission."}
                    </div>
                  </div>
                </div>

                <div style={{ padding: 24, borderRadius: 28, background: "var(--ui-bg-card)", border: `1px solid var(--ui-border)` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#94a3b8", marginBottom: 16 }}>PR Summary</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>Line items</span>
                    <span style={{ color: "#f8fafc", fontWeight: 700 }}>{request.items?.length || 0}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>Estimated total</span>
                    <span style={{ color: "#f8fafc", fontWeight: 700 }}>IDR {Number(totalItems).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>Vendor proposals</span>
                    <span style={{ color: "#f8fafc", fontWeight: 700 }}>{request.proposals?.length || 0}</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

function MetaCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ padding: 20, borderRadius: 24, background: "var(--ui-bg-card)", border: `1px solid var(--ui-border)`, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(249,115,22,0.16)", display: "grid", placeItems: "center", color: "#8b5cf6" }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
        <div style={{ marginTop: 4, color: "var(--ui-text-primary)", fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ color: "var(--ui-text-secondary)", fontSize: 12 }}>{label}</span>
      <span style={{ color: valueColor || "var(--ui-text-primary)", fontWeight: 700, textAlign: "right", maxWidth: 180 }}>{value}</span>
    </div>
  );
}
