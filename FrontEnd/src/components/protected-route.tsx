'use client';

import { useEffect, FC, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/AuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  isPublic?: boolean;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, isPublic = false }) => {
  const { isAuthenticated, loading, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    checkAuth().catch((err) => {
      console.error('[ProtectedRoute] checkAuth failed:', err);
    });
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && (pathname === '/login' || pathname === '/sign-up')) {
        router.push('/');
        return;
    }
    if (!isAuthenticated && !isPublic && pathname !== '/login') {
      const redirect = encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams}` : ''}`);
      router.push(`/login?redirect=${redirect}`);
    }
  }, [loading, isAuthenticated, isPublic, pathname, searchParams, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>;
  }

  if (!isAuthenticated && !isPublic) {
    return null;
  }

  return <>{children}</>;
};