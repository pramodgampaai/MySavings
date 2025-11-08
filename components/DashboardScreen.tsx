import React, { useState, useMemo, useEffect } from 'react';
import { Investment, InvestmentHistoryPoint } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { NoDataIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

interface InvestmentItemProps {
    investment: Investment;
    // FIX: Changed Omit<InvestmentHistoryPoint, 'id'>> to InvestmentHistoryPoint to match the actual type.
    addInvestmentHistoryPoint: (investmentId: string, historyPoint: InvestmentHistoryPoint) => void;
    currency: string;
}

const InvestmentItem: React.FC<InvestmentItemProps> = ({ investment, addInvestmentHistoryPoint, currency }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [value, setValue] = useState('');
    const date = new Date().toISOString().split('T')[0];

    const latestHistoryPoint = investment.history.length > 0 ? investment.history[investment.history.length - 1] : { value: 0 };
    const totalContributions = useMemo(() => investment.history.reduce((sum, h) => sum + h.contribution, 0), [investment.history]);
    const profitLoss = latestHistoryPoint.value - totalContributions;

    const handleAddUpdate = () => {
        if (!value) {
            alert('Please provide a valid market value.');
            return;
        }
        
        addInvestmentHistoryPoint(investment.id, { 
            value: parseFloat(value), 
            contribution: 0,
            date,
            note: "Value Update"
        });
        setValue('');
        setIsAdding(false);
    };

    return (
        <div className="bg-gray-900 border border-white/10 p-4 rounded-xl mb-4 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-gray-200">{investment.name}</h3>
                    <p className="text-2xl font-bold text-indigo-400">{formatCurrency(latestHistoryPoint.value, currency)}</p>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-sm font-semibold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                           {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss, currency)}
                        </p>
                        <p className="text-xs text-gray-500">
                           Total P/L
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)} 
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isAdding ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300'}`}
                >
                    {isAdding ? 'Cancel' : 'Log Market Value'}
                </button>
            </div>
            {isAdding && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                    <h4 className="font-medium text-base text-gray-200">Log Current Market Value</h4>
                    <p className="text-xs text-gray-500 -mt-3 mb-2">
                        Log the investment's current market value to track its performance. The date is automatically set to today.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Date of Value</label>
                        <div className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-base text-gray-400">
                           {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    <div>
                        <label htmlFor={`value-${investment.id}`} className="block text-sm font-medium text-gray-400 mb-1">Current Market Value</label>
                        <input
                            id={`value-${investment.id}`}
                            type="number"
                            placeholder="0.00"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-base text-white"
                        />
                    </div>
                    <button onClick={handleAddUpdate} className="w-full text-sm py-2 px-4 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105">
                        Save Market Value
                    </button>
                </div>
            )}
        </div>
    );
};


interface DashboardScreenProps {
  investments: Investment[];
  totalEarnings: number;
  addInvestmentHistoryPoint: (investmentId: string, historyPoint: InvestmentHistoryPoint) => void;
  currency: string;
}

// Custom Dot for events
const EventDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    let color = 'transparent';
    if (payload.type === 'contribution') color = '#34d399'; // green
    if (payload.type === 'profit') color = '#facc15'; // yellow
    if (payload.type === 'loss') color = '#f87171'; // red

    if (color === 'transparent') return null;

    // Render a styled dot
    return (
        <svg x={cx - 8} y={cy - 8} width={16} height={16} fill={color} viewBox="0 0 1024 1024">
            <circle cx="512" cy="512" r="512" fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="50" />
        </svg>
    );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm border border-white/10 p-3 rounded-lg shadow-lg">
                <p className="text-sm text-gray-400">{label}</p>
                {data.marketValue !== undefined && <p className="text-base text-indigo-300">{`Market Value: ${formatCurrency(data.marketValue, currency)}`}</p>}
                {data.bookValue !== undefined && <p className="text-base text-green-300">{`Book Value: ${formatCurrency(data.bookValue, currency)}`}</p>}
                {data.note && data.type && (
                    <p className={`text-sm mt-1 font-semibold ${
                        data.type === 'contribution' ? 'text-green-400' :
                        data.type === 'profit' ? 'text-yellow-400' :
                        data.type === 'loss' ? 'text-red-400' : 'text-gray-400'
                    }`}>{data.note}</p>
                )}
            </div>
        );
    }
    return null;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ investments, totalEarnings, addInvestmentHistoryPoint, currency }) => {
  // State to store the user's explicit selection from the dropdown.
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

  // Derives the actual ID to be displayed. This is the core of the fix.
  // This logic is resilient to the investments list changing.
  const selectedInvestmentId = useMemo(() => {
    if (investments.length === 0) {
      return null; // No investments, nothing to select.
    }
    // Check if the user's last selection is still valid in the current list.
    const userSelectionIsValid = investments.some(inv => inv.id === userSelectedId);
    if (userSelectionIsValid) {
      return userSelectedId; // If it is, respect the user's choice.
    }
    // If the user hasn't chosen, or their choice was deleted, default to the first item.
    return investments[0].id;
  }, [investments, userSelectedId]);

  // Find the full investment object based on the safely derived ID.
  const selectedInvestment = useMemo(() => {
    if (!selectedInvestmentId) return null;
    return investments.find(inv => inv.id === selectedInvestmentId) ?? null;
  }, [investments, selectedInvestmentId]);


  const totalCurrentValue = useMemo(() => {
    return investments.reduce((total, inv) => {
        const latestValue = inv.history.length > 0 ? inv.history[inv.history.length - 1].value : 0;
        return total + latestValue;
    }, 0);
  }, [investments]);
  
  const chartData = useMemo(() => {
    if (!selectedInvestment) return [];
    
    const sortedHistory = [...selectedInvestment.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulativeContribution = 0;
    return sortedHistory.map(point => {
        cumulativeContribution += point.contribution;
        
        const isUserProvidedValue = 
            point.note === "Initial Investment" ||
            point.note === "Value Update" ||
            point.note === "Value Update & Funds Added";
        
        let eventType = null;
        if (point.note === "Funds Added" || (point.note === "Value Update & Funds Added" && point.contribution > 0)) eventType = 'contribution';
        if (point.note === "Profit Booked") eventType = 'profit';
        if (point.note === "Loss Booked") eventType = 'loss';

        return {
            date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            marketValue: isUserProvidedValue ? point.value : undefined,
            bookValue: cumulativeContribution,
            note: point.note,
            type: eventType,
        };
    });

  }, [selectedInvestment]);

  return (
    <div className="p-4 md:p-6 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your financial overview.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-2xl">
              <h2 className="text-sm font-medium text-gray-400">Total Earnings</h2>
              <p className="text-4xl font-semibold text-green-400 mt-2">{formatCurrency(totalEarnings, currency)}</p>
          </div>
          <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-2xl">
              <h2 className="text-sm font-medium text-gray-400">Total Invested Value</h2>
              <p className="text-4xl font-semibold text-blue-400 mt-2">{formatCurrency(totalCurrentValue, currency)}</p>
          </div>
      </div>

      <div className="bg-gray-900 border border-white/10 p-4 md:p-6 rounded-xl shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Investment Performance</h2>
          {investments.length > 0 && selectedInvestment ? (
            <>
              <select 
                value={selectedInvestmentId ?? ''} 
                onChange={e => setUserSelectedId(e.target.value)}
                className="mb-4 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 text-base"
                >
                {investments.map(inv => <option className="bg-gray-800 text-white" key={inv.id} value={inv.id}>{inv.name}</option>)}
              </select>
              <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                          <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => formatCurrency(value as number, currency)} domain={['dataMin - 100', 'auto']}/>
                          <Tooltip content={<CustomTooltip currency={currency} />} />
                          <Legend wrapperStyle={{ color: '#9ca3af' }} />
                          <Area 
                            connectNulls={false} 
                            type="monotone" 
                            dataKey="marketValue" 
                            name="Market Value" 
                            stroke="#818cf8" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            dot={<EventDot />}
                            activeDot={{ r: 8, stroke: '#a78bfa', strokeWidth: 2 }}
                           />
                           <Line
                            type="monotone"
                            dataKey="bookValue"
                            name="Book Value"
                            stroke="#34d399"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={false}
                           />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                <NoDataIcon className="w-16 h-16 text-gray-600 mb-4"/>
                <p>Add an investment to see its performance chart.</p>
            </div>
          )}
      </div>

      <div>
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Your Investments</h2>
          {investments.length > 0 ? (
              investments.map(inv => (
                  <InvestmentItem key={inv.id} investment={inv} addInvestmentHistoryPoint={addInvestmentHistoryPoint} currency={currency} />
              ))
          ) : (
            <div className="text-center bg-gray-900 border border-white/10 p-8 rounded-xl shadow-2xl flex flex-col items-center">
                <NoDataIcon className="w-16 h-16 text-gray-600 mb-4"/>
                <p className="text-gray-500">You haven't added any investments yet.</p>
                <p className="text-gray-400 text-sm mt-2">Go to the Investments tab to get started.</p>
            </div>
          )}
      </div>
    </div>
  );
};