import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "../components/Layout";
import {
  Building2, MapPin, CreditCard, UploadCloud, CheckCircle2,
  AlertCircle, FileSpreadsheet, Loader2, RefreshCw, FileText, Plus, ChevronDown, ChevronLeft, ChevronRight, UserPlus, Users, MessageCircle, Mail
} from "lucide-react";
import { getMyCompanies, importCatalogue, importHistoricalPo, getCatalogues, getHistoricalPos, updateCompany, uploadCompanyDocument, uploadCompanyLogo, getCsrfCookie, inviteUser, getTeamMembers } from "../lib/api";

export default function CompanyDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Vendor state
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [cataloguesLoading, setCataloguesLoading] = useState(false);

  // Buyer state
  const [historicalPos, setHistoricalPos] = useState<any[]>([]);
  const [posLoading, setPosLoading] = useState(false);
  const [expandedPo, setExpandedPo] = useState<number | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [companyDocType, setCompanyDocType] = useState("NPWP");
  const [companyDocUploading, setCompanyDocUploading] = useState(false);
  const [companyDocSuccess, setCompanyDocSuccess] = useState(false);
  const [companyDocError, setCompanyDocError] = useState<string | null>(null);
  const [companyDocDragActive, setCompanyDocDragActive] = useState(false);
  const companyDocInputRef = useRef<HTMLInputElement>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [showCompanyWorkspace, setShowCompanyWorkspace] = useState(false);
  const [companyListLoading, setCompanyListLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Team state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ whatsapp: "", email: "", role: "" });
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const fetchCompanyData = async (userId: number, activeId: number, companyType?: string) => {
    try {
      const data = await getMyCompanies(userId);
      // If getMyCompanies returns no companies, or user not found
      if (!data.companies || data.companies.length === 0) {
        localStorage.removeItem("active_company");
        localStorage.removeItem("user_session");
        navigate("/login");
        return;
      }

      const found = data.companies?.find((c: any) => c.id === activeId);
      if (found) {
        setCompany(found);
        localStorage.setItem("active_company", JSON.stringify(found));
        
        // Update editForm with latest data
        setEditForm({
          name: found.name || "",
          tax_id: found.tax_id || "",
          email: found.email || "",
          phone: found.phone || "",
          provincy_country: found.provincy_country || "Indonesia",
          region: found.region || "",
          regency: found.regency || "",
          city: found.city || "",
          zip_code: found.zip_code || "",
          address: found.address || "",
          bank_name: found.bank_name || "",
          bank_account: found.bank_account || "",
          bank_account_name: found.bank_account_name || "",
          about: found.about || "",
          industry_type: found.industry_type || "",
        });

        // Fetch the correct data depending on company type
        if ((companyType || found.type) === 'buyer') {
          fetchHistoricalPos(found.id);
        } else {
          fetchCatalogues(found.id);
        }
      } else {
        localStorage.removeItem("active_company");
        navigate("/select-company");
      }
    } catch (err) {
      console.error("Failed to sync company data", err);
      localStorage.removeItem("active_company");
      localStorage.removeItem("user_session");
      navigate("/login");
    }
  };

  const fetchCatalogues = async (companyId: number) => {
    setCataloguesLoading(true);
    try {
      const res = await getCatalogues({ company_id: companyId });
      setCatalogues(res.data || res);
    } catch (err) {
      console.error("Failed to fetch catalogues", err);
    } finally {
      setCataloguesLoading(false);
    }
  };

  const fetchHistoricalPos = async (companyId: number) => {
    setPosLoading(true);
    try {
      const res = await getHistoricalPos(companyId);
      setHistoricalPos(res.data || []);
    } catch (err) {
      console.error("Failed to fetch historical POs", err);
    } finally {
      setPosLoading(false);
    }
  };

  const fetchTeamMembers = async (companyId: string | number) => {
    setTeamLoading(true);
    try {
      const res = await getTeamMembers(companyId);
      setTeamMembers(res.members || []);
    } catch (err) {
      console.error("Failed to fetch team members", err);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await inviteUser({
        company_id: company.id,
        ...inviteForm,
      });
      
      setInviteSuccess("Invitation link generated! Opening WhatsApp...");
      setInviteForm({ whatsapp: "", email: "", role: "" });
      
      // Open WhatsApp link in new tab
      if (res.whatsapp_link) {
        window.open(res.whatsapp_link, "_blank");
      }
    } catch (err: any) {
      setInviteError(err.message || "Failed to send invitation.");
    } finally {
      setIsInviting(false);
    }
  };

  const getLogoUrl = (logoPath?: string) => {
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    const base = import.meta.env.VITE_BASE_URL_IMAGE || `${import.meta.env.VITE_API_URL}/storage`;
    return `${base}/${logoPath}`;
  };

  const fetchCompanyList = async (userId: number, activeId?: number) => {
    setCompanyListLoading(true);
    try {
      const data = await getMyCompanies(userId);
      const list = data.companies || [];
      setCompanies(list);
      if (activeId) {
        const current = list.find((c: any) => c.id === activeId);
        if (current) setSelectedWorkspace(current);
      }
    } catch (err) {
      console.error("Failed to load company list", err);
    } finally {
      setCompanyListLoading(false);
    }
  };

  const openCompanyWorkspace = async (workspace: any) => {
    setShowCompanyWorkspace(true);
    setCompany(workspace);
    setSelectedWorkspace(workspace);
    localStorage.setItem("active_company", JSON.stringify(workspace));
    if (user?.id) await fetchCompanyData(user.id, workspace.id, workspace.type);
  };

  const handleBackToCompanies = () => {
    setShowCompanyWorkspace(false);
  };

  const handleLogoUpload = async (file: File) => {
    if (!company) return;
    setLogoUploading(true);
    setLogoError(null);

    const fd = new FormData();
    fd.append("company_id", String(company.id));
    fd.append("logo", file);

    try {
      const res = await uploadCompanyLogo(fd);
      const updated = res.company || res;
      setCompany(updated);
      localStorage.setItem("active_company", JSON.stringify(updated));
    } catch (err: any) {
      setLogoError(err.message || "Failed to upload logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updatingCompany, setUpdatingCompany] = useState(false);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    const activeComp = localStorage.getItem("active_company");
    if (!userSession) {
      navigate("/login");
      return;
    }

    const u = JSON.parse(userSession);
    const ac = activeComp ? JSON.parse(activeComp) : null;
    setUser(u);

    if (ac) {
      setSelectedWorkspace(ac);
      setCompany(ac);
      setEditForm({
        name: ac.name || "",
        tax_id: ac.tax_id || "",
        email: ac.email || "",
        phone: ac.phone || "",
        provincy_country: ac.provincy_country || "Indonesia",
        region: ac.region || "",
        regency: ac.regency || "",
        city: ac.city || "",
        zip_code: ac.zip_code || "",
        address: ac.address || "",
        bank_name: ac.bank_name || "",
        bank_account: ac.bank_account || "",
        bank_account_name: ac.bank_account_name || "",
        about: ac.about || "",
        industry_type: ac.industry_type || "",
      });
    }

    // Initialize CSRF cookie
    getCsrfCookie().catch(err => {
      console.warn("Failed to initialize CSRF cookie:", err);
    });

    fetchCompanyList(u.id, ac?.id).finally(() => setLoading(false));
    if (ac) fetchCompanyData(u.id, ac.id, ac.type);
  }, [navigate]);

  const handleSaveCompany = async () => {
    if (!company) return;
    setUpdatingCompany(true);
    setUpdateError(null);
    try {
      const res = await updateCompany(company.id, editForm);
      const updated = res.company || res;
      setCompany(updated);
      localStorage.setItem("active_company", JSON.stringify(updated));
      setIsEditing(false);
      await fetchCompanyData(user.id, company.id);
    } catch (err: any) {
      setUpdateError(err.message || "Failed to update company info.");
    } finally {
      setUpdatingCompany(false);
    }
  };

  const handleRefresh = async () => {
    if (!user || !company) return;
    setRefreshing(true);
    if (company.type === 'buyer') {
      await fetchHistoricalPos(company.id);
    } else {
      await fetchCatalogues(company.id);
    }
    setRefreshing(false);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !company) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const fd = new FormData();
    fd.append("company_id", String(company.id));
    fd.append("csv", selectedFile);

    try {
      if (company.type === "buyer") {
        await importHistoricalPo(fd);
      } else {
        await importCatalogue(fd);
      }
      setUploadSuccess(true);
      setSelectedFile(null);
      await fetchCompanyData(user.id, company.id);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const uploadCompanyDocuments = async (files: FileList | File[]) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    for (const file of fileArray) {
      await handleCompanyDocumentUpload(file);
    }
  };

  const handleCompanyDocumentUpload = async (file: File) => {
    if (!company) return;
    setCompanyDocUploading(true);
    setCompanyDocError(null);
    setCompanyDocSuccess(false);

    const fd = new FormData();
    fd.append("company_id", String(company.id));
    fd.append("type", companyDocType);
    fd.append("document", file);

    try {
      await uploadCompanyDocument(fd);
      setCompanyDocSuccess(true);
      await fetchCompanyData(user.id, company.id);
    } catch (err: any) {
      setCompanyDocError(err.message || "Failed to upload document.");
    } finally {
      setCompanyDocUploading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "team" && company?.id) {
      fetchTeamMembers(company.id);
    }
  }, [activeTab, company?.id]);

  if (loading) {
    return (
      <Layout title="Company" subtitle="Loading company workspace details...">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 14 }}>
          <Loader2 size={32} className="animate-spin" color="#f59e0b" />
          <span style={{ fontSize: 13, color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>Fetching workspace settings...</span>
        </div>
      </Layout>
    );
  }

  if (!showCompanyWorkspace) {
    return (
      <Layout title="Company" subtitle="Choose a company workspace">
        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)", margin: 0, transition: "color 0.3s ease" }}>Pilih Perusahaan</h2>
              <p style={{ fontSize: 13, color: "var(--ui-text-secondary)", margin: "8px 0 0", transition: "color 0.3s ease" }}>
                Pilih perusahaan yang ingin Anda kelola dari daftar workspace yang tersedia.
              </p>
            </div>
            <button
              onClick={() => navigate("/onboarding")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 18px", borderRadius: 14,
                border: "1px solid var(--ui-border-subtle)",
                background: "var(--ui-bg-input)", color: "var(--ui-text-primary)",
                cursor: "pointer", fontWeight: 700, transition: "all 0.3s ease",
              }}
            >
              <Plus size={16} /> Register another company
            </button>
          </div>

          {companyListLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Loader2 size={32} className="animate-spin" color="#f59e0b" />
            </div>
          ) : companies.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, borderRadius: 20, background: "var(--ui-bg-input)", border: "1px solid var(--ui-border)", transition: "all 0.3s ease" }}>
              <p style={{ color: "var(--ui-text-secondary)", fontSize: 14, margin: 0, transition: "color 0.3s ease" }}>No company workspaces found. Please register one first.</p>
              {user?.role === "owner" && (
                <button
                  onClick={() => navigate("/onboarding")}
                  style={{ marginTop: 16, padding: "10px 18px", borderRadius: 12, border: "none", background: "var(--huntr-gradient)", color: "#fff", fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease" }}
                >
                  Register a Company
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
              {companies.map(c => {
                const active = selectedWorkspace?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => openCompanyWorkspace(c)}
                    style={{
                      textAlign: "left",
                      borderRadius: 28,
                      padding: "24px",
                      border: active ? "1px solid rgba(249,115,22,0.35)" : `1px solid var(--ui-border)`,
                      background: active ? "var(--ui-gradient-active-card)" : "var(--ui-bg-card)",
                      boxShadow: active ? "var(--ui-shadow-orange)" : "0 16px 35px rgba(0,0,0,0.08)",
                      cursor: "pointer",
                      display: "grid",
                      gap: 18,
                      alignItems: "start",
                      transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0px)")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 58, height: 58, borderRadius: 20, overflow: "hidden", background: "var(--ui-bg-input)", display: "grid", placeItems: "center" }}>
                        {getLogoUrl(c.logo) ? (
                          <img src={getLogoUrl(c.logo)!} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(249,115,22,0.15)", display: "grid", placeItems: "center" }}>
                            <Building2 size={18} color="var(--huntr-accent)" />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "var(--ui-text-primary)", lineHeight: 1.1 }}>{c.name}</div>
                        <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--ui-text-brand)", background: "rgba(249,115,22,0.12)", padding: "4px 10px", borderRadius: 999, textTransform: "uppercase" }}>
                            {c.type?.toUpperCase() || "WORKSPACE"}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--ui-text-secondary)", background: "var(--ui-bg-input)", padding: "4px 10px", borderRadius: 999 }}>
                            ID #{c.id ? String(c.id).substring(0, 8).toUpperCase() : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: active ? "var(--ui-status-selected)" : "var(--ui-status-active)" }} />
                          <span style={{ fontSize: 12, color: "var(--ui-text-secondary)" }}>
                            {active ? "Selected workspace" : "Tap to open workspace"}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--ui-text-primary)", background: c.status === "approved" ? "rgba(52,211,153,0.14)" : c.status === "pending" ? "rgba(251,191,36,0.14)" : "rgba(248,113,113,0.14)", padding: "6px 12px", borderRadius: 999, border: c.status === "approved" ? "1px solid rgba(52,211,153,0.24)" : c.status === "pending" ? "1px solid rgba(251,191,36,0.24)" : "1px solid rgba(248,113,113,0.24)" }}>
                          {c.status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                      <div style={{ display: "grid", gap: 8, color: "var(--ui-text-secondary)" }}>
                        <div style={{ fontSize: 13, color: "var(--ui-text-primary)" }}>{c.tax_id ? `NPWP: ${c.tax_id}` : "Tax ID belum tersedia"}</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: "var(--ui-text-muted)", fontSize: 12 }}>
                          {c.email && <span>{c.email}</span>}
                          {c.phone && <span>{c.phone}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "var(--ui-text-muted)" }}>Workspace opened {c.updated_at ? `• ${new Date(c.updated_at).toLocaleDateString()}` : "recently"}</span>
                      <span style={{ fontSize: 12, color: "var(--huntr-accent)", fontWeight: 700 }}>Manage</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  const isBuyer = company.type === "buyer";

  const statusColor: Record<string, { text: string; bg: string; border: string }> = {
    approved: { text: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
    pending:  { text: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)"  },
    rejected: { text: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  };
  const sMeta = statusColor[company.status] || { text: "#9ca3af", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)" };

  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: Building2 },
    { id: "location", label: "Address & Location", icon: MapPin },
    { id: "banking", label: "Banking & Escrow", icon: CreditCard },
    { id: "documents", label: isBuyer ? "Spend & PO Data" : "Product Catalogue", icon: FileText },
    { id: "team", label: "Team Members", icon: Users },
  ];

  return (
    <Layout
      title="Company Settings"
      subtitle="View and manage verified corporate profiles, billing, and document logs."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
        
        {/* Workspace Card Header */}
        <div style={{
          background: "var(--ui-bg-card)",
          border: "1px solid var(--ui-border)",
          borderRadius: 20,
          padding: "24px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
          backdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: "linear-gradient(135deg,#f97316,#f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(249,115,22,0.25)",
            }}>
              <Building2 size={26} color="#fff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)", margin: 0, letterSpacing: "-0.3px", transition: "color 0.3s ease" }}>
                  {company.name}
                </h2>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  background: company.type === "buyer" ? "rgba(59,130,246,0.12)" : "rgba(251,146,60,0.12)",
                  color: company.type === "buyer" ? "#60a5fa" : "#c084fc",
                  padding: "3px 8px", borderRadius: 6, letterSpacing: "0.06em",
                }}>
                  {company.type}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--ui-text-muted)", margin: "4px 0 0", transition: "color 0.3s ease" }}>
                Company ID: <strong style={{ color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>#{company.id ? String(company.id).substring(0, 8).toUpperCase() : ""}</strong> · Tax ID: <strong style={{ color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>{company.tax_id || "N/A"}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={handleBackToCompanies}
              style={{
                background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-subtle)",
                borderRadius: 10, padding: "8px 14px", color: "var(--ui-text-secondary)",
                fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex",
                alignItems: "center", gap: 8, transition: "all 0.3s ease",
              }}
            >
              <ChevronLeft size={14} /> Switch Company
            </button>
            <button
              onClick={() => navigate("/onboarding")}
              style={{
                background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)",
                borderRadius: 10, padding: "8px 14px", color: "var(--huntr-accent)",
                fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex",
                alignItems: "center", gap: 8, transition: "all 0.3s ease",
              }}
            >
              <Plus size={14} /> Add Company
            </button>
            <div style={{
              background: sMeta.bg, border: `1px solid ${sMeta.border}`,
              borderRadius: 20, padding: "6px 14px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: sMeta.text }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: sMeta.text, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {company.status || "Pending"}
              </span>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-subtle)",
                borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--ui-text-secondary)", transition: "all 0.3s ease",
              }}
              title="Sync latest data"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

          {/* Tab Selection & Edit Actions */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--ui-border)",
            gap: 12,
            padding: "0 4px",
            transition: "all 0.3s ease",
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {tabs.map(t => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "12px 18px", background: "none", border: "none",
                      borderBottom: active ? "2px solid var(--huntr-amber)" : "2px solid transparent",
                      color: active ? "var(--huntr-accent)" : "var(--ui-text-muted)",
                      fontWeight: active ? 700 : 500, fontSize: 13,
                      cursor: "pointer", transition: "all 0.3s ease",
                      marginBottom: -1,
                    }}
                  >
                    <Icon size={15} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Edit / Save controls */}
            {activeTab !== "documents" && (
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setEditForm({
                        name: company.name || "",
                        tax_id: company.tax_id || "",
                        email: company.email || "",
                        phone: company.phone || "",
                        provincy_country: company.provincy_country || "Indonesia",
                        region: company.region || "",
                        regency: company.regency || "",
                        city: company.city || "",
                        zip_code: company.zip_code || "",
                        address: company.address || "",
                        bank_name: company.bank_name || "",
                        bank_account: company.bank_account || "",
                        bank_account_name: company.bank_account_name || "",
                        about: company.about || "",
                        industry_type: company.industry_type || "",
                      });
                      setIsEditing(true);
                      setUpdateError(null);
                    }}
                    style={{
                      background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
                      borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700,
                      color: "var(--huntr-accent)", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    Edit Data Perusahaan
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={updatingCompany}
                      style={{
                        background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-subtle)",
                        borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700,
                        color: "var(--ui-text-secondary)", cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveCompany}
                      disabled={updatingCompany}
                      style={{
                        background: "var(--huntr-gradient)", border: "none",
                        borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 800,
                        color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        boxShadow: "0 4px 12px rgba(249,115,22,0.2)", transition: "all 0.2s",
                      }}
                    >
                      {updatingCompany ? <><Loader2 size={12} className="animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* TEAM TAB */}
            {activeTab === "team" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {/* Invite Form */}
                <div style={{ padding: 28, borderRadius: 24, background: "rgba(249,115,22,0.03)", border: "1px solid rgba(249,115,22,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--huntr-orange)", display: "grid", placeItems: "center", color: "#fff" }}>
                      <UserPlus size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: 0 }}>Invite Team Member</h3>
                      <p style={{ fontSize: 12, color: "var(--ui-text-muted)", margin: "4px 0 0" }}>Add colleagues to your workspace via WhatsApp.</p>
                    </div>
                  </div>

                  <form onSubmit={handleInviteUser} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>WhatsApp Number</span>
                      <div style={{ position: "relative" }}>
                        <MessageCircle size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ui-text-muted)" }} />
                        <input
                          required
                          placeholder="e.g. 628123456789"
                          value={inviteForm.whatsapp}
                          onChange={e => setInviteForm({ ...inviteForm, whatsapp: e.target.value })}
                          style={{
                            width: "100%", padding: "10px 14px 10px 40px", borderRadius: 12, background: "var(--ui-bg-input)",
                            border: "1px solid var(--ui-border-input)", color: "var(--ui-text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box"
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Email Address (Optional)</span>
                      <div style={{ position: "relative" }}>
                        <Mail size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ui-text-muted)" }} />
                        <input
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteForm.email}
                          onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                          style={{
                            width: "100%", padding: "10px 14px 10px 40px", borderRadius: 12, background: "var(--ui-bg-input)",
                            border: "1px solid var(--ui-border-input)", color: "var(--ui-text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box"
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Workspace Role</span>
                      <select
                        required
                        value={inviteForm.role}
                        onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                        style={{
                          width: "100%", padding: "10px 14px", borderRadius: 12, background: "var(--ui-bg-input)",
                          border: "1px solid var(--ui-border-input)", color: "var(--ui-text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box"
                        }}
                      >
                        <option value="">Select Role...</option>
                        <option value="manager">Manager (Full Access)</option>
                        {company.type === 'buyer' ? (
                          <>
                            <option value="buyer">Buyer</option>
                            <option value="finance">Finance</option>
                          </>
                        ) : (
                          <>
                            <option value="admin">Admin</option>
                            <option value="finance">Finance</option>
                          </>
                        )}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isInviting}
                      style={{
                        padding: "12px 24px", borderRadius: 12, background: "var(--huntr-orange)",
                        color: "#fff", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
                      }}
                    >
                      {isInviting ? <Loader2 size={16} className="animate-spin" /> : <><MessageCircle size={16} /> Send Invite</>}
                    </button>
                  </form>

                  {inviteError && <div style={{ marginTop: 16, fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.1)", padding: "10px 14px", borderRadius: 10 }}>{inviteError}</div>}
                  {inviteSuccess && <div style={{ marginTop: 16, fontSize: 12, color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "10px 14px", borderRadius: 10 }}>{inviteSuccess}</div>}
                </div>

                {/* Member List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: 0 }}>Team Members ({teamMembers.length})</h3>
                  </div>

                  {teamLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 size={24} className="animate-spin" color="var(--huntr-orange)" /></div>
                  ) : teamMembers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, background: "var(--ui-bg-input)", borderRadius: 20, border: "1px dashed var(--ui-border)" }}>
                      <p style={{ color: "var(--ui-text-muted)", fontSize: 14 }}>No members found. Start inviting your team!</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                      {teamMembers.map(member => (
                        <div key={member.id} style={{ padding: 20, borderRadius: 20, background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 16, background: "var(--ui-bg-input)", display: "grid", placeItems: "center", color: "var(--huntr-orange)", fontWeight: 900, fontSize: 18 }}>
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-primary)" }}>{member.name}</div>
                            <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 2 }}>{member.email || member.whatsapp}</div>
                          </div>
                          <div style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(249,115,22,0.1)", color: "var(--huntr-orange)", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
                            {member.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tab Panels */}
          <div style={{
            background: "var(--ui-bg-card)",
            border: "1px solid var(--ui-border)",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}>
            
            {updateError && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171",
                marginBottom: 20, display: "flex", alignItems: "center", gap: 8, transition: "all 0.3s ease",
              }}>
                <AlertCircle size={14} /> {updateError}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: "0 0 4px", transition: "color 0.3s ease" }}>Company Identity</h3>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 18, overflow: "hidden", background: "var(--ui-bg-input)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
                      {company.logo_path ? (
                        <img
                          src={getLogoUrl(company.logo_path) || undefined}
                          alt="Company logo"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Building2 size={32} color="var(--ui-text-secondary)" style={{ transition: "color 0.3s ease" }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>Company Logo</div>
                      <div style={{ fontSize: 12, color: "var(--ui-text-secondary)", marginTop: 4, transition: "color 0.3s ease" }}>Upload a logo to personalize this workspace.</div>
                    </div>
                  </div>
                  <div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      style={{ display: "none" }}
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleLogoUpload(file);
                          if (logoInputRef.current) logoInputRef.current.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={logoUploading}
                      style={{
                        padding: "10px 18px", borderRadius: 12, border: "1px solid var(--ui-border-subtle)",
                        background: "var(--ui-bg-input)", color: "var(--ui-text-primary)", fontWeight: 700, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.3s ease",
                      }}
                    >
                      {logoUploading ? "Uploading..." : company.logo_path ? "Change Logo" : "Upload Logo"}
                    </button>
                  </div>
                </div>
                {logoError && (
                  <div style={{ fontSize: 12, color: "#f87171", padding: "10px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 10, transition: "all 0.3s ease" }}>
                    {logoError}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {isEditing ? (
                    <>
                      <EditItem label="Company Name" value={editForm.name} onChange={v => setEditForm({ ...editForm, name: v })} />
                      <EditItem label="Tax ID (NPWP)" value={editForm.tax_id} onChange={v => setEditForm({ ...editForm, tax_id: v })} />
                      <EditItem label="Primary Contact Email" type="email" value={editForm.email} onChange={v => setEditForm({ ...editForm, email: v })} />
                      <EditItem label="Contact Phone / Whatsapp" value={editForm.phone} onChange={v => setEditForm({ ...editForm, phone: v })} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--huntr-orange-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Industry Type
                        </span>
                        <select
                          value={editForm.industry_type}
                          onChange={e => setEditForm({ ...editForm, industry_type: e.target.value })}
                          style={{
                            background: "var(--ui-bg-input)",
                            border: "1px solid rgba(249,115,22,0.25)",
                            borderRadius: 10,
                            padding: "10px 14px",
                            fontSize: 13,
                            color: "var(--ui-text-primary)",
                            outline: "none",
                            width: "100%",
                            boxSizing: "border-box",
                            cursor: "pointer",
                          }}
                        >
                          <option value="">Select Industry</option>
                          {[
                            "Technology",
                            "Manufacturing",
                            "Healthcare",
                            "Retail",
                            "Finance",
                            "Construction",
                            "Logistics",
                            "Agriculture",
                            "Education",
                            "Other",
                          ].map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Business Role Type
                        </span>
                        <span style={{
                          fontSize: 13, color: "var(--ui-text-secondary)", fontWeight: 500,
                          background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-subtle)",
                          padding: "10px 14px", borderRadius: 10, minHeight: 40, boxSizing: "border-box",
                          display: "flex", alignItems: "center",
                        }}>
                          {company.type?.toUpperCase()} (Non-Editable)
                        </span>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <EditItem label="About Company" textarea value={editForm.about} onChange={v => setEditForm({ ...editForm, about: v })} placeholder="Describe your company business profile, specialties, products or history..." />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoItem label="Company Name" value={company.name} />
                      <InfoItem label="Tax ID (NPWP)" value={company.tax_id || "Not registered"} />
                      <InfoItem label="Primary Contact Email" value={company.email || "No email registered"} />
                      <InfoItem label="Contact Phone / Whatsapp" value={company.phone || "No phone registered"} />
                      <InfoItem label="Industry Type" value={company.industry_type || "Not specified"} />
                      <InfoItem label="Business Role Type" value={company.type?.toUpperCase()} />
                      <InfoItem label="Verification Date" value={company.updated_at ? new Date(company.updated_at).toLocaleDateString() : "Pending"} />
                      <div style={{ gridColumn: "span 2" }}>
                        <InfoItem label="About Company" value={company.about || "No profile details added yet."} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* LOCATION TAB */}
            {activeTab === "location" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: "0 0 4px", transition: "color 0.3s ease" }}>Physical Business coordinates</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {isEditing ? (
                    <>
                      <EditItem label="Province / Country" value={editForm.provincy_country} onChange={v => setEditForm({ ...editForm, provincy_country: v })} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--huntr-orange-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Region / State
                        </span>
                        <select
                          value={editForm.region || ""}
                          onChange={e => setEditForm({ ...editForm, region: e.target.value })}
                          style={{
                            background: "var(--ui-bg-input)",
                            border: "1px solid rgba(249,115,22,0.25)",
                            borderRadius: 10,
                            padding: "10px 14px",
                            fontSize: 13,
                            color: "var(--ui-text-primary)",
                            outline: "none",
                            width: "100%",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="">Select Region...</option>
                          <option value="Indonesia">Indonesia</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Singapore">Singapore</option>
                        </select>
                      </div>
                      <EditItem label="Regency / Kabupaten" value={editForm.regency} onChange={v => setEditForm({ ...editForm, regency: v })} />
                      <EditItem label="City" value={editForm.city} onChange={v => setEditForm({ ...editForm, city: v })} />
                      <EditItem label="Zip Code" value={editForm.zip_code} onChange={v => setEditForm({ ...editForm, zip_code: v })} />
                      <div></div>
                      <div style={{ gridColumn: "span 2" }}>
                        <EditItem label="Full Street Address" textarea value={editForm.address} onChange={v => setEditForm({ ...editForm, address: v })} />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoItem label="Province / Country" value={company.provincy_country || "Not specified"} />
                      <InfoItem label="Region / State" value={company.region || "Not specified"} />
                      <InfoItem label="Regency / Kabupaten" value={company.regency || "Not specified"} />
                      <InfoItem label="City" value={company.city || "Not specified"} />
                      <InfoItem label="Zip Code" value={company.zip_code || "Not specified"} />
                      <div style={{ gridColumn: "span 2" }}>
                        <InfoItem label="Full Street Address" value={company.address || "Not specified"} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* BANKING TAB */}
            {activeTab === "banking" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: "0 0 4px", transition: "color 0.3s ease" }}>Banking Settlement</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {isEditing ? (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--huntr-orange-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Settlement Bank Name
                        </span>
                        <select
                          value={editForm.bank_name || ""}
                          onChange={e => setEditForm({ ...editForm, bank_name: e.target.value })}
                          style={{
                            background: "var(--ui-bg-input)",
                            border: "1px solid rgba(249,115,22,0.25)",
                            borderRadius: 10,
                            padding: "10px 14px",
                            fontSize: 13,
                            color: "var(--ui-text-primary)",
                            outline: "none",
                            width: "100%",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="">Select Bank...</option>
                          <option value="BNI">BNI</option>
                          <option value="Mandiri">Mandiri</option>
                          <option value="BCA">BCA</option>
                          <option value="BRI">BRI</option>
                        </select>
                      </div>
                      <EditItem label="Account Number" value={editForm.bank_account} onChange={v => setEditForm({ ...editForm, bank_account: v })} />
                      <div style={{ gridColumn: "span 2" }}>
                        <EditItem label="Account Holder Name" value={editForm.bank_account_name} onChange={v => setEditForm({ ...editForm, bank_account_name: v })} />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoItem label="Settlement Bank Name" value={company.bank_name || "Not set"} />
                      <InfoItem label="Account Number" value={company.bank_account || "Not set"} />
                      <div style={{ gridColumn: "span 2" }}>
                        <InfoItem label="Account Holder Name" value={company.bank_account_name || "Not set"} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          {/* DOCUMENTS & CATALOGUE TAB */}
          {activeTab === "documents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)", margin: "0 0 4px", transition: "color 0.3s ease" }}>
                  {isBuyer ? "Historical Spend / Purchase Orders" : "Product & Price Inventory"}
                </h3>
                <p style={{ fontSize: 12, color: "var(--ui-text-muted)", margin: 0, transition: "color 0.3s ease" }}>
                  {isBuyer
                    ? "Unggah file Excel PO historis. Data akan dikelompokkan per Order No dan disimpan lengkap dengan detail item-nya."
                    : "Unggah file Excel katalog produk Anda. Data akan masuk sebagai inventori harga yang dapat dipakai untuk merespons RFQ."}
                </p>
              </div>

              <div style={{ border: "1px solid var(--ui-border)", borderRadius: 20, padding: 22, background: "var(--ui-bg-input)", transition: "all 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FileText size={18} color="#f59e0b" />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>Company Documents</div>
                      <div style={{ fontSize: 11, color: "var(--ui-text-secondary)", marginTop: 4, transition: "color 0.3s ease" }}>Upload legal company files for verification and profile completeness.</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--huntr-yellow)" }}>
                      {company?.documents?.length || 0} uploaded
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Document Type
                    </span>
                    <select
                      value={companyDocType}
                      onChange={e => setCompanyDocType(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--ui-border-subtle)",
                        background: "var(--ui-bg-input)",
                        color: "var(--ui-text-primary)",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      {['NPWP', 'SIUP', 'TDP', 'SPPKP', 'NIB', 'Akta Pendirian', 'SK Kemenkumham', 'Other'].map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      ref={companyDocInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      style={{ display: "none" }}
                      onChange={async e => {
                        const files = e.target.files;
                        if (files && files.length) {
                          await uploadCompanyDocuments(files);
                          if (companyDocInputRef.current) companyDocInputRef.current.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => companyDocInputRef.current?.click()}
                      disabled={companyDocUploading}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: "1px solid rgba(245,158,11,0.3)",
                        background: "rgba(245,158,11,0.12)",
                        color: "#fbbf24",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {companyDocUploading ? "Uploading…" : "Tambah Dokumen"}
                    </button>
                  </div>
                </div>

                <div
                  onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setCompanyDocDragActive(true); }}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); setCompanyDocDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setCompanyDocDragActive(false); }}
                  onDrop={async e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCompanyDocDragActive(false);
                    const files = e.dataTransfer.files;
                    if (files && files.length) {
                      await uploadCompanyDocuments(files);
                    }
                  }}
                  style={{
                    border: `2px dashed ${companyDocDragActive ? "#fbbf24" : "rgba(255,255,255,0.16)"}`,
                    borderRadius: 18,
                    padding: "28px 22px",
                    background: companyDocDragActive ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                    color: companyDocDragActive ? "#fbbf24" : "#9ca3af",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    {companyDocDragActive ? "Drop files here to upload" : "Drag & drop documents here"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Supported formats: PDF, JPG, PNG, DOC, DOCX.
                  </div>
                </div>

                {companyDocError && (
                  <div style={{ fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.08)", padding: "12px 14px", borderRadius: 12, marginBottom: 12 }}>
                    {companyDocError}
                  </div>
                )}
                {companyDocSuccess && (
                  <div style={{ fontSize: 12, color: "#34d399", background: "rgba(52,211,153,0.08)", padding: "12px 14px", borderRadius: 12, marginBottom: 12 }}>
                    Company documents uploaded successfully.
                  </div>
                )}

                {company?.documents?.length ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    {company.documents.map((doc: any, idx: number) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px", borderRadius: 14,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          textDecoration: "none", color: "inherit",
                        }}
                      >
                        <div style={{
                          width: 42, height: 42, borderRadius: 12,
                          background: "rgba(245,158,11,0.15)", display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <FileText size={20} color="#f59e0b" />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#f3f4f6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {doc.name || doc.file_path?.split('/').pop() || 'Document'}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                            {doc.type || 'Document'} • View file
                          </div>
                        </div>
                        <ChevronRight size={16} color="#9ca3af" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#9ca3af", padding: "16px 14px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                    No company documents uploaded yet.
                  </div>
                )}
              </div>

              {/* Upload section */}
              <form onSubmit={handleFileUpload} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{
                  border: "2px dashed rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "24px 20px",
                  textAlign: "center", cursor: "pointer",
                  background: selectedFile ? "rgba(249,115,22,0.05)" : "rgba(0,0,0,0.15)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  transition: "all 0.2s",
                }}>
                  <FileSpreadsheet size={28} color={selectedFile ? "#fb923c" : "#4b5563"} />
                  <span style={{ fontSize: 12, color: selectedFile ? "#fdba74" : "#9ca3af", fontWeight: 600 }}>
                    {selectedFile ? selectedFile.name : "Pilih file CSV atau Excel (.xlsx / .xls)"}
                  </span>
                  <input
                    type="file" accept=".csv, .xlsx, .xls" style={{ display: "none" }}
                    onChange={e => {
                      setSelectedFile(e.target.files?.[0] || null);
                      setUploadError(null);
                      setUploadSuccess(false);
                    }}
                  />
                </label>

                {uploadSuccess && (
                  <div style={{ fontSize: 12, color: "#34d399", background: "rgba(52,211,153,0.08)", padding: "10px 14px", borderRadius: 8 }}>
                    ✓ Data berhasil dikirim ke antrean pemrosesan. Klik "Refresh Data" setelah beberapa saat.
                  </div>
                )}
                {uploadError && (
                  <div style={{ fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.08)", padding: "10px 14px", borderRadius: 8 }}>
                    ⚠ {uploadError}
                  </div>
                )}
                {selectedFile && (
                  <button type="submit" disabled={uploading} style={{
                    padding: "10px 16px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg,#f97316,#f59e0b)",
                    color: "#fff", fontWeight: 700, cursor: "pointer",
                    fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    alignSelf: "flex-end",
                  }}>
                    {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading...</> : `Import ${isBuyer ? "Historical PO" : "Catalogue"}`}
                  </button>
                )}
              </form>

              {/* Data table */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                    {isBuyer ? `Historical Purchase Orders (${historicalPos.length} PO)` : `Catalogue Items (${catalogues.length} item)`}
                  </h4>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing || posLoading || cataloguesLoading}
                    style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 12, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <RefreshCw size={12} className={(posLoading || cataloguesLoading) ? "animate-spin" : ""} /> Refresh Data
                  </button>
                </div>

                {/* ── VENDOR: Catalogue table ── */}
                {!isBuyer && (
                  cataloguesLoading ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "#6b7280", fontSize: 13 }}>
                      <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 10px" }} />
                      Memuat data katalog...
                    </div>
                  ) : catalogues.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>
                        Menampilkan 50 data teratas dari {catalogues.length} item.
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {["Code", "Item Name", "Category", "Spec", "UOM", "Unit Price"].map(h => (
                              <th key={h} style={{ padding: "10px", color: "#9ca3af", fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {catalogues.slice(0, 50).map((item: any, idx: number) => (
                            <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                              <td style={{ padding: "10px", color: "#fb923c" }}>{item.item_code || (idx + 1)}</td>
                              <td style={{ padding: "10px", color: "#e5e7eb", fontWeight: 500 }}>{item.name}</td>
                              <td style={{ padding: "10px", color: "#9ca3af" }}>{item.category || "—"}</td>
                              <td style={{ padding: "10px", color: "#9ca3af" }}>{item.specifications || "—"}</td>
                              <td style={{ padding: "10px", color: "#9ca3af" }}>{item.uom || "—"}</td>
                              <td style={{ padding: "10px", color: "#34d399", fontWeight: 600 }}>
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#4b5563", padding: "24px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.05)", borderRadius: 10 }}>
                      Belum ada data katalog. Unggah file Excel katalog produk di atas.
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
/* Helper Info Item Component */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{
        fontSize: 13, color: "var(--ui-text-primary)", fontWeight: 500,
        background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-subtle)",
        padding: "10px 14px", borderRadius: 10, minHeight: 40, boxSizing: "border-box",
        display: "flex", alignItems: "center",
      }}>
        {value}
      </span>
    </div>
  );
}

/* Helper Edit Item Component */
interface EditItemProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}

function EditItem({ label, value, onChange, type = "text", textarea = false, placeholder }: EditItemProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, color: "var(--huntr-orange-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{
            background: "var(--ui-bg-input)",
            border: "1px solid rgba(249,115,22,0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--ui-text-primary)",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      ) : (
        <input
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          type={type}
          placeholder={placeholder}
          style={{
            background: "var(--ui-bg-input)",
            border: "1px solid rgba(249,115,22,0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--ui-text-primary)",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}
