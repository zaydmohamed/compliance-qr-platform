import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  User,
  UserPlus,
  Lock,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Mail,
  Phone,
  Clock,
  Eye,
  EyeOff,
  Search,
  ImagePlus,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsersPage = () => {
  const { user: currentUser, platformSettings, refreshPlatformSettings } = useAuth();

  // Superadmins list state
  const [superadmins, setSuperadmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Superadmin Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
  });

  // Delete Superadmin Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Platform Branding State
  const [brandName, setBrandName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [savingBrand, setSavingBrand] = useState(false);
  const logoInputRef = useRef(null);

  const fetchSuperadmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/superadmins');
      if (res.data.success) {
        setSuperadmins(res.data.data.superadmins || []);
      }
    } catch (err) {
      toast.error('Failed to load superadmins list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperadmins();
  }, []);

  useEffect(() => {
    if (platformSettings) {
      setBrandName(platformSettings.platformName || '');
      setLogoPreview(platformSettings.logo || '');
    }
  }, [platformSettings]);

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, SVG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file must be under 5MB');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setSavingBrand(true);
    try {
      const formData = new FormData();
      formData.append('platformName', brandName.trim() || 'Compliance QR');
      if (logoFile) {
        formData.append('logo', logoFile);
      } else if (!logoPreview) {
        formData.append('logo', '');
      }
      await api.patch('/admin/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Platform branding updated!');
      setLogoFile(null);
      await refreshPlatformSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update branding');
    } finally {
      setSavingBrand(false);
    }
  };

  const handleCreateSuperadmin = async (e) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.username.trim() || !createForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (createForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setCreateSubmitting(true);
      const res = await api.post('/admin/superadmins', createForm);
      if (res.data.success) {
        toast.success('New superadmin created successfully!');
        setIsCreateOpen(false);
        setCreateForm({
          fullName: '',
          username: '',
          password: '',
          email: '',
          phone: '',
        });
        fetchSuperadmins();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create superadmin');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    if (admin._id === currentUser?.id || admin._id === currentUser?._id) {
      toast.error('You cannot deactivate your own account');
      return;
    }

    try {
      const res = await api.patch(`/admin/superadmins/${admin._id}/status`, {
        isActive: !admin.isActive,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchSuperadmins();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteSuperadmin = async () => {
    if (!adminToDelete) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/superadmins/${adminToDelete._id}`);
      if (res.data.success) {
        toast.success('Superadmin account deleted successfully');
        setIsDeleteOpen(false);
        setAdminToDelete(null);
        fetchSuperadmins();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete superadmin');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSubmittingPassword(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data.success) {
        toast.success('Admin password updated successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const filteredSuperadmins = superadmins.filter((adm) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      adm.fullName?.toLowerCase().includes(q) ||
      adm.username?.toLowerCase().includes(q) ||
      adm.email?.toLowerCase().includes(q) ||
      adm.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
            Platform Superadmins & Security
          </h1>
          <p className="text-xs text-[#5A5856]">
            Manage platform superadmin accounts, access controls, and root security settings.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4 text-[#0086FF]" />
          Create New Superadmin
        </button>
      </div>

      {/* Superadmins List Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0086FF]" />
              Superadmin Accounts ({superadmins.length})
            </h2>
            <p className="text-[11px] text-[#5A5856] mt-0.5">
              Authorized administrators with platform-wide management access.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search superadmins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-[11px] font-bold text-[#5A5856] uppercase tracking-wider">
                <th className="py-3 px-4">Admin Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Loading superadmins...
                  </td>
                </tr>
              ) : filteredSuperadmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No superadmin accounts found.
                  </td>
                </tr>
              ) : (
                filteredSuperadmins.map((adm) => {
                  const isCurrent =
                    adm._id === currentUser?.id || adm._id === currentUser?._id;

                  return (
                    <tr key={adm._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#2C3925] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {adm.fullName?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="font-bold text-[#2F2E2D] flex items-center gap-1.5">
                              {adm.fullName}
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded-md bg-[#0086FF]/10 text-[#0086FF] text-[9px] font-bold">
                                  You
                                </span>
                              )}
                            </p>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              {adm.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#0086FF] font-semibold text-[11px]">
                        @{adm.username}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-[#5A5856] space-y-0.5">
                        {adm.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{adm.email}</span>
                          </div>
                        )}
                        {adm.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{adm.phone}</span>
                          </div>
                        )}
                        {!adm.email && !adm.phone && <span className="text-slate-400">—</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            adm.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {adm.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-[#5A5856]">
                        {adm.lastLoginAt ? (
                          new Date(adm.lastLoginAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="text-slate-400">Never</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-[#5A5856]">
                        {new Date(adm.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(adm)}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? 'Cannot modify your own account'
                                : adm.isActive
                                ? 'Deactivate account'
                                : 'Activate account'
                            }
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              adm.isActive
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {adm.isActive ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setAdminToDelete(adm);
                              setIsDeleteOpen(true);
                            }}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? 'Cannot delete your own account'
                                : 'Delete superadmin'
                            }
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Branding Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-[#0086FF]" />
            Platform Branding
          </h2>
          <p className="text-[11px] text-[#5A5856] mt-0.5">
            Upload your company logo and set your platform name. This will appear in the sidebar, navbar, and public pages.
          </p>
        </div>

        <form onSubmit={handleSaveBranding} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#2F2E2D]">
                Platform Logo
              </label>

              <div className="flex items-start gap-4">
                {/* Logo Preview */}
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#2F2E2D] transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </button>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors ml-2"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  )}

                  <p className="text-[10px] text-[#5A5856]">
                    Recommended: 200×200px, PNG or SVG, max 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Name */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#2F2E2D]">
                Platform Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Compliance QR"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
              <p className="text-[10px] text-[#5A5856]">
                This name appears across the entire platform branding.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={savingBrand}
              className="px-5 py-2.5 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {savingBrand ? 'Saving...' : 'Save Branding'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Change Password Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#2C3925] text-white flex items-center justify-center font-extrabold text-2xl mx-auto shadow-md">
            {currentUser?.fullName?.charAt(0) || 'A'}
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-base text-[#2F2E2D]">{currentUser?.fullName}</h3>
            <p className="text-xs font-mono text-[#0086FF]">@{currentUser?.username}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              CURRENT LOGGED-IN SUPERADMIN
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-[#5A5856]">
              <span>Role:</span>
              <span className="font-bold text-[#2F2E2D]">Master Platform Admin</span>
            </div>
            <div className="flex justify-between text-[#5A5856]">
              <span>Status:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="w-4 h-4 text-[#2C3925]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#2F2E2D]">
                Change My Master Password
              </h3>
              <p className="text-[11px] text-[#5A5856]">
                Update your login credentials securely.
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
                disabled={submittingPassword}
                className="px-5 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4 text-[#0086FF]" />
                {submittingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Create Superadmin Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          if (!createSubmitting) setIsCreateOpen(false);
        }}
        title="Create New Superadmin"
        subtitle="Grant full platform administrative privileges to a new administrator."
      >
        <form onSubmit={handleCreateSuperadmin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ahmed Mohamed"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Username * (lowercase, letters & numbers)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ahmed_admin"
              value={createForm.username}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  username: e.target.value.toLowerCase().replace(/\s+/g, ''),
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Password * (min 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Enter strong password..."
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="admin@compliance.so"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                placeholder="+252 61 0000000"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={createSubmitting}
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#0086FF]" />
              {createSubmitting ? 'Creating...' : 'Create Superadmin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteOpen(false);
            setAdminToDelete(null);
          }
        }}
        title="Delete Superadmin Account"
        subtitle="This action will permanently revoke administrative access."
      >
        {adminToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Revoke Superadmin Access</p>
                <p className="opacity-90 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold">{adminToDelete.fullName}</span> (@{adminToDelete.username})? They will no longer be able to log into the platform.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteOpen(false);
                  setAdminToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSuperadmin}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Yes, Delete Superadmin'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
