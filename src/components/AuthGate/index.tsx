import { useEffect, useState, type ReactNode } from 'react';
import { Login } from '../Login';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [state, setState] = useState<AuthState>('loading');

  useEffect(() => {
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
