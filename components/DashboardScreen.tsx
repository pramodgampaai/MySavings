import React, { useMemo } from 'react';
import { Investment } from '../types';
import { ChartBarIcon, ChevronRightIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

interface DashboardScreenProps {
  investments: Investment[];
  totalIncome: number;
  currency: string;
  onViewPerformance: () => void;
}


const DashboardScreen: React.FC<DashboardScreenProps> = ({ investments, totalIncome, currency, onViewPerformance }) => {
  const { totalMarketValue, totalBookValue } = useMemo(() => {
    let marketValue = 0;
    let bookValue = 0;

    investments.forEach(inv => {
        const investmentBookValue = inv.history.reduce((sum, p) => sum + p.contribution, 0);
        bookValue += investmentBookValue;

        if (inv.history.length === 0) {
            return;
        }

        const sortedHistory = [...inv.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let investmentMarketValue = 0;
        let lastValueUpdateIndex = -1;
        for (let i = sortedHistory.length - 1; i >= 0; i--) {
            if (sortedHistory[i].note === "Value Update") {
                lastValueUpdateIndex = i;
                break;
            }
        }

        if (lastValueUpdateIndex !== -1) {
            const lastMarketValuePoint = sortedHistory[lastValueUpdateIndex].value;
            const subsequentContributions = sortedHistory
                .slice(lastValueUpdateIndex + 1)
                .reduce((sum, p) => sum + p.contribution, 0);
            investmentMarketValue = lastMarketValuePoint + subsequentContributions;
        } else {
            investmentMarketValue = investmentBookValue;
        }
        marketValue += investmentMarketValue;
    });

    return { totalMarketValue: marketValue, totalBookValue: bookValue };
  }, [investments]);

  const overallPNL = totalMarketValue - totalBookValue;
  const overallPNLPercent = totalBookValue !== 0 ? (overallPNL / totalBookValue) * 100 : 0;


  return (
    <div className="p-4 md:p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your financial overview.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl">
              <h2 className="text-base font-medium text-gray-400">Total Income</h2>
              <p className="mt-1 text-2xl font-semibold text-green-400">{formatCurrency(totalIncome, currency)}</p>
          </div>
          <div className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl">
              <h2 className="text-base font-medium text-gray-400">Total Invested</h2>
              <p className="mt-1 text-2xl font-semibold text-gray-300">{formatCurrency(totalBookValue, currency)}</p>
          </div>
          <div className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl">
              <h2 className="text-base font-medium text-gray-400">Total Market Value</h2>
              <p className="mt-1 text-2xl font-semibold text-blue-400">{formatCurrency(totalMarketValue, currency)}</p>
          </div>
          <div className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl">
              <h2 className="text-base font-medium text-gray-400">Overall P/L</h2>
              <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-2xl font-semibold ${overallPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {overallPNL >= 0 ? '+' : ''}{formatCurrency(overallPNL, currency)}
                  </p>
                  {totalBookValue !== 0 && (
                      <span className={`text-sm font-medium ${overallPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ({overallPNLPercent.toFixed(2)}%)
                      </span>
                  )}
              </div>
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

export default DashboardScreen;