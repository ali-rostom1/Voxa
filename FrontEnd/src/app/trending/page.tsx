"use client"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import { ProtectedRoute } from "@/components/protected-route"
import { TrendingMainSection } from "@/components/sections/trending-main-section"
import { Suspense } from "react"
export default function Explore() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>}>
            <ProtectedRoute isPublic>
                <DefaultLayout>
                    <TrendingMainSection/>
                </DefaultLayout>
            </ProtectedRoute>
    </Suspense>
  )
}