import { useEffect, useState } from 'react'
import Button from '../components/Button'
import ButtonShowcase from '../showcase/ButtonShowcase'
import InputShowcase from '../showcase/InputShowcase'
import BadgeShowcase from '../showcase/BadgeShowcase'

type Theme = 'light' | 'dark'
type ComponentId = 'button' | 'input' | 'badge'

const NAV: { id: ComponentId; label: string }[] = [
  { id: 'button', label: 'Button' },
  { id: 'input', label: 'Input' },
  { id: 'badge', label: 'Badge' },
]

export default function Showcase() {
  const [theme, setTheme] = useState<Theme>('light')
  const [active, setActive] = useState<ComponentId>('button')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="min-h-screen flex"
      style={{ backgroundColor: 'var(--color-input-background)' }}>
      <aside className="w-60 shrink-0 border-r flex flex-col"
        style={{ borderColor: 'var(--color-border-secondary-alt)' }}>
        <div className="px-6 py-6 border-b"
          style={{ borderColor: 'var(--color-border-secondary-alt)' }}>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-title)' }}>
            Monato DS
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary-text)' }}>
            Showcase
          </p>
        </div>

        <nav className="flex flex-col py-4 px-3 gap-1 flex-1">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--color-text-tertiary-text)' }}>
            Componentes
          </p>
          {NAV.map((item) => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className="text-left px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--color-border-primary)' : 'transparent',
                  color: isActive ? 'var(--color-text-title)' : 'var(--color-text-body)',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--color-border-secondary-alt)' }}>
          <Button variant="ghost" size="sm" fullWidth
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '◐ Dark mode' : '◑ Light mode'}
          </Button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-10 py-10">
          <header className="mb-10">
            <h2 className="text-3xl font-semibold capitalize"
              style={{ color: 'var(--color-text-title)' }}>
              {active}
            </h2>
            <p className="mt-1" style={{ color: 'var(--color-text-secondary-text)' }}>
              Catálogo de variantes, tamaños y estados.
            </p>
          </header>

          {active === 'button' && <ButtonShowcase />}
          {active === 'input' && <InputShowcase />}
          {active === 'badge' && <BadgeShowcase />}
        </div>
      </div>
    </div>
  )
}
