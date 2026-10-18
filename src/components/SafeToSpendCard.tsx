import React, { useState } from 'react';
import { SafeToSpendResult, UserFinancialProfile } from '../types/finance';
import { formatINR } from '../utils/formatters';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  HelpCircle, 
  Calendar, 
  ArrowRight,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SafeToSpendCardProps {
  metrics: SafeToSpendResult;
  profile: UserFinancialProfile;
  onNavigateToPlanner?: () => void;
}

export const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  metrics,
  profile,
  onNavigateToPlanner,
}) => {
  const [showFormula, setShowFormula] = useState(false);

  const isTodayExceeded = metrics.spentToday > metrics.safeToday;
  const todayRemaining = Math.max(0, metrics.safeToday - metrics.spentToday);

  // Status visual configurations
  let statusBadge = {
    label: 'On Track',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/60',
    borderColor: 'border-emerald-800/60',
    icon: ShieldCheck,
    description: 'Spending pace is sustainable for your monthly savings goal.',
  };

  if (metrics.status === 'caution') {
    statusBadge = {
      label: 'Caution Pacing',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/60',
      borderColor: 'border-amber-800/60',
      icon: AlertTriangle,
      description: 'You are spending slightly ahead of your monthly discretionary curve.',
    };
  } else if (metrics.status === 'critical') {
    statusBadge = {
      label: 'Budget Alert',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-950/60',
      borderColor: 'border-rose-800/60',
      icon: Flame,
      description: 'Discretionary allowance for this month is depleted.',
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c3320] via-[#092617] to-[#04150c] border border-emerald-800/40 p-6 sm:p-8 shadow-xl">
      {/* Subtle background glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
              Daily Safe-to-Spend
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400/70" />
              {metrics.daysRemainingInMonth} days left this month
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.bgColor} ${statusBadge.borderColor} ${statusBadge.textColor}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusBadge.label}</span>
            </div>

            <button
              onClick={() => setShowFormula(!showFormula)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Show Safe-to-Spend formula"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Safe-to-Spend Numbers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Giant Daily Number */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono tabular-nums">
                {formatINR(metrics.safeToday)}
              </span>
              <span className="text-sm sm:text-base font-medium text-emerald-300/80">/ day</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span>
                Spent today:{' '}
                <strong className={`font-mono tabular-nums ${isTodayExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatINR(metrics.spentToday)}
                </strong>
              </span>
              <span>·</span>
              <span>
                Remaining today:{' '}
                <strong className="font-mono tabular-nums text-white">
                  {formatINR(todayRemaining)}
                </strong>
              </span>
            </div>

            {/* Micro Progress Bar of Today's spend */}
            <div className="mt-2 w-full max-w-md h-2 rounded-full bg-emerald-950/80 overflow-hidden border border-emerald-900/40">
              <div
                className={`h-full transition-all duration-500 ${
                  isTodayExceeded
                    ? 'bg-rose-500'
                    : metrics.spentToday > metrics.safeToday * 0.75
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    metrics.safeToday > 0 ? (metrics.spentToday / metrics.safeToday) * 100 : 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Secondary Weekly and Monthly stats */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-emerald-900/50 lg:pl-6">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Safe This Week
              </span>
              <p className="text-xl font-bold text-white font-mono tabular-nums">
                {formatINR(metrics.safeThisWeek)}
              </p>
              <span className="text-[11px] text-slate-400">7-day rolling window</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Pool Left
              </span>
              <p className="text-xl font-bold text-emerald-300 font-mono tabular-nums">
                {formatINR(metrics.monthlyDiscretionaryRemaining)}
              </p>
              <span className="text-[11px] text-slate-400">Discretionary pool</span>
            </div>
          </div>
        </div>

        {/* Expandable Mathematical Transparency Drawer */}
        {showFormula && (
          <div className="rounded-2xl bg-black/40 border border-emerald-900/60 p-4 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> How Safe-to-Spend is Calculated
              </span>
              <button
                onClick={() => setShowFormula(false)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Safe-to-Spend guarantees your rent, upcoming bills, and savings goals are 100% safeguarded before allocating guilt-free spending money.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-900/40 text-[11px]">
              <div>
                <span className="text-slate-500">Monthly Inflow:</span>
                <p className="font-mono tabular-nums text-white font-medium">{formatINR(metrics.totalIncome)}</p>
              </div>
              <div>
                <span className="text-slate-500">Fixed Bills:</span>
                <p className="font-mono tabular-nums text-rose-400 font-medium">-{formatINR(metrics.totalFixedBills)}</p>
              </div>
              <div>
                <span className="text-slate-500">Savings Target:</span>
                <p className="font-mono tabular-nums text-amber-400 font-medium">-{formatINR(metrics.totalSavingsAllocated)}</p>
              </div>
              <div>
                <span className="text-slate-500">Discretionary Pool:</span>
                <p className="font-mono tabular-nums text-emerald-300 font-medium">{formatINR(metrics.monthlyDiscretionaryPool)}</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/40">
              <span className="text-emerald-300 font-medium">Formula:</span> (Remaining Discretionary Pool {formatINR(metrics.monthlyDiscretionaryRemaining)} × {100 - profile.dailyBufferPercent}% buffer) ÷ {metrics.daysRemainingInMonth} Days Left = <strong className="text-white">{formatINR(metrics.safeToday)}/day</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
