import { Video } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, Share, Flag, MessageCircle, BookmarkPlus } from "lucide-react";
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

}

export function VideoDetails({ video,isSubscribed,onSubscribe,isLiked,onLike,isDisliked,onDislike,isSaved,onSave }: VideoDetailsProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
            {video.channelAvatar && (
              <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-offset-2 ring-gray-100">
                <img 
                  src={video.channelAvatar} 
                  alt={video.user}
                  className="h-full w-full object-cover transform transition group-hover:scale-110"
                />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
              {video.user}
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
                    Subscribed
            </button>
            ): (
            <button onClick={onSubscribe} className="ml-4 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
                    Subscribed 
            </button>
            )}
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
              <span className="font-medium">24K</span>
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

      {/* Comments Section Preview */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Comments <span className="text-gray-500 text-base">3.2K</span>
          </h2>
          <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Add comment</span>
          </button>
        </div>
      </div>
    </div>
  );
}