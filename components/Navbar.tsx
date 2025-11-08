import React from 'react';
import { Screen } from '../types';
import { ChartBarIcon, CurrencyDollarIcon, BanknotesIcon, CogIcon } from './Icons';

interface NavbarProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
    screen: Screen;
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    icon: React.ReactNode;
    label: string;
}> = ({ screen, activeScreen, setActiveScreen, icon, label }) => {
    const isActive = activeScreen === screen || 
                     (screen === 'earnings' && activeScreen === 'addEarning') ||
                     (screen === 'investments' && (activeScreen === 'addInvestment' || activeScreen === 'transactionHistory')) ||
                     (screen === 'settings' && ['currencySettings', 'earningSourcesSettings'].includes(activeScreen));

    const baseClasses = 'flex flex-col items-center justify-center w-full h-full transition-all duration-300 transform';
    const activeClasses = 'text-indigo-400 scale-110';
    const inactiveClasses = 'text-gray-500 hover:text-indigo-400 scale-100';

    return (
        <button
            onClick={() => setActiveScreen(screen)}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            <div className={`relative p-2 rounded-full transition-colors duration-300 ${isActive ? 'bg-indigo-500/10' : ''}`}>
                {icon}
                {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>}
            </div>
            <span className="text-xs mt-1 font-medium">{label}</span>
        </button>
    );
};

export const Navbar: React.FC<NavbarProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-950/70 backdrop-blur-lg border-t border-white/10 md:relative md:h-auto md:bg-transparent md:border-none md:shadow-none">
      <div className="flex justify-around h-full max-w-lg mx-auto">
        <NavItem 
            screen="dashboard" 
            activeScreen={activeScreen} 
            setActiveScreen={setActiveScreen} 
            icon={<ChartBarIcon className="w-6 h-6" />} 
            label="Dashboard" 
        />
        <NavItem 
            screen="earnings" 
            activeScreen={activeScreen} 
            setActiveScreen={setActiveScreen} 
            icon={<CurrencyDollarIcon className="w-6 h-6" />} 
            label="Earnings" 
        />
        <NavItem 
            screen="investments" 
            activeScreen={activeScreen} 
            setActiveScreen={setActiveScreen} 
            icon={<BanknotesIcon className="w-6 h-6" />} 
            label="Investments" 
        />
         <NavItem 
            screen="settings" 
            activeScreen={activeScreen} 
            setActiveScreen={setActiveScreen} 
            icon={<CogIcon className="w-6 h-6" />} 
            label="Settings" 
        />
      </div>
    </nav>
  );
};