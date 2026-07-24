import { ArrowRight } from '@tailgrids/icons';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface EntryCardProps {
  icon: IconComponent;
  title: string;
  description: string;
  onClick: () => void;
}

// Module/entry card reutilizable — antes duplicado copy-paste en cada prototipo del DS.
export function EntryCard({ icon: Icon, title, description, onClick }: EntryCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col rounded-xl border border-[#d9e2ec] bg-background-50 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--primitive-skyblue-400)] hover:shadow-lg"
    >
      <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[var(--primitive-skyblue-500)] transition-transform group-hover:scale-x-100" />
      <div className="mb-3 flex items-center gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primitive-skyblue-a10)]">
          <Icon size={22} className="text-[var(--primitive-skyblue-500)]" />
        </div>
        <h3 className="text-[15px] font-bold leading-tight text-title-50">{title}</h3>
      </div>
      <p className="mb-3.5 text-xs leading-relaxed text-text-100">{description}</p>
      <div className="mt-auto flex items-center justify-end border-t border-[#d9e2ec] pt-3">
        <div className="flex size-7 items-center justify-center rounded-md bg-[var(--primitive-skyblue-500)] text-white-100">
          <ArrowRight size={14} />
        </div>
      </div>
    </button>
  );
}
