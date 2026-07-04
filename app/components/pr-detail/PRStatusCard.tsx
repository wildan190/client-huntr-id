import React from 'react';
import { Clock, CheckCircle2, Package, XCircle } from 'lucide-react';

interface PRStatusCardProps {
  status: string;
}

function getStatusStyle(status: string) {
  switch (status) {
    case "pending_approval": 
      return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "Pending Approval", icon: Clock };
    case "approved": 
      return { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Approved", icon: CheckCircle2 };
    case "active": 
      return { bg: "rgba(249,115,22,0.1)", color: "#fb923c", label: "Open (Global RFQ)", icon: Package };
    case "rejected": 
      return { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Rejected", icon: XCircle };
    default: 
      return { bg: "rgba(107,114,128,0.1)", color: "#6b7280", label: status, icon: Clock };
  }
}

export function PRStatusCard({ status }: PRStatusCardProps) {
  const statusInfo = getStatusStyle(status);
  const StatusIcon = statusInfo.icon;

  return (
    <div style={{ 
      padding: 16, 
      borderRadius: 16, 
      background: "var(--ui-bg-card)", 
      border: `1px solid var(--ui-border)` 
    }}>
      <div style={{ 
        fontSize: 11, 
        fontWeight: 700, 
        textTransform: "uppercase", 
        letterSpacing: 1, 
        color: "#9ca3af", 
        marginBottom: 12 
      }}>
        Current Status
      </div>
      
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 10, 
        marginBottom: 12 
      }}>
        <div style={{ 
          padding: 8, 
          borderRadius: 10, 
          background: statusInfo.bg, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <StatusIcon size={16} color={statusInfo.color} />
        </div>
        <div>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 800, 
            color: statusInfo.color 
          }}>
            {statusInfo.label}
          </div>
        </div>
      </div>

      <div style={{ 
        fontSize: 10, 
        color: "#9ca3af", 
        marginBottom: 6 
      }}>
        Lifecycle
      </div>
      <div style={{ 
        fontSize: 12, 
        color: "var(--ui-text-primary)", 
        lineHeight: 1.5 
      }}>
        {status === "pending_approval" && "Waiting for manager approval before the RFQ is published."}
        {status === "active" && "This request is live as a global RFQ and open for vendor proposals."}
        {status === "approved" && "The PR has been approved and is ready for next procurement steps."}
        {status === "rejected" && "This PR has been rejected and cannot proceed further."}
      </div>
    </div>
  );
}