import React, { FC, useEffect, useRef, useState } from 'react';
import {  Bell, UserPlus, Mail, User, PenLine , ListPlus } from 'lucide-react';
import { UserProfile, Video } from '@/types';
import { useAuthStore } from '@/stores/AuthStore';
import Image from 'next/image';
import { EditProfileModal } from '../ui/profileEdit-modal';
import { Check,X } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import Swal from 'sweetalert2';
import { VideoCard } from '../ui/video-card';
import Pagination from '../ui/pagination';


interface ProfileSectionProps{
    id: string;
}

export const ProfileSection: FC<ProfileSectionProps> = ({id}) => {
    const [isOwnProfile,setIsOwnProfile] = useState<boolean>(false);
    const {user,updateUser} = useAuthStore();
    const [currentUser,setCurrentUser] = useState<UserProfile|null>(null);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [isModalOpen,setIsModalOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(3);
    const [videos,setVideos] = useState<Video[]>([]);

    const fetchUser = async () => {
        const response = await apiClient.get(`/api/v1/profile/${id}`);
        const data = response.data.data;
        let fetchedUser: UserProfile = {
            id:data.id,
            name:data.name,
        }
        const response2 = await apiClient.get(`/api/v1/users/${id}/isSubscribed`);
        const data2  = response2.data.data;
        console.log(data2);
        setIsSubscribed(data2);
        setCurrentUser(fetchedUser || null);
    }

    useEffect(()=>{
        if(user && user.id == id){
            setIsOwnProfile(true);
            setCurrentUser(user);
        }else{
            fetchUser();
        }
        
    },[user]);
    useEffect(()=>{
        fetchVideos();
    },[id,page]);

    const handleSubscribe = async() => {
        try{
            await apiClient.get(`/api/v1/users/${id}/subscribe`);
            setIsSubscribed(!isSubscribed);
        }catch(err: any){
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.response?.data?.message,
            });
         }
    };

    
    const handleImageChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file){
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
        }
    }
    const handleImageSave = async () => {
        if(previewImage && fileInputRef.current?.files?.[0]){
            try{
                const file = fileInputRef.current.files[0];
                const response = await apiClient.post('/api/v1/profile',{ pfp_file: file, _method: "put"},{
                    headers:{
                        "Content-Type" : 'multipart/form-data'
                    }
                });
                const updatedUser  = {
                    id: response.data.data.id,
                    name: response.data.data.name,
                    email: response.data.data.email,
                    pfp_path: response.data.data.pfp_path,
                };
                console.log(updatedUser);
                updateUser(updatedUser);
            }catch(err: any){
                if(err.status === 422){
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: err.response.data.message,
                    });
                }
            }finally{
                setPreviewImage(null);
                fileInputRef.current.value = '';
            }
        }
    }
    const handleCancelImage = () => {
        setPreviewImage(null);
    };
    const fetchVideos = async () => {
        try {
            setIsLoading(true);
            setError("");
            const response = await apiClient.post(`/api/v1/videos/user/${id}?page=${page}`,{
                perPage: perPage
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
  
    return (
        <div className="flex flex-col w-full bg-gray-100 min-h-screen">
        {/* Profile Header */}
        <div className="bg-blue-600 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row items-start justify-between">
            {/* Profile Info */}
            <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    {(previewImage || currentUser?.pfp_path) ? (
                        <div className={`relative w-full h-full ${isOwnProfile ? 'cursor-pointer' : ''}`}>
                        <Image
                            src={previewImage || currentUser?.pfp_path || "images/avatar"}
                            alt={currentUser?.name || 'User avatar'}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                        </div>
                    ) : (
                        <User className="w-12 h-12 text-blue-500" />
                    )}
                    {isOwnProfile && (
                        <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="absolute w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                        />
                    )}
                </div>
                {previewImage && (
                    <div className="flex gap-2 mt-2">
                        <button
                        className="p-2 bg-white text-green-500 rounded-full"
                        onClick={handleImageSave}
                        >
                        <Check/>
                        </button>
                        <button
                        className="p-2 bg-white text-red-800 rounded-full"
                        onClick={handleCancelImage}
                        >
                        <X/>
                        </button>
                    </div>
                    )}
                
                <div className="text-white">
                <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
                </div>
            </div>
            <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 md:mt-0">
                { !isOwnProfile && (
                    <>
                    <button 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${isSubscribed ? 'bg-blue-700 text-white' : 'bg-white text-blue-600'}`}
                    onClick={handleSubscribe}
                    >
                    <Bell size={16} />
                    <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                    </button>
                    </>
                    )
                }
                { isOwnProfile && (
                    <>
                        <button 
                        className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white text-blue-600`}
                        onClick={() => setIsModalOpen(true)}
                        >
                        <PenLine  size={16} />
                        <span>edit profile</span>
                        </button>
                    </>
                    )
                }
            </div>
            </div>
            
        </div>
            {
                isLoading ? (
                    <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        <div className="flex justify-center items-center h-screen">
                            <p>Loading...</p>
                        </div>
                    </section>
                ) : error ? (
                    <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        <div className="flex justify-center items-center h-screen">
                            <p className="text-red-500">{error}</p>
                        </div>
                    </section>
                ) : videos.length === 0 ? (
                    <section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                        </div>
                        <div className="flex justify-center items-center h-[70vh]">
                            <p>No videos found</p>
                        </div>
                    </section>
                ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                        {videos.map((video) => (
                            <VideoCard key={video.id} video={video} size='large' />
                        ))}
                    </div>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={(page) => setPage(page)}/>
                    </>
                )
            }
        </div>
    );
}