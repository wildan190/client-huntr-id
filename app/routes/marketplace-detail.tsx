import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLoaderData } from "react-router";
import Layout from "../components/Layout";
import { getCatalogue } from "../lib/api";
import { getAssetUrl } from "../lib/assets";
import { addItemToCart, getCartItemCount, loadCart } from "../lib/cart";
import { Package, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";
import type { Route } from "./+types/marketplace-detail";

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const response = await getCatalogue(params.id);
    let product = response;
    if (response && typeof response === "object" && "data" in response) {
      product = response.data;
    }
    return { product };
  } catch (err) {
    console.error("Failed to load product details in loader", err);
    return { product: null };
  }
}

export function meta({ data }: Route.MetaArgs) {
  const product = data?.product;
  if (!product) {
    return [
      { title: "Product Not Found | Huntr.id" },
      { name: "description", content: "The requested product catalogue item was not found." },
    ];
  }

  const title = `${product.name} | Huntr.id`;
  const description = product.specifications || `Buy ${product.name} on Huntr.id. ${product.category || "General"} product from vendor.`;
  const canonical = `https://app.huntr.id/marketplace/${product.id}`;
  const imageUrl = product.image_path
    ? getAssetUrl(product.image_path)
    : (product.image || "https://app.huntr.id/assets/img/logo/emblem.jpg");

  return [
    { title },
    { name: "description", content: description.substring(0, 160) },
    { rel: "canonical", href: canonical },
    // Open Graph
    { property: "og:type", content: "og:product" },
    { property: "og:url", content: canonical },
    { property: "og:title", content: title },
    { property: "og:description", content: description.substring(0, 160) },
    { property: "og:image", content: imageUrl },
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: canonical },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description.substring(0, 160) },
    { name: "twitter:image", content: imageUrl },
  ];
}


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
  const loaderData = useLoaderData<typeof loader>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<CatalogueItem | null>(loaderData?.product || null);
  const [loading, setLoading] = useState(!loaderData?.product);
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

    if (loaderData?.product && String(loaderData.product.id) === id) {
      setItem(loaderData.product);
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
  }, [id, loaderData]);

  const handleAddToCart = (catalogueItem: CatalogueItem) => {
    try {
      addItemToCart(catalogueItem as any);
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

  const productSchema = item ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": item.name,
    "image": imageUrl || undefined,
    "description": item.specifications || `Product details for ${item.name}`,
    "sku": item.item_code,
    "category": item.category || "General",
    ...(item.price && item.price > 0 ? {
      "offers": {
        "@type": "Offer",
        "price": item.price,
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock",
        "url": `https://app.huntr.id/marketplace/${item.id}`
      }
    } : {}),
    ...(item.company?.name ? {
      "brand": {
        "@type": "Brand",
        "name": item.company.name
      }
    } : {})
  } : null;

  return (
    <Layout title={pageTitle} subtitle="Product details from vendor catalog.">
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <style>{`
        @media (max-width: 768px) {
          .mp-detail-grid { grid-template-columns: 1fr !important; }
          .mp-image-box { min-height: 240px !important; max-height: 320px !important; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            margin: "0 0 32px 0",
            padding: "12px 0",
            borderBottom: "1px solid var(--ui-border)",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => (isGuest ? navigate("/") : navigate("/marketplace"))}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: "var(--ui-bg-input)",
              border: "1px solid var(--ui-border-input)",
              color: "var(--ui-text-primary)",
              cursor: "pointer",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--ui-bg-input-focus)";
              e.currentTarget.style.borderColor = "var(--ui-border-input-focus)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--ui-bg-input)";
              e.currentTarget.style.borderColor = "var(--ui-border-input)";
            }}
          >
            <ArrowLeft size={18} />
            {isGuest ? "Back to Home" : "Back to Marketplace"}
          </button>

          {!isGuest && (
            <Link
              to="/cart"
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                background: "var(--ui-bg-card)",
                border: "1px solid var(--ui-border-badge)",
                color: "var(--ui-text-brand)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--ui-bg-input)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--ui-bg-card)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <ShoppingCart size={18} />
              View Cart
              {cartCount > 0 && (
                <span
                  style={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: 12,
                    background: "#f59e0b",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
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
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                {item.category || "General"}
              </div>
              <h1 style={{ margin: "0 0 8px", fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 900, color: "var(--ui-text-primary)", lineHeight: 1.2 }}>
                {item.name}
              </h1>
              <div style={{ fontSize: 14, color: "var(--ui-text-muted)", marginBottom: 12 }}>SKU: {item.item_code}</div>
            </div>

            <div className="mp-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>
              <div
                className="mp-image-box"
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  background: "var(--ui-bg-card)",
                  minHeight: "clamp(280px, 50vh, 520px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--ui-border)",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
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

                <div style={{ background: "var(--ui-bg-card)", borderRadius: 20, padding: 24, border: "1px solid var(--ui-border)", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 12, borderBottom: "1px solid var(--ui-border)" }}>
                    Product Details
                  </div>
                  {[
                    { label: "SKU / Item Code", value: item.item_code },
                    { label: "Category", value: item.category || "General" },
                    { label: "Unit of Measure", value: item.uom },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 14, padding: "6px 0" }}>
                      <span style={{ color: "var(--ui-text-muted)", flexShrink: 0 }}>{label}</span>
                      <span style={{ color: "var(--ui-text-primary)", fontWeight: 600, textAlign: "right", maxWidth: "200px" }}>{value}</span>
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

            <div style={{ background: "var(--ui-bg-card)", borderRadius: 20, padding: 28, border: "1px solid var(--ui-border)", marginTop: 16, boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--ui-border)" }}>
                Specifications
              </div>
              <div style={{ padding: "8px 0" }}>
                <SpecificationsBlock text={item.specifications} />
              </div>
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
