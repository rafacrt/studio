
import { create } from 'zustand';
import type { OS, CreateOSData, Client } from '@/lib/types';
import { OSStatus } from '@/lib/types';
import { parseISO, differenceInMinutes } from 'date-fns';
import { createOSInDB, getAllOSFromDB } from '@/lib/actions/os-actions'; // Added getAllOSFromDB
import { findOrCreateClientByName, getAllClientsFromDB } from '@/lib/actions/client-actions'; // Added getAllClientsFromDB
import { findOrCreatePartnerByName, getAllPartnersFromDB } from '@/lib/actions/partner-actions'; // Added getAllPartnersFromDB


export interface Partner {
    id: string;
    name: string;
}

interface OSState {
  osList: OS[];
  partners: Partner[];
  clients: Client[];
  isStoreInitialized: boolean; 

  initializeStore: () => Promise<void>; // Changed to async and fetches data
  // Removed direct setters as store will now be initialized from DB
  // setOsList: (osList: OS[]) => void;
  // setPartners: (partners: Partner[]) => void;
  // setClients: (clients: Client[]) => void;

  addOS: (data: CreateOSData) => Promise<OS | null>; 
  updateOS: (updatedOS: OS) => Promise<void>; // TODO: Implement DB update
  updateOSStatus: (osId: string, newStatus: OSStatus) => Promise<void>; // TODO: Implement DB update
  getOSById: (osId: string) => OS | undefined;
  duplicateOS: (osId: string) => Promise<OS | null>;
  toggleUrgent: (osId: string) => Promise<void>; // TODO: Implement DB update

  addPartner: (partnerData: { name: string }) => Promise<Partner | null>;
  updatePartner: (updatedPartner: Partner) => Promise<void>; // TODO: Implement DB update
  deletePartner: (partnerId: string) => Promise<void>; // TODO: Implement DB update
  getPartnerById: (partnerId: string) => Partner | undefined;
  getPartnerByName: (partnerName: string) => Partner | undefined;

  addClient: (clientData: { name: string }) => Promise<Client | null>;
  updateClient: (updatedClient: Client) => Promise<void>; // TODO: Implement DB update
  deleteClient: (clientId: string) => Promise<void>; // TODO: Implement DB update
  getClientById: (clientId: string) => Client | undefined;
  getClientByName: (clientName: string) => Client | undefined;
}


export const useOSStore = create<OSState>()(
    (set, get) => ({
      osList: [],
      partners: [],
      clients: [],
      isStoreInitialized: false,

      initializeStore: async () => {
        if (get().isStoreInitialized) {
            console.log('Zustand store already initialized.');
            return;
        }
        try {
            console.log('Initializing Zustand store from database...');
            const [osList, clients, partners] = await Promise.all([
                getAllOSFromDB(),
                getAllClientsFromDB(),
                getAllPartnersFromDB()
            ]);
            set({
              osList,
              clients,
              partners,
              isStoreInitialized: true,
            });
            console.log('Zustand store initialized successfully with data from server:', {
                osCount: osList.length,
                clientCount: clients.length,
                partnerCount: partners.length,
            });
        } catch (error) {
            console.error('Failed to initialize Zustand store from database:', error);
            // Optionally set an error state or retry mechanism
        }
      },

      addOS: async (data) => {
        console.log('[Store] addOS called with data:', data);
        try {
          const newOS = await createOSInDB(data);
          if (newOS) {
            console.log('[Store] OS created in DB, newOS:', newOS);
            set((state) => ({
              osList: [...state.osList, newOS].sort((a, b) => { // Keep sort order
                if (a.isUrgent && !b.isUrgent) return -1;
                if (!a.isUrgent && b.isUrgent) return 1;
                return new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime();
              }),
            }));

            // Ensure client from new OS is in local store if not already (should be handled by createOSInDB's return)
            const clientExists = get().clients.some(c => c.id === newOS.clientId);
            if (!clientExists) {
                console.log(`[Store] Adding new client ${newOS.cliente} (ID: ${newOS.clientId}) to local store.`);
                set(state => ({ clients: [...state.clients, { id: newOS.clientId, name: newOS.cliente }].sort((a,b) => a.name.localeCompare(b.name)) }));
            }
            if (newOS.partnerId && newOS.parceiro) {
              const partnerExists = get().partners.some(p => p.id === newOS.partnerId);
              if (!partnerExists) {
                console.log(`[Store] Adding new partner ${newOS.parceiro} (ID: ${newOS.partnerId}) to local store.`);
                set(state => ({ partners: [...state.partners, { id: newOS.partnerId!, name: newOS.parceiro! }].sort((a,b) => a.name.localeCompare(b.name)) }));
              }
            }
            console.log('[Store] addOS successful, newOS added to state.');
            return newOS;
          } else {
            console.error('[Store] createOSInDB returned null or undefined.');
            return null;
          }
        } catch (error) {
            console.error("[Store] Error in addOS calling server action createOSInDB:", error);
            return null;
        }
      },

      updateOS: async (updatedOSData) => {
        // TODO: Implement updateOSInDB server action and call it here
        // For now, optimistic update on client
        console.warn('updateOS: DB implementation pending. Optimistically updating client state for OS ID:', updatedOSData.id);
        set((state) => ({
          osList: state.osList.map((os) =>
            os.id === updatedOSData.id ? { ...os, ...updatedOSData } : os
          ).sort((a, b) => { // Keep sort order
            if (a.isUrgent && !b.isUrgent) return -1;
            if (!a.isUrgent && b.isUrgent) return 1;
            return new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime();
          }),
        }));
      },

      updateOSStatus: async (osId, newStatus) => {
        // TODO: Implement updateOSStatusInDB server action
        console.warn(`updateOSStatus: DB implementation pending for OS ID ${osId} to status ${newStatus}. Optimistically updating.`);
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
                if (dataInicioProducao) { // Use the potentially updated dataInicioProducao from this same status change
                    tempoProducaoMinutos = differenceInMinutes(parseISO(now), parseISO(dataInicioProducao));
                } else if (os.status === OSStatus.EM_PRODUCAO && os.dataInicioProducao) { // If it was already in production
                     tempoProducaoMinutos = differenceInMinutes(parseISO(now), parseISO(os.dataInicioProducao));
                }
              }
              // If moving out of "Finalizado", clear finalization data
              if (newStatus !== OSStatus.FINALIZADO && os.status === OSStatus.FINALIZADO) {
                  dataFinalizacao = undefined;
                  tempoProducaoMinutos = undefined;
                  // Consider if dataInicioProducao should also be reset if moving to "Na Fila" for example
              }

              return { ...os, status: newStatus, dataFinalizacao, dataInicioProducao, tempoProducaoMinutos };
            }
            return os;
          }).sort((a, b) => { // Keep sort order
            if (a.isUrgent && !b.isUrgent) return -1;
            if (!a.isUrgent && b.isUrgent) return 1;
            return new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime();
          }),
        }));
      },

      getOSById: (osId) => {
        return get().osList.find((os) => os.id === osId);
      },

      duplicateOS: async (osId: string) => {
        console.log(`[Store] duplicateOS called for OS ID: ${osId}`);
        const osToDuplicate = get().osList.find(os => os.id === osId);
        if (!osToDuplicate) {
            console.error(`[Store] OS with ID ${osId} not found for duplication.`);
            return null;
        }

        const duplicatedOSData: CreateOSData = {
            cliente: osToDuplicate.cliente, 
            parceiro: osToDuplicate.parceiro, 
            projeto: `${osToDuplicate.projeto} (Cópia)`,
            tarefa: osToDuplicate.tarefa,
            observacoes: osToDuplicate.observacoes,
            tempoTrabalhado: '', // Reset time worked
            status: OSStatus.NA_FILA, // Default status for new OS
            programadoPara: undefined, // Reset programmed date
            isUrgent: false, // Reset urgency
        };
        
        try {
            const newOS = await createOSInDB(duplicatedOSData);
            if (newOS) {
                console.log('[Store] Duplicated OS created in DB, newOS:', newOS);
                set((state) => ({
                  osList: [...state.osList, newOS].sort((a, b) => { // Keep sort order
                    if (a.isUrgent && !b.isUrgent) return -1;
                    if (!a.isUrgent && b.isUrgent) return 1;
                    return new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime();
                  }),
                }));
                 // Ensure client from new OS is in local store (similar to addOS)
                const clientExists = get().clients.some(c => c.id === newOS.clientId);
                if (!clientExists) {
                    set(state => ({ clients: [...state.clients, { id: newOS.clientId, name: newOS.cliente }].sort((a,b) => a.name.localeCompare(b.name)) }));
                }
                if (newOS.partnerId && newOS.parceiro) {
                    const partnerExists = get().partners.some(p => p.id === newOS.partnerId);
                    if (!partnerExists) {
                        set(state => ({ partners: [...state.partners, { id: newOS.partnerId!, name: newOS.parceiro! }].sort((a,b) => a.name.localeCompare(b.name)) }));
                    }
                }
                console.log('[Store] duplicateOS successful, newOS added to state.');
                return newOS;
            } else {
                console.error('[Store] createOSInDB returned null for duplicated OS.');
                return null;
            }
        } catch (error) {
            console.error("[Store] Error in duplicateOS calling server action createOSInDB:", error);
            return null;
        }
      },

      toggleUrgent: async (osId: string) => {
        // TODO: Implement toggleUrgentInDB server action
        console.warn('toggleUrgent: DB implementation pending. Optimistically updating client state for OS ID:', osId);
        set((state) => ({
          osList: state.osList.map((os) =>
            os.id === osId ? { ...os, isUrgent: !os.isUrgent } : os
          ).sort((a, b) => { // Re-sort after toggling urgency
            if (a.isUrgent && !b.isUrgent) return -1;
            if (!a.isUrgent && b.isUrgent) return 1;
            return new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime();
          }),
        }));
      },

      getPartnerById: (partnerId) => get().partners.find(p => p.id === partnerId),
      getPartnerByName: (partnerName) => get().partners.find(p => p.name.toLowerCase() === partnerName.toLowerCase()),
      addPartner: async (partnerData) => {
        console.log('[Store] addPartner called with data:', partnerData);
        try {
            const newPartner = await findOrCreatePartnerByName(partnerData.name);
            if (newPartner) {
                console.log('[Store] Partner found/created in DB:', newPartner);
                const existing = get().partners.find(p => p.id === newPartner.id);
                if (!existing) {
                     set(state => ({ partners: [...state.partners, newPartner].sort((a,b) => a.name.localeCompare(b.name)) }));
                     console.log('[Store] New partner added to local store.');
                } else if (existing.name !== newPartner.name) { 
                     set(state => ({ partners: state.partners.map(p => p.id === newPartner.id ? newPartner : p).sort((a,b) => a.name.localeCompare(b.name)) }));
                     console.log('[Store] Existing partner name updated in local store (should be rare).');
                }
                return newPartner;
            } else {
                console.error('[Store] findOrCreatePartnerByName returned null.');
                return null;
            }
        } catch (error) {
            console.error("[Store] Error in addPartner calling server action findOrCreatePartnerByName:", error);
            return null;
        }
      },
      updatePartner: async (updatedPartner) => {
        // TODO: Implement updatePartnerInDB server action
        console.warn('updatePartner: DB implementation pending. Optimistically updating client state for partner ID:', updatedPartner.id);
        set(state => ({
            partners: state.partners.map(p => p.id === updatedPartner.id ? updatedPartner : p).sort((a,b) => a.name.localeCompare(b.name))
        }));
      },
      deletePartner: async (partnerId) => {
        // TODO: Implement deletePartnerInDB server action
        console.warn('deletePartner: DB implementation pending. Optimistically removing partner from client state, ID:', partnerId);
         set(state => ({
            partners: state.partners.filter(p => p.id !== partnerId)
        }));
      },

      getClientById: (clientId) => get().clients.find(c => c.id === clientId),
      getClientByName: (clientName) => get().clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()),
      addClient: async (clientData) => {
        console.log('[Store] addClient called with data:', clientData);
        try {
            const newClient = await findOrCreateClientByName(clientData.name);
            if (newClient) {
                console.log('[Store] Client found/created in DB:', newClient);
                const existing = get().clients.find(c => c.id === newClient.id);
                if (!existing) {
                    set(state => ({ clients: [...state.clients, newClient].sort((a,b) => a.name.localeCompare(b.name)) }));
                    console.log('[Store] New client added to local store.');
                } else if (existing.name !== newClient.name) {
                    set(state => ({ clients: state.clients.map(c => c.id === newClient.id ? newClient : c).sort((a,b) => a.name.localeCompare(b.name)) }));
                     console.log('[Store] Existing client name updated in local store (should be rare).');
                }
                return newClient;
            } else {
                 console.error('[Store] findOrCreateClientByName returned null.');
                 return null;
            }
        } catch (error) {
            console.error("[Store] Error in addClient calling server action findOrCreateClientByName:", error);
            return null;
        }
      },
      updateClient: async (updatedClient) => {
        // TODO: Implement updateClientInDB server action
        console.warn('updateClient: DB implementation pending. Optimistically updating client state for client ID:', updatedClient.id);
        set(state => ({
            clients: state.clients.map(c => c.id === updatedClient.id ? updatedClient : c).sort((a,b) => a.name.localeCompare(b.name))
        }));
      },
      deleteClient: async (clientId) => {
        // TODO: Implement deleteClientInDB server action
        console.warn('deleteClient: DB implementation pending. Optimistically removing client from client state, ID:', clientId);
        set(state => ({
            clients: state.clients.filter(c => c.id !== clientId)
        }));
      },
    })
);

// Initialize store on client side, e.g., in a top-level client component or layout.
// This is typically done in a useEffect hook.
// Example:
// In your AuthenticatedLayout.tsx or a similar high-level client component:
// useEffect(() => {
//   if (!useOSStore.getState().isStoreInitialized) {
//     useOSStore.getState().initializeStore();
//   }
// }, []);

