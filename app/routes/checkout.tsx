import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { createRfq } from "../lib/api";
import { ClipboardList, CheckCircle2, ArrowLeft, Loader2, Package, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prTitle, setPrTitle] = useState("");
  const [prDesc, setPrDesc] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem("huntr_cart");
    if (savedCart) {
      const items = JSON.parse(savedCart).map((i: any) => ({
        ...i,
        estimated_price: i.estimated_price || 0
      }));
      setCart(items);
    }

    const userSession = localStorage.getItem("user_session");
    if (userSession) setUser(JSON.parse(userSession));

    const companySession = localStorage.getItem("active_company");
    if (companySession) {
      const comp = JSON.parse(companySession);
      setActiveCompany(comp);
      if (comp.type === 'vendor') {
        navigate("/");
        return;
      }
    }
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.estimated_price || 0) * item.qty), 0);

  const updateEstimatedPrice = (id: string, price: number) => {
    const newCart = cart.map(i => i.id === id ? { ...i, estimated_price: price } : i);
    setCart(newCart);
    localStorage.setItem("huntr_cart", JSON.stringify(newCart));
  };

  const handleSubmitPR = async () => {
    if (!activeCompany || !user) return;
    if (!prTitle) {
      setError("Please provide a title for this Purchase Request.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        company_id: activeCompany.id,
        user_id: user.id,
        title: prTitle,
        description: prDesc,
        status: "pending_approval", // PR status
        items: cart.map(i => ({
          catalogue_id: i.id,
          qty: i.qty,
          estimated_price: i.estimated_price,
          expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
        }))
      };

      await createRfq(payload);
      
      localStorage.removeItem("huntr_cart");
      setSuccess(true);
      setTimeout(() => navigate("/my-pr"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create Purchase Request.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout title="Request Created" subtitle="Your purchase requisition has been submitted.">
        <div style={{ padding: "80px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: 30, background: "rgba(34,197,94,0.1)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--ui-text-primary)", margin: "0 0 12px" }}>PR Successfully Submitted!</h2>
          <p style={{ color: "var(--ui-text-secondary)", maxWidth: 400, lineHeight: 1.6 }}>
            Your Purchase Request <strong>"{prTitle}"</strong> is now waiting for manager approval. You will be redirected shortly.
          </p>
          <button 
            onClick={() => navigate("/my-pr")}
            style={{ marginTop: 32, padding: "12px 24px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: `1px solid var(--ui-border)`, color: "var(--ui-text-primary)", fontWeight: 700, cursor: "pointer" }}
          >
            Go to My Requests
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout Purchase Request" subtitle="Review your selected items and submit for approval.">
      <div className="huntr-split-layout checkout-container" style={{ paddingBottom: 40 }}>
        
        {/* Form Area */}
        <div className="huntr-split-layout-main checkout-form" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#f59e0b", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, padding: 0 }}>
            <ArrowLeft size={16} /> Back to Marketplace
          </button>

          <section style={{ background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", padding: 32 }}>
            <h3 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
              <ClipboardList size={20} color="var(--huntr-orange)" /> Request Details
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>PR Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Office Supplies for Q3 2026" 
                  value={prTitle}
                  onChange={e => setPrTitle(e.target.value)}
                  style={{
                    padding: "14px 18px", borderRadius: 12, background: "var(--ui-bg-input)", 
                    border: `1px solid var(--ui-border-input)`, color: "var(--ui-text-primary)", outline: "none", fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Purpose / Description</label>
                <textarea 
                  placeholder="Explain why these items are needed..." 
                  value={prDesc}
                  onChange={e => setPrDesc(e.target.value)}
                  rows={4}
                  style={{
                    padding: "14px 18px", borderRadius: 12, background: "var(--ui-bg-input)", 
                    border: `1px solid var(--ui-border-input)`, color: "var(--ui-text-primary)", outline: "none", fontSize: 14, resize: "none"
                  }}
                />
              </div>
            </div>
          </section>

          <section style={{ background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", padding: 32 }}>
            <h3 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
              <Package size={20} color="var(--huntr-orange)" /> Item Summary
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--ui-bg-input)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Package size={24} color="rgba(255,255,255,0.1)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ui-text-muted)" }}>{item.item_code}</div>
                  </div>
                  <div style={{ display: "flex", flex: 1, gap: 16, alignItems: "center", justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 140 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>Estimated Price</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--ui-text-muted)" }}>IDR</span>
                        <input 
                          type="number"
                          value={item.estimated_price}
                          onChange={(e) => updateEstimatedPrice(item.id, Number(e.target.value))}
                          style={{
                            width: "100%", padding: "8px 8px 8px 34px", borderRadius: 8,
                            background: "var(--ui-bg-input)", border: `1px solid var(--ui-border-input)`,
                            color: "var(--ui-text-primary)", fontSize: 12, outline: "none"
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 100 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-primary)" }}>IDR {(Number(item.estimated_price || 0) * item.qty).toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: "var(--ui-text-secondary)" }}>Qty: {item.qty}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Summary Card */}
        <div className="huntr-split-layout-aside checkout-summary">
          <div className="huntr-sticky-panel" style={{
            background: "var(--ui-bg-card)", backdropFilter: "blur(10px)",
            borderRadius: 24, border: `1px solid var(--ui-border)`,
            padding: 32, display: "flex", flexDirection: "column", gap: 24,
          }}>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ui-text-primary)" }}>Order Summary</h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--ui-text-secondary)" }}>Subtotal</span>
                <span style={{ color: "var(--ui-text-primary)", fontWeight: 600 }}>IDR {cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--ui-text-secondary)" }}>Tax (0%)</span>
                <span style={{ color: "var(--ui-text-primary)", fontWeight: 600 }}>IDR 0</span>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid var(--ui-border)`, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--ui-text-primary)", fontWeight: 700 }}>Total</span>
                <span style={{ color: "var(--ui-text-brand)", fontSize: 20, fontWeight: 900 }}>IDR {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 13, display: "flex", gap: 10 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <button 
              onClick={handleSubmitPR}
              disabled={loading || cart.length === 0}
              style={{
                width: "100%", padding: "16px", borderRadius: 16,
                background: "linear-gradient(135deg,#f97316,#f59e0b)",
                color: "#fff", fontWeight: 700, border: "none", cursor: (loading || cart.length === 0) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 8px 24px rgba(249,115,22,0.3)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <>Submit Request <CheckCircle2 size={20} /></>}
            </button>
            
            <p style={{ margin: 0, fontSize: 11, color: "var(--ui-text-muted)", textAlign: "center", lineHeight: 1.5 }}>
              By submitting, this request will be sent to your manager for approval before being published.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
