import React, { useState, useEffect, useMemo } from 'react';
import { Earning, Investment, InvestmentHistoryPoint, Screen } from './types';
import { Navbar } from './components/Navbar';
import { DashboardScreen } from './components/DashboardScreen';
import { EarningsScreen } from './components/EarningsScreen';
import { InvestmentsScreen } from './components/InvestmentsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AddEarningScreen } from './components/AddEarningScreen';
import { AddInvestmentScreen } from './components/AddInvestmentScreen';
import { CurrencySettingsScreen } from './components/CurrencySettingsTile';
import { EarningSourcesSettingsScreen } from './components/EarningSourcesSettingsTile';
import { TransactionHistoryScreen } from './components/TransactionHistoryScreen';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [earningToEdit, setEarningToEdit] = useState<Earning | null>(null);
  const [investmentToEdit, setInvestmentToEdit] = useState<Investment | null>(null);
  const [viewingInvestmentHistory, setViewingInvestmentHistory] = useState<Investment | null>(null);
  
  const [earnings, setEarnings] = useState<Earning[]>(() => {
    try {
      const saved = localStorage.getItem('earnings');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse earnings from localStorage", error);
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

  const [earningSources, setEarningSources] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('earningSources');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse earningSources from localStorage", error);
      return [];
    }
  });


  useEffect(() => {
    localStorage.setItem('earnings', JSON.stringify(earnings));
  }, [earnings]);

  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('currency', JSON.stringify(currency));
  }, [currency]);
  
  useEffect(() => {
    localStorage.setItem('earningSources', JSON.stringify(earningSources));
  }, [earningSources]);

  const addEarning = (earning: Omit<Earning, 'id'>) => {
    const newEarning = { ...earning, id: crypto.randomUUID() };
    setEarnings(prev => [...prev, newEarning].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const updateEarning = (updatedEarning: Earning) => {
    setEarnings(prev => prev.map(e => e.id === updatedEarning.id ? updatedEarning : e)
                           .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteEarning = (id: string) => {
    setEarnings(prev => prev.filter(e => e.id !== id));
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

  const addEarningSource = (source: string) => {
    if (source && !earningSources.find(s => s.toLowerCase() === source.toLowerCase())) {
        setEarningSources(prev => [...prev, source].sort((a, b) => a.localeCompare(b)));
    }
  };

  const updateEarningSource = (oldSource: string, newSource: string) => {
    if (newSource && !earningSources.find(s => s.toLowerCase() === newSource.toLowerCase() && s.toLowerCase() !== oldSource.toLowerCase())) {
      setEarningSources(prev => prev.map(s => s === oldSource ? newSource : s).sort((a, b) => a.localeCompare(b)));
      setEarnings(prev => prev.map(e => e.source === oldSource ? { ...e, source: newSource } : e));
    }
  };

  const deleteEarningSource = (sourceToDelete: string) => {
      setEarningSources(prev => prev.filter(source => source !== sourceToDelete));
  };
  
  const totalEarnings = useMemo(() => {
    return earnings.reduce((sum, earning) => sum + earning.amount, 0);
  }, [earnings]);

  const handleUpdateInvestment = (investmentToUpdate: Investment) => {
    updateInvestment(investmentToUpdate);
    setActiveScreen('investments');
    setInvestmentToEdit(null);
  };

  const renderScreen = () => {
    switch(activeScreen) {
      case 'dashboard':
        return <DashboardScreen investments={investments} totalEarnings={totalEarnings} addInvestmentHistoryPoint={addInvestmentHistoryPoint} currency={currency} />;
      case 'earnings':
        return <EarningsScreen 
                    earnings={earnings} 
                    deleteEarning={deleteEarning} 
                    currency={currency} 
                    onAddEarning={() => {
                        setEarningToEdit(null);
                        setActiveScreen('addEarning');
                    }}
                    onEditEarning={(earning) => {
                        setEarningToEdit(earning);
                        setActiveScreen('addEarning');
                    }}
                />;
      case 'addEarning':
        return <AddEarningScreen 
                    addEarning={(earning) => {
                        addEarning(earning);
                        setActiveScreen('earnings');
                    }}
                    updateEarning={(earning) => {
                        updateEarning(earning);
                        setActiveScreen('earnings');
                        setEarningToEdit(null);
                    }}
                    earningToEdit={earningToEdit}
                    onCancel={() => {
                        setActiveScreen('earnings');
                        setEarningToEdit(null);
                    }}
                    earningSources={earningSources}
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
        return <SettingsScreen setActiveScreen={setActiveScreen} />;
      case 'currencySettings':
        return <CurrencySettingsScreen
            currency={currency}
            setCurrency={setCurrency}
            onBack={() => setActiveScreen('settings')}
        />;
    
      case 'earningSourcesSettings':
        return <EarningSourcesSettingsScreen
            earningSources={earningSources}
            addEarningSource={addEarningSource}
            updateEarningSource={updateEarningSource}
            deleteEarningSource={deleteEarningSource}
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
      default:
        return <DashboardScreen investments={investments} totalEarnings={totalEarnings} addInvestmentHistoryPoint={addInvestmentHistoryPoint} currency={currency} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className="container mx-auto max-w-4xl pb-20 md:pb-0">
        <main>
          {renderScreen()}
        </main>
      </div>
      <Navbar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
};

export default App;