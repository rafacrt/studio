
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
  cliente: string; // Keep as string for now, link conceptually to Client list
  parceiro?: string;
  projeto: string;
  tarefa: string; // New field
  observacoes: string;
  tempoTrabalhado?: string; // New field, simple text for now
  status: OSStatus;
  dataAbertura: string; // ISO Date string (includes time)
  dataFinalizacao?: string; // ISO Date string
  programadoPara?: string; // ISO Date string (optional, YYYY-MM-DD format expected from input) - NEW
  isUrgent: boolean;
  // Time Tracking Fields
  dataInicioProducao?: string; // ISO Date string when status moves to 'Em Produção'
  tempoProducaoMinutos?: number; // Calculated duration in minutes from 'Em Produção' to 'Finalizado'
}

export interface User {
  id: string;
  username: string;
  role?: 'admin' | 'client'; // Added role for workflow
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
  programadoPara?: string; // NEW, expects YYYY-MM-DD
  isUrgent: boolean;
}

// Interface for managing Clients separately
export interface Client {
    id: string;
    name: string;
    // Add other client details as needed (e.g., contact, address)
}

// Interface for Workflow Artwork
export interface Artwork {
  id: string;
  clientId: string; // ID of the client this artwork belongs to
  clientName?: string; // Optional: denormalized client name for display
  title: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'changes_requested';
  feedback: string;
  showFeedbackInput: boolean;
  uploadedAt: string; // ISO date string when the artwork was uploaded/made available
}
