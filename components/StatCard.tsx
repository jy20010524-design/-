import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  isPrimary?: boolean;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit = '', isPrimary = false, icon }) => {
  return (
    <div className={`
      relative overflow-hidden rounded-3xl p-5 shadow-sm transition-all duration-300
      ${isPrimary 
        ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-500/20' 
        : 'bg-white text-gray-800 border border-gray-100/50 shadow-sm'}
    `}>
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <p className={`text-sm font-bold opacity-90 ${isPrimary ? 'text-brand-50' : 'text-gray-400'}`}>{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">{value}</span>
            <span className={`text-sm font-medium ${isPrimary ? 'text-brand-100' : 'text-gray-400'}`}>{unit}</span>
          </div>
        </div>
        {icon && (
          <div className={`p-3 rounded-2xl ${isPrimary ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-50 text-brand-500'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};