"use client"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import { ProtectedRoute } from "@/components/protected-route"
import { LikedMainSection } from "@/components/sections/liked-main-section"
import { Suspense } from "react"
export default function Saved() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>}>
            <ProtectedRoute >
                <DefaultLayout>
                    <LikedMainSection/>
                </DefaultLayout>
            </ProtectedRoute>
    </Suspense>
  )
}