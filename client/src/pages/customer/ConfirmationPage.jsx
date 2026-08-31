import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Copy, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useParams();
  const [copied, setCopied] = useState(false);

  const submission = location.state?.submission || {
    referenceNumber: 'CMP-2026-000001',
    type: 'COMPLAINT',
    organizationName: 'Hay’adda / Xarunta',
  };
  const organization = location.state?.organization || {};

  const handleCopyRef = () => {
    navigator.clipboard.writeText(submission.referenceNumber);
    setCopied(true);
    toast.success('Number-ka tixraaca waa la koobiyeeyay!');
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

  const isComplaint = submission.type === 'COMPLAINT';

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 text-center space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-[#2F2E2D]">
            {isComplaint ? 'Si guul leh ayaa loo diray. ✅' : 'Waad ku mahadsan tahay taladaada! 🙏'}
          </h2>
          <p className="text-xs text-[#5A5856] mt-1">
            Fariintaada waxay si toos ah u gaartay maamulka sare ee{' '}
            <span className="font-bold text-[#2C3925]">
              {submission.organizationName || organization.displayTitle || organization.name}
            </span>.
          </p>
        </div>

        {/* Reference Number Box */}
        <div className="p-4 rounded-2xl bg-[#EEF2EC] border border-[#2C3925]/15 space-y-1.5 max-w-sm mx-auto">
          <p className="text-[11px] font-bold text-[#5A5856] uppercase tracking-wider">
            Number-ka Tixraaca (Reference Number)
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-base font-extrabold text-[#2C3925] tracking-wider font-mono">
              {submission.referenceNumber}
            </span>
            <button
              onClick={handleCopyRef}
              className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-[#0086FF] transition-colors"
              title="Koobiyee"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-[#5A5856]">
            Fadlan keydso lambarkan si aad ula socoto xaaladda haddii loo baahdo.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={handleFinish}
            className="px-8 py-3 rounded-2xl bg-[#2C3925] hover:bg-[#212B1C] text-xs font-extrabold text-white shadow-md transition-all active:scale-95"
          >
            Dhammaystir ✓
          </button>

          <button
            onClick={() => navigate(`/c/${token}`)}
            className="text-xs font-bold text-[#5A5856] hover:text-[#2C3925] transition-colors"
          >
            ← Ku noqo bogga hore ee xarunta
          </button>
        </div>
      </div>
    </div>
  );
};
