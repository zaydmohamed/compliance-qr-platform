import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { StatsCard } from '../../components/StatsCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  BarChart3,
  Download,
  AlertCircle,
  MessageSquareShare,
  CheckCircle,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrgReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/organization/overview');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load analytical summary');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportCsv = () => {
    window.open('/api/organization/export/csv', '_blank');
    toast.success('Downloading your submissions CSV...');
  };

  if (loading) {
    return <LoadingSpinner message="Calculating grievance breakdown..." />;
  }

  const { stats, organization } = data || {};
  const complaints = stats?.complaints || {};
  const feedback = stats?.feedback || {};
  const categories = stats?.categories || [];
  const maxCategoryCount = Math.max(...categories.map((c) => c.count), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            Feedback & Complaint Analytics
          </h1>
          <p className="text-xs text-[#5A5856]">
            Visual breakdown of citizen grievance trends and satisfaction categories.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-[#0086FF]" />
          Download Submissions CSV
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Inquiries"
          value={(complaints.total || 0) + (feedback.total || 0)}
          subtitle="Citizen complaints & ideas"
          icon={TrendingUp}
          color="primary"
        />
        <StatsCard
          title="Complaints (Cabasho)"
          value={complaints.total || 0}
          subtitle={`${complaints.new || 0} pending review`}
          icon={AlertCircle}
          color="rose"
        />
        <StatsCard
          title="Citizen Feedback (Talo)"
          value={feedback.total || 0}
          subtitle="Suggestions & recommendations"
          icon={MessageSquareShare}
          color="accent"
        />
        <StatsCard
          title="Resolved Rate"
          value={
            complaints.total > 0
              ? `${Math.round(((complaints.resolved || 0) / complaints.total) * 100)}%`
              : '100%'
          }
          subtitle={`${complaints.resolved || 0} issues resolved`}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Category Breakdown Bar Chart */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#0086FF]" />
            Grievance Distribution by Category
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {categories.length} Categories Recorded
          </span>
        </div>

        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">
            No complaints categorized yet.
          </p>
        ) : (
          <div className="space-y-4">
            {categories.map((cat, idx) => {
              const percentage = Math.round((cat.count / maxCategoryCount) * 100);
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-[#2F2E2D]">
                    <span>{cat.category}</span>
                    <span className="text-rose-600 font-mono">{cat.count} submissions</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
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
    </div>
  );
};
