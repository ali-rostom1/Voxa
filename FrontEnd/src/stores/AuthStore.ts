import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import apiClient from '@/lib/apiClient';
import { UserProfile } from '@/types';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  setToken: (token: string) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      loading: true,
      login: (token: string, user: UserProfile) =>
        set({ token, isAuthenticated: true, user, loading: false }),
      logout: () => set({ token: null, isAuthenticated: false, user: null, loading: false }),
      setToken: (token: string) => set({ token, isAuthenticated: true, loading: false }),
      checkAuth: async () => {
        set({ loading: true });
        try {
          const token = Cookies.get('access_token');
          if (token) {
            const response = await apiClient.get('/api/v1/me'); 
            const userData = response.data.data;
            const user: UserProfile = {
                id: userData.id,
                name: userData.name || '',
                email: userData.email,
                pfp_path: userData.pfp_path || null,
              };
    
            set({
              token,
              isAuthenticated: true,
              user: user,
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ token: null, isAuthenticated: false, user: null, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);