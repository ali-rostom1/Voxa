import { FC } from "react";
import { Video } from "@/types";
import { HorizontalVideoCard } from "../ui/horizontal-video-card";
import { SectionHeader } from "@/components/sections/section-header";

interface WatchOtherProps {
  videos: Video[];
}

export const WatchOther: FC<WatchOtherProps> = ({ videos }) => {
  return (
    <div className="w-full space-y-3">
      <SectionHeader title="Up Next" />
      {videos.length > 0 ? (
        <div className="space-y-2">
          {videos.map((video) => (
            <HorizontalVideoCard key={video.id} video={video} size="default" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No videos available.</p>
      )}
    </div>
  );
};