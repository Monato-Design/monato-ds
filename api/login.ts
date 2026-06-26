import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createCookieValue, buildSetCookie, getPassword } from './_lib/auth';
import crypto from 'crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body ?? {};
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'Password required' });
  }

  // Comparación segura contra timing attacks
  const expected = getPassword();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  res.setHeader('Set-Cookie', buildSetCookie(createCookieValue()));
  return res.status(200).json({ ok: true });
}
