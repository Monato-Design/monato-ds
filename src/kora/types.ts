export type KoraModule =
  | 'home'
  | 'atencion'
  | 'productos'
  | 'onboarding'
  | 'compliance'
  | 'notificaciones'
  | 'auditlog';

export type BadgeColor =
  | 'gray'
  | 'primary'
  | 'error'
  | 'warning'
  | 'success'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'violet'
  | 'purple'
  | 'pink'
  | 'rose'
  | 'orange';

export interface Conversacion {
  id: string;
  cliente: string;
  asunto: string;
  responsable: string;
  ultimaActividad: string;
  estado: 'Abierto' | 'Pendiente' | 'Cerrado';
}

export interface JiraTicket {
  id: string;
  titulo: string;
  cliente: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Abierto' | 'En revisión' | 'En progreso' | 'Resuelto' | 'Cerrado';
}

export interface EmpresaSpei {
  id: string;
  nombre: string;
  rfc: string;
  limitePorTx: number;
  limiteDiario: number;
}

export interface RangoClabe {
  inicio: string;
  fin: string;
  cantidad: number;
  creado: string;
  estado: 'Activo' | 'Agotado';
}

export interface MovimientoSpei {
  fecha: string;
  claveRastreo: string;
  monto: number;
  bancoOrigen: string;
  bancoDestino: string;
  clabeOrigen: string;
  instrumentoDestino: string;
  tipo: 'Recibida' | 'Enviada';
  estatus: 'Liquidada' | 'Pendiente' | 'Rechazada';
}
