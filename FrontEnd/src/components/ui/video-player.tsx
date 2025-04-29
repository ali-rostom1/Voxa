import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Maximize, Settings, PauseIcon, PlayIcon, Minimize,SlidersHorizontal, Loader2  } from 'lucide-react';
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
    const [currentAutoQuality,setCurrentAutoQuality] = useState<number| null>(null);
    const [isLoading,setIsLoading] = useState<boolean>(true);
    const [wasPlayingBeforeChange,setWasPlayingBeforeChange] = useState<boolean>(false);


    useEffect(()=>{
        if(Hls.isSupported() && videoPlayerRef.current){
            const hls = new Hls({
                enableWorker: true,
                autoStartLoad: true,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5,
            });
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
                hls.currentLevel = -1;
                setCurrentQuality(-1);
            });
            hls.on(Hls.Events.LEVEL_SWITCHED,(event,data)=>{
                if(hls.currentLevel === -1){
                    setCurrentAutoQuality(data.level);
                }
            })
            hls.on(Hls.Events.FRAG_LOADING, () => {
                setIsLoading(true);
            });
            hls.on(Hls.Events.FRAG_LOADED, () => { 
                setIsLoading(false);
                console.log(wasPlayingBeforeChange)
                if(wasPlayingBeforeChange){
                    videoPlayerRef.current?.play()
                    setWasPlayingBeforeChange(false);
                }
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                if(data.fatal){
                    switch(data.type){
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            break;
                    }
                }
            });
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
            setWasPlayingBeforeChange(isPlaying);
            setIsLoading(true);
            if(isPlaying) {
                videoPlayerRef.current?.pause();
            }
            hlsRef.current.currentLevel = id;
            setCurrentQuality(id);
            setShowQualityMenu(false);
            if(id === -1){
                setCurrentAutoQuality(null);
            }
        }
    }  
    const toggleQualityMenu = () => {
        setShowQualityMenu(!showQualityMenu);
    }

  return (
    <div className='w-full aspect-video rounded-3xl relative'>
        {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20 rounded-xl">
            <Loader2 className="animate-spin text-white w-12 h-12" />
          </div>
        )}
        <div className="relative rounded-3xl" ref={containerRef}>
            <video
                ref={videoPlayerRef}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePause}
                src={videoSrc}
                poster={poster}

                className='w-full rounded-xl'
            />
            <div className=" absolute z-22 bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-4 px-6 rounded-xl">
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
                                <div className="absolute bottom-12 right-6 bg-gray-900 bg-opacity-95 rounded-lg shadow-xl z-10 w-40 overflow-hidden border border-gray-700">
                                    <div className="text-gray-300 text-xs font-medium uppercase tracking-wider px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                                        Quality
                                        <span className="text-blue-400 text-xs font-normal capitalize">
                                            {currentQuality === -1 ? 'Auto' : qualityLevels.find(level => level.id === currentQuality)?.name || 'Custom'}
                                        </span>
                                    </div>
                                    
                                    <div className="max-h-48 py-1 overflow-auto custom-scrollbar">
                                        <button
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors duration-150 flex items-center justify-between ${currentQuality === -1 ? 'text-blue-500 font-medium' : 'text-white'}`}
                                            onClick={() => changeQuality(-1)}
                                        >
                                            Auto
                                            {currentQuality === -1 && (
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                        
                                        {qualityLevels.map((level) => (
                                            <button
                                                key={level.id}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors duration-150 flex items-center justify-between ${currentQuality === level.id ? 'text-blue-500 font-medium' : 'text-white'}`}
                                                onClick={() => changeQuality(level.id)}
                                            >
                                                {level.name}
                                                {currentQuality === level.id && (
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
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
            <div className='absolute z-22 left-0 right-0 bottom-16 flex justify-center items-center'>
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