import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrgQrPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const res = await api.get('/organization/qr');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load QR code');
      } finally {
        setLoading(false);
      }
    };
    fetchQr();
  }, []);

  const { qr, dataUrl, publicUrl, organization } = data || {};
  const effectivePublicUrl = (publicUrl && !publicUrl.includes('localhost') && !publicUrl.includes('192.168.'))
    ? publicUrl
    : (qr?.publicToken ? `${window.location.origin}/c/${qr.publicToken}` : (publicUrl || ''));

  const handleCopyLink = () => {
    if (!effectivePublicUrl) return;
    navigator.clipboard.writeText(effectivePublicUrl);
    setCopied(true);
    toast.success('Public customer link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
          Official Branded QR Poster & Access Hub
        </h1>
        <p className="text-xs text-[#5A5856]">
          Download your high-resolution printable posters, digital badges, and citizen intake links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Poster Preview */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5">
          {/* Branded Card Box (Printable Target) */}
          <div className="printable-qr-poster w-full max-w-sm border-2 border-[#2C3925] rounded-3xl p-6 sm:p-8 bg-white text-center space-y-4 shadow-sm relative overflow-hidden">
            {/* Header Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#2C3925]" />

            {organization?.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="h-12 mx-auto object-contain"
              />
            ) : (
              <h3 className="text-base font-extrabold text-[#2C3925] uppercase tracking-tight">
                {organization?.displayTitle || organization?.name}
              </h3>
            )}

            <div className="space-y-0.5">
              <p className="text-[11px] font-extrabold text-[#5A5856] uppercase tracking-wider">
                CABASHO & TALO
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                Official Feedback & Complaint Channel
              </p>
            </div>

            {/* QR Center */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="Organization QR Code"
                  className="w-52 h-52 mx-auto object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-black text-[#2C3925] tracking-wide uppercase">
                KUSKANKEE QR-KA
              </div>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                Ku sawir kamaradda taleefankaaga si aad si qarsoodi ah ugu dirto cabasho ama talo maamulka.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-semibold">
              <span>Powered by Compliance QR Platform</span>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Downloads, Actions & Display Best Practices */}
        <div className="lg:col-span-6 space-y-6 no-print">
          {/* Quick Downloads Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
              <Download className="w-4 h-4 text-[#0086FF]" />
              Download & Print Assets
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Printer className="w-4 h-4" />
                  <span>Print Official QR Poster (Browser Dialog)</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/20 rounded">
                  A4 / A5
                </span>
              </button>

              <a
                href="/api/organization/qr/download"
                download
                className="w-full py-3.5 px-4 rounded-2xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download High-Res Vector PDF</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/20 rounded">
                  PDF
                </span>
              </a>

              {dataUrl && (
                <a
                  href={dataUrl}
                  download={`QR-${organization?.name?.replace(/\s+/g, '_') || 'poster'}.png`}
                  className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-[#2F2E2D] text-xs font-bold transition-all flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Raw High-Resolution Image (PNG)</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    1024x1024
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Public Customer Link Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-3">
            <h3 className="text-sm font-extrabold text-[#2F2E2D] flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#0086FF]" />
              Digital Web Intake Link
            </h3>
            <p className="text-xs text-[#5A5856]">
              Share this web link via WhatsApp, SMS, or embed it on your official website:
            </p>

            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="text"
                readOnly
                value={effectivePublicUrl || ''}
                className="bg-transparent border-none text-xs font-mono text-[#0086FF] flex-1 outline-none px-2"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-[#2C3925] hover:bg-[#212B1C] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Display Guidance Instructions */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Recommended Display Locations
            </h4>
            <ul className="text-xs text-emerald-900/90 space-y-2 list-disc list-inside">
              <li>Reception & check-in counters</li>
              <li>Customer waiting areas and consultation rooms</li>
              <li>Dining tables, billing stations, or entry/exit doors</li>
              <li>Student noticeboards and administrative desks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
