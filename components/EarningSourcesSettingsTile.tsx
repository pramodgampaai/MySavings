import React, { useState } from 'react';
import { TrashIcon, PlusIcon, PencilIcon, ChevronLeftIcon } from './Icons';

interface EarningSourcesSettingsScreenProps {
  earningSources: string[];
  addEarningSource: (name: string) => void;
  updateEarningSource: (oldSource: string, newSource: string) => void;
  deleteEarningSource: (name: string) => void;
  onBack: () => void;
}

export const EarningSourcesSettingsScreen: React.FC<EarningSourcesSettingsScreenProps> = ({
  earningSources, addEarningSource, updateEarningSource, deleteEarningSource, onBack
}) => {
  const [newEarningSource, setNewEarningSource] = useState('');
  const [editingEarningSource, setEditingEarningSource] = useState<string | null>(null);

  const handleAddOrUpdateEarningSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEarningSource.trim()) {
      if (editingEarningSource) {
        updateEarningSource(editingEarningSource, newEarningSource.trim());
      } else {
        addEarningSource(newEarningSource.trim());
      }
      setNewEarningSource('');
      setEditingEarningSource(null);
    }
  };
  
  const cancelEditEarningSource = () => {
    setNewEarningSource('');
    setEditingEarningSource(null);
  }

  return (
    <div className="p-4 md:p-6">
        <div className="flex items-center mb-8">
            <button onClick={onBack} className="p-2 mr-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-100">Earning Sources</h1>
        </div>
        <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-2xl space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">Manage Earning Sources</h2>
        <form onSubmit={handleAddOrUpdateEarningSource} className="flex flex-col gap-2">
            <div className="flex gap-2">
            <input
                type="text"
                value={newEarningSource}
                onChange={(e) => setNewEarningSource(e.target.value)}
                placeholder={editingEarningSource ? "Update source" : "Add new earning source"}
                className="flex-grow px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-white"
            />
            <button type="submit" className="px-4 py-2 text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105">
                <PlusIcon className="w-5 h-5"/>
                <span>{editingEarningSource ? 'Update' : 'Add'}</span>
            </button>
            </div>
            {editingEarningSource && (
                <button type="button" onClick={cancelEditEarningSource} className="text-sm text-center py-2 text-gray-400 hover:text-white transition-colors">
                    Cancel
                </button>
            )}
        </form>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {earningSources.length > 0 ? earningSources.map(source => (
                <div key={source} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                    <span className="text-gray-300">{source}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingEarningSource(source); setNewEarningSource(source); }} className="p-1 text-gray-500 hover:text-indigo-400 transition-colors">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteEarningSource(source)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )) : (
            <p className="text-sm text-center text-gray-500 py-4">No predefined earning sources yet.</p>
            )}
        </div>
        </div>
    </div>
  );
};
