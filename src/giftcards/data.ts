// Giftcards — Data (catálogo Finch + simulación BHN)
// denomType: 'fixed' → chips · 'variable' → input min/max · 'open' → chips + monto libre

export type DenomType = 'fixed' | 'variable' | 'open';
export type CategoryId = 'all' | 'gaming' | 'streaming' | 'tiendas' | 'exp';

export interface Brand {
  id: string;
  name: string;
  cat: Exclude<CategoryId, 'all'>;
  domain: string;
  color: string;
  abbr: string;
  denomType: DenomType;
  amounts?: number[];
  min?: number;
  max?: number;
  tagline?: string;   // texto del banner generado
  bannerSrc?: string; // banner real opcional — colócalo en assets/banners/ e impórtalo aquí
}

export const BRANDS: Brand[] = [
  // ── Gaming ──
  { id: 'xbox',        name: 'Xbox',           cat: 'gaming',    domain: 'xbox.com',         color: '#107C10', abbr: 'XB',  denomType: 'fixed',    amounts: [200, 500, 1000, 2000], tagline: 'Miles de juegos a un código de distancia' },
  { id: 'xboxgp',      name: 'Xbox Game Pass', cat: 'gaming',    domain: 'xbox.com',         color: '#107C10', abbr: 'XGP', denomType: 'fixed',    amounts: [299, 599, 1199], tagline: 'Cientos de juegos, una sola suscripción' },
  { id: 'playstation', name: 'PlayStation',    cat: 'gaming',    domain: 'playstation.com',  color: '#003791', abbr: 'PS',  denomType: 'fixed',    amounts: [200, 500, 1000, 2000], tagline: 'El universo PlayStation, a tu alcance' },
  { id: 'nintendo',    name: 'Nintendo',       cat: 'gaming',    domain: 'nintendo.com',     color: '#E4000F', abbr: 'NT',  denomType: 'fixed',    amounts: [50, 100, 200, 500], tagline: 'Diversión para toda la familia' },
  { id: 'roblox',      name: 'Roblox',         cat: 'gaming',    domain: 'roblox.com',       color: '#E8391D', abbr: 'RB',  denomType: 'fixed',    amounts: [50, 100, 200, 500], tagline: 'Robux y experiencias sin límite' },
  { id: 'blizzard',    name: 'Blizzard',       cat: 'gaming',    domain: 'blizzard.com',     color: '#00AEFF', abbr: 'BZ',  denomType: 'fixed',    amounts: [200, 500, 1000], tagline: 'Tus mundos favoritos te esperan' },
  { id: 'razer',       name: 'Razer Gold',     cat: 'gaming',    domain: 'razer.com',        color: '#44D62C', abbr: 'RG',  denomType: 'fixed',    amounts: [50, 100, 200, 500], tagline: 'Saldo gamer para lo que sigue' },
  // ── Streaming ──
  { id: 'netflix',     name: 'Netflix',        cat: 'streaming', domain: 'netflix.com',      color: '#E50914', abbr: 'NF',  denomType: 'fixed',    amounts: [99, 199, 399], tagline: 'Series y películas sin interrupciones' },
  { id: 'spotify',     name: 'Spotify',        cat: 'streaming', domain: 'spotify.com',      color: '#1DB954', abbr: 'SP',  denomType: 'fixed',    amounts: [99, 199, 399], tagline: 'Tu música, sin anuncios' },
  { id: 'prime',       name: 'Amazon Prime',   cat: 'streaming', domain: 'primevideo.com',   color: '#00A8E1', abbr: 'PR',  denomType: 'fixed',    amounts: [99, 199, 599], tagline: 'Entretenimiento y envíos en uno' },
  // ── Tiendas ──
  { id: 'amazon',      name: 'Amazon',         cat: 'tiendas',   domain: 'amazon.com',       color: '#FF9900', abbr: 'AM',  denomType: 'open',     amounts: [50, 100, 200, 500], min: 50,  max: 5000, tagline: 'Todo lo que buscas, en un solo lugar' },
  { id: 'google',      name: 'Google Play',    cat: 'tiendas',   domain: 'play.google.com',  color: '#DB4437', abbr: 'GP',  denomType: 'open',     amounts: [50, 100, 200, 500], min: 20,  max: 3000, tagline: 'Apps, juegos y más en Google Play' },
  { id: 'itunes',      name: 'iTunes / Apple', cat: 'tiendas',   domain: 'apple.com',        color: '#FC3C44', abbr: 'IT',  denomType: 'open',     amounts: [50, 100, 200, 500], min: 50,  max: 5000, tagline: 'Música, apps y servicios Apple' },
  { id: 'liverpool',   name: 'Liverpool',      cat: 'tiendas',   domain: 'liverpool.com.mx', color: '#E91E8C', abbr: 'LV',  denomType: 'variable', min: 100, max: 10000, tagline: 'Es parte de tu vida' },
  { id: 'soriana',     name: 'Soriana',        cat: 'tiendas',   domain: 'soriana.com',      color: '#ED1C24', abbr: 'SO',  denomType: 'variable', min: 50,  max: 5000, tagline: 'Todo para tu despensa y hogar' },
  { id: 'gandhi',      name: 'Gandhi',         cat: 'tiendas',   domain: 'gandhi.com.mx',    color: '#8B0000', abbr: 'GH',  denomType: 'variable', min: 100, max: 5000, tagline: 'Leer es vivir más' },
  { id: 'innovasport', name: 'Innovasport',    cat: 'tiendas',   domain: 'innovasport.com',  color: '#FF6B00', abbr: 'IS',  denomType: 'variable', min: 200, max: 5000, tagline: 'Equípate para rendir al máximo' },
  // ── Experiencias ──
  { id: 'starbucks',   name: 'Starbucks',      cat: 'exp',       domain: 'starbucks.com',    color: '#00704A', abbr: 'SB',  denomType: 'variable', min: 50,  max: 2000, tagline: 'Tu café favorito, listo para regalar' },
  { id: 'cinepolis',   name: 'Cinépolis',      cat: 'exp',       domain: 'cinepolis.com',    color: '#E31837', abbr: 'CI',  denomType: 'variable', min: 50,  max: 2000, tagline: 'La magia del cine en sus manos' },
  { id: 'airbnb',      name: 'Airbnb',         cat: 'exp',       domain: 'airbnb.com',       color: '#FF5A5F', abbr: 'AB',  denomType: 'variable', min: 500, max: 10000, tagline: 'Estancias y experiencias únicas' },
  { id: 'enviaflores', name: 'enviaflores',    cat: 'exp',       domain: 'enviaflores.com',  color: '#E91E8C', abbr: 'EF',  denomType: 'variable', min: 200, max: 5000, tagline: 'Sorprende con flores y regalos' },
];

export const CATS: { id: CategoryId; label: string }[] = [
  { id: 'all',       label: 'Todos' },
  { id: 'gaming',    label: 'Gaming' },
  { id: 'streaming', label: 'Streaming' },
  { id: 'tiendas',   label: 'Tiendas' },
  { id: 'exp',       label: 'Experiencias' },
];

// ─── Pasos de canje por marca ────────────────────────────────
export const REDEEM_STEPS: Record<string, string[]> = {
  google:      ['Abre Google Play en tu dispositivo Android o en play.google.com', 'Toca el ícono de perfil → Pagos y suscripciones', 'Selecciona Canjear código', 'Ingresa el código y toca Canjear. El saldo se refleja de inmediato.'],
  itunes:      ['Abre la App Store en tu iPhone o iPad', 'Toca tu foto de perfil en la esquina superior derecha', 'Selecciona Canjear código o tarjeta regalo', 'Ingresa el código manualmente o escanéalo con la cámara'],
  netflix:     ['Ve a netflix.com/redeem desde cualquier navegador', 'Inicia sesión o crea una cuenta nueva', 'Ingresa el código de la Gift Card y confirma', 'El saldo se aplica automáticamente a tu próxima factura'],
  spotify:     ['Ve a spotify.com/redeem', 'Inicia sesión en tu cuenta de Spotify', 'Ingresa el código y haz clic en Canjear', 'Tu suscripción o crédito se activa de inmediato'],
  prime:       ['Ve a amazon.com.mx/redeem', 'Inicia sesión con tu cuenta de Amazon', 'Ingresa el código y selecciona Aplicar al saldo', 'Usa el saldo en cualquier compra de Amazon o Prime Video'],
  amazon:      ['Ve a amazon.com.mx → Mi cuenta', 'Selecciona Tarjetas regalo → Canjear tarjeta regalo', 'Ingresa el código y haz clic en Aplicar al saldo', 'El crédito se aplica automáticamente en tu próxima compra'],
  xbox:        ['Ve a microsoft.com/redeem o abre la app de Xbox', 'Inicia sesión con tu cuenta Microsoft', 'Ingresa el código de 25 caracteres y confirma', 'El saldo se añade a tu cuenta de Microsoft Store'],
  xboxgp:      ['Ve a microsoft.com/redeem o abre la app de Xbox', 'Inicia sesión con tu cuenta Microsoft', 'Ingresa el código de 25 caracteres y confirma', 'Tu suscripción a Game Pass se activa o extiende automáticamente'],
  playstation: ['En tu PS4 o PS5 abre PlayStation Store', 'Baja hasta el final del menú y selecciona Canjear códigos', 'Ingresa el código de 12 caracteres', 'El saldo o contenido se aplica de inmediato a tu cuenta PSN'],
  nintendo:    ['Abre Nintendo eShop en tu consola Nintendo Switch', 'Selecciona tu usuario y luego Ingresar código', 'Escribe el código de 16 caracteres', 'El saldo Nintendo eShop se añade al instante'],
  roblox:      ['Ve a roblox.com/giftcard', 'Inicia sesión en tu cuenta de Roblox', 'Ingresa el código PIN de la tarjeta', 'Los créditos se añaden a tu cuenta y puedes usarlos en Robux o Premium'],
  blizzard:    ['Ve a battle.net/redeem', 'Inicia sesión con tu cuenta Battle.net', 'Ingresa el código y selecciona el juego o servicio correspondiente', 'El saldo o contenido se aplica de inmediato'],
  razer:       ['Ve a gold.razer.com o abre la app Razer Gold', 'Inicia sesión en tu cuenta', 'Selecciona Canjear tarjeta regalo e ingresa el código', 'El saldo Razer Gold se añade y puedes usarlo en juegos compatibles'],
  liverpool:   ['Ve a liverpool.com.mx o visita cualquier tienda Liverpool', 'Elige tus productos y ve al proceso de pago', 'Selecciona Tarjeta de regalo como método de pago', 'Ingresa el número de tarjeta y el PIN para aplicar el saldo'],
  soriana:     ['Visita cualquier tienda Soriana en México', 'Selecciona tus productos y pasa a caja', 'Indica al cajero que deseas pagar con Gift Card', 'El saldo se descuenta de tu compra automáticamente'],
  gandhi:      ['Ve a gandhi.com.mx o visita una librería Gandhi', 'Elige tus libros o productos', 'Al pagar, selecciona Tarjeta de regalo e ingresa el código', 'El saldo cubre hasta el valor disponible en la tarjeta'],
  innovasport: ['Visita cualquier tienda Innovasport o ve a innovasport.com', 'Selecciona tus productos deportivos', 'Al pagar, presenta o ingresa el código de Gift Card', 'El saldo se aplica al total de tu compra'],
  starbucks:   ['Descarga la app Starbucks o abre la que ya tienes', 'Ve a Pagar → Añadir tarjeta regalo', 'Ingresa el número de tarjeta y el PIN para agregar el saldo', 'Escanea tu app en tienda o paga en línea con el saldo cargado'],
  cinepolis:   ['Ve a cinepolis.com o la app de Cinépolis', 'Selecciona tu película, sede, horario y asientos', 'En el proceso de pago elige Tarjeta de regalo', 'Ingresa el código para aplicar el saldo a tu compra'],
  airbnb:      ['Ve a airbnb.mx e inicia sesión', 'Elige el alojamiento o experiencia que deseas reservar', 'En el resumen de pago busca Aplicar crédito de tarjeta regalo', 'Ingresa el código — el saldo se aplica automáticamente a tu reserva'],
  enviaflores: ['Ve a enviaflores.com', 'Elige tu arreglo floral o regalo y llena los datos de envío', 'En el checkout selecciona Tarjeta de regalo como forma de pago', 'Ingresa el código y confirma tu pedido'],
  _default:    ['Localiza el portal o app oficial de la marca', 'Inicia sesión o crea tu cuenta', 'Busca la opción Canjear tarjeta regalo o Código de canje', 'Ingresa el código recibido. El saldo se aplica de inmediato'],
};

// ─── T&C BHN (del mockup Finch) ──────────────────────────────
export const BHN_TERMS: { title: string; body: string }[] = [
  { title: '1. Uso y validez.',    body: 'La Gift Card es válida únicamente para compras dentro de la plataforma de la marca seleccionada. No es intercambiable por dinero en efectivo ni transferible a terceros.' },
  { title: '2. Activación.',       body: 'El código de la Gift Card se activa automáticamente al completar la compra. Recibirás el enlace de canje (eGift URL) proporcionado por Blackhawk Network (BHN) una vez confirmado el pago.' },
  { title: '3. No reembolsable.',  body: 'Una vez procesada, la compra no puede ser cancelada ni reembolsada. En caso de error técnico atribuible a Monato, aplica el proceso de reversión de la operación.' },
  { title: '4. Comisiones.',       body: 'El monto cobrado incluye el valor nominal de la Gift Card más la comisión de servicio aplicable, que se mostrará en el resumen antes de confirmar.' },
  { title: '5. Caducidad.',        body: 'La vigencia de la Gift Card está determinada por la política de la marca emisora. Monato no se responsabiliza por saldos no utilizados después de la fecha de vencimiento.' },
  { title: '6. Fraude.',           body: 'Cualquier uso fraudulento del código de la Gift Card será responsabilidad del usuario final. Monato colaborará con BHN en investigaciones de fraude conforme a la normativa aplicable.' },
];

// Comisión de servicio (demo) — los T&C BHN exigen mostrarla en el resumen
export const SERVICE_FEE_MXN = 10;

export const ANTIFRAUD_NOTICE =
  'Monato y sus proveedores nunca te pedirán que compres Gift Cards para pagar deudas, impuestos o multas. Si alguien te solicitó esta compra por teléfono, mensaje o correo, detén la operación y repórtalo. Las Gift Cards no son reembolsables una vez procesadas.';

// ─── Simulación del POST (escenarios de la tabla de errores) ─
export type SimScenario = '200' | '400' | '409' | '503' | 'timeout';

export interface RedeemResult {
  transaction_id: string;
  redemption_code: string;
  pin: string;
  egift_url: string;
  date: Date;
  amount: number; // pesos
}

export interface RedeemFailure {
  code: string;
  title: string;
  detail: string;
  action: string;
}

const FAILURES: Record<Exclude<SimScenario, '200'>, RedeemFailure> = {
  '400':   { code: 'BHN-ERR-400', title: 'Monto no válido',        detail: 'El monto no coincide con las denominaciones disponibles o está fuera del rango permitido para esta marca.', action: 'Regresa al paso de monto y verifica el valor.' },
  '409':   { code: 'BHN-ERR-409', title: 'Transacción duplicada',  detail: 'Este ID de transacción ya fue procesado anteriormente.', action: 'Si tu compra anterior fue exitosa, no reintentes. Inicia una nueva compra.' },
  '503':   { code: 'BHN-ERR-503', title: 'Servicio no disponible', detail: 'El servicio de Gift Cards no está disponible en este momento.', action: 'No se realizó ningún cargo. Intenta de nuevo en unos minutos.' },
  timeout: { code: 'BHN-TIMEOUT', title: 'Sin respuesta',          detail: 'No recibimos confirmación de la transacción. No la reintentes con el mismo identificador.', action: 'Verifica con soporte el estado de esta transacción antes de comprar de nuevo.' },
};

function block(len = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function simulateRedeem(brand: Brand, amountPesos: number, scenario: SimScenario): Promise<RedeemResult> {
  const delay = scenario === 'timeout' ? 2600 : 1500;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (scenario !== '200') { reject(FAILURES[scenario]); return; }
      resolve({
        transaction_id: `BHN-2026-${block(2)}${Math.floor(Math.random() * 90 + 10)}${block(2)}`,
        redemption_code: `${brand.abbr}${block(2)}-${block()}-${block()}-${block()}`,
        pin: String(1000 + Math.floor(Math.random() * 9000)),
        egift_url: `https://egift.bhn.com/${brand.id}/${block(8).toLowerCase()}`,
        date: new Date(),
        amount: amountPesos,
      });
    }, delay);
  });
}

export const formatMXN = (pesos: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: pesos % 1 === 0 ? 0 : 2 }).format(pesos);
