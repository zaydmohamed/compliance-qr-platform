import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    orgName: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Your inquiry has been sent to the Platform Administration team.');
    setSubmitted(true);
  };

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2F2E2D]">
          Contact Platform Administration
        </h1>
        <p className="text-sm text-[#5A5856] max-w-xl mx-auto">
          Need a QR Code system for your hospital, university, or business? Inquire with our central team to register your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Col */}
        <div className="bg-[#2C3925] text-white rounded-2xl p-8 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Administration Office</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Our central team manages all organization onboarding, QR verification, renewals, and system support.
            </p>

            <div className="space-y-4 text-xs text-emerald-100/90">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#0086FF]" />
                <span>+252 61 000 0000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#0086FF]" />
                <span>support@complianceqr.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#0086FF]" />
                <span>Mogadishu Headquarters, Somalia</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/10 text-xs text-emerald-200/90 border border-white/10">
            <p className="font-semibold text-white">Manual Payment & Renewal</p>
            <p className="text-[11px] mt-1 text-emerald-200/70">
              Payments are recorded manually by platform admins via cash, bank transfer, or mobile money.
            </p>
          </div>
        </div>

        {/* Form Col */}
        <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-slate-100 shadow-card">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2F2E2D]">Inquiry Sent Successfully</h3>
              <p className="text-xs text-[#5A5856]">
                Our Platform Admin will contact your organization at the provided phone number.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2F2E2D] mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Ahmed Warsame"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2F2E2D] mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={formData.orgName}
                    onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                    placeholder="e.g. Mogadishu Specialist Hospital"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">Official Contact Phone / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +252 61 XXX XXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F2E2D] mb-1">Inquiry Details</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your institution and required QR posters..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#0086FF]" />
                Submit Organization Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
