import React from 'react';

const BADGE_STYLES = {
  // Subscription / Org Statuses
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
  EXPIRING_SOON: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-600/20 animate-pulse',
  EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
  GRACE_PERIOD: 'bg-orange-50 text-orange-800 border-orange-200 ring-orange-600/20',
  INACTIVE: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20',
  REVOKED: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20',

  // Submission Statuses
  NEW: 'bg-blue-50 text-[#0086FF] border-blue-200 ring-blue-600/20 font-semibold',
  ACKNOWLEDGED: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/20',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
  CLOSED: 'bg-gray-100 text-gray-700 border-gray-200 ring-gray-600/20',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',

  // Priority
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  HIGH: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
  CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse',

  // Renewal Statuses
  PENDING: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-600/20 font-medium',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-600/20',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',

  // Types
  COMPLAINT: 'bg-rose-50 text-rose-800 border-rose-200',
  FEEDBACK: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  SMS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  WHATSAPP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || '').toString().toUpperCase().replace(/\s+/g, '_');
  const style = BADGE_STYLES[normalized] || 'bg-gray-100 text-gray-700 border-gray-200';

  const label = (status || 'UNKNOWN')
    .toString()
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </span>
  );
};
