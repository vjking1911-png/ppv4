export type PaymentMethod = 'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'cash';

export type CategoryGroup = 'needs' | 'wants' | 'savings';

export type TransactionType = 'expense' | 'income';

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  group: CategoryGroup;
  monthlyLimit: number;
  color: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: 'emergency' | 'vehicle' | 'gold' | 'travel' | 'tech' | 'other';
  color: string;
  monthlyTarget: number;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  dueDay: number; // 1 - 31
  categoryId: string;
  isAutoDebit: boolean;
  isPaidThisMonth: boolean;
  provider?: string;
}

export type WarikooTierId = 'tier1_survival' | 'tier2_foundation' | 'tier3_growth' | 'tier4_wealth';

export interface WarikooTier {
  id: WarikooTierId;
  name: string;
  tagline: string;
  emoji: string;
  incomeRangeText: string;
  minIncome: number;
  maxIncome: number;
  targetUser: string;
  logic: string;
  shieldPercent: number; // Day-Zero Shield (Invest)
  needsPercent: number;  // Needs
  wantsPercent: number;  // Wants
  colorClass: string;
  badgeBg: string;
}

export interface UserFinancialProfile {
  name: string;
  profession?: string;
  monthlyIncome: number;
  payday: number; // e.g. 1st or 30th
  currencySymbol: string;
  monthlySavingsTarget: number;
  dailyBufferPercent: number; // e.g. 10%
  hasCompletedOnboarding?: boolean;
  selectedTier?: WarikooTierId;
  budgetSplitMode?: 'preset' | 'custom';
  customSplit?: {
    shieldPercent: number;
    needsPercent: number;
    wantsPercent: number;
  };
  email?: string;
  updatedAt?: string;
}

export interface SafeToSpendResult {
  safeToday: number;
  safeThisWeek: number;
  monthlyDiscretionaryPool: number;
  monthlyDiscretionaryRemaining: number;
  spentDiscretionarySoFar: number;
  spentToday: number;
  daysRemainingInMonth: number;
  totalIncome: number;
  totalFixedBills: number;
  totalSavingsAllocated: number;
  totalExpensesThisMonth: number;
  status: 'healthy' | 'caution' | 'critical';
  pacingPercentage: number; // e.g. 85% of time elapsed vs 92% of budget spent
}
