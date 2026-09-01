import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import {
  QrCode,
  Download,
  ExternalLink,
  RefreshCw,
  Share2,
  Building2,
  Eye,
  CheckCircle,
  XCircle,
  Pencil,
  Phone,
  MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const QrCodesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // QR Preview Modal
  const [previewOrg, setPreviewOrg] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Edit Organization Contact Modal
  const [editOrg, setEditOrg] = useState(null);
  const [editForm, setEditForm] = useState({
    phone: '',
    whatsapp: '',
    displayTitle: '',
    branch: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchQrList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/organizations', {
        params: {
          page,
          search: search || undefined,
          limit: 10,
        },
      });
      if (res.data.success) {
        setData(res.data.data.organizations);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load QR code registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrList();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchQrList();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenPreview = async (org) => {
    setPreviewOrg(org);
    setPreviewLoading(true);
    try {
      const res = await api.get(`/admin/organizations/${org._id}/qr`);
      if (res.data.success) {
        setPreviewData(res.data.data);
      }
    } catch (err) {
      toast.error('Could not load QR code details');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenEdit = (org) => {
    setEditOrg(org);
    setEditForm({
      phone: org.phone || '',
      whatsapp: org.whatsapp || '',
      displayTitle: org.displayTitle || org.name || '',
      branch: org.branch || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editOrg) return;

    setSavingEdit(true);
    try {
      const res = await api.patch(`/admin/organizations/${editOrg._id}`, {
        phone: editForm.phone.trim(),
        whatsapp: editForm.whatsapp.trim(),
        displayTitle: editForm.displayTitle.trim(),
        branch: editForm.branch.trim(),
      });

      if (res.data.success) {
        toast.success('Organization phone and contact info updated!');
        setEditOrg(null);
        fetchQrList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update contact info');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRegenerate = async (orgId) => {
    if (!window.confirm('Regenerating will revoke the current QR Code immediately. Continue?')) {
      return;
    }
    try {
      const res = await api.post(`/admin/organizations/${orgId}/qr/regenerate`);
      if (res.data.success) {
        toast.success('QR Code regenerated');
        setPreviewData(res.data.data);
        fetchQrList();
      }
    } catch (err) {
      toast.error('Failed to regenerate QR code');
    }
  };

  const columns = [
    {
      header: 'Institution',
      render: (org) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2C3925] text-white flex items-center justify-center font-bold text-xs">
            {org.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-[#2F2E2D]">
              <Link to={`/admin/organizations/${org._id}`} className="hover:text-[#0086FF]">
                {org.displayTitle || org.name}
              </Link>
            </p>
            <p className="text-[11px] text-[#5A5856] flex items-center gap-2">
              <span>{org.organizationType}</span>
              {org.phone && (
                <span className="text-slate-400 font-mono text-[10px]">
                  • {org.phone}
                </span>
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Phone',
      render: (org) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-[#2F2E2D] flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#2C3925]" />
            {org.phone || <span className="text-slate-400 font-normal">No phone</span>}
          </p>
          {org.whatsapp && (
            <p className="text-[10px] text-emerald-700 flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-emerald-600" />
              {org.whatsapp}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'QR Token Ref',
      render: (org) => (
        <span className="font-mono text-xs text-[#0086FF] font-semibold bg-blue-50 px-2 py-0.5 rounded">
          {org.activeQrId?.publicToken || 'TOKEN-GEN'}
        </span>
      ),
    },
    {
      header: 'Service Status',
      render: (org) => <StatusBadge status={org.subscriptionStatus || org.status} />,
    },
    {
      header: 'Quick Actions',
      align: 'right',
      render: (org) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(org)}
            title="Edit Contact Number & Details"
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-[#0086FF] hover:text-white transition-colors text-[#0086FF] inline-flex items-center gap-1 text-xs font-semibold px-2.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => handleOpenPreview(org)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#2C3925] hover:text-white transition-colors text-slate-600 inline-flex items-center gap-1 text-xs font-semibold px-2.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Poster
          </button>
          <a
            href={`/api/admin/organizations/${org._id}/qr/download`}
            download
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 inline-flex items-center gap-1 text-xs font-semibold px-2.5"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </a>
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
            Institutional QR Code Registry
          </h1>
          <p className="text-xs text-[#5A5856]">
            Preview posters, download high-res vectors and print-ready PDFs, or regenerate secure tokens.
          </p>
        </div>
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
        searchPlaceholder="Search by organization name..."
        emptyTitle="No QR codes found"
        emptyDescription="Organizations will automatically receive a QR code upon creation."
      />

      {/* Poster Preview Modal */}
      <Modal
        isOpen={!!previewOrg}
        onClose={() => {
          setPreviewOrg(null);
          setPreviewData(null);
        }}
        title={`QR Poster: ${previewOrg?.displayTitle || previewOrg?.name}`}
      >
        {previewOrg && (
          <div className="space-y-5">
            {/* Poster Card */}
            <div className="border-2 border-[#2C3925] rounded-3xl p-6 sm:p-7 bg-white text-center space-y-4 shadow-sm max-w-sm mx-auto">
              {/* 1. Logo at the very top */}
              <div className="pt-1">
                {previewOrg.logo ? (
                  <img
                    src={previewOrg.logo}
                    alt={previewOrg.name}
                    className="h-16 max-w-[160px] mx-auto object-contain p-1.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#2C3925] text-white flex items-center justify-center font-extrabold text-xl mx-auto shadow-sm">
                    {(previewOrg.displayTitle || previewOrg.name)?.charAt(0)}
                  </div>
                )}
              </div>

              {/* 2. Organization Name */}
              <div className="space-y-1 px-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#2C3925] uppercase tracking-tight">
                  {previewOrg.displayTitle || previewOrg.name}
                </h3>

                {/* 3. Location / Branch / Address */}
                {(previewOrg.branch || previewOrg.address) && (
                  <p className="text-xs font-semibold text-[#0086FF]">
                    {[previewOrg.branch, previewOrg.address].filter(Boolean).join('  •  ')}
                  </p>
                )}
              </div>

              <div className="pt-1 pb-0.5">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-[#5A5856] uppercase tracking-wider">
                  CABASHO & TALO — COMPLAINT & FEEDBACK
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
                {previewData?.dataUrl ? (
                  <img
                    src={previewData.dataUrl}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
                    {previewLoading ? 'Loading QR...' : 'No QR available'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-extrabold text-[#2C3925] uppercase tracking-wide">
                  KUSKANKEE QR-KA
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed px-2">
                  Scan with phone camera to send anonymous feedback directly to administration.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`/api/admin/organizations/${previewOrg._id}/qr/download`}
                download
                className="py-2.5 rounded-xl bg-[#2C3925] text-white text-xs font-bold hover:bg-[#212B1C] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4 text-[#0086FF]" />
                Print PDF Poster
              </a>

              {previewData?.dataUrl && (
                <a
                  href={previewData.dataUrl}
                  download={`QR-${previewOrg.name.replace(/\s+/g, '_')}.png`}
                  className="py-2.5 rounded-xl bg-white border border-slate-200 text-[#2F2E2D] text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Save PNG
                </a>
              )}
            </div>

            {previewData?.publicUrl && (
              <div className="pt-2 text-center">
                <a
                  href={previewData.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#0086FF] hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Test Customer Mobile Landing Page
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => handleRegenerate(previewOrg._id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate Token
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewOrg(null);
                  setPreviewData(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Organization Contact Modal */}
      <Modal
        isOpen={!!editOrg}
        onClose={() => setEditOrg(null)}
        title={`Edit Contact: ${editOrg?.displayTitle || editOrg?.name}`}
      >
        {editOrg && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              Waxaad halkan ka beddeli kartaa taleefanka xarunta (SMS Alert & Customer Contact Phone), WhatsApp number-ka, iyo magaca ka muuqda QR Poster-ka.
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official Phone Number (Telefoonka Xarunta) *
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="e.g. +252 61 700 1122"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-semibold"
              />
              <p className="text-[10px] text-[#5A5856] mt-1">
                Telefoonkan waxaa lagu helayaa SMS alerts marka cabasho cusub soo dhacdo.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official WhatsApp Number (WhatsApp-ka Xarunta)
              </label>
              <input
                type="tel"
                value={editForm.whatsapp}
                onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                placeholder="e.g. +252 61 700 1122"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  Display Title on Poster (Magaca Poster-ka)
                </label>
                <input
                  type="text"
                  value={editForm.displayTitle}
                  onChange={(e) => setEditForm({ ...editForm, displayTitle: e.target.value })}
                  placeholder="e.g. Isbitaalka Guud"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  Branch / Location
                </label>
                <input
                  type="text"
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  placeholder="e.g. Main Branch"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditOrg(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-5 py-2.5 rounded-xl bg-[#0086FF] hover:bg-[#006ed6] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {savingEdit ? 'Saving Changes...' : 'Save & Update Phone'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
