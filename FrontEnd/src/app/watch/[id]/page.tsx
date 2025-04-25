"use client"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import { ExploreMainSection } from "@/components/sections/explore-main-section"
import VideoPlayer from "@/components/ui/video-player"
import { Video } from "lucide-react"

export default function Watch() {
  return (
    <DefaultLayout>
        <div className="mx-auto p-4">
            <VideoPlayer 
                videoSrc="https://d30vieonhtu0fc.cloudfront.net/uploads/videos/video_680baba60f20c/master.m3u8"
                poster=""
                onEnded={() => console.log('Video playback ended')}
            />
        </div>
    </DefaultLayout>
  )
}