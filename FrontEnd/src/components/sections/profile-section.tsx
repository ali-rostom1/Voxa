import React, { FC, useEffect, useRef, useState } from 'react';
import {  Bell, UserPlus, Mail, Video, List, User, PenLine  } from 'lucide-react';
import { UserProfile } from '@/types';
import { useAuthStore } from '@/stores/AuthStore';
import Image from 'next/image';
import { EditProfileModal } from '../ui/profileEdit-modal';
import { Check,X } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import Swal from 'sweetalert2';


interface ProfileSectionProps{
    id: string;
}

export const ProfileSection: FC<ProfileSectionProps> = ({id}) => {
    const [isOwnProfile,setIsOwnProfile] = useState<boolean>(false);
    const {user,updateUser} = useAuthStore();
    const [currentUser,setCurrentUser] = useState<UserProfile|null>(null);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [selectedFilter,setSelectedFilter] = useState<string>('videos');
    const [isModalOpen,setIsModalOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    useEffect(()=>{
        if(user && user.id == id){
            setIsOwnProfile(true);
            setCurrentUser(user);
        }else{
            
        }
    },[user]);
    const handleSubscribe = () => {
        setIsSubscribed(!isSubscribed);
    };

    const handleAddFriend = () => {
        setIsFriend(!isFriend);
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
  
    return (
        <div className="flex flex-col w-full bg-gray-100 min-h-screen">
        {/* Profile Header */}
        <div className="bg-blue-600 p-6 rounded-b-lg">
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
                    
                    <button 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${isFriend ? 'bg-blue-700 text-white' : 'bg-white text-blue-600'}`}
                    onClick={handleAddFriend}
                    >
                    <UserPlus size={16} />
                    <span>{isFriend ? 'Friend Added' : 'Add Friend'}</span>
                    </button>
                    
                    <button className="bg-white text-blue-600 p-2 rounded-full">
                    <Mail size={18} />
                    </button>
                    </>
                    )
                }
                { isOwnProfile && (
                        <button 
                        className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white text-blue-600`}
                        onClick={() => setIsModalOpen(true)}
                        >
                        <PenLine  size={16} />
                        <span>edit profile</span>
                        </button>
                    )

                }
            </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex gap-4 mt-6 overflow-x-auto">
            <button className={`${selectedFilter === 'videos' ? 'bg-white text-blue-600 rounded-full' : 'text-white'} px-6 py-2 font-medium flex items-center gap-2`}>
                <Video size={16} />
                <span>Videos</span>
            </button>
            <button className={`${selectedFilter === 'playlists' ? 'bg-white text-blue-600 rounded-full' : 'text-white'} px-6 py-2 font-medium flex items-center gap-2`}>
                <List size={16} />
                <span>Playlist</span>
            </button>
            </div>
        </div>
        
            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {/* Video Cards */}
                {[
                { duration: '14:25', title: 'Video Title 1', views: '12K', date: '2 days ago' },
                { duration: '8:17', title: 'Video Title 2', views: '5.3K', date: '1 week ago' },
                { duration: '22:43', title: 'Video Title 3', views: '32K', date: '3 days ago' },
                { duration: '7:12', title: 'Video Title 4', views: '8.7K', date: '5 days ago' },
                { duration: '18:33', title: 'Video Title 5', views: '21K', date: '1 day ago' },
                { duration: '3:45', title: 'Video Title 6', views: '42K', date: 'Just now' },
                ].map((video, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow">
                    <div className="relative bg-gray-200 h-48">
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                    </div>
                    </div>
                    <div className="p-3">
                    <h3 className="font-medium">{video.title}</h3>
                    <p className="text-gray-500 text-sm">{video.views} views • {video.date}</p>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}