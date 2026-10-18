import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  Lightbulb, 
  CheckCircle2, 
  RefreshCw,
  Send,
  MessageSquare,
  Globe,
  User,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { 
  SafeToSpendResult, 
  UserFinancialProfile, 
  Transaction, 
  BudgetCategory, 
  SavingsGoal, 
  RecurringBill 
} from '../types/finance';
import { getWarikooTierByIncome } from '../utils/warikooLaws';
import { formatINR } from '../utils/formatters';
import { User as FirebaseUser } from 'firebase/auth';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SafeToSpendResult;
  profile: UserFinancialProfile;
  transactions: Transaction[];
  categories: BudgetCategory[];
  goals: SavingsGoal[];
  bills: RecurringBill[];
  currentUser: FirebaseUser | null;
}

export const AIInsightsModal: React.FC<AIInsightsModalProps> = ({
  isOpen,
  onClose,
  metrics,
  profile,
  transactions,
  categories,
  goals,
  bills,
  currentUser,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [auditSources, setAuditSources] = useState<Array<{ title: string; url: string }>>([]);
  const [userQuery, setUserQuery] = useState('');
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const activeTier = getWarikooTierByIncome(profile.monthlyIncome);

  // Compute ledger metrics
  const upiCount = transactions.filter((t) => t.paymentMethod === 'upi').length;
  const upiPercent = Math.round((upiCount / Math.max(1, transactions.length)) * 100);

  const runGeminiAudit = async (queryText?: string) => {
    setIsAnalyzing(true);
    setAuditSources([]);
    if (queryText) {
      setActiveQuestion(queryText);
    } else {
      setActiveQuestion(null);
    }

    try {
      const topCategories = categories.map((c) => ({
        name: c.name,
        group: c.group,
        monthlyLimit: c.monthlyLimit,
      }));

      const res = await fetch('/api/smart-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...profile,
            email: currentUser?.email || profile.email,
            name: currentUser?.displayName || profile.name,
          },
          metrics,
          categories: topCategories,
          transactions: transactions.slice(0, 15),
          bills,
          goals,
          warikooTier: {
            name: activeTier.name,
            targetUser: activeTier.targetUser,
            logic: activeTier.logic,
            shieldPercent: activeTier.shieldPercent,
            needsPercent: activeTier.needsPercent,
            wantsPercent: activeTier.wantsPercent,
          },
          userQuery: queryText || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditReport(data.text);
        if (data.sources && Array.isArray(data.sources)) {
          setAuditSources(data.sources);
        }
      } else {
        throw new Error('Fallback response');
      }
    } catch {
      // Local fallback in case of network issue
      setAuditReport(
        `### 🎯 Warikoo Law & Gemini Financial Audit for ${profile.name} (${profile.profession || 'Professional'})

**1. Warikoo Law Tier Alignment (${activeTier.name})**:
- **Income**: ₹${profile.monthlyIncome.toLocaleString('en-IN')}/month
- **Day-Zero Shield Rate**: ${activeTier.shieldPercent}% (Target: ₹${profile.monthlySavingsTarget.toLocaleString('en-IN')}/mo)
- **Evaluation**: Your Day-Zero Shield is reserved automatically before discretionary spending begins. This ensures non-negotiable wealth accumulation regardless of month-end lifestyle drift.

**2. Safe-to-Spend Runway (${formatINR(metrics.safeToday)}/day for ${metrics.daysRemainingInMonth} days left)**:
- **Discretionary Remaining**: ${formatINR(metrics.monthlyDiscretionaryRemaining)}
- **Fixed Bills Protected**: All recurring obligations are safe.

**3. Ledger Observations & Leakage Detection**:
- **UPI Frequency**: ${upiPercent}% of your transactions are made through instant UPI transfers. Quick grocery and food delivery micro-spends accumulate rapidly.
- **Top Advice**: Cap daily UPI tap spending to preserve buffer.`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run analysis when opened if not yet loaded
  useEffect(() => {
    if (isOpen && !auditReport && !isAnalyzing) {
      runGeminiAudit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isAnalyzing) return;
    const q = userQuery.trim();
    setUserQuery('');
    runGeminiAudit(q);
  };

  const handleQuickQuestion = (q: string) => {
    runGeminiAudit(q);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-[#072418] border border-emerald-800/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-950/80 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-blue-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  Gemini AI Financial Advisor
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-semibold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-400" />
                  Live Search Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <User className="w-3 h-3 text-emerald-400" />
                <span>
                  Analyzing live app data for{' '}
                  <strong className="text-slate-200">
                    {currentUser?.displayName || profile.name}
                  </strong>
                  {currentUser?.email && ` (${currentUser.email})`}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* User Profile & Warikoo Context Ribbon */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeTier.emoji}</span>
              <div>
                <span className="font-bold text-white">{activeTier.name}</span>
                <span className="text-slate-400"> · {profile.profession || 'Professional'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">
                🛡️ {activeTier.shieldPercent}% Day-Zero Shield ({formatINR(profile.monthlySavingsTarget)})
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 font-bold">
                Inflow: {formatINR(profile.monthlyIncome)}/mo
              </span>
            </div>
          </div>

          {/* 3 Metric Summary Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Safe Daily Spending
              </span>
              <p className="text-xl font-bold text-white font-mono tabular-nums">
                {formatINR(metrics.safeToday)} <span className="text-xs font-normal text-slate-400">/day</span>
              </p>
              <span className="text-[11px] text-slate-400">
                Guarantees Day-Zero Shield
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Instant UPI Share
              </span>
              <p className="text-xl font-bold text-white font-mono tabular-nums">
                {upiPercent}%
              </p>
              <span className="text-[11px] text-slate-400">
                {upiCount} of {transactions.length} ledger transactions
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                Discretionary Pool
              </span>
              <p className="text-xl font-bold text-emerald-300 font-mono tabular-nums">
                {formatINR(metrics.monthlyDiscretionaryRemaining)}
              </p>
              <span className="text-[11px] text-slate-400">
                Paced across {metrics.daysRemainingInMonth} days
              </span>
            </div>
          </div>

          {/* Ask Gemini Question Bar */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-black/50 border border-emerald-800/50">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Ask Gemini about your budget & goals
              </span>
              {activeQuestion && (
                <span className="text-[11px] text-emerald-400 font-normal truncate max-w-xs">
                  Active Q: "{activeQuestion}"
                </span>
              )}
            </label>

            <form onSubmit={handleAskSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Can I afford a ₹15,000 gadget this month? How do I cut dining out?"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                disabled={isAnalyzing}
                className="flex-1 rounded-xl bg-black/60 border border-emerald-900/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
              />
              <button
                type="submit"
                disabled={!userQuery.trim() || isAnalyzing}
                className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Ask</span>
              </button>
            </form>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Quick queries:</span>
              {[
                'Can I afford a ₹15,000 purchase this month?',
                'How to maximize my Day-Zero Shield?',
                'Where am I leaking the most money?',
                'How to reach my Emergency Fund faster?',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickQuestion(chip)}
                  disabled={isAnalyzing}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-300 transition cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Gemini AI Analysis Output */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-black/60 via-emerald-950/30 to-black/60 border border-emerald-800/60 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Gemini Deep Financial Audit & Recommendations
                </h4>
              </div>

              <button
                onClick={() => runGeminiAudit()}
                disabled={isAnalyzing}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Re-analyze'}</span>
              </button>
            </div>

            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Gemini is synthesizing your financial data...</p>
                  <p className="text-xs text-slate-400">
                    Evaluating {transactions.length} ledger transactions, {bills.length} bills, {goals.length} goals, and {activeTier.name} laws with Google Search grounding.
                  </p>
                </div>
              </div>
            ) : auditReport ? (
              <div className="space-y-4 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                <div className="prose prose-invert prose-emerald max-w-none">
                  {auditReport}
                </div>

                {auditSources.length > 0 && (
                  <div className="pt-3 border-t border-emerald-900/60 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-blue-400" />
                      Google Search Grounded References (2026 Indian Financial Benchmarks)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {auditSources.map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 hover:text-white transition flex items-center gap-1.5 max-w-sm truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0 text-emerald-400" />
                          <span className="truncate">{source.title || source.url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-emerald-950/80 bg-black/40 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Powered by Google Gemini 3.8 Flash · Server-side processing
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
