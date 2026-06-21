import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import Layout from "../components/Layout";
import QRCode from "qrcode";
import {
  FileText, RefreshCw, ChevronDown, ChevronRight, Loader2,
  Calendar, Building, User, CheckCircle2, ChevronLeft, Package, Clock, UploadCloud, FileSpreadsheet, X, Search, ReceiptText, CreditCard, Signature, AlertCircle, Download, QrCode
} from "lucide-react";
import { getOrders, uploadCompanyDocument, importHistoricalPo, importCatalogue, getCsrfCookie, apiPost, getFullApiUrl, arrangeDelivery, publishInvoice } from "../lib/api";
import { getAssetUrl } from "../lib/assets";
import PaymentModal from "../components/PaymentModal";

type SignatureMeta = {
  name?: string;
  position?: string;
  signed_at?: string;
};

const buildSignatureQrPayload = (
  docType: 'bast' | 'do',
  docId: string,
  role: 'handed-by' | 'received-by',
  meta?: SignatureMeta
) => {
  const verifyPath = docType === 'do'
    ? `/api/do/${docId}/print`
    : `/api/basts/${docId}/pdf`;

  return JSON.stringify({
    platform: 'huntr.id',
    doc_type: docType,
    doc_id: docId,
    role,
    signer: meta?.name,
    signed_at: meta?.signed_at,
    verify_url: getFullApiUrl(verifyPath),
  });
};

// QR Code Display Component
const QRCodeDisplay = ({ text, generateQR }: { text: string; generateQR: (t: string) => Promise<string | null> }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (showQR) {
      generateQR(text).then(url => setQrUrl(url));
    }
  }, [showQR, text, generateQR]);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowQR(!showQR)}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          background: "var(--ui-bg-input)",
          border: "1px solid var(--ui-border-input)",
          color: "var(--ui-text-secondary)",
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
          transition: "all 0.2s ease"
        }}
      >
        <QrCode size={14} />
        QR Code
      </button>
      {showQR && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            padding: 12,
            background: "var(--ui-bg-card)",
            borderRadius: 12,
            border: "1px solid var(--ui-border-input)",
            zIndex: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
          }}
        >
          {qrUrl ? (
            <img src={qrUrl} alt="QR Code" style={{ width: 128, height: 128 }} />
          ) : (
            <div style={{ width: 128, height: 128, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ui-text-muted)", fontSize: 12 }}>
              Generating...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SignatureQrInline = ({
  payload,
  generateQR,
}: {
  payload: string;
  generateQR: (t: string) => Promise<string | null>;
}) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    generateQR(payload).then(url => setQrUrl(url));
  }, [payload, generateQR]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 8 }}>
      {qrUrl ? (
        <img
          src={qrUrl}
          alt="Signature QR"
          style={{ width: 88, height: 88, borderRadius: 8, border: "1px solid var(--ui-border-input)", background: "var(--ui-bg-card)", padding: 4 }}
        />
      ) : (
        <div style={{ width: 88, height: 88, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ui-text-muted)", fontSize: 10 }}>
          QR...
        </div>
      )}
      <div style={{ fontSize: 10, color: "var(--ui-text-muted)", fontWeight: 600 }}>Scan to verify signature</div>
    </div>
  );
};

// Signature Buttons Component
const SignatureButtons = ({
  docType,
  docId,
  handedBySigned,
  receivedBySigned,
  handedByMeta,
  receivedByMeta,
  onSign,
  processingId,
  user,
  company,
  generateQR,
}: {
  docType: 'bast' | 'do';
  docId: string;
  handedBySigned: boolean;
  receivedBySigned: boolean;
  handedByMeta?: SignatureMeta;
  receivedByMeta?: SignatureMeta;
  onSign: (type: 'bast' | 'do', id: string, role: 'handed-by' | 'received-by') => Promise<void>;
  processingId: string | null;
  user: any;
  company: any;
  generateQR: (t: string) => Promise<string | null>;
}) => {
  const isManager = user?.role === 'manager' || company?.owner_id === user?.id;
  const isVendor = company.type === 'vendor';
  const isBuyer = company.type === 'buyer';

  const renderButton = (
    role: 'handed-by' | 'received-by',
    label: string,
    signed: boolean,
    isYourParty: boolean,
    meta?: SignatureMeta
  ) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11, color: "var(--ui-text-muted)", fontWeight: 800, textTransform: "uppercase", textAlign: "center" }}>{label}</div>
      {signed ? (
        <div style={{
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          color: "#22c55e",
          fontSize: 12,
          fontWeight: 800,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <CheckCircle2 size={14} />
            Signed
          </div>
          {meta?.name && (
            <div style={{ fontSize: 11, color: "var(--ui-text-primary)", fontWeight: 700 }}>{meta.name}</div>
          )}
          {meta?.position && (
            <div style={{ fontSize: 10, color: "var(--ui-text-muted)", fontWeight: 600 }}>{meta.position}</div>
          )}
          {meta?.signed_at && (
            <div style={{ fontSize: 10, color: "var(--ui-text-muted)", fontWeight: 600 }}>
              {new Date(meta.signed_at).toLocaleString()}
            </div>
          )}
          <SignatureQrInline
            payload={buildSignatureQrPayload(docType, docId, role, meta)}
            generateQR={generateQR}
          />
        </div>
      ) : (
        <button
          onClick={() => onSign(docType, docId, role)}
          disabled={processingId === docId || !isYourParty || !isManager}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: isYourParty && isManager ? "var(--huntr-orange)" : "var(--ui-bg-input)",
            border: "none",
            color: isYourParty && isManager ? "#fff" : "var(--ui-text-muted)",
            fontSize: 11,
            fontWeight: 800,
            textAlign: "center",
            cursor: isYourParty && isManager ? "pointer" : "not-allowed",
            opacity: isYourParty && isManager ? 1 : 0.5,
            transition: "all 0.2s ease"
          }}
        >
          {processingId === docId ? <Loader2 size={14} className="animate-spin" /> : (isYourParty && isManager ? "Sign" : "-")}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
      {renderButton('handed-by', isVendor ? 'Vendor (You)' : 'Vendor', handedBySigned, isVendor, handedByMeta)}
      {renderButton('received-by', isBuyer ? 'Buyer (You)' : 'Buyer', receivedBySigned, isBuyer, receivedByMeta)}
    </div>
  );
};

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // App state
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PO State
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "operational" | "historical">("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [expandedPo, setExpandedPo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [issuingBastId, setIssuingBastId] = useState<string | null>(null);
  const [bastData, setBastData] = useState<{ [key: string]: any }>({});

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

    // Read search param from URL
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    // Initialize CSRF cookie
    getCsrfCookie().catch(err => {
      console.warn("Failed to initialize CSRF cookie:", err);
    });
  }, [navigate]);

  useEffect(() => {
    if (company) {
      fetchOrders(company.id, 1, searchQuery, activeTab);
    }
  }, [location.pathname, location.search, company, activeTab]);

  useEffect(() => {
    if (company) {
      const timer = setTimeout(() => {
        fetchOrders(company.id, 1, searchQuery, activeTab);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const fetchOrders = async (companyId: string | number, page: number, search: string = "", type: string = "all") => {
    try {
      setRefreshing(true);
      const res = await getOrders(companyId, page, 10, search, type);
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

  const exportToExcel = () => {
    if (orders.length === 0) return;
    const headers = [
      "PO Number", 
      "Tender Title", 
      "Vendor Name", 
      "Order Date", 
      "PO Status", 
      "PO Currency", 
      "PO Total Amount", 
      "PO Created By",
      "PO Approved By",
      "DO Handed By",
      "DO Received By",
      "BAST Handed By",
      "BAST Received By",
      "Item Name", 
      "Item Code", 
      "Item Qty", 
      "Item UOM", 
      "Item Unit Price", 
      "Item Tax", 
      "Item Subtotal"
    ];
    
    const rows: any[] = [];
    
    orders.forEach(po => {
      const doHandedBy = po.delivery_orders?.map((d: any) => d.handed_by_name || "").filter(Boolean).join("; ") || "";
      const doReceivedBy = po.delivery_orders?.map((d: any) => d.received_by_name || "").filter(Boolean).join("; ") || "";
      const bastHandedBy = po.basts?.map((b: any) => b.handed_by_name || "").filter(Boolean).join("; ") || "";
      const bastReceivedBy = po.basts?.map((b: any) => b.received_by_name || "").filter(Boolean).join("; ") || "";

      const basePoInfo = [
        po.po_number || "",
        po.rfq?.title || "Purchase Order",
        po.vendor_name || "",
        po.order_date || new Date(po.created_at).toLocaleDateString(),
        po.status || "issued",
        po.currency || "IDR",
        po.total_amount || 0,
        po.created_by || "System",
        po.approved_by || "",
        doHandedBy,
        doReceivedBy,
        bastHandedBy,
        bastReceivedBy
      ];
      
      if (po.items && po.items.length > 0) {
        po.items.forEach((item: any) => {
          rows.push([
            ...basePoInfo,
            item.inventory_name || "",
            item.inventory_code || "",
            item.qty || 0,
            item.uom || "",
            item.unit_price || 0,
            item.tax_amount || 0,
            item.total_amount || 0
          ]);
        });
      } else {
        rows.push([
          ...basePoInfo,
          "", "", 0, "", 0, 0, 0
        ]);
      }
    });

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `purchase_orders_detailed_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateQRCode = useCallback(async (text: string) => {
    try {
      return await QRCode.toDataURL(text, { width: 128 });
    } catch (err) {
      console.error("QR code generation error:", err);
      return null;
    }
  }, []);

  const handleSignDocument = async (
    type: 'bast' | 'do', 
    id: string, 
    role: 'handed-by' | 'received-by'
  ) => {
    if (!user || !company) return;
    setProcessingId(id);
    setError(null);
    try {
      let endpoint = '';
      let data: any = {};
      if (type === 'bast') {
        endpoint = `/api/basts/${id}/sign-${role}`;
        if (role === 'handed-by') {
          data = { handed_by_user_id: user.id, handed_by_name: user.name, handed_by_position: "Manager" };
        } else if (role === 'received-by') {
          data = { received_by_user_id: user.id, received_by_name: user.name, received_by_position: "Manager" };
        }
      } else { // do
        endpoint = `/api/do/${id}/sign-${role}`;
        if (role === 'handed-by') {
          data = { handed_by_user_id: user.id, handed_by_name: user.name, handed_by_position: "Manager" };
        } else if (role === 'received-by') {
          data = { received_by_user_id: user.id, received_by_name: user.name, received_by_position: "Manager" };
        }
      }
      
      const response = await apiPost(endpoint, data);
      
      // Optimistically update local state before refetching
      if (response?.do || response?.bast) {
        const signedDoc = response.do || response.bast;
        setOrders(prevOrders => prevOrders.map(po => {
          if (type === 'do') {
            return {
              ...po,
              delivery_orders: po.delivery_orders?.map((d: any) => 
                d.id === id ? signedDoc : d
              ) || []
            };
          } else {
            return {
              ...po,
              basts: po.basts?.map((b: any) => 
                b.id === id ? signedDoc : b
              ) || []
            };
          }
        }));
      }
      
      setSuccessMessage(`✓ Signed successfully as ${role}!`);
      
      // Force refresh from server to ensure data consistency
      if (company) {
        await fetchOrders(company.id, currentPage, searchQuery, activeTab);
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to sign document");
    } finally {
      setProcessingId(null);
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

  const handleArrangeDelivery = async (poId: string, buyerAddress?: string) => {
    if (!company) return;
    const tracking = window.prompt(`Enter Tracking Number / Resi (Optional)\nDelivery point: ${buyerAddress || "Buyer company address"}`);
    if (tracking === null) return; // User cancelled
    
    setProcessingId(poId);
    setError(null);
    try {
      await arrangeDelivery(poId, company.id, tracking);
      setSuccessMessage("✓ Delivery arranged! Delivery Order published to buyer.");
      fetchOrders(company.id, currentPage);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to arrange delivery");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePublishInvoice = async (invoiceId: string) => {
    if (!company) return;
    setProcessingId(invoiceId);
    setError(null);
    try {
      await publishInvoice(invoiceId, company.id);
      setSuccessMessage("✓ Invoice published successfully! Sent to buyer finance.");
      fetchOrders(company.id, currentPage);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to publish invoice");
    } finally {
      setProcessingId(null);
    }
  };

  const handleIssueBast = async (poId: string) => {
    if (!company || !user) return;
    setIssuingBastId(poId);
    setError(null);
    try {
      const userSession = localStorage.getItem("user_session");
      const token = userSession ? JSON.parse(userSession).token : null;
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const po = orders.find(p => p.id === poId);
      if (!po) {
        setError("Purchase order not found");
        return;
      }

      // Create BAST with auto-generated number and complete user info
      const bastPayload = {
        po_id: poId,
        handed_by_name: user.name || company.name,
        handed_by_position: user.role || "Manager",
        handed_by_user_id: user.id,
        received_by_name: "Buyer Representative",
        received_by_position: "Procurement Manager",
        items: po.items || [],
        handover_notes: `BAST for PO ${po.po_number}`,
        created_by: user.id,
      };
      
      console.log("Issuing BAST with payload:", bastPayload);
      
      const response = await fetch(getFullApiUrl("/api/basts"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(bastPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to issue BAST (${response.status})`);
      }

      const data = await response.json();
      setSuccessMessage(`✓ BAST ${data.bast.bast_number} issued successfully! Notification sent to buyer.`);
      fetchOrders(company.id, currentPage);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("BAST Error:", err);
      setError(err.message || "Failed to issue BAST");
    } finally {
      setIssuingBastId(null);
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
    fetchOrders(company.id, newPage, searchQuery, activeTab);
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

  return (
    <Layout
      title="Purchase Order"
      subtitle="View and manage all purchase order documents."
    >
      <div style={{ maxWidth: "100%", width: "100%" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Header Summary Card */}
        <div className="huntr-action-card" style={{
          background: "var(--ui-bg-card)",
          border: "1px solid var(--ui-border)",
          borderRadius: 24,
          backdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
          flexWrap: "wrap",
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
              onClick={exportToExcel}
              disabled={orders.length === 0}
              style={{
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 14, padding: "0 20px", display: "flex", alignItems: "center", gap: 10,
                cursor: orders.length === 0 ? "not-allowed" : "pointer", color: "#22c55e", fontWeight: 700, fontSize: 13,
                opacity: orders.length === 0 ? 0.6 : 1, transition: "all 0.3s ease"
              }}
            >
              <FileSpreadsheet size={18} /> Export to Excel
            </button>

            <button
              onClick={() => fetchOrders(company.id, currentPage, searchQuery, activeTab)}
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
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", background: "var(--ui-bg-input)", borderRadius: 32, border: "1px dashed var(--ui-border-input)", transition: "all 0.3s ease" }}>
              <FileText size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
              <h3 style={{ color: "var(--ui-text-secondary)", margin: 0, fontSize: 16, transition: "color 0.3s ease" }}>No purchase orders found</h3>
            </div>
          ) : (
            orders.map(po => (
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
                    {(() => {
                      let label = 'Issued';
                      let bg = "rgba(249,115,22,0.1)";
                      let color = "#fb923c";
                      let IconComp = Clock;
                      
                      switch (po.status) {
                        case 'confirmed':
                          label = 'Confirmed'; bg = "rgba(249,115,22,0.1)"; color = "#f97316"; IconComp = CheckCircle2; break;
                        case 'paid':
                          label = 'Paid'; bg = "rgba(59,130,246,0.1)"; color = "#3b82f6"; IconComp = CheckCircle2; break;
                        case 'completed':
                        case 'done':
                          label = 'Completed'; bg = "rgba(34,197,94,0.1)"; color = "#22c55e"; IconComp = CheckCircle2; break;
                        case 'shipped':
                        case 'delivered':
                          label = 'Delivering'; bg = "rgba(236,72,153,0.1)"; color = "#ec4899"; IconComp = Package; break;
                        default:
                          label = 'Issued'; bg = "rgba(249,115,22,0.1)"; color = "#fb923c"; IconComp = Clock; break;
                      }

                      return (
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10,
                          background: bg, color: color, fontSize: 12, fontWeight: 700, transition: "all 0.3s ease",
                          textTransform: "capitalize"
                        }}>
                          <IconComp size={14} /> 
                          {label}
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    {company.type === 'vendor' && (po.status === 'published' || po.status === 'issued') && (
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

                    {company.type === 'vendor' && po.status === 'paid' && (
                      <button
                        onClick={() => handleArrangeDelivery(po.id, po.buyer_address)}
                        disabled={processingId === po.id}
                        style={{
                          background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "none", borderRadius: 12,
                          padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 12,
                          cursor: processingId === po.id ? "wait" : "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                          boxShadow: "0 4px 12px rgba(59,130,246,0.2)", transition: "all 0.2s ease",
                        }}
                      >
                        {processingId === po.id ? <Loader2 size={12} className="animate-spin" /> : <Package size={12} />}
                        Arrange Delivery
                      </button>
                    )}

                    {company.type === 'buyer' && po.delivery_orders && po.delivery_orders.some((d: any) => d.status === 'shipped' || d.status === 'delivered') && (
                      <button
                        onClick={() => navigate(`/receipts?po_id=${po.id}`)}
                        style={{
                          background: "var(--huntr-green)", border: "none", borderRadius: 12,
                          padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 12,
                          cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                          boxShadow: "0 4px 12px rgba(34,197,94,0.2)", transition: "all 0.2s ease",
                        }}
                      >
                        <Package size={12} />
                        Receive Goods
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
                    <div style={{ background: "rgba(249,115,22,0.05)", padding: 20, borderRadius: 16, border: "1px solid rgba(249,115,22,0.1)", marginBottom: 24 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Order Progress</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#4ade80", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, zIndex: 1 }}>✓</div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ui-text-primary)" }}>PO Issued</span>
                          <div style={{ position: "absolute", top: 12, left: "50%", width: "100%", height: 2, background: po.status === 'confirmed' ? "#4ade80" : "rgba(255,255,255,0.1)", zIndex: 0 }} />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: po.status === 'confirmed' ? "#4ade80" : "rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, zIndex: 1 }}>
                            {po.status === 'confirmed' ? "✓" : "2"}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: po.status === 'confirmed' ? "var(--ui-text-primary)" : "var(--ui-text-muted)" }}>Vendor Confirmed</span>
                          <div style={{ position: "absolute", top: 12, left: "50%", width: "100%", height: 2, background: (po.invoices && po.invoices.length > 0) ? "#4ade80" : "rgba(255,255,255,0.1)", zIndex: 0 }} />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: (po.invoices && po.invoices.length > 0) ? "#4ade80" : "rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, zIndex: 1 }}>
                            {(po.invoices && po.invoices.length > 0) ? "✓" : "3"}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: (po.invoices && po.invoices.length > 0) ? "var(--ui-text-primary)" : "var(--ui-text-muted)" }}>Invoice Ready</span>
                        </div>
                      </div>
                    </div>

                    <div className="huntr-grid-2col" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}>
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
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
                                <FileText size={14} color="#fb923c" />
                              </div>
                              <a 
                                href={getFullApiUrl(`/api/orders/${po.id}/print`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#fb923c", fontWeight: 700, textDecoration: "none" }}
                                className="hover:underline"
                              >
                                Print PO Document
                              </a>
                            </div>
                            
                            {po.delivery_orders && po.delivery_orders.map((doItem: any) => (
                              <div key={doItem.id} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
                                  <Package size={14} color="#3b82f6" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <a 
                                    href={getFullApiUrl(`/api/do/${doItem.id}/print`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#3b82f6", fontWeight: 700, textDecoration: "none" }}
                                    className="hover:underline"
                                  >
                                    Print DO: {doItem.do_number}
                                  </a>
                                  {doItem.tracking_number && (
                                    <span style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 2 }}>
                                      Tracking / Resi: {doItem.tracking_number}
                                    </span>
                                  )}
                                  {doItem.delivery_address && (
                                    <span style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                      Delivery Point: {doItem.delivery_address}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}

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
                          <div style={{ fontSize: 13, color: "var(--ui-text-secondary)", transition: "color 0.3s ease" }}>
                            Delivery Point: <strong style={{ color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{po.buyer_address || "N/A"}</strong>
                          </div>
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
                      <div style={{ marginTop: 24, padding: 20, background: "var(--ui-bg-input)", borderRadius: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ui-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                          <ReceiptText size={16} />
                          Related Invoices
                        </div>
                        {po.invoices && po.invoices.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                            {[po.invoices.find((i: any) => i.type === 'final') || po.invoices.find((i: any) => i.type === 'proforma')].filter(Boolean).map((inv: any) => (
                              <div key={inv.id} style={{ 
                                padding: "12px 16px", borderRadius: 12, background: "var(--ui-bg-card)", 
                                border: `1px solid ${inv.type === 'final' ? "rgba(34,197,94,0.2)" : "var(--ui-border-input)"}`,
                                display: "flex", flexDirection: "column", gap: 8, minWidth: 220
                              }}>
                                {/* Header row: invoice type + status badge */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ 
                                    fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                                    color: inv.type === 'final' ? "#22c55e" : "#fb923c" 
                                  }}>
                                    {inv.type === 'final' ? '🧾 Invoice Akhir' : '📄 Proforma Invoice'}
                                  </span>
                                  <span style={{ 
                                    fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 6,
                                    background: inv.status === 'paid' ? "rgba(34,197,94,0.1)" : inv.status === 'pending_finance' ? "rgba(59,130,246,0.1)" : inv.status === 'unpaid' ? "rgba(249,115,22,0.1)" : "rgba(107,114,128,0.1)",
                                    color: inv.status === 'paid' ? "#22c55e" : inv.status === 'pending_finance' ? "#3b82f6" : inv.status === 'unpaid' ? "#fb923c" : "#9ca3af",
                                    textTransform: "uppercase"
                                  }}>{inv.status.replace('_', ' ')}</span>
                                </div>

                                {/* Amount Breakdown */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "rgba(249,115,22,0.04)", borderRadius: 10, border: "1px solid rgba(249,115,22,0.1)" }}>
                                  {/* Base */}
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ui-text-secondary)" }}>
                                    <span>Nilai Transaksi</span>
                                    <span style={{ fontWeight: 700, color: "var(--ui-text-primary)" }}>IDR {Number(inv.base_amount || inv.amount).toLocaleString()}</span>
                                  </div>
                                  {/* Platform fee */}
                                  {Number(inv.platform_fee) > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ui-text-secondary)" }}>
                                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c", display: "inline-block" }} />
                                        Biaya Layanan {Number(inv.base_amount) <= 50000000 ? '(2.5%)' : Number(inv.base_amount) <= 250000000 ? '(2%)' : '(1%)'}
                                      </span>
                                      <span style={{ fontWeight: 700, color: "#fb923c" }}>+ IDR {Number(inv.platform_fee).toLocaleString()}</span>
                                    </div>
                                  )}
                                  {/* Midtrans fee */}
                                  {Number(inv.midtrans_fee) > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ui-text-secondary)" }}>
                                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} />
                                        Biaya Transaksi
                                      </span>
                                      <span style={{ fontWeight: 700, color: "#60a5fa" }}>+ IDR {Number(inv.midtrans_fee).toLocaleString()}</span>
                                    </div>
                                  )}
                                  {/* PPN */}
                                  {Number(inv.ppn_fee) > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ui-text-secondary)" }}>
                                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c084fc", display: "inline-block" }} />
                                        PPN 11%
                                      </span>
                                      <span style={{ fontWeight: 700, color: "#c084fc" }}>+ IDR {Number(inv.ppn_fee).toLocaleString()}</span>
                                    </div>
                                  )}
                                  {/* Divider */}
                                  <div style={{ borderTop: "1px solid rgba(249,115,22,0.15)", margin: "2px 0" }} />
                                  {/* Total */}
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ui-text-primary)" }}>Total</span>
                                    <span style={{ fontSize: 15, fontWeight: 900, color: "var(--ui-text-primary)" }}>IDR {Number(inv.total_amount || inv.amount).toLocaleString()}</span>
                                  </div>
                                </div>
                                <div style={{ fontSize: 11, color: "var(--ui-text-muted)" }}>Published: {inv.date}</div>

                                {/* Print link always available */}
                                <a 
                                  href={getFullApiUrl(`/api/invoices/${inv.id}/print`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ fontSize: 11, color: "#f97316", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                                >
                                  <FileText size={12} /> Print Invoice
                                </a>

                                {/* Pay Now — for buyer on ANY unpaid invoice */}
                                {inv.status === 'unpaid' && company.type === 'buyer' && (
                                  <button 
                                    onClick={() => {
                                      setSelectedInvoice(inv);
                                      setShowPaymentModal(true);
                                    }}
                                    style={{
                                      width: "100%", padding: "8px 12px", borderRadius: 10,
                                      background: "linear-gradient(135deg,#f97316,#f59e0b)",
                                      color: "#fff", border: "none", fontSize: 11, fontWeight: 800,
                                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                      boxShadow: "0 4px 12px rgba(249,115,22,0.2)"
                                    }}
                                  >
                                    <CreditCard size={12} /> Bayar Sekarang
                                  </button>
                                )}

                                {/* Publish Invoice — vendor only, final invoices in draft */}
                                {inv.type === 'final' && inv.status === 'draft' && company.type === 'vendor' && (
                                  <button
                                    onClick={() => handlePublishInvoice(inv.id)}
                                    disabled={processingId === inv.id}
                                    style={{
                                      width: "100%", padding: "8px 12px", borderRadius: 10,
                                      background: "linear-gradient(135deg,#10b981,#059669)",
                                      color: "#fff", border: "none", fontSize: 11, fontWeight: 800,
                                      cursor: processingId === inv.id ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                      boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                                    }}
                                  >
                                    {processingId === inv.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Terbitkan Invoice Akhir
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: "center", padding: "20px 0", border: "1px dashed var(--ui-border-input)", borderRadius: 12 }}>
                            <p style={{ margin: 0, fontSize: 12, color: "var(--ui-text-muted)" }}>
                              {po.status === 'confirmed' 
                                ? "Generating invoice data..." 
                                : "Proforma Invoice will be available once the Vendor confirms this PO."}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Delivery Order (DO) Signatures & QR Section */}
                      {po.delivery_orders && po.delivery_orders.length > 0 && (
                        <div style={{ marginTop: 24, padding: 20, background: "var(--ui-bg-input)", borderRadius: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ui-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <Package size={16} color="#3b82f6" />
                            Delivery Order (DO) Signatures
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {po.delivery_orders.map((doItem: any) => (
                              <div key={doItem.id} style={{ 
                                padding: "16px", borderRadius: 12, background: "var(--ui-bg-card)", 
                                border: "1px solid var(--ui-border-input)", display: "flex", flexDirection: "column", gap: 12
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#3b82f6" }}>
                                  {doItem.do_number}
                                </span>
                                <QRCodeDisplay text={getFullApiUrl(`/api/do/${doItem.id}/print`)} generateQR={generateQRCode} />
                              </div>

                              {doItem.delivery_address && (
                                <div style={{ fontSize: 11, color: "var(--ui-text-muted)", lineHeight: 1.5 }}>
                                  Delivery point: {doItem.delivery_address}
                                </div>
                              )}
                              
                              <SignatureButtons 
                                docType="do" 
                                  docId={doItem.id} 
                                  handedBySigned={!!doItem.handed_by_signed_at} 
                                  receivedBySigned={!!doItem.received_by_signed_at}
                                  handedByMeta={{
                                    name: doItem.handed_by_name,
                                    position: doItem.handed_by_position,
                                    signed_at: doItem.handed_by_signed_at,
                                  }}
                                  receivedByMeta={{
                                    name: doItem.received_by_name,
                                    position: doItem.received_by_position,
                                    signed_at: doItem.received_by_signed_at,
                                  }}
                                  onSign={handleSignDocument} 
                                  processingId={processingId}
                                  user={user}
                                  company={company}
                                  generateQR={generateQRCode}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* BAST Section */}
                      {company.type === 'vendor' && ['delivered', 'completed', 'done', 'paid'].includes(po.status) && (
                        <div style={{ marginTop: 24, padding: 20, background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ui-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <Signature size={16} color="#f97316" />
                            Berita Acara Serah Terima (BAST)
                          </div>
                          {po.basts && po.basts.length > 0 ? (
                            /* BAST already issued — show badge, prevent duplicate */
                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12 }}>
                              <CheckCircle2 size={16} color="#22c55e" />
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#22c55e" }}>BAST Already Issued</div>
                                <div style={{ fontSize: 11, color: "var(--ui-text-muted)", marginTop: 2 }}>
                                  {po.basts[0].bast_number} · {po.basts[0].bast_date}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* No BAST yet — show issue button */
                            <>
                              <p style={{ fontSize: 12, color: "var(--ui-text-secondary)", marginBottom: 16, margin: "0 0 16px 0" }}>
                                Issue a handover document to formally transfer goods to the buyer with multi-party signatures.
                              </p>
                              <button
                                onClick={() => handleIssueBast(po.id)}
                                disabled={issuingBastId === po.id}
                                style={{
                                  width: "100%", padding: "12px 16px", borderRadius: 12,
                                  background: "linear-gradient(135deg,#f97316,#f59e0b)",
                                  color: "#fff", border: "none", fontSize: 12, fontWeight: 800,
                                  cursor: issuingBastId === po.id ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                  boxShadow: "0 4px 12px rgba(249,115,22,0.2)", transition: "all 0.2s ease"
                                }}
                              >
                                {issuingBastId === po.id ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" /> Issuing BAST...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={14} /> Issue BAST (Auto-Generated)
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* BAST List Section - Show all BASTs for this PO */}
                      <div style={{ marginTop: 24, padding: 20, background: "var(--ui-bg-input)", borderRadius: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ui-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                          <Signature size={16} color="#f97316" />
                          BAST Documents for this PO
                        </div>
                        {po.basts && po.basts.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {po.basts.map((bast: any) => (
                              <div key={bast.id} style={{ 
                                padding: "16px", borderRadius: 12, background: "var(--ui-bg-card)", 
                                border: "1px solid var(--ui-border-input)",
                                display: "flex", flexDirection: "column", gap: 12
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ 
                                    fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                                    color: "#f97316" 
                                  }}>
                                    📋 {bast.bast_number}
                                  </span>
                                  <QRCodeDisplay 
                                    text={getFullApiUrl(`/api/basts/${bast.id}/pdf`)} 
                                    generateQR={generateQRCode} 
                                  />
                                </div>

                                <div style={{ fontSize: 12, color: "var(--ui-text-secondary)" }}>
                                  Date: {bast.bast_date} • Issued by: {bast.handed_by_name || "N/A"}
                                </div>

                                <SignatureButtons 
                                  docType="bast" 
                                  docId={bast.id} 
                                  handedBySigned={!!bast.handed_by_signed_at} 
                                  receivedBySigned={!!bast.received_by_signed_at}
                                  handedByMeta={{
                                    name: bast.handed_by_name,
                                    position: bast.handed_by_position,
                                    signed_at: bast.handed_by_signed_at,
                                  }}
                                  receivedByMeta={{
                                    name: bast.received_by_name,
                                    position: bast.received_by_position,
                                    signed_at: bast.received_by_signed_at,
                                  }}
                                  onSign={handleSignDocument} 
                                  processingId={processingId}
                                  user={user}
                                  company={company}
                                  generateQR={generateQRCode}
                                />

                                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                  <button
                                    onClick={() => {
                                      // Open print view directly in new tab
                                      window.open(getFullApiUrl(`/api/basts/${bast.id}/pdf`), '_blank');
                                    }}
                                    style={{ fontSize: 11, color: "#f97316", fontWeight: 700, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}
                                  >
                                    <FileText size={12} /> View Details
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: "center", padding: "16px 0", border: "1px dashed var(--ui-border-input)", borderRadius: 12 }}>
                            <p style={{ margin: 0, fontSize: 12, color: "var(--ui-text-muted)" }}>
                              No BAST documents issued for this PO yet.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* E-Faktur Section */}
                      <div style={{ marginTop: 24, padding: 20, background: "var(--ui-bg-input)", borderRadius: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ui-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                          <FileText size={16} color="#3b82f6" />
                          E-Faktur Pajak for this PO
                        </div>
                        {po.efakturs && po.efakturs.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {po.efakturs.map((ef: any) => (
                              <div key={ef.id} style={{ 
                                padding: "12px 16px", borderRadius: 12, background: "var(--ui-bg-card)", 
                                border: "1px solid var(--ui-border-input)",
                                display: "flex", flexDirection: "column", gap: 8
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ 
                                    fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                                    color: "#3b82f6" 
                                  }}>
                                    📄 {ef.nofa || "NOFA PENDING"}
                                  </span>
                                  <span style={{ 
                                    fontSize: 11, fontWeight: 800,
                                    background: ef.status === "APPROVED" ? "rgba(34,197,94,0.1)" : "rgba(249,115,22,0.1)", 
                                    color: ef.status === "APPROVED" ? "#22c55e" : "#f97316",
                                    padding: "2px 8px",
                                    borderRadius: 8
                                  }}>
                                    {ef.status}
                                  </span>
                                </div>

                                <div style={{ fontSize: 12, color: "var(--ui-text-secondary)" }}>
                                  Tanggal: {ef.tanggal_faktur} • DPP: Rp {ef.dpp?.toLocaleString?.() || "N/A"} • PPN: Rp {ef.ppn?.toLocaleString?.() || "N/A"}
                                </div>

                                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                  <span style={{ fontSize: 12, color: "var(--ui-text-muted)" }}>
                                    E-Faktur will be available for download via Pajak.io dashboard.
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: "center", padding: "16px 0", border: "1px dashed var(--ui-border-input)", borderRadius: 12 }}>
                            <p style={{ margin: 0, fontSize: 12, color: "var(--ui-text-muted)" }}>
                              No e-Faktur issued yet. E-Faktur will be generated automatically after BAST is fully signed.
                            </p>
                          </div>
                        )}
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

        {showPaymentModal && selectedInvoice && (
          <PaymentModal 
            invoice={selectedInvoice} 
            onClose={() => setShowPaymentModal(false)} 
            onSuccess={() => {
              setShowPaymentModal(false);
              fetchOrders(company.id, currentPage, searchQuery, activeTab);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
