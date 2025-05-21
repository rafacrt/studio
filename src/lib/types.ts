
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
  numero: string;
  cliente: string;
  parceiro?: string;
  clientId: string;
  partnerId?: string;
  projeto: string;
  tarefa: string;
  observacoes: string;
  tempoTrabalhado?: string;
  status: OSStatus;
  dataAbertura: string;
  dataFinalizacao?: string;
  programadoPara?: string;
  isUrgent: boolean;
  dataInicioProducao?: string;
  tempoProducaoMinutos?: number;
}

export interface User {
  id: string; // ID do banco de dados
  username: string;
  // Não inclua password_hash aqui por segurança
}

// Para o formulário de login
export interface LoginFormData {
  username: string;
  password_hash: string; // O campo do formulário será 'password', mas a action receberá 'password_hash' para clareza
}


export interface CreateOSData {
  cliente: string;
  parceiro?: string;
  projeto: string;
  tarefa: string;
  observacoes: string;
  tempoTrabalhado?: string;
  status: OSStatus;
  programadoPara?: string;
  isUrgent: boolean;
}

export interface Client {
    id: string;
    name: string;
}

export interface Partner {
    id: string;
    name: string;
}
