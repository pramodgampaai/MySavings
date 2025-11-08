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

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({ investment, currency, onBack }) => {
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
    <div className="p-4 md:p-6 min-h-screen">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 mr-2 -ml-2 text-gray-400 hover:text-white transition-colors">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Transaction History</h1>
          <p className="text-gray-400">{investment.name}</p>
        </div>
      </div>
      
      <div className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
            <label htmlFor="filter-select" className="flex items-center text-sm text-gray-400">
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filter by:
            </label>
            <select
                id="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-base focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="contributions">Contributions</option>
                <option value="withdrawals">Withdrawals</option>
                <option value="marketValue">Market Value</option>
                <option value="all">All Transactions</option>
            </select>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
            {sortedAndFilteredHistory.length > 0 ? (
                sortedAndFilteredHistory.map((historyPoint, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-800/50 p-3 rounded-md">
                        <div>
                            <p className="text-gray-300">{new Date(historyPoint.date).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{historyPoint.note || (historyPoint.contribution >= 0 ? 'Funds Added' : 'Withdrawal')}</p>
                        </div>
                        
                        {historyPoint.note === 'Value Update' ? (
                            <div className="text-right">
                                <span className="font-semibold text-blue-400">
                                    {formatCurrency(historyPoint.value, currency)}
                                </span>
                                <p className="text-xs text-gray-500 -mt-1">Market Value</p>
                            </div>
                        ) : (
                            <span className={`font-semibold ${getTransactionColor(historyPoint)}`}>
                                {historyPoint.contribution > 0 ? '+' : ''}{formatCurrency(historyPoint.contribution, currency)}
                            </span>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-sm text-center text-gray-500 py-8">No transactions found for this filter.</p>
            )}
        </div>
      </div>
    </div>
  );
};