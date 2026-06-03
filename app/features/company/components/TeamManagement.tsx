import React from "react";
import { UserPlus, Users, MessageCircle, Mail, Loader2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
}

interface TeamManagementProps {
  company: any;
  teamMembers: TeamMember[];
  teamLoading: boolean;
  isInviting: boolean;
  inviteForm: { whatsapp: string; email: string; role: string };
  setInviteForm: (form: any) => void;
  handleInviteUser: (e: React.FormEvent) => void;
  inviteError: string | null;
  inviteSuccess: string | null;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  company,
  teamMembers,
  teamLoading,
  isInviting,
  inviteForm,
  setInviteForm,
  handleInviteUser,
  inviteError,
  inviteSuccess,
}) => {
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      {/* Invite Section */}
      <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <UserPlus size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--ui-text-primary)] m-0">Invite Team Member</h3>
            <p className="text-sm text-[var(--ui-text-muted)] mt-1">Add colleagues to your workspace via WhatsApp invitation.</p>
          </div>
        </div>

        <form onSubmit={handleInviteUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--ui-text-muted)]">WhatsApp Number</span>
            <div className="relative">
              <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ui-text-muted)]" />
              <input
                required
                placeholder="e.g. 628123456789"
                value={inviteForm.whatsapp}
                onChange={e => setInviteForm({ ...inviteForm, whatsapp: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--ui-text-muted)]">Email (Optional)</span>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ui-text-muted)]" />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteForm.email}
                onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--ui-text-muted)]">Workspace Role</span>
            <select
              required
              value={inviteForm.role}
              onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Select Role...</option>
              <option value="manager">Manager (Full Access)</option>
              {company.type === 'buyer' ? (
                <>
                  <option value="buyer">Buyer</option>
                  <option value="finance">Finance</option>
                </>
              ) : (
                <>
                  <option value="admin">Admin</option>
                  <option value="finance">Finance</option>
                </>
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={isInviting}
            className="h-[52px] px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isInviting ? <Loader2 size={18} className="animate-spin" /> : <><MessageCircle size={18} /> Send Invite</>}
          </button>
        </form>

        {inviteError && <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">{inviteError}</div>}
        {inviteSuccess && <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">{inviteSuccess}</div>}
      </div>

      {/* List Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--ui-bg-input)] text-orange-500">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-black text-[var(--ui-text-primary)] m-0">Active Team</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest">{teamMembers.length} Members</span>
        </div>

        {teamLoading ? (
          <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-orange-500" /></div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-16 bg-[var(--ui-bg-input)] rounded-3xl border-2 border-dashed border-[var(--ui-border)]">
            <Users size={40} className="mx-auto text-[var(--ui-text-muted)] opacity-20 mb-4" />
            <p className="text-[var(--ui-text-muted)] text-sm font-medium">No team members yet. Invite your first colleague!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <div key={member.id} className="group p-6 rounded-3xl bg-[var(--ui-bg-card)] border border-[var(--ui-border)] hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/5 transition-all flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--ui-bg-input)] flex items-center justify-center text-orange-500 font-black text-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                  {member.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black text-[var(--ui-text-primary)] truncate">{member.name || "Unnamed User"}</div>
                  <div className="text-xs text-[var(--ui-text-muted)] truncate mt-0.5">{member.email || member.whatsapp}</div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase tracking-tighter">
                  {member.role}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
