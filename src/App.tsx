import { useState } from 'react';
import { Button } from './components/core/button';
import { Badge } from './components/core/badge';
import { Input } from './components/core/input';
import Alert from './components/core/alert';

/**
 * Smoke test page for the Monato DS theme bridge.
 *
 * Renders a sample of components in light and dark themes. If colors
 * look "Monato Skyblue" (not Tailgrids indigo), the bridge is working.
 */
export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div
      data-theme={theme}
      className="bg-background-50 min-h-screen p-8 font-sans"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-title-50 text-2xl font-semibold">
            Monato DS — smoke test
          </h1>
          <Button
            variant="primary"
            appearance="outline"
            size="sm"
            onClick={() =>
              setTheme((t) => (t === 'light' ? 'dark' : 'light'))
            }
          >
            Toggle {theme === 'light' ? 'dark' : 'light'}
          </Button>
        </header>

        <section className="space-y-3">
          <h2 className="text-text-50 text-sm font-medium tracking-wide uppercase">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="primary" appearance="outline">
              Outline
            </Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-50 text-sm font-medium tracking-wide uppercase">
            Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge color="primary">Primary</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="error">Error</Badge>
            <Badge color="gray">Gray</Badge>
            <Badge color="sky">Sky</Badge>
            <Badge color="violet">Violet</Badge>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-50 text-sm font-medium tracking-wide uppercase">
            Input
          </h2>
          <Input placeholder="hello@monato.com" />
        </section>

        <section className="space-y-3">
          <h2 className="text-text-50 text-sm font-medium tracking-wide uppercase">
            Alert
          </h2>
          <Alert
            variant="info"
            title="Monato DS v0.1"
            message="Components powered by Tailgrids structure, themed via Monato tokens. Skyblue is the new primary."
          />
        </section>
      </div>
    </div>
  );
}
