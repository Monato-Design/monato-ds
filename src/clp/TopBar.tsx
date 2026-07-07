// Top navigation bar — page title + optional right-side actions. Matches CLP V1.0 "Page Titles".
export function TopBar({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-base-100 bg-background-50 px-6">
      <h1 className="text-xl font-medium text-title-50">{title}</h1>
      {actions && <div className="ml-auto flex items-center gap-3">{actions}</div>}
    </header>
  );
}
