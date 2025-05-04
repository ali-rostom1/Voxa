"use client"

import apiClient from "@/lib/apiClient";
import { List, Loader2, X } from "lucide-react";
import { FC, useEffect, useState } from "react"
import Swal from "sweetalert2";

interface ChoosePlaylistModalProps{
    isOpen: boolean;
    videoid : string;
    onClose: () => void;
}

export const ChoosePlaylistModal: FC<ChoosePlaylistModalProps> = ({isOpen,videoid,onClose}) =>{
    const [playlists,setPlaylists] = useState<{id: string, name: string}[]>([]);
    const [selectedPlaylistId,setSelectedPlaylistId] = useState<string | null>(null);
    const [isLoading,setIsLoading] = useState<boolean>(false);
    const [isFetching,setIsFetching] = useState<boolean>(true);
    
    useEffect(()=>{

        const fetchPlaylists = async () => {
            try{
                setIsFetching(true);
                const response = await apiClient.get('/api/v1/my-playlists');
                console.log(response);
                const data = response.data.data.map((playlist: any) =>({
                    id: playlist.id,
                    name: playlist.name,
                }));
                setPlaylists(data || []);
            }catch(err: any){
                console.error("Failed to fetch playlists");
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to load playlists. Please try again.",
                  });
            }finally{
                setIsFetching(false);
            }
        }
        setSelectedPlaylistId(null);
        if(isOpen){           
            fetchPlaylists();
        }
    },[isOpen]);
    const HandleAddToPlaylist = async () =>{
        try{
            if(!selectedPlaylistId){
                Swal.fire({
                    icon: 'warning',
                    title: "No Playlist Selected",
                    text: 'Please select a playlist to add the video'
                });
                return;
            }
            setIsLoading(true);
            await apiClient.post(`/api/v1/playlists/add/${selectedPlaylistId}/${videoid}`);
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Video added to playlist successfully!",
            });
            onClose();

        }catch(err: any){
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.message || "Failed to add video to playlist.",
            });
        }finally{
            setIsLoading(false);
        }
    }
    if(!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Add to Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto mb-4">
          {isFetching ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : playlists.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No playlists found.</p>
          ) : (
            <ul className="space-y-2">
              {playlists.map((playlist) => (
                <li
                  key={playlist.id}
                  onClick={() => setSelectedPlaylistId(playlist.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPlaylistId === playlist.id
                      ? "bg-blue-100 border-blue-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  } border border-gray-200`}
                >
                  <List
                    size={20}
                    className={selectedPlaylistId === playlist.id ? "text-blue-500" : "text-gray-500"}
                  />
                  <span className="text-gray-800 text-sm font-medium truncate">
                    {playlist.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={HandleAddToPlaylist}
            disabled={isLoading || !selectedPlaylistId}
            className={`px-4 py-2 text-white rounded-full flex items-center gap-2 ${
              isLoading || !selectedPlaylistId
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Add to Playlist
          </button>
        </div>
      </div>
    </div>
    );
}