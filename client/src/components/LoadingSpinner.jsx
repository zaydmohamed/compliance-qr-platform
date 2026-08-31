import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading data...' }) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div
        className={`${
          sizeMap[size] || sizeMap.md
        } rounded-full border-[#0086FF]/20 border-t-[#2C3925] animate-spin mb-3`}
      />
      {message && <p className="text-xs font-medium text-[#5A5856]">{message}</p>}
    </div>
  );
};
