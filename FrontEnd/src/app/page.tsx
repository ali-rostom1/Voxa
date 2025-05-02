"use client"

import { useEffect, useState } from "react"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import apiClient from "@/lib/apiClient"
import { Video } from "@/types";
import { MainSection } from "@/components/sections/main-section";
import { ProtectedRoute } from "@/components/protected-route";
import { Suspense } from 'react';

export default function Home() {

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>}>
      <ProtectedRoute isPublic>
        <DefaultLayout>
            <MainSection/>
        </DefaultLayout>
      </ProtectedRoute>
    </Suspense>
  );
}