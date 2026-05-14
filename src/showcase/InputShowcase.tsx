import { useState } from 'react'
import Input from '../components/Input'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium uppercase tracking-wide"
        style={{ color: 'var(--color-text-secondary-text)' }}>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">{children}</div>
    </section>
  )
}

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
)
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
  </svg>
)

export default function InputShowcase() {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')

  return (
    <main className="flex flex-col gap-10">
      <Section title="Variantes">
        <Input label="Default" placeholder="Escribe algo…" variant="default" />
        <Input label="Filled" placeholder="Escribe algo…" variant="filled" />
        <Input label="Ghost" placeholder="Escribe algo…" variant="ghost" />
      </Section>

      <Section title="Tamaños">
        <Input label="Small" placeholder="sm" size="sm" />
        <Input label="Medium" placeholder="md (default)" size="md" />
        <Input label="Large" placeholder="lg" size="lg" />
      </Section>

      <Section title="Con íconos">
        <Input label="Buscar" placeholder="Buscar facturas…" leftIcon={<IconSearch />} />
        <Input label="Email" type="email" placeholder="tu@monato.com"
          leftIcon={<IconMail />} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Contraseña" type="password" placeholder="••••••••"
          value={pwd} onChange={(e) => setPwd(e.target.value)} />
      </Section>

      <Section title="Estados de validación">
        <Input label="Con error" defaultValue="correo-invalido"
          errorText="Ingresa un correo válido." />
        <Input label="Con éxito" defaultValue="alex@monato.com"
          successText="Correo verificado." />
        <Input label="Con ayuda" placeholder="ej. 0712345678"
          helperText="10 dígitos sin guiones." />
      </Section>

      <Section title="Estados">
        <Input label="Disabled" placeholder="No editable" disabled />
        <Input label="Readonly" defaultValue="Valor fijo" readOnly />
        <Input label="Requerido" placeholder="Obligatorio" required />
      </Section>
    </main>
  )
}
