// src/billpay/types.ts

export type NavItemId =
  | 'home' | 'payments' | 'balances' | 'clients' | 'payees'
  | 'users' | 'audit-logs' | 'request-records' | 'cash'
  | 'lottery' | 'melate' | 'remittances';

export type OperationType = 'Cash In' | 'Cash Out';

export type TxStatus = 'Paid' | 'Expired' | 'Reversed';

/** Full set of status options shown in the Filter drawer.
 * Not all of them exist in TRANSACTIONS — the extra ones (Open, Closed,
 * Unpaid) come from the Figma spec and simply return zero rows when checked.
 */
export type StatusOption = 'Open' | 'Closed' | 'Expired' | 'Unpaid' | 'Paid' | 'Reversed';

export type FaviconColor = 'brand' | 'pink' | 'yellow' | 'brown';

export interface Client {
  initials: string;
  name: string;
  color: FaviconColor;
}

export interface Transaction {
  id: string;
  client: Client;
  operationType: OperationType;
  reference: string;
  createdAt: string;   // "DD/MM/YYYY HH:MM"
  status: TxStatus;
  amount: number;
}

/** Rows-per-page options for the Show dropdown */
export type ShowOption = 10 | 25 | 50 | 100;

/** Full filter state used by the drawer + tracked in Cash page */
export interface FilterState {
  dateRange: { start: string | null; end: string | null };  // ISO date strings
  statuses: StatusOption[];
  operations: OperationType[];
  client: string | null;    // client name
}

export function emptyFilterState(): FilterState {
  return { dateRange: { start: null, end: null }, statuses: [], operations: [], client: null };
}

export function hasActiveFilters(f: FilterState): boolean {
  return (
    f.dateRange.start !== null ||
    f.dateRange.end !== null ||
    f.statuses.length > 0 ||
    f.operations.length > 0 ||
    f.client !== null
  );
}
