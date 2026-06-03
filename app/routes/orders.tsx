import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "../components/Layout";
import {
  FileText, RefreshCw, ChevronDown, ChevronRight, Loader2,
  Calendar, Building, User, CheckCircle2, ChevronLeft, Package, Clock, UploadCloud, FileSpreadsheet, X, Search, ReceiptText
} from "lucide-react";
import { getOrders, uploadCompanyDocument, importHistoricalPo, importCatalogue, getCsrfCookie, apiPost } from "../lib/api";
import { getAssetUrl } from "../lib/assets";

export default function Orders() {
  const navigate = useNavigate();
  
  // App state
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PO State
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "operational" | "historical">("all");
  const [expandedPo, setExpandedPo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    const activeComp = localStorage.getItem("active_company");
    if (!userSession || !activeComp) {
      navigate("/login");
      return;
    }
    const u = JSON.parse(userSession);
    const ac = JSON.parse(activeComp);
    setUser(u);
    setCompany(ac);
    setLoading(false);
    
    // Initialize CSRF cookie
    getCsrfCookie().catch(err => {
      console.warn("Failed to initialize CSRF cookie:", err);
    });
  }, [navigate]);

  useEffect(() => {
    if (company) {
      const timer = setTimeout(() => {
        fetchOrders(company.id, 1, searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, company]);

  const fetchOrders = async (companyId: string | number, page: number, search: string = "") => {
    try {
      setRefreshing(true);
      const res = await getOrders(companyId, page, 10, search);
      setOrders(res.data || []);
      setCurrentPage(res.current_page || 1);
      setLastPage(res.last_page || 1);
      setTotalOrders(res.total || 0);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleConfirmPo = async (poId: string) => {
    if (!company) return;
    setConfirmingId(poId);
    setError(null);
    try {
      await apiPost(`/api/orders/${poId}/confirm`, {
        company_id: company.id
      });
      setSuccessMessage("✓ PO confirmed! Proforma invoice has been published to buyer.");
      fetchOrders(company.id, currentPage);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to confirm PO");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleImport = async () => {
    if (!importFile || !company) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const fd = new FormData();
      fd.append("company_id", String(company.id));
      fd.append("csv", importFile);

      if (company.type === "buyer") {
        await importHistoricalPo(fd);
      } else {
        await importCatalogue(fd);
      }

      setImportSuccess(true);
      setTimeout(() => {
        setShowImportModal(false);
        setImportSuccess(false);
        setImportFile(null);
        fetchOrders(company.id, 1);
      }, 3000);
    } catch (err: any) {
      setImportError(err.message || "Import failed. Please check your CSV format.");
    } finally {
      setIsImporting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > lastPage || !company) return;
    fetchOrders(company.id, newPage, searchQuery);
  };

  if (loading) {
    return (
      <Layout title="Purchase Order" subtitle="Loading your Purchase Orders...">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 14 }}>
          <Loader2 size={32} className="animate-spin" color="#f59e0b" />
          <span style={{ fontSize: 13, color: "#6b7280" }}>Fetching PO data...</span>
        </div>
      </Layout>
    );
  }

  // Filter orders on frontend based on selected tab only (search is now server-side)
  const filteredOrders = orders.filter((o) => {
    // Tab filter
    if (activeTab === "historical") return o.is_historical;
    if (activeTab === "operational") return !o.is_historical;
    return true;
  });

  return (
    <Layout
      title="Purchase Order"
      subtitle="View and manage all purchase order documents."
    >
      <div style={{ maxWidth: "100%", width: "100%" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Header Summary Card */}
        <div style={{
          background: "var(--ui-bg-card)",
          border: "1px solid var(--ui-border)",
          borderRadius: 24,
          padding: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg,#f97316,#f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 20px rgba(249,115,22,0.25)",
            }}>
              <FileText size={28} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)", margin: 0, transition: "color 0.3s ease" }}>
                List of {company.type === "buyer" ? "Purchase Orders" : "Catalogue Items"} ({totalOrders})
              </h2>
              <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", margin: "6px 0 0", transition: "color 0.3s ease" }}>
                Active Workspace: <strong style={{ color: "#fdba74" }}>{company.name}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setShowImportModal(true)}
              style={{
                background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
                borderRadius: 14, padding: "0 20px", display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", color: "#fb923c", fontWeight: 700, fontSize: 13, transition: "all 0.3s ease"
              }}
            >
              <UploadCloud size={18} /> Import {company.type === "buyer" ? "Historical PO" : "Catalogue"}
            </button>

            <button
              onClick={() => fetchOrders(company.id, currentPage)}
              disabled={refreshing}
              style={{
                background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
                borderRadius: 14, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--ui-text-secondary)", transition: "all 0.3s ease",
              }}
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
          }}>
            <div style={{
              background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 28,
              width: "100%", maxWidth: 500, padding: 32, display: "flex", flexDirection: "column", gap: 24,
              transition: "all 0.3s ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                  Import {company.type === "buyer" ? "Historical PO" : "Catalogue"}
                </h3>
                <button onClick={() => setShowImportModal(false)} style={{ background: "none", border: "none", color: "var(--ui-text-muted)", cursor: "pointer", transition: "color 0.3s ease" }}><X size={20} /></button>
              </div>

              <div style={{ 
                padding: 40, border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 20, textAlign: "center",
                background: "var(--ui-bg-input)", cursor: "pointer", transition: "all 0.3s ease",
              }} onClick={() => document.getElementById("csv-input")?.click()}>
                <FileSpreadsheet size={48} color={importFile ? "#f59e0b" : "var(--ui-text-muted)"} style={{ marginBottom: 16, transition: "color 0.3s ease" }} />
                <p style={{ color: importFile ? "var(--ui-text-primary)" : "var(--ui-text-secondary)", margin: 0, fontSize: 14, fontWeight: 600, transition: "color 0.3s ease" }}>
                  {importFile ? importFile.name : "Click to select CSV file"}
                </p>
                <p style={{ color: "var(--ui-text-muted)", fontSize: 12, marginTop: 8, transition: "color 0.3s ease" }}>Format must match user_story.md headers</p>
                <input id="csv-input" type="file" accept=".csv" style={{ display: "none" }} onChange={e => setImportFile(e.target.files?.[0] || null)} />
              </div>

              {importError && (
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 13, transition: "all 0.3s ease" }}>
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 13, transition: "all 0.3s ease" }}>
                  Import successful! Processing in background...
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!importFile || isImporting || importSuccess}
                style={{
                  width: "100%", padding: 16, borderRadius: 16, background: "linear-gradient(135deg,#f97316,#f59e0b)",
                  color: "#fff", fontWeight: 700, border: "none", cursor: (isImporting || !importFile) ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: "0 8px 20px rgba(249,115,22,0.2)", opacity: (isImporting || !importFile) ? 0.6 : 1, transition: "all 0.3s ease"
                }}
              >
                {isImporting ? <Loader2 size={20} className="animate-spin" /> : "Start Import"}
              </button>
            </div>
          </div>
        )}

        {/* Tab Selection & Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, background: "var(--ui-bg-input)", padding: 6, borderRadius: 16, width: "fit-content", transition: "all 0.3s ease" }}>
            {[
              { id: "all", label: "All POs" },
              { id: "operational", label: "Operational" },
              { id: "historical", label: "Historical" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "10px 20px", borderRadius: 12, border: "none",
                  background: activeTab === tab.id ? "rgba(249,115,22,0.15)" : "transparent",
                  color: activeTab === tab.id ? "#fdba74" : "var(--ui-text-muted)",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={18} color="var(--ui-text-muted)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", transition: "color 0.3s ease" }} />
            <input 
              type="text" 
              placeholder="Search by PO number, vendor, or user..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px 12px 48px", borderRadius: 16,
                background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
                color: "var(--ui-text-primary)", outline: "none", fontSize: 14, transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {successMessage && (
          <div style={{ padding: 16, borderRadius: 16, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 14, fontWeight: 700, marginBottom: 24 }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{ padding: 16, borderRadius: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 14, fontWeight: 700, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* PO Table/List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", background: "var(--ui-bg-input)", borderRadius: 32, border: "1px dashed var(--ui-border-input)", transition: "all 0.3s ease" }}>
              <FileText size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
              <h3 style={{ color: "var(--ui-text-secondary)", margin: 0, fontSize: 16, transition: "color 0.3s ease" }}>No purchase orders found</h3>
            </div>
          ) : (
            filteredOrders.map(po => (
              <div key={po.id} style={{
                background: "var(--ui-bg-card)", borderRadius: 24, border: "1px solid var(--ui-border)",
                padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20, transition: "all 0.3s ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", background: "rgba(249,115,22,0.1)", padding: "2px 8px", borderRadius: 6, transition: "all 0.3s ease" }}>
                        {po.po_number}
                      </span>
                      {po.is_historical && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", transition: "all 0.3s ease" }}>
                          Historical
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{po.rfq?.title || "Purchase Order Document"}</h3>
                  </div>

                  <div style={{ width: 200 }}>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, transition: "color 0.3s ease" }}>Vendor</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Building size={14} color="var(--ui-text-secondary)" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{po.vendor_name || "N/A"}</span>
                    </div>
                  </div>

                  <div style={{ width: 160 }}>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, transition: "color 0.3s ease" }}>Date</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={14} color="var(--ui-text-secondary)" />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{po.order_date || new Date(po.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ width: 140 }}>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, transition: "color 0.3s ease" }}>Status</div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10,
                      background: po.status === 'confirmed' ? "rgba(34,197,94,0.1)" : "rgba(249,115,22,0.1)", 
                      color: po.status === 'confirmed' ? "#22c55e" : "#fb923c", 
                      fontSize: 12, fontWeight: 700, transition: "all 0.3s ease"
                    }}>
                      {po.status === 'confirmed' ? <CheckCircle2 size={14} /> : <Clock size={14} />} 
                      {po.status === 'confirmed' ? 'Confirmed' : 'Issued'}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    {company.type === 'vendor' && po.status === 'published' && (
                      <button
                        onClick={() => handleConfirmPo(po.id)}
                        disabled={confirmingId === po.id}
                        style={{
                          background: "var(--huntr-orange)", border: "none", borderRadius: 12,
                          padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 12,
                          cursor: confirmingId === po.id ? "wait" : "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                          boxShadow: "0 4px 12px rgba(249,115,22,0.2)", transition: "all 0.2s ease",
                        }}
                      >
                        {confirmingId === po.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Confirm PO
                      </button>
                    )}

                    <button 
                      onClick={() => setExpandedPo(expandedPo === po.id ? null : po.id)}
                      style={{
                        width: 40, height: 40, borderRadius: 12, background: "var(--ui-bg-input)",
                        border: "1px solid var(--ui-border-input)", color: "var(--ui-text-secondary)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease"
                      }}
                    >
                      {expandedPo === po.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </div>
                </div>

                {expandedPo === po.id && (
                  <div style={{ 
                    padding: "32px", borderRadius: 20, background: "var(--ui-bg-input)", 
                    border: "1px solid var(--ui-border-input)", marginTop: 8,
                    display: "flex", flexDirection: "column", gap: 32,
                    boxShadow: "inset 0 4px 24px rgba(0,0,0,0.2)", transition: "all 0.3s ease"
                  }}>
                    {/* Upper Detail Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 40 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, transition: "color 0.3s ease" }}>Metadata & Identity</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
                                <User size={14} color="#fb923c" />
                              </div>
                              <span>Issued by: <strong style={{ color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{po.created_by || "System"}</strong></span>
                            </div>
                            {po.approved_by && (
                              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
                                  <CheckCircle2 size={14} color="#4ade80" />
                                </div>
                                <span>Approved by: <strong style={{ color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{po.approved_by}</strong></span>
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ui-bg-card)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
                                <Clock size={14} color="var(--ui-text-secondary)" />
                              </div>
                              <span>Last Update: <strong style={{ color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{new Date(po.updated_at).toLocaleString()}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, transition: "color 0.3s ease" }}>Classification</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ fontSize: 13, color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>Category: <strong style={{ color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{po.purchase_category || "N/A"}</strong></div>
                          <div style={{ fontSize: 13, color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>Type: <strong style={{ color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{po.purchase_type || "N/A"}</strong></div>
                          <div style={{ fontSize: 13, color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>Department: <strong style={{ color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{po.department || "N/A"}</strong></div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 16, background: "var(--ui-bg-card)", padding: 20, borderRadius: 16, border: "1px solid var(--ui-border)", transition: "all 0.3s ease" }}>
                        <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, transition: "color 0.3s ease" }}>Total Financial Summary</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "var(--ui-text-primary)", letterSpacing: "-0.5px", transition: "color 0.3s ease" }}>
                          <span style={{ fontSize: 14, color: "#fb923c", marginRight: 6 }}>{po.currency || "IDR"}</span>
                          {Number(po.total_amount || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ui-text-secondary)", display: "flex", alignItems: "center", gap: 6, transition: "color 0.3s ease" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} /> All taxes included
                        </div>
                      </div>
                    </div>

                    {/* Item Breakdown Table */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ fontSize: 12, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, transition: "color 0.3s ease" }}>Item Breakdown</h4>
                        <span style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 600, transition: "color 0.3s ease" }}>{po.items?.length || 0} line items</span>
                      </div>
                      
                      <div style={{ overflow: "hidden", borderRadius: 16, border: "1px solid var(--ui-border-input)", transition: "all 0.3s ease" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                          <thead>
                            <tr style={{ background: "var(--ui-bg-card)", borderBottom: "1px solid var(--ui-border-input)", transition: "all 0.3s ease" }}>
                              <th style={{ padding: "14px 20px", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, transition: "color 0.3s ease" }}>ITEM NAME & CODE</th>
                              <th style={{ padding: "14px 20px", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, transition: "color 0.3s ease" }}>QTY</th>
                              <th style={{ padding: "14px 20px", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, transition: "color 0.3s ease" }}>UNIT PRICE</th>
                              <th style={{ padding: "14px 20px", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, transition: "color 0.3s ease" }}>TAX</th>
                              <th style={{ padding: "14px 20px", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, textAlign: "right", transition: "color 0.3s ease" }}>SUBTOTAL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {po.items?.map((item: any, idx: number) => (
                              <tr key={idx} style={{ borderBottom: idx === (po.items?.length - 1) ? "none" : "1px solid var(--ui-border-input)", transition: "all 0.3s ease" }}>
                                <td style={{ padding: "16px 20px" }}>
                                  <div style={{ color: "var(--ui-text-primary)", fontWeight: 700, marginBottom: 4, transition: "color 0.3s ease" }}>{item.inventory_name}</div>
                                  <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontFamily: "monospace", transition: "color 0.3s ease" }}>{item.inventory_code || "NO-CODE"} • {item.pr_reference_number || "NO-PR"}</div>
                                </td>
                                <td style={{ padding: "16px 20px", color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                                  <strong style={{ color: "#fdba74" }}>{item.qty}</strong> <span style={{ fontSize: 11, color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>{item.uom}</span>
                                </td>
                                <td style={{ padding: "16px 20px", color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                                  {Number(item.unit_price).toLocaleString()}
                                </td>
                                <td style={{ padding: "16px 20px", color: "#f87171", fontSize: 12, transition: "color 0.3s ease" }}>
                                  {Number(item.tax_amount) > 0 ? `+${Number(item.tax_amount).toLocaleString()}` : "—"}
                                </td>
                                <td style={{ padding: "16px 20px", color: "var(--ui-text-primary)", fontWeight: 800, textAlign: "right", transition: "color 0.3s ease" }}>
                                  {Number(item.total_amount).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Invoices Section */}
                      {po.invoices && po.invoices.length > 0 && (
                        <div style={{ marginTop: 24, padding: 20, background: "var(--ui-bg-input)", borderRadius: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ui-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <ReceiptText size={16} />
                            Related Invoices
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                            {po.invoices.map((inv: any) => (
                              <div key={inv.id} style={{ 
                                padding: "12px 16px", borderRadius: 12, background: "var(--ui-bg-card)", border: "1px solid var(--ui-border-input)",
                                display: "flex", flexDirection: "column", gap: 4, minWidth: 200
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 10, fontWeight: 800, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>{inv.type} Invoice</span>
                                  <span style={{ 
                                    fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 6,
                                    background: inv.status === 'paid' ? "rgba(34,197,94,0.1)" : "rgba(249,115,22,0.1)",
                                    color: inv.status === 'paid' ? "#22c55e" : "#fb923c",
                                    textTransform: "uppercase"
                                  }}>{inv.status}</span>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)" }}>
                                  IDR {Number(inv.amount).toLocaleString()}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--ui-text-muted)" }}>Published: {inv.date}</div>
                                {inv.type === 'proforma' && (
                                  <a 
                                    href={getAssetUrl(`invoices/proforma_${po.id}.pdf`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline"
                                  >
                                    <FileText size={12} /> Download PDF
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 20 }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                width: 40, height: 40, borderRadius: 12, border: "1px solid var(--ui-border-input)",
                background: "var(--ui-bg-input)", color: "var(--ui-text-secondary)", cursor: currentPage === 1 ? "not-allowed" : "pointer", transition: "all 0.3s ease"
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: 14, color: "var(--ui-text-secondary)", fontWeight: 600, transition: "color 0.3s ease" }}>
              Page {currentPage} of {lastPage}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              style={{
                width: 40, height: 40, borderRadius: 12, border: "1px solid var(--ui-border-input)",
                background: "var(--ui-bg-input)", color: "var(--ui-text-secondary)", cursor: currentPage === lastPage ? "not-allowed" : "pointer", transition: "all 0.3s ease"
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
