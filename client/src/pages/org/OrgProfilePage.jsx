import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import {
  Building2,
  User,
  Key,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  QrCode,
  Layers,
  Edit,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const OrgProfilePage = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Organization Profile State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submittingOrg, setSubmittingOrg] = useState(false);
  const [orgEditForm, setOrgEditForm] = useState({
    displayTitle: '',
    email: '',
    phone: '',
    whatsapp: '',
    branch: '',
    address: '',
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submittingPass, setSubmittingPass] = useState(false);

  const fetchOrg = async () => {
    try {
      setLoading(true);
      const res = await api.get('/organization/overview');
      if (res.data.success) {
        const organizationData = res.data.data.organization;
        setOrg(organizationData);
        setOrgEditForm({
          displayTitle: organizationData.displayTitle || '',
          email: organizationData.email || '',
          phone: organizationData.phone || '',
          whatsapp: organizationData.whatsapp || '',
          branch: organizationData.branch || '',
          address: organizationData.address || '',
        });
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrg();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmittingOrg(true);
    try {
      const res = await api.patch('/organization/profile', orgEditForm);
      if (res.data.success) {
        toast.success('Organization profile & email updated successfully!');
        setIsEditModalOpen(false);
        fetchOrg();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update organization profile');
    } finally {
      setSubmittingOrg(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSubmittingPass(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data.success) {
        toast.success('Password updated successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSubmittingPass(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading institution profile..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            Institution Profile & Account Security
          </h1>
          <p className="text-xs text-[#5A5856]">
            Review & edit your registered profile, official email, contact details, and manage access password.
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Edit className="w-4 h-4" />
          Edit Profile & Email
        </button>
      </div>

      {/* Organization Official Brand & Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#2C3925] to-[#1E2619] text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Logo display */}
            <div className="relative flex-shrink-0">
              {org?.logo ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 border-2 border-white/20 shadow-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 border-2 border-white/20 text-white flex items-center justify-center font-black text-4xl shadow-xl">
                  {org?.name?.charAt(0) || 'O'}
                </div>
              )}
            </div>

            {/* Main Details */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <span className="px-3 py-1 rounded-full bg-[#0086FF] text-white text-[11px] font-bold uppercase tracking-wider">
                  {org?.organizationType || 'Institution'}
                </span>
                {org?.status && (
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      org.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {org.status}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold text-white">
                {org?.displayTitle || org?.name}
              </h2>
              {org?.displayTitle && org?.name !== org?.displayTitle && (
                <p className="text-xs text-emerald-200/80 font-medium">
                  Legal Name: {org.name}
                </p>
              )}

              <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {org?.address || 'Mogadishu, Somalia'} • Branch: {org?.branch || 'Main Center'}
              </p>
            </div>

            {/* Quick Action */}
            <div className="flex sm:flex-col gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/30 shadow-sm"
              >
                <Edit className="w-4 h-4 text-emerald-300" />
                Edit Profile
              </button>
              <Link
                to="/organization/qr"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 backdrop-blur-sm shadow-sm"
              >
                <QrCode className="w-4 h-4 text-[#0086FF]" />
                View QR
              </Link>
            </div>
          </div>
        </div>

        {/* Institution Contact and Categories Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-[#5A5856] text-xs font-bold">
              <Phone className="w-4 h-4 text-[#0086FF]" />
              Official Phone
            </div>
            <p className="text-sm font-extrabold text-[#2F2E2D]">
              {org?.phone || 'Not specified'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#5A5856] text-xs font-bold">
                <Mail className="w-4 h-4 text-[#0086FF]" />
                Official Email
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-[10px] font-bold text-[#0086FF] hover:underline"
              >
                Edit
              </button>
            </div>
            <p className="text-sm font-extrabold text-[#2F2E2D] truncate">
              {org?.email || 'Not specified'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-[#5A5856] text-xs font-bold">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp Support
            </div>
            <p className="text-sm font-extrabold text-[#2F2E2D]">
              {org?.whatsapp || org?.phone || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Complaint Categories */}
        {org?.complaintCategories && org.complaintCategories.length > 0 && (
          <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5A5856] mb-3">
              <Layers className="w-4 h-4 text-[#2C3925]" />
              Active Complaint & Feedback Categories
            </div>
            <div className="flex flex-wrap gap-2">
              {org.complaintCategories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Account Profile & Password Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Account Info */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-4">
          <div className="relative w-16 h-16 rounded-2xl bg-[#2C3925] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md overflow-hidden">
            {org?.logo ? (
              <img src={org.logo} alt="" className="w-full h-full object-contain bg-white p-1" />
            ) : (
              user?.fullName?.charAt(0) || 'U'
            )}
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-base text-[#2F2E2D]">{user?.fullName}</h3>
            <p className="text-xs font-mono text-[#0086FF]">@{user?.username}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ORGANIZATION_USER
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-[#5A5856]">
              <span>Organization:</span>
              <span className="font-bold text-[#2F2E2D] truncate max-w-[150px]">
                {org?.name || 'Institution'}
              </span>
            </div>
            <div className="flex justify-between text-[#5A5856]">
              <span>User Phone:</span>
              <span className="font-medium text-[#2F2E2D]">{user?.phone || '—'}</span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="w-4 h-4 text-[#2C3925]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#2F2E2D]">
                Change Portal Access Password
              </h3>
              <p className="text-[11px] text-[#5A5856]">
                Keep your institutional dashboard access credentials secure.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submittingPass}
                className="px-5 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4 text-[#0086FF]" />
                {submittingPass ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* EDIT ORGANIZATION PROFILE & EMAIL MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Organization Profile & Email"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Official Registered Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={orgEditForm.email}
                onChange={(e) => setOrgEditForm({ ...orgEditForm, email: e.target.value })}
                placeholder="info@institution.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Used for OTP password reset and official platform notifications.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Display Title (Customer Banner Header)
            </label>
            <input
              type="text"
              value={orgEditForm.displayTitle}
              onChange={(e) => setOrgEditForm({ ...orgEditForm, displayTitle: e.target.value })}
              placeholder="e.g. Isbitaalka Guud ee ABC"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official Phone Number
              </label>
              <input
                type="tel"
                value={orgEditForm.phone}
                onChange={(e) =>
                  setOrgEditForm({ ...orgEditForm, phone: e.target.value.replace(/[^0-9+\s-]/g, '') })
                }
                placeholder="+252 61 000 0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official WhatsApp Number
              </label>
              <input
                type="tel"
                value={orgEditForm.whatsapp}
                onChange={(e) =>
                  setOrgEditForm({ ...orgEditForm, whatsapp: e.target.value.replace(/[^0-9+\s-]/g, '') })
                }
                placeholder="+252 61 000 0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Branch / Location
              </label>
              <input
                type="text"
                value={orgEditForm.branch}
                onChange={(e) => setOrgEditForm({ ...orgEditForm, branch: e.target.value })}
                placeholder="Main Branch"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={orgEditForm.address}
                onChange={(e) => setOrgEditForm({ ...orgEditForm, address: e.target.value })}
                placeholder="Mogadishu, Somalia"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingOrg}
              className="px-4 py-2 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              {submittingOrg ? 'Saving Changes...' : 'Save & Update Email'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
