import axios from "axios"
import Cookies from "js-cookie"
import Router from "next/router"



const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});


apiClient.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    if(config.data instanceof FormData){
        config.headers["Content-Type"] = 'multipart/form-data';
    }
    return config;
})

apiClient.interceptors.response.use(
    (response)=> response,
    async (error) => {
        const originalRequest = error.config;
    
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        
        try {
            const refreshToken = Cookies.get('refresh_token');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}api/v1/refresh`, {
                refresh_token: refreshToken
            });
            
            Cookies.set('access_token', response.data.access_token);
            Cookies.set('refresh_token', response.data.refresh_token);
            localStorage.removeItem('user');

            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return apiClient(originalRequest);
        } catch (err) {
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            localStorage.removeItem('user');
            Router.push('/login');
            return Promise.reject(err);
        }
        }
        return Promise.reject(error);
    }
)
export default apiClient;