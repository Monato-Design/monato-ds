import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildClearCookie } from './_lib/auth.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', buildClearCookie());
  return res.status(200).json({ ok: true });
}
