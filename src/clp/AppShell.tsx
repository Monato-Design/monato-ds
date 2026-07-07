import { useState } from 'react';
import { Sidebar, type ClpScreen } from './Sidebar';
import { PortafolioScreen } from './PortafolioScreen';
import { ClientesScreen } from './ClientesScreen';

// App shell for the CLP prototype: sidebar + active screen (each screen owns its TopBar).
// Portafolio and Clientes are wired; the rest are disabled in the sidebar until their designs land.
export function AppShell() {
  const [screen, setScreen] = useState<ClpScreen>('portafolio');

  return (
    <div className="flex h-full w-full bg-background-soft-50">
      <Sidebar active={screen} onNavigate={setScreen} />
      {screen === 'portafolio' && <PortafolioScreen />}
      {screen === 'clientes' && <ClientesScreen />}
    </div>
  );
}
