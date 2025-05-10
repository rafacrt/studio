import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OS, CreateOSData } from '@/lib/types';
import { OSStatus } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface OSState {
  osList: OS[];
  nextOsNumber: number;
  addOS: (data: CreateOSData) => OS;
  updateOS: (updatedOS: OS) => void;
  updateOSStatus: (osId: string, newStatus: OSStatus) => void;
  getOSById: (osId: string) => OS | undefined;
  setInitialData: (data: OS[], nextNumber: number) => void;
  duplicateOS: (osId: string) => void;
  toggleUrgent: (osId: string) => void;
}

const generateOSNumero = (num: number): string => String(num).padStart(6, '0');

// Initial mock data
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
    isUrgent: true
  },
  { 
    id: '3', 
    numero: generateOSNumero(3), 
    cliente: 'Logística Global Express', 
    projeto: 'Integração CRM', 
    tarefa: 'Aguardar chaves de API e documentação do parceiro.',
    observacoes: 'Aguardando chaves de API e documentação da empresa parceira.',
    status: OSStatus.AGUARDANDO_PARCEIRO, 
    dataAbertura: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
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
    isUrgent: false 
  },
  { 
    id: '5', 
    numero: generateOSNumero(5), 
    cliente: 'Soluções Tech Ltda.', 
    projeto: 'Campanha de Marketing Digital', 
    tarefa: 'Planejamento da estratégia de mídia social para Q1.',
    observacoes: 'Planejando estratégia de mídia social para o primeiro trimestre. Prazo urgente.',
    status: OSStatus.NA_FILA, 
    dataAbertura: new Date().toISOString(), 
    isUrgent: true
  },
];

export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      osList: initialMockOS, 
      nextOsNumber: initialMockOS.length + 1,
      
      setInitialData: (data, nextNumber) => set({ osList: data, nextOsNumber: nextNumber }),

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
          isUrgent: data.isUrgent || false,
        };
        set((state) => ({
          osList: [...state.osList, newOS],
          nextOsNumber: currentOsNumber + 1,
        }));
        return newOS;
      },

      updateOS: (updatedOS) =>
        set((state) => ({
          osList: state.osList.map((os) => (os.id === updatedOS.id ? updatedOS : os)),
        })),
      
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
            // isUrgent can be copied or reset, let's copy for now
          };
          set((state) => ({
            osList: [...state.osList, duplicatedOS],
            nextOsNumber: currentOsNumber + 1,
          }));
          toast({
            title: "OS Duplicada",
            description: `OS "${duplicatedOS.projeto}" duplicada com sucesso. Novo número: ${duplicatedOS.numero}.`,
          });
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
          toast({
            title: `OS ${updatedOS.isUrgent ? "Marcada como Urgente" : "Desmarcada como Urgente"}`,
            description: `A OS "${updatedOS.projeto}" foi ${updatedOS.isUrgent ? "marcada como urgente" : "desmarcada como urgente"}.`,
          });
        }
      },
    }),
    {
      name: 'freelaos-storage-v2', // Changed name to avoid conflicts with old structure if any
      storage: createJSONStorage(() => localStorage),
    }
  )
);
