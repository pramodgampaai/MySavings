import React, { useState } from 'react';
import { TrashIcon, PlusIcon, PencilIcon, ChevronLeftIcon } from './Icons';

interface IncomeSourcesSettingsScreenProps {
  incomeSources: string[];
  addIncomeSource: (name: string) => void;
  updateIncomeSource: (oldSource: string, newSource: string) => void;
  deleteIncomeSource: (name: string) => void;
  onBack: () => void;
}

const IncomeSourcesSettingsScreen: React.FC<IncomeSourcesSettingsScreenProps> = ({
  incomeSources, addIncomeSource, updateIncomeSource, deleteIncomeSource, onBack
}) => {
  const [newIncomeSource, setNewIncomeSource] = useState('');
  const [editingIncomeSource, setEditingIncomeSource] = useState<string | null>(null);

  const handleAddOrUpdateIncomeSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIncomeSource.trim()) {
      if (editingIncomeSource) {
        updateIncomeSource(editingIncomeSource, newIncomeSource.trim());
      } else {
        addIncomeSource(newIncomeSource.trim());
      }
      setNewIncomeSource('');
      setEditingIncomeSource(null);
    }
  };
  
  const cancelEditIncomeSource = () => {
    setNewIncomeSource('');
    setEditingIncomeSource(null);
  }

  return (
    <div className="p-4 md:p-6">
        <div className="flex items-center mb-8">
            <button onClick={onBack} className="p-2 mr-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-100">Income Sources</h1>
        </div>
        <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-2xl space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">Manage Income Sources</h2>
        <form onSubmit={handleAddOrUpdateIncomeSource} className="flex flex-col gap-2">
            <div className="flex gap-2">
            <input
                type="text"
                value={newIncomeSource}
                onChange={(e) => setNewIncomeSource(e.target.value)}
                placeholder={editingIncomeSource ? "Update source" : "Add new income source"}
                className="flex-grow px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-white"
            />
            <button type="submit" className="px-4 py-2 text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105">
                <PlusIcon className="w-5 h-5"/>
                <span>{editingIncomeSource ? 'Update' : 'Add'}</span>
            </button>
            </div>
            {editingIncomeSource && (
                <button type="button" onClick={cancelEditIncomeSource} className="text-sm text-center py-2 text-gray-400 hover:text-white transition-colors">
                    Cancel
                </button>
            )}
        </form>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {incomeSources.length > 0 ? incomeSources.map(source => (
                <div key={source} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                    <span className="text-gray-300">{source}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingIncomeSource(source); setNewIncomeSource(source); }} className="p-1 text-gray-500 hover:text-indigo-400 transition-colors">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteIncomeSource(source)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )) : (
            <p className="text-sm text-center text-gray-500 py-4">No predefined income sources yet.</p>
            )}
        </div>
        </div>
    </div>
  );
};

export default IncomeSourcesSettingsScreen;