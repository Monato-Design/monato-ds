import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createCookieValue, buildSetCookie, getPassword } from './_lib/auth';
import crypto from 'crypto';

const MONATO_DOMAIN_RE = /^[^\s@]+@monato\.com$/i;

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body ?? {};

  if (typeof password !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  // Domain validation — must be @monato.com
  if (!MONATO_DOMAIN_RE.test(email.trim())) {
    return res.status(401).json({ error: 'Solo cuentas @monato.com' });
  }

  // Timing-safe password comparison
  const expected = getPassword();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  res.setHeader('Set-Cookie', buildSetCookie(createCookieValue()));
  return res.status(200).json({ ok: true, email: email.toLowerCase().trim() });
}
