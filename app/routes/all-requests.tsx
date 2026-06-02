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
      <div style={{ width: "100%" }}>
        
        {/* Info Banner: How to create request? */}
        {activeCompany?.type === 'buyer' && (
          <div style={{
            marginBottom: 32, padding: "24px 32px", borderRadius: 24,
            background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.1))",
            border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", gap: 24,
            transition: "all 0.3s ease",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s ease" }}>
              <Lightbulb size={24} color="#fb923c" />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>How to create a request?</h4>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ui-text-secondary)", lineHeight: 1.5, transition: "color 0.3s ease" }}>
                Go to the <strong>Marketplace</strong>, add items to your cart, and checkout to create a Purchase Request. 
                Once your manager approves it, your request will be published here as a Global RFQ for vendors to bid on.
              </p>
            </div>
            <button 
              onClick={() => navigate("/marketplace")}
              style={{
                padding: "10px 20px", borderRadius: 12, background: "#f59e0b", border: "none", color: "#fff",
                fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.3s ease"
              }}
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Globe style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }} size={18} />
            <input 
              type="text" 
              placeholder="Search active tenders by title, item, or company..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "12px 12px 12px 42px", borderRadius: 14,
                background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
                color: "var(--ui-text-primary)", outline: "none", fontSize: 14, transition: "all 0.3s ease",
              }}
            />
          </div>
          <button style={{
            padding: "0 18px", borderRadius: 14, background: "var(--ui-bg-input)",
            border: "1px solid var(--ui-border-input)", color: "var(--ui-text-secondary)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, fontSize: 14, transition: "all 0.3s ease",
          }}>
            <Filter size={16} /> Filters
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Loader2 className="animate-spin" size={32} color="#f59e0b" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
            <Search size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
            <h3 style={{ margin: 0, fontSize: 16, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>No active requests found</h3>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {filteredRequests.map(req => (
              <div key={req.id} style={{
                background: "var(--ui-bg-card)", borderRadius: 24, border: "1px solid var(--ui-border)",
                padding: 24, display: "flex", flexDirection: "column", gap: 20, transition: "all 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 8, background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.3s ease" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} /> Active RFQ
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 600, transition: "color 0.3s ease" }}>#{req.id}</div>
                </div>

                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "var(--ui-text-primary)", lineHeight: 1.4, transition: "color 0.3s ease" }}>{req.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>
                    <Building2 size={13} /> {req.company?.name}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, padding: "16px", background: "var(--ui-bg-input)", borderRadius: 16, transition: "all 0.3s ease" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4, transition: "color 0.3s ease" }}>Items</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ui-text-primary)", fontWeight: 600, transition: "color 0.3s ease" }}>
                      <Package size={14} color="#f59e0b" /> {req.items?.length || 0} Categories
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4, transition: "color 0.3s ease" }}>Posted On</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ui-text-primary)", fontWeight: 600, transition: "color 0.3s ease" }}>
                      <Calendar size={14} color="#f59e0b" /> {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/rfq/${req.id}`)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12, background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.3s ease"
                  }}
                >
                  View Details & Bid <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
