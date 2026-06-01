import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { importCatalogue, getCatalogues, createCatalogue, updateCatalogue, getCsrfCookie } from "../lib/api";
import { 
  Plus, Check, Loader2, Package, Search, UploadCloud, FileText, 
  ChevronRight, X, LayoutGrid, List
} from "lucide-react";

export default function Catalogue() {
  const [company, setCompany] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Catalogue list state
  const [items, setItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Manual Entry Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    item_code: "",
    name: "",
    category: "",
    specifications: "",
    uom: "Pc",
  });
  const [editingItem, setEditingItem] = useState<any | null>(null);

  useEffect(() => {
    const activeComp = localStorage.getItem("active_company");
    if (activeComp) {
      const ac = JSON.parse(activeComp);
      setCompany(ac);
      fetchItems(ac.id);
    }
    
    // Initialize CSRF cookie
    getCsrfCookie().catch(err => {
      console.warn("Failed to initialize CSRF cookie:", err);
    });
  }, []);

  const fetchItems = async (cid: number) => {
    setItemsLoading(true);
    try {
      const res = await getCatalogues({ company_id: cid });
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch items", err);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setLoading(true);
    setError(null);
    try {
      if (editingItem) {
        await updateCatalogue(editingItem.id, {
          ...formData,
          company_id: company.id,
          price: 0,
        });
      } else {
        await createCatalogue({
          ...formData,
          company_id: company.id,
          price: 0,
        });
      }
      setShowForm(false);
      setFormData({ item_code: "", name: "", category: "", specifications: "", uom: "Pc" });
      setEditingItem(null);
      fetchItems(company.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !company) { setError("Please select a file"); return; }
    
    setLoading(true); 
    setError(null);
    try {
      const fd = new FormData();
      fd.append("company_id", company.id.toString());
      fd.append("csv", file);
      const data = await importCatalogue(fd);
      setResult(data);
      setFile(null);
      // Wait a bit then refresh to let queue process (though simple import is usually fast)
      setTimeout(() => fetchItems(company.id), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Company Catalogue" subtitle="Manage your products, add new items manually, or import from Excel/CSV.">
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* Action Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 12 }}>
                  <button 
                    onClick={() => {
                      setEditingItem(null);
                      setFormData({ item_code: "", name: "", category: "", specifications: "", uom: "Pc" });
                      setShowForm(!showForm);
                    }}
              style={{
                padding: "12px 24px", borderRadius: 14, border: "none",
                background: showForm ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#f97316,#f59e0b)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s"
              }}
            >
              {showForm ? <><X size={18} /> Close Form</> : <><Plus size={18} /> Add New Item</>}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, maxWidth: 600 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} color="#6b7280" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text" 
                placeholder="Search your catalogue..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px 12px 48px", borderRadius: 16,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#fff", outline: "none", fontSize: 14, boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 12 }}>
              <button onClick={() => setViewMode("grid")} style={{ padding: 8, borderRadius: 8, border: "none", background: viewMode === "grid" ? "rgba(255,255,255,0.1)" : "transparent", cursor: "pointer" }}><LayoutGrid size={18} color={viewMode === "grid" ? "#fff" : "#6b7280"} /></button>
              <button onClick={() => setViewMode("list")} style={{ padding: 8, borderRadius: 8, border: "none", background: viewMode === "list" ? "rgba(255,255,255,0.1)" : "transparent", cursor: "pointer" }}><List size={18} color={viewMode === "list" ? "#fff" : "#6b7280"} /></button>
            </div>
          </div>
        </div>

        {/* Manual Entry Form */}
        {showForm && (
          <div className="glass-panel" style={{ padding: 32, borderRadius: 24, border: "1px solid rgba(249,115,22,0.2)", background: "rgba(249,115,22,0.02)" }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: 18, fontWeight: 800, color: "#fff" }}>Add New Product</h3>
            <form onSubmit={handleManualSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <Field label="Item Code" value={formData.item_code} onChange={(v:any) => setFormData({...formData, item_code: v})} placeholder="e.g. SKA-001" required />
              <Field label="Product Name" value={formData.name} onChange={(v:any) => setFormData({...formData, name: v})} placeholder="e.g. Hydraulic Pump" required />
              <Field label="Category" value={formData.category} onChange={(v:any) => setFormData({...formData, category: v})} placeholder="e.g. Spareparts" />
              <Field label="UOM" value={formData.uom} onChange={(v:any) => setFormData({...formData, uom: v})} placeholder="e.g. Pc, Box" required />
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Specifications</label>
                <textarea 
                  value={formData.specifications} 
                  onChange={e => setFormData({...formData, specifications: e.target.value})}
                  placeholder="Detailed description..."
                  style={{ ...inputStyle, height: 80, marginTop: 6, resize: "none" }}
                />
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={loading} style={primaryBtn}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Import Section */}
        {!showForm && (
          <div className="glass-panel" style={{ padding: 24, borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>Bulk Import</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Upload your catalogue via Excel or CSV file.</p>
              </div>
              <form onSubmit={handleImportSubmit} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input type="file" accept=".csv,.xlsx,.xls" id="csv-upload" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
                <label htmlFor="csv-upload" style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, cursor: "pointer", fontSize: 13, color: file ? "#fff" : "#6b7280"
                }}>
                  <UploadCloud size={16} /> {file ? file.name : "Select file..."}
                </label>
                <button type="submit" disabled={loading || !file} style={{ ...primaryBtn, padding: "10px 20px", opacity: (!file || loading) ? 0.5 : 1 }}>
                  {loading ? "Processing..." : "Import"}
                </button>
              </form>
            </div>
            {result && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12, color: "#34d399", fontSize: 13 }}>
                ✓ Catalogue update has been queued and will be visible shortly.
              </div>
            )}
          </div>
        )}

        {/* Item List */}
        <div style={{ minHeight: 400 }}>
          {itemsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "100px 0" }}>
              <Loader2 className="animate-spin" color="#f59e0b" size={32} />
              <span style={{ fontSize: 14, color: "#6b7280" }}>Fetching your products...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 0", background: "rgba(255,255,255,0.01)", borderRadius: 24, border: "1px dashed rgba(255,255,255,0.05)" }}>
              <Package size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: 16 }} />
              <h3 style={{ color: "#fff", margin: 0 }}>No products found</h3>
              <p style={{ color: "#6b7280", marginTop: 8 }}>{searchTerm ? "Try another search term" : "Start by adding your first product"}</p>
            </div>
          ) : viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filteredItems.map(item => (
                <div key={item.id} className="glass-panel" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, transition: "all 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#fb923c", background: "rgba(251,146,60,0.1)", padding: "4px 10px", borderRadius: 6, letterSpacing: "0.05em" }}>
                      {item.item_code}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>{item.name}</h4>
                    <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 4 }}>{item.category || "General"}</div>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "12px 0 0", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.specifications || "No detailed specifications provided."}
                    </p>
                  </div>
                  <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#4b5563" }}>UOM: <strong style={{ color: "#9ca3af" }}>{item.uom}</strong></span>
                        <button type="button" onClick={() => {
                          setEditingItem(item);
                          setShowForm(true);
                          setFormData({
                            item_code: item.item_code || "",
                            name: item.name || "",
                            category: item.category || "",
                            specifications: item.specifications || "",
                            uom: item.uom || "Pc",
                          });
                        }} style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      Edit <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ overflow: "hidden", borderRadius: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <th style={{ padding: "16px 24px", color: "#6b7280", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Item Info</th>
                    <th style={{ padding: "16px 24px", color: "#6b7280", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Category</th>
                    <th style={{ padding: "16px 24px", color: "#6b7280", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>UOM</th>
                    <th style={{ padding: "16px 24px", color: "#6b7280", fontSize: 11, fontWeight: 800, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "all 0.2s" }}>
                      <td style={{ padding: "20px 24px" }}>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                        <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2, fontFamily: "monospace" }}>{item.item_code}</div>
                      </td>
                      <td style={{ padding: "20px 24px" }}>
                        <span style={{ color: "#fdba74", fontSize: 13 }}>{item.category || "General"}</span>
                      </td>
                      <td style={{ padding: "20px 24px", color: "#9ca3af", fontSize: 13 }}>{item.uom}</td>
                      <td style={{ padding: "20px 24px", textAlign: "right" }}>
                        <button type="button" onClick={() => {
                          setEditingItem(item);
                          setShowForm(true);
                          setFormData({
                              item_code: item.item_code || "",
                              name: item.name || "",
                              category: item.category || "",
                              specifications: item.specifications || "",
                              uom: item.uom || "Pc",
                            });
                        }} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px", borderRadius: 10, color: "#fff", fontSize: 12, cursor: "pointer" }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const lbl: React.CSSProperties = { fontSize: 12, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#fff",
  outline: "none", width: "100%", boxSizing: "border-box", transition: "all 0.2s"
};
const primaryBtn: React.CSSProperties = {
  padding: "12px 24px", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer",
  border: "none", background: "linear-gradient(135deg,#f97316,#f59e0b)", color: "#fff",
  display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
};

function Field({ label, value, onChange, type = "text", placeholder, required }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={lbl}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type}
        placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  );
}
