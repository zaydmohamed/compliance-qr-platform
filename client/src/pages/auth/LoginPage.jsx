import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { QrCode, Lock, User, ArrowRight, KeyRound, Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1: enter identifier & send email OTP, 2: enter OTP & new password

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot password form state
  const [identifier, setIdentifier] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, platformSettings } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);

    if (result.success) {
      if (result.user.role === 'PLATFORM_ADMIN') {
        navigate('/admin/overview');
      } else {
        navigate('/organization/overview');
      }
    }
  };

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your username or registered email');
      return;
    }

    setResetting(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        identifier: identifier.trim(),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Verification code sent to your email!');
        setTargetEmail(res.data.data?.email || identifier);
        setOtpStep(2);
        startCooldown();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Account not found.');
    } finally {
      setResetting(false);
    }
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setResetting(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        email: targetEmail,
        otpCode: otpCode.trim(),
        newPassword,
      });

      if (res.data.success) {
        toast.success('Password reset successfully! You can now log in.');
        setUsername(identifier);
        setPassword('');
        setIsForgotMode(false);
        setOtpStep(1);
        setOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          {platformSettings?.logo ? (
            <img
              src={platformSettings.logo}
              alt=""
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-14 h-14 rounded-2xl bg-white object-contain p-1.5 border border-slate-200 shadow-md mx-auto"
            />
          ) : null}
          {!platformSettings?.logo && (
            <div className="w-12 h-12 rounded-2xl bg-[#2C3925] flex items-center justify-center text-white shadow-md mx-auto">
              <QrCode className="w-7 h-7 text-white" />
            </div>
          )}
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F2E2D] tracking-tight">
          {isForgotMode
            ? (otpStep === 1 ? 'Forgot Password' : 'Verify Email Code')
            : (platformSettings?.platformName || 'Compliance QR')}
        </h2>
        <p className="text-xs text-[#5A5856]">
          {isForgotMode
            ? (otpStep === 1
                ? 'Enter your username or email to receive a 6-digit verification code'
                : `We sent a 6-digit code to ${targetEmail}`)
            : 'Platform Super Admin & Organization Management Portal'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl sm:px-10 border border-slate-100 space-y-6">
          {!isForgotMode ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#2F2E2D]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier(username);
                      setIsForgotMode(true);
                      setOtpStep(1);
                    }}
                    className="text-[11px] font-bold text-[#0086FF] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Signing in...' : 'Sign In to Portal'}
                <ArrowRight className="w-4 h-4 text-[#0086FF]" />
              </button>
            </form>
          ) : otpStep === 1 ? (
            /* Forgot Password - Step 1: Send OTP */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  Username or Registered Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin or yourname@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-[#5A5856] mt-1.5">
                  We will send a 6-digit verification code to the registered email address.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={resetting}
                  className="w-full py-3 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {resetting ? 'Sending Email Code...' : 'Send Verification Code'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2F2E2D] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password - Step 2: Enter OTP & Set Password */
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs">
                <p className="font-bold">Code sent to: {targetEmail}</p>
                <p className="text-[10px] text-emerald-700 mt-0.5">
                  Check your email inbox or spam folder for the 6-digit code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  6-Digit Verification Code (OTP) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[8px] font-mono text-lg font-bold py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || resetting}
                  onClick={handleRequestOtp}
                  className="font-bold text-[#0086FF] hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpStep(1)}
                  className="text-[#5A5856] hover:underline"
                >
                  Change email
                </button>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={resetting}
                  className="w-full py-3 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {resetting ? 'Resetting Password...' : 'Reset & Save Password'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setOtpStep(1);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2F2E2D] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Cancel & Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs font-semibold text-[#5A5856] hover:text-[#2C3925] transition-colors"
          >
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
