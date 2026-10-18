import React, { useState } from 'react';
import { 
  UserFinancialProfile, 
  BudgetCategory, 
  RecurringBill, 
  SavingsGoal, 
  SafeToSpendResult 
} from '../types/finance';
import { formatINR } from '../utils/formatters';
import { 
  WARIKOO_TIERS, 
  getWarikooTierByIncome, 
  calculateIdealBudget, 
  calibrateCategoriesToWarikooLaw 
} from '../utils/warikooLaws';
import { 
  Sliders, 
  PieChart, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Save, 
  RefreshCw, 
  BookOpen,
  Award,
  Zap,
  SlidersHorizontal
} from 'lucide-react';

interface BudgetPlannerViewProps {
  profile: UserFinancialProfile;
  categories: BudgetCategory[];
  bills: RecurringBill[];
  goals: SavingsGoal[];
  metrics: SafeToSpendResult;
  onUpdateProfile: (updated: UserFinancialProfile) => void;
  onUpdateCategories: (updated: BudgetCategory[]) => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
  profile,
  categories,
  bills,
  goals,
  metrics,
  onUpdateProfile,
  onUpdateCategories,
}) => {
  // Local state for interactive simulator
  const [simIncome, setSimIncome] = useState(profile.monthlyIncome);
  const [simBuffer, setSimBuffer] = useState(profile.dailyBufferPercent);

  // Toggle Bar: 'preset' or 'custom'
  const [splitMode, setSplitMode] = useState<'preset' | 'custom'>(profile.budgetSplitMode || 'preset');

  // Active Warikoo Tier based on simulated income
  const activeTier = getWarikooTierByIncome(simIncome);

  const [customShield, setCustomShield] = useState(
    profile.customSplit?.shieldPercent ?? activeTier.shieldPercent
  );
  const [customNeeds, setCustomNeeds] = useState(
    profile.customSplit?.needsPercent ?? activeTier.needsPercent
  );
  const [customWants, setCustomWants] = useState(
    profile.customSplit?.wantsPercent ?? activeTier.wantsPercent
  );

  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    categories.forEach((c) => {
      map[c.id] = c.monthlyLimit;
    });
    return map;
  });
  const [savedNotification, setSavedNotification] = useState(false);

  // When income changes in preset mode, update custom values to mirror active tier
  const handleIncomeSlider = (newIncome: number) => {
    setSimIncome(newIncome);
    const newTier = getWarikooTierByIncome(newIncome);
    if (splitMode === 'preset') {
      setCustomShield(newTier.shieldPercent);
      setCustomNeeds(newTier.needsPercent);
      setCustomWants(newTier.wantsPercent);
    }
  };

  // Ideal budget calculation
  const idealBudget = calculateIdealBudget(
    simIncome,
    splitMode === 'custom'
      ? { shieldPercent: customShield, needsPercent: customNeeds, wantsPercent: customWants }
      : undefined
  );

  const totalFixedBills = bills.reduce((acc, b) => acc + b.amount, 0);

  // Live simulation math
  const simSavingsTarget = idealBudget.shieldAmount;
  const simDiscretionaryPool = Math.max(0, simIncome - totalFixedBills - simSavingsTarget);
  const simDiscretionaryRemaining = Math.max(
    0,
    simDiscretionaryPool - metrics.spentDiscretionarySoFar
  );
  const simBufferMultiplier = 1 - simBuffer / 100;
  const simSafeDaily = Math.round(
    (simDiscretionaryRemaining * simBufferMultiplier) / Math.max(1, metrics.daysRemainingInMonth)
  );
  const simSafeWeekly = Math.round(simSafeDaily * Math.min(7, metrics.daysRemainingInMonth));

  // Category sums
  const needsCategories = categories.filter((c) => c.group === 'needs');
  const wantsCategories = categories.filter((c) => c.group === 'wants');

  const allocatedNeeds = needsCategories.reduce((acc, c) => acc + (categoryLimits[c.id] || c.monthlyLimit), 0);
  const allocatedWants = wantsCategories.reduce((acc, c) => acc + (categoryLimits[c.id] || c.monthlyLimit), 0);

  const handleSaveBudget = () => {
    onUpdateProfile({
      ...profile,
      monthlyIncome: simIncome,
      monthlySavingsTarget: idealBudget.shieldAmount,
      dailyBufferPercent: simBuffer,
      selectedTier: activeTier.id,
      budgetSplitMode: splitMode,
      customSplit: splitMode === 'custom' ? {
        shieldPercent: customShield,
        needsPercent: customNeeds,
        wantsPercent: customWants,
      } : undefined,
      updatedAt: new Date().toISOString(),
    });

    const updatedCategories = categories.map((c) => ({
      ...c,
      monthlyLimit: categoryLimits[c.id] ?? c.monthlyLimit,
    }));
    onUpdateCategories(updatedCategories);

    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleApplyWarikooToCategories = () => {
    const calibrated = calibrateCategoriesToWarikooLaw(
      categories,
      simIncome,
      idealBudget.needsAmount,
      idealBudget.wantsAmount,
      idealBudget.shieldAmount
    );
    const map: Record<string, number> = {};
    calibrated.forEach((c) => {
      map[c.id] = c.monthlyLimit;
    });
    setCategoryLimits(map);
    onUpdateCategories(calibrated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const resetToProfile = () => {
    setSimIncome(profile.monthlyIncome);
    setSimBuffer(profile.dailyBufferPercent);
    setSplitMode(profile.budgetSplitMode || 'preset');
    const tier = getWarikooTierByIncome(profile.monthlyIncome);
    setCustomShield(profile.customSplit?.shieldPercent ?? tier.shieldPercent);
    setCustomNeeds(profile.customSplit?.needsPercent ?? tier.needsPercent);
    setCustomWants(profile.customSplit?.wantsPercent ?? tier.wantsPercent);
    const map: Record<string, number> = {};
    categories.forEach((c) => {
      map[c.id] = c.monthlyLimit;
    });
    setCategoryLimits(map);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Safe-to-Spend & Warikoo Laws Budget Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate how changes to your income, Warikoo Law tier, and category limits impact your daily safe spending allowance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToProfile}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSaveBudget}
            className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center gap-1.5 cursor-pointer"
          >
            {savedNotification ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
            <span>{savedNotification ? 'Saved & Applied' : 'Apply & Save'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Safe-to-Spend & Warikoo Tier Box */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c3320] via-[#092617] to-[#04150c] border border-emerald-800/50 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeTier.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Current Tier: {activeTier.name}
                </h3>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${activeTier.badgeBg} font-mono font-bold`}>
                  {activeTier.incomeRangeText}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target User: <strong className="text-emerald-300">{activeTier.targetUser}</strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Simulated Safe Spend</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono tabular-nums">
              {formatINR(simSafeDaily)} <span className="text-xs font-normal text-slate-400">/ day</span>
            </div>
          </div>
        </div>

        {/* The Logic Box */}
        <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/50 flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-300">The Logic: </strong>
            {activeTier.logic}
          </div>
        </div>

        {/* Income & Buffer Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Income Slider */}
          <div className="space-y-2 p-4 rounded-2xl bg-black/30 border border-emerald-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Monthly Inflow (Income)</span>
              <span className="text-emerald-400 font-mono font-bold tabular-nums">
                {formatINR(simIncome)}
              </span>
            </div>
            <input
              type="range"
              min={15000}
              max={300000}
              step={2000}
              value={simIncome}
              onChange={(e) => handleIncomeSlider(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹15k (Tier 1)</span>
              <span>₹45k (Tier 2)</span>
              <span>₹85k (Tier 3)</span>
              <span>₹2.5L+ (Tier 4)</span>
            </div>
          </div>

          {/* Safety Contingency Buffer */}
          <div className="space-y-2 p-4 rounded-2xl bg-black/30 border border-emerald-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Contingency Buffer</span>
              <span className="text-blue-400 font-mono font-bold tabular-nums">
                {simBuffer}% of pool
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={simBuffer}
              onChange={(e) => setSimBuffer(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (aggressive)</span>
              <span>8% (balanced)</span>
              <span>20% (safe)</span>
            </div>
          </div>
        </div>

        {/* Live Simulator Summary Result */}
        <div className="p-4 rounded-2xl bg-black/50 border border-emerald-900/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Guaranteed Fixed Bills protected: <strong className="text-white font-mono tabular-nums">{formatINR(totalFixedBills)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Simulated Weekly Safe Spend: <strong className="text-white font-mono tabular-nums">{formatINR(simSafeWeekly)}</strong>
            </span>
            <span>·</span>
            <span>
              Days Remaining: <strong className="text-white font-mono tabular-nums">{metrics.daysRemainingInMonth}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Ideal Budget Section with Toggle Bar */}
      <div className="rounded-3xl bg-[#072418]/70 border border-emerald-900/50 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              Ideal Budget Distribution & Toggle Bar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on Warikoo Laws for your income group. Switch between Law Presets or tune custom ratios.
            </p>
          </div>

          {/* Toggle Bar Switcher */}
          <div className="bg-black/60 p-1 rounded-xl border border-emerald-900/60 flex items-center shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setSplitMode('preset');
                setCustomShield(activeTier.shieldPercent);
                setCustomNeeds(activeTier.needsPercent);
                setCustomWants(activeTier.wantsPercent);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                splitMode === 'preset'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Warikoo Preset</span>
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('custom')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                splitMode === 'custom'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Custom Tuning</span>
            </button>
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold">
              🛡️ Shield {idealBudget.shieldPercent}% ({formatINR(idealBudget.shieldAmount)})
            </span>
            <span className="text-blue-400 font-bold">
              🏠 Needs {idealBudget.needsPercent}% ({formatINR(idealBudget.needsAmount)})
            </span>
            <span className="text-pink-400 font-bold">
              ☕ Wants {idealBudget.wantsPercent}% ({formatINR(idealBudget.wantsAmount)})
            </span>
          </div>

          <div className="h-4 rounded-full bg-slate-900 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${idealBudget.shieldPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            />
            <div
              style={{ width: `${idealBudget.needsPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-300"
            />
            <div
              style={{ width: `${idealBudget.wantsPercent}%` }}
              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300"
            />
          </div>
        </div>

        {/* Fine-Tuning Sliders if in Custom Mode */}
        {splitMode === 'custom' && (
          <div className="p-4 rounded-2xl bg-black/40 border border-blue-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                Fine-Tune Split Sliders
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Total: {customShield + customNeeds + customWants}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 p-3 rounded-xl bg-black/40 border border-emerald-900/40">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400 font-medium">Day-Zero Shield</span>
                  <span className="text-white font-mono font-bold">{customShield}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={1}
                  value={customShield}
                  onChange={(e) => setCustomShield(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-black/40 border border-blue-900/40">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-400 font-medium">Needs Cap</span>
                  <span className="text-white font-mono font-bold">{customNeeds}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={85}
                  step={1}
                  value={customNeeds}
                  onChange={(e) => setCustomNeeds(Number(e.target.value))}
                  className="w-full accent-blue-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-black/40 border border-pink-900/40">
                <div className="flex justify-between text-xs">
                  <span className="text-pink-400 font-medium">Wants Cap</span>
                  <span className="text-white font-mono font-bold">{customWants}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={customWants}
                  onChange={(e) => setCustomWants(Number(e.target.value))}
                  className="w-full accent-pink-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3 Pillars Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Day-Zero Shield Column */}
          <div className="p-5 rounded-2xl bg-black/30 border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Day-Zero Shield ({idealBudget.shieldPercent}%)
              </span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                Target: {formatINR(idealBudget.shieldAmount)}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-300 font-mono tabular-nums">
                {formatINR(idealBudget.shieldAmount)}
              </p>
              <span className="text-[11px] text-slate-400">
                {idealBudget.shieldPercent}% of monthly inflow
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-400 w-full" />
            </div>
            <p className="text-[11px] text-slate-400">
              Forced into SIP, RD, or emergency reserve on payday before discretionary spending begins.
            </p>
          </div>

          {/* Needs Column */}
          <div className="p-5 rounded-2xl bg-black/30 border border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Needs Cap ({idealBudget.needsPercent}%)
              </span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                Target: {formatINR(idealBudget.needsAmount)}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono tabular-nums">
                {formatINR(allocatedNeeds)}
              </p>
              <span className="text-[11px] text-slate-400">
                Current limit total: {Math.round((allocatedNeeds / simIncome) * 100)}% of inflow
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-400"
                style={{ width: `${Math.min(100, (allocatedNeeds / idealBudget.needsAmount) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Rent, PG mess, groceries, fuel, electricity, courses, and loan EMIs.
            </p>
          </div>

          {/* Wants Column */}
          <div className="p-5 rounded-2xl bg-black/30 border border-pink-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                Wants Cap ({idealBudget.wantsPercent}%)
              </span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                Target: {formatINR(idealBudget.wantsAmount)}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono tabular-nums">
                {formatINR(allocatedWants)}
              </p>
              <span className="text-[11px] text-slate-400">
                Current limit total: {Math.round((allocatedWants / simIncome) * 100)}% of inflow
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-pink-400"
                style={{ width: `${Math.min(100, (allocatedWants / idealBudget.wantsAmount) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Swiggy/dining out, apparel shopping, movies, gadgets, and weekend leisure.
            </p>
          </div>
        </div>

        {/* Action: Recalibrate Categories Button */}
        <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            <strong>Auto-Balance Category Limits:</strong> Adjust all your individual category caps to match this {activeTier.name} formula.
          </div>
          <button
            onClick={handleApplyWarikooToCategories}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Recalibrate Category Limits</span>
          </button>
        </div>
      </div>

      {/* Category Monthly Spending Caps Editor */}
      <div className="rounded-3xl bg-[#072418]/70 border border-emerald-900/50 p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Monthly Category Limits</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set spending boundaries for each area to trigger automated overspending alerts
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Total Allocated: <strong className="text-white font-mono tabular-nums">{formatINR(allocatedNeeds + allocatedWants)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const currentLimit = categoryLimits[category.id] ?? category.monthlyLimit;

            return (
              <div
                key={category.id}
                className="p-4 rounded-2xl bg-black/30 border border-emerald-900/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{category.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono bg-slate-900 text-slate-400 border border-slate-800">
                    {category.group}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="500"
                    value={currentLimit}
                    onChange={(e) =>
                      setCategoryLimits((prev) => ({
                        ...prev,
                        [category.id]: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl bg-black/60 border border-emerald-800/50 pl-7 pr-3 py-2 text-sm font-mono font-bold text-white tabular-nums focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
