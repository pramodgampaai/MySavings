import React from 'react';
import { Earning } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

interface EarningsScreenProps {
  earnings: Earning[];
  deleteEarning: (id: string) => void;
  currency: string;
  onAddEarning: () => void;
  onEditEarning: (earning: Earning) => void;
}

export const EarningsScreen: React.FC<EarningsScreenProps> = ({ earnings, deleteEarning, currency, onAddEarning, onEditEarning }) => {
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this earning?')) {
            deleteEarning(id);
        }
    }

    return (
        <div className="p-4 md:p-6 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-100">Your Earnings</h1>
                <button
                    onClick={onAddEarning}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Earning</span>
                </button>
            </div>

            <div className="space-y-4">
                {earnings.map(earning => (
                    <div key={earning.id} className="bg-gray-900 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-200">{earning.source}</p>
                            <p className="text-sm text-gray-400">{new Date(earning.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-lg font-semibold text-green-400">{formatCurrency(earning.amount, currency)}</p>
                            <button onClick={() => onEditEarning(earning)} className="p-2 text-gray-400 hover:text-indigo-400 transition-colors">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(earning.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {earnings.length === 0 && (
                    <div className="text-center text-gray-500 py-8 bg-gray-900 border border-white/10 rounded-xl">
                        <p>No earnings recorded yet.</p>
                        <p className="text-sm mt-2">Click 'Add Earning' to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};