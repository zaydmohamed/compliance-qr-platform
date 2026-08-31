import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Lock, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const MustChangePasswordModal = () => {
  const { user, updateUser, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Fadlan geli furahaaga hadda (current password)');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Furaha cusub waa inuu ka koobnaadaa ugu yaraan 6 xaraf/god');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Furayaasha cusub isma leha (Passwords do not match)');
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('Furaha cusub lama mid noqon karo kii hore ee ku-meel-gaarka ahaa');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        toast.success('Furahaaga sirta ah si guul leh ayaa loo beddelay! ✅');
        // Update user state so modal unlocks immediately
        updateUser({
          ...user,
          mustChangePassword: false,
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Khalad ayaa dhacay beddelidda furaha';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header with Alert Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2F2E2D]">
              Beddel Furahaaga Sirta ah (Waa Qasab)
            </h2>
            <p className="text-xs text-[#5A5856] mt-1.5 leading-relaxed">
              Maadaama aad ku soo gashay furaha ku-meel-gaarka ah, fadlan sameyso fure cusub oo adag si aad u furato Dashboard-ka xaruntaada.
            </p>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              1. Furaha Hadda (Temporary Password) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Geli furaha ku-meel-gaarka ah"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              2. Furaha Cusub (New Password) *
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ugu yaraan 6 xaraf/god"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              3. Xaqiiji Furaha Cusub (Confirm New Password) *
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ku celi furaha cusub"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-[#2C3925] hover:bg-[#212B1C] disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0086FF]" />
              {submitting ? 'Keydinaya...' : 'Keydi Furaha & Gal Dashboard-ka'}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              Ka bax (Logout)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
