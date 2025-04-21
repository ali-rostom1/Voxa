'use client';

import { useEffect } from 'react';
import { useSidebarStore } from '@/stores/SideBarState';

export const SidebarStateInitializer = () => {
  const checkMobile = useSidebarStore((state) => state.checkMobile);

  useEffect(() => {
    checkMobile();
    
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkMobile]);

  return null;
};