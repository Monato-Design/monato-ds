// src/billpay/types.ts
// Types shared across the BillPay Main prototype.

export type NavItemId =
  | 'home'
  | 'payments'
  | 'balances'
  | 'clients'
  | 'payees'
  | 'users'
  | 'audit-logs'
  | 'request-records'
  | 'cash'
  | 'lottery'
  | 'melate'
  | 'remittances';

export type OperationType = 'Cash In' | 'Cash Out';

export type TxStatus = 'Paid' | 'Expired' | 'Reversed';

/** Palette key for client favicon — must match .bp-fav--* CSS class */
export type FaviconColor = 'brand' | 'pink' | 'yellow' | 'brown';

export interface Client {
  initials: string;   // 2-letter abbr, e.g. "PK"
  name: string;       // display name, e.g. "PAKA"
  color: FaviconColor;
}

export interface Transaction {
  id: string;
  client: Client;
  operationType: OperationType;
  reference: string;  // 20-digit
  createdAt: string;  // "DD/MM/YYYY HH:MM"
  status: TxStatus;
  amount: number;     // 2 decimals
}
