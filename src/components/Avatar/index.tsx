import type { CSSProperties } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /** Nombre completo. Se usa para derivar iniciales y un color estable por persona. */
  name: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'size-8 text-[11px]',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
};

/**
 * Paleta de color por persona (hash estable del nombre).
 * Extraída tal cual del patrón probado en CrossBorder/Accounts.
 *
 * Mapeada a tokens de tokens.css donde hay match exacto de valor.
 * Los pares marcados "pendiente" no tienen token equivalente hoy en
 * tokens.css (mismatch conocido Figma vs tokens.css). Se dejan como
 * literal hasta que ese mismatch se resuelva; no se inventan tokens
 * nuevos para no adelantarnos a una decisión de diseño.
 */
const AVATAR_COLORS: { bg: string; fg: string }[] = [
  { bg: 'var(--primitive-brand-100)', fg: '#3758f9' },            // brand — fg pendiente
  { bg: '#fdf2fa', fg: '#dd2590' },                                 // pink — bg/fg pendientes
  { bg: '#fafde8', fg: 'var(--primitive-yellow-accent-800)' },      // yellow-accent — bg pendiente
  { bg: '#e9f9f0', fg: '#16894c' },                                 // green — bg/fg pendientes
  { bg: 'var(--primitive-skyblue-50)', fg: 'var(--primitive-skyblue-500)' },
  { bg: 'var(--primitive-purple-100)', fg: 'var(--primitive-purple-700)' },
  { bg: 'var(--primitive-orange-50)', fg: 'var(--primitive-brown-500)' },
];

/** Iniciales del nombre (máx 2 caracteres). */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Color estable por nombre vía hash simple. Mismo nombre, mismo color, siempre. */
function avatarColor(name: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const { bg, fg } = avatarColor(name);
  const style: CSSProperties = { backgroundColor: bg, color: fg };

  return (
    <div
      className={`ds-avatar rounded-full shrink-0 flex items-center justify-center font-semibold ${SIZE_CLASSES[size]} ${className}`}
      style={style}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
