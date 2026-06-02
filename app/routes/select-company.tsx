import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { 
  Building2, LogIn, Plus, Loader2, CheckCircle2, ArrowRight,
  LayoutGrid, LogOut, Sparkles,
} from "lucide-react";
import { getMyCompanies } from "../lib/api";
import ThemeToggle from "../components/ThemeToggle";

export default function SelectCompany() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) { navigate("/login"); return; }
    const u = JSON.parse(session);
    setUser(u);
    getMyCompanies(u.id)
      .then(data => {
        const list = data.companies || [];
        setCompanies(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(() => setCompanies([]))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const handleLogin = () => {
    if (!selected) return;
    localStorage.setItem("active_company", JSON.stringify(selected));
    navigate("/");
  };

  const handleRegisterNew = () => navigate("/onboarding");
  const handleSignOut = () => { localStorage.clear(); navigate("/login"); };

  const statusMeta: Record<string, { color: string; bg: string; label: string }> = {
    approved: { color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Verified" },
    pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  label: "Pending"  },
    rejected: { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "Rejected" },
  };

  const getMeta = (s: string) => statusMeta[s] || { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", label: s || "Unknown" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[var(--ui-bg-page-grad)]">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-8%] w-[300px] md:w-[550px] h-[300px] md:h-[550px] rounded-full bg-radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 65%)" />
        <div className="absolute bottom-[-15%] left-[-8%] w-[350px] md:w-[650px] h-[350px] md:h-[650px] rounded-full bg-radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 65%)" />
      </div>

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 md:p-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/assets/img/logo/emblem.jpg" 
            alt="Huntr Logo" 
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover shadow-[0_4px_16px_rgba(249,115,22,0.35)]"
          />
          <div className="hidden sm:block">
            <div className="font-black text-sm md:text-base text-[var(--ui-text-primary)] tracking-tight">Huntr.id</div>
            <div className="text-[8px] md:text-[9px] text-orange-400 tracking-[0.12em] font-bold uppercase">Workspace</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--ui-bg-input)] border border-[var(--ui-border)] rounded-xl text-xs font-bold text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-input-focus)] hover:text-[var(--ui-text-primary)] transition-all"
          >
            <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Card */}
      <div className="w-full max-w-lg relative z-1">
        <div className="bg-[var(--ui-bg-card)] border border-[var(--ui-border)] rounded-3xl backdrop-blur-3xl overflow-hidden shadow-2xl">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500" />

          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/30">
                <LayoutGrid size={28} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[var(--ui-text-primary)] tracking-tight mb-2">
                Choose a Workspace
              </h1>
              {user && (
                <p className="text-sm text-[var(--ui-text-secondary)]">
                  Welcome back,{" "}
                  <span className="text-orange-400 font-bold">
                    {user.name}
                  </span>
                </p>
              )}
            </div>

            {/* Body */}
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <Loader2 size={32} className="text-orange-500 animate-spin" />
                <span className="text-sm text-[var(--ui-text-muted)] font-medium">Loading workspaces...</span>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--ui-bg-input)] flex items-center justify-center mx-auto mb-5 text-[var(--ui-text-muted)]">
                  <Building2 size={28} />
                </div>
                <p className="text-sm text-[var(--ui-text-secondary)] mb-8">
                  You don't have any registered company yet.
                </p>
                <button
                  onClick={handleRegisterNew}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus size={18} /> Register a Company
                </button>
              </div>
            ) : (
              <>
                {/* Company list */}
                <div className="flex flex-col gap-3 mb-8">
                  {companies.map(c => {
                    const isSelected = selected?.id === c.id;
                    const meta = getMeta(c.status);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelected(c)}
                        className={`
                          p-4 rounded-2xl text-left transition-all border-2 flex items-center gap-4 group
                          ${isSelected 
                            ? "bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/10" 
                            : "bg-[var(--ui-bg-input)] border-[var(--ui-border-subtle)] hover:border-[var(--ui-border-input)]"
                          }
                        `}
                      >
                        {/* Avatar */}
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all
                          ${isSelected 
                            ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white" 
                            : "bg-[var(--ui-bg-input-focus)] text-[var(--ui-text-muted)] group-hover:bg-[var(--ui-bg-input)]"
                          }
                        `}>
                          <Building2 size={22} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={`font-bold truncate ${isSelected ? "text-orange-400" : "text-[var(--ui-text-primary)]"}`}>
                            {c.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span 
                              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{ color: meta.color, background: meta.bg }}
                            >
                              {meta.label}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleLogin}
                    disabled={!selected}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
                  >
                    Enter Workspace <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={handleRegisterNew}
                    className="w-full py-3 bg-[var(--ui-bg-input)] hover:bg-[var(--ui-bg-input-focus)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text-primary)] rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    + Register Another Company
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-[var(--ui-text-muted)] font-bold uppercase tracking-[0.2em]">
            &copy; 2026 Huntr.id &bull; Secure Environment
          </p>
        </div>
      </div>
    </div>
  );
}
