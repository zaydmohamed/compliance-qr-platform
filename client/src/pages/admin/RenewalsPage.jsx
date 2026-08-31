import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Building2,
  CreditCard,
  Clock,
  Check,
  X,
  Phone,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RenewalsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Approve Modal state
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveForm, setApproveForm] = useState({
    amount: 50,
    paymentMethod: 'EVC_PLUS',
    transactionReference: '',
    periodDays: 30,
    notes: 'Approved renewal request from organization',
  });
  const [approving, setApproving] = useState(false);

  // Reject Modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/renewal-requests', {
        params: {
          page,
          status: statusFilter || undefined,
          limit: 10,
        },
      });
      if (res.data.success) {
        setData(res.data.data.requests);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load renewal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, [page, statusFilter]);

  const handleOpenApprove = (req) => {
    setApproveTarget(req);
    setApproveForm({
      amount: 50,
      paymentMethod: 'EVC_PLUS',
      transactionReference: '',
      periodDays: 30,
      notes: `Approved renewal for ${req.organizationId?.displayTitle || req.organizationId?.name}`,
    });
  };

  const handleConfirmApprove = async (e) => {
    e.preventDefault();
    if (!approveTarget) return;
    setApproving(true);
    try {
      const res = await api.post(`/admin/renewal-requests/${approveTarget._id}/approve`, approveForm);
      if (res.data.success) {
        toast.success('Renewal approved! Payment recorded and 30-day service cycle started.');
        setApproveTarget(null);
        fetchRenewals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve renewal');
    } finally {
      setApproving(false);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }
    setRejecting(true);
    try {
      const res = await api.post(`/admin/renewal-requests/${rejectTarget._id}/reject`, {
        rejectionReason,
      });
      if (res.data.success) {
        toast.success('Renewal request rejected');
        setRejectTarget(null);
        setRejectionReason('');
        fetchRenewals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject renewal request');
    } finally {
      setRejecting(false);
    }
  };

  const columns = [
    {
      header: 'Organization',
      render: (req) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2C3925] text-white flex items-center justify-center font-bold text-xs">
            {req.organizationId?.name?.charAt(0) || 'O'}
          </div>
          <div>
            <p className="font-bold text-[#2F2E2D]">
              {req.organizationId?.displayTitle || req.organizationId?.name}
            </p>
            <p className="text-[11px] text-[#5A5856]">{req.organizationId?.phone || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Requested By',
      render: (req) => (
        <div className="text-xs">
          <p className="font-bold text-[#2F2E2D]">{req.requestedBy?.fullName || 'Org User'}</p>
          <p className="text-slate-400 font-mono text-[11px]">@{req.requestedBy?.username}</p>
        </div>
      ),
    },
    {
      header: 'Org Notes',
      render: (req) => (
        <p className="text-xs text-[#5A5856] max-w-xs line-clamp-2">
          {req.notes || <em className="text-slate-400">No notes provided</em>}
        </p>
      ),
    },
    {
      header: 'Requested Date',
      render: (req) => (
        <span className="text-[11px] text-[#5A5856]">
          {new Date(req.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (req) => <StatusBadge status={req.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (req) => (
        <div className="flex items-center justify-end gap-2">
          {req.status === 'PENDING' ? (
            <>
              <button
                onClick={() => handleOpenApprove(req)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => setRejectTarget(req)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 font-semibold">
              {req.status === 'APPROVED' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            Service Renewal Requests
          </h1>
          <p className="text-xs text-[#5A5856]">
            Review, verify manual payments, and approve 30-day extension requests submitted by institutions.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === st
                ? 'bg-[#2C3925] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-[#5A5856] hover:bg-slate-50'
            }`}
          >
            {st === '' ? 'All Requests' : st}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No renewal requests found"
        emptyDescription="Organizations approaching their 30-day expiration will request renewals here."
      />

      {/* Approve Modal with Payment Details Input */}
      <Modal
        isOpen={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title="Approve Service Renewal & Record Payment"
      >
        {approveTarget && (
          <form onSubmit={handleConfirmApprove} className="space-y-4">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
              <p className="font-bold">
                Approving renewal for: {approveTarget.organizationId?.displayTitle || approveTarget.organizationId?.name}
              </p>
              <p className="text-[11px] opacity-80">
                Approving this request will automatically record a manual payment ledger entry and add <strong>{approveForm.periodDays} days</strong> to the organization's service cycle.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  Payment Amount (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={approveForm.amount}
                  onChange={(e) =>
                    setApproveForm({ ...approveForm, amount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  Extension Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={approveForm.periodDays}
                  onChange={(e) =>
                    setApproveForm({ ...approveForm, periodDays: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Payment Channel
              </label>
              <select
                value={approveForm.paymentMethod}
                onChange={(e) =>
                  setApproveForm({ ...approveForm, paymentMethod: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              >
                <option value="EVC_PLUS">EVC Plus (Hormuud)</option>
                <option value="ZAAD">ZAAD (Telesom)</option>
                <option value="SAHAL">Sahal (Golis)</option>
                <option value="CASH">Cash Deposit</option>
                <option value="BANK_TRANSFER">Bank Wire / Premier / IBS</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Transaction Reference / Receipt #
              </label>
              <input
                type="text"
                placeholder="e.g. TXN-94829103"
                value={approveForm.transactionReference}
                onChange={(e) =>
                  setApproveForm({ ...approveForm, transactionReference: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Admin Notes
              </label>
              <input
                type="text"
                value={approveForm.notes}
                onChange={(e) => setApproveForm({ ...approveForm, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={approving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Start 30 Days
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject Renewal Request"
      >
        {rejectTarget && (
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <p className="text-xs text-[#5A5856]">
              Please state why this renewal request is being rejected. The organization will be notified.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Payment receipt could not be verified / Incomplete information"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rejecting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
