import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OS, CreateOSData } from '@/lib/types';
import { OSStatus } from '@/lib/types';

interface OSState {
  osList: OS[];
  nextOsNumber: number;
  addOS: (data: CreateOSData) => OS;
  updateOS: (updatedOS: OS) => void;
  updateOSStatus: (osId: string, newStatus: OSStatus) => void;
  // deleteOS: (osId: string) => void; // Not implemented in minimal version
  getOSById: (osId: string) => OS | undefined;
  setInitialData: (data: OS[], nextNumber: number) => void; // For loading initial/mock data
}

const generateOSNumero = (num: number): string => `OS-${String(num).padStart(3, '0')}`;

// Initial mock data
const initialMockOS: OS[] = [
  { 
    id: '1', 
    numero: generateOSNumero(1), 
    cliente: 'Tech Solutions Inc.', 
    projeto: 'Website Redesign', 
    observacoes: 'Initial consultation and requirements gathering. Client needs a modern look and feel.',
    status: OSStatus.AGUARDANDO_CLIENTE, 
    dataAbertura: new Date(2023, 10, 15).toISOString(), 
    isUrgent: false 
  },
  { 
    id: '2', 
    numero: generateOSNumero(2), 
    cliente: 'Coffee Corner', 
    projeto: 'Mobile App Dev', 
    observacoes: 'Phase 1: UI/UX design mockups. Focus on user-friendly interface.',
    status: OSStatus.EM_PRODUCAO, 
    dataAbertura: new Date(2023, 11, 1).toISOString(), 
    isUrgent: true
  },
  { 
    id: '3', 
    numero: generateOSNumero(3), 
    cliente: 'Global Logistics', 
    projeto: 'CRM Integration', 
    observacoes: 'Awaiting API keys and documentation from partner company.',
    status: OSStatus.AGUARDANDO_PARCEIRO, 
    dataAbertura: new Date().toISOString(), 
    isUrgent: false
  },
  { 
    id: '4', 
    numero: generateOSNumero(4), 
    cliente: 'Eco Green Ltd.', 
    projeto: 'Branding Package', 
    observacoes: 'Complete branding guide delivered and approved by client.',
    status: OSStatus.FINALIZADO, 
    dataAbertura: new Date(2023, 9, 5).toISOString(), 
    dataFinalizacao: new Date(2023, 9, 25).toISOString(),
    isUrgent: false 
  },
  { 
    id: '5', 
    numero: generateOSNumero(5), 
    cliente: 'Tech Solutions Inc.', 
    projeto: 'Marketing Campaign', 
    observacoes: 'Planning social media strategy for Q1. Urgent deadline.',
    status: OSStatus.EM_PRODUCAO, 
    dataAbertura: new Date().toISOString(), 
    isUrgent: true 
  },
];

export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      osList: initialMockOS, // Start with mock data if localStorage is empty or item not found
      nextOsNumber: initialMockOS.length + 1, // Start next number after mock data
      
      setInitialData: (data, nextNumber) => set({ osList: data, nextOsNumber: nextNumber }),

      addOS: (data) => {
        const currentOsNumber = get().nextOsNumber;
        const newOS: OS = {
          ...data,
          id: crypto.randomUUID(),
          numero: generateOSNumero(currentOsNumber),
          dataAbertura: new Date().toISOString(),
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
    }),
    {
      name: 'freelaos-storage', // name of item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default uses localStorage
    }
  )
);

// The manual initialization block below was removed as it conflicted with
// the `persist` middleware's own hydration logic and was likely causing the
// infinite loading state. `persist` will use `initialMockOS` if `freelaos-storage`
// is not found in localStorage.
