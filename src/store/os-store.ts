
import { create } from 'zustand';
// Removed: import { persist, createJSONStorage } from 'zustand/middleware';
import type { OS, CreateOSData, Client } from '@/lib/types';
import { OSStatus } from '@/lib/types';
import { parseISO, differenceInMinutes } from 'date-fns'; // Keep for time calculation

// Define Partner type explicitly for managed state
export interface Partner {
    id: string;
    name: string;
}

interface OSState {
  osList: OS[];
  nextOsNumber: number;
  partners: Partner[];
  clients: Client[];

  setOsList: (osList: OS[]) => void;
  setPartners: (partners: Partner[]) => void;
  setClients: (clients: Client[]) => void;
  setNextOsNumber: (num: number) => void;

  addOS: (data: CreateOSData) => OS; // Changed return type
  updateOS: (updatedOS: OS) => Promise<void>;
  updateOSStatus: (osId: string, newStatus: OSStatus) => Promise<void>;
  getOSById: (osId: string) => OS | undefined;
  duplicateOS: (osId: string) => Promise<OS | null>;
  toggleUrgent: (osId: string) => Promise<void>;

  addPartner: (partnerData: Omit<Partner, 'id'>) => Partner; // Temporarily sync
  updatePartner: (updatedPartner: Partner) => Promise<void>;
  deletePartner: (partnerId: string) => Promise<void>;
  getPartnerById: (partnerId: string) => Partner | undefined;
  getPartnerByName: (partnerName: string) => Partner | undefined;

  addClient: (clientData: Omit<Client, 'id'>) => Client; // Temporarily sync
  updateClient: (updatedClient: Client) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  getClientById: (clientId: string) => Client | undefined;
  getClientByName: (clientName: string) => Client | undefined;
}

const generateOSNumero = (num: number): string => String(num).padStart(6, '0');


export const useOSStore = create<OSState>()(
    (set, get) => ({
      osList: [],
      nextOsNumber: 1,
      partners: [],
      clients: [],

      setOsList: (osList) => set({ osList }),
      setPartners: (partners) => set({ partners }),
      setClients: (clients) => set({ clients }),
      setNextOsNumber: (num) => set({ nextOsNumber: num }),

      addOS: (data) => {
        const newOsId = `os-${Date.now()}`; // Simple unique ID for now
        const newOsNumero = generateOSNumero(get().nextOsNumber);
        const newOS: OS = {
          id: newOsId,
          numero: newOsNumero,
          cliente: data.cliente,
          parceiro: data.parceiro,
          projeto: data.projeto,
          tarefa: data.tarefa,
          observacoes: data.observacoes || '',
          tempoTrabalhado: data.tempoTrabalhado || '',
          status: data.status,
          dataAbertura: new Date().toISOString(),
          programadoPara: data.programadoPara,
          isUrgent: data.isUrgent,
          // dataInicioProducao and tempoProducaoMinutos will be set when status changes
        };

        set((state) => ({
          osList: [...state.osList, newOS],
          nextOsNumber: state.nextOsNumber + 1,
        }));
        console.warn(`addOS: OS "${newOS.numero}" adicionada ao estado local. Implementação do banco de dados pendente.`);
        
        // Add new client if it doesn't exist (local state for now)
        if (data.cliente && !get().clients.find(c => c.name.toLowerCase() === data.cliente.toLowerCase())) {
            get().addClient({ name: data.cliente });
        }
        // Add new partner if it doesn't exist (local state for now)
        if (data.parceiro && !get().partners.find(p => p.name.toLowerCase() === data.parceiro!.toLowerCase())) {
            get().addPartner({ name: data.parceiro });
        }

        return newOS;
      },

      updateOS: async (updatedOSData) => {
        console.warn('updateOS: DB implementation pending. Called with:', updatedOSData);
        set((state) => ({
          osList: state.osList.map((os) =>
            os.id === updatedOSData.id ? { ...os, ...updatedOSData } : os
          ),
        }));
      },

      updateOSStatus: async (osId, newStatus) => {
        set((state) => ({
          osList: state.osList.map((os) => {
            if (os.id === osId) {
              const now = new Date().toISOString();
              let dataInicioProducao = os.dataInicioProducao;
              let tempoProducaoMinutos = os.tempoProducaoMinutos;

              // Start production timer
              if (newStatus === OSStatus.EM_PRODUCAO && os.status !== OSStatus.EM_PRODUCAO) {
                dataInicioProducao = now;
              }

              // Calculate production time if finalizing
              if (newStatus === OSStatus.FINALIZADO && os.status !== OSStatus.FINALIZADO) {
                if (os.dataInicioProducao) { // Ensure production had started
                    // Simple calculation: difference in minutes
                    // More complex logic for business hours can be added here or server-side
                    tempoProducaoMinutos = differenceInMinutes(parseISO(now), parseISO(os.dataInicioProducao));
                } else if (os.status === OSStatus.EM_PRODUCAO) { // If it was in production but no explicit start_date (e.g. old data)
                     // Fallback: if no explicit start, but was in production, calculate from dataAbertura if it was set to EM_PRODUCAO from start
                    tempoProducaoMinutos = differenceInMinutes(parseISO(now), parseISO(os.dataAbertura));
                }


                console.warn(`updateOSStatus: OS "${os.numero}" finalizada. Tempo de produção calculado: ${tempoProducaoMinutos} min. DB pendente.`);
                return { ...os, status: newStatus, dataFinalizacao: now, dataInicioProducao, tempoProducaoMinutos };
              }
              console.warn(`updateOSStatus: Status da OS "${os.numero}" atualizado para ${newStatus}. DB pendente.`);
              return { ...os, status: newStatus, dataInicioProducao };
            }
            return os;
          }),
        }));
      },

      getOSById: (osId) => {
        return get().osList.find((os) => os.id === osId);
      },

      duplicateOS: async (osId: string) => {
        const osToDuplicate = get().osList.find(os => os.id === osId);
        if (!osToDuplicate) return null;

        const newOsNumero = generateOSNumero(get().nextOsNumber);
        const duplicatedOSData: CreateOSData = {
            cliente: osToDuplicate.cliente,
            parceiro: osToDuplicate.parceiro,
            projeto: `${osToDuplicate.projeto} (Cópia)`,
            tarefa: osToDuplicate.tarefa,
            observacoes: osToDuplicate.observacoes,
            tempoTrabalhado: '', // Reset time worked for a new OS
            status: OSStatus.NA_FILA, // Start as new
            programadoPara: undefined, // Reset programming
            isUrgent: false, // Reset urgency
        };
        // Use the existing addOS logic to create the new OS
        const newOS = get().addOS(duplicatedOSData);
        console.warn(`duplicateOS: OS "${osToDuplicate.numero}" duplicada como "${newOS.numero}". DB pendente.`);
        return newOS;
      },

      toggleUrgent: async (osId: string) => {
        console.warn('toggleUrgent: DB implementation pending. Called for OS ID:', osId);
        set((state) => ({
          osList: state.osList.map((os) =>
            os.id === osId ? { ...os, isUrgent: !os.isUrgent } : os
          ),
        }));
      },

      getPartnerById: (partnerId) => get().partners.find(p => p.id === partnerId),
      getPartnerByName: (partnerName) => get().partners.find(p => p.name.toLowerCase() === partnerName.toLowerCase()),
      addPartner: (partnerData) => { // Temporarily sync
        const newPartnerId = `partner-${Date.now()}`;
        const newPartner: Partner = { id: newPartnerId, ...partnerData };
        set(state => ({ partners: [...state.partners, newPartner] }));
        console.warn(`addPartner: Parceiro "${newPartner.name}" adicionado ao estado local. DB pendente.`);
        return newPartner;
      },
      updatePartner: async (updatedPartner) => {
        console.warn('updatePartner: DB implementation pending. Called with:', updatedPartner);
        set(state => ({
            partners: state.partners.map(p => p.id === updatedPartner.id ? updatedPartner : p)
        }));
      },
      deletePartner: async (partnerId) => {
        console.warn('deletePartner: DB implementation pending. Called for ID:', partnerId);
         set(state => ({
            partners: state.partners.filter(p => p.id !== partnerId)
        }));
      },

      getClientById: (clientId) => get().clients.find(c => c.id === clientId),
      getClientByName: (clientName) => get().clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()),
      addClient: (clientData) => { // Temporarily sync
        const newClientId = `client-${Date.now()}`;
        const newClient: Client = { id: newClientId, ...clientData };
        set(state => ({ clients: [...state.clients, newClient] }));
        console.warn(`addClient: Cliente "${newClient.name}" adicionado ao estado local. DB pendente.`);
        return newClient;
      },
      updateClient: async (updatedClient) => {
        console.warn('updateClient: DB implementation pending. Called with:', updatedClient);
        set(state => ({
            clients: state.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
        }));
      },
      deleteClient: async (clientId) => {
        console.warn('deleteClient: DB implementation pending. Called for ID:', clientId);
        set(state => ({
            clients: state.clients.filter(c => c.id !== clientId)
        }));
      },
    })
);
