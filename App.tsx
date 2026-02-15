
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, List, PlusCircle, BrainCircuit, Wallet2, 
  ShieldCheck, ReceiptText, Calculator, ClipboardList, 
  Users, Zap, Scale, Trash2, CheckCircle2, XCircle, Tag, Plus, PlusSquare, Minus, Search
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Dashboard from './components/Dashboard';
import HistoryTable from './components/HistoryTable';
import EntryForm from './components/EntryForm';
import { ViewMode, CalculatedEntry, FinancialEntry, Bill, DebtNote, EnergyReading, Comanda, ProductBudget } from './types';
import { 
  getCalculatedEntries, saveEntries, loadEntries,
  loadBills, saveBills, loadDebts, saveDebts,
  loadEnergy, saveEnergy, loadComandas, saveComandas,
  loadBudgets, saveBudgets
} from './services/dataService';
import { formatCurrency, formatDate } from './utils/formatters';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [entries, setEntries] = useState<CalculatedEntry[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [debts, setDebts] = useState<DebtNote[]>([]);
  const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>([]);
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [budgets, setBudgets] = useState<ProductBudget[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [vaultRange, setVaultRange] = useState({ start: '', end: '' });

useEffect(() => {
  const loadData = async () => {
    setEntries(await getCalculatedEntries());
    setBills(await loadBills());
    setDebts(await loadDebts());
    setEnergyReadings(await loadEnergy());
    setComandas(await loadComandas());
    setBudgets(await loadBudgets());
  };

  loadData();
}, []);

const handleUpdateEntries = async (updated: FinancialEntry[]) => {
  await saveEntries(updated);
  setEntries(await getCalculatedEntries());
};

  const getAiInsight = async () => {
    if (entries.length === 0) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = JSON.stringify({ entries: entries.slice(0, 5), budgets: budgets.slice(0, 5) });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise os dados financeiros e sugira 2 ações para aumentar o lucro líquido: ${context}`,
      });
      setAiInsight(response.text || "Insights indisponíveis.");
    } catch (e) {
      setAiInsight("Erro ao carregar insights.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case ViewMode.DASHBOARD: return <Dashboard entries={entries} />;
      case ViewMode.HISTORY:
  return (
    <HistoryTable
      entries={entries}
      onDelete={(id) => {
        const updated = entries.filter(e => e.id !== id);
        handleUpdateEntries(updated);
      }}
    />
  );
      case ViewMode.ADD:
  return (
    <EntryForm
      entries={entries}
      onUpdate={handleUpdateEntries}
      onCancel={() => setViewMode(ViewMode.DASHBOARD)}
    />
  );
      case ViewMode.VAULT: return <VaultSection entries={entries} range={vaultRange} setRange={setVaultRange} />;
      case ViewMode.BILLS: return <BillsSection bills={bills} setBills={(b) => { setBills(b); saveBills(b); }} />;
      case ViewMode.BUDGET: return <BudgetListSection budgets={budgets} setBudgets={(b) => { setBudgets(b); saveBudgets(b); }} />;
      case ViewMode.ORDER: return <OrderSection comandas={comandas} setComandas={(c) => { setComandas(c); saveComandas(c); }} budgets={budgets} />;
      case ViewMode.DEBTS: return <DebtsSection debts={debts} setDebts={(d) => { setDebts(d); saveDebts(d); }} />;
      case ViewMode.ENERGY: return <EnergySection readings={energyReadings} setReadings={(r) => { setEnergyReadings(r); saveEnergy(r); }} />;
      case ViewMode.SCALE: return <ScaleSection />;
      default: return <Dashboard entries={entries} />;
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col bg-slate-50 text-slate-900">
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-slate-400 p-4 z-50 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-blue-600 p-2 rounded-lg"><Wallet2 className="text-white" size={20} /></div>
          <span className="text-white text-lg font-bold">FinTrack Pro</span>
        </div>
        <nav className="space-y-1">
          <MenuBtn active={viewMode === ViewMode.DASHBOARD} onClick={() => setViewMode(ViewMode.DASHBOARD)} icon={<LayoutGrid size={18}/>} label="Dashboard" />
          <MenuBtn active={viewMode === ViewMode.HISTORY} onClick={() => setViewMode(ViewMode.HISTORY)} icon={<List size={18}/>} label="Caixa Anterior" />
          <MenuBtn active={viewMode === ViewMode.VAULT} onClick={() => setViewMode(ViewMode.VAULT)} icon={<ShieldCheck size={18}/>} label="Cofre" />
          <hr className="border-slate-800 my-2" />
          <MenuBtn active={viewMode === ViewMode.BILLS} onClick={() => setViewMode(ViewMode.BILLS)} icon={<ReceiptText size={18}/>} label="Contas" />
          <MenuBtn active={viewMode === ViewMode.BUDGET} onClick={() => setViewMode(ViewMode.BUDGET)} icon={<Tag size={18}/>} label="Catálogo" />
          <MenuBtn active={viewMode === ViewMode.ORDER} onClick={() => setViewMode(ViewMode.ORDER)} icon={<ClipboardList size={18}/>} label="Comandas" />
          <MenuBtn active={viewMode === ViewMode.DEBTS} onClick={() => setViewMode(ViewMode.DEBTS)} icon={<Users size={18}/>} label="Fiado" />
          <hr className="border-slate-800 my-2" />
          <MenuBtn active={viewMode === ViewMode.ENERGY} onClick={() => setViewMode(ViewMode.ENERGY)} icon={<Zap size={18}/>} label="Energia" />
          <MenuBtn active={viewMode === ViewMode.SCALE} onClick={() => setViewMode(ViewMode.SCALE)} icon={<Scale size={18}/>} label="Balança / PDV" />
        </nav>
        <div className="mt-8 space-y-2">
          <button onClick={() => setViewMode(ViewMode.ADD)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black shadow-lg">Caixa do Dia</button>
          <button onClick={getAiInsight} disabled={isAiLoading} className="w-full bg-slate-800 text-indigo-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <BrainCircuit size={18}/> {isAiLoading ? '...' : 'Insights AI'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {aiInsight && (
          <div className="mb-6 bg-indigo-900 text-indigo-100 p-4 rounded-2xl flex items-center justify-between border border-indigo-700 shadow-xl">
            <div className="flex items-center gap-3 italic text-sm"><BrainCircuit className="text-indigo-400" /> "{aiInsight}"</div>
            <button onClick={() => setAiInsight(null)} className="text-indigo-400 text-xl font-bold">×</button>
          </div>
        )}
        {renderContent()}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-50">
        <MobBtn active={viewMode === ViewMode.DASHBOARD} onClick={() => setViewMode(ViewMode.DASHBOARD)} icon={<LayoutGrid size={20}/>} />
        <MobBtn active={viewMode === ViewMode.ORDER} onClick={() => setViewMode(ViewMode.ORDER)} icon={<ClipboardList size={20}/>} />
        <button onClick={() => setViewMode(ViewMode.ADD)} className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg -mt-8 border-4 border-slate-50"><PlusCircle size={24}/></button>
        <MobBtn active={viewMode === ViewMode.BUDGET} onClick={() => setViewMode(ViewMode.BUDGET)} icon={<Tag size={20}/>} />
        <MobBtn active={viewMode === ViewMode.SCALE} onClick={() => setViewMode(ViewMode.SCALE)} icon={<Scale size={20}/>} />
      </nav>
    </div>
  );
};

const MenuBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800'}`}>
    {icon} {label}
  </button>
);

const MobBtn = ({ active, onClick, icon }: any) => (
  <button onClick={onClick} className={`p-2 ${active ? 'text-blue-600' : 'text-slate-400'}`}>{icon}</button>
);

const BudgetListSection = ({ budgets, setBudgets }: any) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');

  const add = () => {
    if (!name || !cost || !price) return;
    const c = parseFloat(cost);
    const p = parseFloat(price);
    const profit = p - c;
    const margin = (profit / p) * 100;
    setBudgets([{ id: Date.now().toString(), name, cost: c, price: p, profit, marginPercent: margin }, ...budgets]);
    setName(''); setCost(''); setPrice('');
  };

  const getMarginColor = (pct: number) => {
    if (pct < 20) return 'bg-rose-100 text-rose-700';
    if (pct < 40) return 'bg-orange-100 text-orange-700';
    if (pct < 60) return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1"><label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Produto</label><input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-xl p-3 bg-slate-50 font-bold" /></div>
        <div><label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Custo</label><input type="number" value={cost} onChange={e => setCost(e.target.value)} className="w-full border rounded-xl p-3 bg-slate-50 font-bold" /></div>
        <div><label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Venda</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border rounded-xl p-3 bg-slate-50 font-bold" /></div>
        <button onClick={add} className="bg-slate-900 text-white py-3 rounded-2xl font-black uppercase text-xs">Salvar</button>
      </div>
      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-black uppercase text-[10px] text-slate-400">Produto</th>
              <th className="p-4 font-black uppercase text-[10px] text-slate-400">Custo</th>
              <th className="p-4 font-black uppercase text-[10px] text-slate-400">Venda</th>
              <th className="p-4 font-black uppercase text-[10px] text-slate-400 text-center">Margem %</th>
              <th className="p-4 text-center font-black uppercase text-[10px] text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b: any) => (
              <tr key={b.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-bold">{b.name}</td>
                <td className="p-4">{formatCurrency(b.cost)}</td>
                <td className="p-4 font-bold text-slate-900">{formatCurrency(b.price)}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full font-black ${getMarginColor(b.marginPercent)}`}>
                    {b.marginPercent.toFixed(1)}%
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => setBudgets(budgets.filter((x: any) => x.id !== b.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrderSection = ({ comandas, setComandas, budgets }: any) => {
  const [activeTab, setActiveTab] = useState(1);
  const [search, setSearch] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  const current = comandas.find((c: any) => c.id === activeTab) || { items: [], clientName: '' };
  const total = current.items.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);

  const filteredCatalogue = useMemo(() => {
    if (!search) return [];
    return budgets.filter((b: any) => b.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
  }, [search, budgets]);

  const updateClient = (name: string) => {
    setComandas(comandas.map((c: any) => c.id === activeTab ? { ...c, clientName: name } : c));
  };

  const modifyQty = (itemId: string, delta: number) => {
    setComandas(comandas.map((com: any) => {
      if (com.id !== activeTab) return com;
      const updatedItems = com.items.map((i: any) => 
        i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      ).filter((i: any) => i.quantity > 0);
      return { ...com, items: updatedItems };
    }));
  };

  const addItem = (name: string, price: number) => {
    setComandas(comandas.map((com: any) => {
      if (com.id !== activeTab) return com;
      const exists = com.items.findIndex((i: any) => i.name.toLowerCase() === name.toLowerCase());
      if (exists !== -1) {
        const items = [...com.items];
        items[exists].quantity += 1;
        return { ...com, items };
      }
      return { ...com, items: [...com.items, { id: Date.now().toString(), name, price, quantity: 1 }] };
    }));
    setSearch(''); setManualName(''); setManualPrice('');
  };

  const clear = () => {
    if (confirm('Limpar comanda?')) {
      setComandas(comandas.map((c: any) => c.id === activeTab ? { ...c, items: [], clientName: '' } : c));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {comandas.map((c: any) => (
          <button key={c.id} onClick={() => setActiveTab(c.id)} className={`px-5 py-3 rounded-2xl font-black transition-all shrink-0 ${activeTab === c.id ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-white border text-slate-400'}`}>
            {c.clientName || `Cliente ${c.id}`}
            {c.items.length > 0 && <span className="ml-2 w-2 h-2 bg-emerald-400 rounded-full inline-block"></span>}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase">Nome do Cliente</label>
             <input value={current.clientName} onChange={e => updateClient(e.target.value)} placeholder="Identificar Cliente..." className="w-full border rounded-xl p-3 bg-slate-50 font-bold" />
          </div>
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase">Buscar no Catálogo</label>
             <div className="relative">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar produto..." className="w-full border rounded-xl p-3 bg-slate-50 font-bold pl-10" />
                <Search size={18} className="absolute left-3 top-3.5 text-slate-300" />
             </div>
             {filteredCatalogue.length > 0 && (
                <div className="border rounded-xl divide-y overflow-hidden">
                   {filteredCatalogue.map((p: any) => (
                      <button key={p.id} onClick={() => addItem(p.name, p.price)} className="w-full text-left p-3 hover:bg-blue-50 font-bold flex justify-between">
                         <span>{p.name}</span>
                         <span className="text-blue-600">{formatCurrency(p.price)}</span>
                      </button>
                   ))}
                </div>
             )}
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl space-y-4 text-white">
             <label className="text-[10px] font-black text-slate-500 uppercase">Produto Avulso</label>
             <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Nome" className="w-full border-slate-700 bg-slate-800 rounded-xl p-3 font-bold" />
             <input type="number" value={manualPrice} onChange={e => setManualPrice(e.target.value)} placeholder="Preço R$" className="w-full border-slate-700 bg-slate-800 rounded-xl p-3 font-bold" />
             <button onClick={() => addItem(manualName, parseFloat(manualPrice))} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs">Lançar Avulso</button>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
             <span className="font-black text-slate-900 uppercase">Resumo da Conta</span>
             <button onClick={clear} className="text-rose-600 font-black text-[10px] uppercase border px-3 py-1 rounded-xl">Limpar</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
             {current.items.map((i: any) => (
                <div key={i.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white border rounded-xl p-1">
                         <button onClick={() => modifyQty(i.id, -1)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Minus size={18}/></button>
                         <span className="w-8 text-center font-black">{i.quantity}</span>
                         <button onClick={() => modifyQty(i.id, 1)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><Plus size={18}/></button>
                      </div>
                      <span className="font-bold">{i.name}</span>
                   </div>
                   <span className="font-black text-slate-900">{formatCurrency(i.price * i.quantity)}</span>
                </div>
             ))}
          </div>
          <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total a Pagar</span>
             <span className="text-5xl font-black text-emerald-400">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const VaultSection = ({ entries, range, setRange }: any) => {
  const filtered = entries.filter((e: any) => {
    if (!range.start || !range.end) return true;
    return e.date >= range.start && e.date <= range.end;
  });
  const total = filtered.reduce((acc: any, curr: any) => acc + curr.balance, 0);
  const totalIn = filtered.reduce((acc: any, curr: any) => acc + curr.totalEntry, 0);
  const totalOut = filtered.reduce((acc: any, curr: any) => acc + curr.exit, 0);
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-wrap gap-4 items-end">
        <div><label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Início</label><input type="date" value={range.start} onChange={e => setRange({...range, start: e.target.value})} className="border rounded-xl p-2 bg-slate-50 font-bold" /></div>
        <div><label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Fim</label><input type="date" value={range.end} onChange={e => setRange({...range, end: e.target.value})} className="border rounded-xl p-2 bg-slate-50 font-bold" /></div>
        <button onClick={() => setRange({start:'', end:''})} className="bg-slate-100 px-6 py-2 rounded-xl text-xs font-black text-slate-500 uppercase">Limpar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card label="Entradas" value={totalIn} color="text-emerald-600" />
        <Card label="Saídas" value={totalOut} color="text-rose-600" />
        <Card label="Cofre" value={total} color="text-blue-600" large />
      </div>
    </div>
  );
};

const Card = ({ label, value, color, large }: any) => (
  <div className="bg-white p-8 rounded-3xl border shadow-sm">
    <p className="text-slate-400 text-[10px] font-black mb-2 uppercase">{label}</p>
    <h3 className={`${large ? 'text-4xl' : 'text-2xl'} font-black ${color}`}>{formatCurrency(value)}</h3>
  </div>
);

const BillsSection = ({ bills, setBills }: any) => {
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  const [date, setDate] = useState('');
  const add = () => {
    if (!desc || !val || !date) return;
    setBills([{ id: Date.now().toString(), description: desc, value: Number(val), dueDate: date, paid: false }, ...bills]);
    setDesc(''); setVal('');
  };
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase">Descrição</label><input value={desc} onChange={e => setDesc(e.target.value)} className="w-full border rounded-xl p-3 bg-slate-50 font-bold" /></div>
        <div><label className="text-[10px] font-black text-slate-400 uppercase">Valor R$</label><input type="number" value={val} onChange={e => setVal(e.target.value)} className="w-full border rounded-xl p-3 bg-slate-50 font-bold" /></div>
        <div><label className="text-[10px] font-black text-slate-400 uppercase">Vencimento</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded-xl p-3 bg-slate-50 font-bold" /></div>
        <button onClick={add} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Registrar</button>
      </div>
      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr><th className="p-6 font-black uppercase text-[10px] text-slate-400">Data</th><th className="p-6 font-black uppercase text-[10px] text-slate-400">Conta</th><th className="p-6 font-black uppercase text-[10px] text-slate-400">Valor</th><th className="p-6 font-black uppercase text-[10px] text-slate-400">Ações</th></tr>
          </thead>
          <tbody>
            {bills.map((b: any) => (
              <tr key={b.id} className={`hover:bg-slate-50 ${b.paid ? 'opacity-50' : ''}`}>
                <td className="p-6 font-bold">{formatDate(b.dueDate)}</td><td className="p-6">{b.description}</td><td className="p-6 font-black">{formatCurrency(b.value)}</td>
                <td className="p-6 flex gap-2">
                  <button onClick={() => setBills(bills.map((x: any) => x.id === b.id ? {...x, paid: !x.paid} : x))} className="text-emerald-500"><CheckCircle2/></button>
                  <button onClick={() => setBills(bills.filter((x: any) => x.id !== b.id))} className="text-rose-300"><Trash2/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DebtsSection = ({ debts, setDebts }: any) => {
  const [name, setName] = useState('');
  const [val, setVal] = useState('');
  const [desc, setDesc] = useState('');
  const add = () => {
    if (!name || !val) return;
    setDebts([{ id: Date.now().toString(), clientName: name, value: Number(val), date: new Date().toISOString().split('T')[0], description: desc }, ...debts]);
    setName(''); setVal('');
  };
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Cliente" className="border rounded-xl p-3 bg-slate-50 font-bold" />
        <input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="Valor R$" className="border rounded-xl p-3 bg-slate-50 font-bold" />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="O que levou?" className="border rounded-xl p-3 bg-slate-50 font-bold" />
        <button onClick={add} className="md:col-span-3 bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-xs">Lançar Fiado</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {debts.map((d: any) => (
          <div key={d.id} className="bg-white p-6 rounded-3xl border-l-[12px] border-rose-500 shadow-sm flex justify-between items-center">
            <div><p className="font-black text-xl">{d.clientName}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{formatDate(d.date)} • {d.description}</p></div>
            <div className="flex items-center gap-4"><span className="font-black text-rose-600 text-2xl">{formatCurrency(d.value)}</span><button onClick={() => setDebts(debts.filter((x: any) => x.id !== d.id))} className="text-slate-200 hover:text-rose-500"><Trash2/></button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EnergySection = ({ readings, setReadings }: any) => {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const consumption = (Number(max) || 0) - (Number(min) || 0);
  return (
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] border shadow-xl space-y-8">
      <h3 className="font-black text-3xl text-slate-900 flex items-center gap-3"><Zap className="text-amber-500"/> Energia</h3>
      <div className="grid grid-cols-2 gap-6">
         <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Leitura Anterior</label><input type="number" value={min} onChange={e => setMin(e.target.value)} className="w-full border rounded-2xl p-4 bg-slate-50 font-black text-2xl" /></div>
         <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Leitura Atual</label><input type="number" value={max} onChange={e => setMax(e.target.value)} className="w-full border rounded-2xl p-4 bg-slate-50 font-black text-2xl" /></div>
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl text-center"><p className="text-[10px] text-slate-500 font-black uppercase mb-2">Consumo Total</p><p className="text-4xl font-black text-white">{consumption.toFixed(2)} kWh</p></div>
    </div>
  );
};

const ScaleCard = ({ id }: { id: number }) => {
  const [kgPrice, setKgPrice] = useState('');
  const [weight, setWeight] = useState('');
  const total = (Number(kgPrice) || 0) * (Number(weight) || 0);
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border-4 border-slate-900 shadow-xl space-y-4 relative overflow-hidden group">
      <div className="bg-slate-900 -mx-6 -mt-6 p-4 text-center mb-6 text-emerald-400 font-mono text-xl font-black uppercase">Balcão 0{id}</div>
      <div className="space-y-4">
        <div><label className="block text-[8px] font-black text-slate-400 mb-1 uppercase">Preço Kg R$</label><input type="number" value={kgPrice} onChange={e => setKgPrice(e.target.value)} className="w-full border rounded-2xl p-3 text-2xl font-black bg-slate-50" placeholder="0,00" /></div>
        <div><label className="block text-[8px] font-black text-slate-400 mb-1 uppercase">Peso Kg</label><input type="number" step="0.001" value={weight} onChange={e => setWeight(e.target.value)} className="w-full border rounded-2xl p-3 text-2xl font-black bg-slate-50" placeholder="0.000" /></div>
      </div>
      <div className="bg-emerald-500 p-6 rounded-3xl text-center text-white"><p className="text-[8px] font-black uppercase opacity-60">Total Item</p><p className="text-4xl font-black">{formatCurrency(total)}</p></div>
    </div>
  );
};

const ScaleSection = () => (
  <div className="space-y-8 animate-fadeIn">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><ScaleCard id={1} /><ScaleCard id={2} /><ScaleCard id={3} /><ScaleCard id={4} /></div>
  </div>
);

export default App;
