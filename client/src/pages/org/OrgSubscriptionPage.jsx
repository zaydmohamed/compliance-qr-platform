import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import {
  Calendar,
  Clock,
  CalendarClock,
  CreditCard,
  Send,
  CheckCircle,
  History,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrgSubscriptionPage = () => {
  const [overview, setOverview] = useState(null);
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Renewal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renewalNotes, setRenewalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSubscriptionDetails = async () => {
    try {
      const [ovRes, renRes] = await Promise.all([
        api.get('/organization/overview'),
        api.get('/organization/renewal-requests'),
      ]);

      if (ovRes.data.success) setOverview(ovRes.data.data);
      if (renRes.data.success) setRenewals(renRes.data.data.requests);
    } catch (err) {
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const handleRequestRenewal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/organization/renewal-requests', {
        notes: renewalNotes,
      });
      if (res.data.success) {
        toast.success('Renewal request sent to Platform Administration!');
        setIsModalOpen(false);
        setRenewalNotes('');
        fetchSubscriptionDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit renewal request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Checking subscription period..." />;
  }

  const { stats, organization } = overview || {};
  const sub = stats?.subscription || {};
  const daysLeft = sub.daysRemaining || 0;
  const isExpiring = daysLeft <= 3 && daysLeft > 0;
  const isExpired = daysLeft <= 0 || sub.status === 'EXPIRED';

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            Service Subscription & 30-Day Lifecycle
          </h1>
          <p className="text-xs text-[#5A5856]">
            Inspect your active service timeframe and submit renewal requests for administrative approval.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold shadow-md transition-all"
        >
          <CalendarClock className="w-4 h-4" />
          Request Service Renewal
        </button>
      </div>

      {/* Main Status Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Institutional Status
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-[#2F2E2D]">
                {organization?.displayTitle || organization?.name}
              </h2>
              <StatusBadge status={sub.status || 'ACTIVE'} />
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-medium">Service Days Remaining</span>
            <p
              className={`text-3xl font-black ${
                isExpired ? 'text-rose-600' : isExpiring ? 'text-amber-600' : 'text-emerald-700'
              }`}
            >
              {isExpired ? '0 Days' : `${daysLeft} Day${daysLeft > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Date Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Service Cycle Start
            </span>
            <p className="text-sm font-extrabold text-[#2F2E2D]">
              {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'Active'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Service Cycle End
            </span>
            <p className="text-sm font-extrabold text-[#2F2E2D]">
              {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Active'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              QR Public Scan Status
            </span>
            <p
              className={`text-sm font-extrabold ${
                sub.isServiceActive ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {sub.isServiceActive ? 'Live & Accepting Feedback' : 'Disabled (Requires Renewal)'}
            </p>
          </div>
        </div>
      </div>

      {/* Renewal Request History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <History className="w-4 h-4 text-[#2C3925]" />
          <h3 className="text-sm font-extrabold text-[#2F2E2D]">
            Service Renewal Request History
          </h3>
        </div>

        {renewals.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No previous renewal requests found for your organization.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {renewals.map((r) => (
              <div
                key={r._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-slate-400 font-medium">
                      Submitted on {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.notes && (
                    <p className="text-[#5A5856] mt-1 italic">"{r.notes}"</p>
                  )}
                  {r.rejectionReason && (
                    <p className="text-rose-600 mt-1 font-semibold">
                      Reason for rejection: {r.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  {r.reviewedAt && (
                    <span>Reviewed: {new Date(r.reviewedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Renewal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit 30-Day Renewal Request"
      >
        <form onSubmit={handleRequestRenewal} className="space-y-4">
          <p className="text-xs text-[#5A5856]">
            Notify the Platform Administrator to extend your service period. Please include any transaction reference numbers or payment details for faster verification.
          </p>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Payment Reference / Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Paid via EVC Plus TXN-94829182 / Cash payment reference"
              value={renewalNotes}
              onChange={(e) => setRenewalNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#0086FF] text-white text-xs font-bold hover:bg-[#006ED6] flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Send Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
