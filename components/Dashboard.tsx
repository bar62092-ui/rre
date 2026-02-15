
import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, ArrowDownCircle, Wallet, Target, DollarSign } from 'lucide-react';
import { CalculatedEntry } from '../types';
import StatCard from './StatCard';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DashboardProps {
  entries: CalculatedEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const chartData = useMemo(() => {
    return [...entries].reverse().map(e => ({
      name: formatDate(e.date),
      total: e.totalEntry,
      exit: e.exit,
      markup: e.markup
    }));
  }, [entries]);

  const totals = useMemo(() => {
    return entries.reduce((acc, curr) => ({
      totalEntry: acc.totalEntry + curr.totalEntry,
      totalExit: acc.totalExit + curr.exit,
      totalMarkup: acc.totalMarkup + curr.markup,
      totalCash: acc.totalCash + curr.cashIn,
      totalPix: acc.totalPix + curr.pixIn,
      totalCard: acc.totalCard + curr.cardIn,
    }), { totalEntry: 0, totalExit: 0, totalMarkup: 0, totalCash: 0, totalPix: 0, totalCard: 0 });
  }, [entries]);

  const pieData = [
    { name: 'Dinheiro', value: totals.totalCash, color: '#10b981' },
    { name: 'PIX', value: totals.totalPix, color: '#3b82f6' },
    { name: 'Cartão', value: totals.totalCard, color: '#f59e0b' },
  ];

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Target size={64} className="mb-4 opacity-20" />
        <p className="text-xl">Nenhum dado lançado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Entrada Total" 
          value={totals.totalEntry} 
          icon={<DollarSign className="text-emerald-600" size={24} />}
          colorClass="bg-emerald-50"
        />
        <StatCard 
          title="Saídas Totais" 
          value={totals.totalExit} 
          icon={<ArrowDownCircle className="text-rose-600" size={24} />}
          colorClass="bg-rose-50"
        />
        <StatCard 
          title="Saldo (Net)" 
          value={totals.totalEntry - totals.totalExit} 
          icon={<Wallet className="text-blue-600" size={24} />}
          colorClass="bg-blue-50"
        />
        <StatCard 
          title="Markup Total" 
          value={totals.totalMarkup} 
          icon={<TrendingUp className="text-amber-600" size={24} />}
          colorClass="bg-amber-50"
          trend={`${((totals.totalMarkup / (totals.totalEntry || 1)) * 100).toFixed(1)}% Médio`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">Tendência de Fluxo</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" dataKey="total" name="Entrada" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="exit" name="Saída" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="markup" name="Markup" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">Meios de Recebimento</h4>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
