import { DefaultLayout } from "@/components/layouts/DefaultLayout";
import { ProtectedRoute } from "@/components/protected-route";
import { Suspense } from "react";





export default function WatchPlaylist(){
    return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>}>
        <ProtectedRoute isPublic>
            <DefaultLayout>
                <>
                </>
            </DefaultLayout>
        </ProtectedRoute>
    </Suspense>
    )
}