import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../lib/api";
import { Bell, CheckCircle2, Clock, ExternalLink, Loader2, Mail, MailOpen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    if (userSession) {
      const u = JSON.parse(userSession);
      setUser(u);
      fetchNotifications(u.id);
    }
  }, []);

  const fetchNotifications = async (userId: number, page: number = 1) => {
    try {
      setLoading(true);
      const res = await getNotifications(userId, page);
      setNotifications(res.data || []);
      setMeta(res);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, url?: string) => {
    if (!user) return;
    try {
      await markNotificationAsRead(id, user.id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
      if (url) navigate(url);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleReadAll = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <Layout title="Notifications" subtitle="Stay updated with your latest activities and requests.">
      <div style={{ maxWidth: "100%", width: "100%" }}>
        <div style={{ width: "100%" }}>
        
        {/* Header Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ui-text-primary)", display: "flex", alignItems: "center", gap: 10, transition: "color 0.3s ease" }}>
            <Bell size={20} color="#f59e0b" /> Recent Activity
          </h3>
          <button 
            onClick={handleReadAll}
            disabled={notifications.every(n => n.read_at)}
            style={{
              padding: "8px 16px", borderRadius: 10, background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c", fontSize: 13,
              fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              opacity: notifications.every(n => n.read_at) ? 0.5 : 1, transition: "all 0.3s ease"
            }}
          >
            <MailOpen size={14} /> Mark all as read
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Loader2 className="animate-spin" size={32} color="#f59e0b" />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0", background: "var(--ui-bg-input)", borderRadius: 32, border: "1px dashed var(--ui-border-input)", transition: "all 0.3s ease" }}>
            <Bell size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
            <h3 style={{ color: "var(--ui-text-secondary)", margin: 0, fontSize: 16, transition: "color 0.3s ease" }}>No notifications yet</h3>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notifications.map(n => {
              const isRead = n.read_at !== null;
              return (
                <div 
                  key={n.id} 
                  onClick={() => handleMarkAsRead(n.id, n.data?.url)}
                  style={{
                    background: isRead ? "var(--ui-bg-input)" : "rgba(249,115,22,0.05)",
                    borderRadius: 20, border: "1px solid",
                    borderColor: isRead ? "var(--ui-border-input)" : "rgba(249,115,22,0.2)",
                    padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: 20,
                    cursor: "pointer", transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 14, 
                    background: isRead ? "var(--ui-bg-card)" : "rgba(249,115,22,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s ease"
                  }}>
                    {isRead ? <MailOpen size={20} color="var(--ui-text-muted)" /> : <Mail size={20} color="#fb923c" />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: isRead ? "var(--ui-text-secondary)" : "var(--ui-text-primary)", transition: "color 0.3s ease" }}>
                        {n.data?.title || "Notification"}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ui-text-muted)", transition: "color 0.3s ease" }}>
                        <Clock size={12} /> {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: isRead ? "var(--ui-text-muted)" : "var(--ui-text-secondary)", lineHeight: 1.5, transition: "color 0.3s ease" }}>
                      {n.data?.body}
                    </p>
                    {n.data?.url && (
                      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#f59e0b", fontWeight: 700, transition: "color 0.3s ease" }}>
                        View Details <ExternalLink size={12} />
                      </div>
                    )}
                  </div>

                  {!isRead && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", marginTop: 6 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
