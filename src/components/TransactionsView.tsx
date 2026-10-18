import React, { useState, useMemo } from 'react';
import { Transaction, BudgetCategory, PaymentMethod, TransactionType } from '../types/finance';
import { formatINR, formatDate, formatRelativeDate } from '../utils/formatters';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Plus, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Banknote, 
  Calendar,
  ArrowUpDown,
  Tag,
  Upload
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: BudgetCategory[];
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenImportModal?: () => void;
  onOpenExportModal?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  onDeleteTransaction,
  onOpenAddModal,
  onOpenImportModal,
  onOpenExportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  const categoryMap = useMemo(() => {
    const map = new Map<string, BudgetCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          const cat = categoryMap.get(t.categoryId);
          const matchCat = cat?.name.toLowerCase().includes(q);
          if (!matchTitle && !matchNotes && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) {
          return false;
        }

        // Payment method filter
        if (selectedPaymentMethod !== 'all' && t.paymentMethod !== selectedPaymentMethod) {
          return false;
        }

        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchTerm, selectedCategory, selectedPaymentMethod, selectedType, sortBy, categoryMap]);

  // Calculate filtered totals
  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Title', 'Type', 'Category', 'Payment Method', 'Amount (INR)', 'Notes'];
    const rows = filteredTransactions.map((t) => {
      const cat = categoryMap.get(t.categoryId)?.name || 'General';
      return [
        t.date,
        `"${t.title.replace(/"/g, '""')}"`,
        t.type,
        `"${cat}"`,
        t.paymentMethod,
        t.amount,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PaisaPlan_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'upi': return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
      case 'credit_card': return <CreditCard className="w-3.5 h-3.5 text-amber-400" />;
      case 'net_banking': return <Building2 className="w-3.5 h-3.5 text-blue-400" />;
      default: return <Banknote className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Ledger & Transaction Records</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full transaction history with search, category tags, and instant CSV export
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs font-semibold text-emerald-300 hover:bg-emerald-900 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Statement</span>
            </button>
          )}
          <button
            onClick={() => {
              if (onOpenExportModal) {
                onOpenExportModal();
              } else {
                handleExportCSV();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-[#092216] border border-emerald-800/60 text-xs font-semibold text-slate-200 hover:bg-[#0e3523] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="p-4 rounded-2xl bg-[#072418]/80 border border-emerald-900/50 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant, notes, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-black/50 border border-emerald-800/50 pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl bg-black/50 border border-emerald-800/50 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full rounded-xl bg-black/50 border border-emerald-800/50 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Modes</option>
              <option value="upi">UPI (GPay/PhonePe)</option>
              <option value="credit_card">Credit Card</option>
              <option value="net_banking">Net Banking</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl bg-black/50 border border-emerald-800/50 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Strip */}
        <div className="pt-2 border-t border-emerald-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{filteredTransactions.length}</strong> entries
          </div>
          <div className="flex items-center gap-4">
            <span>
              Total Outflow: <strong className="text-slate-100 font-mono tabular-nums">{formatINR(totalFilteredExpense)}</strong>
            </span>
            {totalFilteredIncome > 0 && (
              <span>
                Total Inflow: <strong className="text-emerald-400 font-mono tabular-nums">+{formatINR(totalFilteredIncome)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="rounded-2xl bg-[#072418]/70 border border-emerald-900/50 overflow-hidden shadow-lg">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-slate-400">No transactions match your current search or filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedPaymentMethod('all');
              }}
              className="px-4 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 rounded-lg bg-emerald-950 border border-emerald-900"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-emerald-900/40">
            {filteredTransactions.map((tx) => {
              const category = categoryMap.get(tx.categoryId);
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-emerald-950/20 transition group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-black/40 border border-emerald-900/60 flex items-center justify-center shrink-0">
                      {getPaymentIcon(tx.paymentMethod)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-100 truncate">{tx.title}</h4>
                        {tx.isRecurring && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">
                            Recurring
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300">{category?.name || 'General'}</span>
                        <span>·</span>
                        <span>{formatDate(tx.date)}</span>
                        <span>·</span>
                        <span className="uppercase text-[10px] text-emerald-500/80 font-mono">
                          {tx.paymentMethod.replace('_', ' ')}
                        </span>
                        {tx.notes && (
                          <>
                            <span>·</span>
                            <span className="text-slate-400 italic truncate max-w-xs">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-base font-bold font-mono tabular-nums ${
                          isExpense ? 'text-slate-100' : 'text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}{formatINR(tx.amount)}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Delete record"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
