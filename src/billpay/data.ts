// src/billpay/data.ts
// Mock transactions for the Cash table. Data mirrors the Figma sample exactly
// (see node 2269-3329, columns Client / Operation type / Reference / Created /
// Tipo de ID / Amount). Extend freely later.

import type { Transaction, Client } from './types';

const PK: Client = { initials: 'PK', name: 'PAKA',                    color: 'brand'  };
const OF: Client = { initials: 'OF', name: 'OPTIMIZA FDP SAPI DE CV', color: 'pink'   };
const FL: Client = { initials: 'FL', name: 'Finco LAT',               color: 'yellow' };
const KT: Client = { initials: 'KT', name: 'KUSTODIA',                color: 'brown'  };

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', client: PK, operationType: 'Cash In', reference: '10511177136613688467', createdAt: '23/09/2027 14:45', status: 'Reversed', amount: 2350.75 },
  { id: 't2', client: OF, operationType: 'Cash In', reference: '12345678909876543210', createdAt: '05/11/2025 09:30', status: 'Paid',     amount: 4120.00 },
  { id: 't3', client: PK, operationType: 'Cash In', reference: '10511177136613688467', createdAt: '12/07/2028 18:20', status: 'Expired',  amount:  980.50 },
  { id: 't4', client: FL, operationType: 'Cash In', reference: '31415926535897932384', createdAt: '30/03/2026 07:55', status: 'Expired',  amount: 3600.00 },
  { id: 't5', client: PK, operationType: 'Cash In', reference: '10511177136613688467', createdAt: '08/12/2027 21:10', status: 'Paid',     amount: 1250.25 },
  { id: 't6', client: KT, operationType: 'Cash In', reference: '98765432109876543210', createdAt: '14/01/2029 16:05', status: 'Paid',     amount: 5000.00 },
  { id: 't7', client: FL, operationType: 'Cash In', reference: '31415926535897932384', createdAt: '19/06/2026 11:40', status: 'Expired',  amount: 2875.40 },
  { id: 't8', client: KT, operationType: 'Cash In', reference: '98765432109876543210', createdAt: '27/10/2028 05:15', status: 'Reversed', amount: 1100.00 },
  { id: 't9', client: PK, operationType: 'Cash In', reference: '00000000000000000000', createdAt: '02/02/2029 12:00', status: 'Paid',     amount:  650.00 },
];

/** Filter transactions by a substring on the reference (or empty for all). */
export function filterByReference(query: string): Transaction[] {
  const q = query.trim();
  if (!q) return TRANSACTIONS;
  return TRANSACTIONS.filter((t) => t.reference.includes(q));
}

/** Format an amount as "1,234.56" (no currency prefix — column has no symbol). */
export function formatAmount(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
