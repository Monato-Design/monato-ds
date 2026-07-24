import { Badge } from '@/components/core/badge';
import { FECHA_HOY_LABEL } from './data';

export function TopBar({ title }: { title: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#d9e2ec] bg-background-50 px-7">
      <h1 className="text-base font-semibold text-title-50">{title}</h1>
      <div className="flex items-center gap-3">
        <Badge color="sky" size="sm">Prototipo v1.0</Badge>
        <span className="text-xs text-text-100">{FECHA_HOY_LABEL}</span>
      </div>
    </header>
  );
}
