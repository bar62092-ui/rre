
import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass, trend }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(value)}</h3>
        {trend && (
          <p className="text-xs mt-2 text-emerald-600 font-semibold">
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
