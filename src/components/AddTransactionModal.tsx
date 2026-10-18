import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Receipt, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { BudgetCategory, PaymentMethod, Transaction, TransactionType } from '../types/finance';
import { formatINR } from '../utils/formatters';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const QUICK_PRESETS = [
  { title: 'Swiggy Dinner', amount: 550, categoryId: 'cat-dining', paymentMethod: 'upi' as PaymentMethod },
  { title: 'Blinkit Instant Kirana', amount: 380, categoryId: 'cat-groceries', paymentMethod: 'upi' as PaymentMethod },
  { title: 'Auto / Metro Commute', amount: 120, categoryId: 'cat-transport', paymentMethod: 'upi' as PaymentMethod },
  { title: 'Chai & Snacks', amount: 80, categoryId: 'cat-dining', paymentMethod: 'cash' as PaymentMethod },
  { title: 'Petrol Refuel', amount: 1500, categoryId: 'cat-transport', paymentMethod: 'credit_card' as PaymentMethod },
  { title: 'Amazon Purchase', amount: 1899, categoryId: 'cat-shopping', paymentMethod: 'credit_card' as PaymentMethod },
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-dining');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setAmountStr('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!title.trim() || isNaN(amount) || amount <= 0) return;

    onAddTransaction({
      title: title.trim(),
      amount,
      type,
      categoryId,
      paymentMethod,
      date,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const addAmount = (delta: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + delta).toString());
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setTitle(preset.title);
    setAmountStr(preset.amount.toString());
    setCategoryId(preset.categoryId);
    setPaymentMethod(preset.paymentMethod);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-3xl bg-[#092216] border border-emerald-800/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-emerald-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Record New Transaction</h3>
              <p className="text-xs text-slate-400">Instantly adjusts your Safe-to-Spend balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Segmented Type Switcher */}
          <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-emerald-900/50">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount Input with Currency Symbol */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full rounded-2xl bg-black/50 border border-emerald-800/60 pl-10 pr-4 py-3 text-3xl font-bold text-white font-mono tabular-nums focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            {/* Quick Amount Adder Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[100, 500, 1000, 2000].map((increment) => (
                <button
                  key={increment}
                  type="button"
                  onClick={() => addAmount(increment)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/40 text-xs font-mono tabular-nums text-emerald-300 transition-colors"
                >
                  +{formatINR(increment)}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Indian Presets (for expenses) */}
          {type === 'expense' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Quick Suggestions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0c3120] hover:bg-[#12422b] border border-emerald-800/40 text-slate-200 transition-colors"
                  >
                    {p.title} · <span className="font-mono text-emerald-400">₹{p.amount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title / Merchant */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Title or Merchant
            </label>
            <input
              type="text"
              required
              placeholder={type === 'expense' ? 'e.g. Swiggy, Blinkit, Shell Petrol' : 'e.g. Salary, Client Payout'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-400"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.group})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Payment Mode
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-400"
              >
                <option value="upi" className="bg-slate-900 text-white">UPI (GPay / PhonePe / Paytm)</option>
                <option value="credit_card" className="bg-slate-900 text-white">Credit Card</option>
                <option value="debit_card" className="bg-slate-900 text-white">Debit Card</option>
                <option value="net_banking" className="bg-slate-900 text-white">Net Banking</option>
                <option value="cash" className="bg-slate-900 text-white">Cash</option>
              </select>
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Split with Rohan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-emerald-950 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
            >
              Record Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
