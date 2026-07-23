import { cn } from '@/utils/cn';
import type { ComponentProps } from 'react';

// Tabla propia de Kora — el Table genérico del DS usa border-[#d9e2ec], que resuelve a
// --primitive-gray-50 (#fafafa): casi invisible sobre fondo blanco. Figma (node 8617:24520)
// usa un gris-azulado #d9e2ec para los divisores y #f8fafc para el header — los mismos
// hex que ya está aprobado usar directo para bordes (ver CLAUDE.md). Se hardcodean aquí
// porque la escala "gray" semántica del DS no coincide con la paleta azul-gris real de Figma.
const BORDER = '#d9e2ec';
const HEADER_BG = '#f8fafc';

export function TableRoot({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className={cn('overflow-hidden rounded-xl border bg-background-50', className)} style={{ borderColor: BORDER }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse text-left" {...props} />
      </div>
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={className} style={{ backgroundColor: HEADER_BG }} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('[&>tr:last-child>td]:border-b-0', className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn('h-11 whitespace-nowrap border-b px-5 text-xs font-medium text-[#486581]', className)}
      style={{ borderColor: BORDER }}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('transition-colors hover:bg-[#f8fafc]/60', className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      className={cn('h-16 border-b px-5 text-sm text-[#486581]', className)}
      style={{ borderColor: BORDER }}
      {...props}
    />
  );
}
