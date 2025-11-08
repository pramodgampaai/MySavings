import React, { useState, useMemo } from 'react';
import { Investment, InvestmentHistoryPoint } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { NoDataIcon, ChevronLeftIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm border border-white/10 p-3 rounded-lg shadow-lg">
                <p className="text-sm text-gray-400">{label}</p>
                {data.marketValue !== undefined && <p className="text-base text-indigo-300">{`Market Value: ${formatCurrency(data.marketValue, currency)}`}</p>}
                {data.bookValue !== undefined && <p className="text-base text-green-300">{`Book Value: ${formatCurrency(data.bookValue, currency)}`}</p>}
            </div>
        );
    }
    return null;
};


interface InvestmentPerformanceScreenProps {
  investments: Investment[];
  currency: string;
  onBack: () => void;
}

const InvestmentPerformanceScreen: React.FC<InvestmentPerformanceScreenProps> = ({ investments, currency, onBack }) => {
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>('');

  const chartData = useMemo(() => {
    if (!selectedInvestmentId) {
        return null;
    }

    if (selectedInvestmentId === '__all__') {
        if (investments.length === 0) return [];

        const allHistoryPoints = investments.flatMap(inv => inv.history);
        if (allHistoryPoints.length === 0) return [];
        
        const uniqueDates = [...new Set(allHistoryPoints.map(p => p.date))]
            .sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());

        const aggregatedData = uniqueDates.map((date: string) => {
            let totalMarketValue = 0;
            let totalBookValue = 0;

            investments.forEach(inv => {
                const relevantHistory = inv.history
                    .filter(p => new Date(p.date).getTime() <= new Date(date).getTime())
                    .sort((a: InvestmentHistoryPoint, b: InvestmentHistoryPoint) => new Date(a.date).getTime() - new Date(b.date).getTime());

                if (relevantHistory.length > 0) {
                    const lastPoint = relevantHistory[relevantHistory.length - 1];
                    // This logic for "all" is a simplified aggregation and may not be perfect,
                    // but the single investment logic is now the priority fix.
                    totalMarketValue += lastPoint.value; 
                    totalBookValue += relevantHistory.reduce((sum, p) => sum + p.contribution, 0);
                }
            });

            return {
                date: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                marketValue: totalMarketValue,
                bookValue: totalBookValue,
            };
        });
        return aggregatedData;
    } 
    
    // --- START: Rewritten logic for single investment ---
    const investment = investments.find(inv => inv.id === selectedInvestmentId);
    if (!investment || !investment.history || investment.history.length === 0) return [];

    // Group transactions by date to handle multiple entries on the same day robustly.
    const historyByDate = new Map<string, InvestmentHistoryPoint[]>();
    [...investment.history].forEach(point => {
        if (!historyByDate.has(point.date)) {
            historyByDate.set(point.date, []);
        }
        historyByDate.get(point.date)!.push(point);
    });

    const dataPoints: { date: string, marketValue: number, bookValue: number, note: string }[] = [];
    let lastMarketValue = 0;
    let cumulativeBookValue = 0;

    const sortedDates = Array.from(historyByDate.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    for (const date of sortedDates) {
        const dayTransactions = historyByDate.get(date)!;
        
        // End-of-day book value is simple: previous day's book value + today's contributions.
        const dayContributions = dayTransactions.reduce((sum, p) => sum + (p.contribution || 0), 0);
        const EOD_BookValue = cumulativeBookValue + dayContributions;

        // For market value, check if there's an explicit 'Value Update' today.
        const valueUpdates = dayTransactions.filter(p => p.note === 'Value Update');
        let EOD_MarketValue;

        if (valueUpdates.length > 0) {
            // If there are value updates, the last one on that day sets the End Of Day market value.
            // This value is considered the ground truth for that day, inclusive of any same-day contributions.
            const lastValueUpdate = valueUpdates[valueUpdates.length - 1];
            EOD_MarketValue = lastValueUpdate.value || 0;
        } else {
            // No value update today, so market value is assumed to change by the sum of contributions from the previous day's value.
            EOD_MarketValue = lastMarketValue + dayContributions;
        }

        const dayNoteString = dayTransactions.map(p => p.note).filter(Boolean).join(', ');

        dataPoints.push({
            date: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            marketValue: EOD_MarketValue,
            bookValue: EOD_BookValue,
            note: dayNoteString,
        });
        
        // Update trackers for the next day's calculation.
        lastMarketValue = EOD_MarketValue;
        cumulativeBookValue = EOD_BookValue;
    }
    return dataPoints;
    // --- END: Rewritten logic for single investment ---

  }, [investments, selectedInvestmentId]);

  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 mr-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-100">Investment Performance</h1>
        </div>
      
        <div className="bg-gray-900 border border-white/10 p-4 md:p-6 rounded-xl shadow-2xl">
            {investments.length > 0 ? (
            <>
                <label htmlFor="investment-select" className="block text-sm font-medium text-gray-400 mb-2">Select a view:</label>
                <select 
                    id="investment-select"
                    value={selectedInvestmentId} 
                    onChange={e => setSelectedInvestmentId(e.target.value)}
                    className="mb-4 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 text-base truncate"
                >
                    <option value="" disabled>-- Select a View --</option>
                    <option value="__all__">All Investments</option>
                    {investments.map(inv => <option className="bg-gray-800 text-white" key={inv.id} value={inv.id}>{inv.name}</option>)}
                </select>
                
                {!selectedInvestmentId ? (
                     <div className="text-center text-gray-500 py-8 h-[300px] flex flex-col items-center justify-center">
                        <p>Please select a view to display the performance chart.</p>
                    </div>
                ) : chartData && chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 10 }}>
                                <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                <YAxis 
                                    stroke="#9ca3af" 
                                    fontSize={12} 
                                    tickFormatter={(value) => formatCurrency(value as number, currency)} 
                                    domain={[
                                        'auto', 
                                        (dataMax) => {
                                            if (typeof dataMax !== 'number' || !isFinite(dataMax)) return 1000;
                                            if (dataMax === 0) return 100;
                                            return Math.ceil(dataMax * 1.05);
                                        }
                                    ]}
                                    allowDataOverflow={true}
                                />
                                <Tooltip content={<CustomTooltip currency={currency} />} />
                                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="marketValue" 
                                    name="Market Value" 
                                    stroke="#818cf8" 
                                    strokeWidth={2} 
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                    dot={false}
                                    activeDot={{ r: 6, stroke: '#a78bfa', strokeWidth: 2 }}
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
                ) : (
                    <div className="text-center text-gray-500 py-8 h-[300px] flex flex-col items-center justify-center">
                        <p>{selectedInvestmentId === '__all__' ? 'No data available to display portfolio performance.' : 'This investment has no history to display.'}</p>
                    </div>
                )}
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

export default InvestmentPerformanceScreen;
