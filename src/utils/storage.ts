import { 
  BudgetCategory, 
  Transaction, 
  SavingsGoal, 
  RecurringBill, 
  UserFinancialProfile 
} from '../types/finance';

const STORAGE_KEYS = {
  PROFILE: 'paisaplan_profile',
  CATEGORIES: 'paisaplan_categories',
  TRANSACTIONS: 'paisaplan_transactions',
  SAVINGS_GOALS: 'paisaplan_savings_goals',
  BILLS: 'paisaplan_recurring_bills',
};

export const INITIAL_CATEGORIES: BudgetCategory[] = [
  {
    id: 'cat-housing',
    name: 'Housing & Rent',
    icon: 'Home',
    group: 'needs',
    monthlyLimit: 24000,
    color: '#0284c7', // sky-600
  },
  {
    id: 'cat-groceries',
    name: 'Groceries & Kirana',
    icon: 'Apple',
    group: 'needs',
    monthlyLimit: 9000,
    color: '#16a34a', // green-600
  },
  {
    id: 'cat-dining',
    name: 'Food & Dining (Swiggy/Zomato)',
    icon: 'UtensilsCrossed',
    group: 'wants',
    monthlyLimit: 8500,
    color: '#ea580c', // orange-600
  },
  {
    id: 'cat-transport',
    name: 'Transport, Fuel & Cab',
    icon: 'Car',
    group: 'needs',
    monthlyLimit: 6000,
    color: '#0d9488', // teal-600
  },
  {
    id: 'cat-shopping',
    name: 'Shopping & Apparel',
    icon: 'ShoppingBag',
    group: 'wants',
    monthlyLimit: 7000,
    color: '#db2777', // pink-600
  },
  {
    id: 'cat-bills',
    name: 'Utilities & Broadband',
    icon: 'Zap',
    group: 'needs',
    monthlyLimit: 4500,
    color: '#eab308', // yellow-500
  },
  {
    id: 'cat-health',
    name: 'Healthcare & Gym',
    icon: 'HeartPulse',
    group: 'needs',
    monthlyLimit: 3500,
    color: '#ef4444', // red-500
  },
  {
    id: 'cat-entertainment',
    name: 'Movies & OTT Streams',
    icon: 'Film',
    group: 'wants',
    monthlyLimit: 2500,
    color: '#9333ea', // purple-600
  },
  {
    id: 'cat-investments',
    name: 'Mutual Funds & SIP',
    icon: 'TrendingUp',
    group: 'savings',
    monthlyLimit: 15000,
    color: '#10b981', // emerald-500
  },
];

export const INITIAL_PROFILE: UserFinancialProfile = {
  name: 'Vijay Kumar',
  profession: 'Mid-Level Professional',
  monthlyIncome: 85000,
  payday: 1,
  currencySymbol: '₹',
  monthlySavingsTarget: 12750, // 15% Day-Zero Shield for Tier 3 Growth Mode (85,000 * 0.15)
  dailyBufferPercent: 8,
  hasCompletedOnboarding: false,
  selectedTier: 'tier3_growth',
  budgetSplitMode: 'preset',
};

export const INITIAL_BILLS: RecurringBill[] = [
  {
    id: 'bill-rent',
    title: 'Apartment Rent',
    amount: 22000,
    dueDay: 1,
    categoryId: 'cat-housing',
    isAutoDebit: false,
    isPaidThisMonth: true,
    provider: 'Owner Transfer',
  },
  {
    id: 'bill-sip',
    title: 'Nifty 50 Index Fund SIP',
    amount: 10000,
    dueDay: 5,
    categoryId: 'cat-investments',
    isAutoDebit: true,
    isPaidThisMonth: true,
    provider: 'Groww / Zerodha',
  },
  {
    id: 'bill-wifi',
    title: 'Airtel Xstream Fiber',
    amount: 999,
    dueDay: 14,
    categoryId: 'cat-bills',
    isAutoDebit: true,
    isPaidThisMonth: true,
    provider: 'Airtel Fiber',
  },
  {
    id: 'bill-power',
    title: 'Electricity Bill (BESCOM)',
    amount: 1850,
    dueDay: 22,
    categoryId: 'cat-bills',
    isAutoDebit: false,
    isPaidThisMonth: false,
    provider: 'BESCOM State Grid',
  },
  {
    id: 'bill-subs',
    title: 'Netflix & Spotify Family',
    amount: 849,
    dueDay: 26,
    categoryId: 'cat-entertainment',
    isAutoDebit: true,
    isPaidThisMonth: false,
    provider: 'Credit Card Auto-pay',
  },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-emergency',
    title: 'Emergency Fund (6 Months)',
    targetAmount: 250000,
    currentAmount: 185000,
    targetDate: '2027-04-30',
    category: 'emergency',
    color: '#10b981',
    monthlyTarget: 10000,
  },
  {
    id: 'goal-bike',
    title: 'Royal Enfield Meteor 350',
    targetAmount: 225000,
    currentAmount: 120000,
    targetDate: '2027-02-28',
    category: 'vehicle',
    color: '#f59e0b',
    monthlyTarget: 7500,
  },
  {
    id: 'goal-sgb',
    title: 'Sovereign Gold Bonds Reserve',
    targetAmount: 100000,
    currentAmount: 68000,
    targetDate: '2027-06-30',
    category: 'gold',
    color: '#eab308',
    monthlyTarget: 5000,
  },
  {
    id: 'goal-trip',
    title: 'Goa Year-End Road Trip',
    targetAmount: 35000,
    currentAmount: 28000,
    targetDate: '2026-12-25',
    category: 'travel',
    color: '#06b6d4',
    monthlyTarget: 3500,
  },
];

const getToday = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Swiggy Gourmet Dinner',
    amount: 740,
    type: 'expense',
    categoryId: 'cat-dining',
    date: getToday(0),
    paymentMethod: 'upi',
    notes: 'Dinner with friends',
  },
  {
    id: 'tx-2',
    title: 'Blinkit Instant Kirana',
    amount: 620,
    type: 'expense',
    categoryId: 'cat-groceries',
    date: getToday(0),
    paymentMethod: 'upi',
    notes: 'Milk, fruits, bread, curd',
  },
  {
    id: 'tx-3',
    title: 'Shell Petrol Pump Refuel',
    amount: 1800,
    type: 'expense',
    categoryId: 'cat-transport',
    date: getToday(1),
    paymentMethod: 'credit_card',
    notes: 'Full tank petrol',
  },
  {
    id: 'tx-4',
    title: 'Freelance Design Retainer',
    amount: 15000,
    type: 'income',
    categoryId: 'cat-investments',
    date: getToday(2),
    paymentMethod: 'net_banking',
    notes: 'Side project client payout',
  },
  {
    id: 'tx-5',
    title: 'Nature Basket Supermarket',
    amount: 2450,
    type: 'expense',
    categoryId: 'cat-groceries',
    date: getToday(3),
    paymentMethod: 'upi',
    notes: 'Monthly staples',
  },
  {
    id: 'tx-6',
    title: 'Zara Casual Linen Shirts',
    amount: 4200,
    type: 'expense',
    categoryId: 'cat-shopping',
    date: getToday(4),
    paymentMethod: 'credit_card',
    notes: 'Weekend sale shopping',
  },
  {
    id: 'tx-7',
    title: 'Cult.fit Pass Renewal',
    amount: 1500,
    type: 'expense',
    categoryId: 'cat-health',
    date: getToday(5),
    paymentMethod: 'credit_card',
    notes: 'Monthly gym workout pass',
  },
  {
    id: 'tx-8',
    title: 'Airtel Broadband Fiber',
    amount: 999,
    type: 'expense',
    categoryId: 'cat-bills',
    date: getToday(6),
    paymentMethod: 'upi',
    notes: 'High speed internet bill',
    isRecurring: true,
  },
  {
    id: 'tx-9',
    title: 'House Rent (October)',
    amount: 22000,
    type: 'expense',
    categoryId: 'cat-housing',
    date: getToday(16),
    paymentMethod: 'net_banking',
    notes: 'Owner flat rent payment',
    isRecurring: true,
  },
  {
    id: 'tx-10',
    title: 'Blue Tokai Specialty Coffee',
    amount: 320,
    type: 'expense',
    categoryId: 'cat-dining',
    date: getToday(2),
    paymentMethod: 'upi',
    notes: 'Iced Latte & croissant',
  },
  {
    id: 'tx-11',
    title: 'Uber Premier Airport Ride',
    amount: 880,
    type: 'expense',
    categoryId: 'cat-transport',
    date: getToday(7),
    paymentMethod: 'upi',
    notes: 'Airport terminal commute',
  },
];

function getKeys(userEmail?: string) {
  if (!userEmail) return STORAGE_KEYS;
  const suffix = userEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return {
    PROFILE: `paisaplan_profile_${suffix}`,
    CATEGORIES: `paisaplan_categories_${suffix}`,
    TRANSACTIONS: `paisaplan_transactions_${suffix}`,
    SAVINGS_GOALS: `paisaplan_savings_goals_${suffix}`,
    BILLS: `paisaplan_recurring_bills_${suffix}`,
  };
}

export function getActiveUserEmail(): string | null {
  return localStorage.getItem('paisaplan_active_email');
}

export function setActiveUserEmail(email: string | null) {
  if (email) {
    localStorage.setItem('paisaplan_active_email', email);
  } else {
    localStorage.removeItem('paisaplan_active_email');
  }
}

export function getStoredData(userEmail?: string) {
  try {
    const keys = getKeys(userEmail);
    const profile = localStorage.getItem(keys.PROFILE);
    const categories = localStorage.getItem(keys.CATEGORIES);
    const transactions = localStorage.getItem(keys.TRANSACTIONS);
    const savingsGoals = localStorage.getItem(keys.SAVINGS_GOALS);
    const bills = localStorage.getItem(keys.BILLS);

    // If this is a specific user with no saved data yet, personalize initial profile with their email
    const fallbackProfile = userEmail 
      ? { ...INITIAL_PROFILE, email: userEmail, name: userEmail.split('@')[0] } 
      : INITIAL_PROFILE;

    return {
      profile: profile ? JSON.parse(profile) : fallbackProfile,
      categories: categories ? JSON.parse(categories) : INITIAL_CATEGORIES,
      transactions: transactions ? JSON.parse(transactions) : INITIAL_TRANSACTIONS,
      savingsGoals: savingsGoals ? JSON.parse(savingsGoals) : INITIAL_SAVINGS_GOALS,
      bills: bills ? JSON.parse(bills) : INITIAL_BILLS,
    };
  } catch (e) {
    console.error('Failed to read from localStorage', e);
    return {
      profile: INITIAL_PROFILE,
      categories: INITIAL_CATEGORIES,
      transactions: INITIAL_TRANSACTIONS,
      savingsGoals: INITIAL_SAVINGS_GOALS,
      bills: INITIAL_BILLS,
    };
  }
}

export function saveProfile(profile: UserFinancialProfile, userEmail?: string) {
  const keys = getKeys(userEmail || profile.email);
  localStorage.setItem(keys.PROFILE, JSON.stringify(profile));
}

export function saveTransactions(transactions: Transaction[], userEmail?: string) {
  const keys = getKeys(userEmail);
  localStorage.setItem(keys.TRANSACTIONS, JSON.stringify(transactions));
}

export function saveCategories(categories: BudgetCategory[], userEmail?: string) {
  const keys = getKeys(userEmail);
  localStorage.setItem(keys.CATEGORIES, JSON.stringify(categories));
}

export function saveSavingsGoals(goals: SavingsGoal[], userEmail?: string) {
  const keys = getKeys(userEmail);
  localStorage.setItem(keys.SAVINGS_GOALS, JSON.stringify(goals));
}

export function saveBills(bills: RecurringBill[], userEmail?: string) {
  const keys = getKeys(userEmail);
  localStorage.setItem(keys.BILLS, JSON.stringify(bills));
}

export function resetDemoData(userEmail?: string) {
  const keys = getKeys(userEmail);
  const fallbackProfile = userEmail 
    ? { ...INITIAL_PROFILE, email: userEmail, name: userEmail.split('@')[0] } 
    : INITIAL_PROFILE;

  localStorage.setItem(keys.PROFILE, JSON.stringify(fallbackProfile));
  localStorage.setItem(keys.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(keys.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(keys.SAVINGS_GOALS, JSON.stringify(INITIAL_SAVINGS_GOALS));
  localStorage.setItem(keys.BILLS, JSON.stringify(INITIAL_BILLS));
}
