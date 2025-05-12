
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OS, CreateOSData } from '@/lib/types';
import { OSStatus } from '@/lib/types';
// Removed toast import

interface OSState {
  osList: OS[];
  nextOsNumber: number;
  partners: string[]; // Added list of unique partners
  addOS: (data: CreateOSData) => OS;
  updateOS: (updatedOS: OS) => void;
  updateOSStatus: (osId: string, newStatus: OSStatus) => void;
  getOSById: (osId: string) => OS | undefined;
  setInitialData: (data: OS[], nextNumber: number, partners: string[]) => void; // Updated signature
  duplicateOS: (osId: string) => void;
  toggleUrgent: (osId: string) => void;
  addPartner: (partnerName: string) => void; // Added action to add a new partner
}

const generateOSNumero = (num: number): string => String(num).padStart(6, '0');

// Function to extract unique partners from OS list
const getUniquePartners = (osList: OS[]): string[] => {
  const partnerSet = new Set<string>();
  osList.forEach(os => {
    if (os.parceiro) {
      partnerSet.add(os.parceiro);
    }
  });
  return Array.from(partnerSet).sort(); // Sort alphabetically
};

// Helper to get date string for 'programadoPara' N days from now
const getDatePlusDays = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; // Return only YYYY-MM-DD
}

// Initial mock data - Added 'programadoPara'
const initialMockOS: OS[] = [
  {
    id: '1',
    numero: generateOSNumero(1),
    cliente: 'Soluções Tech Ltda.',
    parceiro: 'Design Criativo Co.',
    projeto: 'Redesenho do Website',
    tarefa: 'Coleta de requisitos e briefing inicial com o cliente.',
    observacoes: 'Consulta inicial e levantamento de requisitos. Cliente precisa de um visual moderno.',
    tempoTrabalhado: '2h reunião, 1h documentação',
    status: OSStatus.AGUARDANDO_CLIENTE,
    dataAbertura: new Date(2023, 10, 15, 10, 30).toISOString(),
    programadoPara: getDatePlusDays(7), // Programmed for 7 days from now
    isUrgent: false
  },
  {
    id: '2',
    numero: generateOSNumero(2),
    cliente: 'Café Aconchego',
    projeto: 'Desenvolvimento App Mobile',
    tarefa: 'Fase 1: Mockups de UI/UX.',
    observacoes: 'Fase 1: Mockups de design UI/UX. Foco em interface amigável.',
    tempoTrabalhado: '16h design',
    status: OSStatus.EM_PRODUCAO,
    dataAbertura: new Date(2023, 11, 1, 14, 0).toISOString(),
    programadoPara: getDatePlusDays(3), // Programmed for 3 days from now
    isUrgent: true
  },
  {
    id: '3',
    numero: generateOSNumero(3),
    cliente: 'Logística Global Express',
    parceiro: 'Integra Sys',
    projeto: 'Integração CRM',
    tarefa: 'Aguardar chaves de API e documentação do parceiro.',
    observacoes: 'Aguardando chaves de API e documentação da empresa parceira.',
    status: OSStatus.AGUARDANDO_PARCEIRO,
    dataAbertura: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    programadoPara: undefined, // Not programmed yet
    isUrgent: false
  },
  {
    id: '4',
    numero: generateOSNumero(4),
    cliente: 'Eco Verde Sustentável',
    projeto: 'Pacote de Branding',
    tarefa: 'Entrega final do manual da marca e aprovação.',
    observacoes: 'Guia completo de branding entregue e aprovado pelo cliente.',
    status: OSStatus.FINALIZADO,
    dataAbertura: new Date(2023, 9, 5, 9, 0).toISOString(),
    dataFinalizacao: new Date(2023, 9, 25, 17, 30).toISOString(),
    programadoPara: new Date(2023, 9, 24).toISOString().split('T')[0], // Was programmed for this date
    isUrgent: false
  },
  {
    id: '5',
    numero: generateOSNumero(5),
    cliente: 'Soluções Tech Ltda.',
    parceiro: 'Marketing Experts',
    projeto: 'Campanha de Marketing Digital',
    tarefa: 'Planejamento da estratégia de mídia social para Q1.',
    observacoes: 'Planejando estratégia de mídia social para o primeiro trimestre. Prazo urgente.',
    status: OSStatus.NA_FILA,
    dataAbertura: new Date().toISOString(),
    programadoPara: getDatePlusDays(14), // Programmed for 14 days from now
    isUrgent: true
  },
];

export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      osList: initialMockOS,
      nextOsNumber: initialMockOS.length + 1,
      partners: getUniquePartners(initialMockOS), // Initialize partners list

      setInitialData: (data, nextNumber, partners) => set({ osList: data, nextOsNumber: nextNumber, partners: partners }),

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
          programadoPara: data.programadoPara || undefined, // Add programadoPara
          isUrgent: data.isUrgent || false,
        };
        set((state) => ({
          osList: [...state.osList, newOS],
          nextOsNumber: currentOsNumber + 1,
          // Update partners if a new one was added
          partners: data.parceiro && !state.partners.includes(data.parceiro)
                      ? [...state.partners, data.parceiro].sort()
                      : state.partners,
        }));
        return newOS;
      },

      updateOS: (updatedOS) =>
        set((state) => {
             // Check if the partner was updated and is new
             const partnerIsNew = updatedOS.parceiro && !state.partners.includes(updatedOS.parceiro);
             return {
                 osList: state.osList.map((os) => (os.id === updatedOS.id ? updatedOS : os)),
                 partners: partnerIsNew
                             ? [...state.partners, updatedOS.parceiro!].sort()
                             : state.partners,
             };
        }),

      updateOSStatus: (osId, newStatus) =>
        set((state) => ({
          osList: state.osList.map((os) =>
            os.id === osId ? { ...os, status: newStatus, ...(newStatus === OSStatus.FINALIZADO && !os.dataFinalizacao && { dataFinalizacao: new Date().toISOString() }) } : os
          ),
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

      addPartner: (partnerName: string) => {
          set((state) => {
              if (partnerName && !state.partners.includes(partnerName)) { // Ensure partnerName is not empty
                  return { partners: [...state.partners, partnerName].sort() };
              }
              return {}; // No change if partner already exists or is empty
          });
      },
    }),
    {
      name: 'freelaos-storage-v4-schedule', // Updated storage key name for potential migration
      storage: createJSONStorage(() => localStorage),
       // Define parts of state to include/exclude if needed
       // partialize: (state) => ({ osList: state.osList, nextOsNumber: state.nextOsNumber, partners: state.partners }),
       // Versioning can be added here if schema changes significantly
       // version: 1,
       // migrate: (persistedState, version) => { ... migration logic ... },
    }
  )
);

