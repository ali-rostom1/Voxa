"use client"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import { ExploreMainSection } from "@/components/sections/explore-main-section"
import VideoPlayer from "@/components/ui/video-player"
import apiClient from "@/lib/apiClient"
import { Video } from "@/types"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import {WatchOther} from "@/components/sections/watch-other"
import { VideoDetails } from "@/components/ui/video-details"

export default function Watch() {
    const {id} = useParams();
    const [video, setVideo] = useState<Video | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLiked,setIsLiked] = useState(false);
    const [isDisliked,setIsDisliked] = useState(false);
    const [isSaved,setIsSaved] = useState(false);
    const [isSubscribed,setIsSubscribed] = useState(false);
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await apiClient.get(`/api/v1/videos/${id}`);
                if (response.status === 201) {
                    const video = response.data.data;
                   const data = {
                        id: video.id,
                        title: video.title,
                        description: video.description,
                        category_name: video.category.name,
                        user: video.user.name,
                        thumbnail: video.thumbnail_path,
                        manifest_URL: video.manifest_url, 
                        views: video.views_count,
                        uploadTime: video.created_at,
                        duration: video.duration,
                        channelAvatar: video.user.pfp_path,
                    }
                    setVideo(data || null);

                } else {
                    console.error("Failed to fetch video");
                }
            } catch (err : any) {
                console.error(err.message || "Failed to fetch video");
            }
        };
        const fetchVideos = async () => {
            try {
                const response = await apiClient.post('/api/v1/videos/filter',{
                    category_name: video?.category_name,
                    order_by: "Views",
                });
                if (response.status === 200) {
                    const data = response.data.data.data.map((video: any) => ({
                        id: video.id,
                        title: video.title,
                        category_name: video.category.name,
                        description: video.description,
                        user: video.user.name,
                        thumbnail: video.thumbnail_path,
                        views: video.views_count,
                        uploadTime: video.created_at,
                        duration: video.duration,
                        channelAvatar: video.user.pfp_path,
                    }));
                    setVideos(data || []);
                } else {
                    console.error("Failed to fetch videos");
                }
            } catch (err : any) {
                console.error(err.message || "Failed to fetch videos");
            }
        };
        
        fetchVideo();

        fetchVideos();
    },[id]);
    useEffect(() => {
        if (video) {
            const fetchReaction = async () => {
                const response = await apiClient.get(`/api/v1/videos/${id}/my-reactions`);
                if (response.status === 200) {
                    const data = response.data.data;
                    setIsLiked(data.is_liked);
                    setIsDisliked(data.is_disliked);
                    setIsSaved(data.is_saved);
                    setIsSubscribed(data.is_subscribed);
                } else {
                    console.error("Failed to fetch reactions");
                }
            }
        }
    });
  return (
    <DefaultLayout>
        <div className="grid lg:grid-cols-3 sm:grid-cols-1 p-4">
            <div className="col-span-2 pr-4">
                {video && (
                    <>
                        <VideoPlayer videoSrc={video.manifest_URL} />
                        {/* <VideoDetails video={video} isDisliked={} isLiked={} isSaved={} isSubscribed={} onDislike={} onLike={} onSave={} onSubscribe={} /> */}
                    </>
                )
                }
            </div>
            <div className="col-span-1 pl-4">
                <WatchOther videos={videos}/>
            </div>
        </div>
    </DefaultLayout>
  )
}