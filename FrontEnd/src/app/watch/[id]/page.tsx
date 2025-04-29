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
                    const data = response.data;
                    setIsLiked(data.isLiked);
                    setIsDisliked(data.is_disLiked);
                    setIsSaved(data.isSaved);
                    setIsSubscribed(data.isSubscribed);
                } else {
                    console.error("Failed to fetch reactions");
                }
            }
            fetchReaction();
        }
    },[video]);
    const handleLike = async () => {
        try {
            setIsLiked(!isLiked);
            setIsDisliked(false);
            const response = await apiClient.post(`/api/v1/videos/${id}/like`);
            if (response.status !== 200) {
                setIsLiked(!isLiked);
                console.error("Failed to like video");
            }
        } catch (err : any) {
            console.error(err.message || "Failed to like video");
        }
    };
    const handleDislike = async () => {
        try {
            setIsDisliked(!isDisliked);
            setIsLiked(false);
            const response = await apiClient.post(`/api/v1/videos/${id}/dislike`);
            if (response.status !== 200) {
                setIsDisliked(!isDisliked);
                console.error("Failed to dislike video");
            }
        }
        catch (err : any) {
            console.error(err.message || "Failed to dislike video");
        }
    }
    const handleSave = async () => {
        try {
            setIsSaved(!isSaved);
            const response = await apiClient.get(`/api/v1/videos/${id}/save`);
            if (response.status !== 200) {
                setIsSaved(!isSaved);
                console.error("Failed to save video");
            } 
        } catch (err : any) {
            console.error(err.message || "Failed to save video");
        }
    }
    const handleSubscribe = async () => {
        try {
            setIsSubscribed(!isSubscribed);
            const response = await apiClient.get(`/api/v1/videos/${id}/subscribe`);
            if (response.status !== 200) {
                setIsSubscribed(!isSubscribed);
                console.error("Failed to subscribe to channel");
            }
        } catch (err : any) {
            console.error(err.message || "Failed to subscribe to channel");
        }
    }
  return (
    <DefaultLayout>
        <div className="grid lg:grid-cols-3 sm:grid-cols-1 p-4">
            <div className="col-span-2 pr-4">
                {video && (
                    <>
                        <VideoPlayer videoSrc={video.manifest_URL} />
                        <VideoDetails video={video} isDisliked={isDisliked} isLiked={isLiked} isSaved={isSaved} isSubscribed={isSubscribed} onDislike={handleDislike} onLike={handleLike} onSave={handleSave} onSubscribe={handleSubscribe} />
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