"use client"

import { useEffect, useState } from "react"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import apiClient from "@/lib/apiClient"
import { Video } from "@/types";
import { MainSection } from "@/components/sections/main-section";
export default function Home() {

  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {

    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await apiClient.get('/api/v1/videos');
        if (response.status === 201) {
          const data = response.data.data.data.map((video : any) => ({
            id: video.id,
            title: video.title,
            user: video.user.name,
            thumbnail: video.thumbnail_path,
            views: video.views_count,
            uploadTime: video.created_at,
            duration: video.duration,
            channelAvatar: video.user.pfp_path,
          }));
          setVideos(data || []);
        } else {
          setError("Failed to fetch videos");
        }
      } catch (err : any) {
        setError(err.message || "Failed to fetch videos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();

  }, []);

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </DefaultLayout>
    );
  }

  if (videos.length === 0) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-screen">
          <p>No videos available</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
        <MainSection/>
    </DefaultLayout>
  );
}