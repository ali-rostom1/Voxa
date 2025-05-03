import { RefreshCw, Section, Trash } from "lucide-react";
import { SectionHeader } from "./section-header";
import { useEffect, useState } from "react";
import { Video } from "@/types";
import apiClient from "@/lib/apiClient";
import { HorizontalVideoCard } from "../ui/horizontal-video-card";
import Swal from 'sweetalert2'
import { Trash2 } from 'lucide-react';
import Pagination from "../ui/pagination";




export const HistorySection = () => {
    const [videos,setVideos] = useState<Video[] | null>(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);
    const [isEmpty,setIsEmpty] = useState(false);
    const [isClearing,setIsClearing] = useState(false);
    const [isCleared,setIsCleared] = useState(false);
    const [page,setPage] = useState(1);
    const [perPage,setPerPage] = useState(5);
    const [totalPages,setTotalPages] = useState(1);

    useEffect(() => {
        try {
            const fetchVideos = async () => {
                const response = await apiClient.post('/api/v1/videos/history/me',{
                    page: page,
                    perPage: perPage,
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
                    setTotalPages(Math.ceil(response.data.data.total/perPage))
                    setVideos(data || []);
                    setLoading(false);
                } else {
                    setError(true);
                }
            };
            fetchVideos();
        }
        catch (err: any) {
            setError(true);
        }
        finally {
            setLoading(false);
        }
    }, [isCleared,page]);
    const handleClearHistory = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
          }).then(async (result) => {
            if (result.isConfirmed) {
                setIsClearing(true);
                const response = await apiClient.delete('/api/v1/videos/history/clear');
                if(response.status === 200) {
                    setVideos([]);
                    setIsClearing(false);
                    setIsCleared(true);
                    Swal.fire(
                        "Deleted!",
                        "Your history has been deleted.",
                        "success"
                      )
                }
            }
          });
    }
    return (
        <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
                    History
                </h2>
                <button 
                    onClick={handleClearHistory} 
                    disabled={isClearing} 
                    className="relative overflow-hidden flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-900 to-blue-500 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                >
                    <span className={`transform transition-transform duration-300 ${isClearing ? 'scale-0' : 'scale-100'}`}>
                        Clear History
                    </span>
                    <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isClearing ? 'opacity-100' : 'opacity-0'}`}>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    </span>
                    <Trash2 className={`w-5 h-5 text-white transform transition-transform duration-300 ${isClearing ? 'scale-0' : 'scale-100'}`} />
                </button>
            </div>
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : error ? (
                    <div className=" text-center">Error loading videos</div>
                ) : videos && videos.length > 0 ? (
                    videos.map((video) => (
                        <HorizontalVideoCard key={video.id} video={video}/>
                    ))
                ) : (
                    <div className=" text-center">No videos found</div>
                )}
                {!loading && !error && videos && videos.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setPage(page);
                        }}/>
                    )}
            </div>
        </section>
    );

}