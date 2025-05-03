import axios, { AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/AuthStore';

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }
  return config;
});

// Response interceptor for token refresh on 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/api/v1/refresh')
    ) {
      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await apiClient.post('/api/v1/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        Cookies.set('access_token', access_token, { sameSite: 'strict' });
        if (refresh_token) {
          Cookies.set('refresh_token', refresh_token, { sameSite: 'strict' });
        }

        useAuthStore.getState().setToken(access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (err) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;