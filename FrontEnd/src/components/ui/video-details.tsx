import { Video } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, Share, Flag, MessageCircle, BookmarkPlus,Check } from "lucide-react";
import { useAuthStore } from "@/stores/AuthStore";
import { useState } from "react";

interface VideoDetailsProps {
    video: Video;
    isSubscribed: boolean;
    onSubscribe: () => void;
    isLiked: boolean;
    onLike: () => void;
    isDisliked: boolean;
    onDislike: () => void;
    isSaved: boolean;
    onSave: () => void;
    likes: number;
}

export function VideoDetails({ video,isSubscribed,onSubscribe,isLiked,onLike,isDisliked,onDislike,isSaved,onSave,likes }: VideoDetailsProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { user } = useAuthStore((state) => state);
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 leading-tight">
        {video.title}
      </h1>

      {/* Meta information and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        {/* Channel info */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            {video.user.pfp_path && (
              <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-offset-2 ring-gray-100">
                <img 
                  src={video.user.pfp_path} 
                  alt={video.user.name}
                  className="h-full w-full object-cover transform transition group-hover:scale-110"
                />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
              {video.user.name}
            </h3>
            <p className="text-sm text-gray-500">
              {formatViews(video.views)} views • {
                formatDistanceToNow(new Date(video.uploadTime), {
                  addSuffix: true
                })
              }
            </p>
          </div>
          {isSubscribed ? (
            <button onClick={onSubscribe} className="ml-4 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
                    Subscribed <Check className="ml-2 h-4 w-4 inline-block" />
            </button>
            ): video.user.id !== user?.id ? (
            <button onClick={onSubscribe} className="ml-4 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
                    Subscribe
            </button>
            ) : null}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <div className="flex rounded-full bg-gray-100 p-1">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer" onClick={onLike}>
              {isLiked ? (
                <ThumbsUp className="h-5 w-5 text-blue-600"  />
              ) : (
                <ThumbsUp className="h-5 w-5" />
              )}
              <span className="font-medium">{formatViews(likes)}</span>
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer" onClick={onDislike}>
              {isDisliked ? (
                <ThumbsDown className="h-5 w-5 text-red-600"  />
              ) : (
                <ThumbsDown className="h-5 w-5" />
              )}
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer" onClick={onSave}>
            {isSaved ? (
                <BookmarkPlus className="h-5 w-5 text-blue-600" />
                ) : (
                <BookmarkPlus className="h-5 w-5"  />
                )}
            <span className="font-medium">Save</span>
          </button>
        </div>
      </div>

      {/* Description */}
      {video.description && (
        <div className={`mt-4 rounded-xl bg-gray-100 p-6 transition-all duration-300 ${
          isDescriptionExpanded ? 'h-auto' : 'h-[120px] overflow-hidden'
        }`}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-4 text-sm text-gray-500 font-medium">
                <span>{formatViews(video.views)} views</span>
                <span>{formatDistanceToNow(new Date(video.uploadTime), { addSuffix: true })}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {video.description}
            </p>
          </div>
          {video.description.length > 200 && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {isDescriptionExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
      
    </div>
  );
}