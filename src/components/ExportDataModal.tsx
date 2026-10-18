import React from 'react';
import { 
  X, 
  Download, 
  Receipt, 
  Target, 
  Layers, 
  CheckCircle2, 
  FileSpreadsheet,
  Coins,
  ArrowDownToLine
} from 'lucide-react';
import { Transaction, SavingsGoal, BudgetCategory } from '../types/finance';
import { generateTransactionsCSV, generateSavingsGoalsCSV } from '../utils/csvParser';
import { formatINR } from '../utils/formatters';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  goals: SavingsGoal[];
  categories: BudgetCategory[];
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  transactions,
  goals,
  categories,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const totalExpenseSum = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTransactions = () => {
    const csv = generateTransactionsCSV(transactions, categories);
    downloadFile(csv, `PaisaPlan_Transactions_${todayStr}.csv`);
  };

  const handleDownloadGoals = () => {
    const csv = generateSavingsGoalsCSV(goals);
    downloadFile(csv, `PaisaPlan_SavingsGoals_${todayStr}.csv`);
  };

  const handleDownloadAll = () => {
    const txCsv = generateTransactionsCSV(transactions, categories);
    const goalsCsv = generateSavingsGoalsCSV(goals);
    const combined = `=== PAISAPLAN TRANSACTION HISTORY ===\n${txCsv}\n\n=== PAISAPLAN SAVINGS GOALS ===\n${goalsCsv}`;
    downloadFile(combined, `PaisaPlan_Complete_Backup_${todayStr}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-[#092216] border border-emerald-800/60 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Export Data to CSV</h3>
              <p className="text-xs text-slate-400">Download clean spreadsheet backups of your expenses and savings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-emerald-900/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Body */}
        <div className="p-6 space-y-4">
          {/* Option 1: Transactions CSV */}
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/50 flex items-center justify-between gap-4 hover:border-emerald-700/60 transition group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition">
                  Transaction Ledger CSV
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  <span className="font-mono text-white font-semibold">{transactions.length}</span> records · Total volume{' '}
                  <span className="font-mono text-emerald-400 font-semibold">{formatINR(totalExpenseSum)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTransactions}
              className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {/* Option 2: Savings Goals CSV */}
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/50 flex items-center justify-between gap-4 hover:border-emerald-700/60 transition group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition">
                  Savings Goals & Vaults CSV
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  <span className="font-mono text-white font-semibold">{goals.length}</span> goals · Accumulated{' '}
                  <span className="font-mono text-amber-300 font-semibold">{formatINR(totalGoalSaved)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadGoals}
              className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {/* Option 3: Combined Complete Backup */}
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/50 flex items-center justify-between gap-4 hover:border-emerald-700/60 transition group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/40 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition">
                  All-in-One Data Archive
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete ledger, categories, and savings vaults bundled into one CSV file
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadAll}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer border border-slate-700 active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Archive</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-emerald-950/80 bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            100% offline & local export (Excel & Sheets ready)
          </span>
          <button
            onClick={onClose}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
