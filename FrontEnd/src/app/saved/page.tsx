"use client"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import { ProtectedRoute } from "@/components/protected-route"
import { SavedMainSection } from "@/components/sections/saved-main-section"
import { Suspense } from "react"
export default function Saved() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>}>
            <ProtectedRoute >
                <DefaultLayout>
                    <SavedMainSection/>
                </DefaultLayout>
            </ProtectedRoute>
    </Suspense>
  )
}