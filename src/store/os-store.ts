
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OS, CreateOSData, Client } from '@/lib/types'; // Import Client type
import { OSStatus } from '@/lib/types';
import { parseISO, differenceInMinutes } from 'date-fns'; // Import date-fns functions

// Define Partner type explicitly for managed state
export interface Partner {
    id: string;
    name: string;
}

interface OSState {
  osList: OS[];
  nextOsNumber: number;
  partners: Partner[]; // Changed from string[] to Partner[] - MANAGED state now
  clients: Client[];
  addOS: (data: CreateOSData) => OS;
  updateOS: (updatedOS: OS) => void;
  updateOSStatus: (osId: string, newStatus: OSStatus) => void;
  getOSById: (osId: string) => OS | undefined;
  setInitialData: (data: OS[], nextNumber: number, partners: Partner[], clients: Client[]) => void; // Updated signature
  duplicateOS: (osId: string) => void;
  toggleUrgent: (osId: string) => void;
  // Partner Actions (now operate on managed Partner[] list)
  addPartner: (partnerData: Omit<Partner, 'id'>) => Partner;
  updatePartner: (updatedPartner: Partner) => void;
  deletePartner: (partnerId: string) => void;
  getPartnerById: (partnerId: string) => Partner | undefined;
  getPartnerByName: (partnerName: string) => Partner | undefined; // Helper
  // Client Actions
  addClient: (clientData: Omit<Client, 'id'>) => Client;
  updateClient: (updatedClient: Client) => void;
  deleteClient: (clientId: string) => void;
  getClientById: (clientId: string) => Client | undefined;
}

const generateOSNumero = (num: number): string => String(num).padStart(6, '0');

// Helper to get date string for 'programadoPara' N days from now
const getDatePlusDays = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; // Return only YYYY-MM-DD
}

// Initial mock clients
const initialMockClients: Client[] = [
    { id: 'client-1', name: 'Soluções Tech Ltda.' },
    { id: 'client-2', name: 'Café Aconchego' },
    { id: 'client-3', name: 'Logística Global Express' },
    { id: 'client-4', name: 'Eco Verde Sustentável' },
];

// Initial mock data - Added 'programadoPara' and time tracking fields
const initialMockOS: OS[] = [
  {
    id: '1',
    numero: generateOSNumero(1),
    cliente: 'Soluções Tech Ltda.', // Matches name in initialMockClients
    parceiro: 'Design Criativo Co.',
    projeto: 'Redesenho do Website',
    tarefa: 'Coleta de requisitos e briefing inicial com o cliente.',
    observacoes: 'Consulta inicial e levantamento de requisitos. Cliente precisa de um visual moderno.',
    tempoTrabalhado: '2h reunião, 1h documentação',
    status: OSStatus.AGUARDANDO_CLIENTE,
    dataAbertura: new Date(2023, 10, 15, 10, 30).toISOString(),
    programadoPara: getDatePlusDays(7), // Programmed for 7 days from now
    isUrgent: false,
    dataInicioProducao: undefined,
    tempoProducaoMinutos: undefined,
  },
  {
    id: '2',
    numero: generateOSNumero(2),
    cliente: 'Café Aconchego', // Matches name in initialMockClients
    projeto: 'Desenvolvimento App Mobile',
    tarefa: 'Fase 1: Mockups de UI/UX.',
    observacoes: 'Fase 1: Mockups de design UI/UX. Foco em interface amigável.',
    tempoTrabalhado: '16h design',
    status: OSStatus.EM_PRODUCAO,
    dataAbertura: new Date(2023, 11, 1, 14, 0).toISOString(),
    dataInicioProducao: new Date(2023, 11, 2, 9, 0).toISOString(), // Started production later
    programadoPara: getDatePlusDays(3), // Programmed for 3 days from now
    isUrgent: true,
    tempoProducaoMinutos: undefined,
  },
  {
    id: '3',
    numero: generateOSNumero(3),
    cliente: 'Logística Global Express', // Matches name in initialMockClients
    parceiro: 'Integra Sys',
    projeto: 'Integração CRM',
    tarefa: 'Aguardar chaves de API e documentação do parceiro.',
    observacoes: 'Aguardando chaves de API e documentação da empresa parceira.',
    status: OSStatus.AGUARDANDO_PARCEIRO,
    dataAbertura: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    programadoPara: undefined, // Not programmed yet
    isUrgent: false,
    dataInicioProducao: undefined,
    tempoProducaoMinutos: undefined,
  },
  {
    id: '4',
    numero: generateOSNumero(4),
    cliente: 'Eco Verde Sustentável', // Matches name in initialMockClients
    projeto: 'Pacote de Branding',
    tarefa: 'Entrega final do manual da marca e aprovação.',
    observacoes: 'Guia completo de branding entregue e aprovado pelo cliente.',
    status: OSStatus.FINALIZADO,
    dataAbertura: new Date(2023, 9, 5, 9, 0).toISOString(),
    dataInicioProducao: new Date(2023, 9, 10, 11, 0).toISOString(),
    dataFinalizacao: new Date(2023, 9, 25, 17, 30).toISOString(),
    programadoPara: new Date(2023, 9, 24).toISOString().split('T')[0], // Was programmed for this date
    isUrgent: false,
    tempoProducaoMinutos: differenceInMinutes(new Date(2023, 9, 25, 17, 30), new Date(2023, 9, 10, 11, 0)), // Example calculation
  },
  {
    id: '5',
    numero: generateOSNumero(5),
    cliente: 'Soluções Tech Ltda.', // Matches name in initialMockClients
    parceiro: 'Marketing Experts',
    projeto: 'Campanha de Marketing Digital',
    tarefa: 'Planejamento da estratégia de mídia social para Q1.',
    observacoes: 'Planejando estratégia de mídia social para o primeiro trimestre. Prazo urgente.',
    status: OSStatus.NA_FILA,
    dataAbertura: new Date().toISOString(),
    programadoPara: getDatePlusDays(14), // Programmed for 14 days from now
    isUrgent: true,
    dataInicioProducao: undefined,
    tempoProducaoMinutos: undefined,
  },
];

// Derive initial partners from mock OS data
const getInitialPartners = (osList: OS[]): Partner[] => {
  const partnerMap = new Map<string, Partner>();
  osList.forEach(os => {
    if (os.parceiro && !partnerMap.has(os.parceiro.toLowerCase())) {
        const newPartner = { id: crypto.randomUUID(), name: os.parceiro };
        partnerMap.set(os.parceiro.toLowerCase(), newPartner);
    }
  });
  return Array.from(partnerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const initialMockPartners = getInitialPartners(initialMockOS);


export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      osList: initialMockOS,
      nextOsNumber: initialMockOS.length + 1,
      partners: initialMockPartners, // Initialize with derived partners
      clients: initialMockClients, // Initialize clients list

      setInitialData: (data, nextNumber, partners, clients) => set({
          osList: data,
          nextOsNumber: nextNumber,
          partners: partners, // Set initial partners
          clients: clients // Set initial clients
      }),

      addOS: (data) => {
        const currentOsNumber = get().nextOsNumber;
        const newOS: OS = {
          id: crypto.randomUUID(),
          numero: generateOSNumero(currentOsNumber),
          cliente: data.cliente,
          parceiro: data.parceiro,
          projeto: data.projeto,
          tarefa: data.tarefa,
          observacoes: data.observacoes,
          tempoTrabalhado: data.tempoTrabalhado,
          status: data.status || OSStatus.NA_FILA, // Default to NA_FILA
          dataAbertura: new Date().toISOString(),
          // Ensure programadoPara is stored as YYYY-MM-DD string or undefined
          programadoPara: data.programadoPara ? data.programadoPara.split('T')[0] : undefined,
          isUrgent: data.isUrgent || false,
          // Initialize time tracking fields
          dataInicioProducao: data.status === OSStatus.EM_PRODUCAO ? new Date().toISOString() : undefined,
          tempoProducaoMinutos: undefined,
        };
        set((state) => ({
          osList: [...state.osList, newOS],
          nextOsNumber: currentOsNumber + 1,
          // Partner list update is handled separately by addPartner if needed
        }));

        // Add partner to managed list if it's new
        if (data.parceiro) {
            const partnerExists = get().partners.some(p => p.name.toLowerCase() === data.parceiro!.toLowerCase());
            if (!partnerExists) {
                 get().addPartner({ name: data.parceiro });
            }
        }

        // Add client to client list if it doesn't exist (simple name check for now)
        const clientExists = get().clients.some(c => c.name.toLowerCase() === data.cliente.toLowerCase());
        if (!clientExists) {
             get().addClient({ name: data.cliente });
        }
        return newOS;
      },

      updateOS: (updatedOS) =>
        set((state) => {
             // Add partner if it's new
             if (updatedOS.parceiro) {
                 const partnerExists = state.partners.some(p => p.name.toLowerCase() === updatedOS.parceiro!.toLowerCase());
                 if (!partnerExists) {
                    get().addPartner({ name: updatedOS.parceiro }); // Call addPartner action
                 }
             }
             // Ensure programadoPara is stored correctly
             const finalUpdatedOS = {
                 ...updatedOS,
                 programadoPara: updatedOS.programadoPara ? updatedOS.programadoPara.split('T')[0] : undefined,
             };
             return {
                 osList: state.osList.map((os) => (os.id === finalUpdatedOS.id ? finalUpdatedOS : os)),
                 // partners list is managed by addPartner now
             };
        }),

      updateOSStatus: (osId, newStatus) =>
        set((state) => ({
          osList: state.osList.map((os) => {
            if (os.id !== osId) return os;

            const now = new Date().toISOString();
            let updates: Partial<OS> = { status: newStatus };

            // Set start production date
            if (newStatus === OSStatus.EM_PRODUCAO && !os.dataInicioProducao) {
              updates.dataInicioProducao = now;
            }

            // Set finalization date and calculate production time
            if (newStatus === OSStatus.FINALIZADO) {
              if (!os.dataFinalizacao) {
                 updates.dataFinalizacao = now;
              }
              // Calculate duration only if started and not already calculated
              if (os.dataInicioProducao && !os.tempoProducaoMinutos) {
                try {
                    // Use the finalization date that's being set now, or the existing one if somehow it was already set
                    const finalizationDate = updates.dataFinalizacao || os.dataFinalizacao || now;
                    updates.tempoProducaoMinutos = differenceInMinutes(
                        parseISO(finalizationDate),
                        parseISO(os.dataInicioProducao)
                    );
                } catch (error) {
                     console.error("Error calculating production time for OS:", os.numero, error);
                     updates.tempoProducaoMinutos = -1; // Indicate error or invalid dates
                }
              }
            }

            return { ...os, ...updates };
          }),
        })),

      getOSById: (osId) => get().osList.find((os) => os.id === osId),

      duplicateOS: (osId: string) => {
        const osToDuplicate = get().osList.find(os => os.id === osId);
        if (osToDuplicate) {
          const currentOsNumber = get().nextOsNumber;
          const duplicatedOS: OS = {
            ...osToDuplicate,
            id: crypto.randomUUID(),
            numero: generateOSNumero(currentOsNumber),
            dataAbertura: new Date().toISOString(),
            status: OSStatus.NA_FILA, // Duplicates start in NA_FILA
            dataFinalizacao: undefined, // Clear finalization date
            programadoPara: undefined, // Clear programmed date on duplication
            dataInicioProducao: undefined, // Clear time tracking fields
            tempoProducaoMinutos: undefined, // Clear time tracking fields
          };
          set((state) => ({
            osList: [...state.osList, duplicatedOS],
            nextOsNumber: currentOsNumber + 1,
            // Partner list remains unchanged on duplication
          }));
          // Removed duplicate toast
          console.log(`OS "${duplicatedOS.projeto}" duplicada com sucesso. Novo número: ${duplicatedOS.numero}.`);
        }
      },

      toggleUrgent: (osId: string) => {
        set((state) => ({
          osList: state.osList.map((os) =>
            os.id === osId ? { ...os, isUrgent: !os.isUrgent } : os
          ),
        }));
        const updatedOS = get().osList.find(os => os.id === osId);
        if (updatedOS) {
           // Removed toggle urgent toast
           console.log(`A OS "${updatedOS.projeto}" foi ${updatedOS.isUrgent ? "marcada como urgente" : "desmarcada como urgente"}.`);
        }
      },

      // --- Partner Actions ---
      getPartnerById: (partnerId) => get().partners.find(p => p.id === partnerId),

      getPartnerByName: (partnerName) => get().partners.find(p => p.name.toLowerCase() === partnerName.toLowerCase()),

      addPartner: (partnerData) => {
        // Prevent adding duplicates by name (case-insensitive)
         const existingPartner = get().getPartnerByName(partnerData.name);
         if (existingPartner) {
            console.warn(`Partner "${partnerData.name}" already exists.`);
            return existingPartner;
         }
        const newPartner: Partner = {
          id: crypto.randomUUID(),
          name: partnerData.name.trim(),
        };
        set((state) => ({
          partners: [...state.partners, newPartner].sort((a, b) => a.name.localeCompare(b.name)),
        }));
        console.log(`Partner "${newPartner.name}" adicionado.`);
        return newPartner;
      },

      updatePartner: (updatedPartner) => {
         set((state) => ({
          partners: state.partners.map((partner) =>
            partner.id === updatedPartner.id ? { ...partner, name: updatedPartner.name.trim() } : partner
          ).sort((a, b) => a.name.localeCompare(b.name)),
        }));
        console.log(`Partner "${updatedPartner.name}" atualizado.`);
      },

      deletePartner: (partnerId) => {
        const partnerToDelete = get().getPartnerById(partnerId);
        if (partnerToDelete) {
            set((state) => ({
                partners: state.partners.filter((partner) => partner.id !== partnerId),
            }));
            console.log(`Partner "${partnerToDelete.name}" removido.`);
            // Note: This doesn't check if the partner is used in existing OS.
            // Might need adjustments if deleting used partners should be prevented or handled differently.
        }
      },

      // --- Client Actions ---
       getClientById: (clientId) => get().clients.find(c => c.id === clientId),

      addClient: (clientData) => {
        // Prevent adding duplicates by name (case-insensitive)
        const clientExists = get().clients.some(c => c.name.toLowerCase() === clientData.name.trim().toLowerCase());
        if (clientExists) {
            console.warn(`Client "${clientData.name}" already exists.`);
            // Optionally return the existing client
            return get().clients.find(c => c.name.toLowerCase() === clientData.name.trim().toLowerCase())!;
        }

        const newClient: Client = {
          id: crypto.randomUUID(),
          name: clientData.name.trim(),
        };
        set((state) => ({
          clients: [...state.clients, newClient].sort((a, b) => a.name.localeCompare(b.name)),
        }));
        console.log(`Cliente "${newClient.name}" adicionado.`);
        return newClient;
      },

      updateClient: (updatedClient) => {
         set((state) => ({
          clients: state.clients.map((client) =>
            client.id === updatedClient.id ? { ...client, name: updatedClient.name.trim() } : client
          ).sort((a, b) => a.name.localeCompare(b.name)),
        }));
        console.log(`Cliente "${updatedClient.name}" atualizado.`);
      },

      deleteClient: (clientId) => {
        const clientToDelete = get().getClientById(clientId);
        if (clientToDelete) {
            set((state) => ({
                clients: state.clients.filter((client) => client.id !== clientId),
            }));
            console.log(`Cliente "${clientToDelete.name}" removido.`);
            // Note: This doesn't check if the client is used in existing OS.
            // You might want to add a check or prevent deletion if used.
        }
      },


    }),
    {
      name: 'freelaos-storage-v7-time-tracking', // Updated storage key name for potential migration
      storage: createJSONStorage(() => localStorage),
       // Define parts of state to include/exclude if needed
       // partialize: (state) => ({ osList: state.osList, nextOsNumber: state.nextOsNumber, partners: state.partners, clients: state.clients }),
       // Versioning can be added here if schema changes significantly
       version: 7, // Increment version
       // migrate: (persistedState, version) => { ... migration logic ... },
    }
  )
);

// --- Migration logic example (if needed in the future) ---
// migrate: (persistedState: any, version: number) => {
//   if (version < 7) {
//     // Add new fields with default values if migrating from a version before time tracking
//     persistedState.osList = persistedState.osList.map((os: any) => ({
//       ...os,
//       dataInicioProducao: os.dataInicioProducao ?? undefined,
//       tempoProducaoMinutos: os.tempoProducaoMinutos ?? undefined,
//     }));
//   }
//   // Add more migration steps if needed
//   return persistedState as OSState;
// },
