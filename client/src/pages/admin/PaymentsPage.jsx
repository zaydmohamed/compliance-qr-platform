import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import {
  CreditCard,
  PlusCircle,
  Building2,
  Calendar,
  DollarSign,
  Receipt,
  FileCheck,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [methodFilter, setMethodFilter] = useState('');

  // Record Payment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    organizationId: '',
    amount: 50,
    currency: 'USD',
    paymentMethod: 'EVC_PLUS',
    transactionReference: '',
    periodDays: 30,
    notes: 'Manual renewal record logged by admin',
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments', {
        params: {
          page,
          paymentMethod: methodFilter || undefined,
          limit: 10,
        },
      });
      if (res.data.success) {
        setData(res.data.data.payments);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, methodFilter]);

  const handleOpenModal = async () => {
    try {
      const res = await api.get('/admin/organizations', { params: { limit: 100 } });
      if (res.data.success) {
        setOrganizations(res.data.data.organizations);
        if (res.data.data.organizations.length > 0) {
          setPaymentForm((prev) => ({
            ...prev,
            organizationId: res.data.data.organizations[0]._id,
          }));
        }
      }
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load institutions list');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.organizationId) {
      toast.error('Please select an organization');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/admin/payments', paymentForm);
      if (res.data.success) {
        toast.success('Manual payment recorded & service period extended!');
        setIsModalOpen(false);
        fetchPayments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Receipt / Ref #',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#0086FF]">
            {p.transactionReference || `TX-${p._id.slice(-6).toUpperCase()}`}
          </span>
          <p className="text-[10px] text-slate-400">ID: {p._id.slice(-8)}</p>
        </div>
      ),
    },
    {
      header: 'Organization',
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2C3925] text-white flex items-center justify-center font-bold text-[11px]">
            {p.organizationId?.name?.charAt(0) || 'O'}
          </div>
          <div>
            <p className="font-bold text-xs text-[#2F2E2D]">
              {p.organizationId?.displayTitle || p.organizationId?.name}
            </p>
            <p className="text-[11px] text-[#5A5856]">{p.organizationId?.phone || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      render: (p) => (
        <span className="font-mono font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
          ${p.amount?.toFixed(2)} {p.currency || 'USD'}
        </span>
      ),
    },
    {
      header: 'Payment Method',
      render: (p) => (
        <span className="text-[11px] font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100">
          {p.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Extension',
      render: (p) => (
        <span className="text-xs font-semibold text-[#2F2E2D]">
          +{p.periodDays || 30} Days
        </span>
      ),
    },
    {
      header: 'Recorded Date',
      render: (p) => (
        <div className="text-[11px] text-[#5A5856]">
          <p>{new Date(p.createdAt).toLocaleDateString()}</p>
          <p className="text-[10px] text-slate-400">By: {p.recordedBy?.fullName || 'Admin'}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      align: 'right',
      render: (p) => <StatusBadge status={p.status || 'COMPLETED'} />,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            Manual Payment & Subscription Ledger
          </h1>
          <p className="text-xs text-[#5A5856]">
            Auditable record of all institution payments, wire deposits, and service extensions.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#0086FF]" />
          Record Manual Payment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['', 'EVC_PLUS', 'ZAAD', 'SAHAL', 'CASH', 'BANK_TRANSFER'].map((m) => (
          <button
            key={m}
            onClick={() => {
              setMethodFilter(m);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              methodFilter === m
                ? 'bg-[#2C3925] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-[#5A5856] hover:bg-slate-50'
            }`}
          >
            {m === '' ? 'All Methods' : m.replace('_', ' ')}
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
        emptyTitle="No payment records found"
        emptyDescription="Manual payments recorded for organizations will appear here."
      />

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Manual Payment"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Select Organization
            </label>
            <select
              required
              value={paymentForm.organizationId}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, organizationId: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            >
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.displayTitle || org.name} ({org.organizationType})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Service Extension (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                required
                value={paymentForm.periodDays}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, periodDays: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Payment Method
            </label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })
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
              Transaction Reference / Slip #
            </label>
            <input
              type="text"
              placeholder="e.g. TXN-8930193 / Receipt #88"
              value={paymentForm.transactionReference}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, transactionReference: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Notes
            </label>
            <input
              type="text"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#2C3925] text-white text-xs font-bold hover:bg-[#212B1C] transition-colors flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4 text-[#0086FF]" />
              Save & Apply Extension
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
