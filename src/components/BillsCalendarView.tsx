import React, { useState } from 'react';
import { RecurringBill, BudgetCategory } from '../types/finance';
import { formatINR } from '../utils/formatters';
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Check, 
  X,
  CreditCard,
  Zap,
  Repeat,
  Trash2
} from 'lucide-react';

interface BillsCalendarViewProps {
  bills: RecurringBill[];
  categories: BudgetCategory[];
  onTogglePaid: (billId: string) => void;
  onAddBill: (bill: Omit<RecurringBill, 'id'>) => void;
  onDeleteBill: (billId: string) => void;
}

export const BillsCalendarView: React.FC<BillsCalendarViewProps> = ({
  bills,
  categories,
  onTogglePaid,
  onAddBill,
  onDeleteBill,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dueDay, setDueDay] = useState(1);
  const [categoryId, setCategoryId] = useState('cat-bills');
  const [isAutoDebit, setIsAutoDebit] = useState(false);
  const [provider, setProvider] = useState('');

  const today = new Date().getDate();

  const totalCommitted = bills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = bills.filter((b) => b.isPaidThisMonth).reduce((acc, b) => acc + b.amount, 0);
  const totalPending = totalCommitted - totalPaid;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!title.trim() || isNaN(amount) || amount <= 0) return;

    onAddBill({
      title: title.trim(),
      amount,
      dueDay: Number(dueDay),
      categoryId,
      isAutoDebit,
      isPaidThisMonth: false,
      provider: provider.trim() || undefined,
    });

    setIsAddOpen(false);
    setTitle('');
    setAmountStr('');
    setProvider('');
  };

  // Sort bills by due day
  const sortedBills = [...bills].sort((a, b) => a.dueDay - b.dueDay);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Recurring Bills & Fixed Commitments
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Pre-allocated expenses deducted automatically from your Safe-to-Spend calculation
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* High-Level Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#092216]/80 border border-emerald-900/50 space-y-1">
          <span className="text-xs text-slate-400">Total Fixed Commitments</span>
          <p className="text-2xl font-bold text-white font-mono tabular-nums">
            {formatINR(totalCommitted)}
          </p>
          <span className="text-[11px] text-emerald-400">Deducted from monthly safe pool</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#092216]/80 border border-emerald-900/50 space-y-1">
          <span className="text-xs text-slate-400">Paid So Far This Month</span>
          <p className="text-2xl font-bold text-emerald-300 font-mono tabular-nums">
            {formatINR(totalPaid)}
          </p>
          <span className="text-[11px] text-slate-400">
            {bills.filter((b) => b.isPaidThisMonth).length} of {bills.length} bills cleared
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#092216]/80 border border-emerald-900/50 space-y-1">
          <span className="text-xs text-slate-400">Pending Dues</span>
          <p className="text-2xl font-bold text-amber-300 font-mono tabular-nums">
            {formatINR(totalPending)}
          </p>
          <span className="text-[11px] text-amber-400/80">Scheduled for payment</span>
        </div>
      </div>

      {/* Sorted Bills Grid */}
      <div className="rounded-3xl bg-[#072418]/70 border border-emerald-900/50 divide-y divide-emerald-900/40 overflow-hidden shadow-lg">
        {sortedBills.map((bill) => {
          const isPastDue = !bill.isPaidThisMonth && bill.dueDay < today;
          const isDueSoon = !bill.isPaidThisMonth && bill.dueDay >= today && bill.dueDay <= today + 5;

          return (
            <div
              key={bill.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-emerald-950/20 transition group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-2xl flex flex-col items-center justify-center font-mono border shrink-0 ${
                    bill.isPaidThisMonth
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                      : isPastDue
                      ? 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                      : 'bg-black/40 border-emerald-900/60 text-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-sans text-slate-400">Day</span>
                  <span className="text-base font-bold tabular-nums">{bill.dueDay}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-white">{bill.title}</h4>
                    {bill.isAutoDebit && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50 font-mono">
                        Auto-Debit
                      </span>
                    )}
                    {isDueSoon && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
                        Due in {bill.dueDay - today} days
                      </span>
                    )}
                    {isPastDue && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-semibold">
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{bill.provider || 'Scheduled obligation'}</span>
                    <span>·</span>
                    <span>Due on the {bill.dueDay}th each month</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-lg font-bold text-white font-mono tabular-nums">
                    {formatINR(bill.amount)}
                  </span>
                </div>

                <button
                  onClick={() => onTogglePaid(bill.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    bill.isPaidThisMonth
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-emerald-950/80 text-slate-300 hover:text-white border border-emerald-800/60 hover:bg-emerald-900'
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      bill.isPaidThisMonth ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{bill.isPaidThisMonth ? 'Paid' : 'Mark Paid'}</span>
                </button>

                <button
                  onClick={() => onDeleteBill(bill.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition"
                  title="Remove recurring bill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Bill Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#092216] border border-emerald-800/60 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Add Recurring Commitment</h3>
                <p className="text-xs text-slate-400">Safeguards this amount every month</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Bill or Obligation Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi Bill, House Rent, Gym, SIP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Due Day (1-31)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Provider or Payee
                </label>
                <input
                  type="text"
                  placeholder="e.g. Airtel, BESCOM, Cult.fit, Owner Transfer"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-xl bg-black/50 border border-emerald-800/60 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autodebit"
                  checked={isAutoDebit}
                  onChange={(e) => setIsAutoDebit(e.target.checked)}
                  className="rounded border-emerald-800 text-emerald-500 focus:ring-emerald-400"
                />
                <label htmlFor="autodebit" className="text-xs text-slate-300 cursor-pointer">
                  Auto-Debit (automatically charged to account/card)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl"
                >
                  Add Obligation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
