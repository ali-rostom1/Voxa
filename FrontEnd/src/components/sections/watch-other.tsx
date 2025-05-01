import { VideoCard } from "@/components/ui/video-card";
import { Video } from "@/types";
import { FC } from "react";
import { HorizontalVideoCard } from "../ui/horizontal-video-card";

interface WatchOtherProps {
    videos: Video[];
}

export const WatchOther: FC<WatchOtherProps> = ({videos}) => {
    return (
        <div className="flex flex-col items-center w-full h-full">
            {videos.length > 0 ? (
                <>
                    {videos.map((video) => (
                        <HorizontalVideoCard key={video.id} video={video} />
                    ))}
                </>
            ) : (
                <>
                </>
            )}
        </div>
    );
    }