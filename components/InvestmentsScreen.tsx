import React, { useState, useEffect, useMemo } from 'react';
import { Investment } from '../types';
import { PencilIcon, TrashIcon, PlusIcon, PlusCircleIcon, ClockIcon, ReceiptPercentIcon, EllipsisVerticalIcon, MagnifyingGlassIcon } from './Icons';
import { formatCurrency } from '../utils/currency';

interface InvestmentsScreenProps {
  investments: Investment[];
  deleteInvestment: (id: string) => void;
  currency: string;
  onAddInvestment: () => void;
  onEditInvestment: (investment: Investment) => void;
  addFundsToInvestment: (investmentId: string, amount: number, date: string) => void;
  bookProfitOrLoss: (investmentId: string, amount: number, date: string, type: 'profit' | 'loss') => void;
  onViewHistory: (investment: Investment) => void;
}

export const InvestmentsScreen: React.FC<InvestmentsScreenProps> = ({ investments, deleteInvestment, currency, onAddInvestment, onEditInvestment, addFundsToInvestment, bookProfitOrLoss, onViewHistory }) => {
    // State for the inline "Add Funds" form
    const [addingFundsTo, setAddingFundsTo] = useState<string | null>(null);
    const [fundAmount, setFundAmount] = useState('');
    const [fundDate, setFundDate] = useState(new Date().toISOString().split('T')[0]);
    
    // State for the "Book Profit/Loss" form
    const [bookingPLFor, setBookingPLFor] = useState<string | null>(null);
    const [plAmount, setPlAmount] = useState('');
    const [plDate, setPlDate] = useState(new Date().toISOString().split('T')[0]);
    const [plType, setPlType] = useState<'profit' | 'loss'>('profit');

    // State for the "More Options" menu
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    
    // State for the search filter
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (!target.closest('.menu-container')) {
            setOpenMenuId(null);
          }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
          document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const filteredInvestments = useMemo(() => {
        if (!searchQuery) {
            return investments;
        }
        return investments.filter(inv =>
            inv.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [investments, searchQuery]);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this investment? This will also remove all its history.')) {
            deleteInvestment(id);
        }
    }

    const getLatestValue = (investment: Investment) => {
        if (investment.history.length === 0) return 0;
        return investment.history[investment.history.length - 1].value;
    }

    const getStartDate = (investment: Investment) => {
        if (investment.history.length === 0) return 'N/A';
        return new Date(investment.history[0].date).toLocaleDateString();
    }
    
    const handleAddFundsClick = (investmentId: string) => {
        setOpenMenuId(null);
        if (addingFundsTo === investmentId) {
            setAddingFundsTo(null);
        } else {
            setAddingFundsTo(investmentId);
            setBookingPLFor(null);
            setFundAmount('');
            setFundDate(new Date().toISOString().split('T')[0]);
        }
    };
    
    const handleAddFundsSubmit = (e: React.FormEvent, investmentId: string) => {
        e.preventDefault();
        const amount = parseFloat(fundAmount);
        if (!amount || amount <= 0 || !fundDate) {
            alert("Please enter a valid amount and date.");
            return;
        }
        addFundsToInvestment(investmentId, amount, fundDate);
        setAddingFundsTo(null);
    };

    const handleBookPLClick = (investmentId: string) => {
        setOpenMenuId(null);
        if (bookingPLFor === investmentId) {
            setBookingPLFor(null);
        } else {
            setBookingPLFor(investmentId);
            setAddingFundsTo(null);
            setPlAmount('');
            setPlDate(new Date().toISOString().split('T')[0]);
            setPlType('profit');
        }
    };

    const handleBookPLSubmit = (e: React.FormEvent, investmentId: string) => {
        e.preventDefault();
        const amount = parseFloat(plAmount);
        if (!amount || amount <= 0 || !plDate) {
            alert("Please enter a valid amount and date.");
            return;
        }
        bookProfitOrLoss(investmentId, amount, plDate, plType);
        setBookingPLFor(null);
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Your Investments</h1>
                <button
                    onClick={onAddInvestment}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Investment</span>
                </button>
            </div>

            <div className="mb-6 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
                </span>
                <input
                    type="text"
                    placeholder="Search investments by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                />
            </div>

            <div className="space-y-4">
                {filteredInvestments.map(inv => (
                    <div key={inv.id} className="bg-gray-900 border border-white/10 p-4 rounded-xl">
                        <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-lg text-gray-200 truncate" title={inv.name}>{inv.name}</p>
                                <p className="text-sm text-gray-400">Started on {getStartDate(inv)}</p>
                                <p className="text-2xl font-bold text-blue-400 mt-2">{formatCurrency(getLatestValue(inv), currency)}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => onViewHistory(inv)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors" title="View Transaction History">
                                    <ClockIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleAddFundsClick(inv.id)} className="p-2 text-gray-400 hover:text-green-400 transition-colors" title="Add Funds">
                                    <PlusCircleIcon className="w-6 h-6" />
                                </button>
                                <div className="relative menu-container">
                                    <button 
                                        onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}
                                        className="p-2 text-gray-400 hover:text-indigo-400 transition-colors" 
                                        title="More options"
                                    >
                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                    </button>
                                    {openMenuId === inv.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10 py-1 origin-top-right animate-in fade-in-25 slide-in-from-top-2">
                                            <button onClick={() => handleBookPLClick(inv.id)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors">
                                                <ReceiptPercentIcon className="w-5 h-5 text-yellow-400" />
                                                <span>Book Profit/Loss</span>
                                            </button>
                                            <button onClick={() => { onEditInvestment(inv); setOpenMenuId(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors">
                                                <PencilIcon className="w-5 h-5 text-indigo-400" />
                                                <span>Edit Investment</span>
                                            </button>
                                            <button onClick={() => { handleDelete(inv.id); setOpenMenuId(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 transition-colors">
                                                <TrashIcon className="w-5 h-5" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {addingFundsTo === inv.id && (
                            <form onSubmit={(e) => handleAddFundsSubmit(e, inv.id)} className="mt-4 pt-4 border-t border-white/10 space-y-3">
                                <h4 className="font-medium text-sm text-gray-400">Add funds to <span className="font-bold text-gray-200">{inv.name}</span></h4>
                                <input
                                    type="number"
                                    placeholder="Amount to add"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white placeholder-gray-500"
                                />
                                <input
                                    type="date"
                                    value={fundDate}
                                    onChange={(e) => setFundDate(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white text-left"
                                />
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setAddingFundsTo(null)} className="w-full text-sm py-2 px-4 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="w-full text-sm py-2 px-4 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all">
                                        Save Funds
                                    </button>
                                </div>
                            </form>
                        )}
                        {bookingPLFor === inv.id && (
                            <form onSubmit={(e) => handleBookPLSubmit(e, inv.id)} className="mt-4 pt-4 border-t border-white/10 space-y-3">
                                <h4 className="font-medium text-sm text-gray-400">Book profit/loss for <span className="font-bold text-gray-200">{inv.name}</span></h4>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setPlType('profit')} className={`w-full text-sm py-2 px-4 rounded-lg transition-colors ${plType === 'profit' ? 'bg-green-500/80 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                                        Book Profit
                                    </button>
                                    <button type="button" onClick={() => setPlType('loss')} className={`w-full text-sm py-2 px-4 rounded-lg transition-colors ${plType === 'loss' ? 'bg-red-500/80 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                                        Book Loss
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={plAmount}
                                    onChange={(e) => setPlAmount(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white placeholder-gray-500"
                                />
                                <input
                                    type="date"
                                    value={plDate}
                                    onChange={(e) => setPlDate(e.target.value)}
                                    className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white text-left"
                                />
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setBookingPLFor(null)} className="w-full text-sm py-2 px-4 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="w-full text-sm py-2 px-4 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all">
                                        Save Transaction
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ))}
                 {investments.length > 0 && filteredInvestments.length === 0 && (
                    <div className="text-center text-gray-500 py-8 bg-gray-900 border border-white/10 rounded-xl">
                        <p>No investments found matching your search.</p>
                    </div>
                 )}
                 {investments.length === 0 && (
                    <div className="text-center text-gray-500 py-8 bg-gray-900 border border-white/10 rounded-xl">
                        <p>No investments recorded yet.</p>
                        <p className="text-sm mt-2">Click 'Add Investment' to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
