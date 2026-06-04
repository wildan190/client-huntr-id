import React, { useState, useEffect, useRef } from "react";
import { X, CreditCard, QrCode, Building2, Wallet, Loader2, CheckCircle2, Copy, RefreshCw, AlertCircle, ChevronRight } from "lucide-react";
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

  const isSuccess = paymentData && (paymentData.status === 'settlement' || paymentData.status === 'capture' || paymentData.status === 'paid');

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
        const isCurrentlySuccess = status === 'settlement' || status === 'capture' || status === 'paid';
        
        setPaymentData(res.payment);
        
        if (isCurrentlySuccess) {
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

  const paymentMethods = [
    { id: "qris", label: "QRIS", icon: <QrCode size={18} />, description: "Scan with e-wallet" },
    { id: "bca_va", label: "BCA VA", icon: <Building2 size={18} />, description: "m-BCA / ATM" },
    { id: "mandiri_va", label: "Mandiri Bill", icon: <Building2 size={18} />, description: "Livin' / ATM" },
    { id: "dana", label: "DANA", icon: <Wallet size={18} />, description: "Direct pay" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center z-[1100] p-0 sm:p-4">
      <div className="bg-[var(--ui-bg-card)] border-t sm:border border-[var(--ui-border)] rounded-t-[32px] sm:rounded-[32px] w-full max-w-[440px] max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-start sticky top-0 bg-[var(--ui-bg-card)] z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center">
                <CreditCard size={14} className="text-white" />
              </div>
              <h3 className="text-lg font-black text-[var(--ui-text-primary)] tracking-tight">Huntr Pay</h3>
            </div>
            <p className="text-xs text-[var(--ui-text-muted)] font-medium">Inv: #{invoice.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-[var(--ui-text-muted)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-8 flex flex-col gap-5">
          {!paymentData ? (
            <>
              {/* Amount Display */}
              <div className="p-5 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Total Payment</div>
                <div className="text-2xl font-black text-[var(--ui-text-primary)] leading-none">
                  IDR {Number(invoice.amount).toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-black text-[var(--ui-text-muted)] uppercase tracking-widest px-1">Select Method</p>
                <div className="grid grid-cols-1 gap-2">
                  {paymentMethods.map(m => (
                    <button
                      key={m.id}
                      onClick={() => !loading && handleSelectMethod(m.id)}
                      disabled={loading}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] hover:border-orange-500/50 transition-all group active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        {m.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold text-[var(--ui-text-primary)] leading-tight">{m.label}</div>
                        <div className="text-[10px] text-[var(--ui-text-muted)] font-medium">{m.description}</div>
                      </div>
                      <ChevronRight size={16} className="text-[var(--ui-text-muted)] opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <Loader2 size={18} className="animate-spin text-orange-500" />
                  <span className="text-xs font-bold text-[var(--ui-text-muted)] uppercase tracking-widest">Connecting...</span>
                </div>
              )}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-6 items-center text-center animate-in fade-in zoom-in-95 duration-300">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-orange-500/10 text-orange-500 shadow-orange-500/10'}`}>
                {isSuccess ? <CheckCircle2 size={32} /> : <Loader2 size={32} className="animate-spin" />}
              </div>
              
              <div>
                <h4 className="text-xl font-black text-[var(--ui-text-primary)] leading-tight mb-1">
                  {isSuccess ? "Payment Received!" : "Complete Payment"}
                </h4>
                <p className="text-xs text-[var(--ui-text-muted)] font-medium px-4">
                  {isSuccess ? "Your transaction has been confirmed successfully." : "Please follow the instructions below to pay."}
                </p>
              </div>

              {!isSuccess && (
                <div className="w-full flex flex-col gap-4">
                  {paymentData.payment_method === 'qris' && paymentData.payment_info.qr_url && (
                    <div className="bg-white p-4 rounded-[28px] self-center shadow-inner">
                      <img src={paymentData.payment_info.qr_url} alt="QRIS" className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px]" />
                      <div className="mt-3 py-2 px-4 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-tighter">Scan with any e-wallet</div>
                    </div>
                  )}

                  {paymentData.payment_method.includes('_va') && (
                    <div className="w-full bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] p-6 rounded-[24px] flex flex-col gap-4">
                      <div>
                        <div className="text-[10px] font-black text-[var(--ui-text-muted)] uppercase tracking-widest mb-3">VA Number ({paymentData.payment_method.split('_')[0].toUpperCase()})</div>
                        <div className="flex items-center justify-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 group relative">
                          <div className="text-xl sm:text-2xl font-black text-orange-500 tracking-[0.15em] break-all leading-tight">
                            {paymentData.payment_info.va_number || paymentData.payment_info.bill_key}
                          </div>
                          <button 
                            onClick={() => copyToClipboard(paymentData.payment_info.va_number || paymentData.payment_info.bill_key)} 
                            className="p-2 rounded-lg bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {paymentData.payment_method === 'mandiri_va' && paymentData.payment_info.biller_code && (
                        <div>
                          <div className="text-[10px] font-black text-[var(--ui-text-muted)] uppercase tracking-widest mb-2">Biller Code</div>
                          <div className="text-lg font-black text-[var(--ui-text-primary)]">{paymentData.payment_info.biller_code}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentData.payment_method === 'dana' && paymentData.payment_info.checkout_url && (
                    <div className="w-full bg-blue-500/5 border border-blue-500/10 p-6 rounded-[24px] text-center">
                      <p className="text-xs text-[var(--ui-text-primary)] font-bold mb-4 px-2 line-clamp-2">Authorize the payment on your DANA account</p>
                      <a 
                        href={paymentData.payment_info.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[#008CFF] text-white text-sm font-black shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <Wallet size={16} /> Open DANA Wallet
                      </a>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={isSuccess ? onSuccess : checkStatus}
                disabled={checking}
                className={`w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
                  isSuccess 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/20'
                }`}
              >
                {checking ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isSuccess ? (
                  "Return to Dashboard"
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Confirm Payment
                  </>
                )}
              </button>
     </div>
          )}
        </div>
      </div>
    </div>
  );
}
