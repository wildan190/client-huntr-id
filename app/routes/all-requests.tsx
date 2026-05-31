import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet } from "../lib/api";
import { Trophy, Globe, Search, Filter, Calendar, Building2, Package, ChevronRight, Loader2, Lightbulb, Info } from "lucide-react";
import { useNavigate } from "react-router";

export default function AllRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCompany, setActiveCompany] = useState<any>(null);

  useEffect(() => {
    fetchGlobalRequests();
    const companySession = localStorage.getItem("active_company");
    if (companySession) setActiveCompany(JSON.parse(companySession));
  }, []);

  const fetchGlobalRequests = async () => {
    try {
      // Fetch all requests that are 'active' (published global RFQs)
      const res = await apiGet(`/api/rfqs?status=active`);
      setRequests(res || []);
    } catch (err) {
      console.error("Failed to fetch global RFQs", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="All Requests" subtitle="Browse active global RFQs and tenders published by organizations.">
      <div style={{ maxWidth: "100%", width: "100%", padding: "clamp(20px, 5vw, 40px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Info Banner: How to create request? */}
        {activeCompany?.type === 'buyer' && (
          <div style={{
            marginBottom: 32, padding: "24px 32px", borderRadius: 24,
            background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.1))",
            border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", gap: 24,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Lightbulb size={24} color="#fb923c" />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "#fff" }}>How to create a request?</h4>
              <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>
                Go to the <strong>Marketplace</strong>, add items to your cart, and checkout to create a Purchase Request. 
                Once your manager approves it, your request will be published here as a Global RFQ for vendors to bid on.
              </p>
            </div>
            <button 
              onClick={() => navigate("/marketplace")}
              style={{
                padding: "10px 20px", borderRadius: 12, background: "#f59e0b", border: "none", color: "#fff",
                fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap"
              }}
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Globe style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} size={18} />
            <input 
              type="text" 
              placeholder="Search active tenders by title, item, or company..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "12px 12px 12px 42px", borderRadius: 14,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff", outline: "none", fontSize: 14,
              }}
            />
          </div>
          <button style={{
            padding: "0 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, fontSize: 14,
          }}>
            <Filter size={16} /> Filters
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Loader2 className="animate-spin" size={32} color="#f59e0b" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6b7280" }}>
            <Search size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
            <h3 style={{ margin: 0, fontSize: 16 }}>No active requests found</h3>
            <p style={{ margin: "8px 0 0", fontSize: 14 }}>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {filteredRequests.map(req => (
              <div key={req.id} style={{
                background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
                padding: 24, display: "flex", flexDirection: "column", gap: 20, transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 8, background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} /> Active RFQ
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>#{req.id}</div>
                </div>

                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#f3f4f6", lineHeight: 1.4 }}>{req.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9ca3af" }}>
                    <Building2 size={13} /> {req.company?.name}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Items</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#fff", fontWeight: 600 }}>
                      <Package size={14} color="#f59e0b" /> {req.items?.length || 0} Categories
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Posted On</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#fff", fontWeight: 600 }}>
                      <Calendar size={14} color="#f59e0b" /> {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/rfq/${req.id}`)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12, background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                >
                  View Details & Bid <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
