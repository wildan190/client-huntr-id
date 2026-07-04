import React from 'react';
import { Package, Calendar, User } from 'lucide-react';

interface PRSummaryProps {
  request: any;
}

export function PRSummary({ request }: PRSummaryProps) {
  const totalItems = request?.items?.reduce((sum: number, item: any) => {
    return sum + (item.qty || 0);
  }, 0) || 0;

  const estimatedTotal = request?.items?.reduce((sum: number, item: any) => {
    const price = item.catalogue?.estimated_price || item.estimated_price || 0;
    const qty = item.qty || 0;
    return sum + (price * qty);
  }, 0) || 0;

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
        PR Summary
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#9ca3af", fontSize: 11 }}>Line items</span>
        <span style={{ color: "var(--ui-text-primary)", fontWeight: 700, fontSize: 12 }}>
          {request.items?.length || 0}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#9ca3af", fontSize: 11 }}>Total quantity</span>
        <span style={{ color: "var(--ui-text-primary)", fontWeight: 700, fontSize: 12 }}>
          {totalItems} units
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#9ca3af", fontSize: 11 }}>Estimated total</span>
        <span style={{ color: "var(--ui-text-primary)", fontWeight: 700, fontSize: 12 }}>
          Rp {estimatedTotal.toLocaleString()}
        </span>
      </div>

      <div style={{ 
        paddingTop: 8, 
        borderTop: "1px solid var(--ui-border)", 
        marginTop: 8 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <User size={12} color="#9ca3af" />
          <span style={{ color: "#9ca3af", fontSize: 11 }}>Requested by</span>
        </div>
        <div style={{ color: "var(--ui-text-primary)", fontWeight: 700, fontSize: 12 }}>
          {request.user?.name || "Unknown"}
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Calendar size={12} color="#9ca3af" />
          <span style={{ color: "#9ca3af", fontSize: 11 }}>Created</span>
        </div>
        <div style={{ color: "var(--ui-text-primary)", fontWeight: 700, fontSize: 12 }}>
          {new Date(request.created_at).toLocaleDateString()}
        </div>
      </div>

      {request.delivery_point && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Package size={12} color="#9ca3af" />
            <span style={{ color: "#9ca3af", fontSize: 11 }}>Delivery point</span>
          </div>
          <div style={{ color: "var(--ui-text-primary)", fontWeight: 700, fontSize: 12 }}>
            {request.delivery_point}
          </div>
        </div>
      )}
    </div>
  );
}