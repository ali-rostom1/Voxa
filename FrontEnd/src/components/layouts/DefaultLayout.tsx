'use client';

import { SideBar } from '@/components/shared/SideBar';
import { VoxaHeader } from '@/components/shared/header';

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">      
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