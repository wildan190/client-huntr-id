import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getCatalogues } from "../lib/api";
import { ShoppingCart, Search, Filter, Plus, Minus, Trash2, CheckCircle2, Loader2, Package } from "lucide-react";
import { useNavigate } from "react-router";

export default function Marketplace() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCompany, setActiveCompany] = useState<any>(null);

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
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const filteredItems = items;

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  return (
    <Layout title="Marketplace" subtitle="Discover items and services from our trusted vendors.">
      <div style={{ padding: "0 32px 40px", display: "flex", gap: 24 }}>
        
        {/* Main Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} size={18} />
              <input 
                type="text" 
                placeholder="Search items, codes, or vendors..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", padding: "12px 12px 12px 42px", borderRadius: 14,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#fff", outline: "none", fontSize: 14,
                }}
              />
            </div>
            <button style={{
              padding: "0 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, fontSize: 14,
            }}>
              <Filter size={16} /> Filters
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
              <Loader2 className="animate-spin" size={32} color="#6366f1" />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
              {filteredItems.map(item => (
                <div key={item.id} style={{
                  background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)",
                  padding: 16, display: "flex", flexDirection: "column", gap: 12, transition: "all 0.2s",
                }}>
                  <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 12, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Package size={48} color="rgba(255,255,255,0.1)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.category || "General"}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f3f4f6", margin: "4px 0" }}>{item.name}</h3>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>Vendor: <span style={{ color: "#d1d5db" }}>{item.company?.name}</span></div>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>
                        IDR {Number(item.price).toLocaleString()}
                      </div>
                      <button 
                        type="button"
                        aria-label="Tambah ke keranjang"
                        onClick={() => addToCart(item)}
                        style={{
                          width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.15)",
                          border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", cursor: "pointer",
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
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#9ca3af",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
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

        {/* Sidebar Cart Summary */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <div style={{
            position: "sticky", top: 24,
            background: "rgba(10,10,28,0.4)", backdropFilter: "blur(10px)",
            borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
            padding: 24, display: "flex", flexDirection: "column", gap: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#a855f7,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingCart size={20} color="#fff" />
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>Your Cart</h3>
              <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#6366f1", background: "rgba(99,102,241,0.1)", padding: "4px 8px", borderRadius: 8 }}>
                {cart.length} items
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "400px", overflowY: "auto", paddingRight: 4 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
                  <ShoppingCart size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
                  <div style={{ fontSize: 13 }}>Your cart is empty</div>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#f3f4f6" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>IDR {Number(item.price).toLocaleString()}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button type="button" aria-label="Kurangi jumlah" onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", color: "#9ca3af", cursor: "pointer" }}><Minus size={12} /></button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                      <button type="button" aria-label="Tambah jumlah" onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", color: "#9ca3af", cursor: "pointer" }}><Plus size={12} /></button>
                      <button type="button" aria-label="Hapus item dari keranjang" onClick={() => removeFromCart(item.id)} style={{ marginLeft: 4, color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ color: "#9ca3af", fontSize: 14 }}>Total Estimated</span>
                  <span style={{ color: "#fff", fontSize: 18, fontWeight: 900 }}>IDR {cartTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => navigate("/checkout")}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 14,
                    background: "linear-gradient(135deg,#a855f7,#6366f1)",
                    color: "#fff", fontWeight: 700, border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
                  }}
                >
                  Checkout PR <CheckCircle2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
