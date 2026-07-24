import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { HomeScreen } from './pages/HomeScreen';
import { AtencionScreen } from './pages/AtencionScreen';
import { ProductosScreen } from './pages/ProductosScreen';
import type { KoraModule } from './types';

const TITLES: Record<KoraModule, string> = {
  home: 'Inicio',
  atencion: 'Atención al Cliente',
  productos: 'Productos',
  onboarding: 'Onboarding',
  compliance: 'Compliance',
  notificaciones: 'Notificaciones',
  auditlog: 'Audit Log',
};

export function AppShell({ onLogout }: { onLogout: () => void }) {
  const [screen, setScreen] = useState<KoraModule>('home');

  return (
    <div className="flex h-full w-full bg-background-soft-50">
      <Sidebar active={screen} onNavigate={setScreen} onLogout={onLogout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={TITLES[screen]} />
        <main className="flex-1 overflow-y-auto p-7">
          {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
          {screen === 'atencion' && <AtencionScreen />}
          {screen === 'productos' && <ProductosScreen />}
          {(screen === 'onboarding' ||
            screen === 'compliance' ||
            screen === 'notificaciones' ||
            screen === 'auditlog') && (
            <div className="flex h-full items-center justify-center text-sm text-text-100">
              Este módulo llega en la próxima fase de Kora.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
