import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyCookie, parseCookies, COOKIE_NAME } from './_lib/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const cookies = parseCookies(req.headers.cookie);
  const authenticated = verifyCookie(cookies[COOKIE_NAME]);
  return res.status(200).json({ authenticated });
}
