import { FC } from 'react';
import { Video } from '@/types';
import { VideoCard } from '@/app/components/ui/video-card';
import { SectionHeader } from '@/app/components/sections/section-header';

interface TrendingVideosProps {
  videos: Video[];
}

export const TrendingVideos: FC<TrendingVideosProps> = ({ videos }) => {
  return (
    <section className="mb-8">
      <SectionHeader title="Trending Now" viewAllLink="/trending" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} size='large'/>
        ))}
      </div>
    </section>
  );
};