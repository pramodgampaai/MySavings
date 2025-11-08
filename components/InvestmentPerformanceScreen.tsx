import React, { useState, useMemo } from 'react';
import { Investment } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { NoDataIcon, ChevronLeftIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

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

interface InvestmentPerformanceScreenProps {
  investments: Investment[];
  currency: string;
  onBack: () => void;
}

export const InvestmentPerformanceScreen: React.FC<InvestmentPerformanceScreenProps> = ({ investments, currency, onBack }) => {
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);

  const selectedInvestment = useMemo(() => {
    if (!selectedInvestmentId) return null;
    return investments.find(inv => inv.id === selectedInvestmentId) ?? null;
  }, [investments, selectedInvestmentId]);
  
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
                <label htmlFor="investment-select" className="block text-sm font-medium text-gray-400 mb-2">Select an investment to view its performance:</label>
                <select 
                    id="investment-select"
                    value={selectedInvestmentId ?? ''} 
                    onChange={e => setSelectedInvestmentId(e.target.value || null)}
                    className="mb-4 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 text-base truncate"
                >
                    <option value="">Select an Investment</option>
                    {investments.map(inv => <option className="bg-gray-800 text-white" key={inv.id} value={inv.id}>{inv.name}</option>)}
                </select>
                
                {selectedInvestment ? (
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
                                        'dataMin - 100', 
                                        (dataMax) => {
                                            if (typeof dataMax !== 'number' || !isFinite(dataMax)) return 1000;
                                            if (dataMax === 0) return 100;
                                            return Math.ceil(dataMax * 1.1);
                                        }
                                    ]}
                                />
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
                ) : (
                    <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                        <p>Please select an investment from the dropdown to see its chart.</p>
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