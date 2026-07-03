// src/billpay/data.ts
// Mock transactions for the Cash table. Includes variety (Cash In / Cash Out,
// all status types) so the Filter drawer feels real when the user applies
// combinations of filters.

import type { Transaction, Client, FilterState } from './types';

const PK: Client = { initials: 'PK', name: 'PAKA',                    color: 'brand'  };
const OF: Client = { initials: 'OF', name: 'OPTIMIZA FDP SAPI DE CV', color: 'pink'   };
const FL: Client = { initials: 'FL', name: 'Finco LAT',               color: 'yellow' };
const KT: Client = { initials: 'KT', name: 'KUSTODIA',                color: 'brown'  };

export const CLIENTS: Client[] = [PK, FL, KT, OF];

/* 25 transactions — first 8 match the Figma sample exactly, rest add variety. */
export const TRANSACTIONS: Transaction[] = [
  { id: 't1',  client: PK, operationType: 'Cash In',  reference: '10511177136613688467', createdAt: '23/09/2027 14:45', status: 'Reversed', amount: 2350.75 },
  { id: 't2',  client: OF, operationType: 'Cash In',  reference: '12345678909876543210', createdAt: '05/11/2025 09:30', status: 'Paid',     amount: 4120.00 },
  { id: 't3',  client: PK, operationType: 'Cash In',  reference: '10511177136613688467', createdAt: '12/07/2028 18:20', status: 'Expired',  amount:  980.50 },
  { id: 't4',  client: FL, operationType: 'Cash In',  reference: '31415926535897932384', createdAt: '30/03/2026 07:55', status: 'Expired',  amount: 3600.00 },
  { id: 't5',  client: PK, operationType: 'Cash In',  reference: '10511177136613688467', createdAt: '08/12/2027 21:10', status: 'Paid',     amount: 1250.25 },
  { id: 't6',  client: KT, operationType: 'Cash In',  reference: '98765432109876543210', createdAt: '14/01/2029 16:05', status: 'Paid',     amount: 5000.00 },
  { id: 't7',  client: FL, operationType: 'Cash In',  reference: '31415926535897932384', createdAt: '19/06/2026 11:40', status: 'Expired',  amount: 2875.40 },
  { id: 't8',  client: KT, operationType: 'Cash In',  reference: '98765432109876543210', createdAt: '27/10/2028 05:15', status: 'Reversed', amount: 1100.00 },
  /* — extras — */
  { id: 't9',  client: PK, operationType: 'Cash Out', reference: '00000000000000000001', createdAt: '02/02/2029 12:00', status: 'Paid',     amount:  650.00 },
  { id: 't10', client: OF, operationType: 'Cash Out', reference: '11223344556677889900', createdAt: '17/04/2028 08:15', status: 'Paid',     amount: 8420.00 },
  { id: 't11', client: FL, operationType: 'Cash In',  reference: '55555555555555555555', createdAt: '03/09/2027 19:22', status: 'Reversed', amount: 1985.30 },
  { id: 't12', client: KT, operationType: 'Cash Out', reference: '77777777777777777777', createdAt: '25/12/2028 23:59', status: 'Expired',  amount:  340.00 },
  { id: 't13', client: PK, operationType: 'Cash In',  reference: '10511177136613688467', createdAt: '11/03/2029 06:42', status: 'Paid',     amount: 2100.00 },
  { id: 't14', client: OF, operationType: 'Cash In',  reference: '99998887776665554443', createdAt: '20/07/2028 13:18', status: 'Reversed', amount:  475.80 },
  { id: 't15', client: FL, operationType: 'Cash Out', reference: '31415926535897932384', createdAt: '06/05/2029 10:05', status: 'Paid',     amount: 6250.00 },
  { id: 't16', client: KT, operationType: 'Cash In',  reference: '13579246801357924680', createdAt: '31/08/2027 04:30', status: 'Expired',  amount: 1720.50 },
  { id: 't17', client: PK, operationType: 'Cash In',  reference: '10511177136613688467', createdAt: '15/02/2028 17:12', status: 'Reversed', amount:  895.25 },
  { id: 't18', client: OF, operationType: 'Cash Out', reference: '24681357902468135790', createdAt: '09/10/2029 02:47', status: 'Paid',     amount: 3300.00 },
  { id: 't19', client: FL, operationType: 'Cash In',  reference: '31415926535897932384', createdAt: '22/11/2027 15:33', status: 'Paid',     amount: 4880.00 },
  { id: 't20', client: KT, operationType: 'Cash In',  reference: '98765432109876543210', createdAt: '04/06/2029 20:08', status: 'Reversed', amount:  610.00 },
  { id: 't21', client: PK, operationType: 'Cash In',  reference: '10511177136613688467', createdAt: '28/01/2028 09:00', status: 'Expired',  amount: 1450.00 },
  { id: 't22', client: OF, operationType: 'Cash In',  reference: '86420975318642097531', createdAt: '13/07/2029 22:55', status: 'Paid',     amount: 5720.60 },
  { id: 't23', client: FL, operationType: 'Cash Out', reference: '31415926535897932384', createdAt: '18/09/2028 03:24', status: 'Expired',  amount:  205.00 },
  { id: 't24', client: KT, operationType: 'Cash In',  reference: '98765432109876543210', createdAt: '07/04/2027 16:47', status: 'Paid',     amount: 9100.00 },
  { id: 't25', client: PK, operationType: 'Cash Out', reference: '10511177136613688467', createdAt: '30/11/2028 11:59', status: 'Reversed', amount: 2050.00 },
];

/** Mock counts used in the Filter drawer next to each checkbox.
 * Values match the Figma sample (2288-6749) verbatim — they're intentionally
 * decoupled from TRANSACTIONS.length. */
export const STATUS_COUNTS: Record<string, number> = {
  Open: 59, Closed: 92, Expired: 65, Unpaid: 53, Paid: 84, Reversed: 71,
};
export const OPERATION_COUNTS: Record<string, number> = {
  'Cash In': 59, 'Cash Out': 92,
};

/** Parse the "DD/MM/YYYY HH:MM" strings into JS Date for comparison. */
function parseTxDate(s: string): Date {
  const [d, t] = s.split(' ');
  const [dd, mm, yyyy] = d.split('/').map(Number);
  const [hh, mi] = t.split(':').map(Number);
  return new Date(yyyy, mm - 1, dd, hh, mi);
}

/** Apply search query + full filter state to the transactions. */
export function applyFilters(query: string, f: FilterState): Transaction[] {
  const q = query.trim();
  const startDate = f.dateRange.start ? new Date(f.dateRange.start) : null;
  const endDate   = f.dateRange.end   ? new Date(f.dateRange.end)   : null;
  if (endDate) endDate.setHours(23, 59, 59, 999);   // inclusive

  return TRANSACTIONS.filter((tx) => {
    if (q && !tx.reference.includes(q)) return false;
    if (f.statuses.length   > 0 && !f.statuses.includes(tx.status as never))          return false;
    if (f.operations.length > 0 && !f.operations.includes(tx.operationType))          return false;
    if (f.client && tx.client.name !== f.client)                                      return false;
    if (startDate || endDate) {
      const d = parseTxDate(tx.createdAt);
      if (startDate && d < startDate) return false;
      if (endDate   && d > endDate)   return false;
    }
    return true;
  });
}

export function formatAmount(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format an ISO date "YYYY-MM-DD" as "Mmm d" (e.g. "Aug 25"). */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
