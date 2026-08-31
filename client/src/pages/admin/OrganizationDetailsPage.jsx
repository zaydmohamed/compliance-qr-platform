import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Calendar,
  CreditCard,
  RefreshCw,
  Download,
  Share2,
  ExternalLink,
  Edit,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowLeft,
  CheckCircle,
  FileText,
  Trash2,
  AlertTriangle,
  KeyRound,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrganizationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [user, setUser] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Organization Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    displayTitle: '',
    organizationType: '',
    phone: '',
    email: '',
    whatsapp: '',
    address: '',
    branch: '',
    description: '',
    status: 'ACTIVE',
  });

  // User Edit Form State
  const [userEditForm, setUserEditForm] = useState({
    fullName: '',
    username: '',
    phone: '',
    status: 'ACTIVE',
  });
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newTempPassResult, setNewTempPassResult] = useState(null);

  // Manual payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 50,
    paymentMethod: 'EVC_PLUS',
    transactionReference: '',
    periodDays: 30,
    notes: 'Platform Admin manual service extension',
  });

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/organizations/${id}`);
      if (res.data.success) {
        const organizationData = res.data.data.organization;
        const userData = res.data.data.user;
        setOrg(organizationData);
        setUser(userData);

        setEditForm({
          name: organizationData.name || '',
          displayTitle: organizationData.displayTitle || '',
          organizationType: organizationData.organizationType || 'Company',
          phone: organizationData.phone || '',
          email: organizationData.email || '',
          whatsapp: organizationData.whatsapp || '',
          address: organizationData.address || '',
          branch: organizationData.branch || '',
          description: organizationData.description || '',
          status: organizationData.status || 'ACTIVE',
        });

        if (userData) {
          setUserEditForm({
            fullName: userData.fullName || '',
            username: userData.username || '',
            phone: userData.phone || '',
            status: userData.status || 'ACTIVE',
          });
        }
      }

      // Fetch QR details
      try {
        const qrRes = await api.get(`/admin/organizations/${id}/qr`);
        if (qrRes.data.success) {
          setQrData(qrRes.data.data);
        }
      } catch {
        // QR might not exist yet
      }
    } catch (err) {
      toast.error('Failed to load organization details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationDetails();
  }, [id]);

  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/admin/organizations/${id}`, editForm);
      if (res.data.success) {
        toast.success('Organization details updated successfully!');
        setIsEditOpen(false);
        fetchOrganizationDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update organization');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      const res = await api.patch(`/admin/organization-users/${user._id}`, userEditForm);
      if (res.data.success) {
        toast.success('Organization Representative User updated successfully!');
        setIsEditUserOpen(false);
        fetchOrganizationDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleResetUserPassword = async () => {
    if (!user?._id) return;
    if (!window.confirm(`Reset password for representative user "${user.username}"?`)) return;
    try {
      setResettingPassword(true);
      const res = await api.post(`/admin/organization-users/${user._id}/reset-password`);
      if (res.data.success) {
        setNewTempPassResult(res.data.data.temporaryPassword);
        toast.success('Temporary password generated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset user password');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleRegenerateQr = async () => {
    if (!window.confirm('Are you sure you want to regenerate this QR Code? The previous QR code will immediately be invalidated.')) {
      return;
    }
    try {
      setIsRegenerating(true);
      const res = await api.post(`/admin/organizations/${id}/qr/regenerate`);
      if (res.data.success) {
        setQrData(res.data.data);
        toast.success('QR Code regenerated successfully');
      }
    } catch (err) {
      toast.error('Failed to regenerate QR code');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/payments', {
        organizationId: id,
        ...paymentForm,
      });
      if (res.data.success) {
        toast.success('Payment recorded and 30-day service period extended!');
        setIsPayModalOpen(false);
        fetchOrganizationDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      const res = await api.post(`/admin/organizations/${id}/qr/send-whatsapp`);
      if (res.data.success) {
        toast.success('QR link dispatched via WhatsApp');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send WhatsApp message');
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/organizations/${id}`);
      if (res.data.success) {
        toast.success('Organization deleted successfully');
        setIsDeleteOpen(false);
        navigate('/admin/organizations');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete organization');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading institution profile..." />;
  }

  if (!org) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-500 font-medium">Organization not found</p>
        <Link
          to="/admin/organizations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2C3925] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Organizations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/organizations"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A5856] hover:text-[#2C3925] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Institutions
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D] flex items-center gap-3">
            {org.name}
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                org.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {org.status}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" /> Edit All Org Profile Fields
          </button>

          <button
            onClick={() => setIsPayModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4 text-[#0086FF]" /> Record Payment / Extend
          </button>

          <button
            onClick={() => setIsDeleteOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-rose-200"
          >
            <Trash2 className="w-4 h-4" /> Delete Org
          </button>
        </div>
      </div>

      {/* Main 2-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & User Account */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="w-12 h-12 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#2C3925] text-white flex items-center justify-center font-extrabold text-lg">
                    {org.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-base text-[#2F2E2D]">
                    {org.displayTitle || org.name}
                  </h3>
                  <p className="text-xs text-[#5A5856]">
                    Category: <span className="font-bold text-[#0086FF]">{org.organizationType}</span> • Branch: {org.branch}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditOpen(true)}
                className="text-xs font-bold text-[#0086FF] hover:underline flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0086FF]" /> Registered Official Email
                </p>
                <p className="font-extrabold text-[#2F2E2D] truncate">
                  {org.email || 'Not specified'}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0086FF]" /> Primary Phone Number
                </p>
                <p className="font-extrabold text-[#2F2E2D]">
                  {org.phone || 'Not specified'}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Support Number
                </p>
                <p className="font-extrabold text-[#2F2E2D]">
                  {org.whatsapp || org.phone || 'Not specified'}
                </p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Physical Address
                </p>
                <p className="font-semibold text-[#2F2E2D]">
                  {org.address || 'Mogadishu, Somalia'}
                </p>
              </div>
            </div>

            {/* Service & Subscription Status Bar */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Active Service Period & Subscription Status
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                    org.isServiceActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {org.subscriptionStatus || (org.isServiceActive ? 'ACTIVE' : 'EXPIRED')}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {org.daysRemaining ?? 30} Days Service Remaining
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsPayModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold shadow-sm transition-all"
              >
                + Add Days / Record Payment
              </button>
            </div>
          </div>

          {/* Linked Manager Account Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
                <User className="w-4 h-4 text-[#2C3925]" />
                Representative Portal User Account
              </h3>
              {user && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditUserOpen(true)}
                    className="text-xs font-bold text-[#0086FF] hover:underline flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Representative User
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-medium">Full Name</p>
                    <p className="font-bold text-[#2F2E2D]">{user.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-medium">Username (Login ID)</p>
                    <p className="font-mono font-bold text-[#0086FF]">@{user.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-medium">Contact Phone</p>
                    <p className="font-medium text-[#2F2E2D]">{user.phone || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-medium">Account Status</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {user.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResetUserPassword}
                    disabled={resettingPassword}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-all flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {resettingPassword ? 'Resetting...' : 'Reset User Password'}
                  </button>

                  {newTempPassResult && (
                    <div className="text-xs bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
                      New Temporary Password: <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">{newTempPassResult}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No representative user assigned yet.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Branded QR Poster Preview & Downloads */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#2C3925]" />
                Branded QR Poster
              </h3>
              {qrData?.qr?.status && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {qrData.qr.status}
                </span>
              )}
            </div>

            {/* Poster Card Container */}
            <div className="border-2 border-[#2C3925] rounded-2xl p-5 bg-white text-center space-y-3 shadow-sm">
              {org.logo ? (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="h-10 mx-auto object-contain"
                />
              ) : (
                <h4 className="text-sm font-black text-[#2C3925] tracking-tight uppercase">
                  {org.displayTitle || org.name}
                </h4>
              )}

              <p className="text-[10px] font-bold text-[#5A5856] uppercase tracking-wider">
                CABASHO & TALO — COMPLAINT & FEEDBACK
              </p>

              {/* QR Code Image */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl inline-block shadow-inner">
                {qrData?.dataUrl ? (
                  <img
                    src={qrData.dataUrl}
                    alt="QR Code"
                    className="w-44 h-44 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="text-[11px] font-extrabold text-[#2C3925]">
                KUSKANKEE QR-KA
              </div>
              <p className="text-[10px] text-slate-500">
                Scan with phone camera to send anonymous feedback directly to administration.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <a
                href={`/api/admin/organizations/${id}/qr/download`}
                download
                className="w-full py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-[#0086FF]" />
                Download Print-Ready PDF
              </a>

              {qrData?.dataUrl && (
                <a
                  href={qrData.dataUrl}
                  download={`QR-${org.name.replace(/\s+/g, '_')}.png`}
                  className="w-full py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#2F2E2D] text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Download PNG
                </a>
              )}

              {qrData?.publicUrl && (
                <a
                  href={qrData.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0086FF] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Public Customer Portal
                </a>
              )}

              {org.whatsapp && (
                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dispatch via WhatsApp
                </button>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleRegenerateQr}
                  disabled={isRegenerating}
                  className="w-full py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Regenerate Secure QR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT ORGANIZATION PROFILE MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Full Organization Profile & Settings"
      >
        <form onSubmit={handleUpdateOrg} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Official Legal Name *
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Display Title (Shown on QR and Customer Page)
            </label>
            <input
              type="text"
              value={editForm.displayTitle}
              onChange={(e) => setEditForm({ ...editForm, displayTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Official Registered Email Address *
            </label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              placeholder="info@institution.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">Used for OTP password reset and official security alerts.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Sector / Type
              </label>
              <select
                value={editForm.organizationType}
                onChange={(e) =>
                  setEditForm({ ...editForm, organizationType: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] font-bold focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              >
                <option value="Hospital">Hospital</option>
                <option value="Hotel">Hotel</option>
                <option value="Company">Company</option>
                <option value="University">University</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Organization Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] font-bold focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Primary Phone
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/[^0-9+\s-]/g, '') })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                WhatsApp Phone
              </label>
              <input
                type="text"
                value={editForm.whatsapp}
                onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value.replace(/[^0-9+\s-]/g, '') })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Branch / Unit Name
            </label>
            <input
              type="text"
              value={editForm.branch}
              onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Physical Address
            </label>
            <textarea
              rows={2}
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0086FF] text-white text-xs font-bold hover:bg-[#006ED6] transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save Organization Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT LINKED USER MODAL */}
      <Modal
        isOpen={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        title="Edit Representative User Account"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Representative Full Name *
            </label>
            <input
              type="text"
              required
              value={userEditForm.fullName}
              onChange={(e) => setUserEditForm({ ...userEditForm, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Username (Login ID) *
              </label>
              <input
                type="text"
                required
                value={userEditForm.username}
                onChange={(e) => setUserEditForm({ ...userEditForm, username: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={userEditForm.phone}
                onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value.replace(/[^0-9+\s-]/g, '') })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              User Status
            </label>
            <select
              value={userEditForm.status}
              onChange={(e) => setUserEditForm({ ...userEditForm, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] font-bold focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditUserOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0086FF] text-white text-xs font-bold hover:bg-[#006ED6] transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save User Details
            </button>
          </div>
        </form>
      </Modal>

      {/* Manual Payment / Service Extension Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Record Manual Payment & Extend Service"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            Recording this manual payment will instantly extend <strong>{org.name}</strong>'s active service period by <strong>{paymentForm.periodDays} days</strong> and activate the QR code.
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-bold"
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
                value={paymentForm.periodDays}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, periodDays: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Payment Gateway / Method
            </label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-semibold"
            >
              <option value="EVC_PLUS">EVC Plus (Hormuud)</option>
              <option value="ZAAD">ZAAD (Telesom)</option>
              <option value="SAHAL">Sahal (Golis)</option>
              <option value="EDAHAB">eDahab (Somtel)</option>
              <option value="CASH">Cash / Physical Slip</option>
              <option value="BANK_TRANSFER">Bank Transfer (Premier, IBS, etc.)</option>
              <option value="OTHER">Other Provider</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Transaction Reference / Slip #
            </label>
            <input
              type="text"
              placeholder="e.g. TXN-893847291 / Receipt #0482"
              value={paymentForm.transactionReference}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, transactionReference: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-mono"
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
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0086FF] text-white text-xs font-bold hover:bg-[#006ED6] transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Extend Service
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!isDeleting) setIsDeleteOpen(false);
        }}
        title="Delete Organization"
        subtitle="This permanent action will remove all linked data."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Are you sure you want to delete this organization?</p>
              <p className="opacity-90 leading-relaxed">
                Deleting <span className="font-semibold">{org.name}</span> will permanently remove its portal logins, active QR codes, feedback submissions, payments, and subscription records.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            {org.logo ? (
              <img
                src={org.logo}
                alt=""
                className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-1"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#2C3925] text-white flex items-center justify-center font-bold text-sm">
                {org.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-xs text-[#2F2E2D]">{org.name}</p>
              <p className="text-[11px] text-[#5A5856]">
                {org.organizationType} • {org.phone || 'No phone'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsDeleteOpen(false)}
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
      </Modal>
    </div>
  );
};
