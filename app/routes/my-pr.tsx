import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet } from "../lib/api";
import { ClipboardList, Clock, CheckCircle2, XCircle, ChevronRight, Package, Calendar, User, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

export default function MyPurchaseRequisitions() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCompany, setActiveCompany] = useState<any>(null);

  useEffect(() => {
    const companySession = localStorage.getItem("active_company");
    if (companySession) {
      const comp = JSON.parse(companySession);
      setActiveCompany(comp);
      if (comp.type === 'vendor') {
        navigate("/");
        return;
      }
    }
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    const userSession = localStorage.getItem("user_session");
    if (!userSession) return;
    const user = JSON.parse(userSession);

    try {
      // We use apiGet directly since we don't have a specific function in api.ts yet
      const res = await apiGet(`/api/rfqs?user_id=${user.id}`);
      setRequests(res || []);
    } catch (err) {
      console.error("Failed to fetch my PRs", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending_approval": return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", icon: Clock, label: "Pending Approval" };
      case "approved": return { bg: "rgba(34,197,94,0.1)", color: "#22c55e", icon: CheckCircle2, label: "Approved" };
      case "active": return { bg: "rgba(249,115,22,0.1)", color: "#fb923c", icon: Package, label: "Open (Global RFQ)" };
      case "rejected": return { bg: "rgba(239,68,68,0.1)", color: "#f87171", icon: XCircle, label: "Rejected" };
      default: return { bg: "rgba(107,114,128,0.1)", color: "#9ca3af", icon: Clock, label: status };
    }
  };

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toString().includes(searchTerm)
  );

  return (
    <Layout title="My Purchase Requisitions" subtitle="Track the status of your internal purchase requests.">
      <div style={{ maxWidth: "100%", width: "100%", padding: "0 clamp(20px, 5vw, 32px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }} size={18} />
            <input 
              type="text" 
              placeholder="Search by PR title or ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "12px 12px 12px 42px", borderRadius: 14,
                background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
                color: "var(--ui-text-primary)", outline: "none", fontSize: 14, transition: "all 0.3s ease",
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Loader2 className="animate-spin" size={32} color="#f59e0b" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0", background: "var(--ui-bg-input)", borderRadius: 32, border: "1px dashed var(--ui-border)", transition: "all 0.3s ease" }}>
            <ClipboardList size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
            <h3 style={{ color: "var(--ui-text-secondary)", margin: 0, fontSize: 16, transition: "color 0.3s ease" }}>No purchase requests found</h3>
            <button onClick={() => navigate("/marketplace")} style={{ marginTop: 24, padding: "12px 24px", borderRadius: 12, background: "#f59e0b", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease" }}>
              Go to Marketplace
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {filteredRequests.map(req => {
                  const status = getStatusStyle(req.status);
                  const StatusIcon = status.icon;
                  return (
                    <div key={req.id} style={{
                      background: "var(--ui-bg-card)", borderRadius: 24, border: "1px solid var(--ui-border)",
                      padding: "24px 32px", display: "flex", alignItems: "center", gap: 24, transition: "all 0.3s ease",
                      position: "relative",
                      cursor: "pointer",
                    }}>
                      <div onClick={() => navigate(`/my-pr/${req.id}`)} style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 0 }} />
                      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", background: "rgba(249,115,22,0.1)", padding: "2px 8px", borderRadius: 6, transition: "all 0.3s ease" }}>PR #{req.id}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
                            <Calendar size={12} /> {new Date(req.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{req.title}</h3>
                        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ui-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", transition: "color 0.3s ease" }}>
                          {req.description || "No description provided."}
                        </p>
                      </div>

                      <div style={{ width: 180, position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, transition: "color 0.3s ease" }}>Items</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Package size={14} color="var(--ui-text-secondary)" style={{ transition: "color 0.3s ease" }} />
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{req.items?.length || 0} products</span>
                        </div>
                      </div>

                      <div style={{ width: 160, position: "relative", zIndex: 1 }}>
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12,
                          background: status.bg, color: status.color, fontSize: 12, fontWeight: 700,
                        }}>
                          <StatusIcon size={14} /> {status.label}
                        </div>
                      </div>

                      <button onClick={() => navigate(`/my-pr/${req.id}`)} style={{
                        width: 40, height: 40, borderRadius: 12, background: "var(--ui-bg-input)",
                        border: "1px solid var(--ui-border-input)", color: "var(--ui-text-secondary)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative",
                        zIndex: 1,
                        transition: "all 0.3s ease",
                      }}>
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  );
                })}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
