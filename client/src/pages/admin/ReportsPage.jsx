import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { StatsCard } from '../../components/StatsCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  BarChart3,
  Download,
  Building2,
  AlertCircle,
  MessageSquareShare,
  TrendingUp,
  PieChart,
  Calendar,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [anRes, ovRes] = await Promise.all([
          api.get('/admin/reports/analytics'),
          api.get('/admin/reports/overview'),
        ]);

        if (anRes.data.success) setAnalytics(anRes.data.data);
        if (ovRes.data.success) setOverview(ovRes.data.data);
      } catch (err) {
        toast.error('Failed to load analytical reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleExportCsv = () => {
    window.open('/api/admin/reports/export/csv', '_blank');
    toast.success('Downloading Master Submissions CSV...');
  };

  if (loading) {
    return <LoadingSpinner message="Generating analytical intelligence..." />;
  }

  const { organizationsByType = [], complaintsByCategory = [] } = analytics || {};
  const maxCategoryCount = Math.max(...complaintsByCategory.map((c) => c.count), 1);
  const maxOrgTypeCount = Math.max(...organizationsByType.map((o) => o.count), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            Institutional Analytics & Intelligence
          </h1>
          <p className="text-xs text-[#5A5856]">
            Aggregate performance indicators, grievance distributions, and sector adoption rates.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-[#0086FF]" />
          Export Master CSV Dataset
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Submissions"
          value={(overview?.complaints?.total || 0) + (overview?.feedback?.total || 0)}
          subtitle="Grievances & citizen ideas"
          icon={TrendingUp}
          color="primary"
        />
        <StatsCard
          title="Complaints (Cabasho)"
          value={overview?.complaints?.total || 0}
          subtitle={`${overview?.complaints?.resolved || 0} resolved`}
          icon={AlertCircle}
          color="rose"
        />
        <StatsCard
          title="Feedback (Talo)"
          value={overview?.feedback?.total || 0}
          subtitle="Citizen innovation insights"
          icon={MessageSquareShare}
          color="accent"
        />
        <StatsCard
          title="Registered Entities"
          value={overview?.organizations?.total || 0}
          subtitle={`${overview?.organizations?.active || 0} active subscriptions`}
          icon={Building2}
          color="emerald"
        />
      </div>

      {/* Analytics Visual Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints By Category */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Complaints by Category (Cabasho Breakdown)
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {complaintsByCategory.length} Categories
            </span>
          </div>

          {complaintsByCategory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No complaint categories recorded yet.
            </p>
          ) : (
            <div className="space-y-3.5">
              {complaintsByCategory.map((cat, idx) => {
                const percentage = Math.round((cat.count / maxCategoryCount) * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-[#2F2E2D]">
                      <span>{cat.category}</span>
                      <span className="text-rose-600 font-mono">{cat.count} submissions</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Organizations by Sector / Type */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0086FF]" />
              Institutions by Sector (Adoption Rates)
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {organizationsByType.length} Sectors
            </span>
          </div>

          {organizationsByType.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No institutions registered yet.
            </p>
          ) : (
            <div className="space-y-3.5">
              {organizationsByType.map((orgType, idx) => {
                const percentage = Math.round((orgType.count / maxOrgTypeCount) * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-[#2F2E2D]">
                      <span>{orgType.type}</span>
                      <span className="text-[#0086FF] font-mono">{orgType.count} entities</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0086FF] to-[#006ED6] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
