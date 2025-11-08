import React, { useState, useEffect } from 'react';
import { Earning } from '../types';

interface AddEarningScreenProps {
  addEarning: (earning: Omit<Earning, 'id'>) => void;
  updateEarning: (earning: Earning) => void;
  earningToEdit: Earning | null;
  onCancel: () => void;
  earningSources: string[];
}

export const AddEarningScreen: React.FC<AddEarningScreenProps> = ({ addEarning, updateEarning, earningToEdit, onCancel, earningSources }) => {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (earningToEdit) {
      setSource(earningToEdit.source);
      setAmount(String(earningToEdit.amount));
      setDate(earningToEdit.date);
    } else {
      // If creating a new one, default to the first source if available
      setSource(earningSources.length > 0 ? earningSources[0] : '');
    }
  }, [earningToEdit, earningSources]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || !date || parseFloat(amount) <= 0) {
      alert('Please fill all fields correctly.');
      return;
    }

    const earningData = {
      source,
      amount: parseFloat(amount),
      date,
    };

    if (earningToEdit) {
      updateEarning({ ...earningData, id: earningToEdit.id });
    } else {
      addEarning(earningData);
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">{earningToEdit ? 'Edit Earning' : 'Add New Earning'}</h1>
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-2xl space-y-6">
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-400 mb-1">Earning Source</label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-white"
          >
            {earningSources.length === 0 && <option className="bg-gray-800 text-gray-500" value="" disabled>Add a source in Settings</option>}
            {earningSources.map((s) => (
                <option className="bg-gray-800 text-white" key={s} value={s}>{s}</option>
            ))}
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
            className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-white"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-white"
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
            disabled={earningSources.length === 0}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {earningToEdit ? 'Update Earning' : 'Save Earning'}
            </button>
        </div>
      </form>
    </div>
  );
};