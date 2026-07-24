import {
  Headphone1Mic,
  Wallet2,
  DoubleCheckMark,
  Shield1Check,
  Bell1,
  FileTextMultiple,
} from '@tailgrids/icons';
import { EntryCard } from '../components/EntryCard';
import { AGENTE_ACTUAL } from '../data';
import type { KoraModule } from '../types';

const MODULES: { id: KoraModule; icon: typeof Wallet2; title: string; description: string }[] = [
  { id: 'atencion', icon: Headphone1Mic, title: 'Atención al Cliente', description: 'Conversaciones y tickets JIRA.' },
  { id: 'productos', icon: Wallet2, title: 'Productos', description: 'SPEI, Bill Pay y DOMI.' },
  { id: 'onboarding', icon: DoubleCheckMark, title: 'Onboarding', description: 'Alta de credenciales y seguimiento del onboarding de clientes.' },
  { id: 'compliance', icon: Shield1Check, title: 'Compliance', description: 'Bloqueo y congelado de cuentas por fraude o AML.' },
  { id: 'notificaciones', icon: Bell1, title: 'Notificaciones', description: 'Comunicados y alertas hacia clientes.' },
  { id: 'auditlog', icon: FileTextMultiple, title: 'Audit Log', description: 'Registro de todas las acciones ejecutadas.' },
];

export function HomeScreen({ onNavigate }: { onNavigate: (id: KoraModule) => void }) {
  const nombre = AGENTE_ACTUAL.nombre.split(' ')[0];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-title-50">Hola, {nombre} 👋</h2>
        <p className="mt-1 text-sm text-text-100">Selecciona un módulo para comenzar.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <EntryCard
            key={m.id}
            icon={m.icon}
            title={m.title}
            description={m.description}
            onClick={() => onNavigate(m.id)}
          />
        ))}
      </div>
    </div>
  );
}
