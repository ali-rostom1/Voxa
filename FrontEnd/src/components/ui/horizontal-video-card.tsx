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
  
  const isLarge = size === 'large';
  
  return (
    <div className="group flex gap-4 w-full transition-all duration-500 hover:-translate-y-1 rounded-xl border border-gray-200 hover:border-gray-300 p-3 hover:shadow-md bg-white">
      <div className={`relative ${isLarge ? 'w-64' : 'w-48'} flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-gray-800`}>
        <div className="pb-[56.25%] w-full"></div>
        
        {/* Thumbnail Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-110 group-hover:opacity-90"
          style={{ backgroundImage: `url(${video.thumbnail})` }}
        />
        
        {/* Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-md">
          {formatDuration(parseInt(video.duration))}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 min-w-0 py-1">
        {/* Title */}
        <h3 className={`font-semibold ${isLarge ? 'text-base' : 'text-sm'} leading-tight mb-2 line-clamp-2 text-gray-800 group-hover:text-gray-900`}>
          {video.title}
        </h3>
        
        <div className="flex items-start">
          {/* Channel Avatar */}
          {video.channelAvatar && (
            <div className="flex-shrink-0 mr-3">
              <div 
                className={`${isLarge ? 'w-8 h-8' : 'w-7 h-7'} rounded-full bg-cover bg-center border border-gray-100 shadow-sm`} 
                style={{ backgroundImage: `url(${video.channelAvatar})` }}
                />
            </div>
          )}
          
          {/* Channel Info */}
          <div className="flex-1 min-w-0">
            {/* Channel Name */}
            <p className="text-gray-600 text-xs mb-1 font-medium">
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

        {/* Description - Only visible in large size */}
        {isLarge && video.description && (
          <p className="mt-3 text-xs text-gray-600 line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
};