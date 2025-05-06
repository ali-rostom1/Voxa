import { Video } from '@/types';
import { VideoCard } from '@/components/ui/video-card';
import { FC, useEffect } from 'react';
import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import { SectionHeader } from './section-header';
import Pagination from '../ui/pagination';



export const LikedMainSection: FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(8);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setIsLoading(true);
                setError("");
                const response = await apiClient.post(`/api/v1/videos/liked?page=${page}`,{
                    perPage:perPage
                });
                if (response.status === 200) {
                    const data = response.data.data.data.map((video: any) => ({
                        id: video.id,
                        title: video.title,
                        category_name: video.category.name,
                        description: video.description,
                        user: { 
                            id: video.user.id,
                            name: video.user.name,
                            email: video.user.email,
                            pfp_path: video.user.pfp_path,
                        },
                        thumbnail: video.thumbnail_path,
                        views: video.views_count,
                        uploadTime: video.created_at,
                        duration: video.duration,
                    }));
                    setVideos(data || []);
                    setTotalPages(Math.ceil(response.data.data.total/perPage));
                    setPage(response.data.data.current_page);
                    setVideos(data || []);
                } else {
                    setError("Failed to fetch videos");
                }
            } catch (err: any) {
                setError("Failed to fetch videos");
            } finally {
                setIsLoading(false);
            }
        };
        fetchVideos();
    }
    , [page]);
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
            <SectionHeader title="Liked Videos" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {videos.map((video) => (
                    <VideoCard key={video.id} video={video} size='large' />
                ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(page) => setPage(page)}/>
        </section>
    );
}