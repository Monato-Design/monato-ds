import { useEffect, useState, type ReactNode } from 'react';
import { Login } from '../Login';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthGateProps {
  children: ReactNode;
}

// Local dev (Vite `npm run dev`) has no serverless `api/` routes, so the gate
// can't validate. Skip it in dev only — production (Vercel build) keeps the gate.
const DEV_BYPASS = import.meta.env.DEV;

export function AuthGate({ children }: AuthGateProps) {
  const [state, setState] = useState<AuthState>(DEV_BYPASS ? 'authenticated' : 'loading');

  useEffect(() => {
    if (DEV_BYPASS) return;
    fetch('/api/check', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => setState(d.authenticated ? 'authenticated' : 'unauthenticated'))
      .catch(() => setState('unauthenticated'));
  }, []);

  if (state === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-background-white-primary)',
        }}
      />
    );
  }

  if (state === 'unauthenticated') {
    return <Login onSuccess={() => setState('authenticated')} />;
  }

  return <>{children}</>;
}
