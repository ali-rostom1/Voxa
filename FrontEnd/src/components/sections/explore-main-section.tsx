import { Video } from '@/types';
import { VideoCard } from '@/components/ui/video-card';
import { CategoryFilter } from '@/components/ui/category-filter';
import { FC, useEffect } from 'react';
import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import { SortingFilter } from '@/components/ui/sorting-filter';
import Pagination from '@/components/ui/pagination';



export const ExploreMainSection: FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sortValue, setSortValue] = useState<string>("Recent");
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(8);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/api/v1/categories');
                const data = response.data.data.data.map((category: any) => (
                    category.name
                ));
                setCategories(data || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        }
        fetchCategories();

    }, []);
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setIsLoading(true);
                setError("");
                const response = await apiClient.post('/api/v1/videos/filter',{
                    page: page,
                    ...(selectedCategory !== "All" && { category_name: selectedCategory }),
                    order_by: sortValue,
                    per_page:perPage,
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
                    setTotalPages(Math.ceil(response.data.data.total/perPage));
                    console.log(totalPages)
                    setPage(response.data.data.current_page);
                    console.log(page);
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
    , [sortValue,selectedCategory,page]);
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
                <CategoryFilter categories={categories} activeCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
                <SortingFilter onChange={setSortValue} selected={sortValue} setSelected={setSortValue}/>
                </div>
                <div className="flex justify-center items-center h-[70vh]">
                    <p>No videos found</p>
                </div>
            </section>
        );
    }
    return (
        <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-full">
            <div className="flex items-center justify-between mb-6">
                <CategoryFilter categories={categories} activeCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

                <SortingFilter onChange={setSortValue} selected={sortValue} setSelected={setSortValue}/>
                
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
                ))}
            </div>
            <Pagination className='mt-5' currentPage={page} onPageChange={setPage} totalPages={totalPages}></Pagination>
        </section>
    );
}