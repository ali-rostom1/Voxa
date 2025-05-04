"use client"
import { DefaultLayout } from "@/components/layouts/DefaultLayout";
import { ProtectedRoute } from "@/components/protected-route";
import { PlaylistSection } from "@/components/sections/playlists-section";
import { Suspense } from "react";





export default function Playlist(){
    return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>}>
        <ProtectedRoute isPublic>
            <DefaultLayout>
                <PlaylistSection />
            </DefaultLayout>
        </ProtectedRoute>
    </Suspense>
    )
}