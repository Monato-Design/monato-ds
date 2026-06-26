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

  return (
    <>
      {children}
      <LogoutButton onLogout={() => setState('unauthenticated')} />
    </>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  const handleClick = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    onLogout();
  };

  return (
    <button
      onClick={handleClick}
      title="Cerrar sesión"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        padding: '8px 14px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-border-secondary-alt)',
        background: 'var(--color-background-white-primary)',
        color: 'var(--color-text-secondary-text)',
        fontFamily: 'var(--font-family-sans)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        zIndex: 9999,
      }}
    >
      Cerrar sesión
    </button>
  );
}
