import { Transaction, SavingsGoal, BudgetCategory, PaymentMethod, TransactionType } from '../types/finance';

/**
 * Universal CSV line parser that handles quoted strings with commas, escaped quotes, and newlines
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // handle CRLF
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * Keyword-based classifier for Indian merchants, UPI handles, and payment descriptions
 */
export function classifyMerchantCategory(description: string, isIncome: boolean): string {
  const d = description.toLowerCase();

  if (isIncome) {
    return 'cat-investments'; // Or salary / income allocation
  }

  // Food & Dining / Delivery
  if (
    d.includes('swiggy') ||
    d.includes('zomato') ||
    d.includes('kfc') ||
    d.includes('mcdonald') ||
    d.includes('burger') ||
    d.includes('pizza') ||
    d.includes('domino') ||
    d.includes('starbucks') ||
    d.includes('cafe') ||
    d.includes('coffee') ||
    d.includes('chai') ||
    d.includes('restaurant') ||
    d.includes('dhaba') ||
    d.includes('baker') ||
    d.includes('barbeque') ||
    d.includes('biryani') ||
    d.includes('eatclub') ||
    d.includes('behrouz') ||
    d.includes('ovenstory') ||
    d.includes('haldiram') ||
    d.includes('faasos') ||
    d.includes('tea') ||
    d.includes('sweets')
  ) {
    return 'cat-dining';
  }

  // Groceries, Quick-Commerce & Kirana
  if (
    d.includes('blinkit') ||
    d.includes('zepto') ||
    d.includes('instamart') ||
    d.includes('bigbasket') ||
    d.includes('bbnow') ||
    d.includes('dmart') ||
    d.includes('grocery') ||
    d.includes('supermarket') ||
    d.includes('kirana') ||
    d.includes('milk') ||
    d.includes('vegetable') ||
    d.includes('fruits') ||
    d.includes('nature basket') ||
    d.includes('spencer') ||
    d.includes('country delight') ||
    d.includes('dunzo') ||
    d.includes('millet') ||
    d.includes('provision')
  ) {
    return 'cat-groceries';
  }

  // Transport, Cabs & Fuel
  if (
    d.includes('uber') ||
    d.includes('ola') ||
    d.includes('rapido') ||
    d.includes('metro') ||
    d.includes('petrol') ||
    d.includes('diesel') ||
    d.includes('fuel') ||
    d.includes('shell') ||
    d.includes('hpcl') ||
    d.includes('bpcl') ||
    d.includes('iocl') ||
    d.includes('fastag') ||
    d.includes('toll') ||
    d.includes('auto') ||
    d.includes('rail') ||
    d.includes('irctc') ||
    d.includes('flight') ||
    d.includes('indigo') ||
    d.includes('air india') ||
    d.includes('makemytrip') ||
    d.includes('redbus')
  ) {
    return 'cat-transport';
  }

  // Shopping & Apparel
  if (
    d.includes('amazon') ||
    d.includes('flipkart') ||
    d.includes('myntra') ||
    d.includes('ajio') ||
    d.includes('zara') ||
    d.includes('h&m') ||
    d.includes('nykaa') ||
    d.includes('tata cliq') ||
    d.includes('meesho') ||
    d.includes('clothing') ||
    d.includes('apparel') ||
    d.includes('mall') ||
    d.includes('electronics') ||
    d.includes('croma') ||
    d.includes('reliance digital') ||
    d.includes('ikea') ||
    d.includes('decathlon') ||
    d.includes('retail') ||
    d.includes('lifestyle') ||
    d.includes('trends')
  ) {
    return 'cat-shopping';
  }

  // Bills & Utilities
  if (
    d.includes('bescom') ||
    d.includes('electricity') ||
    d.includes('power') ||
    d.includes('airtel') ||
    d.includes('jio') ||
    d.includes('broadband') ||
    d.includes('fiber') ||
    d.includes('water') ||
    d.includes('gas') ||
    d.includes('igl') ||
    d.includes('tata play') ||
    d.includes('dth') ||
    d.includes('recharge') ||
    d.includes('utility') ||
    d.includes('billdesk') ||
    d.includes('bbps') ||
    d.includes('mseb') ||
    d.includes('tneb') ||
    d.includes('torrent') ||
    d.includes('act fiber')
  ) {
    return 'cat-bills';
  }

  // Health, Fitness & Pharmacy
  if (
    d.includes('cult') ||
    d.includes('gym') ||
    d.includes('pharmacy') ||
    d.includes('apollo') ||
    d.includes('1mg') ||
    d.includes('pharmeasy') ||
    d.includes('medplus') ||
    d.includes('hospital') ||
    d.includes('clinic') ||
    d.includes('doctor') ||
    d.includes('lab') ||
    d.includes('diagnostic') ||
    d.includes('medibuddy') ||
    d.includes('practo') ||
    d.includes('fitness') ||
    d.includes('opticals') ||
    d.includes('lenskart')
  ) {
    return 'cat-health';
  }

  // Entertainment & OTT
  if (
    d.includes('netflix') ||
    d.includes('spotify') ||
    d.includes('bookmyshow') ||
    d.includes('pvr') ||
    d.includes('inox') ||
    d.includes('hotstar') ||
    d.includes('prime video') ||
    d.includes('cinema') ||
    d.includes('movie') ||
    d.includes('youtube') ||
    d.includes('apple music') ||
    d.includes('playstation') ||
    d.includes('steam') ||
    d.includes('gaming')
  ) {
    return 'cat-entertainment';
  }

  // Housing & Rent
  if (
    d.includes('rent') ||
    d.includes('society') ||
    d.includes('maintenance') ||
    d.includes('flat') ||
    d.includes('owner') ||
    d.includes('landlord') ||
    d.includes('mygate') ||
    d.includes('nobroker')
  ) {
    return 'cat-housing';
  }

  // Investments & SIP
  if (
    d.includes('groww') ||
    d.includes('zerodha') ||
    d.includes('upstox') ||
    d.includes('sip') ||
    d.includes('mutual fund') ||
    d.includes('camspay') ||
    d.includes('karvy') ||
    d.includes('bse') ||
    d.includes('nse') ||
    d.includes('gold') ||
    d.includes('sgb') ||
    d.includes('ppf') ||
    d.includes('fd') ||
    d.includes('indmoney') ||
    d.includes('kuvera') ||
    d.includes('etmoney') ||
    d.includes('nps') ||
    d.includes('securities')
  ) {
    return 'cat-investments';
  }

  return 'cat-dining'; // Default fallback
}

export interface ParsedCSVTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  selected: boolean;
}

/**
 * Parses raw text from UPI apps (PhonePe, GPay, Paytm, BHIM) or bank statement CSVs
 */
export function parseUPIOrBankStatement(csvText: string): ParsedCSVTransaction[] {
  const allRows = parseCSV(csvText);
  if (allRows.length < 2) return [];

  // Bank statements (HDFC, SBI, ICICI) often have preamble header metadata lines.
  // Find the actual column header row by searching for key words.
  let headerRowIdx = 0;
  for (let r = 0; r < Math.min(20, allRows.length); r++) {
    const rowLower = allRows[r].map((c) => c.toLowerCase());
    const matches = rowLower.filter(
      (c) =>
        c.includes('date') ||
        c.includes('time') ||
        c.includes('narration') ||
        c.includes('description') ||
        c.includes('particular') ||
        c.includes('details') ||
        c.includes('merchant') ||
        c.includes('amount') ||
        c.includes('debit') ||
        c.includes('withdrawal') ||
        c.includes('credit') ||
        c.includes('deposit') ||
        c.includes('paid to') ||
        c.includes('txn')
    );
    if (matches.length >= 2) {
      headerRowIdx = r;
      break;
    }
  }

  const headers = allRows[headerRowIdx].map((h) => h.toLowerCase());
  const parsedItems: ParsedCSVTransaction[] = [];

  // Identify column indices based on common header names
  let dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('txn date') || h.includes('value date'));
  let descIdx = headers.findIndex(
    (h) =>
      h.includes('narration') ||
      h.includes('description') ||
      h.includes('merchant') ||
      h.includes('paid to') ||
      h.includes('details') ||
      h.includes('particular') ||
      h.includes('title') ||
      h.includes('remark') ||
      h.includes('beneficiary') ||
      h.includes('activity')
  );
  let amountIdx = headers.findIndex(
    (h) =>
      h.includes('amount') ||
      h.includes('txn amount') ||
      h.includes('transaction amount') ||
      h === 'amt'
  );
  let debitIdx = headers.findIndex(
    (h) =>
      h.includes('debit') ||
      h.includes('withdrawal') ||
      h === 'dr' ||
      h.includes('dr amount') ||
      h.includes('debit (inr)')
  );
  let creditIdx = headers.findIndex(
    (h) =>
      h.includes('credit') ||
      h.includes('deposit') ||
      h === 'cr' ||
      h.includes('cr amount') ||
      h.includes('credit (inr)')
  );
  let typeIdx = headers.findIndex(
    (h) => h === 'type' || h.includes('dr/cr') || h.includes('cr/dr') || h.includes('status') || h.includes('transaction type')
  );
  let modeIdx = headers.findIndex(
    (h) => h.includes('mode') || h.includes('payment') || h.includes('instrument') || h.includes('channel')
  );

  // Fallbacks if not detected by header name
  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = headers.length > 1 ? 1 : 0;
  if (amountIdx === -1 && debitIdx === -1 && headers.length >= 3) amountIdx = 2;

  for (let r = headerRowIdx + 1; r < allRows.length; r++) {
    const row = allRows[r];
    if (row.length <= 1) continue;

    const rawDate = row[dateIdx] || '';
    const rawDesc = row[descIdx] || 'UPI Payment';

    let amount = 0;
    let type: TransactionType = 'expense';

    // Helper to clean amount string
    const cleanNum = (str: string) => {
      if (!str) return 0;
      // remove currency symbols, commas, spaces
      const cleaned = str.replace(/[₹$,Rs.INR\s]/gi, '');
      return parseFloat(cleaned);
    };

    if (debitIdx !== -1 && creditIdx !== -1) {
      const debitVal = cleanNum(row[debitIdx] || '');
      const creditVal = cleanNum(row[creditIdx] || '');

      if (!isNaN(debitVal) && debitVal > 0) {
        amount = debitVal;
        type = 'expense';
      } else if (!isNaN(creditVal) && creditVal > 0) {
        amount = creditVal;
        type = 'income';
      }
    } else if (amountIdx !== -1) {
      const rawAmtStr = row[amountIdx] || '';
      const isNegative = rawAmtStr.includes('-') || (rawAmtStr.startsWith('(') && rawAmtStr.endsWith(')'));
      const parsedAmt = cleanNum(rawAmtStr);

      if (!isNaN(parsedAmt) && parsedAmt !== 0) {
        amount = Math.abs(parsedAmt);

        if (isNegative) {
          type = 'expense';
        } else {
          // Check type column if present
          if (typeIdx !== -1) {
            const rawType = (row[typeIdx] || '').toLowerCase();
            if (
              rawType.includes('credit') ||
              rawType === 'cr' ||
              rawType.includes('received') ||
              rawType.includes('deposit') ||
              rawType.includes('refund')
            ) {
              type = 'income';
            } else {
              type = 'expense';
            }
          } else {
            // Check if narration has credit keywords
            const lowerDesc = rawDesc.toLowerCase();
            if (
              lowerDesc.includes('salary') ||
              lowerDesc.includes('credited') ||
              lowerDesc.includes('refund') ||
              lowerDesc.includes('cashback') ||
              lowerDesc.includes('received from')
            ) {
              type = 'income';
            } else {
              type = 'expense';
            }
          }
        }
      }
    }

    if (amount <= 0 || isNaN(amount)) continue;

    // Normalize date to YYYY-MM-DD
    let normalizedDate = new Date().toISOString().split('T')[0];
    if (rawDate) {
      // Handles DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, or "15 Oct 2026"
      const dateParts = rawDate.trim().split(/[-/\s]/);
      if (dateParts.length >= 3) {
        if (dateParts[0].length === 4) {
          // YYYY-MM-DD
          normalizedDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].slice(0, 2).padStart(2, '0')}`;
        } else if (dateParts[2].length >= 2) {
          // DD-MM-YYYY or DD-Mon-YYYY
          let year = dateParts[2].slice(0, 4);
          if (year.length === 2) year = `20${year}`;

          // Check if month is word (Jan, Feb, etc.)
          const monthWords = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
          const monthWordIdx = monthWords.findIndex((m) => dateParts[1].toLowerCase().startsWith(m));
          const monthNum = monthWordIdx !== -1 ? (monthWordIdx + 1).toString().padStart(2, '0') : dateParts[1].padStart(2, '0');

          normalizedDate = `${year}-${monthNum}-${dateParts[0].padStart(2, '0')}`;
        }
      } else {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          normalizedDate = d.toISOString().split('T')[0];
        }
      }
    }

    // Determine payment mode
    let paymentMethod: PaymentMethod = 'upi';
    const combinedDesc = `${rawDesc} ${modeIdx !== -1 ? row[modeIdx] || '' : ''}`.toLowerCase();
    if (combinedDesc.includes('card') || combinedDesc.includes('pos ') || combinedDesc.includes('e-com')) {
      paymentMethod = 'credit_card';
    } else if (
      combinedDesc.includes('net') ||
      combinedDesc.includes('neft') ||
      combinedDesc.includes('rtgs') ||
      combinedDesc.includes('imps') ||
      combinedDesc.includes('ach')
    ) {
      paymentMethod = 'net_banking';
    } else if (combinedDesc.includes('cash') || combinedDesc.includes('atm')) {
      paymentMethod = 'cash';
    } else if (combinedDesc.includes('upi') || combinedDesc.includes('@') || combinedDesc.includes('gpay') || combinedDesc.includes('paytm')) {
      paymentMethod = 'upi';
    }

    const categoryId = classifyMerchantCategory(rawDesc, type === 'income');

    // Clean up title for presentation
    const cleanTitle = rawDesc
      .replace(/^paid to /i, '')
      .replace(/^sent to /i, '')
      .replace(/^transfer to /i, '')
      .replace(/^upi\//i, '')
      .trim()
      .slice(0, 80);

    parsedItems.push({
      id: `imp-${Date.now()}-${r}`,
      title: cleanTitle || 'UPI Payment',
      amount,
      type,
      categoryId,
      date: normalizedDate,
      paymentMethod,
      notes: `Imported statement record`,
      selected: true,
    });
  }

  return parsedItems;
}

/**
 * Generates downloadable CSV content for Transactions
 */
export function generateTransactionsCSV(transactions: Transaction[], categories: BudgetCategory[]): string {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const headers = ['Date', 'Title', 'Type', 'Category', 'Payment Method', 'Amount (INR)', 'Notes', 'Recurring'];

  const rows = transactions.map((t) => [
    t.date,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.type,
    `"${(catMap.get(t.categoryId) || 'General').replace(/"/g, '""')}"`,
    t.paymentMethod,
    t.amount,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    t.isRecurring ? 'Yes' : 'No',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generates downloadable CSV content for Savings Goals
 */
export function generateSavingsGoalsCSV(goals: SavingsGoal[]): string {
  const headers = ['Goal Title', 'Target Amount (INR)', 'Current Saved (INR)', 'Progress (%)', 'Target Date', 'Category', 'Monthly Plan (INR)'];

  const rows = goals.map((g) => {
    const percent = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
    return [
      `"${g.title.replace(/"/g, '""')}"`,
      g.targetAmount,
      g.currentAmount,
      `${percent}%`,
      g.targetDate,
      g.category,
      g.monthlyTarget || 0,
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generates sample UPI CSV format for testing and template download
 */
export function generateSampleUPICSV(): string {
  return `Date,Merchant / Paid To,Amount,Type,Payment Mode
17/10/2026,Swiggy Bangalore Gourmet,650,Debit,UPI
16/10/2026,Blinkit Instant Groceries,420,Debit,UPI
16/10/2026,Shell Petrol Pump Indiranagar,1800,Debit,UPI
15/10/2026,Client UI Retainer Payout,25000,Credit,IMPS
14/10/2026,Amazon India Shopping,2199,Debit,Credit Card
13/10/2026,BESCOM Electricity Bill,1650,Debit,UPI
12/10/2026,Airtel Fiber Broadband,999,Debit,Auto-Debit
11/10/2026,Cult.fit Fitness Renewal,1400,Debit,UPI
10/10/2026,Blue Tokai Coffee,310,Debit,UPI
08/10/2026,Uber Premier Ride,540,Debit,UPI
07/10/2026,Zerodha Broking SIP Investment,10000,Debit,UPI
05/10/2026,Salary Transfer Tech Corp,85000,Credit,NEFT`;
}
