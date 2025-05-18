
export enum OSStatus {
  NA_FILA = "Na Fila",
  AGUARDANDO_CLIENTE = "Aguardando Cliente",
  EM_PRODUCAO = "Em Produção",
  AGUARDANDO_PARCEIRO = "Aguardando Parceiro",
  FINALIZADO = "Finalizado",
}

export const ALL_OS_STATUSES: OSStatus[] = [
  OSStatus.NA_FILA,
  OSStatus.AGUARDANDO_CLIENTE,
  OSStatus.EM_PRODUCAO,
  OSStatus.AGUARDANDO_PARCEIRO,
  OSStatus.FINALIZADO,
];

export interface OS {
  id: string; // Will be the DB auto-incremented ID (as string)
  numero: string; // 6-digit sequential number
  cliente: string; // Name of the client
  parceiro?: string; // Name of the partner
  clientId: string; // Foreign key to clients table
  partnerId?: string; // Foreign key to partners table (nullable)
  projeto: string;
  tarefa: string;
  observacoes: string;
  tempoTrabalhado?: string;
  status: OSStatus;
  dataAbertura: string; // ISO Date string (includes time)
  dataFinalizacao?: string; // ISO Date string
  programadoPara?: string; // ISO Date string (optional, YYYY-MM-DD format expected from input)
  isUrgent: boolean;
  dataInicioProducao?: string; // ISO Date string when status moves to 'Em Produção'
  tempoProducaoMinutos?: number; // Calculated duration in minutes from 'Em Produção' to 'Finalizado'
}

export interface User {
  id: string;
  username: string;
}

// For CreateOSForm - keeps taking names
export interface CreateOSData {
  cliente: string; // Name of the client
  parceiro?: string; // Name of the partner
  projeto: string;
  tarefa: string;
  observacoes: string;
  tempoTrabalhado?: string;
  status: OSStatus;
  programadoPara?: string;
  isUrgent: boolean;
}

export interface Client {
    id: string; // Will be the DB auto-incremented ID (as string)
    name: string;
}

export interface Partner {
    id: string; // Will be the DB auto-incremented ID (as string)
    name: string;
}
