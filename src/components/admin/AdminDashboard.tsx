import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  LogOut,
  Sparkles,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Languages,
  ArrowRight,
  RefreshCw,
  Building,
} from 'lucide-react';
import { OnboardingRecord, SubscriptionDetails, SubscriptionPlan, SubscriptionStatus } from '../../types/business';
import { getAllMSMEOrganizations, updateMSMEAccountStatus } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EditSubscriptionModal } from './EditSubscriptionModal';
import { MSMESnapshotModal } from './MSMESnapshotModal';

interface AdminDashboardProps {
  onSwitchToUserWorkspace?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSwitchToUserWorkspace }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals state
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<OnboardingRecord | null>(null);
  const [selectedRecordForSnapshot, setSelectedRecordForSnapshot] = useState<OnboardingRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMSMEOrganizations();
      setRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch MSME records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecords();
  }, []);

  // Filtered MSME list
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const org = rec.organization;
      const busName = org.businessProfile?.businessName || org.name || '';
      const ownerName = rec.user?.name || '';
      const email = rec.ownerEmail || rec.user?.email || '';

      const matchesSearch =
        busName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const currentPlan = org.subscription?.plan || 'pending';
      const isPending = org.accessStatus === 'pending_payment' || org.subscription?.status === 'pending' || org.registrationStatus === 'pending_payment';
      const currentStatus = org.accountStatus === 'suspended' ? 'suspended' : isPending ? 'pending' : (org.subscription?.status || 'active');

      const matchesPlan = filterPlan === 'all' || currentPlan === filterPlan;
      const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus || (filterStatus === 'pending' && isPending);

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [records, searchQuery, filterPlan, filterStatus]);

  // High-level KPI Stats
  const stats = useMemo(() => {
    const total = records.length;
    let active = 0;
    let pendingPayment = 0;
    let expiringSoon = 0;
    let suspended = 0;

    const now = Date.now();
    const thirtyDays = 30 * 86400000;

    records.forEach((r) => {
      const org = r.organization;
      if (org.accountStatus === 'suspended' || org.subscription?.status === 'suspended') {
        suspended++;
        return;
      }

      const isPending = org.accessStatus === 'pending_payment' || org.subscription?.status === 'pending' || org.registrationStatus === 'pending_payment';
      if (isPending) {
        pendingPayment++;
        return;
      }

      const status = org.subscription?.status;
      if (status === 'active' || status === 'trial') {
        active++;
      }

      if (org.subscription?.expiryDate) {
        const expiryTime = new Date(org.subscription.expiryDate).getTime();
        if (expiryTime > now && expiryTime - now <= thirtyDays) {
          expiringSoon++;
        }
      }
    });

    return { total, active, pendingPayment, expiringSoon, suspended };
  }, [records]);

  // Handle Quick Account Status Toggle (Active <-> Suspended)
  const handleToggleAccountStatus = async (record: OnboardingRecord) => {
    const currentStatus = record.organization.accountStatus || 'active';
    const nextStatus: 'active' | 'suspended' = currentStatus === 'active' ? 'suspended' : 'active';

    try {
      await updateMSMEAccountStatus(record.organization.id, nextStatus);
      setRecords((prev) =>
        prev.map((r) =>
          r.organization.id === record.organization.id
            ? {
                ...r,
                organization: {
                  ...r.organization,
                  accountStatus: nextStatus,
                },
              }
            : r
        )
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update account status');
    }
  };

  const handleSubscriptionSaved = (updatedSubscription: SubscriptionDetails) => {
    if (!selectedRecordForEdit) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.organization.id === selectedRecordForEdit.organization.id
          ? {
              ...r,
              organization: {
                ...r.organization,
                subscription: updatedSubscription,
                accountStatus: updatedSubscription.status === 'suspended' ? 'suspended' : 'active',
              },
            }
          : r
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col font-sans">
      
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#222936] bg-[#0B0E14]/90 backdrop-blur-xl shadow-2xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 min-h-16 py-2 sm:py-0 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-extrabold text-[#F8FAFC] flex items-center gap-1.5 sm:gap-2 truncate">
                BizPilot <span className="text-violet-400">AI</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-violet-950/60 text-violet-300 border border-violet-800/50 shrink-0">
                  {t('admin.adminBadge', 'SUPER ADMIN')}
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#707A8C] -mt-0.5 truncate hidden xs:block">
                {t('admin.adminPortal', 'Platform Management Console')}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#121722] hover:bg-[#161C27] text-[#F8FAFC] border border-[#222936] transition-all shadow-sm"
              title={t('header.changeLanguage', 'Change Language')}
            >
              <Languages className="w-3.5 h-3.5 text-violet-400" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Switch to User Workspace Preview */}
            {onSwitchToUserWorkspace && (
              <button
                onClick={onSwitchToUserWorkspace}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#121722] hover:bg-[#161C27] border border-[#222936] text-xs font-semibold text-violet-300 shadow-sm transition-all"
              >
                <Building className="w-3.5 h-3.5" />
                <span>{t('admin.switchToUserView', 'Preview MSME Workspace')}</span>
              </button>
            )}

            {/* Admin User Pill & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#222936]">
              <div className="text-right hidden lg:block">
                <div className="text-xs font-semibold text-[#F8FAFC]">{user?.displayName || 'Administrator'}</div>
                <div className="text-[10px] text-[#707A8C]">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#121722] hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/40 border border-[#222936] text-xs font-semibold text-[#A7B0C0] shadow-sm transition-all"
                title={t('auth.logout', 'Log Out')}
              >
                <LogOut className="w-3.5 h-3.5 text-[#707A8C]" />
                <span className="hidden sm:inline">{t('auth.logout', 'Log Out')}</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 min-w-0">
        
        {/* Page Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#F8FAFC] tracking-tight">
              {t('admin.manageMsmes', 'Manage MSMEs & Subscriptions')}
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B0C0] mt-1">
              {t('admin.dashboardSubtitle', 'Monitor registered MSMEs, track subscription expiries, and manage account statuses.')}
            </p>
          </div>

          <button
            onClick={fetchRecords}
            disabled={loading}
            className="self-stretch sm:self-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#121722] hover:bg-[#161C27] text-[#F8FAFC] border border-[#222936] text-xs font-semibold shadow-sm transition-all hover:border-violet-500/50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-violet-400' : 'text-[#707A8C]'}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 min-w-0">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] shadow-sm hover:border-[#303848] transition-all min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A7B0C0]">{t('admin.totalMsmes', 'Total MSMEs')}</span>
              <div className="p-2 rounded-lg bg-violet-950/40 text-violet-400 border border-violet-800/40 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC] mt-2 sm:mt-3">{stats.total}</div>
            <div className="text-[11px] text-[#707A8C] mt-1">Platform Accounts</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] shadow-sm hover:border-[#303848] transition-all min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A7B0C0]">{t('admin.activeSubscriptions', 'Active Subscriptions')}</span>
              <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 sm:mt-3">{stats.active}</div>
            <div className="text-[11px] text-[#707A8C] mt-1">Trial &amp; Paid Plans</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] shadow-sm hover:border-[#303848] transition-all min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A7B0C0]">{t('admin.pendingPayment', 'Pending Payment')}</span>
              <div className="p-2 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/40 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 sm:mt-3">{stats.pendingPayment}</div>
            <div className="text-[11px] text-[#707A8C] mt-1">Awaiting Checkout</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] shadow-sm hover:border-[#303848] transition-all min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A7B0C0]">{t('admin.expiringSoon', 'Expiring Soon (30d)')}</span>
              <div className="p-2 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/40 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 sm:mt-3">{stats.expiringSoon}</div>
            <div className="text-[11px] text-[#707A8C] mt-1">Needs Extension or Renewal</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#222936] shadow-sm hover:border-[#303848] transition-all min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A7B0C0]">{t('admin.suspendedAccounts', 'Suspended Accounts')}</span>
              <div className="p-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/40 shrink-0">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2 sm:mt-3">{stats.suspended}</div>
            <div className="text-[11px] text-[#707A8C] mt-1">Access Restricted</div>
          </div>

        </div>

        {/* Search & Filters */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121722] border border-[#222936] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707A8C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.searchPlaceholder', 'Search by business name, owner or email...')}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] placeholder-[#707A8C] text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap min-w-0">
            <div className="hidden xs:flex items-center gap-1.5 text-xs text-[#707A8C] font-medium">
              <Filter className="w-3.5 h-3.5" />
            </div>

            {/* Plan Filter */}
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs focus:outline-none focus:border-violet-500"
            >
              <option value="all" className="bg-[#0D1118] text-[#F8FAFC]">{t('admin.allPlans', 'All Plans')}</option>
              <option value="starter" className="bg-[#0D1118] text-[#F8FAFC]">Starter (₹1)</option>
              <option value="professional" className="bg-[#0D1118] text-[#F8FAFC]">Professional (₹2)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#0D1118] border border-[#222936] text-[#F8FAFC] text-xs focus:outline-none focus:border-violet-500"
            >
              <option value="all" className="bg-[#0D1118] text-[#F8FAFC]">{t('admin.allStatuses', 'All Statuses')}</option>
              <option value="active" className="bg-[#0D1118] text-[#F8FAFC]">{t('admin.active', 'Active')}</option>
              <option value="pending" className="bg-[#0D1118] text-[#F8FAFC]">{t('admin.pending', 'Pending Payment')}</option>
              <option value="trial" className="bg-[#0D1118] text-[#F8FAFC]">{t('admin.trial', 'Trial')}</option>
              <option value="expired" className="bg-[#0D1118] text-[#F8FAFC]">{t('admin.expired', 'Expired')}</option>
              <option value="suspended" className="bg-[#0D1118] text-[#F8FAFC]">{t('admin.suspended', 'Suspended')}</option>
            </select>
          </div>

        </div>

        {/* MSME Table */}
        <div className="rounded-2xl border border-[#222936] bg-[#121722] shadow-sm overflow-hidden min-w-0">
          
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[640px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#222936] bg-[#0F1219] text-[#707A8C] uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">{t('admin.businessName', 'Business Name')}</th>
                  <th className="py-3.5 px-4">{t('admin.owner', 'Owner')}</th>
                  <th className="py-3.5 px-4">{t('admin.plan', 'Plan')}</th>
                  <th className="py-3.5 px-4">{t('admin.status', 'Status')}</th>
                  <th className="py-3.5 px-4">{t('admin.expiryDate', 'Expiry Date')}</th>
                  <th className="py-3.5 px-4 text-right">{t('admin.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222936]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#707A8C]">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
                          <span>Loading registered MSMEs...</span>
                        </div>
                      ) : (
                        <span>{t('admin.noMsmesFound', 'No MSMEs matching the current search or filters.')}</span>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const org = rec.organization;
                    const sub = org.subscription;
                    const isSuspended = org.accountStatus === 'suspended' || sub?.status === 'suspended';
                    const isPending = org.accessStatus === 'pending_payment' || sub?.status === 'pending' || org.registrationStatus === 'pending_payment';

                    // Compute relative days left
                    let expiryBadge = null;
                    if (sub?.expiryDate) {
                      const diffMs = new Date(sub.expiryDate).getTime() - Date.now();
                      const days = Math.ceil(diffMs / 86400000);

                      if (days < 0) {
                        expiryBadge = (
                          <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {t('admin.expiredAgo', 'Expired')} ({Math.abs(days)}d ago)
                          </span>
                        );
                      } else if (days <= 7) {
                        expiryBadge = (
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {days} {t('admin.daysLeft', 'days left')}
                          </span>
                        );
                      } else {
                        expiryBadge = (
                          <span className="text-[10px] text-[#707A8C]">
                            {days} {t('admin.daysLeft', 'days left')}
                          </span>
                        );
                      }
                    }

                    return (
                      <tr key={org.id} className="hover:bg-[#161C27] transition-colors">
                        
                        {/* Business Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#F8FAFC] text-xs">
                            {org.businessProfile.businessName || org.name}
                          </div>
                          <div className="text-[10px] text-[#707A8C]">
                            {org.businessProfile.industry || 'Enterprise'} • {org.businessProfile.location || 'India'}
                          </div>
                        </td>

                        {/* Owner Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#F8FAFC]">
                            {rec.user?.name || 'Owner'}
                          </div>
                          <div className="text-[10px] text-violet-400 truncate max-w-[150px]" title={rec.ownerEmail}>
                            {rec.ownerEmail || rec.user?.email || '—'}
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-950/50 text-violet-300 border border-violet-800/50">
                            {sub?.plan ? sub.plan.replace('_', ' ') : 'NO PLAN'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/50 text-rose-400 border border-rose-800/50">
                              <XCircle className="w-3 h-3" /> {t('admin.suspended', 'Suspended')}
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/50 text-amber-400 border border-amber-800/50">
                              <Clock className="w-3 h-3" /> {t('admin.pending', 'Pending Payment')}
                            </span>
                          ) : sub?.status === 'trial' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-950/50 text-teal-400 border border-teal-800/50">
                              <Sparkles className="w-3 h-3" /> {t('admin.trial', 'Trial')}
                            </span>
                          ) : sub?.status === 'expired' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/50 text-amber-400 border border-amber-800/50">
                              <AlertTriangle className="w-3 h-3" /> {t('admin.expired', 'Expired')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" /> {t('admin.active', 'Active')}
                            </span>
                          )}
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3.5 px-4">
                          <div className="text-[#F8FAFC] text-xs font-mono">
                            {sub?.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : '—'}
                          </div>
                          {expiryBadge}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Snapshot */}
                            <button
                              onClick={() => setSelectedRecordForSnapshot(rec)}
                              className="p-1.5 rounded-lg bg-[#0F1219] hover:bg-[#161C27] text-teal-400 border border-[#222936] transition-colors"
                              title={t('admin.viewSnapshot', 'View Snapshot')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Subscription */}
                            <button
                              onClick={() => setSelectedRecordForEdit(rec)}
                              className="p-1.5 rounded-lg bg-[#0F1219] hover:bg-[#161C27] text-violet-400 border border-[#222936] transition-colors"
                              title={t('admin.editSubscription', 'Edit Subscription')}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Suspend/Activate */}
                            <button
                              onClick={() => handleToggleAccountStatus(rec)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isSuspended
                                  ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border-emerald-800/40'
                                  : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40'
                              }`}
                              title={isSuspended ? t('admin.activateAccount', 'Activate Account') : t('admin.suspendAccount', 'Suspend Account')}
                            >
                              {isSuspended ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* Edit Subscription Modal */}
      {selectedRecordForEdit && (
        <EditSubscriptionModal
          isOpen={!!selectedRecordForEdit}
          onClose={() => setSelectedRecordForEdit(null)}
          record={selectedRecordForEdit}
          onSave={handleSubscriptionSaved}
        />
      )}

      {/* MSME Snapshot Modal */}
      {selectedRecordForSnapshot && (
        <MSMESnapshotModal
          isOpen={!!selectedRecordForSnapshot}
          onClose={() => setSelectedRecordForSnapshot(null)}
          record={selectedRecordForSnapshot}
        />
      )}

    </div>
  );
};
