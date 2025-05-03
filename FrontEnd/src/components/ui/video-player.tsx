import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Maximize, Minimize, PauseIcon, PlayIcon, SlidersHorizontal, Loader2 } from 'lucide-react';
import Hls from "hls.js";

interface VideoPlayerProps {
  videoSrc: string;
  poster?: string;
  onEnded?: () => void;
}

interface QualityLevel {
  height: number;
  name: string;
  id: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoSrc, poster, onEnded }) => {
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Hls.isSupported() && videoPlayerRef.current) {
      const hls = new Hls({ enableWorker: true, autoStartLoad: true });
      hlsRef.current = hls;
      hls.loadSource(videoSrc);
      hls.attachMedia(videoPlayerRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((level: any, index: number) => ({
          height: level.height,
          name: level.name || `${level.height}p`,
          id: index,
        }));
        setQualityLevels(levels);
        hls.currentLevel = -1;
        setCurrentQuality(-1);
      });

      hls.on(Hls.Events.ERROR, (event, data) => console.error('HLS error:',event ,data));

      const video = videoPlayerRef.current;
      video.addEventListener('canplay', () => setIsLoading(false));

      return () => {
        video.removeEventListener('canplay', () => setIsLoading(false));
        hlsRef.current?.destroy();
      };
    }
  }, [videoSrc]);

  const togglePause = () => {
    if (videoPlayerRef.current) {
      if (isPlaying) {
        videoPlayerRef.current.pause();
      } else {
        videoPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoPlayerRef.current && !isNaN(videoPlayerRef.current.duration)) {
      setProgress((videoPlayerRef.current.currentTime / videoPlayerRef.current.duration) * 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.muted = !videoPlayerRef.current.muted;
      setIsMuted(videoPlayerRef.current.muted);
      if (!videoPlayerRef.current.muted) setVolume(videoPlayerRef.current.volume);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoPlayerRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoPlayerRef.current.duration;
      videoPlayerRef.current.currentTime = time;
    }
  };

  const changeQuality = (id: number) => {
    if (!hlsRef.current || !videoPlayerRef.current) return;
    setIsLoading(true);
    const currentTime = videoPlayerRef.current.currentTime;
    const wasPlaying = isPlaying;

    if (wasPlaying) videoPlayerRef.current.pause();
    hlsRef.current.currentLevel = id;
    setCurrentQuality(id);
    setShowQualityMenu(false);

    const onLevelSwitched = () => {
      videoPlayerRef.current!.currentTime = currentTime;
      if (wasPlaying) videoPlayerRef.current!.play().then(() => setIsPlaying(true));
      setIsLoading(false);
      hlsRef.current!.off(Hls.Events.LEVEL_SWITCHED, onLevelSwitched);
    };

    hlsRef.current.on(Hls.Events.LEVEL_SWITCHED, onLevelSwitched);
  };

  const toggleQualityMenu = () => setShowQualityMenu(!showQualityMenu);

  return (
    <div className="w-full aspect-video rounded-xl relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 rounded-xl">
          <Loader2 className="animate-spin text-white w-10 h-10" />
        </div>
      )}
      <div className="relative rounded-xl" ref={containerRef}>
        <video
          ref={videoPlayerRef}
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePause}
          src={videoSrc}
          poster={poster}
          className="w-full rounded-xl"
          onEnded={onEnded}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={togglePause}>
                {isPlaying ? <PauseIcon className="w-6 h-6 text-white" /> : <PlayIcon className="w-6 h-6 text-white" />}
              </button>
              <span className="text-white text-sm">
                {videoPlayerRef.current ? formatTime(videoPlayerRef.current.currentTime) : '0:00'} / {videoPlayerRef.current && !isNaN(videoPlayerRef.current.duration) ? formatTime(videoPlayerRef.current.duration) : '0:00'}
              </span>
              <button onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-500 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-4">
              {qualityLevels.length > 0 && (
                <>
                  <button onClick={toggleQualityMenu}>
                    <SlidersHorizontal className="w-5 h-5 text-white" />
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-10 right-4 bg-gray-800 rounded p-2 z-10">
                      <button
                        className={`block w-full text-left p-1 ${currentQuality === -1 ? 'text-blue-400' : 'text-white'}`}
                        onClick={() => changeQuality(-1)}
                      >
                        Auto
                      </button>
                      {qualityLevels.map((level) => (
                        <button
                          key={level.id}
                          className={`block w-full text-left p-1 ${currentQuality === level.id ? 'text-blue-400' : 'text-white'}`}
                          onClick={() => changeQuality(level.id)}
                        >
                          {level.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button onClick={toggleFullscreen}>
                {isFullScreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-0 right-0 px-4">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-500 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;