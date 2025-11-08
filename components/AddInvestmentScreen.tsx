import React, { useState, useEffect } from 'react';
import { Investment } from '../types';

interface AddInvestmentScreenProps {
  addInvestment: (investment: { name: string, initialAmount: number, startDate: string }) => void;
  updateInvestment: (investment: Investment) => void;
  investmentToEdit: Investment | null;
  onCancel: () => void;
}

export const AddInvestmentScreen: React.FC<AddInvestmentScreenProps> = ({ addInvestment, updateInvestment, investmentToEdit, onCancel }) => {
  const [name, setName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (investmentToEdit) {
      setName(investmentToEdit.name);
      if (investmentToEdit.history.length > 0) {
        setInitialAmount(String(investmentToEdit.history[0].value));
        setStartDate(investmentToEdit.history[0].date);
      }
    } else {
        setName('');
    }
  }, [investmentToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initialAmount || !startDate || parseFloat(initialAmount) < 0) {
      alert('Please fill all fields correctly. Initial amount cannot be negative.');
      return;
    }

    const investmentData = {
      name,
      initialAmount: parseFloat(initialAmount),
      startDate,
    };

    if (investmentToEdit) {
      const updatedHistory = [...investmentToEdit.history];
      if (updatedHistory.length > 0) {
        updatedHistory[0] = {
          ...updatedHistory[0], // Preserve existing fields like 'note'
          date: startDate,
          value: parseFloat(initialAmount),
          contribution: parseFloat(initialAmount),
        };
      }
      updateInvestment({ ...investmentToEdit, name, history: updatedHistory });
    } else {
      addInvestment(investmentData);
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">{investmentToEdit ? 'Edit Investment' : 'Add New Investment'}</h1>
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-2xl space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Investment Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Mutual Fund, Stocks"
            className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
          />
        </div>
        <div>
          <label htmlFor="initialAmount" className="block text-sm font-medium text-gray-400 mb-1">Initial Value</label>
          <input
            type="number"
            id="initialAmount"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
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
            disabled={!name.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {investmentToEdit ? 'Update Investment' : 'Save Investment'}
            </button>
        </div>
      </form>
    </div>
  );
};