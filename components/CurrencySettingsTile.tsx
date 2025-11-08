import React from 'react';
import { supportedCurrencies } from '../utils/currency';
import { ChevronLeftIcon } from './Icons';

interface CurrencySettingsScreenProps {
  currency: string;
  setCurrency: (currency: string) => void;
  onBack: () => void;
}

export const CurrencySettingsScreen: React.FC<CurrencySettingsScreenProps> = ({ currency, setCurrency, onBack }) => {
  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 mr-2 -ml-2 text-gray-400 hover:text-white transition-colors">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-100">Currency Settings</h1>
      </div>
      <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-2xl space-y-6">
        <div>
          <label htmlFor="currency" className="block text-lg font-semibold text-gray-200 mb-2">
            Select Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-white"
          >
            {supportedCurrencies.map((c) => (
              <option className="bg-gray-800 text-white" key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500">
            Your currency selection will be saved and applied across the entire application.
        </p>
      </div>
    </div>
  );
};