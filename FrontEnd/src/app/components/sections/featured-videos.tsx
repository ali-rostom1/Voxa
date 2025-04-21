import { FC } from 'react';
import { Video } from '@/types';
import { VideoCard } from '@/app/components/ui/video-card';
import { SectionHeader } from '@/app/components/sections/section-header';


interface FeaturedVideosProps {
  videos: Video[];
}

export const FeaturedVideos: FC<FeaturedVideosProps> = ({ videos }) => {
  return (
    <section className="mb-8">
      <SectionHeader title="Featured Videos" viewAllLink="/featured" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
            
          <VideoCard key={video.id} video={video} size='large' />
        ))}
      </div>
    </section>
  );
};