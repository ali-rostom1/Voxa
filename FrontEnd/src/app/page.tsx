"use client"

import { useEffect, useState } from "react"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import apiClient from "@/lib/apiClient"
import { Video } from "@/types";
import { MainSection } from "@/components/sections/main-section";
export default function Home() {

  return (
    <DefaultLayout>
        <MainSection/>
    </DefaultLayout>
  );
}