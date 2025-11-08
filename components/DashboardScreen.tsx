import React, { useMemo } from 'react';
import { Investment } from '../types';
import { ChartBarIcon, ChevronRightIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

interface DashboardScreenProps {
  investments: Investment[];
  totalEarnings: number;
  currency: string;
  onViewPerformance: () => void;
}


export const DashboardScreen: React.FC<DashboardScreenProps> = ({ investments, totalEarnings, currency, onViewPerformance }) => {
  const totalCurrentValue = useMemo(() => {
    return investments.reduce((total, inv) => {
        const latestValue = inv.history.length > 0 ? inv.history[inv.history.length - 1].value : 0;
        return total + latestValue;
    }, 0);
  }, [investments]);


  return (
    <div className="p-4 md:p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your financial overview.</p>
      </header>
      
      <div className="space-y-4">
          <div className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl">
              <h2 className="text-base font-medium text-gray-400">Total Earnings</h2>
              <p className="mt-1 text-2xl font-semibold text-green-400">{formatCurrency(totalEarnings, currency)}</p>
          </div>
          <div className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl">
              <h2 className="text-base font-medium text-gray-400">Total Invested Value</h2>
              <p className="mt-1 text-2xl font-semibold text-blue-400">{formatCurrency(totalCurrentValue, currency)}</p>
          </div>
      </div>

       <button
          onClick={onViewPerformance}
          className="w-full flex items-center text-left bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl transition-all duration-300 hover:bg-gray-800/50 hover:border-indigo-500/50"
      >
          <div className="p-3 bg-indigo-500/10 rounded-lg mr-4">
              <ChartBarIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-grow">
              <h2 className="text-lg font-semibold text-gray-200">Investment Performance</h2>
              <p className="text-sm text-gray-400">View detailed charts and analysis</p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-500" />
      </button>

    </div>
  );
};