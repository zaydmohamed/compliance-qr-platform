import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import {
  ShieldAlert,
  User,
  Activity,
  Calendar,
  Eye,
  FileCode,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AuditLogsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  // Log Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs', {
        params: {
          page,
          action: actionFilter || undefined,
          limit: 15,
        },
      });
      if (res.data.success) {
        setData(res.data.data.logs);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter]);

  const columns = [
    {
      header: 'Action',
      accessor: 'action',
      render: (log) => (
        <span className="font-mono text-xs font-bold text-[#2C3925] bg-slate-100 px-2.5 py-1 rounded-lg">
          {log.action}
        </span>
      ),
    },
    {
      header: 'Actor',
      render: (log) => (
        <div className="text-xs">
          <p className="font-bold text-[#2F2E2D]">{log.actorName || 'System'}</p>
          <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.2 bg-slate-100 rounded">
            {log.actorRole || 'SYSTEM'}
          </span>
        </div>
      ),
    },
    {
      header: 'Resource',
      render: (log) => (
        <div className="text-xs">
          <p className="font-medium text-[#2F2E2D]">{log.resourceType}</p>
          <p className="text-[10px] font-mono text-slate-400">ID: {log.resourceId?.slice(-8) || '—'}</p>
        </div>
      ),
    },
    {
      header: 'IP Address',
      render: (log) => (
        <span className="font-mono text-xs text-slate-500">{log.ipAddress || '127.0.0.1'}</span>
      ),
    },
    {
      header: 'Timestamp',
      render: (log) => (
        <span className="text-[11px] text-[#5A5856]">
          {new Date(log.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Metadata',
      align: 'right',
      render: (log) => (
        <button
          onClick={() => setSelectedLog(log)}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#2C3925] hover:text-white transition-colors text-slate-600 inline-flex items-center gap-1 text-xs font-semibold px-2"
        >
          <Eye className="w-3.5 h-3.5" />
          JSON
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            System Audit & Security Logs
          </h1>
          <p className="text-xs text-[#5A5856]">
            Immutable chronological record of administrative interventions, payment entries, and status changes.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          '',
          'ORGANIZATION_CREATED',
          'ORGANIZATION_UPDATED',
          'ORGANIZATION_USER_CREATED',
          'PAYMENT_RECORDED',
          'RENEWAL_APPROVED',
          'SUBMISSION_STATUS_UPDATED',
        ].map((act) => (
          <button
            key={act}
            onClick={() => {
              setActionFilter(act);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              actionFilter === act
                ? 'bg-[#2C3925] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-[#5A5856] hover:bg-slate-50'
            }`}
          >
            {act === '' ? 'All Actions' : act.replace(/_/g, ' ')}
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
        emptyTitle="No audit logs found"
        emptyDescription="System actions will be recorded here automatically."
      />

      {/* Detail JSON Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Event Metadata"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Action:</span>
                <p className="font-bold text-[#2F2E2D]">{selectedLog.action}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Actor:</span>
                <p className="font-bold text-[#2F2E2D]">{selectedLog.actorName}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Timestamp:</span>
                <p className="font-medium text-[#2F2E2D]">{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Resource:</span>
                <p className="font-mono text-xs">{selectedLog.resourceType} ({selectedLog.resourceId})</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2F2E2D] mb-1 block">
                Full Event Payload (JSON)
              </label>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
