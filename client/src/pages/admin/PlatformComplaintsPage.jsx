import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  Phone,
  User,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const PlatformComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });

      const res = await api.get(`/platform-complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.data);
        setMeta(res.data.meta);
      }
    } catch {
      toast.error('Failed to load platform complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleOpenDetails = (comp) => {
    setSelectedComplaint(comp);
    setNewStatus(comp.status);
    setAdminNotes(comp.adminNotes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/platform-complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
        adminNotes,
      });
      if (res.data.success) {
        toast.success('Platform complaint status updated!');
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" /> New
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 w-fit">
            Closed
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D] flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-600" />
            Platform Complaints
          </h1>
          <p className="text-xs text-[#5A5856]">
            Dedicated complaints submitted by users regarding the Compliance QR Platform.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, customer, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-[#2F2E2D] outline-none focus:bg-white focus:ring-2 focus:ring-[#2C3925]/20 focus:border-[#2C3925] transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-[#5A5856] font-semibold w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none text-xs font-bold text-[#2C3925] outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Loading platform complaints..." />
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <p className="text-sm font-extrabold text-[#2F2E2D]">No Platform Complaints Found</p>
            <p className="text-xs text-[#5A5856] max-w-sm mx-auto">
              No platform-level complaints match your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[11px] font-extrabold text-[#5A5856] uppercase border-b border-slate-100 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ref Code</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Message</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#2C3925]">
                      {item.referenceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#2F2E2D]">{item.customerName || 'Anonymous'}</div>
                      {item.customerPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">+{item.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {item.message}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(item)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-[#2C3925] hover:text-white text-slate-600 transition-colors inline-flex items-center gap-1 font-bold text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#5A5856]">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} records)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details & Status Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#0086FF] uppercase">
                  {selectedComplaint.referenceNumber}
                </span>
                <h3 className="text-base font-extrabold text-[#2F2E2D]">
                  Platform Complaint Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Customer:</span>
                  <span className="font-bold text-[#2F2E2D] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {selectedComplaint.customerName || 'Anonymous'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone:</span>
                  <span className="font-bold text-[#2F2E2D] flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedComplaint.customerPhone ? `+${selectedComplaint.customerPhone}` : 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Category:</span>
                  <span className="font-bold text-[#2F2E2D]">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Submitted:</span>
                  <span className="font-bold text-[#2F2E2D] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#2F2E2D] block mb-1">Complaint Message:</span>
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed border border-slate-200/60">
                  {selectedComplaint.message}
                </div>
              </div>

              {selectedComplaint.suggestedSolution && (
                <div>
                  <span className="font-bold text-[#2F2E2D] block mb-1">Suggested Solution:</span>
                  <div className="p-3 bg-emerald-50/60 rounded-2xl text-emerald-900 leading-relaxed border border-emerald-100">
                    {selectedComplaint.suggestedSolution}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="pt-2 space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Change Status:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#2C3925] outline-none"
                  >
                    <option value="NEW">New</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Internal Admin Notes:</label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add resolution notes or comments..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                disabled={updating}
                onClick={handleUpdateStatus}
                className="flex-1 py-2.5 bg-[#2C3925] hover:bg-[#212B1C] text-white rounded-xl font-bold text-xs shadow-sm"
              >
                {updating ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
