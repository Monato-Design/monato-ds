import crypto from 'crypto';

const COOKIE_NAME = 'monato-auth';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET env var is required');
  return secret;
}

export function getPassword(): string {
  const pw = process.env.AUTH_PASSWORD;
  if (!pw) throw new Error('AUTH_PASSWORD env var is required');
  return pw;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createCookieValue(): string {
  const issuedAt = Date.now().toString();
  const sig = sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

export function verifyCookie(value: string | undefined): boolean {
  if (!value) return false;
  const [issuedAt, sig] = value.split('.');
  if (!issuedAt || !sig) return false;

  const expected = sign(issuedAt);
  // Comparación segura contra timing attacks
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;

  // Verificar expiración
  const issued = parseInt(issuedAt, 10);
  if (isNaN(issued)) return false;
  const ageSeconds = (Date.now() - issued) / 1000;
  return ageSeconds < MAX_AGE_SECONDS;
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

export function buildSetCookie(value: string, maxAge: number = MAX_AGE_SECONDS): string {
  const secure = process.env.VERCEL_ENV ? 'Secure; ' : '';
  return `${COOKIE_NAME}=${value}; HttpOnly; ${secure}SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function buildClearCookie(): string {
  return buildSetCookie('', 0);
}

export { COOKIE_NAME };
