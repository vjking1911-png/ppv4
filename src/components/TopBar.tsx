import React from 'react';
import { PaisaPlanLogo } from './PaisaPlanLogo';
import { AuthStatus } from './AuthStatus';
import { User } from 'firebase/auth';
import { UserFinancialProfile } from '../types/finance';
import { getWarikooTierByIncome } from '../utils/warikooLaws';
import { Plus, Sparkles, Globe, User as UserIcon } from 'lucide-react';

export type NavTab = 'dashboard' | 'safetospend' | 'transactions' | 'goals' | 'bills' | 'profile';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  onOpenAIInsights: () => void;
  onOpenMarketIntel: () => void;
  user: User | null;
  profile?: UserFinancialProfile;
  isSyncing: boolean;
  onLoginSuccess?: (user: User) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenAIInsights,
  onOpenMarketIntel,
  user,
  profile,
  isSyncing,
  onLoginSuccess,
}) => {
  const currentTier = profile ? getWarikooTierByIncome(profile.monthlyIncome) : null;

  return (
    <header className="sticky top-0 z-40 bg-[#061e14]/90 backdrop-blur-md border-b border-emerald-950/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="text-left flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus:outline-none cursor-pointer"
        >
          <PaisaPlanLogo size={36} />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              Paisa<span className="text-emerald-400">Plan</span>
            </span>
            <span className="text-[10px] text-emerald-500/70 font-medium tracking-wider uppercase -mt-0.5 hidden sm:block">
              Personal Budget Planner
            </span>
          </div>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onTabChange('safetospend')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'safetospend'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Safe-to-Spend
          </button>

          <button
            onClick={() => onTabChange('transactions')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Ledger
          </button>

          <button
            onClick={() => onTabChange('goals')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'goals'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Savings Goals
          </button>

          <button
            onClick={() => onTabChange('bills')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeTab === 'bills'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Bills & Due Dates
          </button>

          {/* Dedicated Profile & Warikoo Laws Tab */}
          <button
            onClick={() => onTabChange('profile')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Profile & Rules</span>
          </button>
        </nav>

        {/* Zone 3: Market Grounding, Auth status, and Add Entry Action */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live Market Intel (Google Search Grounding) */}
          <button
            onClick={onOpenMarketIntel}
            title="Live Indian Market Data grounded with Google Search"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-300 bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/50 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Live Intel</span>
          </button>

          {/* AI Advisor Trigger */}
          <button
            onClick={onOpenAIInsights}
            title="Generate AI spending audit"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Advisor</span>
          </button>

          {/* Quick Profile Trigger Button */}
          <button
            onClick={() => onTabChange('profile')}
            title="Open Financial Profile & Warikoo Laws"
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-black/40 border-emerald-900/60 text-slate-300 hover:text-white'
            }`}
          >
            {currentTier ? (
              <span className="text-sm">{currentTier.emoji}</span>
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden md:inline font-semibold">
              {profile?.name ? profile.name.split(' ')[0] : 'Profile'}
            </span>
          </button>

          {/* Google Sign-in / Firebase Auth */}
          <AuthStatus
            user={user}
            isSyncing={isSyncing}
            onLoginSuccess={onLoginSuccess}
          />

          {/* Add Entry CTA */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
