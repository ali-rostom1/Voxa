"use client"
import { DefaultLayout } from "@/components/layouts/DefaultLayout";
import { ProtectedRoute } from "@/components/protected-route";
import {ProfileSection} from "@/components/sections/profile-section";
import { useParams } from "next/navigation";
import { Suspense } from "react";




export default function Profile(){
    const {id} = useParams();
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>}>
            <ProtectedRoute isPublic>
                <DefaultLayout>
                    <ProfileSection id={id as string}/>
                </DefaultLayout>
            </ProtectedRoute>
        </Suspense>
    );

}