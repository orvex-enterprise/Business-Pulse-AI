import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface DataConnection {
  id: string;
  name: string;
  type: string;
  connectedAt: string;
}

interface SettingsState {
  companyName: string;
  industry: string;
  country: string;
  phoneNumber: string;
  aiEnabled: boolean;
  aiFrequency: string;
  connections: DataConnection[];
  isDbConnected: boolean;
  connectionKey: string | null;
  setCompanyDetails: (details: { companyName?: string; industry?: string; country?: string, phoneNumber?: string }) => void;
  setAISettings: (settings: { aiEnabled?: boolean; aiFrequency?: string }) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  addConnection: (connection: DataConnection) => void;
  removeConnection: (id: string) => void;
  setIsDbConnected: (connected: boolean, key?: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      companyName: '',
      industry: '',
      country: '',
      phoneNumber: '',
      aiEnabled: true,
      aiFrequency: 'realtime',
      connections: [],
      isDbConnected: false,
      connectionKey: null,
      setCompanyDetails: (details) => set((state) => ({ ...state, ...details })),
      setAISettings: (settings) => set((state) => ({ ...state, ...settings })),
      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      addConnection: (connection) => set((state) => ({ connections: [...state.connections, connection] })),
      removeConnection: (id) => set((state) => ({ connections: state.connections.filter((c) => c.id !== id) })),
      setIsDbConnected: (connected, key) => set((state) => ({ isDbConnected: connected, connectionKey: key || state.connectionKey })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

