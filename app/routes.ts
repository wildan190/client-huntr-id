import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // ── Public / standalone routes (no persistent shell) ──────────────────────
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("select-company", "routes/select-company.tsx"),
  route("admin", "routes/admin.tsx"),
  route("invite/accept", "routes/invite-accept.tsx"),

  // ── Authenticated routes (inside persistent AppShell) ─────────────────────
  // _app.tsx renders the sidebar, header, notification sound, badge counts.
  // It NEVER unmounts between route transitions — sidebar keeps scroll position,
  // NotificationSound keeps mount time so it won't replay old events.
  layout("routes/_app.tsx", [
    index("routes/home.tsx"),
    route("marketplace", "routes/marketplace.tsx"),
    route("marketplace/:id", "routes/marketplace-detail.tsx"),
    route("cart", "routes/cart.tsx"),
    route("my-pr", "routes/my-pr.tsx"),
    route("my-pr/:id", "routes/my-pr-detail.tsx"),
    route("all-requests", "routes/all-requests.tsx"),
    route("rfq/:id", "routes/rfq-detail.tsx"),
    route("checkout", "routes/checkout.tsx"),
    route("approvals", "routes/approvals.tsx"),
    route("finance", "routes/finance.tsx"),
    route("company", "routes/company.tsx"),
    route("catalogue", "routes/catalogue.tsx"),
    route("rfq", "routes/rfq.tsx"),
    route("proposals", "routes/proposals.tsx"),
    route("negotiation", "routes/negotiation.tsx"),
    route("my-rank", "routes/my-rank.tsx"),
    route("orders", "routes/orders.tsx"),
    route("receipts", "routes/receipts.tsx"),
    route("payment-history", "routes/payment-history.tsx"),
    route("returns", "routes/returns.tsx"),
    route("debit-notes", "routes/debit-notes.tsx"),
    route("bast", "routes/bast.tsx"),
    route("efaktur", "routes/efaktur.tsx"),
    route("notifications", "routes/notifications.tsx"),
    route("account", "routes/account.tsx"),
    // Catch-all for well-known and other non-route paths
    route("*", "routes/404.tsx"),
  ]),
] satisfies RouteConfig;
