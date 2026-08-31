import React from 'react';
import { ShieldCheck, Lock, QrCode, Server, HeartHandshake, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2EC] text-[#2C3925] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#0086FF]" />
          <span>Enterprise Compliance Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2F2E2D]">
          About Compliance QR Code System
        </h1>
        <p className="text-sm text-[#5A5856] max-w-2xl mx-auto">
          A centralized, secure MERN-based platform built to standardize customer feedback and complaint intake across public and private institutions.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#2C3925]/10 text-[#2C3925] flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#2F2E2D]">Strict Data Isolation</h3>
          <p className="text-xs text-[#5A5856] leading-relaxed">
            Every organization user is strictly confined to their own institution's complaints and feedback. Cross-tenant leakage is blocked at the database and server middleware layers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#0086FF]/10 text-[#0086FF] flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#2F2E2D]">Dynamic QR Management</h3>
          <p className="text-xs text-[#5A5856] leading-relaxed">
            Cryptographically generated random tokens link customer scans directly to verified institutions without exposing database identifiers or requiring mobile apps.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#2F2E2D]">30-Day Service Lifecycle</h3>
          <p className="text-xs text-[#5A5856] leading-relaxed">
            Built-in automated tracking warns organizations 3 days before expiration, supports seamless manual renewal request workflows, and protects historical records indefinitely.
          </p>
        </div>
      </div>

      {/* Role Architecture Box */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-card space-y-6">
        <h2 className="text-xl font-bold text-[#2F2E2D]">System Role Responsibilities</h2>
        <div className="space-y-4 text-xs text-[#5A5856]">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="font-bold text-[#2C3925] text-sm mb-1">1. Platform Super Admin</p>
            <p>
              Sole authority over the entire platform. Creates organizations, generates official QR codes, provisions credentials, records manual payments, approves/rejects renewal requests, and accesses system-wide analytics.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="font-bold text-[#0086FF] text-sm mb-1">2. Organization User (Hospital, Hotel, University, etc.)</p>
            <p>
              Manages daily operations for their specific entity. Views complaints & feedback, updates resolution statuses, downloads printable QR posters, and requests service renewals from the Admin.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="font-bold text-emerald-700 text-sm mb-1">3. Customer / Citizen (Anonymous)</p>
            <p>
              Scans QR code at the facility, views the organization's verified branding, and submits Cabasho or Talo anonymously without ever registering or creating an account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
