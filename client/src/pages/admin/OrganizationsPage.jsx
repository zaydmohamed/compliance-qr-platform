import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import {
  Building2,
  PlusCircle,
  Eye,
  QrCode,
  CheckCircle,
  XCircle,
  Phone,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrganizationsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/organizations', {
        params: {
          page,
          search: search || undefined,
          type: categoryFilter || undefined,
          status: statusFilter || undefined,
          limit: 10,
        },
      });
      if (res.data.success) {
        setData(res.data.data.organizations);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const isMountedRef = React.useRef(false);

  useEffect(() => {
    fetchOrganizations();
  }, [page, categoryFilter, statusFilter]);

  // Debounced search (only when search actually changes after initial mount)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrganizations();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async (org) => {
    const newStatus = org.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.patch(`/admin/organizations/${org._id}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(`Organization status changed to ${newStatus}`);
        fetchOrganizations();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteOrganization = async () => {
    if (!orgToDelete) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/organizations/${orgToDelete._id}`);
      if (res.data.success) {
        toast.success('Organization deleted successfully');
        setDeleteModalOpen(false);
        setOrgToDelete(null);
        fetchOrganizations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete organization');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Organization',
      render: (org) => (
        <div className="flex items-center gap-3">
          {org.logo ? (
            <img
              src={org.logo}
              alt=""
              className="w-9 h-9 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-[#2C3925] text-white flex items-center justify-center font-bold text-xs">
              {org.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-[#2F2E2D] hover:text-[#0086FF] transition-colors">
              <Link to={`/admin/organizations/${org._id}`}>
                {org.displayTitle || org.name}
              </Link>
            </p>
            <p className="text-[11px] text-[#5A5856]">{org.branch || 'Main Center'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category / Sector',
      accessor: 'organizationType',
      render: (org) => (
        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
          {org.organizationType}
        </span>
      ),
    },
    {
      header: 'Contact Details',
      render: (org) => (
        <div className="text-[11px] space-y-0.5">
          <p className="text-[#2F2E2D] font-medium">{org.phone || '—'}</p>
          <p className="text-[#5A5856]">{org.email || ''}</p>
        </div>
      ),
    },
    {
      header: 'Subscription Status',
      render: (org) => (
        <div>
          <StatusBadge status={org.subscriptionStatus || org.status} />
          <p className="text-[10px] text-[#5A5856] mt-1 font-medium">
            {org.daysRemaining > 0
              ? `${org.daysRemaining} days remaining`
              : 'Service Expired'}
          </p>
        </div>
      ),
    },
    {
      header: 'QR Link',
      render: (org) =>
        org.activeQrId ? (
          <Link
            to={`/admin/qr-center?org=${org._id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0086FF] hover:underline"
          >
            <QrCode className="w-3.5 h-3.5" />
            Manage QR
          </Link>
        ) : (
          <span className="text-[11px] text-slate-400">No QR</span>
        ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (org) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/admin/organizations/${org._id}`}
            title="View Details"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#2C3925] hover:text-white transition-colors text-slate-600"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleToggleStatus(org)}
            title={org.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            className={`p-1.5 rounded-lg transition-colors ${
              org.status === 'ACTIVE'
                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            {org.status === 'ACTIVE' ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => {
              setOrgToDelete(org);
              setDeleteModalOpen(true);
            }}
            title="Delete Organization"
            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
            Organization Management
          </h1>
          <p className="text-xs text-[#5A5856]">
            Manage verified institutions, review active QR posters, and inspect service periods.
          </p>
        </div>
        <Link
          to="/admin/organizations/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#0086FF]" />
          Create Organization Wizard
        </Link>
      </div>

      {/* Filter Component */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
        >
          <option value="">All Categories</option>
          <option value="HOTEL">Hotel</option>
          <option value="UNIVERSITY">University</option>
          <option value="COMPANY">Company</option>
          <option value="HOSPITAL">Hospital</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
          <option value="EXPIRED">Expired</option>
          <option value="INACTIVE">Inactive</option>
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
        searchPlaceholder="Search organizations by name, title, or phone..."
        emptyTitle="No organizations found"
        emptyDescription="Get started by registering an institution with the wizard."
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setOrgToDelete(null);
          }
        }}
        title="Delete Organization"
        subtitle="This permanent action will remove all linked data."
      >
        {orgToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Are you sure you want to delete this organization?</p>
                <p className="opacity-90 leading-relaxed">
                  Deleting <span className="font-semibold">{orgToDelete.name}</span> will permanently wipe its linked logins, active QR codes, feedback submissions, payments, and subscription histories.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              {orgToDelete.logo ? (
                <img
                  src={orgToDelete.logo}
                  alt=""
                  className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-1"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#2C3925] text-white flex items-center justify-center font-bold text-sm">
                  {orgToDelete.name?.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-xs text-[#2F2E2D]">{orgToDelete.name}</p>
                <p className="text-[11px] text-[#5A5856]">
                  {orgToDelete.organizationType} • {orgToDelete.phone || 'No phone'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setOrgToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteOrganization}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

