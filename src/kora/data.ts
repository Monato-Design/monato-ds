import type {
  Conversacion,
  EmpresaSpei,
  JiraTicket,
  MovimientoSpei,
  RangoClabe,
} from './types';

export const CONVERSACIONES: Conversacion[] = [
  {
    id: 'c1',
    cliente: 'Empresa ABC',
    asunto: 'Error al autenticar API Key en producción',
    responsable: 'Mildred M.',
    ultimaActividad: 'Hace 2 horas',
    estado: 'Abierto',
  },
  {
    id: 'c2',
    cliente: 'Fintech XYZ',
    asunto: 'Solicitud de nuevo rango de CLABEs',
    responsable: 'Carlos R.',
    ultimaActividad: 'Ayer, 14:30',
    estado: 'Pendiente',
  },
  {
    id: 'c3',
    cliente: 'StartupPay',
    asunto: 'Dudas sobre proceso de onboarding',
    responsable: 'Ana L.',
    ultimaActividad: '5 jul 2026',
    estado: 'Abierto',
  },
  {
    id: 'c4',
    cliente: 'Corporativo MNO',
    asunto: 'Confirmación de revocación de credencial',
    responsable: 'Mildred M.',
    ultimaActividad: '2 jul 2026',
    estado: 'Cerrado',
  },
];

export const JIRA_TICKETS: JiraTicket[] = [
  {
    id: 'MON-4821',
    titulo: 'Error 401 en endpoint /pagos',
    cliente: 'Empresa ABC',
    prioridad: 'Alta',
    estado: 'En revisión',
  },
  {
    id: 'MON-4805',
    titulo: 'Timeout en webhook de confirmación',
    cliente: 'Fintech XYZ',
    prioridad: 'Media',
    estado: 'En progreso',
  },
  {
    id: 'MON-4791',
    titulo: 'Documentación desactualizada de sandbox',
    cliente: 'StartupPay',
    prioridad: 'Baja',
    estado: 'Abierto',
  },
];

export const JIRA_STATS = { abiertos: 7, enProgreso: 4, resueltosMes: 23 };

export const EMPRESAS_SPEI: EmpresaSpei[] = [
  { id: 'abc', nombre: 'Empresa ABC', rfc: 'ABC010101XY9', limitePorTx: 500000, limiteDiario: 5000000 },
  { id: 'xyz', nombre: 'Fintech XYZ', rfc: 'FXY930812HJ4', limitePorTx: 200000, limiteDiario: 2000000 },
  { id: 'startuppay', nombre: 'StartupPay', rfc: 'SPY200315AA1', limitePorTx: 100000, limiteDiario: 1000000 },
];

export const RANGOS_CLABE: Record<string, RangoClabe[]> = {
  abc: [
    { inicio: '734180110400000001', fin: '734180110400001000', cantidad: 1000, creado: '10 may 2026', estado: 'Activo' },
    { inicio: '734180110400002001', fin: '734180110400002500', cantidad: 500, creado: '22 abr 2026', estado: 'Activo' },
  ],
  xyz: [
    { inicio: '734104332181960001', fin: '734104332181960500', cantidad: 500, creado: '3 jun 2026', estado: 'Activo' },
  ],
  startuppay: [
    { inicio: '734389083863790001', fin: '734389083863790200', cantidad: 200, creado: '15 jun 2026', estado: 'Activo' },
  ],
};

export const MOVIMIENTOS_SPEI: MovimientoSpei[] = [
  { fecha: '21/07/2026 09:14:22', claveRastreo: '260721010717968710', monto: 148652.30, bancoOrigen: 'BBVA', bancoDestino: 'FINCO PAY', clabeOrigen: '734180110400012345', instrumentoDestino: '734104332181960013', tipo: 'Recibida', estatus: 'Liquidada' },
  { fecha: '21/07/2026 10:02:05', claveRastreo: 'CPO168996184063', monto: 30.00, bancoOrigen: 'FINCO PAY', bancoDestino: 'Santander', clabeOrigen: '734389083863794026', instrumentoDestino: '734542351161559407', tipo: 'Enviada', estatus: 'Liquidada' },
  { fecha: '21/07/2026 11:47:51', claveRastreo: '2026072140014TRAPP01', monto: 12500.00, bancoOrigen: 'Banorte', bancoDestino: 'FINCO PAY', clabeOrigen: '734816184959310341', instrumentoDestino: '734316475255341928', tipo: 'Recibida', estatus: 'Pendiente' },
  { fecha: '20/07/2026 16:33:10', claveRastreo: '38432P0320260721556123', monto: 4200.75, bancoOrigen: 'FINCO PAY', bancoDestino: 'AZTECA', clabeOrigen: '734327648350305641', instrumentoDestino: '734395376724238849', tipo: 'Enviada', estatus: 'Rechazada' },
  { fecha: '20/07/2026 08:05:44', claveRastreo: '93217104P0202607215590', monto: 98000.00, bancoOrigen: 'Mercado Pago', bancoDestino: 'FINCO PAY', clabeOrigen: '734696532871012269', instrumentoDestino: '734166978480184514', tipo: 'Recibida', estatus: 'Liquidada' },
  { fecha: '19/07/2026 19:20:02', claveRastreo: '260719088812340091', monto: 760.50, bancoOrigen: 'FINCO PAY', bancoDestino: 'BBVA', clabeOrigen: '734627048281489325', instrumentoDestino: '734041641068855022', tipo: 'Enviada', estatus: 'Liquidada' },
];

export const AGENTE_ACTUAL = { nombre: 'Mildred M.', rol: 'via JumpCloud', iniciales: 'MM' };
export const FECHA_HOY_LABEL = 'Lun 20 Jul 2026';
