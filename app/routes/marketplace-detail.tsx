import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { getCatalogue } from "../lib/api";

interface CatalogueItem {
  id: number;
  item_code: string;
  name: string;
  category?: string;
  specifications?: string;
  image?: string;
  uom: string;
  company_id: number;
  company?: {
    id: number;
    name: string;
    type: string;
  };
}

export default function MarketplaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<CatalogueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    setIsGuest(!userSession);

    if (!id) {
      setError("Product not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    getCatalogue(Number(id))
      .then((response) => {
        const payload = response?.data ?? response;
        const product = payload?.data ?? payload;
        setItem(product);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load product details. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = (catalogueItem: CatalogueItem) => {
    try {
      const currentCart = JSON.parse(localStorage.getItem("huntr_cart") || "[]");
      const existing = currentCart.find((i: any) => i.id === catalogueItem.id);
      const nextCart = existing
        ? currentCart.map((i: any) => i.id === catalogueItem.id ? { ...i, qty: i.qty + 1 } : i)
        : [...currentCart, { ...catalogueItem, qty: 1, estimated_price: 0 }];

      localStorage.setItem("huntr_cart", JSON.stringify(nextCart));
      setCartMessage("Product successfully added to cart.");
      window.setTimeout(() => setCartMessage(null), 3200);
    } catch (err) {
      console.error(err);
      setCartMessage("Unable to add product to cart right now.");
    }
  };

  return (
    <Layout title="Marketplace Product" subtitle="Product details from vendor catalog.">
      <style>{`
        @media (max-width: 768px) {
          .marketplace-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .marketplace-image {
            min-height: clamp(240px, 50vw, 360px) !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => isGuest ? navigate("/") : navigate("/marketplace")}
          style={{
            marginBottom: 24,
            padding: "10px 16px",
            borderRadius: 10,
            background: "var(--ui-bg-input)",
            border: "1px solid var(--ui-border-input)",
            color: "var(--ui-text-secondary)",
            cursor: "pointer",
            fontWeight: 700,
            transition: "all 0.3s ease",
          }}
        >
          ← {isGuest ? "Back to Home" : "Back to Marketplace"}
        </button>

        {loading && <div style={{ color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>Loading product details...</div>}
        {error && <div style={{ color: "#fca5a5", transition: "color 0.3s ease" }}>{error}</div>}
        {!loading && !error && item ? (
          <div style={{ display: "grid", gap: 24 }}>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ color: "#fdba74", fontSize: 13, fontWeight: 700, transition: "color 0.3s ease" }}>
                Marketplace Product
              </div>
              <h1 style={{ margin: 0, fontSize: 34, color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>{item.name}</h1>
              <p style={{ margin: 0, color: "var(--ui-text-secondary)", maxWidth: 760, lineHeight: 1.7, transition: "color 0.3s ease" }}>
                {item.specifications || "No additional specifications."}
              </p>
            </div>

            <div className="marketplace-detail-grid" style={{ display: "grid", gap: 24, gridTemplateColumns: "1.1fr 0.9fr" }}>
              <div className="marketplace-image" style={{ borderRadius: 24, overflow: "hidden", background: "var(--ui-bg-card)", minHeight: "clamp(240px, 50vw, 360px)", transition: "background 0.3s ease" }}>
                <img
                  src={item.image || "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80"}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              <div style={{ display: "grid", gap: 20, padding: 24, borderRadius: 24, background: "var(--ui-bg-card)", border: `1px solid var(--ui-border)`, transition: "all 0.3s ease" }}>
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ color: "var(--ui-text-muted)", textTransform: "uppercase", fontSize: 12, letterSpacing: 1.2, transition: "color 0.3s ease" }}>
                      Product Details
                    </span>
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                      <span>Product ID</span>
                      <span>{item.item_code}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                      <span>Category</span>
                      <span>{item.category || "General"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                      <span>Unit</span>
                      <span>{item.uom}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ color: "var(--ui-text-secondary)", fontSize: 14, fontWeight: 700, transition: "color 0.3s ease" }}>Specifications</div>
                  <div style={{ color: "var(--ui-text-primary)", background: "var(--ui-bg-input)", padding: 16, borderRadius: 16, lineHeight: 1.8, transition: "all 0.3s ease" }}>
                    {item.specifications || "No product specifications recorded."}
                  </div>
                </div>

                {cartMessage ? (
                  <div style={{ color: "#d1fae5", background: "rgba(16, 185, 129, 0.18)", padding: 14, borderRadius: 14, border: "1px solid rgba(16, 185, 129, 0.25)", transition: "all 0.3s ease" }}>
                    {cartMessage}
                  </div>
                ) : null}

                {isGuest ? (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      borderRadius: 16,
                      background: "linear-gradient(135deg,#f97316,#f59e0b)",
                      border: "none",
                      color: "#ffffff",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 10px 20px rgba(249,115,22,0.2)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Login to Create PR
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      borderRadius: 16,
                      background: "linear-gradient(135deg,#10b981,#059669)",
                      border: "none",
                      color: "#ffffff",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Add to Cart
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => isGuest ? navigate("/") : navigate(`/marketplace`)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 16,
                    background: "var(--ui-bg-input)",
                    border: "1px solid var(--ui-border-input)",
                    color: "var(--ui-text-secondary)",
                    cursor: "pointer",
                    fontWeight: 700,
                    transition: "all 0.3s ease",
                  }}
                >
                  {isGuest ? "Back to Home" : "Back to Marketplace"}
                </button>
              </div>
            </div>
          </div>
        ) : (
        !loading && !error && (
          <div style={{ color: "var(--ui-text-primary)", background: "var(--ui-bg-input)", padding: 20, borderRadius: 18, transition: "all 0.3s ease" }}>
            No product details available to display.
          </div>
        )
      )}
    </div>
    </Layout>
  );
}
