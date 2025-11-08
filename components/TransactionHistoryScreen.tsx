import React, { useState, useMemo } from 'react';
import { Investment, InvestmentHistoryPoint } from '../types';
import { ChevronLeftIcon, FunnelIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

interface TransactionHistoryScreenProps {
  investment: Investment;
  currency: string;
  onBack: () => void;
}

type FilterType = 'all' | 'contributions' | 'withdrawals' | 'marketValue';

const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({ investment, currency, onBack }) => {
  const [filter, setFilter] = useState<FilterType>('contributions');
  
  const sortedAndFilteredHistory = useMemo(() => {
    const sorted = [...investment.history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filter === 'all') {
      return sorted;
    }
    if (filter === 'contributions') {
      // Exclude pure value updates from the contributions filter
      return sorted.filter(h => h.contribution >= 0 && h.note !== 'Value Update');
    }
    if (filter === 'withdrawals') {
      return sorted.filter(h => h.contribution < 0);
    }
    if (filter === 'marketValue') {
      return sorted.filter(h => h.note === 'Value Update');
    }
    return [];
  }, [investment.history, filter]);

  const getTransactionColor = (historyPoint: InvestmentHistoryPoint) => {
    if (historyPoint.note === 'Profit Booked') {
        return 'text-yellow-400';
    }
    if (historyPoint.contribution >= 0) {
        return 'text-green-400';
    }
    return 'text-red-400';
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 mr-2 -ml-2 text-gray-400 hover:text-white transition-colors">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Transaction History</h1>
          <p className="text-sm text-gray-400 truncate">{investment.name}</p>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="filter-select" className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            Filter by type:
        </label>
        <select
            id="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 text-base"
        >
            <option value="all">All Transactions</option>
            <option value="contributions">Contributions</option>
            <option value="withdrawals">Withdrawals</option>
            <option value="marketValue">Market Value</option>
        </select>
      </div>

      <div className="space-y-4">
        {sortedAndFilteredHistory.map((h, index) => (
          <div key={`${h.date}-${index}`} className="bg-gray-900 border border-white/10 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-200">{h.note || 'Transaction'}</p>
              <p className="text-sm text-gray-400">{new Date(`${h.date}T00:00:00`).toLocaleDateString()}</p>
            </div>
            {h.note === 'Value Update' ? (
                 <p className="text-lg font-semibold text-blue-400">{formatCurrency(h.value, currency)}</p>
            ) : (
                <p className={`text-lg font-semibold ${getTransactionColor(h)}`}>
                    {h.contribution > 0 ? '+' : ''}{formatCurrency(h.contribution, currency)}
                </p>
            )}
          </div>
        ))}
        {sortedAndFilteredHistory.length === 0 && (
          <div className="text-center text-gray-500 py-8 bg-gray-900 border border-white/10 rounded-xl">
            <p>No transactions match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryScreen;
