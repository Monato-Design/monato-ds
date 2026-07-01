// src/docs/pages.tsx
// Contenido de todas las páginas — transcrito 1:1 desde monato-docs-v2.html
// Convención:
//   - Cada page es un componente React.
//   - El shell (Docs.tsx) renderiza breadcrumb + right rail; las pages sólo dan .docs-prose.
//   - Right rail (code samples / TOC) se declara por página vía `rail`.

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { PageId, Method } from './nav';

// ── Helpers de UI ────────────────────────────────────────────
export function Verb({ method, className }: { method: Method | 'evt' | '4xx'; className?: string }) {
  const map: Record<string, string> = {
    GET: 'docs-verb--get',
    POST: 'docs-verb--post',
    DEL: 'docs-verb--del',
    PUT: 'docs-verb--put',
    evt: 'docs-verb--evt',
    '4xx': 'docs-verb--del',
  };
  return <span className={`docs-verb ${map[method] ?? ''} ${className ?? ''}`}>{method}</span>;
}

export function Endpoint({ method, path }: { method: Method | 'evt' | '4xx'; path: string }) {
  return (
    <div className="docs-ep">
      <Verb method={method} />
      <span className="docs-path">{path}</span>
    </div>
  );
}

// Link interno que dispara navegación entre pages
export function DLink({ to, children, go }: { to: PageId; children: ReactNode; go: (id: PageId) => void }) {
  return (
    <a onClick={() => go(to)}>{children}</a>
  );
}

// ── Right rail definitions ───────────────────────────────────
// Cada page puede opcionalmente devolver una definición del rail.
// Los samples se renderizan por Docs.tsx (necesita estado para el tab de lenguaje).

export type SampleBlock = {
  section: string; // "Petición" / "Respuesta" / etc.
  code: ReactNode; // JSX pre-formateado
  lang?: string;   // ident del lenguaje (para tabs)
};

export type Sample = {
  method: Method | 'evt' | '4xx';
  path: string;
  langs?: string[];       // ['cURL', 'Node']
  activeLang?: string;
  blocks: SampleBlock[];
};

export type TocEntry = { id: string; label: string };

export type PageDefinition = {
  id: PageId;
  crumb: string[];         // ['Primeros pasos', 'Quickstart']
  title: string;
  intro?: ReactNode | ((go: (id: PageId) => void) => ReactNode);
  body: (go: (id: PageId) => void) => ReactNode;
  sample?: Sample;
  toc?: TocEntry[];        // si tiene toc, se usa como rail cuando no hay sample
  layout?: 'solo' | 'grid' | 'full';
};

// ─────────────────────────────────────────────────────────────
// Syntax tokens (usados dentro de <pre>)
const S = ({ children }: { children: ReactNode }) => <span className="tk-str">{children}</span>;
const K = ({ children }: { children: ReactNode }) => <span className="tk-key">{children}</span>;
const P = ({ children }: { children: ReactNode }) => <span className="tk-punct">{children}</span>;
const F = ({ children }: { children: ReactNode }) => <span className="tk-fn">{children}</span>;

// ─────────────────────────────────────────────────────────────
// PAGE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export const PAGES: Record<PageId, PageDefinition> = {
  // ── Get started ────────────────────────────────────────────
  overview: {
    id: 'overview',
    crumb: ['Overview'],
    title: 'Bienvenido a Monato Fincore',
    intro: 'Una conexión directa a SPEI para recibir y enviar dinero desde tu producto, sin construir infraestructura bancaria.',
    layout: 'grid',
    toc: [
      { id: 'que-puedes-hacer', label: 'Qué puedes hacer' },
      { id: 'por-donde-empezar', label: 'Por dónde empezar' },
    ],
    body: (go) => (
      <>
        <h2 id="que-puedes-hacer">Qué puedes hacer</h2>
        <ul>
          <li>Recibir y enviar pagos por SPEI de forma segura.</li>
          <li>Consultar saldos en tiempo real.</li>
          <li>Mover dinero entre cuentas y rastrear cada movimiento.</li>
          <li>Descargar reportes y estados de cuenta por fecha.</li>
        </ul>
        <h2 id="por-donde-empezar">Por dónde empezar</h2>
        <p>
          Para ir al código, sigue el <DLink to="quickstart" go={go}>Quickstart</DLink>. Si es tu primera vez,
          lee antes <DLink to="cuenta" go={go}>Conceptos → Cuenta</DLink>: ahí está el modelo completo con un ejemplo.
          ¿Buscas un endpoint? Ve al <DLink to="apiref" go={go}>API Reference</DLink>.
        </p>
      </>
    ),
  },

  quickstart: {
    id: 'quickstart',
    crumb: ['Primeros pasos', 'Quickstart'],
    title: 'Quickstart',
    intro: 'De cero a una cuenta que recibe dinero, en cuatro pasos.',
    layout: 'grid',
    body: (go) => (
      <>
        <ol className="docs-steps">
          <li><b>Consigue tus credenciales</b> y genera un token. Ver <DLink to="cred" go={go}>Credenciales y token</DLink>.</li>
          <li><b>Crea una cuenta</b> para tu usuario.</li>
          <li><b>Ponle un número de cuenta</b> ligándole una CLABE para que pueda recibir dinero.</li>
          <li><b>Escucha el dinero</b> con un webhook de Money In.</li>
        </ol>
        <p>Al terminar, tu usuario ya puede recibir SPEI.</p>
      </>
    ),
    sample: {
      method: 'POST',
      path: '/v1/clients/{clientId}/accounts',
      langs: ['cURL'],
      activeLang: 'cURL',
      blocks: [
        {
          section: 'Petición',
          lang: 'cURL',
          code: (
            <>
              <F>curl</F>{' -X POST .../accounts \\\n  -H '}<S>"Authorization: Bearer $TOKEN"</S>{' \\\n  -d '}<S>{`'{ "type": "wallet", "currency": "MXN" }'`}</S>
            </>
          ),
        },
      ],
    },
  },

  cred: {
    id: 'cred',
    crumb: ['Primeros pasos', 'Credenciales y token'],
    title: 'Credenciales y token',
    intro: 'El acceso es de dos pasos: una llave de larga duración para identificarte, y un token corto para todo lo demás.',
    layout: 'grid',
    body: () => (
      <>
        <p>
          Primero recuperas tu secreto (con tu <code>x-api-key</code>). Con él generas un token JWT,
          que viaja en <code>Authorization: Bearer</code> en cada llamada.
        </p>
        <Endpoint method="GET" path="/v1/clients/{clientId}/credentials" />
        <Endpoint method="POST" path="/v1/clients/{clientId}/auth/tokens" />
      </>
    ),
    sample: {
      method: 'POST',
      path: '/auth/tokens',
      blocks: [
        {
          section: 'Respuesta',
          code: (
            <>
              <P>{'{ '}</P><K>"token"</K><P>: </P><S>"eyJ…"</S><P>, </P><K>"expires_at"</K><P>: </P><S>"2026-06-18T…"</S><P>{' }'}</P>
            </>
          ),
        },
      ],
    },
  },

  authg: {
    id: 'authg',
    crumb: ['Primeros pasos', 'Autenticación'],
    title: 'Autenticación',
    intro: 'Hay dos formas de identificarte, cada una para algo distinto.',
    layout: 'grid',
    body: () => (
      <>
        <table className="docs-table">
          <thead><tr><th>Cuándo</th><th>Cómo</th></tr></thead>
          <tbody>
            <tr><td>Para emitir un token</td><td>Header <code>x-api-key</code>.</td></tr>
            <tr><td>Para todo lo demás</td><td>Header <code>Authorization: Bearer</code>.</td></tr>
          </tbody>
        </table>
        <p>Pides el token una vez, lo guardas mientras dure, y lo mandas en cada llamada. Cuando expira, pides otro.</p>
      </>
    ),
  },

  cfgwh: {
    id: 'cfgwh',
    crumb: ['Primeros pasos', 'Configurar webhooks'],
    title: 'Configurar webhooks',
    intro: 'Un webhook es una URL tuya a la que Monato manda avisos: entró dinero, cambió un estado, hay un reporte.',
    layout: 'grid',
    body: (go) => (
      <>
        <p>
          Registras la URL una vez indicando qué avisos quieres: <code>MONEY_IN</code>, <code>STATUS_UPDATE</code>,
          {' '}<code>CEP</code> o <code>REPORT</code>. Los administras en{' '}
          <DLink to="webhooks" go={go}>Webhooks</DLink>.
        </p>
        <Endpoint method="POST" path="/v1/clients/{clientId}/webhooks" />
      </>
    ),
    sample: {
      method: 'POST',
      path: '/webhooks',
      blocks: [
        {
          section: 'Petición',
          code: (
            <>
              <P>{'{ '}</P><K>"url"</K><P>: </P><S>"https://tuapp.com/hook"</S><P>, </P><K>"webhook_type"</K><P>: </P><S>"MONEY_IN"</S><P>{' }'}</P>
            </>
          ),
        },
      ],
    },
  },

  sbx: {
    id: 'sbx',
    crumb: ['Primeros pasos', 'Sandbox y pruebas'],
    title: 'Sandbox y pruebas',
    intro: 'Sandbox es un entorno idéntico al real, pero con dinero ficticio.',
    layout: 'grid',
    body: (go) => (
      <p>
        Para cambiar de entorno solo cambias el host y el token; tu código no cambia. Como no hay SPEI real,
        puedes <DLink to="sim" go={go}>simular</DLink> entradas de dinero, comprobantes y devoluciones.
      </p>
    ),
  },

  // ── Trabajar con la API ────────────────────────────────────
  pag: {
    id: 'pag',
    crumb: ['Trabajar con la API', 'Paginación'],
    title: 'Paginación',
    intro: 'Cuando una lista trae muchos resultados, llegan en páginas.',
    layout: 'grid',
    body: () => (
      <p>
        Pides la página con <code>page</code> y el tamaño con <code>per_page</code>. En la respuesta vienen
        {' '}<code>currentPage</code>, <code>perPage</code> y <code>totalItems</code>. Misma convención en todos los listados.
      </p>
    ),
  },

  idem: {
    id: 'idem',
    crumb: ['Trabajar con la API', 'Idempotencia'],
    title: 'Idempotencia',
    intro: 'Evita que, si reintentas una llamada, el dinero se mueva dos veces.',
    layout: 'grid',
    body: () => (
      <>
        <p>
          En cada <code>POST</code> que mueve dinero mandas un header <code>Idempotency-Key</code> único.
          Si reintentas con la misma llave, Monato no vuelve a ejecutar: devuelve la respuesta de la primera vez.
        </p>
        <div className="docs-note">
          <p style={{ margin: 0 }}>
            Si reusas la llave pero cambias el cuerpo, recibes <code>409</code>. Cada operación distinta lleva su propia llave.
          </p>
        </div>
      </>
    ),
  },

  err: {
    id: 'err',
    crumb: ['Trabajar con la API', 'Errores'],
    title: 'Errores',
    intro: 'Todos los errores llegan igual: código HTTP, un código estable para tu programa, y un mensaje para humanos.',
    layout: 'grid',
    body: () => (
      <table className="docs-table">
        <thead><tr><th>HTTP</th><th>Código</th><th>Qué pasó</th></tr></thead>
        <tbody>
          <tr><td>404</td><td><code>RESOURCE_NOT_FOUND</code></td><td>El recurso no existe.</td></tr>
          <tr><td>400</td><td><code>BUSINESS_RULE_VIOLATION</code></td><td>No cumple una regla (p. ej. fondos insuficientes).</td></tr>
          <tr><td>409</td><td><code>DATA_INTEGRITY_VIOLATION</code></td><td>Conflicto, como idempotencia repetida.</td></tr>
        </tbody>
      </table>
    ),
    sample: {
      method: '4xx',
      path: 'Formato de error',
      blocks: [
        {
          section: 'Ejemplo',
          code: (
            <>
              <P>{'{ '}</P><K>"code"</K><P>: </P><S>"BUSINESS_RULE_VIOLATION"</S><P>, </P><K>"message"</K><P>: </P><S>"Fondos insuficientes"</S><P>{' }'}</P>
            </>
          ),
        },
      ],
    },
  },

  evt: {
    id: 'evt',
    crumb: ['Trabajar con la API', 'Eventos y webhooks'],
    title: 'Eventos y webhooks',
    intro: 'Los eventos te avisan de cosas que pasan por su cuenta, sin que preguntes.',
    layout: 'grid',
    body: (go) => (
      <>
        <p>Cada evento llega como un POST a tu URL, con una envoltura común y el detalle en el cuerpo.</p>
        <table className="docs-table">
          <thead><tr><th>Evento</th><th>Qué te avisa</th></tr></thead>
          <tbody>
            <tr><td><code>MONEY_IN</code></td><td>Entró dinero. Ver <DLink to="transactions" go={go}>Transactions</DLink>.</td></tr>
            <tr><td><code>STATUS_UPDATE</code></td><td>Cambió un estado.</td></tr>
            <tr><td><code>CEP</code></td><td>Comprobante Banxico de un pago.</td></tr>
            <tr><td><code>REPORT</code></td><td>Reporte listo.</td></tr>
          </tbody>
        </table>
      </>
    ),
  },

  // ── Conceptos ──────────────────────────────────────────────
  cliente: {
    id: 'cliente',
    crumb: ['Conceptos', 'Cliente'],
    title: 'Cliente',
    intro: 'El cliente eres tú: la empresa que integra Monato.',
    layout: 'solo',
    body: () => (
      <p>
        Si tu producto da servicio a colegios, tu empresa es el cliente. Todo lo que creas —cuentas,
        números de cuenta, webhooks— vive bajo tu cliente y se identifica con tu <code>client_id</code>.
      </p>
    ),
  },

  cuenta: {
    id: 'cuenta',
    crumb: ['Conceptos', 'Cuenta'],
    title: 'Cuenta',
    intro: 'Una cuenta es donde Monato guarda el dinero de alguien. Es la única pieza estructural: todo —números, saldos y movimientos— cuelga de ella.',
    layout: 'grid',
    toc: [
      { id: 'la-idea', label: 'La idea, en una frase' },
      { id: 'en-tu-negocio', label: 'Cómo se ve en tu negocio' },
      { id: 'que-tiene', label: 'Qué tiene una cuenta' },
      { id: 'el-saldo', label: 'El saldo, explicado' },
    ],
    body: () => (
      <>
        <h2 id="la-idea">La idea, en una frase</h2>
        <p>
          Tú abres cuentas, y <b>una cuenta puede contener otras cuentas</b>. A cada una le pones uno o más
          números de cuenta (CLABEs) para recibir dinero, y Monato lleva el registro de cuánto tiene cada quien.
        </p>
        <h2 id="en-tu-negocio">Cómo se ve en tu negocio</h2>
        <p>Imagina que das servicio a colegios:</p>
        <ul>
          <li>Tu empresa es el <b>cliente</b>.</li>
          <li>Cada colegio es una <b>cuenta</b> que contiene a las de sus estudiantes (etiqueta <code>grupo</code>).</li>
          <li>Cada estudiante tiene su <b>cuenta</b> (etiqueta <code>wallet</code>).</li>
          <li>A cada cuenta le ligas un <b>número de cuenta</b>: su CLABE.</li>
        </ul>
        <div className="docs-note">
          <p style={{ margin: 0 }}>
            No hay un objeto especial para "colegio": un colegio es solo una cuenta que contiene otras.
            El mismo modelo sirve para un marketplace (vendedores), nómina (empleadores) o usuarios sueltos — sin inventar términos nuevos.
          </p>
        </div>
        <h2 id="que-tiene">Qué tiene una cuenta</h2>
        <table className="docs-table">
          <thead><tr><th>Campo</th><th>Qué es</th></tr></thead>
          <tbody>
            <tr><td><b>Tipo</b> <code>type</code></td><td>El papel de la cuenta: <code>wallet</code> (de un usuario), <code>grupo</code> (contiene otras), <code>tesorería</code> (donde se junta el dinero).</td></tr>
            <tr><td><b>Cuenta padre</b> <code>parent_account_code</code></td><td>De qué cuenta cuelga, si cuelga de alguna. Así se arma el árbol.</td></tr>
            <tr><td><b>Estado</b> <code>state</code></td><td><code>ACTIVE</code>, <code>BLOCKED</code>, <code>CANCELLED</code>.</td></tr>
            <tr><td><b>Saldo</b> <code>balance</code></td><td>En tres bolsas (abajo).</td></tr>
          </tbody>
        </table>
        <h2 id="el-saldo">El saldo, explicado</h2>
        <ul>
          <li><code>posted</code> — confirmado.</li>
          <li><code>in_pending</code> — entrando.</li>
          <li><code>out_pending</code> — comprometido para salida.</li>
        </ul>
        <div className="docs-note">
          <p style={{ margin: 0 }}>
            <b>Disponible</b> = <code>posted</code> − <code>out_pending</code>. Con $1,000 confirmados
            y $200 ordenados de salida, tu disponible es <b>$800</b>.
          </p>
        </div>
      </>
    ),
  },

  numcuenta: {
    id: 'numcuenta',
    crumb: ['Conceptos', 'Número de cuenta'],
    title: 'Número de cuenta',
    intro: 'Un número de cuenta es la CLABE por la que una cuenta recibe dinero.',
    layout: 'solo',
    body: (go) => (
      <>
        <p>
          Una cuenta puede tener <b>varios</b>. Eso te deja, por ejemplo, dar dos CLABEs a la misma cuenta
          para separar de dónde viene el dinero, o desactivar una sin tener que cerrar la cuenta.
        </p>
        <p>
          Cuando alguien deposita a una de tus CLABEs, el dinero entra a la cuenta dueña de ese número,
          y te llega un aviso de <DLink to="transactions" go={go}>Money In</DLink>.
        </p>
      </>
    ),
  },

  txc: {
    id: 'txc',
    crumb: ['Conceptos', 'Transacción'],
    title: 'Transacción',
    intro: 'Una transacción es el registro de un movimiento de dinero.',
    layout: 'solo',
    body: () => (
      <p>
        Se describe por la <b>dirección</b> (entró, salió o fue entre cuentas tuyas) y el <b>riel</b> por
        donde pasó (SPEI o interno). Cada movimiento queda registrado y se puede consultar.
      </p>
    ),
  },

  glosario: {
    id: 'glosario',
    crumb: ['Conceptos', 'Glosario'],
    title: 'Glosario',
    intro: 'Un término por concepto. El nombre que verás en toda la API.',
    layout: 'solo',
    body: () => (
      <table className="docs-table">
        <tbody>
          <tr><td><b>Cliente</b></td><td>La empresa que integra Monato. Eres tú.</td></tr>
          <tr><td><b>Cuenta</b></td><td>Donde se guarda el dinero. Una cuenta puede contener otras cuentas.</td></tr>
          <tr><td><b>Tipo de cuenta</b></td><td><code>wallet</code> (de un usuario), <code>grupo</code> (contiene otras), <code>tesorería</code> (donde se junta el dinero).</td></tr>
          <tr><td><b>Número de cuenta</b></td><td>La CLABE por la que una cuenta recibe. Varios por cuenta.</td></tr>
          <tr><td><b>Saldo</b></td><td>Confirmado, entrando y comprometido. Disponible = confirmado − comprometido.</td></tr>
          <tr><td><b>Transacción</b></td><td>Un movimiento, por dirección y riel.</td></tr>
        </tbody>
      </table>
    ),
  },

  // ── API Reference ──────────────────────────────────────────
  apiref: {
    id: 'apiref',
    crumb: ['API Reference'],
    title: 'API Reference',
    intro: 'Referencia completa de la API de Fincore, organizada por recurso. Cada tarjeta te lleva a su sección con el objeto, los endpoints y ejemplos.',
    layout: 'full',
    body: (go) => {
      const cards: { id: PageId; title: string; desc: string; icon: ReactNode }[] = [
        {
          id: 'authn',
          title: 'Authentication',
          desc: 'Recupera credenciales y emite el token que autentica la API.',
          icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="9" r="3"/><path d="M9 9h7l-1.5 2M13 9v2"/></svg>,
        },
        {
          id: 'catalog',
          title: 'Catalog',
          desc: 'Consulta el catálogo de bancos e instituciones de SPEI.',
          icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l6-4 6 4"/><path d="M4 7v7M14 7v7M9 7v7M3 15h12"/></svg>,
        },
        {
          id: 'accounts',
          title: 'Accounts',
          desc: 'Crea y administra cuentas, y agrupa unas dentro de otras.',
          icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="14" height="9" rx="2"/><path d="M12 9h2"/></svg>,
        },
        {
          id: 'accountnumbers',
          title: 'Account Numbers',
          desc: 'Liga CLABEs a una cuenta para que reciba dinero.',
          icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2v14M11 2v14M2 6h14M2 11h14"/></svg>,
        },
        {
          id: 'transactions',
          title: 'Transactions',
          desc: 'Envía dinero, consulta movimientos y recibe Money In.',
          icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h9l-2-2M15 12H6l2 2"/></svg>,
        },
        {
          id: 'webhooks',
          title: 'Webhooks',
          desc: 'Registra las URLs donde recibes los eventos.',
          icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5"/><path d="M7.5 8l3 5M13 11a2.5 2.5 0 1 1-4 2"/></svg>,
        },
        {
          id: 'reports',
          title: 'Reports',
          desc: 'Genera y descarga reportes y estados de cuenta.',
          icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2h6l3 3v11H5z"/><path d="M7 9h4M7 12h4"/></svg>,
        },
      ];
      return (
        <div className="docs-cards">
          {cards.map((c, i) => (
            <motion.button
              key={c.id}
              className="docs-card"
              onClick={() => go(c.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
            >
              <div className="docs-card__h">
                <span className="docs-card__ic">{c.icon}</span>
                <h3>{c.title}</h3>
                <span className="docs-card__arr">→</span>
              </div>
              <p>{c.desc}</p>
            </motion.button>
          ))}
        </div>
      );
    },
  },

  authn: {
    id: 'authn',
    crumb: ['API Reference', 'Authentication'],
    title: 'Authentication',
    intro: 'Recupera tu secreto y emite el token que autentica el resto de la API.',
    layout: 'grid',
    body: (go) => (
      <>
        <Endpoint method="GET" path="/v1/clients/{clientId}/credentials" />
        <Endpoint method="POST" path="/v1/clients/{clientId}/auth/tokens" />
        <p>El flujo completo está en <DLink to="cred" go={go}>Credenciales y token</DLink>.</p>
      </>
    ),
    sample: {
      method: 'POST',
      path: '/auth/tokens',
      blocks: [
        {
          section: 'Petición',
          code: (
            <>
              <F>curl</F>{' -X POST .../auth/tokens -H '}<S>"x-api-key: $KEY"</S>
            </>
          ),
        },
      ],
    },
  },

  catalog: {
    id: 'catalog',
    crumb: ['API Reference', 'Catalog'],
    title: 'Catalog',
    intro: 'El catálogo de bancos e instituciones con los que operas por SPEI.',
    layout: 'grid',
    body: () => (
      <>
        <Endpoint method="GET" path="/v1/banks" />
        <p>Devuelve cada institución con su nombre, código y estado.</p>
      </>
    ),
    sample: {
      method: 'GET',
      path: '/v1/banks',
      blocks: [
        {
          section: 'Respuesta',
          code: (
            <>
              <P>{'[{ '}</P><K>"name"</K><P>: </P><S>"Finco Pay"</S><P>, </P><K>"code"</K><P>: </P><S>"734"</S><P>{' }]'}</P>
            </>
          ),
        },
      ],
    },
  },

  accounts: {
    id: 'accounts',
    crumb: ['API Reference', 'Accounts'],
    title: 'Accounts',
    intro: (go) => (
      <>Crea y administra cuentas. ¿Qué es una cuenta? → <DLink to="cuenta" go={go}>Conceptos → Cuenta</DLink>.</>
    ),
    layout: 'grid',
    toc: [
      { id: 'objeto-account', label: 'El objeto Account' },
      { id: 'crear-cuenta', label: 'Crear una cuenta' },
    ],
    body: () => (
      <>
        <h2 id="objeto-account">El objeto Account</h2>
        <table className="docs-table">
          <thead><tr><th>Campo</th><th>Qué es</th></tr></thead>
          <tbody>
            <tr><td><code>code</code></td><td>Identificador único (uuid).</td></tr>
            <tr><td><code>type</code></td><td><code>wallet</code>, <code>grupo</code>, <code>tesorería</code>.</td></tr>
            <tr><td><code>parent_account_code</code></td><td>La cuenta padre, o <code>null</code> si no cuelga de ninguna.</td></tr>
            <tr><td><code>state</code></td><td><code>ACTIVE</code>, <code>BLOCKED</code>, <code>CANCELLED</code>.</td></tr>
            <tr><td><code>balance</code></td><td><code>posted</code>, <code>in_pending</code>, <code>out_pending</code>.</td></tr>
          </tbody>
        </table>
        <h2 id="crear-cuenta">Crear una cuenta</h2>
        <Endpoint method="POST" path="/v1/clients/{clientId}/accounts" />
        <p>
          Indica el tipo y, si cuelga de otra cuenta, su <code>parent_account_code</code>.
          ¿Un colegio? <code>type: grupo</code>. ¿Un estudiante? <code>type: wallet</code> con el colegio como padre.
        </p>
      </>
    ),
    sample: {
      method: 'POST',
      path: '/v1/clients/{clientId}/accounts',
      langs: ['cURL', 'Node'],
      activeLang: 'cURL',
      blocks: [
        {
          section: 'Petición',
          lang: 'cURL',
          code: (
            <>
              <F>curl</F>{' -X POST .../accounts \\\n  -H '}<S>"Authorization: Bearer $TOKEN"</S>{' \\\n  -d '}<S>{`'{
    "type": "wallet",
    "currency": "MXN",
    "parent_account_code": "9d84…",
    "reference": "estudiante-123"
  }'`}</S>
            </>
          ),
        },
        {
          section: 'Petición',
          lang: 'Node',
          code: (
            <>
              <K>await</K>{' monato.accounts.'}<F>create</F><P>{'({'}</P>{'\n  '}
              <K>type</K><P>: </P><S>"wallet"</S><P>,</P>{'\n  '}
              <K>currency</K><P>: </P><S>"MXN"</S><P>,</P>{'\n  '}
              <K>parent_account_code</K><P>: </P><S>"9d84…"</S>{'\n'}
              <P>{'})'}</P>
            </>
          ),
        },
        {
          section: 'Respuesta',
          code: (
            <>
              <P>{'{ '}</P><K>"code"</K><P>: </P><S>"16811ee8-…"</S><P>, </P><K>"type"</K><P>: </P><S>"wallet"</S><P>, </P><K>"state"</K><P>: </P><S>"ACTIVE"</S><P>{' }'}</P>
            </>
          ),
        },
      ],
    },
  },

  accountnumbers: {
    id: 'accountnumbers',
    crumb: ['API Reference', 'Account Numbers'],
    title: 'Account Numbers',
    intro: 'Liga y consulta los números de cuenta (CLABEs) de una cuenta. Una cuenta puede tener varios.',
    layout: 'grid',
    body: () => (
      <>
        <Endpoint method="POST" path="/v1/clients/{clientId}/account-numbers" />
        <Endpoint method="GET" path="/v1/clients/{clientId}/account-numbers" />
        <p>
          Al crear uno, lo asocias a una cuenta por su <code>account_code</code>. Monato te devuelve la CLABE generada
          (prefijo <code>734</code>).
        </p>
      </>
    ),
    sample: {
      method: 'POST',
      path: '/account-numbers',
      blocks: [
        {
          section: 'Petición',
          code: (
            <>
              <P>{'{ '}</P><K>"account_code"</K><P>: </P><S>"16811ee8-…"</S><P>{' }'}</P>
            </>
          ),
        },
        {
          section: 'Respuesta',
          code: (
            <>
              <P>{'{ '}</P><K>"number"</K><P>: </P><S>"734180…"</S><P>, </P><K>"status"</K><P>: </P><S>"ACTIVE"</S><P>{' }'}</P>
            </>
          ),
        },
      ],
    },
  },

  transactions: {
    id: 'transactions',
    crumb: ['API Reference', 'Transactions'],
    title: 'Transactions',
    intro: 'Mueve dinero y consulta movimientos. Recibir dinero no es una llamada: te llega por webhook.',
    layout: 'grid',
    toc: [
      { id: 'enviar-consultar', label: 'Enviar y consultar' },
      { id: 'recibir-money-in', label: 'Recibir dinero (Money In)' },
    ],
    body: () => (
      <>
        <h2 id="enviar-consultar">Enviar y consultar</h2>
        <Endpoint method="POST" path="/v1/clients/{clientId}/transactions/money-out" />
        <p>Saca dinero. Si el destino es Monato, se mueve por dentro; si no, sale por SPEI. Monato enruta solo.</p>
        <Endpoint method="GET" path="/v1/clients/{clientId}/transactions" />
        <h2 id="recibir-money-in">Recibir dinero (Money In)</h2>
        <p>
          Cuando entra dinero a una de tus CLABEs, llega un webhook <code>MONEY_IN</code>. Para SPEI, respondes
          {' '}<code>201</code> para aceptar o <code>422</code> para devolver.
        </p>
      </>
    ),
    sample: {
      method: 'evt',
      path: 'Webhook MONEY_IN',
      blocks: [
        {
          section: 'Cuerpo',
          code: (
            <>
              <P>{'{'}</P>{'\n  '}
              <K>"msg_name"</K><P>: </P><S>"MONEY_IN"</S><P>,</P>{'\n  '}
              <K>"body"</K><P>: </P><P>{'{'}</P>{'\n    '}
              <K>"beneficiary_account"</K><P>: </P><S>"734180…"</S><P>,</P>{'\n    '}
              <K>"amount"</K><P>: </P><S>"123.00"</S>{'\n  '}
              <P>{'}'}</P>{'\n'}
              <P>{'}'}</P>
            </>
          ),
        },
      ],
    },
  },

  webhooks: {
    id: 'webhooks',
    crumb: ['API Reference', 'Webhooks'],
    title: 'Webhooks',
    intro: 'Registra y administra las URLs donde recibes los eventos.',
    layout: 'grid',
    body: (go) => (
      <>
        <Endpoint method="POST" path="/v1/clients/{clientId}/webhooks" />
        <Endpoint method="GET" path="/v1/clients/{clientId}/webhooks" />
        <Endpoint method="DEL" path="/v1/clients/{clientId}/webhooks/{id}" />
        <p>Qué eventos existen se explica en <DLink to="evt" go={go}>Eventos y webhooks</DLink>.</p>
      </>
    ),
    sample: {
      method: 'POST',
      path: '/webhooks',
      blocks: [
        {
          section: 'Petición',
          code: (
            <>
              <P>{'{ '}</P><K>"url"</K><P>: </P><S>"https://tuapp.com/hook"</S><P>, </P><K>"webhook_type"</K><P>: </P><S>"MONEY_IN"</S><P>{' }'}</P>
            </>
          ),
        },
      ],
    },
  },

  reports: {
    id: 'reports',
    crumb: ['API Reference', 'Reports'],
    title: 'Reports',
    intro: 'Genera y descarga reportes de movimientos y estados de cuenta por fecha.',
    layout: 'grid',
    body: () => (
      <>
        <Endpoint method="POST" path="/v1/reports/clients/{clientId}/download" />
        <p>Eliges el tipo (diario o mensual) y Monato te devuelve un enlace de descarga.</p>
      </>
    ),
    sample: {
      method: 'POST',
      path: '/report/download',
      blocks: [
        {
          section: 'Respuesta',
          code: (
            <>
              <P>{'{ '}</P><K>"url"</K><P>: </P><S>"https://…/reporte.csv"</S><P>{' }'}</P>
            </>
          ),
        },
      ],
    },
  },

  // ── Sandbox ────────────────────────────────────────────────
  sim: {
    id: 'sim',
    crumb: ['Sandbox', 'Simulaciones'],
    title: 'Simulaciones',
    intro: 'En Sandbox disparas tú los eventos que en producción vienen del mundo real.',
    layout: 'solo',
    body: () => (
      <>
        <ul>
          <li>Simular una entrada de dinero (<code>MONEY_IN</code>) por SPEI.</li>
          <li>Emitir un comprobante (<code>CEP</code>) de prueba.</li>
          <li>Liquidar o devolver una transacción.</li>
        </ul>
        <p>Así pruebas tu integración de punta a punta antes de producción.</p>
      </>
    ),
  },
};
