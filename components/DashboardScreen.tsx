import React, { useState, useMemo } from 'react';
import { Investment, InvestmentHistoryPoint } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { NoDataIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

interface DashboardScreenProps {
  investments: Investment[];
  totalEarnings: number;
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

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ investments, totalEarnings, currency }) => {
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

  const selectedInvestmentId = useMemo(() => {
    if (investments.length === 0) {
      return null;
    }
    const userSelectionIsValid = investments.some(inv => inv.id === userSelectedId);
    if (userSelectionIsValid) {
      return userSelectedId;
    }
    return investments[0].id;
  }, [investments, userSelectedId]);

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

      <div className="bg-gray-900 border border-white/10 p-4 md:p-6 rounded-xl shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Investment Performance</h2>
          {investments.length > 0 && selectedInvestment ? (
            <>
              <select 
                value={selectedInvestmentId ?? ''} 
                onChange={e => setUserSelectedId(e.target.value)}
                className="mb-4 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 text-base"
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
    </div>
  );
};