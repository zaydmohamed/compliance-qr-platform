import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  AlertCircle,
  MessageSquareShare,
  ShieldCheck,
  Building2,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#2C3925] text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#0086FF]/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#3D4F34]/40 blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-[#0086FF]" />
            <span>Next-Generation Institutional Feedback System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Seamless Complaints & Feedback <br className="hidden sm:inline" />
            via <span className="text-[#0086FF]">Branded QR Codes</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-emerald-100/80 leading-relaxed font-normal">
            Equip your hospital, hotel, university, or government office with custom QR posters. Empower citizens and customers to submit complaints (Cabasho) and suggestions (Talo) instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Access Organization Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-sm border border-white/20 transition-all flex items-center justify-center"
            >
              How It Works
            </Link>
          </div>

          {/* Key Feature Stats Bar */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/10 text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-emerald-200/70 font-medium">Anonymous Scan</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0086FF]">Instant</p>
              <p className="text-xs text-emerald-200/70 font-medium">SMS & WhatsApp Alerts</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">30 Days</p>
              <p className="text-xs text-emerald-200/70 font-medium">Active QR Service</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0086FF]">Secure</p>
              <p className="text-xs text-emerald-200/70 font-medium">Isolated Multi-Tenant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Pillars Section: Cabasho vs Talo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0086FF]">Two Channels in One Code</p>
          <h2 className="text-3xl font-extrabold text-[#2F2E2D]">
            Structured Grievances & Constructive Suggestions
          </h2>
          <p className="text-sm text-[#5A5856]">
            Every QR code automatically connects customers to their specific organization with two dedicated pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cabasho Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 border-t-4 border-t-rose-500 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Complaint Channel</span>
              <h3 className="text-xl font-bold text-[#2F2E2D] mt-1">CABASHO — Problem Reporting</h3>
            </div>
            <p className="text-xs text-[#5A5856] leading-relaxed">
              Customers quickly report service breakdowns, staff behavior, hygiene issues, or delays. The platform categorizes the issue, generates a tracking reference number, and alerts department managers immediately.
            </p>
            <ul className="space-y-2.5 text-xs text-[#2F2E2D] font-medium pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Configurable category dropdowns tailored to your sector</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Priority escalation & status workflow (New → In Progress → Resolved)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Real-time SMS notification to organization leaders</span>
              </li>
            </ul>
          </div>

          {/* Talo Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 border-t-4 border-t-[#0086FF] space-y-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#0086FF]">
              <MessageSquareShare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0086FF]">Feedback Channel</span>
              <h3 className="text-xl font-bold text-[#2F2E2D] mt-1">TALO — Suggestions & Ideas</h3>
            </div>
            <p className="text-xs text-[#5A5856] leading-relaxed">
              Customers share constructive recommendations and suggested solutions to elevate customer satisfaction and operational excellence.
            </p>
            <ul className="space-y-2.5 text-xs text-[#2F2E2D] font-medium pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Dedicated input for problem observation and suggested fix</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Satisfaction tracking and positive service recognition</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Downloadable analytics and trends report for executive review</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* End-to-End Workflow */}
      <section className="bg-[#EEF2EC] py-16 px-4 sm:px-6 lg:px-8 border-y border-[#2C3925]/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2C3925]">Frictionless Flow</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F2E2D]">
              How the Compliance QR System Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2C3925] text-white flex items-center justify-center font-extrabold text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-[#2F2E2D]">Platform Registration</h4>
              <p className="text-xs text-[#5A5856] leading-relaxed">
                Platform Admin registers the institution, assigns secure credentials, and provisions an automated 30-day service period.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0086FF] text-white flex items-center justify-center font-extrabold text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-[#2F2E2D]">Print & Display QR</h4>
              <p className="text-xs text-[#5A5856] leading-relaxed">
                Organization downloads high-res PNGs or printable PDF posters with brand logo, branch name, and WhatsApp contacts.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2C3925] text-white flex items-center justify-center font-extrabold text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-[#2F2E2D]">Customer Anonymous Scan</h4>
              <p className="text-xs text-[#5A5856] leading-relaxed">
                Citizens scan the QR code without registration or app installation and submit Cabasho or Talo directly in Somali.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0086FF] text-white flex items-center justify-center font-extrabold text-sm">
                4
              </div>
              <h4 className="font-bold text-sm text-[#2F2E2D]">Instant Resolution</h4>
              <p className="text-xs text-[#5A5856] leading-relaxed">
                Organization dashboard updates in real-time, SMS notifications are dispatched, and management tracks resolution progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2C3925] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden">
          <div className="relative max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to modernize your feedback compliance?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Contact our Platform Administration team to enroll your organization and receive your branded QR Code poster today.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold transition-all shadow-md"
              >
                Contact Platform Admin
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
