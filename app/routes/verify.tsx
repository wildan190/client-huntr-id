import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ShieldCheck, ShieldX, FileText, Truck, ClipboardList,
  Building, Calendar, CheckCircle2, AlertCircle, ExternalLink,
  Loader2, User, Clock, Hash, ReceiptText, Camera, X, ScanLine,
  QrCode, RefreshCw,
} from "lucide-react";
import { apiGet } from "../lib/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SignatureEntry {
  role: string;
  label: string;
  signer_name?: string;
  signer_position?: string;
  signed_at?: string;
  is_signed: boolean;
}

interface VerifyResult {
  valid: boolean;
  doc_type: "invoice" | "do" | "bast";
  doc_number: string;
  doc_label: string;
  issued_at?: string;
  status?: string;
  tracking_number?: string;
  vendor_name: string;
  buyer_name: string;
  signatures: SignatureEntry[];
}

// ─── Config ───────────────────────────────────────────────────────────────────
const DOC_CONFIG: Record<string, { icon: React.FC<any>; color: string; accent: string; bg: string }> = {
  invoice: { icon: ReceiptText,    color: "#f59e0b", accent: "#fef3c7", bg: "rgba(245,158,11,0.08)" },
  do:      { icon: Truck,          color: "#3b82f6", accent: "#dbeafe", bg: "rgba(59,130,246,0.08)"  },
  bast:    { icon: ClipboardList,  color: "#8b5cf6", accent: "#ede9fe", bg: "rgba(139,92,246,0.08)"  },
};

// ─── Signature Card ───────────────────────────────────────────────────────────
const SignatureCard = ({ sig }: { sig: SignatureEntry }) => (
  <div style={{
    padding: "18px 20px", borderRadius: 16,
    background: sig.is_signed ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${sig.is_signed ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
    display: "flex", flexDirection: "column", gap: 8,
  }}>
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {sig.label}
      </span>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800,
        background: sig.is_signed ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
        color: sig.is_signed ? "#22c55e" : "rgba(255,255,255,0.3)",
        border: `1px solid ${sig.is_signed ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
      }}>
        {sig.is_signed ? <CheckCircle2 size={10} /> : <Clock size={10} />}
        {sig.is_signed ? "SIGNED" : "PENDING"}
      </span>
    </div>

    {/* Signer info */}
    {sig.signer_name && (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <User size={15} color="rgba(255,255,255,0.4)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>{sig.signer_name}</div>
          {sig.signer_position && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{sig.signer_position}</div>
          )}
        </div>
      </div>
    )}

    {/* Timestamp */}
    {sig.signed_at && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#22c55e", fontWeight: 600 }}>
        <Clock size={12} />
        {new Date(sig.signed_at).toLocaleString("en-US", {
          year: "numeric", month: "long", day: "numeric",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        })}
      </div>
    )}

    {!sig.is_signed && (
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>
        Awaiting signature…
      </div>
    )}
  </div>
);

// ─── Camera QR Scanner Component ─────────────────────────────────────────────
const CameraScanner = ({
  onScan,
  onClose,
}: {
  onScan: (text: string) => void;
  onClose: () => void;
}) => {
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCamera, setActiveCamera] = useState<string>("");
  const scannedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState?.();
        if (state === 2 /* SCANNING */) {
          await scannerRef.current.stop();
        }
      } catch (_) {}
    }
  }, []);

  const startCamera = useCallback(async (cameraId?: string) => {
    setScannerError(null);
    setScanning(true);
    scannedRef.current = false;

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

      // Make sure previous scanner is stopped
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch (_) {}
        try { scannerRef.current.clear(); } catch (_) {}
        scannerRef.current = null;
      }

      const qr = new Html5Qrcode("qr-scanner-container", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = qr;

      const config = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      const onSuccess = (decodedText: string) => {
        if (scannedRef.current) return;
        scannedRef.current = true;
        onScan(decodedText);
      };

      const onError = (_err: any) => { /* silent */ };

      if (cameraId) {
        await qr.start({ deviceId: { exact: cameraId } }, config, onSuccess, onError);
      } else {
        await qr.start({ facingMode: "environment" }, config, onSuccess, onError);
      }

      setScanning(false);
    } catch (err: any) {
      setScanning(false);
      if (err?.name === "NotAllowedError" || String(err).includes("NotAllowedError")) {
        setScannerError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (err?.name === "NotFoundError" || String(err).includes("NotFoundError")) {
        setScannerError("No camera found on this device.");
      } else {
        setScannerError("Failed to start camera: " + (err?.message ?? String(err)));
      }
    }
  }, [onScan]);

  useEffect(() => {
    // List cameras then start
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices ?? []);
      } catch (_) {}
    })();

    startCamera();

    return () => {
      stopScanner();
    };
  }, []);

  const switchCamera = async (id: string) => {
    setActiveCamera(id);
    await stopScanner();
    await startCamera(id);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.92)",
      backdropFilter: "blur(16px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      {/* Header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
          }}>
            <QrCode size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#f1f5f9" }}>Scan QR Code</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
              Point your camera at the QR code on the document
            </div>
          </div>
        </div>
        <button
          onClick={() => { stopScanner(); onClose(); }}
          style={{
            width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.06)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={18} color="rgba(255,255,255,0.6)" />
        </button>
      </div>

      {/* Scanner Area */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Viewfinder frame */}
        <div style={{ position: "relative" }}>
          {/* Corner brackets */}
          {[
            { top: 0, left: 0, borderTop: "3px solid #22c55e", borderLeft: "3px solid #22c55e" },
            { top: 0, right: 0, borderTop: "3px solid #22c55e", borderRight: "3px solid #22c55e" },
            { bottom: 0, left: 0, borderBottom: "3px solid #22c55e", borderLeft: "3px solid #22c55e" },
            { bottom: 0, right: 0, borderBottom: "3px solid #22c55e", borderRight: "3px solid #22c55e" },
          ].map((style, i) => (
            <div key={i} style={{
              position: "absolute", width: 28, height: 28, borderRadius: 3, zIndex: 10,
              ...style,
            }} />
          ))}

          {/* Scan line animation */}
          {!scannerError && (
            <div style={{
              position: "absolute", left: 0, right: 0, top: "50%", height: 2, zIndex: 10,
              background: "linear-gradient(90deg, transparent, #22c55e, transparent)",
              animation: "scanLine 2s ease-in-out infinite",
            }} />
          )}

          <div
            id="qr-scanner-container"
            ref={containerRef}
            style={{
              width: 300, height: 300,
              borderRadius: 16,
              overflow: "hidden",
              background: "#000",
            }}
          />
        </div>

        {/* Error state */}
        {scannerError && (
          <div style={{
            maxWidth: 320, padding: "16px 20px", borderRadius: 14,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center",
          }}>
            <AlertCircle size={24} color="#ef4444" />
            <p style={{ margin: 0, fontSize: 13, color: "#fca5a5", fontWeight: 500, lineHeight: 1.5 }}>
              {scannerError}
            </p>
            <button
              onClick={() => startCamera(activeCamera || undefined)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", fontSize: 13, fontWeight: 700,
              }}
            >
              <RefreshCw size={13} /> Try Again
            </button>
          </div>
        )}

        {/* Scanning spinner */}
        {scanning && !scannerError && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Loader2 size={16} color="#22c55e" style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Starting camera…</span>
          </div>
        )}

        {/* Camera switcher */}
        {cameras.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 320 }}>
            {cameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => switchCamera(cam.id)}
                style={{
                  padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700,
                  background: activeCamera === cam.id ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${activeCamera === cam.id ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: activeCamera === cam.id ? "#22c55e" : "rgba(255,255,255,0.4)",
                }}
              >
                <Camera size={10} style={{ display: "inline", marginRight: 4 }} />
                {cam.label || `Camera ${cameras.indexOf(cam) + 1}`}
              </button>
            ))}
          </div>
        )}

        {!scanning && !scannerError && (
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", maxWidth: 260 }}>
            Center the QR code within the frame. It will be detected automatically.
          </p>
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { transform: translateY(-120px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(120px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const docType = params.get("type") ?? "";
  const docId   = params.get("id") ?? "";
  const role    = params.get("role") ?? "";

  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<VerifyResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError]     = useState<string | null>(null);

  useEffect(() => {
    if (docType && docId) {
      verify(docType, docId, role);
    }
  }, [docType, docId]);

  const verify = async (type: string, id: string, r?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qs = new URLSearchParams({ type, id, ...(r ? { role: r } : {}) });
      const data = await apiGet<VerifyResult>(`/api/verify?${qs}`);
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? "Document not found or verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Called when camera scanner finds a QR code
  const handleScan = useCallback((text: string) => {
    setShowScanner(false);
    setScanError(null);

    try {
      // Try parsing JSON payload from huntr.id QR
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch (_) {}

      if (parsed && parsed.doc_type && parsed.doc_id) {
        // Full JSON payload — extract directly
        const t = parsed.doc_type;
        const i = parsed.doc_id;
        const r = parsed.role ?? "";
        navigate(`/verify?type=${encodeURIComponent(t)}&id=${encodeURIComponent(i)}${r ? `&role=${encodeURIComponent(r)}` : ""}`, { replace: true });
        verify(t, i, r);
        return;
      }

      // Try parsing as URL (e.g. https://app.huntr.id/verify?type=...&id=...)
      let urlObj: URL | null = null;
      try { urlObj = new URL(text); } catch (_) {}

      if (urlObj && urlObj.pathname.includes("/verify")) {
        const t = urlObj.searchParams.get("type") ?? "";
        const i = urlObj.searchParams.get("id") ?? "";
        const r = urlObj.searchParams.get("role") ?? "";
        if (t && i) {
          navigate(`/verify?type=${encodeURIComponent(t)}&id=${encodeURIComponent(i)}${r ? `&role=${encodeURIComponent(r)}` : ""}`, { replace: true });
          verify(t, i, r);
          return;
        }
      }

      // Fallback: if it's a relative path or just query string
      if (text.includes("type=") && text.includes("id=")) {
        const qs = new URLSearchParams(text.includes("?") ? text.split("?")[1] : text);
        const t = qs.get("type") ?? "";
        const i = qs.get("id") ?? "";
        const r = qs.get("role") ?? "";
        if (t && i) {
          navigate(`/verify?type=${encodeURIComponent(t)}&id=${encodeURIComponent(i)}${r ? `&role=${encodeURIComponent(r)}` : ""}`, { replace: true });
          verify(t, i, r);
          return;
        }
      }

      setScanError(`QR code scanned but format is unrecognized. Raw value: "${text.slice(0, 80)}${text.length > 80 ? "…" : ""}"`);
    } catch (e: any) {
      setScanError("Failed to parse QR code: " + (e?.message ?? String(e)));
    }
  }, [navigate]);

  const cfg = result ? (DOC_CONFIG[result.doc_type] ?? DOC_CONFIG.invoice) : null;
  const DocIcon = cfg?.icon ?? FileText;
  const allSigned = result?.signatures.every(s => s.is_signed) ?? false;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
    }}>
      {/* Camera Scanner Overlay */}
      {showScanner && (
        <CameraScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
            }}>
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#f1f5f9" }}>huntr.id</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Document Verification</div>
            </div>
          </div>
          <a
            href="/login"
            style={{
              fontSize: 12, fontWeight: 700, color: "#fb923c",
              textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
              padding: "6px 14px", borderRadius: 10,
              background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)"
            }}
          >
            Login <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 64px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Loader2 size={40} color="#22c55e" style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: 0, fontWeight: 600 }}>Verifying document authenticity…</p>
          </div>
        )}

        {/* No params — landing state with scan button */}
        {!loading && !result && !error && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
              boxShadow: "0 0 48px rgba(34,197,94,0.1)",
            }}>
              <ShieldCheck size={40} color="#22c55e" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#f1f5f9", margin: "0 0 12px" }}>Document Verification</h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, margin: "0 0 36px", maxWidth: 400, marginInline: "auto" }}>
              Verify the authenticity of Invoice, Delivery Order, or BAST from huntr.id. Scan a QR code printed on the document.
            </p>

            {/* Scan button */}
            <button
              id="btn-open-scanner"
              onClick={() => { setScanError(null); setShowScanner(true); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "14px 28px", borderRadius: 16, cursor: "pointer",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                border: "none", color: "#fff", fontSize: 15, fontWeight: 800,
                boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 32px rgba(34,197,94,0.45)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(34,197,94,0.35)"; }}
            >
              <Camera size={20} />
              Scan QR Code
            </button>

            {/* Scan error feedback */}
            {scanError && (
              <div style={{
                marginTop: 20, maxWidth: 420, marginInline: "auto",
                padding: "14px 18px", borderRadius: 14,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left",
              }}>
                <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 500, lineHeight: 1.5 }}>{scanError}</span>
              </div>
            )}

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              maxWidth: 360, marginInline: "auto", marginTop: 32, marginBottom: 8,
            }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>or scan manually</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: "8px 0 0" }}>
              QR codes on printed documents will open this page automatically.
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(239,68,68,0.15)",
            }}>
              <ShieldX size={44} color="#ef4444" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#f87171", marginBottom: 8 }}>Verification Failed</div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0, maxWidth: 420, marginInline: "auto" }}>{error}</p>
            </div>
            <div style={{
              padding: "16px 24px", borderRadius: 16,
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <AlertCircle size={18} color="#f87171" />
              <span style={{ fontSize: 13, color: "#f87171", fontWeight: 600 }}>
                This document could not be found or the QR code is invalid.
              </span>
            </div>
            {/* Try scanning again */}
            <button
              onClick={() => { setError(null); setResult(null); setShowScanner(true); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 12, cursor: "pointer",
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                color: "#22c55e", fontSize: 13, fontWeight: 700,
              }}
            >
              <Camera size={15} /> Scan Again
            </button>
          </div>
        )}

        {/* Success result */}
        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Validity Banner */}
            <div style={{
              padding: "28px 32px", borderRadius: 24, textAlign: "center",
              background: allSigned
                ? "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.06))"
                : "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.04))",
              border: `1px solid ${allSigned ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
              boxShadow: allSigned ? "0 8px 32px rgba(34,197,94,0.1)" : "none",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
                background: allSigned ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.12)",
                border: `2px solid ${allSigned ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 32px ${allSigned ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.15)"}`,
              }}>
                {allSigned
                  ? <ShieldCheck size={34} color="#22c55e" />
                  : <ShieldCheck size={34} color="#f59e0b" />
                }
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: allSigned ? "#22c55e" : "#f59e0b", marginBottom: 6 }}>
                {allSigned ? "Document Verified ✓" : "Document Authentic — Partial Signatures"}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                {allSigned
                  ? "All signatures are valid and this document is fully executed."
                  : "This document is authentic but not all signatures are complete yet."}
              </div>

              {/* Scan again button inside result */}
              <button
                onClick={() => { setResult(null); setError(null); setShowScanner(true); }}
                style={{
                  marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 18px", borderRadius: 10, cursor: "pointer",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700,
                }}
              >
                <ScanLine size={13} /> Scan Another Document
              </button>
            </div>

            {/* Document Info */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: cfg?.bg, border: `1px solid ${cfg?.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <DocIcon size={22} color={cfg?.color} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
                    {result.doc_label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: cfg?.color, letterSpacing: "-0.5px" }}>
                    {result.doc_number}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                {[
                  { icon: Building, label: "Vendor",     value: result.vendor_name, color: "#f97316" },
                  { icon: Building, label: "Buyer",      value: result.buyer_name,  color: "#3b82f6" },
                  { icon: Calendar, label: "Issued At",  value: result.issued_at ? new Date(result.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—", color: "#8b5cf6" },
                  ...(result.status ? [{ icon: Hash, label: "Status", value: result.status.toUpperCase(), color: "#06b6d4" }] : []),
                  ...(result.tracking_number ? [{ icon: Truck, label: "Tracking No.", value: result.tracking_number, color: "#22c55e" }] : []),
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{
                    padding: "12px 14px", borderRadius: 12,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon size={12} color={color} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: 24,
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={16} color="#22c55e" />
                Signature Verification
                <span style={{
                  marginLeft: "auto", fontSize: 11, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 20,
                  background: allSigned ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                  color: allSigned ? "#22c55e" : "#f59e0b",
                  border: `1px solid ${allSigned ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
                }}>
                  {result.signatures.filter(s => s.is_signed).length}/{result.signatures.length} signed
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.signatures.map((sig, i) => (
                  <SignatureCard key={i} sig={sig} />
                ))}
              </div>
            </div>

            {/* Platform attestation */}
            <div style={{
              padding: "14px 20px", borderRadius: 14,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <ShieldCheck size={16} color="rgba(255,255,255,0.2)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                Verified by <strong style={{ color: "rgba(255,255,255,0.5)" }}>huntr.id</strong> Procurement Platform · This verification is generated in real-time from our database.
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 24px", textAlign: "center",
      }}>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>
          © {new Date().getFullYear()} huntr.id — Procurement & Supply Chain Platform
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        #qr-scanner-container video { width: 100% !important; height: 100% !important; object-fit: cover; }
        #qr-scanner-container canvas { display: none; }
      `}</style>
    </div>
  );
}
