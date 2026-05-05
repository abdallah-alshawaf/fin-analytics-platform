import create from 'zustand';
import { persist } from 'zustand/middleware';

export type PageId = 'dashboard' | 'accounts' | 'transactions' | 'analytics' | 'settings';
export type ThemeMode = 'light' | 'dark';

type State = {
  accessToken: string | null;
  selectedAccountId: string | null;
  activePage: PageId;
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  setAccessToken: (t: string | null) => void;
  setSelectedAccountId: (id: string | null) => void;
  setActivePage: (page: PageId) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  clearSession: () => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      accessToken: null,
      selectedAccountId: null,
      activePage: 'dashboard',
      theme: 'light',
      sidebarCollapsed: false,
      setAccessToken: (t) => set(() => ({ accessToken: t })),
      setSelectedAccountId: (id) => set(() => ({ selectedAccountId: id })),
      setActivePage: (page) => set(() => ({ activePage: page })),
      setTheme: (theme) => set(() => ({ theme })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      clearSession: () => set(() => ({ accessToken: null, selectedAccountId: null, activePage: 'dashboard' }))
    }),
    { name: 'portfolio-store' }
  )
);

export default useStore;
