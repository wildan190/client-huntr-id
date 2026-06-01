import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { apiGet } from "../lib/api";
import { ArrowLeft, Calendar, Building2, Package, User, ClipboardList, MapPin, Loader2, AlertCircle } from "lucide-react";

export default function RfqDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("RFQ not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    apiGet(`/api/rfqs/${id}`)
      .then((response) => {
        const data = response?.rfq ?? response?.data ?? response;
        setRfq(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load RFQ detail. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const totalItems = rfq?.items?.reduce((sum: number, item: any) => {
    return sum + (item.qty || 0);
  }, 0);

  return (
    <Layout title="RFQ Detail" subtitle="View request for quotation details and submit your proposal.">
      <style>{`
        @media (max-width: 768px) {
          .rfq-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .rfq-detail-aside {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
          .rfq-detail-sticky {
            position: static !important;
            top: auto !important;
          }
        }
      `}</style>
      <div style={{ padding: 24, maxWidth: 1040, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate("/all-requests")}
          style={{
            marginBottom: 24,
            padding: "10px 16px",
            borderRadius: 10,
            background: "var(--ui-bg-input)",
            border: "1px solid var(--ui-border-input)",
            color: "var(--ui-text-secondary)",
            cursor: "pointer",
            fontWeight: 700,
            transition: "all 0.3s ease",
          }}
        >
          <ArrowLeft size={18} style={{ marginRight: 8 }} /> Back to All Requests
        </button>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Loader2 className="animate-spin" size={32} color="#f59e0b" />
          </div>
        ) : error ? (
          <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: 28, color: "#fca5a5", display: "flex", gap: 12, alignItems: "center" }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            {error}
          </div>
        ) : rfq ? (
          <div style={{ display: "grid", gap: 28 }}>
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fb923c", textTransform: "uppercase", letterSpacing: 1.1, transition: "color 0.3s ease" }}>RFQ #{rfq.id}</span>
                  <h1 style={{ margin: "12px 0 0", fontSize: 32, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{rfq.title}</h1>
                  <p style={{ margin: "10px 0 0", color: "var(--ui-text-secondary)", maxWidth: 720, lineHeight: 1.7, transition: "color 0.3s ease" }}>{rfq.description || "No description provided."}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <MetaCard icon={<Building2 size={18} />} label="Company" value={rfq.company?.name || "Unknown"} />
                <MetaCard icon={<User size={18} />} label="Requested by" value={rfq.user?.name || "Unknown"} />
                <MetaCard icon={<Calendar size={18} />} label="Posted" value={new Date(rfq.created_at).toLocaleString()} />
                <MetaCard icon={<Package size={18} />} label="Items" value={`${totalItems || 0} items`} />
              </div>
            </div>

            <div className="rfq-detail-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 24 }}>
              <section style={{ padding: 28, borderRadius: 28, background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", transition: "all 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--ui-text-muted)", fontWeight: 700, transition: "color 0.3s ease" }}>Items Requested</div>
                    <h2 style={{ margin: "10px 0 0", fontSize: 20, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{rfq.items?.length || 0} items</h2>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                  {(rfq.items || []).map((item: any) => (
                    <div key={item.id || item.catalogue_id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: 18, borderRadius: 20, background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)", transition: "all 0.3s ease" }}>
                      <div>
                        <div style={{ color: "var(--ui-text-primary)", fontWeight: 700, transition: "color 0.3s ease" }}>{item.catalogue?.name || `Item ${item.catalogue_id}`}</div>
                        <div style={{ color: "var(--ui-text-secondary)", fontSize: 12, marginTop: 4, transition: "color 0.3s ease" }}>{item.catalogue?.item_code || "No code"}</div>
                        <div style={{ color: "var(--ui-text-muted)", fontSize: 12, marginTop: 8, transition: "color 0.3s ease" }}>Expected {item.expected_date}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>Qty: {item.qty}</div>
                        <div style={{ color: "var(--ui-text-secondary)", fontSize: 12, marginTop: 4, transition: "color 0.3s ease" }}>Unit</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="rfq-detail-aside" style={{ display: "grid", gap: 20 }}>
                <div className="rfq-detail-sticky" style={{ padding: 24, borderRadius: 28, background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", transition: "all 0.3s ease" }}>
                  <h4 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>RFQ Information</h4>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", marginBottom: 6, transition: "color 0.3s ease" }}>Status</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                        <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: 8, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>Active</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", marginBottom: 6, transition: "color 0.3s ease" }}>Total Items</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{totalItems || 0} items</div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", marginBottom: 6, transition: "color 0.3s ease" }}>Posted Date</div>
                      <div style={{ fontSize: 14, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{new Date(rfq.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <button
                    style={{
                      width: "100%",
                      marginTop: 24,
                      padding: "14px",
                      borderRadius: 14,
                      background: "linear-gradient(135deg,#f97316,#f59e0b)",
                      color: "#fff",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Submit Proposal
                  </button>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div style={{ color: "var(--ui-text-primary)", background: "var(--ui-bg-input)", padding: 20, borderRadius: 18, transition: "all 0.3s ease" }}>
            No RFQ detail available.
          </div>
        )}
      </div>
    </Layout>
  );
}

function MetaCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 16, background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)", transition: "all 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>{icon}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", transition: "color 0.3s ease" }}>{label}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{value}</div>
    </div>
  );
}
