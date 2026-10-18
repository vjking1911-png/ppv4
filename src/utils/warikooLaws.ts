import { WarikooTier, WarikooTierId, BudgetCategory } from '../types/finance';

export const WARIKOO_TIERS: Record<WarikooTierId, WarikooTier> = {
  tier1_survival: {
    id: 'tier1_survival',
    name: 'Survival Mode',
    tagline: 'Day-Zero Discipline for Early Grinders',
    emoji: '📉',
    incomeRangeText: 'Income < ₹30k/month',
    minIncome: 0,
    maxIncome: 29999,
    targetUser: 'Students, Interns, Entry-level stipends',
    logic: 'You cannot save 20%. Your fixed costs (Rent, Mess, Travel) consume almost everything. Prioritize surviving without debt while building a small non-negotiable investing habit.',
    shieldPercent: 8,
    needsPercent: 74,
    wantsPercent: 18,
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  },
  tier2_foundation: {
    id: 'tier2_foundation',
    name: 'Foundation Mode',
    tagline: 'The Classic 50-30-20 Wealth Anchor',
    emoji: '⚖️',
    incomeRangeText: 'Income < ₹50k/month',
    minIncome: 30000,
    maxIncome: 49999,
    targetUser: 'Early Jobbers (First 1-2 years)',
    logic: 'The classic "50-30-20 Rule" applies here. You now have enough buffer to build a real foundation while enjoying life responsibly.',
    shieldPercent: 20,
    needsPercent: 50,
    wantsPercent: 30,
    colorClass: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
  },
  tier3_growth: {
    id: 'tier3_growth',
    name: 'Growth Mode',
    tagline: "Warikoo's 2025 Rule (65-20-15)",
    emoji: '📈',
    incomeRangeText: 'Income < ₹100k/month',
    minIncome: 50000,
    maxIncome: 99999,
    targetUser: 'Mid-Level Professionals',
    logic: 'Warikoo’s "New 2025 Rule" (65-20-15). Needs expand to 65% because this stage involves "Good Needs"—upskilling courses, health & term insurance premiums, and education loan EMIs. Lifestyle inflation is the enemy: cap luxury wants at 20%.',
    shieldPercent: 15,
    needsPercent: 65,
    wantsPercent: 20,
    colorClass: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
  },
  tier4_wealth: {
    id: 'tier4_wealth',
    name: 'Wealth Mode',
    tagline: 'Aggressive Compounding & High Freedom',
    emoji: '💰',
    incomeRangeText: 'Income ₹100k - ₹500k+/month',
    minIncome: 100000,
    maxIncome: 10000000,
    targetUser: 'High Earners & Tech Leads',
    logic: 'As income explodes, your fixed survival costs naturally shrink as a percentage of total income. You must invest aggressively (30-40%) to turn active income into permanent freedom, while spending guilt-free on premium experiences.',
    shieldPercent: 35, // within 30-40% range
    needsPercent: 40,
    wantsPercent: 30,
    colorClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  },
};

export const POPULAR_PROFESSIONS = [
  { label: 'Student / Intern', tier: 'tier1_survival' as WarikooTierId, icon: '🎓' },
  { label: 'Early Jobber (1-2 yrs)', tier: 'tier2_foundation' as WarikooTierId, icon: '💼' },
  { label: 'Software Engineer / Tech', tier: 'tier3_growth' as WarikooTierId, icon: '💻' },
  { label: 'Mid-Level Professional', tier: 'tier3_growth' as WarikooTierId, icon: '🚀' },
  { label: 'Senior Exec / High Earner', tier: 'tier4_wealth' as WarikooTierId, icon: '💎' },
  { label: 'Freelancer / Creator', tier: 'tier2_foundation' as WarikooTierId, icon: '🎨' },
  { label: 'Business Owner / Founder', tier: 'tier4_wealth' as WarikooTierId, icon: '🏢' },
  { label: 'Doctor / Healthcare', tier: 'tier3_growth' as WarikooTierId, icon: '🩺' },
  { label: 'Other Profession', tier: 'tier2_foundation' as WarikooTierId, icon: '✨' },
];

/**
 * Determine Warikoo tier based purely on income.
 */
export function getWarikooTierByIncome(income: number): WarikooTier {
  if (income < 30000) {
    return WARIKOO_TIERS.tier1_survival;
  }
  if (income < 50000) {
    return WARIKOO_TIERS.tier2_foundation;
  }
  if (income < 100000) {
    return WARIKOO_TIERS.tier3_growth;
  }
  return WARIKOO_TIERS.tier4_wealth;
}

export interface IdealBudgetCalculation {
  tier: WarikooTier;
  income: number;
  shieldPercent: number;
  needsPercent: number;
  wantsPercent: number;
  shieldAmount: number;
  needsAmount: number;
  wantsAmount: number;
}

/**
 * Calculate the ideal budget split based on tier and optional custom overrides.
 */
export function calculateIdealBudget(
  income: number,
  customSplit?: { shieldPercent: number; needsPercent: number; wantsPercent: number },
  overrideTierId?: WarikooTierId
): IdealBudgetCalculation {
  const tier = overrideTierId ? WARIKOO_TIERS[overrideTierId] : getWarikooTierByIncome(income);

  const shieldPercent = customSplit ? customSplit.shieldPercent : tier.shieldPercent;
  const needsPercent = customSplit ? customSplit.needsPercent : tier.needsPercent;
  const wantsPercent = customSplit ? customSplit.wantsPercent : tier.wantsPercent;

  const shieldAmount = Math.round((income * shieldPercent) / 100);
  const needsAmount = Math.round((income * needsPercent) / 100);
  const wantsAmount = Math.round((income * wantsPercent) / 100);

  return {
    tier,
    income,
    shieldPercent,
    needsPercent,
    wantsPercent,
    shieldAmount,
    needsAmount,
    wantsAmount,
  };
}

/**
 * Calibrate categories proportionally to fit the ideal Needs & Wants limits.
 */
export function calibrateCategoriesToWarikooLaw(
  categories: BudgetCategory[],
  income: number,
  needsAmount: number,
  wantsAmount: number,
  shieldAmount: number
): BudgetCategory[] {
  const needs = categories.filter((c) => c.group === 'needs');
  const wants = categories.filter((c) => c.group === 'wants');
  const savings = categories.filter((c) => c.group === 'savings');

  const curNeedsTotal = needs.reduce((acc, c) => acc + c.monthlyLimit, 0) || 1;
  const curWantsTotal = wants.reduce((acc, c) => acc + c.monthlyLimit, 0) || 1;
  const curSavingsTotal = savings.reduce((acc, c) => acc + c.monthlyLimit, 0) || 1;

  return categories.map((cat) => {
    let newLimit = cat.monthlyLimit;
    if (cat.group === 'needs') {
      const ratio = cat.monthlyLimit / curNeedsTotal;
      newLimit = Math.round((needsAmount * ratio) / 100) * 100;
    } else if (cat.group === 'wants') {
      const ratio = cat.monthlyLimit / curWantsTotal;
      newLimit = Math.round((wantsAmount * ratio) / 100) * 100;
    } else if (cat.group === 'savings') {
      const ratio = cat.monthlyLimit / curSavingsTotal;
      newLimit = Math.round((shieldAmount * ratio) / 100) * 100;
    }
    return {
      ...cat,
      monthlyLimit: Math.max(500, newLimit),
    };
  });
}
