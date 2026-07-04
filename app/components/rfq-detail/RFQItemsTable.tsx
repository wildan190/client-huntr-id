import React from "react";
import { Package, Calendar } from "lucide-react";
import { getAssetUrl } from "../../lib/assets";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../../hooks/useMediaQuery";

interface RFQItemsTableProps {
  rfq: any;
}

export function RFQItemsTable({ rfq }: RFQItemsTableProps) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  return (
    <div style={{ background: "var(--ui-bg-card)", border: "1px solid var(--ui-border)", borderRadius: 12, padding: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--ui-text-primary)" }}>Items & Specifications</h3>
        <span style={{ fontSize: 12, background: "var(--ui-bg-input)", padding: "4px 10px", borderRadius: 6, color: "var(--ui-text-muted)", fontWeight: 700 }}>
          {rfq.items?.length || 0} ITEMS
        </span>
      </div>
      
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--ui-border)", background: "rgba(0,0,0,0.02)" }}>
              <th style={{ padding: "14px 24px", textAlign: "left", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Product & Catalog Details</th>
              <th style={{ padding: "14px 24px", textAlign: "center", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Quantity</th>
              <th style={{ padding: "14px 24px", textAlign: "right", color: "var(--ui-text-muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Required Date</th>
            </tr>
          </thead>
          <tbody>
            {(rfq.items || []).map((item: any, idx: number) => (
              <tr key={item.id} style={{ borderBottom: idx === (rfq.items.length - 1) ? "none" : "1px solid var(--ui-border)", transition: "background 0.2s" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Product Image - Enhanced with fallback handling */}
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 8, 
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: item.catalogue?.image_url ? "transparent" : "var(--ui-bg-input)",
                      border: "1px solid var(--ui-border-subtle)"
                    }}>
                      {item.catalogue?.image_url ? (
                        <img 
                          src={getAssetUrl(item.catalogue.image_url)} 
                          alt={item.catalogue?.name || "Product"}
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            borderRadius: 8, 
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            // Hide image if failed to load and show Package icon instead
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              const fallbackIcon = document.createElement('div');
                              fallbackIcon.className = 'fallback-icon';
                              fallbackIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-9"></path><path d="M14 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h9"></path><path d="M22 17a2 2 0 0 1-2 2H9.5a2 2 0 0 1 0-4H20a2 2 0 0 1 2 2Z"></path></svg>';
                              fallbackIcon.style.color = 'var(--ui-text-muted)';
                              parent.appendChild(fallbackIcon);
                            }
                          }}
                        />
                      ) : (
                        // No image available - show Package icon
                        <Package size={20} style={{ color: "var(--ui-text-muted)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--ui-text-primary)", fontSize: 15 }}>{item.catalogue?.name || "Unknown Item"}</div>
                      <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>
                        Code: <span style={{ fontFamily: "monospace", color: "#f59e0b" }}>{item.catalogue?.item_code || "N/A"}</span>
                        {/* Debug info - remove in production */}
                        {process.env.NODE_ENV === 'development' && (
                          <span style={{ marginLeft: 8, fontSize: 10, opacity: 0.6 }}>
                            img: {item.catalogue?.image_url ? '✓' : '✗'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span style={{ display: "inline-block", padding: "6px 16px", background: "var(--ui-bg-input)", borderRadius: 10, fontWeight: 600, color: "var(--ui-text-primary)", fontSize: 15 }}>
                    {item.qty} <span style={{ fontWeight: 500, color: "var(--ui-text-muted)", fontSize: 12, marginLeft: 2 }}>Units</span>
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, color: "var(--ui-text-secondary)", fontSize: 14, fontWeight: 600 }}>
                    <Calendar size={14} style={{ opacity: 0.6 }} />
                    {item.expected_date}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}