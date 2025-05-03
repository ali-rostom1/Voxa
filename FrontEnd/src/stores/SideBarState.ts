import { create } from 'zustand';

interface SidebarState {
  collapsed: boolean;
  isMobile: boolean;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
  sidebarOpen: false,

  toggleSidebar: () => set((state) => ({
    sidebarOpen: state.isMobile ? !state.sidebarOpen : true,
    collapsed: state.isMobile ? false : !state.collapsed,
  })),

  closeSidebar: () => set({ sidebarOpen: false }),
}));