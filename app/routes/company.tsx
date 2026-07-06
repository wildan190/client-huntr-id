import React from "react";
import Layout from "../components/Layout";
import { 
  Building2, MapPin, CreditCard, FileText, Users, Plus, X,
  ChevronLeft, RefreshCw, Loader2, AlertCircle, Camera,
  ShieldCheck, Activity, Award, BarChart3, Download, CheckCircle2
} from "lucide-react";
import { useCompanyViewModel } from "../features/company/hooks/useCompanyViewModel";
import { TeamManagement } from "../features/company/components/TeamManagement";
import { getAssetUrl } from "../lib/assets";

export default function CompanyDetails() {
  const vm = useCompanyViewModel();
  const [profileBannerDismissed, setProfileBannerDismissed] = React.useState(false);

  const statusColor: any = {
    approved: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    rejected: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  const tabs = [
    { id: "profile", label: "Identity", icon: Building2 },
    { id: "location", label: "Location", icon: MapPin },
    { id: "banking", label: "Banking", icon: CreditCard },
    { id: "documents", label: "Legal Docs", icon: ShieldCheck },
    { id: "performance", label: "Performance", icon: Activity },
    { id: "team", label: "Team", icon: Users },
  ];

  // Check for missing fields
  const missingFields = React.useMemo(() => {
    if (!vm.company) return [];
    const fields = [];
    if (!vm.company.logo_path) fields.push("Logo");
    if (!vm.company.address) fields.push("Full Address");
    if (!vm.company.bank_name) fields.push("Bank Details");
    if (!vm.company.documents || vm.company.documents.length === 0) fields.push("Company Documents");
    if (!vm.company.hq_addresses || (Array.isArray(vm.company.hq_addresses) && vm.company.hq_addresses.length === 0)) fields.push("HQ Addresses");
    if (!vm.company.about) fields.push("About the Company");
    return fields;
  }, [vm.company]);

  if (vm.loading) {
    return (
      <Layout title="Company" subtitle="Loading company workspace details...">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 size={32} className="animate-spin text-orange-500" />
          <span className="text-sm text-[var(--ui-text-muted)]">Fetching workspace settings...</span>
        </div>
      </Layout>
    );
  }

  if (!vm.showCompanyWorkspace) {
    return (
      <Layout title="Company" subtitle="Choose a company workspace">
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--ui-text-primary)] m-0">Select Workspace</h2>
              <p className="text-sm text-[var(--ui-text-secondary)] mt-1">Pick the company you want to manage.</p>
            </div>
            <button
              onClick={() => vm.navigate("/onboarding")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--ui-bg-input)] border border-[var(--ui-border)] text-[var(--ui-text-primary)] text-sm font-medium hover:border-orange-500/50 transition-all"
            >
              <Plus size={16} /> Register another company
            </button>
          </div>

          {vm.companyListLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-orange-500" /></div>
          ) : vm.companies.length === 0 ? (
            <div className="text-center py-12 bg-[var(--ui-bg-input)] rounded-xl border border-dashed border-[var(--ui-border)]">
              <p className="text-[var(--ui-text-secondary)] text-sm mb-3">No company workspaces found.</p>
              <button
                onClick={() => vm.navigate("/onboarding")}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-all"
              >
                Register a Company
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vm.companies.map(c => {
                const active = vm.selectedWorkspace?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => vm.openCompanyWorkspace(c)}
                    className={`text-left p-5 rounded-xl border transition-all hover:-translate-y-1 ${
                      active ? "border-orange-500/50 bg-orange-500/5 shadow-md shadow-orange-500/5" : "border-[var(--ui-border)] bg-[var(--ui-bg-card)] hover:border-orange-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--ui-bg-input)] flex items-center justify-center overflow-hidden border border-[var(--ui-border)]">
                        {c.logo_path ? (
                          <img src={getAssetUrl(c.logo_path)} className="w-full h-full object-cover" alt="" />
                        ) : <Building2 size={20} className="text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[var(--ui-text-primary)] truncate m-0">{c.name}</h3>
                        <div className="mt-0.5">
                          <span className="text-[10px] font-medium uppercase text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">{c.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--ui-text-muted)]">Status</span>
                        <span className={`font-medium capitalize ${c.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>{c.status}</span>
                      </div>
                      <div className="text-xs text-[var(--ui-text-muted)] truncate">{c.formatted_tax_id || c.tax_id || "No NPWP registered"}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={vm.company.name} subtitle="Company Workspace Profile">
      <div className="flex flex-col gap-8 w-full">
        {/* Missing Fields Banner */}
        {!profileBannerDismissed && missingFields.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-600 mb-1">Complete Your Profile</h4>
              <p className="text-xs text-[var(--ui-text-primary)] mb-3">Fill in these details to unlock full features:</p>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field) => (
                  <span key={field} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-semibold uppercase">
                    {field}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setProfileBannerDismissed(true)}
              className="p-1.5 rounded-lg hover:bg-amber-500/20 transition-all text-amber-600"
              title="Dismiss profile banner"
              aria-label="Dismiss profile banner"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-xl bg-[var(--ui-bg-input)] flex items-center justify-center overflow-hidden border border-[var(--ui-border)] group-hover:border-orange-500/50 transition-all">
                {vm.company.logo_path ? (
                  <img src={getAssetUrl(vm.company.logo_path)} className="w-full h-full object-cover" alt={vm.company.name} />
                ) : <Building2 size={28} className="text-orange-500" />}
                <button 
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  title="Upload company logo"
                  aria-label="Upload company logo"
                >
                  <Camera className="text-white" size={20} />
                </button>
                <input 
                  id="logo-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) vm.handleLogoUpload(file);
                  }}
                />
              </div>
              {vm.logoUploading && (
                <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={16} />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-[var(--ui-text-primary)] m-0">{vm.company.name}</h2>
              </div>
              <p className="text-xs text-[var(--ui-text-secondary)] mt-1 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1"><Building2 size={12} className="text-orange-500" /> {vm.company.type.toUpperCase()}</span>
                <span className="w-1 h-1 rounded-full bg-[var(--ui-border)] hidden md:block"></span>
                <span>NPWP: <span className="text-[var(--ui-text-primary)] font-medium">{vm.company.formatted_tax_id || vm.company.tax_id || "N/A"}</span></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full border text-xs font-semibold capitalize ${statusColor[vm.company.status] || "text-gray-500 bg-gray-500/10 border-gray-500/20"}`}>
              {vm.company.status}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-6 overflow-x-auto overflow-y-hidden border-b border-[var(--ui-border)] scrollbar-hide">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => vm.setActiveTab(t.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
                  vm.activeTab === t.id 
                    ? "border-orange-500 text-orange-500" 
                    : "border-transparent text-[var(--ui-text-muted)] hover:text-[var(--ui-text-primary)] hover:border-[var(--ui-border)]"
                }`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-[var(--ui-bg-card)] rounded-xl border border-[var(--ui-border)] p-4 md:p-6 min-h-[300px]">
            {vm.updateError && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3">
                <AlertCircle size={16} /> {vm.updateError}
              </div>
            )}

            {vm.activeTab === "profile" && (
              <div className="flex flex-col gap-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border)] overflow-hidden flex items-center justify-center">
                        {vm.company.logo_path ? (
                          <img src={getAssetUrl(vm.company.logo_path)} className="w-full h-full object-cover" alt="" />
                        ) : <Building2 size={24} className="text-[var(--ui-text-muted)]" />}
                      </div>
                      <button 
                        type="button"
                        onClick={() => vm.logoInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow hover:scale-105 transition-all"
                        aria-label="Upload company logo"
                        title="Upload company logo"
                      >
                        <Camera size={14} />
                      </button>
                      <input ref={vm.logoInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && vm.handleLogoUpload(e.target.files[0])} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[var(--ui-text-primary)] m-0">Corporate Logo</h4>
                      <p className="text-xs text-[var(--ui-text-muted)] mt-1">This logo will appear on all your official documents.</p>
                    </div>
                  </div>
                  
                  {!vm.isEditing ? (
                    <button onClick={() => vm.setIsEditing(true)} className="px-4 py-2 rounded-lg bg-orange-500/10 text-orange-500 font-semibold text-sm hover:bg-orange-500 hover:text-white transition-all">Edit Identity</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => vm.setIsEditing(false)} className="px-4 py-2 rounded-lg bg-[var(--ui-bg-input)] text-[var(--ui-text-secondary)] font-medium text-sm border border-[var(--ui-border)]">Cancel</button>
                      <button onClick={vm.handleSaveCompany} disabled={vm.updatingCompany} className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600">
                        {vm.updatingCompany ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {vm.isEditing ? (
                    <>
                      <EditField label="Company Name" value={vm.editForm.name} onChange={v => vm.setEditForm({...vm.editForm, name: v})} />
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-[var(--ui-text-muted)]">Country</span>
                        <select
                          value={vm.editForm.country}
                          onChange={e => vm.setEditForm({...vm.editForm, country: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none focus:border-orange-500/50 transition-all"
                        >
                          <option value="ID">Indonesia</option>
                          <option value="MY">Malaysia</option>
                          <option value="SG">Singapore</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-[var(--ui-text-muted)]">Industry Type</span>
                        <select
                          value={vm.editForm.industry_type}
                          onChange={e => vm.setEditForm({ ...vm.editForm, industry_type: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all appearance-none"
                        >
                          <option value="">Select Industry...</option>
                          {["Technology", "Manufacturing", "Healthcare", "Retail", "Finance", "Construction", "Logistics", "Agriculture", "Education", "Other"].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <EditField label="Tax ID (NPWP)" value={vm.editForm.tax_id} onChange={v => vm.setEditForm({...vm.editForm, tax_id: v})} />
                      <EditField label="Email" value={vm.editForm.email} onChange={v => vm.setEditForm({...vm.editForm, email: v})} />
                      <EditField label="Phone / WA" value={vm.editForm.phone} onChange={v => vm.setEditForm({...vm.editForm, phone: v})} />
                      <div className="md:col-span-2">
                        <EditField label="About" value={vm.editForm.about} textarea onChange={v => vm.setEditForm({...vm.editForm, about: v})} />
                      </div>
                      <div className="md:col-span-2">
                        <EditField label="Keywords / Tags" value={vm.editForm.keywords} textarea onChange={v => vm.setEditForm({...vm.editForm, keywords: v})} />
                      </div>
                    </>
                  ) : (
                    <>
                      <DisplayField label="Company Name" value={vm.company.name} />
                      <DisplayField label="Industry Type" value={vm.company.industry_type} />
                      <DisplayField label="Tax ID" value={vm.company.formatted_tax_id || vm.company.tax_id} />
                      <DisplayField label="Email Address" value={vm.company.email} />
                      <DisplayField label="Phone Number" value={vm.company.phone} />
                      <DisplayField label="Keywords / Tags" value={Array.isArray(vm.company.keywords) ? vm.company.keywords.join(", ") : vm.company.keywords} />
                      <div className="md:col-span-2">
                        <DisplayField label="Business Biography" value={vm.company.about || "No profile details added yet."} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {vm.activeTab === "location" && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {vm.isEditing ? (
                    <>
                      <EditField label="Province" value={vm.editForm.provincy_country} onChange={v => vm.setEditForm({...vm.editForm, provincy_country: v})} />
                      <EditField label="City" value={vm.editForm.city} onChange={v => vm.setEditForm({...vm.editForm, city: v})} />
                      <EditField label="Zip Code" value={vm.editForm.zip_code} onChange={v => vm.setEditForm({...vm.editForm, zip_code: v})} />
                      <div className="md:col-span-2">
                        <EditField label="Full Address" value={vm.editForm.address} textarea onChange={v => vm.setEditForm({...vm.editForm, address: v})} />
                      </div>
                    </>
                  ) : (
                    <>
                      <DisplayField label="Province / Country" value={vm.company.provincy_country} />
                      <DisplayField label="City" value={vm.company.city} />
                      <DisplayField label="Zip Code" value={vm.company.zip_code} />
                      <div className="md:col-span-2">
                        <DisplayField label="Full Business Address" value={vm.company.address} />
                      </div>
                    </>
                  )}
                </div>

                {/* HQ Addresses */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-[var(--ui-text-primary)] m-0">HQ / Office Addresses</h4>
                      <p className="text-xs text-[var(--ui-text-muted)] mt-1">Manage all your office locations</p>
                    </div>
                    {vm.isEditing && (
                      <button
                        type="button"
                        onClick={vm.addHqAddress}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-semibold hover:bg-orange-500/20 transition-all"
                      >
                        <Plus size={14} /> Add Location
                      </button>
                    )}
                  </div>

                  {vm.isEditing ? (
                    <div className="space-y-3">
                      {vm.editForm.hq_addresses?.map((addr: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <textarea
                            value={addr}
                            onChange={e => vm.updateHqAddress(idx, e.target.value)}
                            placeholder={`HQ Address ${idx + 1}`}
                            rows={2}
                            className="flex-1 px-3 py-2 rounded-lg bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all resize-none"
                          />
                          {vm.editForm.hq_addresses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => vm.removeHqAddress(idx)}
                              title="Remove location"
                              aria-label="Remove location"
                              className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all h-fit"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {!vm.company.hq_addresses || (Array.isArray(vm.company.hq_addresses) && vm.company.hq_addresses.length === 0) ? (
                        <div className="p-6 rounded-xl bg-[var(--ui-bg-input)] border border-dashed border-[var(--ui-border)] text-center">
                          <p className="text-xs text-[var(--ui-text-muted)]">No office locations added yet</p>
                        </div>
                      ) : (
                        (Array.isArray(vm.company.hq_addresses) ? vm.company.hq_addresses : [vm.company.hq_addresses]).map((addr: string, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border)]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin size={14} className="text-orange-500" />
                              <span className="text-[10px] font-semibold uppercase text-[var(--ui-text-muted)]">Location {idx + 1}</span>
                            </div>
                            <p className="text-sm text-[var(--ui-text-primary)]">{addr}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {vm.activeTab === "banking" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                {vm.isEditing ? (
                  <>
                    <EditField label="Bank Name" value={vm.editForm.bank_name} onChange={v => vm.setEditForm({...vm.editForm, bank_name: v})} />
                    <EditField label="Account Number" value={vm.editForm.bank_account} onChange={v => vm.setEditForm({...vm.editForm, bank_account: v})} />
                    <EditField label="Account Holder Name" value={vm.editForm.bank_account_name} onChange={v => vm.setEditForm({...vm.editForm, bank_account_name: v})} />
                  </>
                ) : (
                  <>
                    <DisplayField label="Beneficiary Bank" value={vm.company.bank_name} />
                    <DisplayField label="Account Number" value={vm.company.bank_account} />
                    <DisplayField label="Account Holder" value={vm.company.bank_account_name} />
                  </>
                )}
              </div>
            )}

            {vm.activeTab === "documents" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                      <ShieldCheck size={20} />
                    </div>
                    <h3 className="text-xl font-black text-[var(--ui-text-primary)] m-0">Corporate Documents</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vm.company.documents?.length === 0 ? (
                    <div className="md:col-span-2 text-center py-8 bg-[var(--ui-bg-input)] rounded-xl border border-dashed border-[var(--ui-border)]">
                      <FileText size={32} className="mx-auto text-[var(--ui-text-muted)] opacity-30 mb-2" />
                      <p className="text-[var(--ui-text-muted)] text-sm">No documents uploaded yet.</p>
                    </div>
                  ) : (
                    vm.company.documents?.map((doc: any) => (
                      <div key={doc.id} className="p-4 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border)] flex items-center justify-between group hover:border-orange-500/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--ui-text-primary)]">{doc.type}</div>
                            <div className="text-xs text-[var(--ui-text-muted)] mt-0.5">{doc.name || 'Official Document'}</div>
                          </div>
                        </div>
                        <a 
                          href={getAssetUrl(doc.url || doc.file_path)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-[var(--ui-bg-card)] border border-[var(--ui-border)] flex items-center justify-center text-[var(--ui-text-muted)] hover:text-orange-500 hover:border-orange-500/50 transition-all"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {vm.activeTab === "performance" && (
              <div className="flex flex-col gap-10 animate-in fade-in duration-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                    <Activity size={20} />
                  </div>
                  <h3 className="text-xl font-black text-[var(--ui-text-primary)] m-0">Corporate Performance</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vm.company.type === 'buyer' ? (
                    <>
                      <StatCard icon={FileText} label="Total PR Created" value={vm.company.stats?.total_pr || 0} color="orange" />
                      <StatCard icon={CheckCircle2} label="Approved Requests" value={vm.company.stats?.approved_pr || 0} color="emerald" />
                      <StatCard icon={BarChart3} label="Activity Level" value="Active" color="blue" />
                    </>
                  ) : (
                    <>
                      <StatCard icon={FileText} label="Total Bids" value={vm.company.stats?.total_proposals || 0} color="orange" />
                      <StatCard icon={Award} label="Tenders Won" value={vm.company.stats?.won_proposals || 0} color="emerald" />
                      <StatCard icon={BarChart3} label="Win Rate" value={`${Math.round(((vm.company.stats?.won_proposals || 0) / (vm.company.stats?.total_proposals || 1)) * 100)}%`} color="blue" />
                    </>
                  )}
                </div>

                <div className="p-6 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border)]">
                  <h4 className="text-sm font-semibold text-[var(--ui-text-primary)] mb-2">Summary</h4>
                  <p className="text-sm text-[var(--ui-text-muted)] leading-relaxed">
                    This company has been a member since <span className="text-[var(--ui-text-primary)] font-medium">{new Date(vm.company.created_at).toLocaleDateString()}</span>. 
                    {vm.company.type === 'buyer' 
                      ? ` They have initiated ${vm.company.stats?.total_pr || 0} procurement requests through the platform.`
                      : ` They have participated in ${vm.company.stats?.total_proposals || 0} tenders and successfully secured ${vm.company.stats?.won_proposals || 0} contracts.`
                    }
                  </p>
                </div>
              </div>
            )}

            {vm.activeTab === "team" && (
              <TeamManagement 
                company={vm.company}
                teamMembers={vm.teamMembers}
                teamLoading={vm.teamLoading}
                isInviting={vm.isInviting}
                inviteForm={vm.inviteForm}
                setInviteForm={vm.setInviteForm}
                handleInviteUser={vm.handleInviteUser}
                inviteError={vm.inviteError}
                inviteSuccess={vm.inviteSuccess}
                onRoleChanged={() => vm.fetchTeamMembers && vm.fetchTeamMembers(vm.company?.id)}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DisplayField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-[var(--ui-text-muted)]">{label}</span>
      <div className="text-sm font-medium text-[var(--ui-text-primary)]">{value || "—"}</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  const colors: any = {
    orange: "text-orange-500 bg-orange-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
  };
  return (
    <div className="p-4 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border)] flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-xs font-semibold text-[var(--ui-text-muted)]">{label}</div>
        <div className="text-lg font-bold text-[var(--ui-text-primary)]">{value}</div>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, textarea, type = "text" }: { label: string, value: string, onChange: (v: string) => void, textarea?: boolean, type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-[var(--ui-text-muted)]">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] text-sm focus:border-orange-500/50 outline-none transition-all"
        />
      )}
    </div>
  );
}
