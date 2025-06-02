'use client';

import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize2, FiMinimize2, FiExternalLink, FiDownload } from 'react-icons/fi';

interface EnhancedVideoPlayerProps {
  url: string;
  title: string;
  onError?: (error: any) => void;
  onReady?: () => void;
}

export default function EnhancedVideoPlayer({ 
  url, 
  title, 
  onError, 
  onReady 
}: EnhancedVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    setPlayed(state.played);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    setPlayed(seekTo);
    if (playerRef.current) {
      playerRef.current.seekTo(seekTo);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleReady = () => {
    setLoading(false);
    setError(null);
    onReady && onReady();
  };

  const handleError = (error: any) => {
    console.error('Enhanced Video Player Error:', error);
    setLoading(false);
    setError('Failed to load video. This might be due to an unsupported format or network issue.');
    onError && onError(error);
  };

  const handleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      } catch (err) {
        console.error('Exit fullscreen error:', err);
      }
    }
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSupportedFormats = () => {
    return [
      'MP4', 'WebM', 'OGV', 'MOV', 'AVI', 'WMV', 'FLV', 'MKV',
      'HLS (.m3u8)', 'DASH (.mpd)', 'YouTube', 'Vimeo', 'Twitch',
      'DailyMotion', 'SoundCloud', 'Wistia', 'Mixcloud', 'Facebook'
    ];
  };

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white p-6 max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPlay className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Video Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-4 text-left">
            <h4 className="text-sm font-semibold mb-2 text-gray-200">Supported Formats:</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
              {getSupportedFormats().map((format, index) => (
                <div key={index}>• {format}</div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </a>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
              className="ml-2 inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>Retry</span>
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 break-all">
            URL: {url}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'
      }`}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white text-sm">Loading video...</p>
            <p className="text-gray-400 text-xs mt-1">Supporting all major formats</p>
          </div>
        </div>
      )}

      {/* Video Player */}
      <div className="relative w-full h-full">
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          muted={muted}
          volume={volume}
          width="100%"
          height="100%"
          onReady={handleReady}
          onError={handleError}
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={{
            youtube: {
              playerVars: {
                showinfo: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0
              }
            },
            vimeo: {
              playerOptions: {
                title: false,
                byline: false,
                portrait: false
              }
            },
            file: {
              attributes: {
                crossOrigin: 'anonymous',
                controlsList: 'nodownload'
              },
              tracks: []
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={played}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {playing ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6" />}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {muted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Time */}
              <div className="text-white text-sm">
                {formatTime(played * duration)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* External Link */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
                title="Open in new tab"
              >
                <FiExternalLink className="w-5 h-5" />
              </a>

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
} 