/**
 * User display helpers — Monato DS auth
 *
 * Maps the logged-in user's email (stored in localStorage on successful login)
 * to a display name, initials, and gendered greeting for the sidebar footer.
 *
 * Trust model: this is for VISUAL personalization only. The actual auth gate
 * is enforced by the signed httpOnly cookie set by /api/login. Anyone with
 * DevTools could fake the localStorage value to appear as a different user,
 * but they can't bypass the password gate.
 */

const STORAGE_KEY = 'monato-user-email';

export interface UserDisplay {
  name: string;
  initials: string;
  greeting: string; // gendered: "Bienvenido" / "Bienvenida"
  email: string | null;
}

const USERS: Record<string, Omit<UserDisplay, 'email'>> = {
  'alex.lara@monato.com': {
    name: 'Alex Lara',
    initials: 'AL',
    greeting: 'Bienvenido',
  },
  'karola.amador@monato.com': {
    name: 'Karola Amador',
    initials: 'KA',
    greeting: 'Bienvenida',
  },
  'fernando.villa@monato.com': {
    name: 'Fernando Villa',
    initials: 'FV',
    greeting: 'Bienvenido',
  },
  'tania.gonzalez@monato.com': {
    name: 'Tania Gonzalez',
    initials: 'TG',
    greeting: 'Bienvenida',
  },
};

const GUEST: Omit<UserDisplay, 'email'> = {
  name: 'Guest Monato',
  initials: 'GM',
  greeting: 'Bienvenido',
};

/** Read the current logged-in email from localStorage. Null if not set. */
function readEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY)?.toLowerCase().trim() || null;
  } catch {
    return null;
  }
}

/** Get display info for the current user. Falls back to Guest Monato. */
export function getUserDisplay(): UserDisplay {
  const email = readEmail();
  if (!email) return { ...GUEST, email: null };
  const known = USERS[email];
  return { ...(known ?? GUEST), email };
}

/** Persist the user's email after successful login. */
export function setUserEmail(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, email.toLowerCase().trim());
  } catch {
    // localStorage might be blocked (private mode, etc) — silent failure is fine
  }
}

/** Clear the stored email on logout. */
export function clearUserEmail(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}

/** Validate that an email is from the @monato.com domain. */
export function isMonatoEmail(email: string): boolean {
  return /^[^\s@]+@monato\.com$/i.test(email.trim());
}
