import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Income, Investment, InvestmentHistoryPoint, Screen } from './types';
import { Navbar } from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

const DashboardScreen = lazy(() => import('./components/DashboardScreen'));
const IncomeScreen = lazy(() => import('./components/IncomesScreen'));
const InvestmentsScreen = lazy(() => import('./components/InvestmentsScreen'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));
const AddIncomeScreen = lazy(() => import('./components/AddIncomeScreen'));
const AddInvestmentScreen = lazy(() => import('./components/AddInvestmentScreen'));
const CurrencySettingsScreen = lazy(() => import('./components/CurrencySettingsScreen'));
const IncomeSourcesSettingsScreen = lazy(() => import('./components/IncomeSourcesSettingsScreen'));
const TransactionHistoryScreen = lazy(() => import('./components/TransactionHistoryScreen'));
const InvestmentPerformanceScreen = lazy(() => import('./components/InvestmentPerformanceScreen'));

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [investmentToEdit, setInvestmentToEdit] = useState<Investment | null>(null);
  const [viewingInvestmentHistory, setViewingInvestmentHistory] = useState<Investment | null>(null);
  
  const [incomes, setIncomes] = useState<Income[]>(() => {
    try {
      const savedData = localStorage.getItem('income') || localStorage.getItem('incomes');
      if (savedData) return JSON.parse(savedData);

      const savedEarnings = localStorage.getItem('earnings'); // Legacy support
      return savedEarnings ? JSON.parse(savedEarnings) : [];
    } catch (error) {
      console.error("Failed to parse income from localStorage", error);
      return [];
    }
  });
  
  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
      const saved = localStorage.getItem('investments');
      const parsed = saved ? JSON.parse(saved) : [];

      // Data migration from old structure to add notes
      if (parsed.length > 0 && (parsed[0].updates || !parsed[0].history[0]?.note)) {
        return parsed.map((oldInv: any) => {
          if (oldInv.updates) { // Very old structure
            let cumulativeValue = oldInv.initialAmount;
            const history: InvestmentHistoryPoint[] = [{
              date: oldInv.startDate,
              value: oldInv.initialAmount,
              contribution: oldInv.initialAmount,
              note: "Initial Investment"
            }];

            oldInv.updates.forEach((update: any) => {
              cumulativeValue += update.amount;
              history.push({
                date: update.date,
                value: cumulativeValue, 
                contribution: update.amount,
                note: "Funds Added"
              });
            });
             return { id: oldInv.id, name: oldInv.name, history: history };
          }
          // Newer structure, just missing notes
          if(oldInv.history) {
             const newHistory = oldInv.history.map((h: InvestmentHistoryPoint, index: number) => {
                if (h.note) return h;
                if (index === 0) return { ...h, note: "Initial Investment" };
                return { ...h, note: h.contribution >= 0 ? "Funds Added" : "Withdrawal" };
             });
             return { ...oldInv, history: newHistory };
          }
          return oldInv;
        });
      }
      return parsed;
    } catch (error) {
      console.error("Failed to parse or migrate investments from localStorage", error);
      return [];
    }
  });


  const [currency, setCurrency] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('currency');
      return saved ? JSON.parse(saved) : 'INR';
    } catch (error) {
      console.error("Failed to parse currency from localStorage", error);
      return 'INR';
    }
  });

  const [incomeSources, setIncomeSources] = useState<string[]>(() => {
    try {
      const savedIncomeSources = localStorage.getItem('incomeSources');
      if (savedIncomeSources) return JSON.parse(savedIncomeSources);

      const savedEarningSources = localStorage.getItem('earningSources'); // Legacy support
      return savedEarningSources ? JSON.parse(savedEarningSources) : [];
    } catch (error) {
      console.error("Failed to parse incomeSources from localStorage", error);
      return [];
    }
  });


  useEffect(() => {
    localStorage.setItem('income', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('currency', JSON.stringify(currency));
  }, [currency]);
  
  useEffect(() => {
    localStorage.setItem('incomeSources', JSON.stringify(incomeSources));
  }, [incomeSources]);

  const addIncome = (income: Omit<Income, 'id'>) => {
    const newIncome = { ...income, id: crypto.randomUUID() };
    setIncomes(prev => [...prev, newIncome].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const updateIncome = (updatedIncome: Income) => {
    setIncomes(prev => prev.map(e => e.id === updatedIncome.id ? updatedIncome : e)
                           .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(e => e.id !== id));
  };
  
  const addInvestment = (investmentData: { name: string, initialAmount: number, startDate: string }) => {
    const newInvestment: Investment = {
      id: crypto.randomUUID(),
      name: investmentData.name,
      history: [{
        date: investmentData.startDate,
        value: investmentData.initialAmount,
        contribution: investmentData.initialAmount,
        note: "Initial Investment"
      }]
    };
    setInvestments(prev => [...prev, newInvestment].sort((a,b) => new Date(b.history?.[0]?.date ?? 0).getTime() - new Date(a.history?.[0]?.date ?? 0).getTime()));
  };

  const updateInvestment = (updatedInvestment: Investment) => {
    setInvestments(prev => prev.map(inv => inv.id === updatedInvestment.id ? updatedInvestment : inv)
                              .sort((a,b) => new Date(b.history?.[0]?.date ?? 0).getTime() - new Date(a.history?.[0]?.date ?? 0).getTime()));
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  };
  
  const addInvestmentHistoryPoint = (investmentId: string, historyPoint: InvestmentHistoryPoint) => {
    setInvestments(prev => 
      prev.map(inv => 
        inv.id === investmentId 
        ? { ...inv, history: [...inv.history, historyPoint].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) }
        : inv
      )
    );
  };

  const addFundsToInvestment = (investmentId: string, amount: number, date: string) => {
    setInvestments(prev =>
      prev.map(inv => {
        if (inv.id === investmentId) {
          const sortedHistory = [...inv.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const lastValue = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].value : 0;
          
          const newHistoryPoint: InvestmentHistoryPoint = {
            date,
            value: lastValue + amount,
            contribution: amount,
            note: "Funds Added"
          };

          const newHistory = [...inv.history, newHistoryPoint].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          return { ...inv, history: newHistory };
        }
        return inv;
      })
    );
  };

  const bookProfitOrLoss = (investmentId: string, amount: number, date: string, type: 'profit' | 'loss') => {
    setInvestments(prev =>
      prev.map(inv => {
        if (inv.id === investmentId) {
          const sortedHistory = [...inv.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const lastValue = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].value : 0;
          
          if (amount > lastValue) {
            alert("Cannot book more than the current value of the investment.");
            return inv;
          }
          
          const newHistoryPoint: InvestmentHistoryPoint = {
            date,
            value: lastValue - amount,
            contribution: -amount,
            note: type === 'profit' ? 'Profit Booked' : 'Loss Booked'
          };

          const newHistory = [...inv.history, newHistoryPoint].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          return { ...inv, history: newHistory };
        }
        return inv;
      })
    );
  };

  const addIncomeSource = (source: string) => {
    if (source && !incomeSources.find(s => s.toLowerCase() === source.toLowerCase())) {
        setIncomeSources(prev => [...prev, source].sort((a, b) => a.localeCompare(b)));
    }
  };

  const updateIncomeSource = (oldSource: string, newSource: string) => {
    if (newSource && !incomeSources.find(s => s.toLowerCase() === newSource.toLowerCase() && s.toLowerCase() !== oldSource.toLowerCase())) {
      setIncomeSources(prev => prev.map(s => s === oldSource ? newSource : s).sort((a, b) => a.localeCompare(b)));
      setIncomes(prev => prev.map(e => e.source === oldSource ? { ...e, source: newSource } : e));
    }
  };

  const deleteIncomeSource = (sourceToDelete: string) => {
      setIncomeSources(prev => prev.filter(source => source !== sourceToDelete));
  };
  
  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, income) => sum + income.amount, 0);
  }, [incomes]);

  const handleUpdateInvestment = (investmentToUpdate: Investment) => {
    updateInvestment(investmentToUpdate);
    setActiveScreen('investments');
    setInvestmentToEdit(null);
  };

  const handleExport = () => {
    const dataToExport = {
        version: 1,
        incomes,
        investments,
        currency,
        incomeSources,
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.download = `my_savings_backup_${date}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!window.confirm('Importing data will overwrite all existing data. Are you sure you want to continue?')) {
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') throw new Error('File could not be read.');
                
                const importedData = JSON.parse(text);

                const incomesToImport = importedData.incomes || importedData.earnings;
                const incomeSourcesToImport = importedData.incomeSources || importedData.earningSources;

                if (
                    !importedData ||
                    !Array.isArray(incomesToImport) ||
                    !Array.isArray(importedData.investments) ||
                    typeof importedData.currency !== 'string' ||
                    !Array.isArray(incomeSourcesToImport)
                ) {
                    throw new Error('Invalid backup file format.');
                }

                setIncomes(incomesToImport);
                setInvestments(importedData.investments);
                setCurrency(importedData.currency);
                setIncomeSources(incomeSourcesToImport);

                alert('Data imported successfully!');
                setActiveScreen('dashboard');

            } catch (error) {
                console.error('Failed to import data:', error);
                alert(`Failed to import data. Please check the file format. Error: ${(error as Error).message}`);
            }
        };
        reader.onerror = () => {
            alert('Error reading file.');
        };
        reader.readAsText(file);
    };
    input.click();
  };

  const renderScreen = () => {
    switch(activeScreen) {
      case 'dashboard':
        return <DashboardScreen 
                    investments={investments} 
                    totalIncome={totalIncome} 
                    currency={currency} 
                    onViewPerformance={() => setActiveScreen('investmentPerformance')}
                />;
      case 'income':
        return <IncomeScreen 
                    incomes={incomes} 
                    deleteIncome={deleteIncome} 
                    currency={currency} 
                    onAddIncome={() => {
                        setIncomeToEdit(null);
                        setActiveScreen('addIncome');
                    }}
                    onEditIncome={(income) => {
                        setIncomeToEdit(income);
                        setActiveScreen('addIncome');
                    }}
                />;
      case 'addIncome':
        return <AddIncomeScreen 
                    addIncome={(income) => {
                        addIncome(income);
                        setActiveScreen('income');
                    }}
                    updateIncome={(income) => {
                        updateIncome(income);
                        setActiveScreen('income');
                        setIncomeToEdit(null);
                    }}
                    incomeToEdit={incomeToEdit}
                    onCancel={() => {
                        setActiveScreen('income');
                        setIncomeToEdit(null);
                    }}
                    incomeSources={incomeSources}
                />;
      case 'investments':
        return <InvestmentsScreen 
                    investments={investments} 
                    deleteInvestment={deleteInvestment}
                    currency={currency}
                    onAddInvestment={() => {
                        setInvestmentToEdit(null);
                        setActiveScreen('addInvestment');
                    }}
                    onEditInvestment={(investment) => {
                        setInvestmentToEdit(investment);
                        setActiveScreen('addInvestment');
                    }}
                    addFundsToInvestment={addFundsToInvestment}
                    bookProfitOrLoss={bookProfitOrLoss}
                    onViewHistory={(investment) => {
                        setViewingInvestmentHistory(investment);
                        setActiveScreen('transactionHistory');
                    }}
                    addInvestmentHistoryPoint={addInvestmentHistoryPoint}
                />;
      case 'addInvestment':
        return <AddInvestmentScreen
                    addInvestment={(investment) => {
                        addInvestment(investment);
                        setActiveScreen('investments');
                    }}
                    updateInvestment={handleUpdateInvestment}
                    investmentToEdit={investmentToEdit}
                    onCancel={() => {
                        setActiveScreen('investments');
                        setInvestmentToEdit(null);
                    }}
                />;
      case 'settings':
        return <SettingsScreen setActiveScreen={setActiveScreen} onExport={handleExport} onImport={handleImport} />;
      case 'currencySettings':
        return <CurrencySettingsScreen
            currency={currency}
            setCurrency={setCurrency}
            onBack={() => setActiveScreen('settings')}
        />;
    
      case 'incomeSourcesSettings':
        return <IncomeSourcesSettingsScreen
            incomeSources={incomeSources}
            addIncomeSource={addIncomeSource}
            updateIncomeSource={updateIncomeSource}
            deleteIncomeSource={deleteIncomeSource}
            onBack={() => setActiveScreen('settings')}
        />;
      case 'transactionHistory':
        if (!viewingInvestmentHistory) {
            setActiveScreen('investments'); // Fallback if no investment is selected
            return null;
        }
        return <TransactionHistoryScreen
            investment={viewingInvestmentHistory}
            currency={currency}
            onBack={() => {
                setViewingInvestmentHistory(null);
                setActiveScreen('investments');
            }}
        />;
      case 'investmentPerformance':
        return <InvestmentPerformanceScreen
            investments={investments}
            currency={currency}
            onBack={() => setActiveScreen('dashboard')}
        />;
      default:
        return <DashboardScreen 
                    investments={investments} 
                    totalIncome={totalIncome} 
                    currency={currency} 
                    onViewPerformance={() => setActiveScreen('investmentPerformance')}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className="container mx-auto max-w-4xl pb-20 md:pb-0">
        <main>
          <Suspense fallback={<LoadingSpinner />}>
            {renderScreen()}
          </Suspense>
        </main>
      </div>
      <Navbar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
};

export default App;