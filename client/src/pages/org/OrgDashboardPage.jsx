import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { StatsCard } from '../../components/StatsCard';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import {
  AlertCircle,
  MessageSquareShare,
  Clock,
  QrCode,
  Download,
  CalendarClock,
  ArrowRight,
  Eye,
  CheckCircle,
  Send,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrgDashboardPage = () => {
  const [data, setData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Renewal Request Modal
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [renewalNotes, setRenewalNotes] = useState('');
  const [submittingRenewal, setSubmittingRenewal] = useState(false);

  // Submission Detail Modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updatingSub, setUpdatingSub] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [ovRes, subRes] = await Promise.all([
        api.get('/organization/overview'),
        api.get('/organization/submissions', { params: { limit: 5 } }),
      ]);

      if (ovRes.data.success) setData(ovRes.data.data);
      if (subRes.data.success) setSubmissions(subRes.data.data.submissions);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRequestRenewal = async (e) => {
    e.preventDefault();
    setSubmittingRenewal(true);
    try {
      const res = await api.post('/organization/renewal-requests', {
        notes: renewalNotes,
      });
      if (res.data.success) {
        toast.success('Renewal request submitted to Platform Admin!');
        setIsRenewalOpen(false);
        setRenewalNotes('');
        fetchDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit renewal request');
    } finally {
      setSubmittingRenewal(false);
    }
  };

  const handleOpenReview = (sub) => {
    setSelectedSub(sub);
    setUpdateStatus(sub.status);
    setUpdateNotes(sub.internalNotes || '');
  };

  const handleSaveSubStatus = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setUpdatingSub(true);
    try {
      const res = await api.patch(`/organization/submissions/${selectedSub._id}/status`, {
        status: updateStatus,
        notes: updateNotes,
      });
      if (res.data.success) {
        toast.success('Submission status updated');
        setSelectedSub(null);
        fetchDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingSub(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading institutional console..." />;
  }

  const { stats, organization } = data || {};
  const subscription = stats?.subscription || {};
  const complaints = stats?.complaints || {};
  const feedback = stats?.feedback || {};

  const daysLeft = subscription.daysRemaining || 0;
  const isExpiring = daysLeft <= 3 && daysLeft > 0;
  const isExpired = daysLeft <= 0 || subscription.status === 'EXPIRED';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 30-Day Subscription Lifecycle Alert Banner */}
      <div
        className={`rounded-3xl p-6 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 ${
          isExpired
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : isExpiring
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-[#2C3925] text-white'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isExpired
                  ? 'bg-rose-600 text-white'
                  : isExpiring
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/20 text-emerald-200'
              }`}
            >
              {subscription.status || 'ACTIVE'}
            </span>
            <span className="text-xs font-medium opacity-80">
              30-Day Service Period
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {isExpired
              ? 'Service Period Expired'
              : `${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Remaining in Current Cycle`}
          </h2>

          <p className="text-xs opacity-85 max-w-xl">
            {subscription.endDate
              ? `Service cycle ends on ${new Date(subscription.endDate).toLocaleDateString()} at ${new Date(
                  subscription.endDate
                ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
              : 'Active institutional license.'}
            {' '}When approaching expiration, submit a renewal request for admin verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsRenewalOpen(true)}
            className={`px-5 py-3 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 ${
              isExpired
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : isExpiring
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#0086FF] hover:bg-[#006ED6] text-white'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            Request Service Renewal
          </button>
          <Link
            to="/organization/qr"
            className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              isExpired || isExpiring
                ? 'bg-white border-slate-200 text-[#2F2E2D] hover:bg-slate-50'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
          >
            <QrCode className="w-4 h-4" />
            View QR Poster
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Complaints (Cabasho)"
          value={complaints.total || 0}
          subtitle={`${complaints.new || 0} new • ${complaints.inProgress || 0} in review`}
          icon={AlertCircle}
          color="rose"
        />
        <StatsCard
          title="Citizen Feedback (Talo)"
          value={feedback.total || 0}
          subtitle="Ideas & suggestions"
          icon={MessageSquareShare}
          color="accent"
        />
        <StatsCard
          title="Resolved Complaints"
          value={complaints.resolved || 0}
          subtitle="Closed grievances"
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          title="Top Complaint Category"
          value={complaints.mostCommonCategory?.category || 'None'}
          subtitle={`${complaints.mostCommonCategory?.count || 0} submissions`}
          icon={Building2}
          color="primary"
        />
      </div>

      {/* Recent Submissions Table & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-[#2F2E2D]">
              Recent Citizen Submissions
            </h3>
            <p className="text-xs text-[#5A5856]">
              Real-time incoming complaints and feedback collected through your QR code.
            </p>
          </div>

          <Link
            to="/organization/submissions"
            className="text-xs font-bold text-[#0086FF] hover:underline flex items-center gap-1"
          >
            View All Submissions
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No citizen submissions received yet. Make sure your branded QR poster is displayed publicly.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase shrink-0 ${
                      sub.type === 'CABASHO'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {sub.type === 'CABASHO' ? 'Cabasho' : 'Talo'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {sub.category || 'General'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#2F2E2D] font-medium mt-1 line-clamp-1">
                      {sub.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusBadge status={sub.status} />
                  <button
                    onClick={() => handleOpenReview(sub)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#2C3925] hover:text-white transition-colors text-slate-600 text-xs font-semibold px-2.5 inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Renewal Request Modal */}
      <Modal
        isOpen={isRenewalOpen}
        onClose={() => setIsRenewalOpen(false)}
        title="Request Service Renewal (30-Day Extension)"
      >
        <form onSubmit={handleRequestRenewal} className="space-y-4">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <p className="font-bold">
              Institutional Subscription Extension
            </p>
            <p className="text-[11px] opacity-85">
              Submit your renewal request. The Platform Administrator will verify your manual payment or invoice details and extend your service period by 30 days.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Payment Reference & Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Paid via EVC Plus TXN-84920482 / Deposited cash to office on 27th"
              value={renewalNotes}
              onChange={(e) => setRenewalNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRenewalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRenewal}
              className="px-5 py-2.5 rounded-xl bg-[#0086FF] text-white text-xs font-bold hover:bg-[#006ED6] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              Submit Renewal Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Submission Modal */}
      <Modal
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title={
          selectedSub?.type === 'CABASHO'
            ? 'Review Complaint (Cabasho)'
            : 'Review Feedback (Talo)'
        }
      >
        {selectedSub && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold ${
                    selectedSub.type === 'CABASHO'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedSub.type === 'CABASHO' ? 'CABASHO' : 'TALO'}
                </span>
                <span className="text-slate-400">
                  {new Date(selectedSub.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400">Category:</span>
                  <p className="font-bold text-[#2F2E2D]">{selectedSub.category || 'General'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Citizen Phone:</span>
                  <p className="font-mono font-bold text-[#2F2E2D]">
                    {selectedSub.customerPhone || 'Anonymous'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2F2E2D] mb-1 block">
                Citizen Message:
              </label>
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] font-medium leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {selectedSub.content}
              </div>
            </div>

            <form onSubmit={handleSaveSubStatus} className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                    Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                    Internal Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Handled by Department Head"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updatingSub}
                  className="px-5 py-2 rounded-xl bg-[#2C3925] text-white text-xs font-bold hover:bg-[#212B1C] flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
