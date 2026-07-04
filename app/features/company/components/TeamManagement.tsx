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
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs">
          <strong>Debug Info:</strong> Company Type: {company?.type || 'Unknown'} | 
          Valid Roles: {company?.type === 'buyer' ? 'buyer, manager, finance' : 'admin, manager, finance'}
        </div>
      )}

      {/* Invite Section */}
      <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow shadow-orange-500/20">
            <UserPlus size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--ui-text-primary)] m-0">Invite Team Member</h3>
            <p className="text-xs text-[var(--ui-text-muted)] mt-1">Add colleagues to your workspace via WhatsApp invitation.</p>
          </div>
        </div>

        <form onSubmit={handleInviteUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ui-text-muted)]">WhatsApp Number</span>
            <div className="relative">
              <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ui-text-muted)]" />
              <input
                required
                placeholder="e.g. 628123456789"
                value={inviteForm.whatsapp}
                onChange={e => setInviteForm({ ...inviteForm, whatsapp: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ui-text-muted)]">Email (Optional)</span>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ui-text-muted)]" />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteForm.email}
                onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ui-text-muted)]">Workspace Role</span>
            <select
              required
              value={inviteForm.role}
              onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Select Role...</option>
              <option value="manager">Manager (Full Access)</option>
              {company?.type === 'buyer' ? (
                <>
                  <option value="buyer">Buyer</option>
                  <option value="finance">Finance</option>
                </>
              ) : company?.type === 'vendor' ? (
                <>
                  <option value="admin">Admin</option>
                  <option value="finance">Finance</option>
                </>
              ) : (
                // Fallback for unknown company types
                <>
                  <option value="admin">Admin</option>
                  <option value="buyer">Buyer</option>
                  <option value="finance">Finance</option>
                </>
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={isInviting}
            className="h-[38px] px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isInviting ? <Loader2 size={16} className="animate-spin" /> : <><MessageCircle size={16} /> Send Invite</>}
          </button>
        </form>

        {inviteError && <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">{inviteError}</div>}
        {inviteSuccess && <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">{inviteSuccess}</div>}
      </div>

      {/* List Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--ui-bg-input)] text-orange-500">
              <Users size={16} />
            </div>
            <h3 className="text-base font-bold text-[var(--ui-text-primary)] m-0">Active Team</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-xs font-semibold">{teamMembers.length} Members</span>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={async () => {
                  try {
                    const { diagnoseRoleInconsistencies } = await import('../../../lib/api/company');
                    const result = await diagnoseRoleInconsistencies(company.id);
                    console.log('Role Diagnosis:', result);
                    alert(`Found ${result.inconsistencies_found} role inconsistencies. Check console for details.`);
                  } catch (err) {
                    console.error('Diagnosis failed:', err);
                    alert('Diagnosis failed. Check console for details.');
                  }
                }}
                className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-xs font-semibold hover:bg-blue-500/20 transition-all"
                title="Diagnose role inconsistencies"
              >
                Diagnose
              </button>
            )}
          </div>
        </div>

        {teamLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-orange-500" /></div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-10 bg-[var(--ui-bg-input)] rounded-xl border border-dashed border-[var(--ui-border)]">
            <Users size={32} className="mx-auto text-[var(--ui-text-muted)] opacity-30 mb-2" />
            <p className="text-[var(--ui-text-muted)] text-xs font-medium">No team members yet. Invite your first colleague!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {teamMembers.map(member => (
              <div key={member.id} className="group p-4 rounded-xl bg-[var(--ui-bg-card)] border border-[var(--ui-border)] hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/5 transition-all flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--ui-bg-input)] flex items-center justify-center text-orange-500 font-bold text-lg group-hover:bg-orange-500 group-hover:text-white transition-all">
                  {member.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--ui-text-primary)] truncate">{member.name || "Unnamed User"}</div>
                  <div className="text-xs text-[var(--ui-text-muted)] truncate">{member.email || member.whatsapp}</div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase ${
                  // Highlight invalid role combinations in development
                  process.env.NODE_ENV === 'development' && (
                    (company?.type === 'buyer' && !['buyer', 'manager', 'finance'].includes(member.role)) ||
                    (company?.type === 'vendor' && !['admin', 'manager', 'finance'].includes(member.role))
                  ) ? 'bg-red-500/20 text-red-600 border border-red-500/30' : 'bg-orange-500/10 text-orange-500'
                }`}>
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
