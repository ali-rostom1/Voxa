import { FC } from "react";
import { Video } from "@/types";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";

interface VideoCardProps {
  video: Video;
  size?: 'default' | 'large';
}

export const HorizontalVideoCard: FC<VideoCardProps> = ({ video, size = 'default' }) => {
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };
  
  const formatDuration = (seconds: number): string => {
    const date = new Date(0);
    date.setSeconds(seconds);
    
    if (seconds < 3600) {
      return format(date, 'mm:ss');
    }
    return format(date, 'HH:mm:ss');
  };
  
  return (
    <div className="group flex gap-3 w-full transition-all duration-300 hover:bg-gray-50 rounded-lg">
      {/* Thumbnail Container */}
      <div className="relative w-40 flex-shrink-0 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-gray-800">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${video.thumbnail})` }}
        />
        
        {/* Duration Badge */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
          {formatDuration(parseInt(video.duration))}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 min-w-0 py-0.5">
        {/* Title */}
        <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2 text-gray-800 group-hover:text-black">
          {video.title}
        </h3>
        
        {/* Channel Info */}
        <div className="flex flex-col">
          {/* Channel Name */}
          <p className="text-gray-600 text-xs mb-0.5">
            {video.user}
          </p>
          
          {/* Stats */}
          <div className="text-gray-500 text-xs flex items-center">
            <span>{formatViews(video.views)} views</span>
            <span className="mx-1.5 inline-block w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
            <span>{formatDistanceToNow(new Date(video.uploadTime), { 
              addSuffix: true 
            })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};