import React, { useState, useEffect } from 'react';
import { Income } from '../types';
import { DateInput } from './DateInput';

interface AddIncomeScreenProps {
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (income: Income) => void;
  incomeToEdit: Income | null;
  onCancel: () => void;
  incomeSources: string[];
}

const AddIncomeScreen: React.FC<AddIncomeScreenProps> = ({ addIncome, updateIncome, incomeToEdit, onCancel, incomeSources }) => {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (incomeToEdit) {
      setSource(incomeToEdit.source);
      setAmount(String(incomeToEdit.amount));
      setDate(incomeToEdit.date);
    } else {
      setSource(incomeSources.length > 0 ? incomeSources[0] : '');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [incomeToEdit, incomeSources]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || !date || parseFloat(amount) <= 0) {
      alert('Please fill all fields correctly. Amount must be positive.');
      return;
    }

    const incomeData = {
      source,
      amount: parseFloat(amount),
      date,
    };

    if (incomeToEdit) {
      updateIncome({ ...incomeData, id: incomeToEdit.id });
    } else {
      addIncome(incomeData);
    }
  };

  const baseInputClasses = 'mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-left';

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-100 mb-8">{incomeToEdit ? 'Edit Income' : 'Add New Income'}</h1>
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-2xl space-y-6">
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-400 mb-1">Income Source</label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={`${baseInputClasses} text-white`}
          >
            {incomeSources.map(s => <option key={s} value={s}>{s}</option>)}
            {incomeSources.length === 0 && <option value="">No sources defined</option>}
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`${baseInputClasses} text-white`}
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">Date</label>
          <DateInput 
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
            <button
            type="button"
            onClick={onCancel}
            className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-lg shadow-lg text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-all"
            >
            Cancel
            </button>
            <button
            type="submit"
            disabled={!source.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {incomeToEdit ? 'Update Income' : 'Save Income'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddIncomeScreen;