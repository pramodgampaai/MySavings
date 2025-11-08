import React from 'react';
import { Screen } from '../types';
import { ChevronRightIcon, CurrencyDollarIcon, ClipboardDocumentListIcon } from './Icons';

interface SettingsScreenProps {
  setActiveScreen: (screen: Screen) => void;
}

interface SettingsTileProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const SettingsTile: React.FC<SettingsTileProps> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center text-left bg-gray-900 border border-white/10 p-4 rounded-xl shadow-lg transition-all duration-300 hover:bg-gray-800/50 hover:border-indigo-500/50"
    >
        <div className="p-3 bg-indigo-500/10 rounded-lg mr-4">
            {icon}
        </div>
        <div className="flex-grow">
            <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
    </button>
);


export const SettingsScreen: React.FC<SettingsScreenProps> = ({ setActiveScreen }) => {
  return (
    <div className="p-4 md:p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Settings</h1>
      
      <div className="space-y-4">
        <SettingsTile
            title="Currency"
            description="Select your preferred display currency"
            icon={<CurrencyDollarIcon className="w-6 h-6 text-indigo-400" />}
            onClick={() => setActiveScreen('currencySettings')}
        />
        <SettingsTile
            title="Earning Sources"
            description="Manage your list of predefined earning sources"
            icon={<ClipboardDocumentListIcon className="w-6 h-6 text-indigo-400" />}
            onClick={() => setActiveScreen('earningSourcesSettings')}
        />
      </div>
    </div>
  );
};