import React, { useState, useId } from 'react';
import { 
  UserFinancialProfile, 
  BudgetCategory, 
  WarikooTierId, 
  WarikooTier 
} from '../types/finance';
import { 
  WARIKOO_TIERS, 
  POPULAR_PROFESSIONS, 
  getWarikooTierByIncome, 
  calculateIdealBudget, 
  calibrateCategoriesToWarikooLaw 
} from '../utils/warikooLaws';
import { formatINR } from '../utils/formatters';
import { PaisaPlanLogo } from './PaisaPlanLogo';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Sliders, 
  Briefcase, 
  IndianRupee, 
  User, 
  BookOpen, 
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserFinancialProfile;
  categories: BudgetCategory[];
  onComplete: (updatedProfile: UserFinancialProfile, updatedCategories: BudgetCategory[]) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  categories,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(currentProfile.name || '');
  const [profession, setProfession] = useState(currentProfile.profession || 'Mid-Level Professional');
  const [customProfession, setCustomProfession] = useState('');
  const [isCustomProf, setIsCustomProf] = useState(false);
  const [income, setIncome] = useState<number>(currentProfile.monthlyIncome || 85000);

  // Toggle bar: 'preset' (Warikoo Law default) or 'custom' (user tweaks sliders)
  const [splitMode, setSplitMode] = useState<'preset' | 'custom'>(currentProfile.budgetSplitMode || 'preset');

  // Interactive slider values for custom mode
  const currentTier = getWarikooTierByIncome(income);
  const [customShield, setCustomShield] = useState(currentTier.shieldPercent);
  const [customNeeds, setCustomNeeds] = useState(currentTier.needsPercent);
  const [customWants, setCustomWants] = useState(currentTier.wantsPercent);

  const nameInputId = useId();
  const incomeInputId = useId();

  if (!isOpen) return null;

  const activeProfession = isCustomProf ? (customProfession || 'Professional') : profession;

  // Whenever income changes, if in preset mode, update custom sliders to match the new tier
  const handleIncomeChange = (newIncome: number) => {
    setIncome(newIncome);
    const newTier = getWarikooTierByIncome(newIncome);
    if (splitMode === 'preset') {
      setCustomShield(newTier.shieldPercent);
      setCustomNeeds(newTier.needsPercent);
      setCustomWants(newTier.wantsPercent);
    }
  };

  const selectedTier = getWarikooTierByIncome(income);

  // Calculations for preview
  const budget = calculateIdealBudget(
    income,
    splitMode === 'custom'
      ? { shieldPercent: customShield, needsPercent: customNeeds, wantsPercent: customWants }
      : undefined
  );

  const totalCustomPercent = customShield + customNeeds + customWants;

  const handleFinish = () => {
    const finalProfile: UserFinancialProfile = {
      ...currentProfile,
      name: name.trim() || 'My Financial Profile',
      profession: activeProfession,
      monthlyIncome: income,
      monthlySavingsTarget: budget.shieldAmount,
      hasCompletedOnboarding: true,
      selectedTier: selectedTier.id,
      budgetSplitMode: splitMode,
      customSplit: splitMode === 'custom' ? {
        shieldPercent: customShield,
        needsPercent: customNeeds,
        wantsPercent: customWants,
      } : undefined,
      updatedAt: new Date().toISOString(),
    };

    // Auto-calibrate category limits proportionally
    const calibratedCategories = calibrateCategoriesToWarikooLaw(
      categories,
      income,
      budget.needsAmount,
      budget.wantsAmount,
      budget.shieldAmount
    );

    onComplete(finalProfile, calibratedCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#072418] border border-emerald-800/60 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 sm:px-8 pt-7 pb-5 border-b border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PaisaPlanLogo size={40} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {step === 1 ? 'Personalize Your Financial Engine' : 'Your Ideal Warikoo Law Budget'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                  Step {step} of 2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 1
                  ? 'Tell us about your profession and income to calibrate mathematical spending rules.'
                  : `Calibrated specifically for ${activeProfession} under ₹${income.toLocaleString('en-IN')}/mo.`}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {step === 1 ? (
            /* STEP 1: Name, Profession, Income */
            <div className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor={nameInputId} className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Your Full Name</span>
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  placeholder="e.g. Vijay Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-black/40 border border-emerald-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              {/* Profession Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Select Your Profession / Stage</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Selected: {activeProfession}
                  </span>
                </label>

                {/* Popular chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_PROFESSIONS.map((p) => {
                    const isSelected = !isCustomProf && profession === p.label;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setProfession(p.label);
                          setIsCustomProf(false);
                        }}
                        className={`text-left p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm shadow-emerald-500/20'
                            : 'bg-black/30 border-emerald-950/60 text-slate-300 hover:bg-black/50 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{p.icon}</span>
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom profession option */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCustomProf(!isCustomProf)}
                    className="text-xs text-emerald-400 hover:underline cursor-pointer"
                  >
                    {isCustomProf ? '← Choose from suggested list' : '+ Enter custom profession title'}
                  </button>
                  {isCustomProf && (
                    <input
                      type="text"
                      placeholder="e.g. Architect, Data Scientist, Content Creator"
                      value={customProfession}
                      onChange={(e) => setCustomProfession(e.target.value)}
                      className="mt-2 w-full rounded-xl bg-black/40 border border-emerald-900/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  )}
                </div>
              </div>

              {/* Monthly Income Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor={incomeInputId} className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Monthly Take-Home Inflow (Income)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {formatINR(income)} / month
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400 font-mono">
                    ₹
                  </span>
                  <input
                    id={incomeInputId}
                    type="number"
                    step="1000"
                    min="5000"
                    max="1000000"
                    value={income || ''}
                    onChange={(e) => handleIncomeChange(Number(e.target.value) || 0)}
                    className="w-full rounded-2xl bg-black/40 border border-emerald-900/80 pl-9 pr-4 py-3 text-base font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>

                {/* Quick preset chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Quick select:</span>
                  {[
                    { label: '₹22,000 (Tier 1)', val: 22000 },
                    { label: '₹45,000 (Tier 2)', val: 45000 },
                    { label: '₹85,000 (Tier 3)', val: 85000 },
                    { label: '₹2,50,000 (Tier 4)', val: 250000 },
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => handleIncomeChange(chip.val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer border ${
                        income === chip.val
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-black/30 border-emerald-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Instant Warikoo Tier Preview Box */}
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-800/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedTier.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Auto-Detected: {selectedTier.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${selectedTier.badgeBg}`}>
                          {selectedTier.incomeRangeText}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Targeted for {selectedTier.targetUser}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono text-emerald-400">
                    <span>{selectedTier.shieldPercent}% Shield</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: The Ideal Budget Breakdown + Toggle Bar */
            <div className="space-y-6">
              {/* Matched Tier Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-black/50 via-emerald-950/30 to-black/50 border border-emerald-800/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{selectedTier.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{selectedTier.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${selectedTier.badgeBg}`}>
                          {selectedTier.incomeRangeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Profile: <strong className="text-emerald-400">{activeProfession}</strong> · Inflow: <strong className="text-white font-mono">{formatINR(income)}/mo</strong>
                      </p>
                    </div>
                  </div>

                  {/* Toggle Bar Switcher */}
                  <div className="bg-black/60 p-1 rounded-xl border border-emerald-900/60 flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSplitMode('preset');
                        setCustomShield(selectedTier.shieldPercent);
                        setCustomNeeds(selectedTier.needsPercent);
                        setCustomWants(selectedTier.wantsPercent);
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                        splitMode === 'preset'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Warikoo Law Preset</span>
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

                {/* The Logic Box */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-900/40 flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-300">The Logic: </strong>
                    {selectedTier.logic}
                  </p>
                </div>
              </div>

              {/* Visual Split Ratio Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">
                    🛡️ Shield {budget.shieldPercent}% ({formatINR(budget.shieldAmount)})
                  </span>
                  <span className="text-blue-400 font-semibold">
                    🏠 Needs {budget.needsPercent}% ({formatINR(budget.needsAmount)})
                  </span>
                  <span className="text-pink-400 font-semibold">
                    ☕ Wants {budget.wantsPercent}% ({formatINR(budget.wantsAmount)})
                  </span>
                </div>

                {/* Stacked Proportional Bar */}
                <div className="h-4 rounded-full bg-slate-900 overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${budget.shieldPercent}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    title={`Day-Zero Shield: ${budget.shieldPercent}%`}
                  />
                  <div
                    style={{ width: `${budget.needsPercent}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-300"
                    title={`Needs: ${budget.needsPercent}%`}
                  />
                  <div
                    style={{ width: `${budget.wantsPercent}%` }}
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300"
                    title={`Wants: ${budget.wantsPercent}%`}
                  />
                </div>
              </div>

              {/* If in Custom Tuning Mode: Show Interactive Sliders */}
              {splitMode === 'custom' && (
                <div className="p-4 rounded-2xl bg-black/40 border border-blue-900/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-400" />
                      Fine-Tune Split Sliders
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      totalCustomPercent === 100 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      Total: {totalCustomPercent}% {totalCustomPercent !== 100 && '(Recommended: 100%)'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Day-Zero Shield Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-400 font-medium">Day-Zero Shield (Invest)</span>
                        <span className="text-white font-mono font-bold">{customShield}% · {formatINR(Math.round(income * customShield / 100))}</span>
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

                    {/* Needs Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-blue-400 font-medium">Needs Cap (Living Costs)</span>
                        <span className="text-white font-mono font-bold">{customNeeds}% · {formatINR(Math.round(income * customNeeds / 100))}</span>
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

                    {/* Wants Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-pink-400 font-medium">Wants Cap (Discretionary)</span>
                        <span className="text-white font-mono font-bold">{customWants}% · {formatINR(Math.round(income * customWants / 100))}</span>
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

              {/* 3 Pillar Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Shield Card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Day-Zero Shield ({budget.shieldPercent}%)
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-300">
                    {formatINR(budget.shieldAmount)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Auto-debited on payday into emergency SIP or recurring deposit.
                  </p>
                </div>

                {/* Needs Card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-blue-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Needs Cap ({budget.needsPercent}%)
                  </span>
                  <div className="text-xl font-bold font-mono text-blue-300">
                    {formatINR(budget.needsAmount)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Rent, electricity, groceries, medicine, commute & courses.
                  </p>
                </div>

                {/* Wants Card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-pink-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                    Wants Cap ({budget.wantsPercent}%)
                  </span>
                  <div className="text-xl font-bold font-mono text-pink-300">
                    {formatINR(budget.wantsAmount)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Swiggy, outings, apparel, OTT subscriptions & casual fun.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-5 border-t border-emerald-900/60 bg-black/30 flex items-center justify-between gap-4">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Calculate My Ideal Budget</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                ← Back to Details
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Apply & Launch My Engine</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
