import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Layout from "../components/Layout";
import { getCatalogue } from "../lib/api";
import { getAssetUrl } from "../lib/assets";
import { addItemToCart, getCartItemCount, loadCart } from "../lib/cart";
import { Package, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";

interface CatalogueItem {
  id: string;
  item_code: string;
  name: string;
  category?: string;
  specifications?: string;
  price?: number;
  image?: string;
  image_path?: string;
  uom: string;
  company_id: string;
  company?: {
    id: string;
    name: string;
    type: string;
  };
}

/** Render specifications: preformatted if it contains newlines, else as plain paragraph. */
function SpecificationsBlock({ text }: { text: string | undefined }) {
  if (!text) {
    return (
      <p style={{ margin: 0, color: "var(--ui-text-muted)", fontStyle: "italic" }}>
        No product specifications recorded.
      </p>
    );
  }

  const hasNewlines = text.includes("\n");

  if (hasNewlines) {
    return (
      <pre style={{
        margin: 0,
        fontFamily: "inherit",
        fontSize: 14,
        lineHeight: 1.8,
        color: "var(--ui-text-primary)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {text}
      </pre>
    );
  }

  return (
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "var(--ui-text-primary)" }}>
      {text}
    </p>
  );
}

export default function MarketplaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<CatalogueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    setIsGuest(!userSession);
    setCartCount(getCartItemCount(loadCart()));

    const onCartUpdate = () => setCartCount(getCartItemCount(loadCart()));
    window.addEventListener("huntr-cart-updated", onCartUpdate);
    return () => window.removeEventListener("huntr-cart-updated", onCartUpdate);
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Product not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    getCatalogue(id)
      .then((response) => {
        let product = response;
        if (response && typeof response === "object" && "data" in response) {
          product = response.data;
        }
        if (product) {
          setItem(product);
          setError(null);
          sessionStorage.setItem(`/marketplace/${id}`, product.name);
        } else {
          setError("Product data is empty.");
        }
      })
      .catch(() => {
        setError("Failed to load product details. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = (catalogueItem: CatalogueItem) => {
    try {
      addItemToCart(catalogueItem);
      setCartCount(getCartItemCount(loadCart()));
      setCartMessage("Product added to cart.");
      window.setTimeout(() => setCartMessage(null), 4000);
    } catch {
      setCartMessage("Unable to add product to cart right now.");
    }
  };

  const imageUrl = item?.image_path
    ? getAssetUrl(item.image_path)
    : (item?.image || null);

  const pageTitle = item?.name || "Marketplace Product";

  return (
    <Layout title={pageTitle} subtitle="Product details from vendor catalog.">
      <style>{`
        @media (max-width: 768px) {
          .mp-detail-grid { grid-template-columns: 1fr !important; }
          .mp-image-box { min-height: 240px !important; max-height: 320px !important; }
        }
      `}</style>

      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => (isGuest ? navigate("/") : navigate("/marketplace"))}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              background: "var(--ui-bg-input)",
              border: "1px solid var(--ui-border-input)",
              color: "var(--ui-text-secondary)",
              cursor: "pointer",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
            }}
          >
            <ArrowLeft size={16} />
            {isGuest ? "Back to Home" : "Back to Marketplace"}
          </button>

          {!isGuest && (
            <Link
              to="/cart"
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                background: "var(--ui-bg-card)",
                border: "1px solid var(--ui-border-badge)",
                color: "var(--ui-text-brand)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <ShoppingCart size={16} />
              View Cart
              {cartCount > 0 && (
                <span
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                    background: "#f59e0b",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 6px",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 80, color: "var(--ui-text-muted)" }}>
            Loading product details...
          </div>
        )}
        {error && (
          <div style={{ color: "#fca5a5", padding: 20, borderRadius: 14, background: "rgba(239,68,68,0.08)" }}>
            {error}
          </div>
        )}

        {!loading && !error && item && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <div style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                {item.category || "General"}
              </div>
              <h1 style={{ margin: "0 0 4px", fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 900, color: "var(--ui-text-primary)", lineHeight: 1.2 }}>
                {item.name}
              </h1>
              <div style={{ fontSize: 13, color: "var(--ui-text-muted)" }}>SKU: {item.item_code}</div>
            </div>

            <div className="mp-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
              <div
                className="mp-image-box"
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  background: "var(--ui-bg-card)",
                  minHeight: "clamp(240px, 40vw, 480px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--ui-border)",
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "var(--ui-text-muted)" }}>
                    <Package size={64} strokeWidth={1} />
                    <span style={{ fontSize: 13 }}>No image available</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {item.price && item.price > 0 ? (
                  <div style={{ background: "var(--ui-bg-card)", borderRadius: 20, padding: 20, border: "1px solid var(--ui-border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      Estimated Price
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#10b981" }}>
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.price)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ui-text-muted)", marginTop: 4 }}>per {item.uom}</div>
                  </div>
                ) : null}

                <div style={{ background: "var(--ui-bg-card)", borderRadius: 20, padding: 20, border: "1px solid var(--ui-border)", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Product Details
                  </div>
                  {[
                    { label: "SKU / Item Code", value: item.item_code },
                    { label: "Category", value: item.category || "General" },
                    { label: "Unit of Measure", value: item.uom },
                    ...(item.company?.name ? [{ label: "Vendor", value: item.company.name }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
                      <span style={{ color: "var(--ui-text-muted)", flexShrink: 0 }}>{label}</span>
                      <span style={{ color: "var(--ui-text-primary)", fontWeight: 600, textAlign: "right" }}>{value}</span>
                    </div>
                  ))}
                </div>

                {cartMessage ? (
                  <div style={{ color: "#065f46", background: "rgba(16,185,129,0.12)", padding: 14, borderRadius: 14, border: "1px solid rgba(16,185,129,0.25)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <span>{cartMessage}</span>
                    {!isGuest && (
                      <Link to="/cart" style={{ color: "#059669", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                        Go to Cart <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                ) : null}

                {isGuest ? (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    style={{
                      width: "100%",
                      padding: "15px 18px",
                      borderRadius: 16,
                      background: "linear-gradient(135deg,#f97316,#f59e0b)",
                      border: "none",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 15,
                      boxShadow: "0 8px 24px rgba(249,115,22,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <ShoppingCart size={18} /> Login to Create PR
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      style={{
                        width: "100%",
                        padding: "15px 18px",
                        borderRadius: 16,
                        background: "linear-gradient(135deg,#10b981,#059669)",
                        border: "none",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: 15,
                        boxShadow: "0 8px 24px rgba(16,185,129,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>
                    <Link
                      to="/cart"
                      style={{
                        width: "100%",
                        padding: "13px 18px",
                        borderRadius: 16,
                        background: "var(--ui-bg-input)",
                        border: "1px solid var(--ui-border)",
                        color: "var(--ui-text-primary)",
                        fontWeight: 700,
                        fontSize: 14,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxSizing: "border-box",
                      }}
                    >
                      View Cart ({cartCount})
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "var(--ui-bg-card)", borderRadius: 20, padding: 24, border: "1px solid var(--ui-border)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                Specifications
              </div>
              <SpecificationsBlock text={item.specifications} />
            </div>
          </div>
        )}

        {!loading && !error && !item && (
          <div style={{ color: "var(--ui-text-primary)", background: "var(--ui-bg-input)", padding: 20, borderRadius: 18 }}>
            No product details available to display.
          </div>
        )}
      </div>
    </Layout>
  );
}
