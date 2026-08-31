import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { MessageSquareShare, ArrowLeft, Send, CheckCircle2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { isValidSomaliPhone, normalizeSomaliPhone } from '../../utils/phone.util';

const MAX_CHARS = 200;

export const FeedbackFormPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [orgData, setOrgData] = useState(location.state?.orgData || null);
  const [loading, setLoading] = useState(!orgData);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');

  useEffect(() => {
    if (!orgData) {
      const fetchOrg = async () => {
        try {
          const res = await api.get(`/public/qr/${token}`);
          if (res.data.success) {
            setOrgData(res.data.data);
          }
        } catch {
          navigate(`/c/${token}`);
        } finally {
          setLoading(false);
        }
      };
      fetchOrg();
    }
  }, [token, orgData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Fadlan qor taladaada ama aragtidaada.');
      return;
    }
    if (message.trim().length > MAX_CHARS) {
      toast.error(`Taladaadu kama badnaan karto ${MAX_CHARS} xaraf.`);
      return;
    }

    if (phoneDigits.trim() && !isValidSomaliPhone(phoneDigits.trim())) {
      toast.error('Fadlan geli 9-god oo lambarka taleefanka ah (tusaale: 615788577).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/public/submissions', {
        qrToken: token,
        type: 'FEEDBACK',
        category: 'Feedback / Suggestion',
        message: message.trim(),
        customerName: customerName.trim() || undefined,
        customerPhone: phoneDigits.trim() ? normalizeSomaliPhone(phoneDigits.trim()) : undefined,
      });

      if (res.data.success) {
        setSubmittedResult({
          submission: res.data.data,
          organization: orgData?.organization,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Khalad ayaa dhacay. Fadlan isku day markale.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyRef = (refNum) => {
    navigator.clipboard.writeText(refNum);
    setCopied(true);
    toast.success('Number-ka tixraaca waa la koobiyay!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    try {
      window.close();
      if (!window.closed) {
        window.open('', '_self', '');
        window.close();
      }
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      try {
        window.location.href = 'about:blank';
      } catch (e) {}
    }, 150);
  };

  if (loading) {
    return <LoadingSpinner message="Soo diyaarinaya foomka talada..." />;
  }

  const organization = orgData?.organization || {};

  // SUCCESS VIEW (Strictly no WhatsApp, per Part 4 & 31)
  if (submittedResult) {
    const sub = submittedResult.submission;
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 text-center space-y-6">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#2F2E2D]">
              Si guul leh ayaa loo diray. 🙏
            </h2>
            <p className="text-xs text-[#5A5856] mt-2 max-w-sm mx-auto leading-relaxed">
              Aragtidaada qaaliga ah waxay si toos ah u gaartay maamulka xarunta{' '}
              <span className="font-bold text-[#2C3925]">
                {organization.displayTitle || organization.name}
              </span>.
            </p>
          </div>

          {/* Reference Code Box */}
          {sub?.referenceNumber && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 max-w-sm mx-auto">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Number-ka Tixraaca (Reference Number)
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-base font-extrabold text-[#2C3925] tracking-wider font-mono">
                  {sub.referenceNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyRef(sub.referenceNumber)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#0086FF] transition-colors"
                  title="Koobiyee"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Fadlan keydso lambarkan si aad ula socoto taladaada haddii loo baahdo.
              </p>
            </div>
          )}

          {/* Done / Exit button */}
          <button
            onClick={handleFinish}
            className="mt-2 px-8 py-3 rounded-2xl bg-[#2C3925] hover:bg-[#212B1C] text-xs font-extrabold text-white shadow-md transition-all active:scale-95"
          >
            Dhammaystir ✓
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Back Nav */}
      <button
        onClick={() => navigate(`/c/${token}`)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A5856] hover:text-[#2C3925] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dib ugu noqo (Back)
      </button>

      {/* Main Form Box */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0086FF] flex items-center justify-center">
            <MessageSquareShare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#2F2E2D]">
              Gudbi Taladaada
            </h2>
            <p className="text-xs text-[#5A5856]">
              {organization.displayTitle || organization.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Suggestion Textarea with 0/200 Counter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#2F2E2D]">
                Taladaada ama Aragtidaada (Your Suggestion) *
              </label>
              <span
                className={`text-[11px] font-bold tabular-nums ${
                  message.length >= MAX_CHARS
                    ? 'text-rose-600'
                    : message.length >= MAX_CHARS * 0.8
                    ? 'text-amber-500'
                    : 'text-slate-400'
                }`}
              >
                {message.length}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              rows={5}
              required
              maxLength={MAX_CHARS}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Fadlan halkan ku qor taladaada ama aragtidaada si xaruntu wax uga qabato..."
              className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 outline-none resize-none transition-all ${
                message.length >= MAX_CHARS
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-[#0086FF]/20 focus:border-[#0086FF]'
              }`}
            />
          </div>

          {/* Optional Tracking Information */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <p className="text-[11px] font-extrabold text-[#2C3925]">
              Xogtaada Gaarka ah (Ikhtiyaari / Optional):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Magacaaga (Customer Name)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Magacaaga oo buuxa (ikhtiyaari)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Taleefankaaga (Phone Number)
                </label>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0086FF]/20 focus-within:border-[#0086FF]">
                  <span className="px-3 py-2.5 bg-slate-100 text-xs font-bold text-slate-700 border-r border-slate-200">
                    +252
                  </span>
                  <input
                    type="tel"
                    maxLength={9}
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="615788577"
                    className="w-full px-3 py-2 bg-transparent text-xs text-[#2F2E2D] font-mono outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="w-full py-3.5 rounded-2xl bg-[#0086FF] hover:bg-[#006ED6] disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Gudbinaya...' : 'GUDUBI TALADA'}
          </button>
        </form>
      </div>
    </div>
  );
};
