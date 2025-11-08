export interface Earning {
  id: string;
  source: string;
  amount: number;
  date: string;
}

export interface InvestmentHistoryPoint {
  date: string;
  value: number; // Total value of the investment on this date
  contribution: number; // New money added on this date (can be 0, or negative for withdrawals)
  note?: string; // Optional note for the transaction type
}

export interface Investment {
  id: string;
  name: string;
  history: InvestmentHistoryPoint[];
}

export type Screen = 'dashboard' | 'earnings' | 'addEarning' | 'investments' | 'addInvestment' | 'settings' | 'currencySettings' | 'earningSourcesSettings' | 'transactionHistory';