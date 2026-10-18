import React, { useState } from 'react';
import { SavingsGoal } from '../types/finance';
import { formatINR, formatDate } from '../utils/formatters';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Coins, 
  TrendingUp, 
  X,
  AlertCircle,
  Download
} from 'lucide-react';
import { generateSavingsGoalsCSV } from '../utils/csvParser';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoalFunds: (goalId: string, addedAmount: number) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenExportModal?: () => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  onAddGoal,
  onUpdateGoalFunds,
  onDeleteGoal,
  onOpenExportModal,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<SavingsGoal['category']>('emergency');
  const [monthlyTargetStr, setMonthlyTargetStr] = useState('');

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(targetAmountStr);
    const currentAmount = parseFloat(currentAmountStr) || 0;
    const monthlyTarget = parseFloat(monthlyTargetStr) || Math.round(targetAmount / 12);

    if (!title.trim() || isNaN(targetAmount) || targetAmount <= 0) return;

    onAddGoal({
      title: title.trim(),
      targetAmount,
      currentAmount,
      targetDate: targetDate || '2027-12-31',
      category,
      color: '#10b981',
      monthlyTarget,
    });

    setIsCreateOpen(false);
    setTitle('');
    setTargetAmountStr('');
    setCurrentAmountStr('0');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!activeDepositGoal || isNaN(amt) || amt <= 0) return;

    onUpdateGoalFunds(activeDepositGoal.id, amt);
    setActiveDepositGoal(null);
    setDepositAmount('');
  };

  const handleDownloadGoals = () => {
    if (onOpenExportModal) {
      onOpenExportModal();
    } else {
      const csv = generateSavingsGoalsCSV(goals);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PaisaPlan_SavingsGoals_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Savings Goals & Wealth Milestones
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Set dedicated targets for emergency reserves, asset purchases, gold, and experiences
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={handleDownloadGoals}
            className="px-3.5 py-2 rounded-xl bg-[#092216] border border-emerald-800/60 text-xs font-semibold text-slate-200 hover:bg-[#0e3523] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Aggregate Savings Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c3320] via-[#092617] to-[#04150c] border border-emerald-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Total Wealth Reserves
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tabular-nums">
              {formatINR(totalSaved)}
            </span>
            <span className="text-sm text-slate-400 font-mono tabular-nums">
              of {formatINR(totalTarget)} target
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Across {goals.length} dedicated active milestone vaults.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-300 font-mono tabular-nums">
              {overallProgress}%
            </span>
            <span className="text-xs text-slate-400">Total Completion</span>
          </div>

          <div className="w-48 sm:w-64 h-2.5 rounded-full bg-emerald-950 overflow-hidden border border-emerald-900/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isComplete = percent >= 100;
          const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-6 rounded-3xl bg-[#072418]/70 border border-emerald-900/50 flex flex-col justify-between space-y-5 hover:border-emerald-800/70 transition shadow-lg"
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {goal.category}
                    </span>
                    <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold tabular-nums ${
                      isComplete
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-black/40 text-amber-300 border border-amber-900/40'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>

                {/* Amount Numbers */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Saved:</span>
                    <span className="text-xl font-extrabold text-white font-mono tabular-nums">
                      {formatINR(goal.currentAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
                    <span>Target: {formatINR(goal.targetAmount)}</span>
                    <span>Remaining: {formatINR(remainingAmount)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-black/50 overflow-hidden border border-emerald-950">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Target Date & Contribution */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-t border-emerald-950/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Target: {formatDate(goal.targetDate)}
                  </span>
                  <span>
                    Plan: <strong className="text-white font-mono tabular-nums">{formatINR(goal.monthlyTarget)}/mo</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setActiveDepositGoal(goal)}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Deposit Funds</span>
                </button>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="py-2 px-3 text-xs text-slate-500 hover:text-rose-400 rounded-xl transition cursor-pointer"
                  title="Remove goal"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Funds Modal */}
      {activeDepositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#092216] border border-emerald-800/60 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Add Funds to Goal</h3>
                <p className="text-xs text-slate-400">{activeDepositGoal.title}</p>
              </div>
              <button
                onClick={() => setActiveDepositGoal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-400 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    autoFocus
                    placeholder="5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full rounded-2xl bg-black/50 border border-emerald-800/60 pl-10 pr-4 py-3 text-2xl font-bold text-white font-mono tabular-nums focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  {[2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt.toString())}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-xs font-mono text-emerald-300"
                    >
                      +{formatINR(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveDepositGoal(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[#092216] border border-emerald-800/60 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Create Savings Goal</h3>
                <p className="text-xs text-slate-400">Lock in your next financial objective</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Laptop, SGB Gold, Bali Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Target (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="100000"
                    value={targetAmountStr}
                    onChange={(e) => setTargetAmountStr(e.target.value)}
                    className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Already Saved (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmountStr}
                    onChange={(e) => setCurrentAmountStr(e.target.value)}
                    className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Vault Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="emergency">Emergency Reserve</option>
                    <option value="gold">Gold & Sovereign Bonds</option>
                    <option value="vehicle">Vehicle / Bike</option>
                    <option value="travel">Travel & Experience</option>
                    <option value="tech">Gadget & Tech</option>
                    <option value="other">General Wealth</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl"
                >
                  Create Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
