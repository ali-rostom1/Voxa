'use client';

import { SidebarStateInitializer } from '@/app/components/SidebarStateInitializer';
import { SideBar } from '@/app/components/shared/SideBar';
import { VoxaHeader } from '@/app/components/shared/header';

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <SidebarStateInitializer />
      
      <SideBar />
      
      <div className="flex-1 flex flex-col">
        <VoxaHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};