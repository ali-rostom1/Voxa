import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Maximize, Settings, PauseIcon, PlayIcon, Minimize,SlidersHorizontal  } from 'lucide-react';
import Hls from "hls.js"


interface VideoPlayerProps {
  videoSrc: string;
  poster?: string;
  onEnded?: () => void;
}
interface QualityLevel {
    height: number;
    width: number;
    bitrate: number;
    name: string;
    id: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSrc,
  poster,
  onEnded,
}) => {
    const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isPlaying,setIsPlaying] = useState<boolean>(false);
    const [volume,setVolume] = useState<number>(1);
    const [progress,setProgress] = useState<number>(0);
    const [isFullScreen,setIsFullScreen] = useState<boolean>(false);
    const [isMuted,setIsMuted] = useState<boolean>(false);
    const [showQualityMenu,setShowQualityMenu] = useState<boolean>(false);
    const [qualityLevels,setQualityLevels] = useState<QualityLevel[]>([]);
    const [currentQuality,setCurrentQuality] = useState<number>(-1);


    useEffect(()=>{
        if(Hls.isSupported() && videoPlayerRef.current){
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(videoSrc);
            hls.attachMedia(videoPlayerRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, (event,data) => {
                console.log('Manifest loaded');
                const levels = data.levels.map((level: any, index: number) => ({
                    height: level.height,
                    width: level.width,
                    bitrate: level.bitrate,
                    name: level.name || `${level.height}p`,
                    id: index
                }));
                setQualityLevels(levels);
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
            });
            return () => {
                hls.destroy();
            }
        }
        return () => {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
        };
    },[videoSrc]);

    const togglePause = () => {
        if(videoPlayerRef.current){
            if(isPlaying){
                videoPlayerRef.current.pause();
            }else{
                videoPlayerRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }
    const handleTimeUpdate = (e: React.ChangeEvent<HTMLVideoElement>) => {
        if(videoPlayerRef.current && !isNaN(videoPlayerRef.current.duration)){
            const progress = (videoPlayerRef.current.currentTime / videoPlayerRef.current.duration) * 100;
            setProgress(progress);
        }
    }
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if(videoPlayerRef.current){
            videoPlayerRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    }
    const ToggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
        if(videoPlayerRef.current){
            videoPlayerRef.current.muted = !videoPlayerRef.current.muted;
            setIsMuted(videoPlayerRef.current.muted);
            if(!videoPlayerRef.current.muted){
                setVolume(videoPlayerRef.current.volume);
            }
        }
    }
    const ToggleFullscreen = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!containerRef.current) return;
        if(!document.fullscreenElement){
            containerRef.current.requestFullscreen().catch((error) => {
                console.error("Fullscreen error",error);
            });
            setIsFullScreen(true);
        }else{
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
    }
    const changeQuality = (id : number) => {
        if(hlsRef.current){
            hlsRef.current.currentLevel = id;
            setCurrentQuality(id);
            setShowQualityMenu(false);
            console.log(hlsRef.current.currentLevel);
        }
    }  
    const toggleQualityMenu = () => {
        setShowQualityMenu(!showQualityMenu);
    }

  return (
    <div className=' lg:w-[70%] aspect-video rounded-3xl'>
        <div className="relative rounded-3xl" ref={containerRef}>
            <video
                ref={videoPlayerRef}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePause}
                src={videoSrc}
                poster={poster}

                className='w-full rounded-xl'
            />
            <div className=" absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-4 px-6 rounded-xl">
                <div className='flex justify-between'>
                    <div className='flex items-center gap-6 mb-2'>
                        <button className='text-blue-700' onClick={togglePause}>
                            {isPlaying ? (
                                <PauseIcon className='w-6 h-6'/>
                            ) : (
                                <PlayIcon className='w-6 h-6'/>
                            )}
                        </button>
                        <div className='flex items-center gap-1 text-white text-sm'>
                            <span>{videoPlayerRef.current ? formatTime(videoPlayerRef.current.currentTime) : '0:00'}</span>
                            <span>/</span>
                            <span>{videoPlayerRef.current ? formatTime(videoPlayerRef.current.duration) : '0:00'}</span>
                        </div>
                        <button onClick={ToggleMute} className="text-white">
                            {isMuted ? (
                                <VolumeX className="w-5 h-5" />
                            ) : (
                                <Volume2 className="w-5 h-5" />
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer ml-2"
                            />
                        
                        
                    </div>
                    <div className='flex items-center gap-6 mb-2 relative'>
                    {qualityLevels.length > 0 && (
                        <>
                            <button 
                                className='text-white' 
                                onClick={toggleQualityMenu}
                            >
                                <SlidersHorizontal />
                            </button>
                            {showQualityMenu && (
                                <div className="absolute bottom-10 right-10 bg-gray-800 rounded-md shadow-lg z-10 py-1 w-32">
                                    <div className="text-white text-sm px-3 py-1">
                                        Quality
                                    </div>
                                    <div className="border-t border-gray-700"></div>
                                    <button
                                        className={`w-full text-left px-3 py-1 text-sm ${currentQuality === -1 ? 'text-blue-500' : 'text-white'}`}
                                        onClick={() => changeQuality(-1)}
                                    >
                                        Auto
                                    </button>
                                    {qualityLevels.map((level) => (
                                        <button
                                            key={level.id}
                                            className={`w-full text-left px-3 py-1 text-sm ${currentQuality === level.id ? 'text-blue-500' : 'text-white'}`}
                                            onClick={() => changeQuality(level.id)}
                                        >
                                            {level.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                        <button className='text-white' onClick={ToggleFullscreen}>
                            {isFullScreen ? (
                                <Minimize/>
                            ) : (
                                <Maximize/>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <div className='absolute left-0 right-0 bottom-16 flex justify-center items-center'>
                <input
                    type="range"
                    min="0"
                    step='0.1'
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="h-1 bg-gray-600 rounded-lg cursor-pointer w-[98%]"
                />
            </div>
            
        </div>
    </div>
    
  );
};

export default VideoPlayer;