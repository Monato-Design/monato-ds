import Badge from '../components/Badge'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium uppercase tracking-wide"
        style={{ color: 'var(--color-text-secondary-text)' }}>
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  )
}

const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const VARIANTS = ['default', 'brand', 'success', 'warning', 'error', 'info'] as const

export default function BadgeShowcase() {
  return (
    <main className="flex flex-col gap-10">
      <Section title="Variantes (md)">
        {VARIANTS.map((v) => (
          <Badge key={v} variant={v}>{v}</Badge>
        ))}
      </Section>

      <Section title="Tamaños">
        {VARIANTS.map((v) => (
          <Badge key={v} variant={v} size="sm">{v} · sm</Badge>
        ))}
      </Section>

      <Section title="Con dot">
        {VARIANTS.map((v) => (
          <Badge key={v} variant={v} dot>{v}</Badge>
        ))}
      </Section>

      <Section title="Pill">
        {VARIANTS.map((v) => (
          <Badge key={v} variant={v} pill>{v}</Badge>
        ))}
      </Section>

      <Section title="Pill + dot">
        {VARIANTS.map((v) => (
          <Badge key={v} variant={v} pill dot>{v}</Badge>
        ))}
      </Section>

      <Section title="Con ícono">
        <Badge variant="success" leftIcon={<IconCheck />}>Pagado</Badge>
        <Badge variant="warning" leftIcon={<IconCheck />}>Pendiente</Badge>
        <Badge variant="error" leftIcon={<IconCheck />}>Vencido</Badge>
        <Badge variant="info" pill leftIcon={<IconCheck />}>En revisión</Badge>
      </Section>
    </main>
  )
}
