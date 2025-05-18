
import { create } from 'zustand';
import type { OS, CreateOSData, Client } from '@/lib/types';
import { OSStatus } from '@/lib/types';
import { parseISO, differenceInMinutes } from 'date-fns';
import { createOSInDB } from '@/lib/actions/os-actions';
import { findOrCreateClientByName } from '@/lib/actions/client-actions';
import { findOrCreatePartnerByName } from '@/lib/actions/partner-actions';


export interface Partner {
    id: string;
    name: string;
}

interface OSState {
  osList: OS[];
  // nextOsNumber: number; // nextOsNumber will now be determined by the DB
  partners: Partner[];
  clients: Client[];
  isStoreInitialized: boolean; // To track if initial data load has happened

  initializeStore: (initialData: { osList: OS[], clients: Client[], partners: Partner[] }) => void;
  setOsList: (osList: OS[]) => void;
  setPartners: (partners: Partner[]) => void;
  setClients: (clients: Client[]) => void;
  // setNextOsNumber: (num: number) => void; // No longer needed from client

  addOS: (data: CreateOSData) => Promise<OS | null>; // Changed return type
  updateOS: (updatedOS: OS) => Promise<void>;
  updateOSStatus: (osId: string, newStatus: OSStatus) => Promise<void>;
  getOSById: (osId: string) => OS | undefined;
  duplicateOS: (osId: string) => Promise<OS | null>;
  toggleUrgent: (osId: string) => Promise<void>;

  addPartner: (partnerData: { name: string }) => Promise<Partner | null>;
  updatePartner: (updatedPartner: Partner) => Promise<void>;
  deletePartner: (partnerId: string) => Promise<void>;
  getPartnerById: (partnerId: string) => Partner | undefined;
  getPartnerByName: (partnerName: string) => Partner | undefined;

  addClient: (clientData: { name: string }) => Promise<Client | null>;
  updateClient: (updatedClient: Client) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  getClientById: (clientId: string) => Client | undefined;
  getClientByName: (clientName: string) => Client | undefined;
}

// const generateOSNumero = (num: number): string => String(num).padStart(6, '0'); // DB will handle numero generation


export const useOSStore = create<OSState>()(
    (set, get) => ({
      osList: [],
      // nextOsNumber: 1, // Removed, DB handles this
      partners: [],
      clients: [],
      isStoreInitialized: false,

      initializeStore: (initialData) => {
        set({
          osList: initialData.osList,
          clients: initialData.clients,
          partners: initialData.partners,
          isStoreInitialized: true,
        });
        console.log('Zustand store initialized with data from server.');
      },

      setOsList: (osList) => set({ osList }),
      setPartners: (partners) => set({ partners }),
      setClients: (clients) => set({ clients }),
      // setNextOsNumber: (num) => set({ nextOsNumber: num }), // Removed

      addOS: async (data) => {
        try {
          // The nextOsNumber is now determined by the DB in createOSInDB
          const newOS = await createOSInDB(data);
          
          set((state) => ({
            osList: [...state.osList, newOS],
          }));

          // Ensure client and partner from the new OS are in the local store if not already
          const existingClient = get().clients.find(c => c.id === newOS.clientId);
          if (!existingClient) {
             // This implies findOrCreateClientByName was successful and client is in DB
             // We add it to local store for UI consistency if it wasn't there already
             // This case might be rare if client list is kept up-to-date
             set(state => ({clients: [...state.clients, {id: newOS.clientId, name: newOS.cliente}]}));
          }
          if (newOS.partnerId && newOS.parceiro) {
            const existingPartner = get().partners.find(p => p.id === newOS.partnerId);
            if (!existingPartner) {
              set(state => ({partners: [...state.partners, {id: newOS.partnerId!, name: newOS.parceiro!}]}));
            }
          }
          return newOS;
        } catch (error) {
            console.error("Error in store addOS calling server action:", error);
            // Optionally re-throw or handle error (e.g., show toast to user)
            return null;
        }
      },

      updateOS: async (updatedOSData) => {
        // TODO: Implement updateOSInDB server action and call it here
        console.warn('updateOS: DB implementation pending. Called with:', updatedOSData);
        set((state) => ({
          osList: state.osList.map((os) =>
            os.id === updatedOSData.id ? { ...os, ...updatedOSData } : os
          ),
        }));
      },

      updateOSStatus: async (osId, newStatus) => {
        // TODO: Implement updateOSStatusInDB server action
        // This action would also handle dataInicioProducao, dataFinalizacao, tempoProducaoMinutos in the DB
        console.warn(`updateOSStatus: DB implementation pending for OS ID ${osId} to status ${newStatus}.`);
        set((state) => ({
          osList: state.osList.map((os) => {
            if (os.id === osId) {
              const now = new Date().toISOString();
              let dataInicioProducao = os.dataInicioProducao;
              let tempoProducaoMinutos = os.tempoProducaoMinutos;
              let dataFinalizacao = os.dataFinalizacao;

              if (newStatus === OSStatus.EM_PRODUCAO && os.status !== OSStatus.EM_PRODUCAO) {
                dataInicioProducao = now;
              }

              if (newStatus === OSStatus.FINALIZADO && os.status !== OSStatus.FINALIZADO) {
                dataFinalizacao = now;
                if (os.dataInicioProducao) {
                    tempoProducaoMinutos = differenceInMinutes(parseISO(now), parseISO(os.dataInicioProducao));
                } else if (os.status === OSStatus.EM_PRODUCAO) {
                    tempoProducaoMinutos = differenceInMinutes(parseISO(now), parseISO(os.dataAbertura));
                }
              }
              return { ...os, status: newStatus, dataFinalizacao, dataInicioProducao, tempoProducaoMinutos };
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

        const duplicatedOSData: CreateOSData = {
            cliente: osToDuplicate.cliente, // Name
            parceiro: osToDuplicate.parceiro, // Name
            projeto: `${osToDuplicate.projeto} (Cópia)`,
            tarefa: osToDuplicate.tarefa,
            observacoes: osToDuplicate.observacoes,
            tempoTrabalhado: '',
            status: OSStatus.NA_FILA,
            programadoPara: undefined,
            isUrgent: false,
        };
        
        try {
            // Create the duplicated OS in the DB
            const newOS = await createOSInDB(duplicatedOSData);
            set((state) => ({
              osList: [...state.osList, newOS],
            }));
            return newOS;
        } catch (error) {
            console.error("Error in store duplicateOS calling server action:", error);
            return null;
        }
      },

      toggleUrgent: async (osId: string) => {
        // TODO: Implement toggleUrgentInDB server action
        console.warn('toggleUrgent: DB implementation pending. Called for OS ID:', osId);
        set((state) => ({
          osList: state.osList.map((os) =>
            os.id === osId ? { ...os, isUrgent: !os.isUrgent } : os
          ),
        }));
      },

      getPartnerById: (partnerId) => get().partners.find(p => p.id === partnerId),
      getPartnerByName: (partnerName) => get().partners.find(p => p.name.toLowerCase() === partnerName.toLowerCase()),
      addPartner: async (partnerData) => {
        try {
            const newPartner = await findOrCreatePartnerByName(partnerData.name);
            // Ensure partner is in local store if it was newly created or found
            const existing = get().partners.find(p => p.id === newPartner.id);
            if (!existing) {
                 set(state => ({ partners: [...state.partners, newPartner] }));
            } else if (existing.name !== newPartner.name) { // Should not happen if DB has unique constraint
                 set(state => ({ partners: state.partners.map(p => p.id === newPartner.id ? newPartner : p) }));
            }
            return newPartner;
        } catch (error) {
            console.error("Error in store addPartner:", error);
            return null;
        }
      },
      updatePartner: async (updatedPartner) => {
        // TODO: Implement updatePartnerInDB server action
        console.warn('updatePartner: DB implementation pending. Called with:', updatedPartner);
        set(state => ({
            partners: state.partners.map(p => p.id === updatedPartner.id ? updatedPartner : p)
        }));
      },
      deletePartner: async (partnerId) => {
        // TODO: Implement deletePartnerInDB server action
        console.warn('deletePartner: DB implementation pending. Called for ID:', partnerId);
         set(state => ({
            partners: state.partners.filter(p => p.id !== partnerId)
        }));
      },

      getClientById: (clientId) => get().clients.find(c => c.id === clientId),
      getClientByName: (clientName) => get().clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()),
      addClient: async (clientData) => {
        try {
            const newClient = await findOrCreateClientByName(clientData.name);
             // Ensure client is in local store if it was newly created or found
            const existing = get().clients.find(c => c.id === newClient.id);
            if (!existing) {
                set(state => ({ clients: [...state.clients, newClient] }));
            } else if (existing.name !== newClient.name) { // Should not happen
                set(state => ({ clients: state.clients.map(c => c.id === newClient.id ? newClient : p) }));
            }
            return newClient;
        } catch (error) {
            console.error("Error in store addClient:", error);
            return null;
        }
      },
      updateClient: async (updatedClient) => {
        // TODO: Implement updateClientInDB server action
        console.warn('updateClient: DB implementation pending. Called with:', updatedClient);
        set(state => ({
            clients: state.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
        }));
      },
      deleteClient: async (clientId) => {
        // TODO: Implement deleteClientInDB server action
        console.warn('deleteClient: DB implementation pending. Called for ID:', clientId);
        set(state => ({
            clients: state.clients.filter(c => c.id !== clientId)
        }));
      },
    })
);

// Function to fetch initial data on the server (e.g., in a Server Component or Route Handler)
// This is a conceptual placement; actual usage would be in a component that calls this and then initializes the store.
// For now, you'll need a way to call this and then use `useOSStore.getState().initializeStore(...)` on the client.
/*
async function getInitialStoreData() {
    const osList = await getAllOSFromDB();
    const clients = await getAllClientsFromDB();
    const partners = await getAllPartnersFromDB();
    return { osList, clients, partners };
}
*/

