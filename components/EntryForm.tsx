import React, { useState } from 'react';
import { DollarSign, CreditCard, Smartphone, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { FinancialEntry } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface EntryFormProps {
  entries: FinancialEntry[];
  onUpdate: (updatedEntries: FinancialEntry[]) => void;
  onCancel: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ entries, onUpdate, onCancel }) => {
  const today = new Date().toLocaleDateString("sv-SE");

  const [inputValue, setInputValue] = useState('');

  const todayEntryIndex = entries.findIndex(e => e.date === today);

  const currentEntry: FinancialEntry =
    todayEntryIndex !== -1
      ? entries[todayEntryIndex]
      : {
          id: crypto.randomUUID(),
          date: today,
          cashIn: 0,
          pixIn: 0,
          cardIn: 0,
          exit: 0,
          percentage: 0.4,
        };

  // 🔵 AGORA O MARKUP VEM DO BANCO
  const markupPercent = (currentEntry.percentage * 100).toString();

  const updateMarkup = (value: string) => {
    const percentNumber = parseFloat(value);
    if (isNaN(percentNumber)) return;

    const updatedEntry = {
      ...currentEntry,
      percentage: percentNumber / 100,
    };

    let newEntriesList = [...entries];

    if (todayEntryIndex !== -1) {
      newEntriesList[todayEntryIndex] = updatedEntry;
    } else {
      newEntriesList = [updatedEntry, ...newEntriesList];
    }

    onUpdate(newEntriesList);
  };

  const addValue = (type: 'cash' | 'pix' | 'card' | 'exit') => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) return;

    const updatedEntry = { ...currentEntry };

    if (type === 'cash') updatedEntry.cashIn += val;
    if (type === 'pix') updatedEntry.pixIn += val;
    if (type === 'card') updatedEntry.cardIn += val;
    if (type === 'exit') updatedEntry.exit += val;

    let newEntriesList = [...entries];

    if (todayEntryIndex !== -1) {
      newEntriesList[todayEntryIndex] = updatedEntry;
    } else {
      newEntriesList = [updatedEntry, ...newEntriesList];
    }

    onUpdate(newEntriesList);
    setInputValue('');
  };

  const liquidValue =
    currentEntry.cashIn +
    currentEntry.pixIn +
    currentEntry.cardIn -
    currentEntry.exit;

  const markupValue =
    liquidValue * currentEntry.percentage;

  const realBalance = liquidValue - markupValue;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-xl border">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Caixa do Dia</h2>
            <p className="text-slate-500 font-medium">{formatDate(today)}</p>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={markupPercent}
              onChange={e => updateMarkup(e.target.value)}
              className="w-16 border rounded-lg p-2 text-center text-sm font-bold bg-slate-50"
            />
            <span className="self-center text-xs font-black text-slate-400">
              MARKUP %
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                R$
              </span>
              <input
                type="number"
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="w-full pl-14 pr-4 py-6 bg-slate-50 border-2 rounded-2xl text-4xl font-black text-slate-800 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => addValue('cash')} className="bg-emerald-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                <DollarSign size={20}/> + Dinheiro
              </button>

              <button onClick={() => addValue('pix')} className="bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                <Smartphone size={20}/> + PIX
              </button>

              <button onClick={() => addValue('card')} className="bg-amber-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-100">
                <CreditCard size={20}/> + Cartão
              </button>

              <button onClick={() => addValue('exit')} className="bg-rose-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-100">
                <ArrowDownCircle size={20}/> + Saída
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Resumo de Hoje
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm opacity-80">
                <span>Entradas Brutas</span>
                <span className="font-bold">
                  {formatCurrency(currentEntry.cashIn + currentEntry.pixIn + currentEntry.cardIn)}
                </span>
              </div>

              <div className="flex justify-between items-center text-rose-400 text-sm">
                <span>Saídas / Despesas</span>
                <span className="font-bold">{formatCurrency(currentEntry.exit)}</span>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-400 uppercase">
                    Líquido Total
                  </span>
                  <span className="text-2xl font-black">
                    {formatCurrency(liquidValue)}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-black uppercase">
                      Desconto Markup ({markupPercent}%)
                    </span>
                  </div>
                  <span className="text-xl font-black text-indigo-300">
                    -{formatCurrency(markupValue)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                    Saldo Real (Líquido - Markup)
                  </span>
                  <span className="text-3xl font-black text-emerald-400">
                    {formatCurrency(realBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onCancel}
        className="w-full bg-slate-200 text-slate-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
      >
        Sair do Console
      </button>
    </div>
  );
};

export default EntryForm;
