import { Playlist } from "@/types";
import { useEffect, useState } from "react";
import { SectionHeader } from "./section-header";
import { PlaylistCard } from "../ui/playlist-card";
import Pagination from "../ui/pagination";
import apiClient from "@/lib/apiClient";




export const PlaylistSection = () => {
    const [playlists,setPlaylists] = useState<Playlist[] | null>(null);
    const [page,setPage] = useState<number>(1);
    const [perPage,setPerPage] = useState<number>(8);
    const [totalPages,setTotalPages] = useState<number>(1);
    const [isLoading,setIsLoading] = useState<boolean>(true);
    const [error,setError] = useState<string>('');

    useEffect(()=>{
        const fetchPlaylists = async () =>{
            try{
                setIsLoading(true);
                setError('');
                const response = await apiClient.get(`/api/v1/playlists/all/${perPage}?page=${page}`);
                const data= response.data.data.data.map((playlist: any) => ({
                    id: playlist.id,
                    name: playlist.name,
                    description: playlist.description,
                    thumbnail: playlist.videos.length > 0 ? playlist.videos[0].thumbnail_path : 'images/placeholder.png',
                    user: { 
                        id: playlist.user.id,
                        name: playlist.user.name,
                        email: playlist.user.email,
                        pfp_path: playlist.user.pfp_path,
                    },
                    video_count: playlist.videos_count,
                    uploadTime: playlist.created_at
                }));
                setPlaylists(data || []);
                setPage(response.data.data.current_page);
                setTotalPages(Math.ceil(response.data.data.total/perPage));

            }catch(err: any){
                setError("Failed to fetch Playlists");
                console.log(err);
            }finally{
                setIsLoading(false);
            }
        }
        fetchPlaylists();
    },[page]);

    return (
        <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <SectionHeader title="Playlists"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {playlists?.map((playlist: Playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                ))
                }
            
            </div>
            <Pagination className="mt-5" currentPage={page} totalPages={totalPages} onPageChange={(page) => setPage(page)}  />
        </section>
    ); 
}