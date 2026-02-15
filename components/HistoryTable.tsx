
import React from 'react';
import { Trash2 } from 'lucide-react';
import { CalculatedEntry } from '../types';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';

interface HistoryTableProps {
  entries: CalculatedEntry[];
  onDelete: (id: string) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ entries, onDelete }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
        Nenhum histórico encontrado.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dia</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-emerald-600">Entradas</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-rose-600">Saída</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-amber-600">Markup</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">%</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                  {formatDate(entry.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{formatCurrency(entry.totalEntry)}</span>
                    <span className="text-[10px] text-slate-400">
                      C: {formatCurrency(entry.cashIn)} | P: {formatCurrency(entry.pixIn)} | K: {formatCurrency(entry.cardIn)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-rose-600 font-medium">
                  {formatCurrency(entry.exit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                  {formatCurrency(entry.balance)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-600">
                  {formatCurrency(entry.markup)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                  {formatPercent(entry.percentage)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    onClick={() => onDelete(entry.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
