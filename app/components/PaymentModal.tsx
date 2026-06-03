import React, { useState, useEffect, useRef } from "react";
import { X, CreditCard, QrCode, Building2, Wallet, Loader2, CheckCircle2, Copy, RefreshCw, AlertCircle } from "lucide-react";
import { initiatePayment, getPaymentStatus } from "../lib/api";

interface PaymentModalProps {
  invoice: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-polling for status
  useEffect(() => {
    if (paymentData && paymentData.status === 'pending') {
      if (!pollingRef.current) {
        pollingRef.current = setInterval(() => {
          checkStatus();
        }, 7000); // Check every 7 seconds
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [paymentData]);

  const checkStatus = async () => {
    if (!paymentData || !paymentData.id || checking) return;
    
    setChecking(true);
    try {
      const res = await getPaymentStatus(paymentData.id);
      
      if (res && res.payment) {
        const status = res.payment.status;
        const isSuccess = status === 'settlement' || status === 'capture' || status === 'paid';
        
        setPaymentData(res.payment);
        
        if (isSuccess) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error("Failed to check payment status", err);
      // If 404, the payment record might have been lost, stop polling
      if (err.status === 404) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setError("Payment session expired or not found.");
      }
    } finally {
      setChecking(false);
    }
  };

  const paymentMethods = [
    { id: "qris", label: "QRIS", icon: <QrCode size={20} />, description: "Scan with any banking or e-wallet app" },
    { id: "bca_va", label: "BCA Virtual Account", icon: <Building2 size={20} />, description: "Pay via m-BCA or ATM" },
    { id: "mandiri_va", label: "Mandiri Bill", icon: <Building2 size={20} />, description: "Pay via Livin' or ATM" },
    { id: "dana", label: "DANA", icon: <Wallet size={20} />, description: "Direct payment with DANA balance" },
  ];

  const handleSelectMethod = async (method: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await initiatePayment(invoice.id, method);
      setPaymentData(res.payment);
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const isSuccess = paymentData && (paymentData.status === 'settlement' || paymentData.status === 'capture' || paymentData.status === 'paid');

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20,
    }}>
      <div style={{
        background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 32,
        width: "100%", maxWidth: 480, padding: 32, display: "flex", flexDirection: "column", gap: 24,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--ui-text-primary)" }}>Huntr Pay</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ui-text-muted)" }}>Secure payment for Invoice #{invoice.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--ui-text-muted)", cursor: "pointer" }}><X size={24} /></button>
        </div>

        {!paymentData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "16px 20px", background: "rgba(249,115,22,0.05)", borderRadius: 16, border: "1px solid rgba(249,115,22,0.1)", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em" }}>Amount to Pay</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--ui-text-primary)" }}>IDR {Number(invoice.amount).toLocaleString()}</div>
            </div>

            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-secondary)", margin: "8px 0 4px" }}>Select Payment Method</p>
            
            {paymentMethods.map(m => (
              <button
                key={m.id}
                onClick={() => handleSelectMethod(m.id)}
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 20,
                  background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s ease"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#f97316"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--ui-border-input)"}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316" }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ui-text-primary)" }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: "var(--ui-text-muted)" }}>{m.description}</div>
                </div>
              </button>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 20 }}>
                <Loader2 size={24} className="animate-spin" color="#f97316" />
                <span style={{ fontSize: 14, color: "var(--ui-text-muted)" }}>Contacting Midtrans...</span>
              </div>
            )}
            {error && <div style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>{error}</div>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", textAlign: "center" }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: "50%", 
              background: (paymentData.status === 'settlement' || paymentData.status === 'capture' || paymentData.status === 'paid') ? "rgba(34,197,94,0.1)" : "rgba(249,115,22,0.1)", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              color: (paymentData.status === 'settlement' || paymentData.status === 'capture' || paymentData.status === 'paid') ? "#22c55e" : "#f97316" 
            }}>
              {(paymentData.status === 'settlement' || paymentData.status === 'capture' || paymentData.status === 'paid') ? (
                <CheckCircle2 size={32} />
              ) : (
                <Loader2 size={32} className="animate-spin" />
              )}
            </div>
            
            <div>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)" }}>
                {(paymentData.status === 'settlement' || paymentData.status === 'capture' || paymentData.status === 'paid') 
                  ? "Payment Successful!" 
                  : "Awaiting Payment"}
              </h4>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ui-text-muted)" }}>
                {(paymentData.status === 'settlement' || paymentData.status === 'capture' || paymentData.status === 'paid')
                  ? "Your transaction has been processed."
                  : "Please complete your payment below"}
              </p>
            </div>

            {(paymentData.status === 'pending') && (
              <>
                {paymentData.payment_method === 'qris' && paymentData.payment_info.qr_url && (
                  <div style={{ background: "#fff", padding: 16, borderRadius: 20 }}>
                    <img src={paymentData.payment_info.qr_url} alt="QRIS" style={{ width: 240, height: 240 }} />
                    <p style={{ color: "#000", fontSize: 12, fontWeight: 700, margin: "8px 0 0" }}>Scan QRIS with ShopeePay, GoPay, or Mobile Banking</p>
                  </div>
                )}

                {paymentData.payment_method.includes('_va') && paymentData.payment_info.va_number && (
                  <div style={{ width: "100%", background: "var(--ui-bg-input)", padding: 24, borderRadius: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>Virtual Account Number</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#f97316", letterSpacing: 2 }}>{paymentData.payment_info.va_number}</div>
                      <button onClick={() => copyToClipboard(paymentData.payment_info.va_number)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ui-text-muted)" }}>
                        <Copy size={20} />
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ui-text-muted)" }}>Bank: {paymentData.payment_method.split('_')[0].toUpperCase()}</div>
                  </div>
                )}

                {paymentData.payment_method === 'dana' && paymentData.payment_info.checkout_url && (
                  <div style={{ width: "100%", background: "rgba(249,115,22,0.05)", padding: 24, borderRadius: 24, textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "var(--ui-text-primary)", marginBottom: 16 }}>Click the button below to complete payment with DANA</p>
                    <a 
                      href={paymentData.payment_info.checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block", padding: "12px 24px", borderRadius: 12, background: "#008CFF",
                        color: "#fff", fontWeight: 700, textDecoration: "none"
                      }}
                    >
                      Open DANA Checkout
                    </a>
                  </div>
                )}
              </>
            )}

            <button 
              onClick={isSuccess ? onSuccess : checkStatus}
              disabled={checking}
              style={{
                width: "100%", padding: 16, borderRadius: 16, 
                background: isSuccess 
                  ? "#22c55e" 
                  : "linear-gradient(135deg,#f97316,#f59e0b)",
                color: "#fff", fontWeight: 700, border: "none", cursor: checking ? "not-allowed" : "pointer", 
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 8px 20px rgba(249,115,22,0.2)"
              }}
            >
              {checking ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isSuccess ? (
                "Continue"
              ) : (
                <>
                  <RefreshCw size={18} />
                  I've Completed Payment
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
