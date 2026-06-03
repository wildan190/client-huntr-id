import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getCatalogues } from "../lib/api";
import { ShoppingCart, Search, Filter, Plus, Minus, Trash2, CheckCircle2, Loader2, Package, X } from "lucide-react";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../hooks/useMediaQuery";
import { useNavigate } from "react-router";

export default function Marketplace() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  const CACHE_KEY = "huntr_marketplace_cache";
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  const loadCachedItems = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;

    try {
      const parsed = JSON.parse(cached);
      if (!parsed?.items) return false;

      const age = Date.now() - (parsed.timestamp || 0);
      if (age > CACHE_TTL) return false;

      setItems(parsed.items);
      setLoading(false);
      return true;
    } catch {
      return false;
    }
  };

  const saveItemsToCache = (items: any[]) => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ items, timestamp: Date.now() })
    );
  };

  useEffect(() => {
    const companySession = localStorage.getItem("active_company");
    if (companySession) {
      const comp = JSON.parse(companySession);
      setActiveCompany(comp);
      if (comp.type === 'vendor') {
        navigate("/");
      }
    }

    const hasCache = loadCachedItems();
    if (!hasCache) {
      fetchItems();
    } else {
      // Reload in the background if we have a cache to keep data fresh
      fetchItems(false);
    }

    const savedCart = localStorage.getItem("huntr_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("huntr_cart", JSON.stringify(cart));
  }, [cart]);

  const fetchItems = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await getCatalogues({ search: searchTerm });
      setItems(res.data || []);
      saveItemsToCache(res.data || []);
    } catch (err) {
      console.error("Failed to fetch marketplace items", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1, estimated_price: 0 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const filteredItems = items;

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  const cartPanel = (
    <div style={{
      background: "var(--ui-bg-card)", backdropFilter: "blur(10px)",
      borderRadius: 24, border: "1px solid var(--ui-border)",
      padding: 24, display: "flex", flexDirection: "column", gap: 20, transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#f97316,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShoppingCart size={20} color="#fff" />
          </div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>Your Cart</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", background: "rgba(249,115,22,0.1)", padding: "4px 8px", borderRadius: 8 }}>
            {cart.length} items
          </span>
          {isMobile && (
            <button
              type="button"
              onClick={() => setShowCart(false)}
              aria-label="Close cart"
              style={{
                width: 36, height: 36, borderRadius: 10, background: "var(--ui-bg-input)",
                border: "1px solid var(--ui-border)", color: "var(--ui-text-muted)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: isMobile ? "none" : "400px", overflowY: "auto", paddingRight: 4 }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
            <ShoppingCart size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
            <div style={{ fontSize: 13 }}>Your cart is empty</div>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{item.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button" aria-label="Decrease quantity" onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, background: "var(--ui-bg-input)", border: "none", color: "var(--ui-text-secondary)", cursor: "pointer", transition: "all 0.3s ease" }}><Minus size={12} /></button>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-primary)", minWidth: 20, textAlign: "center", transition: "color 0.3s ease" }}>{item.qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, background: "var(--ui-bg-input)", border: "none", color: "var(--ui-text-secondary)", cursor: "pointer", transition: "all 0.3s ease" }}><Plus size={12} /></button>
                <button type="button" aria-label="Remove item from cart" onClick={() => removeFromCart(item.id)} style={{ marginLeft: 4, color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <button 
            onClick={() => { setShowCart(false); navigate("/checkout"); }}
            style={{
              width: "100%", padding: "14px", borderRadius: 14,
              background: "linear-gradient(135deg,#f97316,#f59e0b)",
              color: "#fff", fontWeight: 700, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 8px 20px rgba(249,115,22,0.3)",
            }}
          >
            Create PR <CheckCircle2 size={18} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Layout title="Marketplace" subtitle="Discover items and services from our trusted vendors.">
      <div className="huntr-split-layout" style={{ paddingBottom: isMobile ? 88 : 0 }}>
        <div className="huntr-split-layout-main">
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }} size={18} />
              <input 
                type="text" 
                placeholder="Search items, codes, or vendors..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", padding: "12px 12px 12px 42px", borderRadius: 14,
                  background: "var(--ui-bg-input)", border: "1px solid var(--ui-border-input)",
                  color: "var(--ui-text-primary)", outline: "none", fontSize: 14, transition: "all 0.3s ease",
                }}
              />
            </div>
            <button style={{
              padding: "0 18px", borderRadius: 14, background: "var(--ui-bg-input)",
              border: "1px solid var(--ui-border-input)", color: "var(--ui-text-secondary)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, fontSize: 14, transition: "all 0.3s ease",
            }}>
              <Filter size={16} /> Filters
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
              <Loader2 className="animate-spin" size={32} color="#f59e0b" />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: "clamp(12px, 3vw, 20px)" }}>
              {filteredItems.map(item => (
                <div key={item.id} style={{
                  background: "var(--ui-bg-card)", borderRadius: 20, border: "1px solid var(--ui-border)",
                  padding: 16, display: "flex", flexDirection: "column", gap: 12, transition: "all 0.3s ease",
                }}>
                  <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 12, background: "var(--ui-bg-input)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>
                    <Package size={48} color="var(--ui-text-secondary)" style={{ opacity: 0.3, transition: "color 0.3s ease" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.category || "General"}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ui-text-primary)", margin: "4px 0", transition: "color 0.3s ease" }}>{item.name}</h3>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                      <button 
                        type="button"
                        aria-label="Add to cart"
                        onClick={() => addToCart(item)}
                        style={{
                          width: 36, height: 36, borderRadius: 10, background: "rgba(249,115,22,0.15)",
                          border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/marketplace/${item.id}`)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "var(--ui-bg-input)",
                        border: "1px solid var(--ui-border-input)",
                        color: "var(--ui-text-secondary)",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        transition: "all 0.3s ease",
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`huntr-split-layout-aside${isMobile ? " huntr-split-layout-aside--mobile-hidden" : ""}`}>
          <div className="huntr-sticky-panel">{cartPanel}</div>
        </div>
      </div>

      {isMobile && (
        <>
          <div
            className={`huntr-cart-drawer-backdrop${showCart ? " huntr-cart-drawer-backdrop--visible" : ""}`}
            onClick={() => setShowCart(false)}
            aria-hidden={!showCart}
          />
          <div className={`huntr-cart-drawer${showCart ? " huntr-cart-drawer--open" : ""}`}>
            {cartPanel}
          </div>
          <button
            type="button"
            className="huntr-cart-fab"
            onClick={() => setShowCart(true)}
            aria-label={`Open cart, ${cart.length} items`}
          >
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10,
                background: "var(--ui-bg-page)", border: "2px solid #f59e0b", color: "#f59e0b",
                fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {cart.length > 9 ? "9+" : cart.length}
              </span>
            )}
          </button>
        </>
      )}
    </Layout>
  );
}
