interface StatCardProps {
  label: string;
  value: string | number;
  tone?: 'default' | 'danger' | 'warning';
}

const TONE_CLASS: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-title-50',
  danger: 'text-[var(--color-badges-error-text)]',
  warning: 'text-[var(--color-badges-warning-text)]',
};

export function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[#d9e2ec] bg-background-50 p-4">
      <p className="text-[11px] font-medium tracking-wide text-text-100 uppercase">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold ${TONE_CLASS[tone]}`}>{value}</p>
    </div>
  );
}
