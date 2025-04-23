import { Video } from '@/types';
import { VideoCard } from '@/components/ui/video-card';
import { FC, useEffect } from 'react';
import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import { SectionHeader } from './section-header';



export const TrendingMainSection: FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setIsLoading(true);
                setError("");
                const response = await apiClient.get('/api/v1/videos/trending/8',{
                    
                });
                if (response.status === 200) {
                    const data = response.data.data.data.map((video: any) => ({
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
            } catch (err: any) {
                setError(err.message || "Failed to fetch videos");
            } finally {
                setIsLoading(false);
            }
        };
        fetchVideos();
    }
    , []);
    if (isLoading) {
        return (
            <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-center items-center h-screen">
                    <p>Loading...</p>
                </div>
            </section>
        );
    }
    if (error) {
        return (
            <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-center items-center h-screen">
                    <p className="text-red-500">{error}</p>
                </div>
            </section>
        );
    }
    if (videos.length === 0) {
        return (            
            <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                </div>
                <div className="flex justify-center items-center h-[70vh]">
                    <p>No videos found</p>
                </div>
            </section>
        );
    }
    return (
        <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <SectionHeader title="Top 8 in Trending" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {videos.map((video) => (
                <VideoCard key={video.id} video={video} size='large' />
                ))}
            </div>
        </section>
    );
}