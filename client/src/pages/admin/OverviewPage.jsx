import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { StatsCard } from '../../components/StatsCard';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Building2,
  AlertCircle,
  MessageSquareShare,
  CalendarClock,
  CreditCard,
  QrCode,
  Clock,
  ArrowRight,
  PlusCircle,
  Phone,
} from 'lucide-react';

export const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/reports/overview');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load overview stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading platform overview..." />;
  }

  const { organizations, complaints, feedback, renewals, totalRevenue, urgentExpiringList } = stats || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner with Quick Action */}
      <div className="bg-[#2C3925] text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
            Platform Master Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Oversight & QR Operations
          </h1>
          <p className="text-xs text-emerald-100/70 max-w-xl">
            Monitor real-time customer submissions, manage 30-day service lifecycles, and approve renewal requests across all registered entities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/organizations/create"
            className="px-5 py-3 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Organization
          </Link>
          <Link
            to="/admin/renewals"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2"
          >
            <CalendarClock className="w-4 h-4 text-amber-300" />
            Pending Renewals ({renewals?.pending || 0})
          </Link>
        </div>
      </div>

      {/* Row 1: Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Organizations"
          value={organizations?.total || 0}
          subtitle={`${organizations?.active || 0} active • ${organizations?.expiring || 0} expiring`}
          icon={Building2}
          color="primary"
        />
        <StatsCard
          title="Complaints (Cabasho)"
          value={complaints?.total || 0}
          subtitle={`${complaints?.new || 0} new • ${complaints?.inProgress || 0} in progress`}
          icon={AlertCircle}
          color="rose"
        />
        <StatsCard
          title="Feedback (Talo)"
          value={feedback?.total || 0}
          subtitle="Citizen ideas & suggestions"
          icon={MessageSquareShare}
          color="accent"
        />
        <StatsCard
          title="Manual Payments"
          value={`$${(totalRevenue || 0).toLocaleString()}`}
          subtitle={`${renewals?.approved || 0} renewals approved`}
          icon={CreditCard}
          color="emerald"
        />
      </div>

      {/* Row 2: Urgent Expiring List & Complaints Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Expiring List (Smallest remaining time first) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-[#2F2E2D]">
                Urgent Expiring & Expired Subscriptions
              </h3>
            </div>
            <Link
              to="/admin/renewals"
              className="text-xs font-bold text-[#0086FF] hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-[#5A5856]">
            Sorted by shortest remaining service time. Organizations with 3 or fewer days remaining require manual renewal approval.
          </p>

          {urgentExpiringList?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No organizations currently expiring or expired.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {urgentExpiringList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#2F2E2D]">
                        {item.displayTitle || item.name}
                      </p>
                      <p className="text-[11px] text-[#5A5856] flex items-center gap-2">
                        {item.phone && <span>{item.phone}</span>}
                        <span>• Ends: {new Date(item.endDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                        item.daysRemaining <= 1
                          ? 'bg-rose-100 text-rose-700 font-bold animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.daysRemaining <= 0
                        ? 'Expired'
                        : `${item.daysRemaining} Day${item.daysRemaining > 1 ? 's' : ''} Left`}
                    </span>
                    <Link
                      to={`/admin/organizations/${item.id}`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#2C3925] hover:text-white transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaints Breakdown Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
          <h3 className="text-base font-bold text-[#2F2E2D] pb-3 border-b border-slate-100">
            Complaints Status Distribution
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <span className="font-bold text-[#0086FF]">New Submissions</span>
              <span className="text-base font-extrabold text-[#0086FF]">
                {complaints?.new || 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
              <span className="font-bold text-amber-700">In Progress</span>
              <span className="text-base font-extrabold text-amber-800">
                {complaints?.inProgress || 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
              <span className="font-bold text-emerald-700">Resolved Grievances</span>
              <span className="text-base font-extrabold text-emerald-800">
                {complaints?.resolved || 0}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/complaints"
              className="w-full py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              Open Complaints Center
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
