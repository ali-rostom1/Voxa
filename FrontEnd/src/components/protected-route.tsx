"use Client"

import { useAuthStore } from "@/stores/AuthStore";
import { useRouter } from "next/navigation";
import { FC, ReactNode, useEffect } from "react"



interface ProtectedRouteProps{
    children: ReactNode;
}


export const ProtectedRoute: FC<ProtectedRouteProps> = ({children}) => {
    const {isAuthenticated,loading,checkAuth} = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        checkAuth()
    },[checkAuth]);

    useEffect(()=>{
        if(!loading && !isAuthenticated){
            router.push('login');
        }
    },[loading,isAuthenticated,router]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    if (!isAuthenticated) {
        return null;
    }
    return <>{children}</>;
}