import { useEffect, useState } from 'react'
import Button from './components/Button'

type Theme = 'light' | 'dark'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2
        className="text-sm font-medium uppercase tracking-wide"
        style={{ color: 'var(--color-text-secondary-text)' }}
      >
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  )
}

export default function App() {
  const [theme, setTheme] = useState<Theme>('light')

  // Apply theme to <html> so [data-theme] selectors in tokens.css activate
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const variants = ['primary', 'secondary', 'ghost', 'danger', 'success'] as const
  const sizes = ['sm', 'md', 'lg'] as const

  return (
    <div className="min-h-screen p-10">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-semibold"
            style={{ color: 'var(--color-text-title)' }}
          >
            Monato DS — Button
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary-text)' }}>
            Showcase de variantes, tamaños y estados.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? '◐ Dark' : '◑ Light'}
        </Button>
      </header>

      <main className="flex flex-col gap-10">
        {variants.map((variant) => (
          <Section key={variant} title={variant}>
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {capitalize(variant)} · {size}
              </Button>
            ))}
            <Button variant={variant} size="md" disabled>
              Disabled
            </Button>
            <Button variant={variant} size="md" loading>
              Loading
            </Button>
          </Section>
        ))}

        <Section title="Con íconos">
          <Button variant="primary" leftIcon={<IconPlus />}>
            Crear factura
          </Button>
          <Button variant="secondary" rightIcon={<IconArrow />}>
            Continuar
          </Button>
          <Button variant="danger" leftIcon={<IconTrash />}>
            Eliminar
          </Button>
        </Section>

        <Section title="Full width">
          <div className="w-full max-w-md">
            <Button variant="primary" fullWidth>
              Full width primary
            </Button>
          </div>
        </Section>
      </main>
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/* Tiny inline icons (no external dep for this showcase) */
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </svg>
)
