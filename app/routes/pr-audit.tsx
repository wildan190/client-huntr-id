import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet } from "../lib/api";
import { 
  ClipboardList, Calendar, User, Search, Loader2, 
  Clock, CheckCircle2, XCircle, ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router";

export default function PurchaseRequisitionAudit() {
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
    const activeComp = localStorage.getItem("active_company");
    if (!activeComp) return;
    const comp = JSON.parse(activeComp);

    try {
      const response = await apiGet(`/api/rfqs?company_id=${comp.id}`);
      const data = response?.data || response || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch PR audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending_approval": return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", icon: Clock, label: "Pending Approval" };
      case "approved": return { bg: "rgba(34,197,94,0.1)", color: "#22c55e", icon: CheckCircle2, label: "Approved" };
      case "active": return { bg: "rgba(249,115,22,0.1)", color: "#fb923c", icon: ClipboardList, label: "Open Tender" };
      case "rejected": return { bg: "rgba(239,68,68,0.1)", color: "#f87171", icon: XCircle, label: "Rejected" };
      default: return { bg: "rgba(107,114,128,0.1)", color: "#9ca3af", icon: Clock, label: status };
    }
  };

  const filteredRequests = requests.filter(r => 
    r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.approved_by?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.id ? String(r.id).toLowerCase().includes(searchTerm.toLowerCase()) : false)
  );

  return (
    <Layout title="PR Audit Log" subtitle="Audit trail for all purchase requisitions with creator and approver information.">
      <div style={{ width: "100%" }}>
        
        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }} size={18} />
            <input 
              type="text" 
              placeholder="Search by PR title, ID, creator, or approver..." 
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
            <h3 style={{ color: "var(--ui-text-secondary)", margin: 0, fontSize: 16, transition: "color 0.3s ease" }}>No purchase requisitions found for audit</h3>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredRequests.map(req => {
              const status = getStatusStyle(req.status);
              const StatusIcon = status.icon;
              
              return (
                <div key={req.id} style={{
                  background: "var(--ui-bg-card)", borderRadius: 20, border: "1px solid var(--ui-border)",
                  padding: "24px", display: "flex", flexDirection: "column", gap: 20,
                  transition: "all 0.3s ease", cursor: "pointer"
                }} onClick={() => navigate(`/my-pr/${req.id}`)}>
                  {/* Header Section */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>PR #{req.id ? String(req.id).substring(0, 8).toUpperCase() : ""}</span>
                        <div style={{ 
                          display: "inline-flex", alignItems: "center", gap: 6, 
                          padding: "4px 10px", borderRadius: 999,
                          background: status.bg, color: status.color, fontSize: 11, fontWeight: 800
                        }}>
                          <StatusIcon size={12} /> {status.label}
                        </div>
                      </div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)" }}>{req.title}</h3>
                    </div>
                    <ChevronRight size={20} color="var(--ui-text-muted)" />
                  </div>

                  {/* Audit Details Grid */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: 16 
                  }}>
                    {/* Created By */}
                    <AuditRow 
                      icon={<User size={14} color="#9ca3af" />}
                      label="Dibuat oleh"
                      value={req.user?.name || "Unknown"}
                      subValue={req.created_at ? new Date(req.created_at).toLocaleString() : "-"}
                    />
                    
                    {/* Approved By */}
                    <AuditRow 
                      icon={<CheckCircle2 size={14} color="#9ca3af" />}
                      label="Disetujui oleh"
                      value={req.approved_by || "Belum disetujui"}
                      subValue={req.approved_at ? new Date(req.approved_at).toLocaleString() : "-"}
                      highlight={!!req.approved_by}
                    />
                    
                    {/* Company */}
                    <AuditRow 
                      icon={<ClipboardList size={14} color="#9ca3af" />}
                      label="Perusahaan"
                      value={req.company?.name || "Unknown"}
                      subValue={req.items?.length ? `${req.items.length} item` : "0 item"}
                    />
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

function AuditRow({ 
  icon, 
  label, 
  value, 
  subValue, 
  highlight = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue: string; 
  highlight?: boolean; 
}) {
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "flex-start", 
      gap: 12, 
      padding: "12px", 
      borderRadius: 12, 
      background: highlight ? "rgba(34,197,94,0.06)" : "var(--ui-bg-input)",
      border: highlight ? "1px solid rgba(34,197,94,0.15)" : "1px solid var(--ui-border-input)"
    }}>
      <div style={{ marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? "#22c55e" : "var(--ui-text-primary)", marginBottom: 2 }}>{value}</div>
        {subValue && <div style={{ fontSize: 11, color: "var(--ui-text-muted)" }}>{subValue}</div>}
      </div>
    </div>
  );
}
