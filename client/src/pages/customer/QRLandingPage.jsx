import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AlertCircle, MessageSquareShare, Building2, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export const QRLandingPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicOrg = async () => {
      try {
        const res = await api.get(`/public/qr/${token}`);
        if (res.data.success) {
          if (!res.data.data.isServiceActive) {
            navigate(`/c/${token}/unavailable`, { state: { org: res.data.data.organization } });
            return;
          }
          setOrgData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired QR code.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicOrg();
  }, [token, navigate]);

  if (loading) {
    return <LoadingSpinner message="Soo dejinaya macluumaadka xarunta..." />;
  }

  if (error || !orgData) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-card border border-rose-100 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#2F2E2D]">QR Code-ka lama heli karo</h3>
        <p className="text-xs text-[#5A5856] leading-relaxed">
          {error || 'QR code-kan ma shaqeynayo ama wuu dhacay. Fadlan la xiriir maamulka xarunta.'}
        </p>
      </div>
    );
  }

  const { organization } = orgData;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Organization Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 text-center space-y-4">
        {/* 1. Logo at Top with dedicated spacing */}
        <div className="pb-1">
          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-24 h-24 object-contain mx-auto rounded-2xl p-1.5 bg-slate-50 border border-slate-200 shadow-sm"
            />
          ) : (
            <div className="w-18 h-18 rounded-2xl bg-[#2C3925] text-white flex items-center justify-center mx-auto font-extrabold text-2xl shadow-md p-4">
              {organization.name?.charAt(0) || 'O'}
            </div>
          )}
        </div>

        {/* 2. Organization Name */}
        <div className="space-y-1.5 px-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D] tracking-tight">
            {organization.displayTitle || organization.name}
          </h2>

          {/* 3. Location / Branch / Address */}
          {(organization.branch || organization.address) && (
            <p className="text-xs sm:text-sm font-semibold text-[#0086FF]">
              {[organization.branch, organization.address].filter(Boolean).join('  •  ')}
            </p>
          )}
        </div>

        {/* Official Phone Pill */}
        {organization.phone && (
          <div className="pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Phone className="w-3.5 h-3.5 text-[#2C3925]" />
              <span>{organization.phone}</span>
            </div>
          </div>
        )}
      </div>

      {/* Step 1 Selection Card (Somali spec prompt exact design) */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#2C3925] text-white text-[10px] font-extrabold uppercase tracking-wider mb-1">
            TALLAABADA 1
          </span>
          <h3 className="text-base font-bold text-[#2F2E2D]">
            Sidee rabtaa inaad nala wadaagto?
          </h3>
          <p className="text-xs text-[#5A5856] mt-0.5">
            Dooro nooca fariinta aad rabto inaad noo soo dirto.
          </p>
        </div>

        {/* Option 1: CABASHO */}
        <button
          onClick={() => navigate(`/c/${token}/cabasho`, { state: { orgData } })}
          className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#2F2E2D] group-hover:text-rose-700">
                CABASHO
              </p>
              <p className="text-xs text-[#5A5856]">
                Gudbi cabasho ku saabsan adeegga ama dhibaato aad la kulantay
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
        </button>

        {/* Option 2: TALO */}
        <button
          onClick={() => navigate(`/c/${token}/talo`, { state: { orgData } })}
          className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0086FF] hover:bg-blue-50/40 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0086FF] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquareShare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#2F2E2D] group-hover:text-[#0086FF]">
                TALO
              </p>
              <p className="text-xs text-[#5A5856]">
                Nala wadaag talo, aragti, ama fikrad horumarineed
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#0086FF] group-hover:translate-x-1 transition-all" />
        </button>


      </div>
    </div>
  );
};
