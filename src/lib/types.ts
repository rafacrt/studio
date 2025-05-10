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
  id: string;
  numero: string; // 6-digit sequential number
  cliente: string;
  parceiro?: string; 
  projeto: string;
  tarefa: string; // New field
  observacoes: string;
  tempoTrabalhado?: string; // New field, simple text for now
  status: OSStatus;
  dataAbertura: string; // ISO Date string (includes time)
  dataFinalizacao?: string; // ISO Date string
  isUrgent: boolean;
}

export interface User {
  id: string;
  username: string;
  // Add other user fields if needed, e.g., name
}

// For CreateOSForm
export interface CreateOSData {
  cliente: string;
  parceiro?: string;
  projeto: string;
  tarefa: string;
  observacoes: string;
  tempoTrabalhado?: string;
  status: OSStatus; // Should default to NA_FILA
  isUrgent: boolean;
}

