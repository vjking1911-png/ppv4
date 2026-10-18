import React from 'react';
import { LayoutDashboard, Wallet, ReceiptText, User as UserIcon, Plus } from 'lucide-react';
import { NavTab } from './TopBar';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#061e14]/95 backdrop-blur-lg border-t border-emerald-950/80 px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Home</span>
        </button>

        <button
          onClick={() => onTabChange('safetospend')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors cursor-pointer ${
            activeTab === 'safetospend' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Safe-Spend</span>
        </button>

        {/* Center Quick Action button */}
        <button
          onClick={onOpenAddModal}
          aria-label="Add transaction"
          className="flex flex-col items-center justify-center -mt-4 bg-emerald-400 text-slate-950 h-11 w-11 rounded-full shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => onTabChange('transactions')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors cursor-pointer ${
            activeTab === 'transactions' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Ledger</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
