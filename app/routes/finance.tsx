import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getOrders, approveInvoice, getFullApiUrl } from "../lib/api";
import { Briefcase, Loader2, CheckCircle2, ChevronRight, AlertCircle, FileText } from "lucide-react";
import Swal from "sweetalert2";

export default function Finance() {
  const [company, setCompany] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const activeComp = localStorage.getItem("active_company");
    if (activeComp) {
      setCompany(JSON.parse(activeComp));
    }
  }, []);

  useEffect(() => {
    if (company) {
      fetchPendingInvoices();
    }
  }, [company]);

  const fetchPendingInvoices = async () => {
    setLoading(true);
    try {
      // Fetch orders and filter those that have invoices pending finance
      const res = await getOrders(company.id, 1, 100);
      const allOrders = res.data || [];
      
      const ordersWithPending = allOrders.filter((po: any) => 
        po.invoices?.some((inv: any) => inv.status === 'pending_finance')
      );
      
      setOrders(ordersWithPending);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load invoice data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (invoiceId: string) => {
    setProcessingId(invoiceId);
    try {
      await approveInvoice(invoiceId, company.id);
      await fetchPendingInvoices();
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || "Failed to approve invoice"
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Layout title="Finance Approval" subtitle="Review and approve final invoices before payment">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {error && (
          <div style={{
            padding: 16, background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 12, marginBottom: 24, display: "flex", alignItems: "center", gap: 10
          }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
        )}

        <div style={{
          background: "linear-gradient(135deg, var(--ui-bg-card) 0%, var(--ui-bg-card-hover) 100%)",
          borderRadius: 24, border: "1px solid var(--ui-border-input)", padding: 32, marginBottom: 32,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(16,185,129,0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--ui-text-primary)", margin: 0, letterSpacing: "-0.5px" }}>
                Pending Approval ({orders.length})
              </h2>
              <p style={{ fontSize: 13, color: "var(--ui-text-muted)", margin: "4px 0 0" }}>
                List of final invoices issued by vendors awaiting finance review.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, color: "var(--ui-text-muted)" }}>
            <Loader2 size={32} className="animate-spin" style={{ marginBottom: 16 }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Loading data...</span>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "var(--ui-bg-card)", borderRadius: 24, border: "1px dashed var(--ui-border-input)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ui-bg-input)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--ui-text-muted)" }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", margin: "0 0 8px" }}>No Pending Invoices</h3>
            <p style={{ fontSize: 14, color: "var(--ui-text-muted)", margin: 0 }}>All final invoices have been approved or paid.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {orders.map((po: any) => {
              const pendingInvoices = po.invoices?.filter((inv: any) => inv.status === 'pending_finance') || [];
              
              return pendingInvoices.map((inv: any) => (
                <div key={inv.id} style={{
                  background: "var(--ui-bg-card)", borderRadius: 20, border: "1px solid var(--ui-border-input)",
                  overflow: "hidden", display: "flex", flexDirection: "column"
                }}>
                  <div style={{ padding: 24, borderBottom: "1px solid var(--ui-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
                          PENDING APPROVAL
                        </span>
                        <span style={{ fontSize: 12, color: "var(--ui-text-muted)", fontFamily: "monospace", fontWeight: 600 }}>
                          PO: {po.po_number}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", margin: "0 0 4px" }}>
                        Tagihan dari {po.vendor?.name}
                      </h3>
                      <div style={{ fontSize: 13, color: "var(--ui-text-secondary)" }}>
                        Diterbitkan: {inv.date}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "var(--ui-text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Total Tagihan</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "var(--ui-text-primary)", letterSpacing: "-0.5px" }}>
                        IDR {Number(inv.amount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: 20, background: "var(--ui-bg-input)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <a 
                      href={getFullApiUrl(`/api/invoices/${inv.id}/print`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: 13, color: "#f97316", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                        padding: "8px 16px", borderRadius: 10, background: "rgba(249,115,22,0.1)", transition: "background 0.2s"
                      }}
                    >
                      <FileText size={16} /> View Invoice Document
                    </a>
                    
                    <button
                      onClick={() => handleApprove(inv.id)}
                      disabled={processingId === inv.id}
                      style={{
                        padding: "12px 24px", borderRadius: 12,
                        background: "linear-gradient(135deg,#10b981,#059669)",
                        color: "#fff", border: "none", fontSize: 13, fontWeight: 800,
                        cursor: processingId === inv.id ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8,
                        boxShadow: "0 4px 12px rgba(16,185,129,0.25)", transition: "all 0.2s"
                      }}
                    >
                      {processingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Approve & Disburse Dana
                    </button>
                  </div>
                </div>
              ));
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
