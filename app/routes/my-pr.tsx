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
      if (comp.type === "vendor") {
        navigate("/");
        return;
      }
    }
    fetchMyRequests();

    // Listen for new notifications to refresh data
    const handleRefreshData = () => {
      fetchMyRequests();
    };

    window.addEventListener("huntr:notification_received", handleRefreshData);

    return () => {
      window.removeEventListener("huntr:notification_received", handleRefreshData);
    };
  }, []);

  const fetchMyRequests = async () => {
    const activeComp = localStorage.getItem("active_company");
    if (!activeComp) return;
    const comp = JSON.parse(activeComp);

    try {
      // Data Isolation: Fetch by company_id instead of user_id to see all company PRs
      const res = await apiGet(`/api/rfqs?company_id=${comp.id}`);
      setRequests(res || []);
    } catch (err) {
      console.error("Failed to fetch my PRs", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending_approval":
        return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", icon: Clock, label: "Pending Approval" };
      case "approved":
        return { bg: "rgba(34,197,94,0.1)", color: "#22c55e", icon: CheckCircle2, label: "Approved" };
      case "active":
        return { bg: "rgba(249,115,22,0.1)", color: "#fb923c", icon: Package, label: "Open (Global RFQ)" };
      case "rejected":
        return { bg: "rgba(239,68,68,0.1)", color: "#f87171", icon: XCircle, label: "Rejected" };
      default:
        return { bg: "rgba(107,114,128,0.1)", color: "#9ca3af", icon: Clock, label: status };
    }
  };

  const filteredRequests = requests.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.id ? String(r.id).toLowerCase().includes(searchTerm.toLowerCase()) : false)
  );

  return (
    <Layout title="My Purchase Requisitions" subtitle="Track the status of your internal purchase requests.">
      <div style={{ width: "100%" }}>
        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }} size={16} />
            <input
              type="text"
              placeholder="Search by PR title or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                borderRadius: 10,
                background: "var(--ui-bg-input)",
                border: "1px solid var(--ui-border-input)",
                color: "var(--ui-text-primary)",
                outline: "none",
                fontSize: 13,
                transition: "all 0.3s ease",
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 className="animate-spin" size={24} color="#f59e0b" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", background: "var(--ui-bg-input)", borderRadius: 16, border: "1px dashed var(--ui-border)", transition: "all 0.3s ease" }}>
            <ClipboardList size={36} style={{ opacity: 0.15, marginBottom: 12 }} />
            <h3 style={{ color: "var(--ui-text-secondary)", margin: 0, fontSize: 14, transition: "color 0.3s ease" }}>No purchase requests found</h3>
            <button onClick={() => navigate("/marketplace")} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, background: "#f59e0b", border: "none", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.3s ease" }}>
              Go to Marketplace
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredRequests.map((req) => {
              const status = getStatusStyle(req.status);
              const StatusIcon = status.icon;
              return (
                <div key={req.id} className="huntr-action-card" style={{ background: "var(--ui-bg-card)", borderRadius: 12, border: "1px solid var(--ui-border)", transition: "all 0.3s ease", position: "relative", cursor: "pointer" }}>
                  <div onClick={() => navigate(req.status === 'active' ? `/rfq/${req.id}` : `/my-pr/${req.id}`)} style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 0 }} />
                  <div style={{ flex: 1, position: "relative", zIndex: 1, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(249,115,22,0.1)", padding: "2px 8px", borderRadius: 6, transition: "all 0.3s ease" }}>
                        PR #{req.id ? String(req.id).substring(0, 8).toUpperCase() : ""}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
                        <Calendar size={12} /> {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{req.title}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ui-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", transition: "color 0.3s ease" }}>
                      {req.description || "No description provided."}
                    </p>
                  </div>

                  <div className="huntr-action-card-meta" style={{ width: "auto", position: "relative", zIndex: 1, paddingRight: 16, display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Package size={12} color="var(--ui-text-secondary)" style={{ transition: "color 0.3s ease" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{req.items?.length || 0} items</span>
                    </div>

                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: status.bg, color: status.color, fontSize: 11, fontWeight: 700 }}>
                      <StatusIcon size={12} /> {status.label}
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); navigate(req.status === 'active' ? `/rfq/${req.id}` : `/my-pr/${req.id}`); }} style={{ width: 32, height: 32, borderRadius: 8, background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)", color: "var(--ui-text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, transition: "all 0.3s ease" }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
