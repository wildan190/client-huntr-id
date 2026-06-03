import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Building2,
  Package,
  ClipboardList,
  Lightbulb,
  Trophy,
  CheckCircle2,
  ReceiptText,
  LogOut,
  ChevronDown,
  ArrowLeftRight,
  List,
  Bell,
  Settings,
  Sun,
  Moon,
  Medal,
} from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import NotificationSound from "./NotificationSound";
import ThemeToggle from "./ThemeToggle";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../lib/api";
import { useTheme } from "../context/ThemeContext";

interface Props { children: React.ReactNode; title: string; subtitle?: string; }

// Routes that don't require auth (standalone pages)
const PUBLIC_ROUTES = ["/", "/login", "/register", "/onboarding", "/select-company"];

export default function Layout({ children, title, subtitle }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark, isAuto, resetToAuto } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [notifButtonPos, setNotifButtonPos] = useState({ top: 0, right: 0 });
  const notifButtonRef = React.useRef<HTMLButtonElement>(null);

  const isOwner = activeCompany?.owner_id === user?.id;
  const isManager = user?.role === 'manager' || isOwner;
  const isFinance = user?.role === 'finance';
  const isBuyerRole = user?.role === 'buyer';
  const isAdminRole = user?.role === 'admin';
  const isBuyerComp = activeCompany?.type === 'buyer';
  const isVendorComp = activeCompany?.type === 'vendor';

  const NAV = [
    { to: "/",          label: "Dashboard",  Icon: LayoutDashboard },
    
    // Buyer specific
    ...(isBuyerComp && (isManager || isBuyerRole) ? [{ to: "/marketplace", label: "Marketplace", Icon: Package }] : []),
    ...(isBuyerComp && (isManager || isBuyerRole || isFinance) ? [{ to: "/my-pr", label: "My PR", Icon: ClipboardList }] : []),
    ...(isBuyerComp && isManager ? [{ to: "/approvals", label: "Approvals", Icon: CheckCircle2 }] : []),
    
    // Vendor specific
    ...(isVendorComp && (isManager || isAdminRole) ? [{ to: "/catalogue", label: "Catalogue", Icon: List }] : []),
    ...(isVendorComp && (isManager || isAdminRole) ? [{ to: "/proposals", label: "Proposals", Icon: Trophy }] : []),
    ...(isVendorComp && (isManager || isAdminRole) ? [{ to: "/my-rank", label: "My Rank", Icon: Medal }] : []),
    
    // Common but context-aware
      { to: "/all-requests", label: "All Requests", Icon: Lightbulb },
      { to: "/purchase_orders",    label: "Purchase Order",   Icon: ReceiptText },
      { to: "/receipts",  label: "Receipt",    Icon: CheckCircle2 },
    { to: "/company",   label: "Company",    Icon: Building2 },
    { to: "/account",   label: "Settings",   Icon: Settings },
  ];

  // ── Double-auth guard ────────────────────────────────────────────────────────
  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    const companySession = localStorage.getItem("active_company");

    if (userSession) {
      const u = JSON.parse(userSession);
      setUser(u);
      fetchUnreadCount(u.id);
    }

    if (companySession) {
      setActiveCompany(JSON.parse(companySession));
    }

    const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/marketplace/");
    if (isPublic) return; // Let standalone pages handle themselves

    if (!userSession) {
      // No user at all → login
      navigate("/login");
      return;
    }

    if (!companySession) {
      // User logged in but no company selected → company selection
      navigate("/select-company");
      return;
    }

    // Listen for real-time notification events
    const handleNewNotif = () => userSession && fetchUnreadCount(JSON.parse(userSession).id);
    window.addEventListener('huntr:notification_received', handleNewNotif);

    return () => {
      window.removeEventListener('huntr:notification_received', handleNewNotif);
    };
  }, [pathname, navigate]);

  // Calculate notification button position for floating dropdown
  useEffect(() => {
    if (showNotifications && notifButtonRef.current) {
      const rect = notifButtonRef.current.getBoundingClientRect();
      setNotifButtonPos({
        top: rect.bottom + 20,  // Increased gap from 12 to 20
        right: window.innerWidth - rect.right - 40,  // Shift left by 40px
      });
    }
  }, [showNotifications]);

  const fetchUnreadCount = async (userId: number) => {
    try {
      const res = await getNotifications(userId);
      // Ensure we are working with the data array from pagination
      const dataArray = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      const unread = dataArray.filter((n: any) => n.read_at === null).length;
      setUnreadCount(unread);
      setRecentNotifications(dataArray.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch unread notifications", err);
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!user) return;
    try {
      if (n.read_at === null) {
        await markNotificationAsRead(n.id, user.id);
        fetchUnreadCount(user.id);
      }
      setShowNotifications(false);
      if (n.data?.url) navigate(n.data.url);
    } catch (err) {
      console.error("Failed to handle notification click", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      fetchUnreadCount(user.id);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    localStorage.removeItem("active_company");
    navigate("/login");
  };

  const handleSwitchCompany = () => {
    localStorage.removeItem("active_company");
    navigate("/select-company");
  };

  // Public/standalone routes render nothing if no session (they handle their own layout)
  const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/marketplace/");
  if (isPublic && !user && !activeCompany) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <NotificationSound />
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 224, flexShrink: 0,
        background: "var(--ui-bg-sidebar)",
        borderRight: "1px solid var(--ui-border)",
        backdropFilter: "blur(20px)",
        display: "flex", flexDirection: "column",
        padding: "22px 0", height: "100%",
        boxSizing: "border-box",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 18px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img 
              src="/assets/img/logo/emblem.jpg" 
              alt="Huntr Logo" 
              style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }} 
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ui-text-logo)", letterSpacing: "-0.3px" }}>Huntr.id</div>
              <div style={{ fontSize: 8, color: "#f59e0b", letterSpacing: "0.08em", fontWeight: 600 }}>E-PROCUREMENT</div>
            </div>
          </div>
        </div>

        {/* Active Company Badge */}
        {activeCompany && (
          <div style={{
            margin: "0 10px 16px",
            background: "var(--ui-bg-badge)",
            border: "1px solid var(--ui-border-badge)",
            borderRadius: 10, padding: "10px 12px",
          }}>
            <div style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 5 }}>ACTIVE WORKSPACE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#f97316,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Building2 size={14} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {activeCompany.name}
                </div>
                <div style={{ fontSize: 10, color: "var(--ui-text-muted)", textTransform: "uppercase" }}>{activeCompany.type}</div>
              </div>
            </div>
            <button
              onClick={handleSwitchCompany}
              style={{
                width: "100%", marginTop: 8, padding: "5px 8px", borderRadius: 6,
                fontSize: 10, fontWeight: 600, cursor: "pointer",
                background: "var(--ui-switch-bg)", border: "1px solid var(--ui-switch-border)",
                color: "var(--ui-switch-text)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}
            >
              <ArrowLeftRight size={10} /> Switch Company
            </button>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 10px", overflowY: "auto" }}>
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10,
                background: active ? "var(--ui-nav-active-bg)" : "transparent",
                border: active ? "1px solid var(--ui-nav-active-border)" : "1px solid transparent",
                color: active ? "var(--ui-text-nav-active)" : "var(--ui-text-nav-idle)",
                fontWeight: active ? 600 : 400, fontSize: 13,
                textDecoration: "none", transition: "all 0.15s",
              }}>
                <Icon size={16} />
                {label}
                {active && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />}
              </Link>
            );
          })}
        </nav>

        {/* User panel */}
        {user && (
          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--ui-border-subtle)", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Theme toggle with status */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Theme: {isAuto ? "🔄 Auto" : isDark ? "🌙 Dark" : "☀️ Light"}
              </div>
              <ThemeToggle />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#ea580c,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                <div style={{ fontSize: 10, color: "#f97316", fontWeight: 600, textTransform: "uppercase" }}>{user.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%", padding: "6px 10px", borderRadius: 6,
                fontSize: 11, fontWeight: 600,
                background: "var(--ui-logout-bg)", border: "1px solid var(--ui-logout-border)",
                color: "var(--ui-logout-text)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}
            >
              <LogOut size={11} /> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "hidden", overflowX: "hidden" }}>
        {/* Page header - STICKY */}
        <div style={{
          padding: "26px var(--ui-layout-padding) 18px",
          borderBottom: "1px solid var(--ui-border-subtle)",
          background: "var(--ui-bg-header)",
          backdropFilter: "blur(20px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}>
          <div>
            <Breadcrumb />
            <h1 style={{ fontSize: 21, fontWeight: 800, color: "var(--ui-text-primary)", margin: 0, letterSpacing: "-0.4px" }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 13, color: "var(--ui-text-muted)", margin: "4px 0 0" }}>{subtitle}</p>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Notification Bell & Floating Preview */}
            <div style={{ position: "relative" }}>
              <button 
                ref={notifButtonRef}
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: "relative", width: 40, height: 40, borderRadius: 12,
                  background: "var(--ui-toggle-bg)", border: "1px solid var(--ui-toggle-border)",
                  color: unreadCount > 0 ? "#fb923c" : "var(--ui-text-muted)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <Bell size={18} fill={unreadCount > 0 ? "rgba(249,115,22,0.2)" : "none"} />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: "#f59e0b", border: "2px solid var(--ui-notif-badge-border)",
                    color: "#fff", fontSize: 9, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 4px",
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div 
                    onClick={() => setShowNotifications(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 99998 }} 
                  />
                  <div style={{
                    position: "fixed", 
                    width: 320, 
                    background: "var(--ui-bg-card)", 
                    borderRadius: 20, 
                    border: "1px solid var(--ui-border)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)", 
                    zIndex: 99999,
                    overflow: "hidden",
                    top: `${notifButtonPos.top}px`,
                    right: `${notifButtonPos.right}px`,
                  }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ui-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ui-text-primary)" }}>Notifications</span>
                        {unreadCount > 0 && <span style={{ fontSize: 10, background: "rgba(249,115,22,0.2)", color: "#fb923c", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>{unreadCount} NEW</span>}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead(); }}
                        style={{ background: "none", border: "none", color: "var(--ui-text-muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }}
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div style={{ maxHeight: 350, overflowY: "auto" }}>
                      {recentNotifications.length === 0 ? (
                        <div style={{ padding: 40, textAlign: "center", color: "var(--ui-text-muted)", fontSize: 13 }}>No recent activity</div>
                      ) : (
                        recentNotifications.map((n: any) => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              padding: "14px 20px", borderBottom: "1px solid var(--ui-border-subtle)",
                              cursor: "pointer", background: n.read_at ? "transparent" : "rgba(249,115,22,0.04)",
                              transition: "background 0.2s",
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 700, color: n.read_at ? "var(--ui-text-muted)" : "var(--ui-text-primary)", marginBottom: 2 }}>{n.data?.title}</div>
                            <div style={{ fontSize: 11, color: "var(--ui-text-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.data?.body}</div>
                          </div>
                        ))
                      )}
                    </div>
                    <button 
                      onClick={() => { navigate("/notifications"); setShowNotifications(false); }}
                      style={{ width: "100%", padding: "12px", background: "var(--ui-bg-overlay)", border: "none", color: "#f59e0b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      View All Notifications
                    </button>
                  </div>
                </>
              )}
            </div>

            {activeCompany && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--ui-bg-badge)", border: "1px solid var(--ui-border-badge)",
                borderRadius: 20, padding: "5px 12px",
                fontSize: 11, color: "var(--ui-text-brand)", fontWeight: 600,
              }}>
                <Building2 size={11} />
                {activeCompany.name}
                <span style={{ padding: "1px 6px", borderRadius: 99, background: "rgba(249,115,22,0.2)", fontSize: 10, color: "#fdba74" }}>
                  {activeCompany.status || "pending"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "var(--ui-layout-padding)", overflowY: "auto", overflowX: "hidden" }}>
          {activeCompany && activeCompany.status === 'pending' && pathname !== '/company' ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              minHeight: "60vh", padding: "40px", textAlign: "center",
              background: "var(--ui-bg-pending-card)",
              border: "1px solid var(--ui-border)",
              borderRadius: "32px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
              maxWidth: "600px", margin: "40px auto",
              gap: "24px"
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: "24px",
                background: "rgba(251, 191, 36, 0.1)",
                border: "1px solid rgba(251, 191, 36, 0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 30px rgba(251,191,36,0.1)",
                color: "#fbbf24"
              }}>
                <Building2 size={42} style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
              </div>
              
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: 900, color: "var(--ui-text-primary)", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
                  Verifikasi Perusahaan Pending
                </h2>
                <p style={{ fontSize: "14px", color: "var(--ui-text-secondary)", lineHeight: "1.6", margin: 0 }}>
                  Workspace perusahaan <strong>{activeCompany.name}</strong> saat ini masih dalam proses peninjauan oleh tim admin.
                  Semua transaksi, pembuatan RFQ, pengunggahan dokumen, dan katalog dinonaktifkan sementara hingga akun Anda disetujui.
                </p>
              </div>

              <div style={{
                display: "flex", gap: "14px", width: "100%", justifyContent: "center"
              }}>
                <button
                  onClick={() => navigate("/company")}
                  style={{
                    padding: "12px 24px", borderRadius: "14px",
                    background: "linear-gradient(135deg, #f97316, #f59e0b)",
                    border: "none", color: "#fff", fontWeight: 700, fontSize: "13px",
                    cursor: "pointer", boxShadow: "0 10px 25px rgba(249,115,22,0.25)"
                  }}
                >
                  Lihat Status Verifikasi
                </button>
                <button
                  onClick={handleSwitchCompany}
                  style={{
                    padding: "12px 24px", borderRadius: "14px",
                    background: "var(--ui-bg-switch-btn)",
                    border: "1px solid var(--ui-border)",
                    color: "var(--ui-text-primary)", fontWeight: 700, fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Ganti Perusahaan
                </button>
              </div>
            </div>
          ) : children}
        </div>
      </div>
    </div>
  );
}
