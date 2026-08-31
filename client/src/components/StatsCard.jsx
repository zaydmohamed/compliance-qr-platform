import React from 'react';

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary', // 'primary', 'accent', 'amber', 'rose', 'slate'
  onClick,
}) => {
  const colorMap = {
    primary: {
      bg: 'bg-[#2C3925]/10',
      text: 'text-[#2C3925]',
      border: 'border-l-4 border-l-[#2C3925]',
    },
    accent: {
      bg: 'bg-[#0086FF]/10',
      text: 'text-[#0086FF]',
      border: 'border-l-4 border-l-[#0086FF]',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      border: 'border-l-4 border-l-amber-500',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      border: 'border-l-4 border-l-rose-500',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      border: 'border-l-4 border-l-emerald-500',
    },
    slate: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-600',
      border: 'border-l-4 border-l-slate-400',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 shadow-card border border-slate-100 hover:shadow-card-hover transition-all duration-200 ${
        scheme.border
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5A5856] mb-1">
            {title}
          </p>
          <p className="text-2xl lg:text-3xl font-extrabold text-[#2F2E2D] tracking-tight">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.bg} ${scheme.text}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs text-[#5A5856]">
          {trend && (
            <span
              className={`font-semibold mr-1.5 ${
                trend > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span>{trendLabel || subtitle}</span>
        </div>
      )}
    </div>
  );
};
