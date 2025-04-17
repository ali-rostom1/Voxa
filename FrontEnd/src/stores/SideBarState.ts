import { create } from 'zustand';

interface SidebarState {
  collapsed: boolean;
  isMobile: boolean;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  checkMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  isMobile: false,
  sidebarOpen: false,

  toggleSidebar: () => set((state) => {
    if (state.isMobile) {
      return { sidebarOpen: !state.sidebarOpen, collapsed: false };
    } else {
      return { collapsed: !state.collapsed };
    }
  }),

  closeSidebar: () => set((state) => {
    if (state.isMobile) {
      return { sidebarOpen: false };
    }
    return {};
  }),

  checkMobile: () => {
    const isMobile = window.innerWidth < 768;
    set({
      isMobile,
      collapsed: isMobile ? true : false,
      sidebarOpen: isMobile ? false : true
    });
  }
}));