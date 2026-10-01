import React, { useRef, useState, useEffect } from 'react';
import { useRenderStore } from '../../store/render-store';
import { useGraphStore } from '../../store/graph-store';
import { useSettingsStore } from '../../store/settings-store';
import type { RenderQuality, RenderFormat } from '@shared/ipc-types';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Film,
  Download,
  Square,
  Sparkles,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';

export const VideoPreviewArea: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const status = useRenderStore((s) => s.status);
  const progress = useRenderStore((s) => s.progress);
  const progressMessage = useRenderStore((s) => s.progressMessage);
  const videoUrl = useRenderStore((s) => s.videoUrl);
  const quality = useRenderStore((s) => s.quality);
  const format = useRenderStore((s) => s.format);
  const setQuality = useRenderStore((s) => s.setQuality);
  const setFormat = useRenderStore((s) => s.setFormat);
  const startRender = useRenderStore((s) => s.startRender);
  const cancelRender = useRenderStore((s) => s.cancelRender);

  const compileResult = useGraphStore((s) => s.compileResult);
  const isPythonReady = useSettingsStore((s) => s.pythonEnv?.allRequiredReady);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const isRendering = status === 'rendering';

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const triggerRender = async (selectedQuality: RenderQuality) => {
    if (!window.manimStudio || !compileResult || isRendering) return;

    const renderId = `render_${Date.now()}`;
    startRender(renderId);

    try {
      await window.manimStudio.startRender({
        renderId,
        sceneCode: compileResult.pythonCode,
        sceneClassName: compileResult.sceneClassName,
        quality: selectedQuality,
        format: format
      });
    } catch (err: any) {
      console.error('Failed to trigger render:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds % 60);
    const m = Math.floor(seconds / 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-64 bg-dark-850 border-t border-dark-700 flex flex-col flex-shrink-0 select-none">
      {/* Top Preview Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-700 bg-dark-800 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
            <Film size={14} className="text-blue-400" />
            <span>Output Preview</span>
          </div>

          {/* Render progress banner when rendering */}
          {isRendering && (
            <div className="flex items-center space-x-2 text-amber-300 font-mono text-[11px] bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-900/60 animate-pulse">
              <Sparkles size={12} />
              <span>{progressMessage} ({progress}%)</span>
            </div>
          )}
        </div>

        {/* Quality and Format Selectors */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-400">Quality:</span>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as RenderQuality)}
              disabled={isRendering}
              className="bg-dark-900 border border-dark-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="low">Low (480p, 15fps)</option>
              <option value="medium">Medium (720p, 30fps)</option>
              <option value="high">High (1080p, 60fps)</option>
              <option value="four_k">4K (2160p, 60fps)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-400">Format:</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as RenderFormat)}
              disabled={isRendering}
              className="bg-dark-900 border border-dark-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="mp4">MP4 Video</option>
              <option value="gif">GIF Animation</option>
              <option value="webm">WebM Video</option>
              <option value="png">PNG (Last Frame)</option>
            </select>
          </div>

          {/* Action Buttons */}
          {isRendering ? (
            <button
              onClick={cancelRender}
              className="flex items-center space-x-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-medium text-xs transition-colors cursor-pointer"
            >
              <Square size={12} />
              <span>Cancel</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => triggerRender('low')}
                disabled={!isPythonReady}
                title="Render fast low quality preview (Ctrl+Enter)"
                className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium text-xs transition-colors cursor-pointer"
              >
                <Zap size={13} />
                <span>Preview (-ql)</span>
              </button>

              <button
                onClick={() => triggerRender(quality)}
                disabled={!isPythonReady}
                title="Render with selected quality profile"
                className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium text-xs transition-colors cursor-pointer"
              >
                <Film size={13} />
                <span>Render</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar Line */}
      {isRendering && (
        <div className="w-full bg-dark-900 h-1 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Preview Content Area */}
      <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden bg-black/40">
        {videoUrl ? (
          <div className="h-full max-w-full flex flex-col items-center justify-center relative">
            <video
              ref={videoRef}
              src={videoUrl}
              loop={isLooping}
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="h-full max-h-[170px] rounded shadow-lg object-contain bg-black"
            />

            {/* Floating Video Overlay Controls */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-3 px-3 py-1 rounded-full bg-dark-900/85 backdrop-blur border border-dark-700 text-xs shadow-xl">
              <button
                onClick={togglePlay}
                className="text-slate-200 hover:text-white transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.05}
                value={currentTime}
                onChange={handleSeek}
                className="w-32 lg:w-48 h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              <span className="font-mono text-[10px] text-slate-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`transition-colors ${isLooping ? 'text-blue-400' : 'text-slate-500'}`}
                title="Toggle Loop"
              >
                <RotateCcw size={12} />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Toggle Mute"
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              <button
                onClick={toggleFullscreen}
                className="text-slate-400 hover:text-white transition-colors"
                title="Fullscreen"
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
            <Film size={28} className="text-slate-400" />
            <p className="text-xs font-medium text-slate-400">
              {isRendering ? 'Rendering in progress...' : 'No animation rendered yet'}
            </p>
            <p className="text-[11px] text-slate-400">
              Click <strong>Preview (-ql)</strong> to test quickly or <strong>Render</strong> for full quality.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
