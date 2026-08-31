import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no entries matching your criteria at this moment.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-2xl bg-[#EEF2EC] flex items-center justify-center text-[#2C3925] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-[#2F2E2D] mb-1">{title}</h4>
      <p className="text-xs text-[#5A5856] max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-semibold shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
