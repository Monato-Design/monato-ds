export type BadgeColor = 'primary' | 'success' | 'warning' | 'error';

// Pill badge for Etapa / Estado columns. Colors come from the CLP token layer.
export function StatusBadge({ color, children }: { color: BadgeColor; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{
        backgroundColor: `var(--clp-badge-${color}-bg)`,
        color: `var(--clp-badge-${color}-text)`,
      }}
    >
      {children}
    </span>
  );
}
