import { create } from 'zustand'

export type DatabaseType = 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Supabase' | 'Firebase' | 'CSV Upload' | 'Excel Upload' | 'REST API'
export type MonitoringPreference = 'Inventory' | 'Trends' | 'Stocks' | 'Finance'

export interface OnboardingState {
  step: number
  companyName: string
  businessType: string
  industry: string
  country: string
  phoneNumber: string
  databaseType: DatabaseType | ''
  databaseConnectionStr: string
  monitoring: MonitoringPreference[]
  setStep: (step: number) => void
  setCompanyDetails: (details: Partial<OnboardingState>) => void
  setDatabaseType: (type: DatabaseType) => void
  setDatabaseConnectionStr: (str: string) => void
  setPhoneNumber: (phoneNumber: string) => void
  toggleMonitoring: (pref: MonitoringPreference) => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  companyName: '',
  businessType: '',
  industry: '',
  country: '',
  phoneNumber: '',
  databaseType: '',
  databaseConnectionStr: '',
  monitoring: [],
  setStep: (step) => set({ step }),
  setCompanyDetails: (details) => set((state) => ({ ...state, ...details })),
  setDatabaseType: (type) => set({ databaseType: type }),
  setDatabaseConnectionStr: (str) => set({ databaseConnectionStr: str }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  toggleMonitoring: (pref) =>
    set((state) => ({
      monitoring: state.monitoring.includes(pref)
        ? state.monitoring.filter((p) => p !== pref)
        : [...state.monitoring, pref],
    })),
}))
