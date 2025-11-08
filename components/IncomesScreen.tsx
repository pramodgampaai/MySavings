import React from 'react';
import { Income } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

interface IncomeScreenProps {
  incomes: Income[];
  deleteIncome: (id: string) => void;
  currency: string;
  onAddIncome: () => void;
  onEditIncome: (income: Income) => void;
}

const IncomeScreen: React.FC<IncomeScreenProps> = ({ incomes, deleteIncome, currency, onAddIncome, onEditIncome }) => {
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this income record?')) {
            deleteIncome(id);
        }
    }

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-100">Your Income</h1>
                <button
                    onClick={onAddIncome}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Income</span>
                </button>
            </div>

            <div className="space-y-4">
                {incomes.map(income => (
                    <div key={income.id} className="bg-gray-900 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-200">{income.source}</p>
                            <p className="text-sm text-gray-400">{new Date(income.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-lg font-semibold text-green-400">{formatCurrency(income.amount, currency)}</p>
                            <button onClick={() => onEditIncome(income)} className="p-2 text-gray-400 hover:text-indigo-400 transition-colors">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(income.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {incomes.length === 0 && (
                    <div className="text-center text-gray-500 py-8 bg-gray-900 border border-white/10 rounded-xl">
                        <p>No income recorded yet.</p>
                        <p className="text-sm mt-2">Click 'Add Income' to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncomeScreen;