
export interface FinancialEntry {
  id: string;
  date: string;
  cashIn: number;
  pixIn: number;
  cardIn: number;
  exit: number;
  percentage: number;
}

export interface CalculatedEntry extends FinancialEntry {
  totalEntry: number;
  balance: number;
  markup: number;
}

export interface ProductBudget {
  id: string;
  name: string;
  cost: number;
  price: number;
  profit: number;
  marginPercent: number;
}

export interface Bill {
  id: string;
  description: string;
  value: number;
  dueDate: string;
  paid: boolean;
}

export interface DebtNote {
  id: string;
  clientName: string;
  value: number;
  date: string;
  description: string;
}

export interface EnergyReading {
  id: string;
  minReading: number;
  maxReading: number;
  factor: number;
  startDate: string;
  endDate: string;
}

export interface ComandaItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Comanda {
  id: number;
  clientName: string;
  items: ComandaItem[];
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  ADD = 'ADD',
  VAULT = 'VAULT',
  BILLS = 'BILLS',
  BUDGET = 'BUDGET',
  ORDER = 'ORDER',
  DEBTS = 'DEBTS',
  ENERGY = 'ENERGY',
  SCALE = 'SCALE'
}
