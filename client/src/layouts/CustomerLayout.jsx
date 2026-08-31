import React from 'react';
import { Outlet } from 'react-router-dom';
import { QrCode, ShieldCheck } from 'lucide-react';

export const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Container */}
      <div className="w-full max-w-md mx-auto">
        <Outlet />
      </div>

      {/* Footer Branding */}
      <footer className="w-full max-w-md mx-auto mt-8 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#5A5856] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#0086FF]" />
          <span>Xogtaada waa ammaan oo qarsoodi ah (Secure & Confidential)</span>
        </div>
        <p className="text-[10px] text-[#8C8986] mt-1">
          Compliance QR Code Complaint & Feedback Platform
        </p>
      </footer>
    </div>
  );
};
