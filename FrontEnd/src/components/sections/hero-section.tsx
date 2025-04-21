import { FC } from 'react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <div className="w-full rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 mb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Share Your Stories with the World</h1>
      <p className="text-sm md:text-base opacity-90 mb-6">
        Join millions of creators and viewers on Voxa - the platform built for
        authentic connections through video.
      </p>
      <button 
        onClick={onGetStarted}
        className="bg-white text-blue-600 px-5 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
      >
        Get Started
      </button>
    </div>
  );
};