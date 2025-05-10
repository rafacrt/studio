export enum OSStatus {
  AGUARDANDO_CLIENTE = "Aguardando Cliente",
  EM_PRODUCAO = "Em Produção",
  AGUARDANDO_PARCEIRO = "Aguardando Parceiro",
  FINALIZADO = "Finalizado",
}

export const ALL_OS_STATUSES: OSStatus[] = [
  OSStatus.AGUARDANDO_CLIENTE,
  OSStatus.EM_PRODUCAO,
  OSStatus.AGUARDANDO_PARCEIRO,
  OSStatus.FINALIZADO,
];

export interface OS {
  id: string;
  numero: string;
  cliente: string;
  parceiro?: string; // Optional as per minimal form
  projeto: string;
  observacoes: string;
  status: OSStatus;
  dataAbertura: string; // ISO Date string
  dataFinalizacao?: string; // ISO Date string
  isUrgent: boolean; // Replaces "Urgente" status with a flag
}

export interface User {
  id: string;
  username: string;
  // Add other user fields if needed, e.g., name
}

// For CreateOSForm
export interface CreateOSData {
  cliente: string;
  projeto: string;
  observacoes: string;
  status: OSStatus;
  isUrgent: boolean;
}
