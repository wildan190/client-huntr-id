import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "../components/Layout";
import {
  FileText, RefreshCw, ChevronDown, ChevronRight, Loader2,
  Calendar, Building, User, CheckCircle2, ChevronLeft, Package, Clock, UploadCloud, FileSpreadsheet, X, Search
} from "lucide-react";
import { getOrders, uploadCompanyDocument, importHistoricalPo, importCatalogue } from "../lib/api";

export default function Orders() {
  const navigate = useNavigate();
  
  // App state
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // PO State
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "operational" | "historical">("all");
  const [expandedPo, setExpandedPo] = useState<number | null>(null);
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
  }, [navigate]);

  useEffect(() => {
    if (company) {
      const timer = setTimeout(() => {
        fetchOrders(company.id, 1, searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, company]);

  const fetchOrders = async (companyId: number, page: number, search: string = "") => {
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
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", padding: "0 32px 40px" }}>
        
        {/* Header Summary Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(15,15,35,0.7), rgba(30,20,50,0.5))",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 24,
          padding: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
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
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#f3f4f6", margin: 0 }}>
                List of {company.type === "buyer" ? "Purchase Orders" : "Catalogue Items"} ({totalOrders})
              </h2>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "6px 0 0" }}>
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
                cursor: "pointer", color: "#fb923c", fontWeight: 700, fontSize: 13,
              }}
            >
              <UploadCloud size={18} /> Import {company.type === "buyer" ? "Historical PO" : "Catalogue"}
            </button>

            <button
              onClick={() => fetchOrders(company.id, currentPage)}
              disabled={refreshing}
              style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#9ca3af", transition: "all 0.2s",
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
              background: "#141008", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28,
              width: "100%", maxWidth: 500, padding: 32, display: "flex", flexDirection: "column", gap: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>
                  Import {company.type === "buyer" ? "Historical PO" : "Catalogue"}
                </h3>
                <button onClick={() => setShowImportModal(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}><X size={20} /></button>
              </div>

              <div style={{ 
                padding: 40, border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 20, textAlign: "center",
                background: "rgba(255,255,255,0.02)", cursor: "pointer",
              }} onClick={() => document.getElementById("csv-input")?.click()}>
                <FileSpreadsheet size={48} color={importFile ? "#f59e0b" : "rgba(255,255,255,0.1)"} style={{ marginBottom: 16 }} />
                <p style={{ color: importFile ? "#fff" : "#9ca3af", margin: 0, fontSize: 14, fontWeight: 600 }}>
                  {importFile ? importFile.name : "Click to select CSV file"}
                </p>
                <p style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>Format must match user_story.md headers</p>
                <input id="csv-input" type="file" accept=".csv" style={{ display: "none" }} onChange={e => setImportFile(e.target.files?.[0] || null)} />
              </div>

              {importError && (
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 13 }}>
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 13 }}>
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
                  boxShadow: "0 8px 20px rgba(249,115,22,0.2)", opacity: (isImporting || !importFile) ? 0.6 : 1,
                }}
              >
                {isImporting ? <Loader2 size={20} className="animate-spin" /> : "Start Import"}
              </button>
            </div>
          </div>
        )}

        {/* Tab Selection & Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.02)", padding: 6, borderRadius: 16, width: "fit-content" }}>
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
                  color: activeTab === tab.id ? "#fdba74" : "#6b7280",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={18} color="#6b7280" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search by PO number, vendor, or user..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px 12px 48px", borderRadius: 16,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff", outline: "none", fontSize: 14, transition: "all 0.2s",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* PO Table/List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", background: "rgba(255,255,255,0.01)", borderRadius: 32, border: "1px dashed rgba(255,255,255,0.06)" }}>
              <FileText size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
              <h3 style={{ color: "#9ca3af", margin: 0, fontSize: 16 }}>No purchase orders found</h3>
            </div>
          ) : (
            filteredOrders.map(po => (
              <div key={po.id} style={{
                background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
                padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20, transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", background: "rgba(249,115,22,0.1)", padding: "2px 8px", borderRadius: 6 }}>
                        {po.po_number}
                      </span>
                      {po.is_historical && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                          Historical
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f3f4f6" }}>{po.rfq?.title || "Purchase Order Document"}</h3>
                  </div>

                  <div style={{ width: 200 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Vendor</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Building size={14} color="#9ca3af" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{po.vendor_name || "N/A"}</span>
                    </div>
                  </div>

                  <div style={{ width: 160 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Date</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={14} color="#9ca3af" />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{po.order_date || new Date(po.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ width: 140 }}>
                    <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Status</div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10,
                      background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 12, fontWeight: 700,
                    }}>
                      <CheckCircle2 size={14} /> Issued
                    </div>
                  </div>

                  <button 
                    onClick={() => setExpandedPo(expandedPo === po.id ? null : po.id)}
                    style={{
                      width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {expandedPo === po.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>

                {expandedPo === po.id && (
                  <div style={{ 
                    padding: "32px", borderRadius: 20, background: "rgba(0,0,0,0.3)", 
                    border: "1px solid rgba(255,255,255,0.06)", marginTop: 8,
                    display: "flex", flexDirection: "column", gap: 32,
                    boxShadow: "inset 0 4px 24px rgba(0,0,0,0.2)"
                  }}>
                    {/* Upper Detail Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 40 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Metadata & Identity</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#e5e7eb" }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <User size={14} color="#fb923c" />
                              </div>
                              <span>Issued by: <strong style={{ color: "#fff" }}>{po.created_by || "System"}</strong></span>
                            </div>
                            {po.approved_by && (
                              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#e5e7eb" }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <CheckCircle2 size={14} color="#4ade80" />
                                </div>
                                <span>Approved by: <strong style={{ color: "#fff" }}>{po.approved_by}</strong></span>
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#e5e7eb" }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Clock size={14} color="#9ca3af" />
                              </div>
                              <span>Last Update: <strong style={{ color: "#fff" }}>{new Date(po.updated_at).toLocaleString()}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Classification</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ fontSize: 13, color: "#9ca3af" }}>Category: <strong style={{ color: "#e5e7eb" }}>{po.purchase_category || "N/A"}</strong></div>
                          <div style={{ fontSize: 13, color: "#9ca3af" }}>Type: <strong style={{ color: "#e5e7eb" }}>{po.purchase_type || "N/A"}</strong></div>
                          <div style={{ fontSize: 13, color: "#9ca3af" }}>Department: <strong style={{ color: "#e5e7eb" }}>{po.department || "N/A"}</strong></div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 16, background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Financial Summary</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
                          <span style={{ fontSize: 14, color: "#fb923c", marginRight: 6 }}>{po.currency || "IDR"}</span>
                          {Number(po.total_amount || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} /> All taxes included
                        </div>
                      </div>
                    </div>

                    {/* Item Breakdown Table */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ fontSize: 12, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Item Breakdown</h4>
                        <span style={{ fontSize: 11, color: "#4b5563", fontWeight: 600 }}>{po.items?.length || 0} line items</span>
                      </div>
                      
                      <div style={{ overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                          <thead>
                            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                              <th style={{ padding: "14px 20px", color: "#6b7280", fontWeight: 700, fontSize: 11 }}>ITEM NAME & CODE</th>
                              <th style={{ padding: "14px 20px", color: "#6b7280", fontWeight: 700, fontSize: 11 }}>QTY</th>
                              <th style={{ padding: "14px 20px", color: "#6b7280", fontWeight: 700, fontSize: 11 }}>UNIT PRICE</th>
                              <th style={{ padding: "14px 20px", color: "#6b7280", fontWeight: 700, fontSize: 11 }}>TAX</th>
                              <th style={{ padding: "14px 20px", color: "#6b7280", fontWeight: 700, fontSize: 11, textAlign: "right" }}>SUBTOTAL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {po.items?.map((item: any, idx: number) => (
                              <tr key={idx} style={{ borderBottom: idx === (po.items?.length - 1) ? "none" : "1px solid rgba(255,255,255,0.03)" }}>
                                <td style={{ padding: "16px 20px" }}>
                                  <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>{item.inventory_name}</div>
                                  <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>{item.inventory_code || "NO-CODE"} • {item.pr_reference_number || "NO-PR"}</div>
                                </td>
                                <td style={{ padding: "16px 20px", color: "#e5e7eb" }}>
                                  <strong style={{ color: "#fdba74" }}>{item.qty}</strong> <span style={{ fontSize: 11, color: "#6b7280" }}>{item.uom}</span>
                                </td>
                                <td style={{ padding: "16px 20px", color: "#e5e7eb" }}>
                                  {Number(item.unit_price).toLocaleString()}
                                </td>
                                <td style={{ padding: "16px 20px", color: "#f87171", fontSize: 12 }}>
                                  {Number(item.tax_amount) > 0 ? `+${Number(item.tax_amount).toLocaleString()}` : "—"}
                                </td>
                                <td style={{ padding: "16px 20px", color: "#fff", fontWeight: 800, textAlign: "right" }}>
                                  {Number(item.total_amount).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)", color: "#9ca3af", cursor: currentPage === 1 ? "not-allowed" : "pointer"
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600 }}>
              Page {currentPage} of {lastPage}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              style={{
                width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)", color: "#9ca3af", cursor: currentPage === lastPage ? "not-allowed" : "pointer"
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
