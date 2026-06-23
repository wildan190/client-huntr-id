import React, { useEffect, useState, useCallback, useRef } from "react";
import Layout from "../components/Layout";
import { getCatalogues } from "../lib/api";

const PRODUCT_CATEGORIES = [
  "All",
  "Hardware",
  "Software",
  "Furniture",
  "Office Supplies",
  "Services",
  "Spareparts",
  "Electronics",
  "Mechanical",
  "Chemicals",
  "Construction",
  "Stationery",
  "Pantry & F&B",
  "Logistics",
  "Marketing",
  "Other"
];
import { aiSearch, aiGeneratePr, isAiQuery, aiCompareText } from "../lib/api/ai";
import AiInsightCard from "../components/AiInsightCard";
import AiCompareModal from "../components/AiCompareModal";
import {
  ShoppingCart, Search, Filter, Plus, Minus, Trash2,
  CheckCircle2, Loader2, Package, X, Sparkles, GitCompare,
} from "lucide-react";
import { useMediaQuery, MOBILE_BREAKPOINT } from "../hooks/useMediaQuery";
import { useNavigate } from "react-router";
import { getAssetUrl } from "../lib/assets";
import {
  loadCart,
  saveCart,
  addItemToCart as addItemToCartLib,
  updateCartQty as updateCartQtyLib,
  removeCartItem as removeCartItemLib,
  getCartItemCount,
} from "../lib/cart";

export default function Marketplace() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<any[]>(() => loadCart());
  const skipCartPersist = useRef(true);
  const [showCart, setShowCart] = useState(false);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  
  // Pagination & Category states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");

  // AI state
  const [aiMode, setAiMode] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiIntent, setAiIntent] = useState<any>(null);
  const [aiInsightDismissed, setAiInsightDismissed] = useState(false);
  const [isGeneratingPr, setIsGeneratingPr] = useState(false);
  const [comparisonText, setComparisonText] = useState<string | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  // Compare state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const CACHE_KEY = "huntr_marketplace_cache";
  const CACHE_TTL = 10 * 60 * 1000;

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
    localStorage.setItem(CACHE_KEY, JSON.stringify({ items, timestamp: Date.now() }));
  };

  useEffect(() => {
    const companySession = localStorage.getItem("active_company");
    if (companySession) {
      const comp = JSON.parse(companySession);
      setActiveCompany(comp);
      if (comp.type === "vendor") navigate("/");
    }
    fetchItems(true, 1, activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (skipCartPersist.current) {
      skipCartPersist.current = false;
      return;
    }
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    const onCartUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (Array.isArray(detail)) setCart(detail);
      else setCart(loadCart());
    };
    window.addEventListener("huntr-cart-updated", onCartUpdate);
    return () => window.removeEventListener("huntr-cart-updated", onCartUpdate);
  }, []);

  const fetchItems = async (showLoader = true, pageNum = 1, categoryName = "All") => {
    try {
      if (showLoader) setLoading(true);
      const res = await getCatalogues({ 
        search: searchTerm, 
        page: pageNum,
        category: categoryName === "All" ? undefined : categoryName
      });
      const data = res.data || res || [];
      if (res && res.data && Array.isArray(res.data)) {
        setItems(res.data);
        setCurrentPage(res.current_page || 1);
        setTotalPages(res.last_page || 1);
      } else {
        setItems(Array.isArray(data) ? data : []);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch marketplace items", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchItems(true, newPage, activeCategory);
  };

  const fetchItemsAi = async (query: string) => {
    try {
      setLoading(true);
      setAiMode(true);
      setAiInsightDismissed(false);
      setComparisonText(null);
      setIsLoadingComparison(false);
      const res = await aiSearch(query);
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setItems(data);
        setAiSummary(res.ai_summary || null);
        const intent = res.intent || null;
        setAiIntent(intent);

        // Jika AI mendeteksi intent comparison, fetch comparison text secara async
        if (intent?.is_comparison) {
          setIsLoadingComparison(true);
          aiCompareText(query)
            .then((r: any) => {
              if (r.success && r.markdown) {
                setComparisonText(r.markdown);
              }
            })
            .catch(() => {})
            .finally(() => setIsLoadingComparison(false));
        }
      } else {
        // AI gagal, fallback ke normal search
        setAiMode(false);
        setAiSummary(null);
        setAiIntent(null);
        await fetchItems();
      }
    } catch {
      setAiMode(false);
      setAiSummary(null);
      setAiIntent(null);
      await fetchItems();
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm) {
      setAiMode(false);
      setAiSummary(null);
      setAiIntent(null);
      setComparisonText(null);
      setIsLoadingComparison(false);
      const timer = setTimeout(() => fetchItems(true, 1, activeCategory), 300);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      if (isAiQuery(searchTerm)) {
        fetchItemsAi(searchTerm);
      } else {
        setAiMode(false);
        setAiSummary(null);
        setAiIntent(null);
        setComparisonText(null);
        setIsLoadingComparison(false);
        fetchItems(true, 1, activeCategory);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchTerm, activeCategory]);

  const handleGeneratePr = async () => {
    setIsGeneratingPr(true);
    try {
      const ids = compareIds.length > 0 ? compareIds : items.slice(0, 10).map((i) => i.id);
      const res = await aiGeneratePr(searchTerm, ids);
      if (res.success && res.draft) {
        localStorage.setItem("ai_pr_draft", JSON.stringify(res.draft));
        navigate("/checkout?from=ai");
      }
    } catch (e) {
      console.error("Failed to generate PR", e);
    } finally {
      setIsGeneratingPr(false);
    }
  };

  const addToCart = (item: any) => {
    const next = addItemToCartLib(item);
    setCart(next);
  };

  const updateQty = (id: string, delta: number) => {
    const next = updateCartQtyLib(id, delta);
    setCart(next);
  };

  const removeFromCart = (id: string) => {
    const next = removeCartItemLib(id);
    setCart(next);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 5) return prev; // max 5
      return [...prev, id];
    });
  };

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
            {getCartItemCount(cart)} items
          </span>
          {isMobile && (
            <button type="button" onClick={() => setShowCart(false)} aria-label="Close cart"
              style={{ width: 36, height: 36, borderRadius: 10, background: "var(--ui-bg-input)", border: "1px solid var(--ui-border)", color: "var(--ui-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: isMobile ? "none" : "360px", overflowY: "auto", paddingRight: 4 }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ui-text-muted)" }}>
            <ShoppingCart size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
            <div style={{ fontSize: 13 }}>Your cart is empty</div>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ui-text-primary)" }}>{item.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button" aria-label="Decrease quantity" onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, background: "var(--ui-bg-input)", border: "none", color: "var(--ui-text-secondary)", cursor: "pointer" }}><Minus size={12} /></button>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-primary)", minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, background: "var(--ui-bg-input)", border: "none", color: "var(--ui-text-secondary)", cursor: "pointer" }}><Plus size={12} /></button>
                <button type="button" aria-label="Remove item from cart" onClick={() => removeFromCart(item.id)} style={{ marginLeft: 4, color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* AI Generate PR button */}
          {aiMode && (
            <button
              onClick={handleGeneratePr}
              disabled={isGeneratingPr}
              style={{
                width: "100%", padding: "12px", borderRadius: 14,
                background: isGeneratingPr ? "rgba(168,85,247,0.3)" : "linear-gradient(135deg,#a855f7,#6366f1)",
                color: "#fff", fontWeight: 800, border: "none", cursor: isGeneratingPr ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13,
                boxShadow: "0 6px 16px rgba(168,85,247,0.25)",
              }}
            >
              <Sparkles size={16} />
              {isGeneratingPr ? "AI Menyiapkan PR..." : "Auto-create PR dengan AI"}
            </button>
          )}
          <button
            type="button"
            onClick={() => { setShowCart(false); navigate("/cart"); }}
            style={{
              width: "100%", padding: "12px", borderRadius: 14,
              background: "var(--ui-bg-input)", color: "var(--ui-text-primary)",
              fontWeight: 700, border: "1px solid var(--ui-border)", cursor: "pointer",
              fontSize: 13,
            }}
          >
            View Full Cart
          </button>
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
          {/* Search Bar */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, position: "relative" }}>
              {/* AI mode indicator in search */}
              {aiMode ? (
                <Sparkles
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#a855f7", transition: "color 0.3s ease" }}
                  size={18}
                />
              ) : (
                <Search
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}
                  size={18}
                />
              )}
              <input
                type="text"
                placeholder="Cari produk atau deskripsikan kebutuhan Anda... (AI akan membantu)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", padding: "12px 12px 12px 42px", borderRadius: 14,
                  background: "var(--ui-bg-input)",
                  border: aiMode ? "1px solid rgba(168,85,247,0.4)" : "1px solid var(--ui-border-input)",
                  color: "var(--ui-text-primary)", outline: "none", fontSize: 14,
                  transition: "all 0.3s ease",
                  boxShadow: aiMode ? "0 0 0 3px rgba(168,85,247,0.1)" : "none",
                }}
              />
              {aiMode && (
                <div style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  fontSize: 10, fontWeight: 900, color: "#a855f7",
                  background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)",
                  padding: "3px 8px", borderRadius: 20,
                }}>
                  ✦ AI Mode
                </div>
              )}
            </div>
            <button style={{
              padding: "0 18px", borderRadius: 14, background: "var(--ui-bg-input)",
              border: "1px solid var(--ui-border-input)", color: "var(--ui-text-secondary)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, fontSize: 14, transition: "all 0.3s ease",
            }}>
              <Filter size={16} /> Filters
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: "flex", gap: "clamp(6px, 2vw, 10px)", overflowX: "auto", paddingBottom: 16, marginBottom: 24, scrollbarWidth: "none" }}>
            {PRODUCT_CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "8px 16px", 
                  borderRadius: 12, 
                  fontSize: 13, 
                  fontWeight: 600,
                  background: activeCategory === cat ? "rgba(249,115,22,0.15)" : "var(--ui-bg-card)",
                  border: "1px solid",
                  borderColor: activeCategory === cat ? "rgba(249,115,22,0.3)" : "var(--ui-border)",
                  color: activeCategory === cat ? "#fb923c" : "var(--ui-text-secondary)",
                  cursor: "pointer", 
                  whiteSpace: "nowrap", 
                  transition: "all 0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* AI Insight Card */}
          {aiMode && aiSummary && !aiInsightDismissed && (
            <AiInsightCard
              summary={aiSummary}
              totalFound={items.length}
              query={searchTerm}
              catalogueIds={items.slice(0, 10).map((i) => i.id)}
              onGeneratePr={handleGeneratePr}
              onDismiss={() => setAiInsightDismissed(true)}
              isGenerating={isGeneratingPr}
              comparisonAnalysis={comparisonText}
              isComparison={!!aiIntent?.is_comparison || isLoadingComparison}
              specs={aiIntent?.specs ?? []}
            />
          )}

          {/* Compare floating bar */}
          {compareIds.length >= 2 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.08))",
              border: "1px solid rgba(99,102,241,0.25)", borderRadius: 14,
              padding: "12px 18px", marginBottom: 20,
              animation: "fadeSlideIn 0.3s ease",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                <GitCompare size={16} color="#6366f1" />
                <span style={{ color: "#6366f1" }}>{compareIds.length} produk</span> dipilih untuk dibandingkan
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCompareIds([])}
                  style={{ padding: "6px 12px", borderRadius: 10, background: "none", border: "1px solid rgba(99,102,241,0.2)", color: "var(--ui-text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Reset
                </button>
                <button onClick={() => setShowCompareModal(true)}
                  style={{
                    padding: "6px 16px", borderRadius: 10,
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    border: "none", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                  }}>
                  <Sparkles size={12} /> Bandingkan dengan AI
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 16 }}>
              {aiMode ? (
                <>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #f97316, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.5s ease-in-out infinite" }}>
                    <Sparkles size={26} color="#fff" />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ui-text-primary)", marginBottom: 4 }}>Huntr AI is thinking...</div>
                    <div style={{ fontSize: 12, color: "var(--ui-text-muted)" }}>Menganalisis kebutuhan dan mencari produk terbaik</div>
                  </div>
                </>
              ) : (
                <Loader2 className="animate-spin" size={32} color="#f59e0b" />
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: "clamp(12px, 3vw, 20px)" }}>
              {items.map((item) => {
                const isSelected = compareIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/marketplace/${item.id}`)}
                    style={{
                      background: "var(--ui-bg-card)", borderRadius: 20,
                      border: isSelected ? "2px solid rgba(99,102,241,0.5)" : "1px solid var(--ui-border)",
                      padding: 16, display: "flex", flexDirection: "column", gap: 12,
                      transition: "all 0.3s ease", cursor: "pointer",
                      boxShadow: isSelected ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                    }}
                  >
                    <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 12, background: "var(--ui-bg-input)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {item.image_path ? (
                        <img
                          src={getAssetUrl(item.image_path)}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = "none";
                          }}
                        />
                      ) : (
                        <Package size={36} color="var(--ui-text-muted)" strokeWidth={1.5} style={{ opacity: 0.35 }} />
                      )}
                      {/* Compare checkbox */}
                      <button
                        type="button"
                        aria-label={isSelected ? "Hapus dari perbandingan" : "Tambah ke perbandingan"}
                        onClick={(e) => { e.stopPropagation(); toggleCompare(item.id); }}
                        style={{
                          position: "absolute", top: 8, left: 8,
                          width: 26, height: 26, borderRadius: 8,
                          background: isSelected ? "linear-gradient(135deg, #6366f1, #a855f7)" : "rgba(0,0,0,0.4)",
                          border: isSelected ? "none" : "1px solid rgba(255,255,255,0.2)",
                          color: "#fff", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          backdropFilter: "blur(4px)",
                          transition: "all 0.2s ease",
                          boxShadow: isSelected ? "0 2px 8px rgba(99,102,241,0.4)" : "none",
                        }}
                      >
                        {isSelected ? <CheckCircle2 size={14} /> : <GitCompare size={12} />}
                      </button>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {item.category || "General"}
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ui-text-primary)", margin: "4px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.name}
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
                        {item.brand && (
                          <div style={{ fontSize: 11, color: "var(--ui-text-muted)" }}>Brand: <strong style={{ color: "var(--ui-text-secondary)" }}>{item.brand}</strong></div>
                        )}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#f97316", marginTop: 8 }}>
                        {item.price > 0 ? `Rp ${Number(item.price).toLocaleString("id-ID")}` : "Request Quote"}
                      </div>

                      {/* AI Re-ranking Badge & Explanation */}
                      {item.ai_score !== undefined && (
                        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ 
                              fontSize: 10, 
                              fontWeight: 900, 
                              color: item.ai_score >= 80 ? "#f97316" : "var(--ui-text-secondary)",
                              background: item.ai_score >= 80 ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.06)",
                              padding: "2px 6px",
                              borderRadius: 6,
                              border: item.ai_score >= 80 ? "1px solid rgba(249,115,22,0.2)" : "1px solid var(--ui-border-input)"
                            }}>
                              🤖 {item.ai_score}% Match
                            </span>
                          </div>
                          {item.ai_explanation && (
                            <div style={{ 
                              fontSize: 11, 
                              color: "var(--ui-text-muted)", 
                              lineHeight: 1.4,
                              fontStyle: "italic",
                              borderLeft: "2px solid rgba(249,115,22,0.3)",
                              paddingLeft: 6,
                              marginTop: 2
                            }}>
                              {item.ai_explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        aria-label="Add to cart"
                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: "rgba(249,115,22,0.15)", border: "none",
                          color: "#f97316", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--ui-border)",
                  background: "var(--ui-bg-card)",
                  color: "var(--ui-text-primary)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: currentPage === pageNum ? "none" : "1px solid var(--ui-border)",
                    background: currentPage === pageNum ? "linear-gradient(135deg,#f97316,#f59e0b)" : "var(--ui-bg-card)",
                    color: currentPage === pageNum ? "#fff" : "var(--ui-text-primary)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--ui-border)",
                  background: "var(--ui-bg-card)",
                  color: "var(--ui-text-primary)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`huntr-split-layout-aside${isMobile ? " huntr-split-layout-aside--mobile-hidden" : ""}`}>
          <div className="huntr-sticky-panel">{cartPanel}</div>
        </div>
      </div>

      {/* Mobile cart */}
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
          <button type="button" className="huntr-cart-fab" onClick={() => setShowCart(true)} aria-label={`Open cart, ${cart.length} items`}>
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, background: "var(--ui-bg-page)", border: "2px solid #f59e0b", color: "#f59e0b", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cart.length > 9 ? "9+" : cart.length}
              </span>
            )}
          </button>
        </>
      )}

      {/* AI Compare Modal */}
      {showCompareModal && compareIds.length >= 2 && (
        <AiCompareModal
          catalogueIds={compareIds}
          onClose={() => setShowCompareModal(false)}
          onAddToCart={(item) => { addToCart(item); setShowCompareModal(false); }}
        />
      )}

      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.05); opacity:0.85; } }
      `}</style>
    </Layout>
  );
}
