import React from "react";
import { 
  ArrowLeft, Package, MapPin, ShieldCheck, User, Sparkles, 
  Loader2, AlertTriangle 
} from "lucide-react";
import { getRfqDocumentUrl, getAssetUrl } from "../../lib/assets";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../../hooks/useMediaQuery";

interface RFQSidebarProps {
  rfq: any;
  canSubmitProposal: () => boolean;
  canApproveOrAward: boolean;
  isTenderExpired: () => boolean;
  isVendor: boolean;
  getTenderSummary: () => string;
  totalItems: number;
  onNavigateToProposals: () => void;
  onInviteVendor: (e: React.FormEvent) => void;
  inviteWhatsapp: string;
  setInviteWhatsapp: (value: string) => void;
  inviting: boolean;
}

function SummaryRow({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
      <span style={{ color: "var(--ui-text-secondary)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "var(--ui-text-primary)" }}>{value}</span>
    </div>
  );
}

export function RFQSidebar({
  rfq,
  canSubmitProposal,
  canApproveOrAward,
  isTenderExpired,
  isVendor,
  getTenderSummary,
  totalItems,
  onNavigateToProposals,
  onInviteVendor,
  inviteWhatsapp,
  setInviteWhatsapp,
  inviting
}: RFQSidebarProps) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  return (
    <div 
      className={isMobile ? "huntr-split-layout-aside--mobile-hidden" : ""}
      style={{ 
        position: isMobile ? "static" : "sticky", 
        top: 24, 
        display: "grid", 
        gap: 16 
      }}
    >
      
      {/* Action Card */}
      <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 13, fontWeight: 600, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Tender Summary</h3>
        
        <div style={{ display: "grid", gap: 16 }}>
          <SummaryRow label="Total Quantity" value={`${totalItems} Units`} />
          <SummaryRow label="Tender Duration" value={`${rfq.duration_days ?? 7} day${(rfq.duration_days ?? 7) > 1 ? 's' : ''}`} />
          <SummaryRow label="Time Remaining" value={getTenderSummary()} />
        </div>

        {canSubmitProposal() && (
          <button
            onClick={onNavigateToProposals}
            style={{
              width: "100%",
              marginTop: 28,
              padding: "16px",
              borderRadius: 14,
              background: "linear-gradient(135deg,#f97316,#f59e0b)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(249,115,22,0.3)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            Submit Proposal <ArrowLeft size={18} style={{ transform: "rotate(180deg)" }} />
          </button>
        )}

        {/* Tender Expired Message for Vendors */}
        {isVendor && rfq && isTenderExpired() && (
          <div style={{
            width: "100%",
            marginTop: 28,
            padding: "16px",
            borderRadius: 14,
            background: "rgba(239,68,68,0.1)",
            color: "#ef4444",
            fontWeight: 700,
            fontSize: 14,
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            textAlign: "center",
          }}>
            <AlertTriangle size={18} />
            Tender Period Ended
          </div>
        )}

        {/* Not Vendor Message */}
        {!isVendor && rfq && rfq.status === 'active' && !isTenderExpired() && (
          <div style={{
            width: "100%",
            marginTop: 28,
            padding: "16px",
            borderRadius: 14,
            background: "rgba(156,163,175,0.1)",
            color: "var(--ui-text-muted)",
            fontWeight: 600,
            fontSize: 14,
            border: "1px solid rgba(156,163,175,0.2)",
            textAlign: "center",
          }}>
            Only vendors can submit proposals
          </div>
        )}
      </div>

      {/* Document Attachment */}
      {rfq.document_path && (
        <div style={{ 
          background: "var(--ui-bg-card)", 
          border: "1px solid var(--ui-border)", 
          borderRadius: 12, 
          padding: 20, 
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)" 
        }}>
          <h3 style={{ 
            margin: "0 0 16px", 
            fontSize: 13, 
            fontWeight: 600, 
            color: "var(--ui-text-muted)", 
            textTransform: "uppercase", 
            letterSpacing: 1 
          }}>
            Document Attachment
          </h3>
          <a 
            href={getAssetUrl(rfq.document_url || rfq.document_path)} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 16,
              background: "var(--ui-bg-input)",
              borderRadius: 12,
              textDecoration: "none",
              color: "var(--ui-text-primary)",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid var(--ui-border-input)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--ui-bg-card)";
              e.currentTarget.style.borderColor = "var(--huntr-orange)";
              e.currentTarget.style.color = "var(--huntr-orange)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--ui-bg-input)";
              e.currentTarget.style.borderColor = "var(--ui-border-input)";
              e.currentTarget.style.color = "var(--ui-text-primary)";
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(249,115,22,0.1)",
              color: "#f97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Package size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>View RFQ Document</div>
              <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 2 }}>
                Additional specifications and requirements
              </div>
            </div>
          </a>
        </div>
      )}

      {/* Invite Vendor Card (Buyer Only) */}
      {canApproveOrAward && rfq && (rfq.status === 'active' || rfq.status === 'draft') && !isTenderExpired() && (
        <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", padding: 8, borderRadius: 10 }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--ui-text-primary)" }}>Haven't found a vendor?</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ui-text-secondary)", lineHeight: 1.4 }}>
                Invite them to this platform and let them submit a proposal for your RFQ directly.
              </p>
            </div>
          </div>
          <form onSubmit={onInviteVendor} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input 
              type="tel"
              required
              placeholder="WhatsApp Number (e.g. 08123...)"
              value={inviteWhatsapp}
              onChange={e => setInviteWhatsapp(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid var(--ui-border-input)",
                background: "var(--ui-bg-input)",
                color: "var(--ui-text-primary)",
                fontSize: 14,
                outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={inviting || !inviteWhatsapp}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                background: inviting || !inviteWhatsapp ? "var(--ui-bg-input)" : "#f97316",
                color: inviting || !inviteWhatsapp ? "var(--ui-text-muted)" : "#fff",
                border: inviting || !inviteWhatsapp ? "1px solid var(--ui-border)" : "none",
                fontWeight: 600,
                fontSize: 14,
                cursor: inviting || !inviteWhatsapp ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s"
              }}
            >
              {inviting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
              {inviting ? "Sending Invite..." : "Invite Vendor"}
            </button>
          </form>
        </div>
      )}

      {/* Delivery Point */}
      <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={14} /> Delivery Point
        </div>
        <div style={{ fontSize: 13, color: "var(--ui-text-primary)", lineHeight: 1.6 }}>
          {rfq.delivery_point || rfq.company?.address || "Not specified"}
        </div>
      </div>

      {/* Security Box */}
      <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
          <ShieldCheck size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 12, color: "var(--ui-text-secondary)", lineHeight: 1.6 }}>
            Your proposal is protected by Huntr's enterprise security. Only the target buyer can access your commercial data.
          </p>
        </div>
      </div>
    </div>
  );
}