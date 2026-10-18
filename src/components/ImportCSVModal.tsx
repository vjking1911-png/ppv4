import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles,
  ClipboardPaste,
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';
import { BudgetCategory, Transaction } from '../types/finance';
import { parseUPIOrBankStatement, ParsedCSVTransaction, generateSampleUPICSV } from '../utils/csvParser';
import { formatINR } from '../utils/formatters';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  onImportTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
}

export const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
  isOpen,
  onClose,
  categories,
  onImportTransactions,
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedCSVTransaction[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processCsvText = (text: string, sourceName: string) => {
    setError(null);
    try {
      const items = parseUPIOrBankStatement(text);
      if (items.length === 0) {
        setError('No transactions could be detected. Please ensure the statement contains headers with date, description/narration, and amount.');
      } else {
        setParsedRows(items);
        setFileName(sourceName);
      }
    } catch (err: any) {
      console.error('CSV parse error:', err);
      setError('Error parsing statement text. Please check the format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      setError('Please paste your CSV text into the box.');
      return;
    }
    processCsvText(pastedText, 'Pasted Statement Data');
  };

  const handleDownloadSample = () => {
    const sample = generateSampleUPICSV();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sample_UPI_Statement.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleRow = (id: string) => {
    setParsedRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, selected: !row.selected } : row))
    );
  };

  const toggleAll = (select: boolean) => {
    setParsedRows((prev) => prev.map((row) => ({ ...row, selected: select })));
  };

  const updateRowCategory = (id: string, categoryId: string) => {
    setParsedRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, categoryId } : row))
    );
  };

  const updateRowTitle = (id: string, title: string) => {
    setParsedRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, title } : row))
    );
  };

  const selectedRows = parsedRows.filter((r) => r.selected);
  const selectedExpenses = selectedRows.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const selectedIncome = selectedRows.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);

  const displayedRows = parsedRows.filter((r) => {
    if (typeFilter === 'all') return true;
    return r.type === typeFilter;
  });

  const handleConfirmImport = () => {
    if (selectedRows.length === 0) return;

    const payload: Omit<Transaction, 'id'>[] = selectedRows.map((r) => ({
      title: r.title,
      amount: r.amount,
      type: r.type,
      categoryId: r.categoryId,
      date: r.date,
      paymentMethod: r.paymentMethod,
      notes: r.notes,
    }));

    onImportTransactions(payload);
    onClose();
  };

  const resetImport = () => {
    setParsedRows([]);
    setFileName(null);
    setError(null);
    setPastedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-3xl bg-[#092216] border border-emerald-800/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Import Statement CSV</h3>
              <p className="text-xs text-slate-400">
                Import Google Pay, PhonePe, Paytm, BHIM, or Netbanking statements with auto-categorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-emerald-900/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {parsedRows.length === 0 ? (
            <div className="space-y-4">
              {/* Input Mode Selector */}
              <div className="flex items-center p-1 rounded-xl bg-black/40 border border-emerald-900/60 max-w-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    inputMode === 'paste'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Paste CSV Text</span>
                </button>
              </div>

              {inputMode === 'upload' ? (
                /* Upload Drop Area */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-800/60 hover:border-emerald-500/80 rounded-3xl p-8 text-center cursor-pointer transition bg-black/30 hover:bg-emerald-950/20 flex flex-col items-center justify-center gap-3"
                >
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Click or drag a statement CSV file here</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports UPI exports (PhonePe, GPay, Paytm) and Bank Statements (HDFC, SBI, ICICI, Axis)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Paste Text Area */
                <div className="space-y-3">
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste CSV headers & transaction rows here...&#10;e.g.&#10;Date,Merchant / Paid To,Amount,Type,Payment Mode&#10;17/10/2026,Swiggy Bangalore,650,Debit,UPI"
                    rows={6}
                    className="w-full rounded-2xl bg-black/40 border border-emerald-900/60 p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handlePasteSubmit}
                      className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold cursor-pointer shadow-md"
                    >
                      Parse Statement Text
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sample template download helper */}
              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Need an example to see column mappings?</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-300 hover:text-white transition flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample UPI Statement</span>
                </button>
              </div>
            </div>
          ) : (
            /* Parsed Rows Preview Table */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald-950">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    Source: <span className="text-emerald-400 font-mono">{fileName}</span>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">
                    {selectedRows.length} of {parsedRows.length} selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAll(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => toggleAll(false)}
                    className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={resetImport}
                    className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Upload Another
                  </button>
                </div>
              </div>

              {/* Quick Filter Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    typeFilter === 'all'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({parsedRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('expense')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    typeFilter === 'expense'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Expenses ({parsedRows.filter((r) => r.type === 'expense').length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('income')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    typeFilter === 'income'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Income ({parsedRows.filter((r) => r.type === 'income').length})
                </button>
              </div>

              {/* Table of Parsed Transactions */}
              <div className="rounded-2xl border border-emerald-900/60 overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#04160e] text-slate-400 border-b border-emerald-950 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-8"></th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Merchant / Title</th>
                      <th className="py-2.5 px-3">Category (Auto Classified)</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/60 bg-black/30">
                    {displayedRows.map((row) => (
                      <tr
                        key={row.id}
                        className={`transition ${
                          row.selected ? 'hover:bg-emerald-950/20' : 'opacity-40 bg-black/50'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => toggleRow(row.id)}
                            className="rounded border-emerald-800 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={row.title}
                            onChange={(e) => updateRowTitle(row.id, e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-transparent hover:border-emerald-700/60 focus:border-emerald-400 focus:bg-black/40 text-slate-100 font-medium text-xs px-1 py-0.5 rounded focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={row.categoryId}
                            onChange={(e) => updateRowCategory(row.id, e.target.value)}
                            className="bg-black/60 border border-emerald-900/80 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                          <span className={row.type === 'expense' ? 'text-slate-100' : 'text-emerald-400'}>
                            {row.type === 'expense' ? '-' : '+'}{formatINR(row.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-2xl bg-[#04160e] border border-emerald-950 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Ready to add <strong className="text-white font-mono">{selectedRows.length}</strong> items to ledger
                </span>
                <div className="flex items-center gap-4 text-xs">
                  <span>
                    Total Expenses: <strong className="text-white font-mono tabular-nums">{formatINR(selectedExpenses)}</strong>
                  </span>
                  {selectedIncome > 0 && (
                    <span>
                      Total Income: <strong className="text-emerald-400 font-mono tabular-nums">+{formatINR(selectedIncome)}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-emerald-950/80 bg-black/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>

          {parsedRows.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={selectedRows.length === 0}
              className="px-6 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Import {selectedRows.length} Transactions</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
