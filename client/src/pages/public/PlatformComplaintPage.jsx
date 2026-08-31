import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ShieldAlert, Send, CheckCircle2, ArrowLeft, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { isValidSomaliPhone, normalizeSomaliPhone } from '../../utils/phone.util';

const MAX_CHARS = 200;

const PLATFORM_CATEGORIES = [
  { value: 'System Bug & Performance', label: 'System Bug & Performance (Cilad Farsamo)' },
  { value: 'QR Scanning & Access', label: 'QR Scanning & Access (Cilad QR Scanner)' },
  { value: 'Data Privacy & Security', label: 'Data Privacy & Security (Amniga & Xogta)' },
  { value: 'Customer Service & Support', label: 'Customer Support (Taageerada Macmiilka)' },
  { value: 'Billing & Subscriptions', label: 'Billing & Subscriptions (Lacag-bixinta & Adeegyada)' },
  { value: 'Feature Suggestion', label: 'Feature Suggestion (Soo-jeedin Cusub)' },
  { value: 'Other Platform Issue', label: 'Other Platform Issue (Arrin Kale)' },
];

export const PlatformComplaintPage = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState(PLATFORM_CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [suggestedSolution, setSuggestedSolution] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category?.value) {
      toast.error('Fadlan dooro nooca cabashada.');
      return;
    }
    if (!message.trim()) {
      toast.error('Fadlan qor cabashadaada ku saabsan nidaamka.');
      return;
    }
    if (message.trim().length > MAX_CHARS) {
      toast.error(`Cabashadu kama badnaan karto ${MAX_CHARS} xaraf.`);
      return;
    }
    if (suggestedSolution.trim().length > MAX_CHARS) {
      toast.error(`Xalka aad soo jeedisay kama badnaan karo ${MAX_CHARS} xaraf.`);
      return;
    }
    if (phoneDigits.trim() && !isValidSomaliPhone(phoneDigits.trim())) {
      toast.error('Fadlan geli 9-god oo lambarka taleefanka ah (tusaale: 615788577).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/platform-complaints', {
        category: category.value,
        message: message.trim(),
        suggestedSolution: suggestedSolution.trim() || undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: phoneDigits.trim() ? normalizeSomaliPhone(phoneDigits.trim()) : undefined,
      });

      if (res.data.success) {
        setSubmittedResult(res.data.data);
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

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#F8FAFC',
      borderColor: state.isFocused ? '#2C3925' : '#E2E8F0',
      borderRadius: '0.875rem',
      padding: '2px 4px',
      fontSize: '0.8125rem',
      fontWeight: '600',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(44, 57, 37, 0.15)' : 'none',
      '&:hover': {
        borderColor: '#CBD5E1',
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '0.8125rem',
      fontWeight: '600',
      backgroundColor: state.isSelected ? '#2C3925' : state.isFocused ? '#EEF2EC' : '#FFFFFF',
      color: state.isSelected ? '#FFFFFF' : '#1E293B',
      cursor: 'pointer',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      zIndex: 50,
    }),
  };

  if (submittedResult) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 text-center space-y-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#2F2E2D]">
              Si guul leh ayaa loo diray. ✅
            </h2>
            <p className="text-xs text-[#5A5856] mt-2 leading-relaxed">
              Cabashadaada ku saabsan nidaamka <strong>Compliance QR Platform</strong> waxay si toos ah u gaartay Maamulka Sare (Super Admin).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Number-ka Tixraaca (Platform Reference)
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-base font-extrabold text-[#2C3925] tracking-wider font-mono">
                {submittedResult.referenceNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopyRef(submittedResult.referenceNumber)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#0086FF] transition-colors"
                title="Koobiyeey"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-2xl bg-[#2C3925] hover:bg-[#212B1C] text-xs font-extrabold text-white shadow-md transition-all active:scale-95"
          >
            Ku noqo Bogga Hore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-4 animate-in fade-in duration-200">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A5856] hover:text-[#2C3925] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dib ugu noqo (Back)
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#2F2E2D]">
                Cabasho ku Saabsan Nidaamka
              </h1>
              <p className="text-xs text-[#5A5856]">
                Compliance QR Platform Management & Support
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Category */}
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1.5">
                1. Nooca Cabashada (Category) *
              </label>
              <Select
                value={category}
                onChange={setCategory}
                options={PLATFORM_CATEGORIES}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>

            {/* 2. Message with 0/200 Counter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#2F2E2D]">
                  2. Cabashadaada / Aragtidaada *
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
                rows={4}
                required
                maxLength={MAX_CHARS}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Fadlan si faahfaahsan noogu sharax dhibaatada aad la kulantay..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#2C3925]/20 focus:border-[#2C3925] outline-none resize-none transition-all"
              />
            </div>

            {/* 3. Suggested Solution */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#2F2E2D]">
                  3. Xalka aad soo jeedinayso (Ikhtiyaari)
                </label>
                <span
                  className={`text-[11px] font-bold tabular-nums ${
                    suggestedSolution.length >= MAX_CHARS
                      ? 'text-rose-600'
                      : suggestedSolution.length >= MAX_CHARS * 0.8
                      ? 'text-amber-500'
                      : 'text-slate-400'
                  }`}
                >
                  {suggestedSolution.length}/{MAX_CHARS}
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={MAX_CHARS}
                value={suggestedSolution}
                onChange={(e) => setSuggestedSolution(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Qor sida kula tahay in lagu xalliyo arrintan..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-[#2F2E2D] focus:bg-white focus:ring-2 focus:ring-[#2C3925]/20 focus:border-[#2C3925] outline-none resize-none transition-all"
              />
            </div>

            {/* Optional Customer Information */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <p className="text-[11px] font-extrabold text-[#2C3925]">
                Xogtaada Xiriirka (Ikhtiyaari / Optional):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Magacaaga
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Magacaaga (ikhtiyaari)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#2F2E2D] outline-none focus:ring-2 focus:ring-[#2C3925]/20 focus:border-[#2C3925]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Taleefankaaga
                  </label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#2C3925]/20 focus-within:border-[#2C3925]">
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

            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#2C3925] hover:bg-[#212B1C] disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Gudbinaya...' : 'GUDUBI CABASHADA PLATFORM-KA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
