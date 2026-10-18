import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  getStoredData, 
  saveProfile, 
  saveCategories, 
  saveTransactions, 
  saveSavingsGoals, 
  saveBills, 
  resetDemoData 
} from './utils/storage';
import { 
  UserFinancialProfile, 
  BudgetCategory, 
  Transaction, 
  SavingsGoal, 
  RecurringBill, 
  SafeToSpendResult 
} from './types/finance';
import { calculateSafeToSpend, formatINR } from './utils/formatters';
import { TopBar, NavTab } from './components/TopBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { TransactionsView } from './components/TransactionsView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { BillsCalendarView } from './components/BillsCalendarView';
import { ProfileView } from './components/ProfileView';
import { OnboardingModal } from './components/OnboardingModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AIInsightsModal } from './components/AIInsightsModal';
import { LiveMarketIntelModal } from './components/LiveMarketIntelModal';
import { ExportDataModal } from './components/ExportDataModal';
import { ImportCSVModal } from './components/ImportCSVModal';
import { PaisaPlanLogo } from './components/PaisaPlanLogo';
import { auth } from './firebase/config';
import { firestoreService } from './firebase/firestoreService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { RotateCcw, ShieldCheck, Globe, CloudCheck } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<{
    profile: UserFinancialProfile;
    categories: BudgetCategory[];
    transactions: Transaction[];
    savingsGoals: SavingsGoal[];
    bills: RecurringBill[];
  }>(() => getStoredData());

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    const stored = getStoredData();
    return !stored.profile.hasCompletedOnboarding;
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isMarketIntelOpen, setIsMarketIntelOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { profile, categories, transactions, savingsGoals, bills } = data;
  const isInitialLoginSync = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Firebase Auth State Listener & Firestore Real-Time Subscriptions
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        setIsSyncing(true);
        showToast(`Connected to Firebase as ${user.displayName || user.email}`);

        // Set up real-time Firestore listeners for this authenticated user
        const unsubProfile = firestoreService.subscribeUserProfile(user.uid, (remoteProfile) => {
          if (remoteProfile) {
            setData((prev) => ({ ...prev, profile: remoteProfile }));
            saveProfile(remoteProfile);
            if (!remoteProfile.hasCompletedOnboarding) {
              setIsOnboardingOpen(true);
            }
          } else if (!isInitialLoginSync.current) {
            // New user in Firestore: seed their initial dataset
            isInitialLoginSync.current = true;
            firestoreService.seedUserInitialData(
              user.uid,
              {
                ...data.profile,
                name: user.displayName || data.profile.name,
                email: user.email || data.profile.email,
              },
              data.categories,
              data.transactions,
              data.savingsGoals,
              data.bills
            ).then(() => {
              showToast('Initialized cloud database records');
              setIsOnboardingOpen(true);
            });
          }
        });

        const unsubTx = firestoreService.subscribeTransactions(user.uid, (remoteTxs) => {
          setData((prev) => ({ ...prev, transactions: remoteTxs }));
          saveTransactions(remoteTxs);
        });

        const unsubCats = firestoreService.subscribeCategories(user.uid, (remoteCats) => {
          if (remoteCats.length > 0) {
            setData((prev) => ({ ...prev, categories: remoteCats }));
            saveCategories(remoteCats);
          }
        });

        const unsubGoals = firestoreService.subscribeSavingsGoals(user.uid, (remoteGoals) => {
          setData((prev) => ({ ...prev, savingsGoals: remoteGoals }));
          saveSavingsGoals(remoteGoals);
        });

        const unsubBills = firestoreService.subscribeBills(user.uid, (remoteBills) => {
          setData((prev) => ({ ...prev, bills: remoteBills }));
          saveBills(remoteBills);
          setIsSyncing(false);
        });

        return () => {
          unsubProfile();
          unsubTx();
          unsubCats();
          unsubGoals();
          unsubBills();
        };
      } else {
        isInitialLoginSync.current = false;
        setIsSyncing(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Safe-to-Spend real-time calculation
  const safeToSpendMetrics: SafeToSpendResult = useMemo(() => {
    return calculateSafeToSpend(profile, transactions, bills, savingsGoals, categories);
  }, [profile, transactions, bills, savingsGoals, categories]);

  // Transaction Actions (with Firestore write)
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [transaction, ...transactions];
    setData((prev) => ({ ...prev, transactions: updated }));
    saveTransactions(updated);

    if (currentUser) {
      await firestoreService.addTransaction(currentUser.uid, transaction);
    }

    showToast(
      `${newTx.type === 'expense' ? 'Spent' : 'Received'} ${formatINR(newTx.amount)} on ${newTx.title}`
    );
  };

  const handleDeleteTransaction = async (id: string) => {
    const updated = transactions.filter((t: Transaction) => t.id !== id);
    setData((prev) => ({ ...prev, transactions: updated }));
    saveTransactions(updated);

    if (currentUser) {
      await firestoreService.deleteTransaction(currentUser.uid, id);
    }

    showToast('Transaction removed');
  };

  const handleImportTransactions = async (newTxs: Omit<Transaction, 'id'>[]) => {
    const createdTransactions: Transaction[] = newTxs.map((tx, idx) => ({
      ...tx,
      id: `tx-imp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    const updated = [...createdTransactions, ...transactions];
    setData((prev) => ({ ...prev, transactions: updated }));
    saveTransactions(updated);

    if (currentUser) {
      for (const t of createdTransactions) {
        await firestoreService.addTransaction(currentUser.uid, t);
      }
    }

    const expenseCount = createdTransactions.filter((t) => t.type === 'expense').length;
    const incomeCount = createdTransactions.filter((t) => t.type === 'income').length;
    showToast(`Imported ${createdTransactions.length} statement records (${expenseCount} expenses, ${incomeCount} income)`);
  };

  // Profile & Category Actions
  const handleUpdateProfile = async (updatedProfile: UserFinancialProfile) => {
    setData((prev) => ({ ...prev, profile: updatedProfile }));
    saveProfile(updatedProfile);

    if (currentUser) {
      await firestoreService.saveUserProfile(currentUser.uid, updatedProfile);
    }

    showToast('Profile & Safe-to-Spend parameters updated');
  };

  const handleUpdateCategories = async (updatedCategories: BudgetCategory[]) => {
    setData((prev) => ({ ...prev, categories: updatedCategories }));
    saveCategories(updatedCategories);

    if (currentUser) {
      await firestoreService.saveCategories(currentUser.uid, updatedCategories);
    }

    showToast('Budget category limits updated');
  };

  const handleCompleteOnboarding = async (
    updatedProfile: UserFinancialProfile,
    updatedCategories: BudgetCategory[]
  ) => {
    setData((prev) => ({
      ...prev,
      profile: updatedProfile,
      categories: updatedCategories,
    }));
    saveProfile(updatedProfile);
    saveCategories(updatedCategories);

    if (currentUser) {
      await firestoreService.saveUserProfile(currentUser.uid, updatedProfile);
      await firestoreService.saveCategories(currentUser.uid, updatedCategories);
    }

    showToast(`Welcome ${updatedProfile.name}! Ideal budget calibrated for ${updatedProfile.profession}`);
  };

  // Savings Goal Actions
  const handleAddGoal = async (newGoal: Omit<SavingsGoal, 'id'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
    };
    const updated = [...savingsGoals, goal];
    setData((prev) => ({ ...prev, savingsGoals: updated }));
    saveSavingsGoals(updated);

    if (currentUser) {
      await firestoreService.saveSavingsGoal(currentUser.uid, goal);
    }

    showToast(`Savings vault "${newGoal.title}" created`);
  };

  const handleUpdateGoalFunds = async (goalId: string, addedAmount: number) => {
    const updated = savingsGoals.map((g: SavingsGoal) => {
      if (g.id === goalId) {
        return { ...g, currentAmount: g.currentAmount + addedAmount };
      }
      return g;
    });
    setData((prev) => ({ ...prev, savingsGoals: updated }));
    saveSavingsGoals(updated);

    const targetGoal = updated.find((g: SavingsGoal) => g.id === goalId);
    if (targetGoal && currentUser) {
      await firestoreService.saveSavingsGoal(currentUser.uid, targetGoal);
    }

    // Auto-record as an expense / transfer transaction to reflect in ledger
    if (targetGoal) {
      handleAddTransaction({
        title: `Savings Deposit: ${targetGoal.title}`,
        amount: addedAmount,
        type: 'expense',
        categoryId: 'cat-investments',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'upi',
        notes: `Manual allocation to ${targetGoal.title}`,
      });
    }

    showToast(`Added ${formatINR(addedAmount)} to goal!`);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const updated = savingsGoals.filter((g: SavingsGoal) => g.id !== goalId);
    setData((prev) => ({ ...prev, savingsGoals: updated }));
    saveSavingsGoals(updated);

    if (currentUser) {
      await firestoreService.deleteSavingsGoal(currentUser.uid, goalId);
    }

    showToast('Savings goal deleted');
  };

  // Recurring Bill Actions
  const handleToggleBillPaid = async (billId: string) => {
    let billTitle = '';
    let billAmount = 0;
    let willBePaid = false;
    let billCat = 'cat-bills';
    let targetBill: RecurringBill | undefined;

    const updated = bills.map((b: RecurringBill) => {
      if (b.id === billId) {
        billTitle = b.title;
        billAmount = b.amount;
        willBePaid = !b.isPaidThisMonth;
        billCat = b.categoryId;
        targetBill = { ...b, isPaidThisMonth: willBePaid };
        return targetBill;
      }
      return b;
    });

    setData((prev) => ({ ...prev, bills: updated }));
    saveBills(updated);

    if (targetBill && currentUser) {
      await firestoreService.saveBill(currentUser.uid, targetBill);
    }

    // If marked as paid, auto-log as a transaction
    if (willBePaid) {
      handleAddTransaction({
        title: `Bill Cleared: ${billTitle}`,
        amount: billAmount,
        type: 'expense',
        categoryId: billCat,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'upi',
        isRecurring: true,
      });
    }

    showToast(willBePaid ? `Marked "${billTitle}" as paid` : `Marked "${billTitle}" as unpaid`);
  };

  const handleAddBill = async (newBill: Omit<RecurringBill, 'id'>) => {
    const bill: RecurringBill = {
      ...newBill,
      id: `bill-${Date.now()}`,
    };
    const updated = [...bills, bill];
    setData((prev) => ({ ...prev, bills: updated }));
    saveBills(updated);

    if (currentUser) {
      await firestoreService.saveBill(currentUser.uid, bill);
    }

    showToast(`Recurring obligation "${newBill.title}" added`);
  };

  const handleDeleteBill = async (billId: string) => {
    const updated = bills.filter((b: RecurringBill) => b.id !== billId);
    setData((prev) => ({ ...prev, bills: updated }));
    saveBills(updated);

    if (currentUser) {
      await firestoreService.deleteBill(currentUser.uid, billId);
    }

    showToast('Recurring obligation removed');
  };

  // Demo reset
  const handleResetData = () => {
    resetDemoData();
    setData(getStoredData());
    showToast('Reset to default demo data');
  };

  return (
    <div className="min-h-screen bg-[#051a11] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar with Brand, Nav Links, Live Intel, Google Sign-in & Add Entry */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAIInsights={() => setIsAIAdvisorOpen(true)}
        onOpenMarketIntel={() => setIsMarketIntelOpen(true)}
        user={currentUser}
        profile={profile}
        isSyncing={isSyncing}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={safeToSpendMetrics}
            profile={profile}
            transactions={transactions}
            categories={categories}
            goals={savingsGoals}
            bills={bills}
            onNavigate={setActiveTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {activeTab === 'safetospend' && (
          <BudgetPlannerView
            profile={profile}
            categories={categories}
            bills={bills}
            goals={savingsGoals}
            metrics={safeToSpendMetrics}
            onUpdateProfile={handleUpdateProfile}
            onUpdateCategories={handleUpdateCategories}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {activeTab === 'goals' && (
          <SavingsGoalsView
            goals={savingsGoals}
            onAddGoal={handleAddGoal}
            onUpdateGoalFunds={handleUpdateGoalFunds}
            onDeleteGoal={handleDeleteGoal}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {activeTab === 'bills' && (
          <BillsCalendarView
            bills={bills}
            categories={categories}
            onTogglePaid={handleToggleBillPaid}
            onAddBill={handleAddBill}
            onDeleteBill={handleDeleteBill}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            categories={categories}
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onUpdateCategories={handleUpdateCategories}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer Area with Reset, Cloud Status & Trust Info */}
      <footer className="border-t border-emerald-950/80 bg-[#04160e] py-6 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PaisaPlanLogo size={24} />
            <span className="font-semibold text-slate-300">PaisaPlan</span>
            <span>·</span>
            <span>Smart Personal Budget & Safe-to-Spend Tracker</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Profile & Warikoo Laws</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsMarketIntelOpen(true)}
              className="text-slate-400 hover:text-blue-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Market Intel</span>
            </button>
            <span>·</span>
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
            <span>·</span>
            <span className={`font-mono text-[11px] flex items-center gap-1.5 ${currentUser ? 'text-emerald-400' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>
                {currentUser
                  ? `Cloud Synced to ${currentUser.email || 'Google Account'}`
                  : 'Local Storage Mode · Sign in above to sync across devices'}
              </span>
            </span>
          </div>
        </div>
      </footer>

      {/* Bottom Nav for Mobile Viewports */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Onboarding Wizard Modal (First Login / Profile Calibration) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentProfile={profile}
        categories={categories}
        onComplete={handleCompleteOnboarding}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onAddTransaction={handleAddTransaction}
      />

      {/* AI Advisor Modal */}
      <AIInsightsModal
        isOpen={isAIAdvisorOpen}
        onClose={() => setIsAIAdvisorOpen(false)}
        metrics={safeToSpendMetrics}
        profile={profile}
        transactions={transactions}
        categories={categories}
        goals={savingsGoals}
        bills={bills}
        currentUser={currentUser}
      />

      {/* Live Market Intel (Google Search Grounding) Modal */}
      <LiveMarketIntelModal
        isOpen={isMarketIntelOpen}
        onClose={() => setIsMarketIntelOpen(false)}
      />

      {/* CSV Data Export Modal (Transactions & Savings Goals) */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        goals={savingsGoals}
        categories={categories}
      />

      {/* UPI Statement & Bank CSV Import Modal */}
      <ImportCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        categories={categories}
        onImportTransactions={handleImportTransactions}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-2xl shadow-xl font-semibold text-xs flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <ShieldCheck className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
