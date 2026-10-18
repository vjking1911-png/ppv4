import { Transaction, BudgetCategory, RecurringBill, SavingsGoal, UserFinancialProfile, SafeToSpendResult } from '../types/finance';

/**
 * Format number as Indian Rupee (INR) currency with tabular readability
 */
export function formatINR(amount: number, showDecimals = false): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Compact Indian currency formatting (Lakhs, Crores, Thousands)
 */
export function formatCompactINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  } else if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${Math.round(abs)}`;
}

/**
 * Format standard date into Indian readable string (e.g., "17 Oct 2026")
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Relative date formatter (Today, Yesterday, or 14 Oct)
 */
export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const today = new Date();
  const target = new Date(dateStr);
  
  today.setHours(0, 0, 0, 0);
  const targetCopy = new Date(target);
  targetCopy.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - targetCopy.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  
  return target.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Calculate the remaining days in the current calendar month
 */
export function getDaysRemainingInMonth(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  return Math.max(1, lastDay - currentDay + 1);
}

/**
 * Total days in current month
 */
export function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * Computes safe-to-spend metrics based on income, fixed bills, savings goals, and current discretionary spend
 */
export function calculateSafeToSpend(
  profile: UserFinancialProfile,
  transactions: Transaction[],
  bills: RecurringBill[],
  goals: SavingsGoal[],
  categories: BudgetCategory[]
): SafeToSpendResult {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayString = now.toISOString().split('T')[0];

  // Filter transactions for this month
  const thisMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // Calculate dynamic monthly income (base profile income + any positive extra income this month)
  const additionalIncome = thisMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = profile.monthlyIncome + additionalIncome;

  // Total committed fixed recurring bills for the month
  const totalFixedBills = bills.reduce((sum, b) => sum + b.amount, 0);

  // Total monthly savings allocations planned
  const totalSavingsAllocated = goals.reduce((sum, g) => sum + (g.monthlyTarget || 0), 0) || profile.monthlySavingsTarget;

  // Discretionary pool = Total Income - Fixed Bills - Savings Goals Target
  const monthlyDiscretionaryPool = Math.max(0, totalIncome - totalFixedBills - totalSavingsAllocated);

  // Total expenses recorded this month
  const totalExpensesThisMonth = thisMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Discretionary expenses: expenses that are NOT fixed bills (e.g. food, shopping, entertainment, etc.)
  // Fixed categories: rent/housing, utilities, loan/emi, insurance
  const fixedCategoryIds = new Set(
    categories.filter((c) => c.group === 'needs' && ['cat-housing', 'cat-bills', 'cat-insurance', 'cat-emi'].includes(c.id)).map((c) => c.id)
  );

  const spentDiscretionarySoFar = thisMonthTransactions
    .filter((t) => t.type === 'expense' && !fixedCategoryIds.has(t.categoryId))
    .reduce((sum, t) => sum + t.amount, 0);

  // Today's total spend
  const spentToday = transactions
    .filter((t) => t.type === 'expense' && t.date === todayString)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyDiscretionaryRemaining = Math.max(0, monthlyDiscretionaryPool - spentDiscretionarySoFar);
  const daysRemaining = getDaysRemainingInMonth();
  const totalDays = getDaysInCurrentMonth();

  // Apply contingency buffer (e.g. 5-10% buffer so user doesn't hit exact zero)
  const bufferMultiplier = 1 - (profile.dailyBufferPercent || 0) / 100;
  const effectiveDiscretionaryRemaining = monthlyDiscretionaryRemaining * bufferMultiplier;

  const safeToday = Math.max(0, Math.round(effectiveDiscretionaryRemaining / daysRemaining));
  const safeThisWeek = Math.max(0, Math.round(safeToday * Math.min(7, daysRemaining)));

  // Pacing status calculation
  const dayOfMonth = now.getDate();
  const monthProgress = dayOfMonth / totalDays;
  const budgetBurnProgress = monthlyDiscretionaryPool > 0 ? spentDiscretionarySoFar / monthlyDiscretionaryPool : 1;

  let status: 'healthy' | 'caution' | 'critical' = 'healthy';
  if (spentDiscretionarySoFar >= monthlyDiscretionaryPool) {
    status = 'critical';
  } else if (budgetBurnProgress > monthProgress + 0.15 || spentToday > safeToday * 1.3) {
    status = 'caution';
  }

  const pacingPercentage = Math.round(budgetBurnProgress * 100);

  return {
    safeToday,
    safeThisWeek,
    monthlyDiscretionaryPool,
    monthlyDiscretionaryRemaining,
    spentDiscretionarySoFar,
    spentToday,
    daysRemainingInMonth: daysRemaining,
    totalIncome,
    totalFixedBills,
    totalSavingsAllocated,
    totalExpensesThisMonth,
    status,
    pacingPercentage,
  };
}
