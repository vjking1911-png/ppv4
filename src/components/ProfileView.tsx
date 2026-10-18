import React, { useState } from 'react';
import { 
  UserFinancialProfile, 
  BudgetCategory, 
  WarikooTierId 
} from '../types/finance';
import { 
  WARIKOO_TIERS, 
  POPULAR_PROFESSIONS, 
  getWarikooTierByIncome, 
  calculateIdealBudget, 
  calibrateCategoriesToWarikooLaw 
} from '../utils/warikooLaws';
import { formatINR } from '../utils/formatters';
import { User } from 'firebase/auth';
import { 
  User as UserIcon, 
  Briefcase, 
  IndianRupee, 
  Calendar, 
  ShieldCheck, 
  Sliders, 
  Save, 
  Check, 
  RefreshCw, 
  Sparkles, 
  BookOpen, 
  CloudCheck, 
  RotateCcw,
  ExternalLink,
  Award,
  Zap
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserFinancialProfile;
  categories: BudgetCategory[];
  currentUser: User | null;
  onUpdateProfile: (updated: UserFinancialProfile) => void;
  onUpdateCategories: (updated: BudgetCategory[]) => void;
  onOpenOnboarding: () => void;
  onResetData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  categories,
  currentUser,
  onUpdateProfile,
  onUpdateCategories,
  onOpenOnboarding,
  onResetData,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [profession, setProfession] = useState(profile.profession || 'Mid-Level Professional');
  const [income, setIncome] = useState(profile.monthlyIncome || 85000);
  const [payday, setPayday] = useState(profile.payday || 1);
  const [bufferPercent, setBufferPercent] = useState(profile.dailyBufferPercent || 8);

  // Toggle Bar: Warikoo Law Preset vs Custom Tuning
  const [splitMode, setSplitMode] = useState<'preset' | 'custom'>(profile.budgetSplitMode || 'preset');

  const currentTier = getWarikooTierByIncome(income);
  const [customShield, setCustomShield] = useState(
    profile.customSplit?.shieldPercent ?? currentTier.shieldPercent
  );
  const [customNeeds, setCustomNeeds] = useState(
    profile.customSplit?.needsPercent ?? currentTier.needsPercent
  );
  const [customWants, setCustomWants] = useState(
    profile.customSplit?.wantsPercent ?? currentTier.wantsPercent
  );

  const [savedNotification, setSavedNotification] = useState(false);

  const activeTier = getWarikooTierByIncome(income);

  // Ideal budget calculation
  const idealBudget = calculateIdealBudget(
    income,
    splitMode === 'custom'
      ? { shieldPercent: customShield, needsPercent: customNeeds, wantsPercent: customWants }
      : undefined
  );

  const totalCustomPercent = customShield + customNeeds + customWants;

  const handleSave = () => {
    const updatedProfile: UserFinancialProfile = {
      ...profile,
      name: name.trim() || profile.name,
      profession,
      monthlyIncome: income,
      payday,
      dailyBufferPercent: bufferPercent,
      monthlySavingsTarget: idealBudget.shieldAmount,
      selectedTier: activeTier.id,
      budgetSplitMode: splitMode,
      customSplit: splitMode === 'custom' ? {
        shieldPercent: customShield,
        needsPercent: customNeeds,
        wantsPercent: customWants,
      } : undefined,
      updatedAt: new Date().toISOString(),
    };

    // Calibrate categories to match the updated ideal budget
    const calibratedCategories = calibrateCategoriesToWarikooLaw(
      categories,
      income,
      idealBudget.needsAmount,
      idealBudget.wantsAmount,
      idealBudget.shieldAmount
    );

    onUpdateProfile(updatedProfile);
    onUpdateCategories(calibratedCategories);

    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleResetToTierPreset = () => {
    setSplitMode('preset');
    setCustomShield(activeTier.shieldPercent);
    setCustomNeeds(activeTier.needsPercent);
    setCustomWants(activeTier.wantsPercent);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <UserIcon className="w-6 h-6 text-emerald-400" />
            Financial Profile & Rules Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile, profession tier, and live Warikoo Law budget splits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenOnboarding}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rerun Onboarding</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center gap-1.5 cursor-pointer"
          >
            {savedNotification ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
            <span>{savedNotification ? 'Saved & Calibrated' : 'Save & Calibrate'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: User Details + Current Tier Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Identity & Account */}
        <div className="lg:col-span-1 rounded-3xl bg-[#072418]/80 border border-emerald-900/60 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {name ? name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{name || 'Your Profile'}</h3>
              <p className="text-xs text-emerald-400 font-medium">{profession}</p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser ? 'Firebase Cloud Synced' : 'Local Storage Mode'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-900/50 pt-5 space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-black/50 border border-emerald-900/80 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Profession Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                Profession / Career Stage
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full rounded-xl bg-black/50 border border-emerald-900/80 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                {POPULAR_PROFESSIONS.map((p) => (
                  <option key={p.label} value={p.label} className="bg-slate-900 text-white">
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Inflow Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                Monthly Take-Home Inflow
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-mono">₹</span>
                <input
                  type="number"
                  step="1000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-black/50 border border-emerald-900/80 pl-7 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Payday & Buffer */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Payday
                </label>
                <select
                  value={payday}
                  onChange={(e) => setPayday(Number(e.target.value))}
                  className="w-full rounded-xl bg-black/50 border border-emerald-900/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="bg-slate-900 text-white">
                      Day {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Buffer
                </label>
                <select
                  value={bufferPercent}
                  onChange={(e) => setBufferPercent(Number(e.target.value))}
                  className="w-full rounded-xl bg-black/50 border border-emerald-900/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                >
                  <option value={5} className="bg-slate-900 text-white">5% (Tight)</option>
                  <option value={8} className="bg-slate-900 text-white">8% (Balanced)</option>
                  <option value={12} className="bg-slate-900 text-white">12% (Safe)</option>
                  <option value={15} className="bg-slate-900 text-white">15% (Strict)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Danger Zone: Reset Demo Data */}
          <div className="pt-2 border-t border-emerald-900/40">
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data back to initial defaults?')) {
                  onResetData();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-900/50 text-red-400 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Data</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Active Warikoo Law & Toggle Bar Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tier Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#0c3320] via-[#092617] to-[#04150c] border border-emerald-800/60 p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeTier.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{activeTier.name}</h3>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${activeTier.badgeBg} font-mono font-bold`}>
                      {activeTier.incomeRangeText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeTier.tagline} · Target: <strong className="text-emerald-400">{activeTier.targetUser}</strong>
                  </p>
                </div>
              </div>

              {/* The Toggle Bar Feature */}
              <div className="bg-black/60 p-1 rounded-xl border border-emerald-900/60 flex items-center shrink-0">
                <button
                  type="button"
                  onClick={handleResetToTierPreset}
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
                  <span>Custom Sliders</span>
                </button>
              </div>
            </div>

            {/* The Logic Box */}
            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/60 flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-emerald-300">The Logic: </strong>
                {activeTier.logic}
              </div>
            </div>

            {/* Stacked Proportional Split Bar */}
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

            {/* Interactive Sliders (When Custom Tuning is active) */}
            {splitMode === 'custom' && (
              <div className="p-4 rounded-2xl bg-black/50 border border-blue-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    Interactive Ratio Tuning Sliders
                  </span>
                  <span className={`text-xs font-mono font-bold ${
                    totalCustomPercent === 100 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    Total: {totalCustomPercent}% {totalCustomPercent !== 100 && '(recommended: 100%)'}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Day-Zero Shield Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-400 font-medium">Day-Zero Shield (Invest / Save)</span>
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
              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Day-Zero Shield ({idealBudget.shieldPercent}%)
                </span>
                <div className="text-xl font-bold font-mono text-emerald-300">
                  {formatINR(idealBudget.shieldAmount)}
                </div>
                <p className="text-[10px] text-slate-400">
                  Forced into SIP/emergency vault on payday.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-blue-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Needs Cap ({idealBudget.needsPercent}%)
                </span>
                <div className="text-xl font-bold font-mono text-blue-300">
                  {formatINR(idealBudget.needsAmount)}
                </div>
                <p className="text-[10px] text-slate-400">
                  Rent, utilities, groceries & EMIs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-pink-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                  Wants Cap ({idealBudget.wantsPercent}%)
                </span>
                <div className="text-xl font-bold font-mono text-pink-300">
                  {formatINR(idealBudget.wantsAmount)}
                </div>
                <p className="text-[10px] text-slate-400">
                  Dining out, lifestyle & shopping.
                </p>
              </div>
            </div>
          </div>

          {/* All 4 Warikoo Laws Reference Table */}
          <div className="rounded-3xl bg-[#072418]/70 border border-emerald-900/50 p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              The 4 Warikoo Laws Income Tiers Reference
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(WARIKOO_TIERS).map((t) => {
                const isCurrent = t.id === activeTier.id;
                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition ${
                      isCurrent
                        ? 'bg-emerald-500/10 border-emerald-400 text-white'
                        : 'bg-black/30 border-emerald-950/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{t.emoji}</span>
                        <span className={isCurrent ? 'text-white' : 'text-slate-200'}>{t.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${t.badgeBg}`}>
                        {t.incomeRangeText}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-emerald-400">🛡️ {t.shieldPercent}%</span>
                      <span className="text-blue-400">🏠 {t.needsPercent}%</span>
                      <span className="text-pink-400">☕ {t.wantsPercent}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2">
                      {t.logic}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
