import { useSidebarStore } from "@/stores/SideBarState";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedVideos } from "@/components/sections/featured-videos";
import { CategoriesSection } from "@/components/sections/categories-section";
import { TrendingVideos } from "@/components/sections/trending-videos";
import { Category, Video } from "@/types";
import { useState } from "react";
import apiClient from "@/lib/apiClient";



export const MainSection: FC= () => {
    const router = useRouter();
    const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
    const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    

    

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [featuredResponse, trendingResponse, categoriesResponse] = await Promise.all([
            apiClient.get('/api/v1/videos/featured/3'),
            apiClient.get('/api/v1/videos/trending/3'),
            apiClient.get('/api/v1/categories')
          ]);
          const featuringData = featuredResponse.data.data.data.map((video: any) => ({
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
        
  
        setFeaturedVideos(featuringData || []);
        const trendingData = trendingResponse.data.data.data.map((video: any) => ({
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
        setTrendingVideos(trendingData || []);

        const categoriesData = categoriesResponse.data.data.data.map((category: any) => ({
            id: category.id,
            title: category.name,
            count: category.videos_count,
            color: category.color,
            icon: category.icon, 
        }));

        setCategories(categoriesData || []);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, []);
    
  
    const handleGetStarted = () => {
      router.push('/explore');
    };
  
    return (
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <HeroSection onGetStarted={handleGetStarted} />
          <FeaturedVideos videos={featuredVideos} />
          <CategoriesSection categories={categories} />
          <TrendingVideos videos={trendingVideos} />
        </div>
      </main>
    );
};
  
