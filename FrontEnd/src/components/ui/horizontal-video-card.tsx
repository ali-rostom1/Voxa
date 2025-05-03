import { FC } from "react";
import { Video } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface VideoCardProps {
  video: Video;
  size?: 'default' | 'large';
}

export const HorizontalVideoCard: FC<VideoCardProps> = ({ video, size = 'default' }) => {
  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number): string => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return format(date, seconds < 3600 ? 'mm:ss' : 'HH:mm:ss');
  };

  const isLarge = size === 'large';

  return (
    <Link href={`/watch/${video.id}`} className="block">
      <div className="group flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
        {/* Thumbnail Container */}
        <div className={`relative ${isLarge ? 'w-48' : 'w-32'} flex-shrink-0 aspect-video rounded-md overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800`}>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
            style={{ backgroundImage: `url(${video.thumbnail})` }}
          />
          <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-sm">
            {formatDuration(parseInt(video.duration))}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className={`font-medium ${isLarge ? 'text-base' : 'text-sm'} leading-tight mb-1 line-clamp-2 text-gray-800 group-hover:text-black`}>
            {video.title}
          </h3>
          <p className="text-xs text-gray-600 mb-0.5">{video.user.name}</p>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{formatViews(video.views)} views</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            <span>{formatDistanceToNow(new Date(video.uploadTime), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};