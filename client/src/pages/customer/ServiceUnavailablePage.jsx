import React from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, Clock, Phone, Building2 } from 'lucide-react';

export const ServiceUnavailablePage = () => {
  const location = useLocation();
  const org = location.state?.org || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 shadow-card border border-amber-100 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
          <Clock className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-[#2F2E2D]">
            Adeegga QR-ka Waa La Hakiyay
          </h2>
          <p className="text-xs text-[#5A5856] mt-1 font-medium">
            Service Period Expired / Temporarily Inactive
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 leading-relaxed text-left space-y-2">
          <p>
            Adeegga qaadashada cabashooyinka iyo talooyinka ee{' '}
            <span className="font-bold text-[#2C3925]">{org.name || 'xaruntan'}</span>{' '}
            waqtigiisii wuu dhacay ama hadda waa la hakiyay.
          </p>
          <p className="text-[11px] text-amber-800">
            Fadlan si toos ah ula xiriir xafiiska maamulka xarunta haddii aad qabto arrin degdeg ah.
          </p>
        </div>

        {org.phone && (
          <div className="pt-2">
            <a
              href={`tel:${org.phone}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Phone className="w-4 h-4 text-[#0086FF]" />
              Wac Maamulka: {org.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
