'use client';

import { SideBar } from '@/components/shared/SideBar';
import { VoxaHeader } from '@/components/shared/header';
import { useSidebarStore } from '@/stores/SideBarState';

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const { isMobile, sidebarOpen, collapsed } = useSidebarStore();

  return (
    <div className="flex min-h-screen">
      {!isMobile || sidebarOpen ? (
        <SideBar />
      ) : null}
      <div className="flex-1 flex flex-col">
        <VoxaHeader />
        <main className={`flex-1 overflow-y-auto p-4 ${!isMobile && !collapsed ? 'ml-8' : !isMobile && collapsed ? '' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};