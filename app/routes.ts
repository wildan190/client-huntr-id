import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("select-company", "routes/select-company.tsx"),
  route("marketplace", "routes/marketplace.tsx"),
  route("marketplace/:id", "routes/marketplace-detail.tsx"),
  route("my-pr", "routes/my-pr.tsx"),
  route("my-pr/:id", "routes/my-pr-detail.tsx"),
  route("all-requests", "routes/all-requests.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("approvals", "routes/approvals.tsx"),
  route("company", "routes/company.tsx"),
  route("catalogue", "routes/catalogue.tsx"),
  route("rfq", "routes/rfq.tsx"),
  route("proposals", "routes/proposals.tsx"),
  route("purchase_orders", "routes/orders.tsx"),
  route("receipts", "routes/receipts.tsx"),
  route("notifications", "routes/notifications.tsx"),
  route("account", "routes/account.tsx"),
  route("admin", "routes/admin.tsx"),
  // Catch-all for well-known and other non-route paths
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
