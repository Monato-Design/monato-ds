// Mock del GET /v1/payees?category=Giftcard
// Esquema basado en docs-giftcards.html — campos "a confirmar" marcados.
// Para usar logos reales: coloca el PNG en src/giftcards/assets/,
// agrega `import AmazonLogo from './assets/amazon.png'` y asigna
// logoSrc: AmazonLogo en la marca correspondiente.

export type AmountFixed = {
  type: 'FIXED';
  denominations: string[]; // pesos, ej. "100.0"
  min: null;
  max: null;
  currency: 'MXN';
};

export type AmountRange = {
  type: 'RANGE';
  denominations: [];
  min: string; // pesos
  max: string; // pesos
  currency: 'MXN';
};

export interface GiftcardPayee {
  payee_id: string;
  name: string;
  category: 'Giftcard';
  type: 'EGift';
  description: string;
  currency: 'MXN';
  amount: AmountFixed | AmountRange;
  terms_and_conditions: string;
  redemption_info: string; // a confirmar disponibilidad
  // Presentación (no viene del API):
  brandColor: string; // fondo del tile
  brandText: string; // color del wordmark
  logoSrc?: string; // PNG real opcional — ver nota arriba
}

export const CATALOG: GiftcardPayee[] = [
  {
    payee_id: '7e78a95b-f05e-4f32-9a01-aaaa00000001',
    name: 'Amazon',
    category: 'Giftcard',
    type: 'EGift',
    description: 'Úsala en amazon.com.mx en millones de productos.',
    currency: 'MXN',
    amount: {
      type: 'FIXED',
      denominations: ['100.0', '200.0', '500.0', '1000.0'],
      min: null,
      max: null,
      currency: 'MXN',
    },
    terms_and_conditions:
      'El saldo no expira. Válida únicamente en amazon.com.mx. No es reembolsable ni canjeable por efectivo. Amazon no se hace responsable por códigos perdidos o robados después de la entrega.',
    redemption_info:
      'Ingresa el código en Cuenta → Tarjetas de regalo → Canjear.',
    brandColor: '#131A22',
    brandText: '#FF9900',
  },
  {
    payee_id: '7e78a95b-f05e-4f32-9a01-aaaa00000002',
    name: 'Liverpool',
    category: 'Giftcard',
    type: 'EGift',
    description: 'Monedero electrónico válido en tiendas y liverpool.com.mx.',
    currency: 'MXN',
    amount: {
      type: 'RANGE',
      denominations: [],
      min: '50.0',
      max: '5000.0',
      currency: 'MXN',
    },
    terms_and_conditions:
      'Vigencia de 24 meses a partir de la compra. Aplica en compras en tienda física y en línea. No canjeable por efectivo. Consulta restricciones en departamentos participantes.',
    redemption_info:
      'Presenta el código en caja o ingrésalo al pagar en línea.',
    brandColor: '#E10098',
    brandText: '#FFFFFF',
  },
  {
    payee_id: '7e78a95b-f05e-4f32-9a01-aaaa00000003',
    name: 'Netflix',
    category: 'Giftcard',
    type: 'EGift',
    description: 'Abona saldo a tu cuenta de Netflix sin tarjeta bancaria.',
    currency: 'MXN',
    amount: {
      type: 'FIXED',
      denominations: ['150.0', '300.0', '600.0'],
      min: null,
      max: null,
      currency: 'MXN',
    },
    terms_and_conditions:
      'El saldo se aplica como crédito a la membresía. No es transferible ni reembolsable. Requiere cuenta de Netflix México.',
    redemption_info: 'Canjea en netflix.com/redeem.',
    brandColor: '#141414',
    brandText: '#E50914',
  },
  {
    payee_id: '7e78a95b-f05e-4f32-9a01-aaaa00000004',
    name: 'Spotify',
    category: 'Giftcard',
    type: 'EGift',
    description: 'Meses de Spotify Premium para ti o para regalar.',
    currency: 'MXN',
    amount: {
      type: 'RANGE',
      denominations: [],
      min: '115.0',
      max: '1380.0',
      currency: 'MXN',
    },
    terms_and_conditions:
      'Aplica únicamente a Spotify Premium Individual. No acumulable con planes familiares o de estudiante. El saldo no es reembolsable.',
    redemption_info: 'Canjea en spotify.com/mx/redeem.',
    brandColor: '#191414',
    brandText: '#1DB954',
  },
];

// ─── Simulación del POST /v1/giftcards/redeem ────────────────
// La doc marca el endpoint como "a confirmar"; aquí simulamos los
// escenarios de la tabla de errores para la demo.

export type SimScenario = '200' | '400' | '409' | '503' | 'timeout';

export interface RedeemResponse {
  redemption_code: string;
  pin: string | null;
  check_balance_url: string;
  expiry_date: string | null;
  amount: number; // centavos
  transaction_id: string;
}

export interface RedeemError {
  http: number | 'timeout';
  title: string;
  detail: string;
  action: string;
}

const ERRORS: Record<Exclude<SimScenario, '200'>, RedeemError> = {
  '400': {
    http: 400,
    title: 'Monto no válido',
    detail:
      'El monto enviado no coincide con las denominaciones disponibles o está fuera del rango permitido.',
    action: 'Verifica el monto e inténtalo de nuevo.',
  },
  '409': {
    http: 409,
    title: 'Transacción duplicada',
    detail: 'Este transaction_id ya fue procesado anteriormente.',
    action:
      'Si tu compra anterior fue exitosa, revisa tu recibo. Si no, inicia una nueva compra.',
  },
  '503': {
    http: 503,
    title: 'Servicio no disponible',
    detail: 'El servicio de giftcards no está disponible en este momento.',
    action: 'Espera unos minutos antes de volver a intentar.',
  },
  timeout: {
    http: 'timeout',
    title: 'Sin respuesta del servidor',
    detail:
      'No recibimos confirmación de la transacción. No la reintentes con el mismo identificador.',
    action:
      'Verifica con soporte el estado de esta transacción antes de comprar de nuevo.',
  },
};

const CODE_PREFIX: Record<string, string> = {
  Amazon: 'AMZN',
  Liverpool: 'LVPL',
  Netflix: 'NFLX',
  Spotify: 'SPTF',
};

function randomBlock(len = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length: len },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function simulateRedeem(
  payee: GiftcardPayee,
  amountCents: number,
  transactionId: string,
  scenario: SimScenario,
): Promise<RedeemResponse> {
  const delay = scenario === 'timeout' ? 2600 : 1400;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (scenario !== '200') {
        reject(ERRORS[scenario]);
        return;
      }
      resolve({
        redemption_code: `${CODE_PREFIX[payee.name] ?? 'GIFT'}-${randomBlock()}-${randomBlock()}-${randomBlock()}`,
        pin: payee.name === 'Amazon' ? null : String(1000 + Math.floor(Math.random() * 9000)),
        check_balance_url: `https://saldo.monato.com/gc/${payee.payee_id.slice(0, 8)}`,
        expiry_date: payee.name === 'Liverpool' ? '2028-06-11' : null,
        amount: amountCents,
        transaction_id: transactionId,
      });
    }, delay);
  });
}

export const formatMXN = (pesos: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: pesos % 1 === 0 ? 0 : 2,
  }).format(pesos);
