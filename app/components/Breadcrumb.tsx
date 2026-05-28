import React from "react";
import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const paths = pathname.split("/").filter(Boolean);

  if (paths.length === 0) {
    return null; // Don't show breadcrumb on home page if you don't want to, or show just Home.
  }

  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 12, color: "#9ca3af",
      marginBottom: 16,
      padding: "0 4px"
    }}>
      <Link to="/" style={{ color: "#6b7280", transition: "color 0.2s", display: "flex", alignItems: "center" }}>
        <Home size={14} />
      </Link>
      
      {paths.map((path, idx) => {
        const isLast = idx === paths.length - 1;
        const to = `/${paths.slice(0, idx + 1).join("/")}`;
        const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

        return (
          <React.Fragment key={path}>
            <ChevronRight size={14} color="#4b5563" />
            {isLast ? (
              <span style={{ color: "#e5e7eb", fontWeight: 600 }}>{name}</span>
            ) : (
              <Link to={to} style={{ color: "#9ca3af", textDecoration: "none", transition: "color 0.2s" }}>
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
