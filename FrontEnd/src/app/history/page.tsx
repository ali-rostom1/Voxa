"use client"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import { ProtectedRoute } from "@/components/protected-route"
import { HistorySection } from "@/components/sections/history-section"
import { Suspense } from "react"


export default function History(){
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>}>
                <ProtectedRoute >
                    <DefaultLayout>
                        <HistorySection/>
                    </DefaultLayout>
                </ProtectedRoute>
        </Suspense>
    )
}