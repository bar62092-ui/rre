import { FinancialEntry, CalculatedEntry, Bill, DebtNote, EnergyReading, Comanda, ProductBudget } from '../types';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const COLLECTION = "fintrak_data";
const DOCUMENT = "main";

const getDocRef = () => doc(db, COLLECTION, DOCUMENT);

const getAllData = async () => {
  const snapshot = await getDoc(getDocRef());
  return snapshot.exists() ? snapshot.data() : {};
};

const setAllData = async (data: any) => {
  await setDoc(getDocRef(), data, { merge: true });
};

export const calculateEntry = (entry: FinancialEntry): CalculatedEntry => {
  const totalEntry = (entry.cashIn || 0) + (entry.pixIn || 0) + (entry.cardIn || 0);
  const balance = totalEntry - (entry.exit || 0);
  const markup = balance * (entry.percentage || 0);
  return { ...entry, totalEntry, balance, markup, };
};

// ENTRIES
export const saveEntries = async (entries: FinancialEntry[]) => {
  await setAllData({ entries });
};

export const loadEntries = async (): Promise<FinancialEntry[]> => {
  const data = await getAllData();
  return data.entries || [];
};

export const getCalculatedEntries = async (): Promise<CalculatedEntry[]> => {
  const entries = await loadEntries();
  return entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(calculateEntry);
};

// BILLS
export const saveBills = async (bills: Bill[]) => {
  await setAllData({ bills });
};

export const loadBills = async (): Promise<Bill[]> => {
  const data = await getAllData();
  return data.bills || [];
};

// DEBTS
export const saveDebts = async (debts: DebtNote[]) => {
  await setAllData({ debts });
};

export const loadDebts = async (): Promise<DebtNote[]> => {
  const data = await getAllData();
  return data.debts || [];
};

// ENERGY
export const saveEnergy = async (readings: EnergyReading[]) => {
  await setAllData({ energy: readings });
};

export const loadEnergy = async (): Promise<EnergyReading[]> => {
  const data = await getAllData();
  return data.energy || [];
};

// BUDGETS
export const saveBudgets = async (budgets: ProductBudget[]) => {
  await setAllData({ budgets });
};

export const loadBudgets = async (): Promise<ProductBudget[]> => {
  const data = await getAllData();
  return data.budgets || [];
};

// COMANDAS
export const saveComandas = async (comandas: Comanda[]) => {
  await setAllData({ comandas });
};

export const loadComandas = async (): Promise<Comanda[]> => {
  const data = await getAllData();
  if (data.comandas) return data.comandas;

  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    clientName: '',
    items: []
  }));
};