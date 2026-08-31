import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import {
  AlertCircle,
  MessageSquareShare,
  Eye,
  Download,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrgSubmissionsPage = () => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Review Modal state
  const [selectedSub, setSelectedSub] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Auto detect type filter based on URL route (/complaints vs /feedback)
  useEffect(() => {
    if (location.pathname.includes('/complaints')) {
      setTypeFilter('COMPLAINT');
    } else if (location.pathname.includes('/feedback')) {
      setTypeFilter('FEEDBACK');
    } else {
      setTypeFilter('');
    }
  }, [location.pathname]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/organization/submissions', {
        params: {
          page,
          search: search || undefined,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
          limit: 10,
        },
      });
      if (res.data.success) {
        setData(res.data.data.submissions);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, typeFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSubmissions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenDetail = (sub) => {
    setSelectedSub(sub);
    setUpdateStatus(sub.status);
    setUpdateNotes(sub.internalNotes || '');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/organization/submissions/${selectedSub._id}/status`, {
        status: updateStatus,
        notes: updateNotes,
      });
      if (res.data.success) {
        toast.success('Submission status updated successfully');
        setSelectedSub(null);
        fetchSubmissions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/organization/export/csv', '_blank');
    toast.success('Downloading your submissions CSV...');
  };

  const isComplaintsRoute = location.pathname.includes('/complaints');
  const isFeedbackRoute = location.pathname.includes('/feedback');

  const columns = [
    {
      header: 'Type',
      accessor: 'type',
      render: (sub) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
            sub.type === 'COMPLAINT' || sub.type === 'CABASHO'
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          {sub.type === 'COMPLAINT' || sub.type === 'CABASHO' ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <MessageSquareShare className="w-3.5 h-3.5 text-blue-600" />
          )}
          {sub.type === 'COMPLAINT' || sub.type === 'CABASHO' ? 'CABASHO' : 'TALO'}
        </span>
      ),
    },
    {
      header: 'Category & Message',
      render: (sub) => (
        <div className="max-w-md">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {sub.category || 'General'}
          </span>
          <p className="text-xs text-[#2F2E2D] font-medium mt-1 line-clamp-2">
            {sub.content || sub.message}
          </p>
        </div>
      ),
    },
    {
      header: 'Citizen Phone',
      render: (sub) => (
        <span className="text-xs font-mono text-[#2F2E2D]">
          {sub.customerPhone ? sub.customerPhone : <em className="text-slate-400">Anonymous</em>}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (sub) => <StatusBadge status={sub.status} />,
    },
    {
      header: 'Date',
      render: (sub) => (
        <span className="text-[11px] text-[#5A5856]">
          {new Date(sub.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      render: (sub) => (
        <button
          onClick={() => handleOpenDetail(sub)}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#2C3925] hover:text-white transition-colors text-slate-600 inline-flex items-center gap-1 text-xs font-semibold px-2.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Review & Resolve
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D] flex items-center gap-2.5">
            {isComplaintsRoute ? (
              <>
                <AlertCircle className="w-6 h-6 text-rose-600" />
                Cabashooyinka Macaamiisha (Complaints Only)
              </>
            ) : isFeedbackRoute ? (
              <>
                <MessageSquareShare className="w-6 h-6 text-[#0086FF]" />
                Talooyinka Macaamiisha (Feedback & Ideas Only)
              </>
            ) : (
              'Citizen Complaints & Suggestions'
            )}
          </h1>
          <p className="text-xs text-[#5A5856]">
            {isComplaintsRoute
              ? 'Dhammaan cabashooyinka rasmiga ah ee macaamiishu ku soo gudbiyeen QR Code-ka (Cabashooyinka kaliya).'
              : isFeedbackRoute
              ? 'Dhammaan talooyinka iyo fikradaha dhismaha leh ee macaamiishu ku soo gudbiyeen QR Code-ka (Talooyinka kaliya).'
              : 'Review, investigate, and mark progress on citizen feedback collected from your QR codes.'}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#2F2E2D] text-xs font-bold shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {!isComplaintsRoute && !isFeedbackRoute && (
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-semibold"
          >
            <option value="">All Types (Cabasho & Talo)</option>
            <option value="COMPLAINT">Cabasho (Complaint)</option>
            <option value="FEEDBACK">Talo (Feedback / Idea)</option>
          </select>
        )}

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
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
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          isComplaintsRoute
            ? 'Search complaints text or phone...'
            : isFeedbackRoute
            ? 'Search feedback text or phone...'
            : 'Search message text or phone...'
        }
        emptyTitle={
          isComplaintsRoute
            ? 'Wax cabasho ah wali ma soo dhacin (No complaints found)'
            : isFeedbackRoute
            ? 'Wax talo ah wali ma soo dhacin (No feedback found)'
            : 'No submissions found'
        }
        emptyDescription="Submissions scanned and sent by citizens will appear here."
      />

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title={
          selectedSub?.type === 'COMPLAINT' || selectedSub?.type === 'CABASHO'
            ? 'Process Citizen Complaint (Cabasho)'
            : 'Process Citizen Feedback (Talo)'
        }
      >
        {selectedSub && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold ${
                    selectedSub.type === 'COMPLAINT' || selectedSub.type === 'CABASHO'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedSub.type === 'COMPLAINT' || selectedSub.type === 'CABASHO' ? 'CABASHO' : 'TALO'}
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
                    {selectedSub.customerPhone || 'Anonymous (Not provided)'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2F2E2D] mb-1 block">
                Citizen Message Content:
              </label>
              <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] font-medium leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {selectedSub.content || selectedSub.message}
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleStatusUpdate} className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                    Workflow Status
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
                    Internal Resolution Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Investigation completed / Contacted branch manager"
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
                  disabled={updating}
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
