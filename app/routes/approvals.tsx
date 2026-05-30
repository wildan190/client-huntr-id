import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet, apiPost } from "../lib/api";
import { CheckCircle2, XCircle, Clock, Package, Calendar, User, Search, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

export default function Approvals() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    const companySession = localStorage.getItem("active_company");
    
    if (userSession && companySession) {
      const u = JSON.parse(userSession);
      const c = JSON.parse(companySession);
      setUser(u);
      
      const isOwner = c.owner_id === u.id;
      if (u.role !== 'manager' && !isOwner || c.type !== 'buyer') {
        navigate("/");
        return;
      }
    }
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      // Fetch all requests that are 'pending_approval'
      const res = await apiGet(`/api/rfqs?status=pending_approval`);
      setRequests(res || []);
    } catch (err) {
      console.error("Failed to fetch pending PRs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (rfqId: number) => {
    if (!user) return;
    setProcessingId(rfqId);
    try {
      await apiPost(`/api/rfqs/${rfqId}/approve`, { manager_id: user.id });
      setRequests(prev => prev.filter(r => r.id !== rfqId));
    } catch (err) {
      console.error("Failed to approve PR", err);
      alert("Failed to approve PR. Check console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Layout title="Manager Approvals" subtitle="Review and approve purchase requisitions before they are published.">
      <div style={{ padding: "0 32px 40px", maxWidth: 1200, margin: "0 auto" }}>
        
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Loader2 className="animate-spin" size={32} color="#6366f1" />
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0", background: "rgba(255,255,255,0.01)", borderRadius: 32, border: "1px dashed rgba(255,255,255,0.06)" }}>
            <CheckCircle2 size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
            <h3 style={{ color: "#9ca3af", margin: 0, fontSize: 16 }}>No pending approvals</h3>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "#6b7280" }}>You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {requests.map(req => (
              <div key={req.id} style={{
                background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
                padding: "24px 32px", display: "flex", alignItems: "center", gap: 32,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#a855f7", background: "rgba(168,85,247,0.1)", padding: "2px 8px", borderRadius: 6 }}>PR #{req.id}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
                      <Calendar size={12} /> {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f3f4f6" }}>{req.title}</h3>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9ca3af" }}>
                    <User size={13} /> Requested by: <span style={{ color: "#d1d5db" }}>User #{req.user_id}</span>
                  </div>
                </div>

                <div style={{ width: 180 }}>
                  <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Items to Purchase</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Package size={14} color="#9ca3af" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{req.items?.length || 0} products</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button 
                    onClick={() => handleApprove(req.id)}
                    disabled={processingId === req.id}
                    style={{
                      padding: "10px 20px", borderRadius: 12, background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontWeight: 700,
                      fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                    }}
                  >
                    {processingId === req.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve & Publish
                  </button>
                  <button 
                    style={{
                      padding: "10px 20px", borderRadius: 12, background: "rgba(239,68,68,0.05)",
                      border: "1px solid rgba(239,68,68,0.15)", color: "#f87171", fontWeight: 700,
                      fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
