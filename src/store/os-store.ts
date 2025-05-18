
import { create } from 'zustand';
// Removed: import { persist, createJSONStorage } from 'zustand/middleware';
import type { OS, CreateOSData, Client } from '@/lib/types';
import { OSStatus } from '@/lib/types';
// Removed: import { parseISO, differenceInMinutes } from 'date-fns';

// Define Partner type explicitly for managed state
export interface Partner {
    id: string;
    name: string;
}

interface OSState {
  osList: OS[]; // Will be populated by fetching from DB
  nextOsNumber: number; // This logic will need to change (e.g., query MAX(numero) from DB)
  partners: Partner[]; // Will be populated by fetching from DB
  clients: Client[]; // Will be populated by fetching from DB

  // These functions will need to be re-implemented to call Server Actions
  // which will interact with the database.
  // The local state updates here will likely be removed or changed
  // to reflect optimistic updates or cache invalidation.

  setOsList: (osList: OS[]) => void; // For loading data from DB
  setPartners: (partners: Partner[]) => void; // For loading data from DB
  setClients: (clients: Client[]) => void; // For loading data from DB
  setNextOsNumber: (num: number) => void; // For setting after DB query

  addOS: (data: CreateOSData) => OS | null; // Temporarily synchronous for debugging modal
  updateOS: (updatedOS: OS) => Promise<void>; // Now async
  updateOSStatus: (osId: string, newStatus: OSStatus) => Promise<void>; // Now async
  getOSById: (osId: string) => OS | undefined; // Might become async or rely on fetched list
  duplicateOS: (osId: string) => Promise<OS | null>; // Now async
  toggleUrgent: (osId: string) => Promise<void>; // Now async

  addPartner: (partnerData: Omit<Partner, 'id'>) => Promise<Partner | null>; // Now async
  updatePartner: (updatedPartner: Partner) => Promise<void>; // Now async
  deletePartner: (partnerId: string) => Promise<void>; // Now async
  getPartnerById: (partnerId: string) => Partner | undefined; // Might rely on fetched list
  getPartnerByName: (partnerName: string) => Partner | undefined; // Might rely on fetched list

  addClient: (clientData: Omit<Client, 'id'>) => Promise<Client | null>; // Now async
  updateClient: (updatedClient: Client) => Promise<void>; // Now async
  deleteClient: (clientId: string) => Promise<void>; // Now async
  getClientById: (clientId: string) => Client | undefined; // Might rely on fetched list
  getClientByName: (clientName: string) => Client | undefined; // Might rely on fetched list
}

// const generateOSNumero = (num: number): string => String(num).padStart(6, '0');


// The store is now much simpler. Data fetching and mutations
// will be handled by server components/actions.
// This store might be used for temporary client-side state or removed
// if data is directly managed by components via server action calls.

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

      // TODO: Re-implement all mutation and fetch functions below to use Server Actions + Database
      // For now, they are placeholders or operate on local state for basic structure.

      // Temporarily synchronous for modal debugging
      addOS: (data) => {
        console.warn('addOS: DB implementation pending. Called with (sync for debug):', data);
        // In a real scenario, this would call a server action.
        // For now, we simulate a successful synchronous operation.
        // You might want to add to local state for immediate UI feedback if needed,
        // but for debugging the modal, just logging and returning null is fine.
        // Example:
        // const newOsId = `os-${Date.now()}`;
        // const newOsNumero = String(get().nextOsNumber).padStart(6, '0');
        // const newOS: OS = {
        //   id: newOsId,
        //   numero: newOsNumero,
        //   ...data,
        //   dataAbertura: new Date().toISOString(),
        //   observacoes: data.observacoes || '',
        //   tempoTrabalhado: data.tempoTrabalhado || '',
        // };
        // set((state) => ({
        //   osList: [...state.osList, newOS],
        //   nextOsNumber: state.nextOsNumber + 1,
        // }));
        // return newOS;
        return null;
      },

      updateOS: async (updatedOSData) => {
        console.warn('updateOS: DB implementation pending. Called with:', updatedOSData);
        // set((state) => ({
        //   osList: state.osList.map((os) =>
        //     os.id === updatedOSData.id ? { ...os, ...updatedOSData } : os
        //   ),
        // }));
      },

      updateOSStatus: async (osId, newStatus) => {
        console.warn('updateOSStatus: DB implementation pending. Called for OS ID:', osId, 'New Status:', newStatus);
        // set((state) => ({
        //   osList: state.osList.map((os) =>
        //     os.id === osId ? { ...os, status: newStatus } : os
        //   ),
        // }));
      },

      getOSById: (osId) => {
        // This will likely fetch from the current client-side list,
        // which should be populated from the DB initially.
        return get().osList.find((os) => os.id === osId);
      },

      duplicateOS: async (osId: string) => {
        console.warn('duplicateOS: DB implementation pending. Called for OS ID:', osId);
        return null;
      },

      toggleUrgent: async (osId: string) => {
        console.warn('toggleUrgent: DB implementation pending. Called for OS ID:', osId);
        // set((state) => ({
        //   osList: state.osList.map((os) =>
        //     os.id === osId ? { ...os, isUrgent: !os.isUrgent } : os
        //   ),
        // }));
      },

      getPartnerById: (partnerId) => get().partners.find(p => p.id === partnerId),
      getPartnerByName: (partnerName) => get().partners.find(p => p.name.toLowerCase() === partnerName.toLowerCase()),
      addPartner: async (partnerData) => {
        console.warn('addPartner: DB implementation pending. Called with:', partnerData);
        return null;
      },
      updatePartner: async (updatedPartner) => {
        console.warn('updatePartner: DB implementation pending. Called with:', updatedPartner);
      },
      deletePartner: async (partnerId) => {
        console.warn('deletePartner: DB implementation pending. Called for ID:', partnerId);
      },

      getClientById: (clientId) => get().clients.find(c => c.id === clientId),
      getClientByName: (clientName) => get().clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()),
      addClient: async (clientData) => {
        console.warn('addClient: DB implementation pending. Called with:', clientData);
        return null;
      },
      updateClient: async (updatedClient) => {
        console.warn('updateClient: DB implementation pending. Called with:', updatedClient);
      },
      deleteClient: async (clientId) => {
        console.warn('deleteClient: DB implementation pending. Called for ID:', clientId);
      },
    })
  // Removed persist middleware
  // {
  //   name: 'freelaos-storage-v7-time-tracking',
  //   storage: createJSONStorage(() => localStorage),
  //   version: 7, // Increment version if schema changes significantly, though now it's mostly a cache
  // }
);
