import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Mic,
  Square,
  Trash2,
  Volume2,
  Clock,
  RotateCcw,
} from 'lucide-react';

/**
 * AudioMemoBlock component
 * Displays and controls recorded voice memos with simulated waveform and progress scrubber.
 * Also supports recording new voice memos.
 */
export default function AudioMemoBlock({
  audioData = null,
  onUpdate,
  onDelete,
  className = '',
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const playbackIntervalRef = useRef(null);
  const recordIntervalRef = useRef(null);

  const duration = audioData?.duration || 60; // total duration in seconds
  const currentTime = Math.round(progress * duration);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (0.5 * playbackSpeed) / duration;
          if (next >= 1) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 500);
    } else {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    }

    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, duration]);

  // Recording loop
  useEffect(() => {
    if (isRecording) {
      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }

    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecording]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleCycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordSeconds(0);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    const newDuration = Math.max(recordSeconds, 5);
    onUpdate?.({
      duration: newDuration,
      label: `Voice Memo (${formatTime(newDuration)})`,
      recordedAt: new Date().toISOString(),
    });
    setRecordSeconds(0);
  };

  // Waveform bar heights (sample representation)
  const waveformHeights = [
    25, 45, 60, 30, 75, 90, 50, 40, 65, 80, 100, 70, 45, 85, 95, 60, 35, 55, 75,
    40, 30, 50, 20, 15,
  ];

  // If no audio memo attached and not recording, show "Add Voice Memo" trigger
  if (!audioData && !isRecording) {
    return (
      <div className={`w-full ${className}`}>
        <button
          type="button"
          onClick={handleStartRecord}
          className="w-full py-2.5 px-4 rounded-pill border border-dashed border-border-subtle/80 hover:border-cream-bg/60 text-label text-text-secondary hover:text-cream-bg flex items-center justify-center gap-2 transition-colors select-none"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Record Voice Memo</span>
        </button>
      </div>
    );
  }

  // Active Recording View
  if (isRecording) {
    return (
      <div className={`w-full p-4 rounded-card bg-[#151515] border border-red-500/30 flex items-center justify-between animate-fadeIn ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <div className="flex flex-col">
            <span className="text-body font-medium text-text-primary">Recording audio memo...</span>
            <span className="text-label text-text-secondary font-mono">
              {formatTime(recordSeconds)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStopRecord}
          className="px-4 py-1.5 rounded-pill bg-red-500 text-white text-label font-medium flex items-center gap-1.5 hover:bg-red-600 transition-colors"
        >
          <Square className="w-3 h-3 fill-white" />
          <span>Stop & Save</span>
        </button>
      </div>
    );
  }

  // Audio Player View
  return (
    <div
      className={`w-full p-4 rounded-card bg-[#141414] border border-border-subtle/60 flex flex-col gap-3 select-none ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Play/Pause Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-9 h-9 rounded-full bg-cream-bg text-cream-text flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-cream-text" />
            ) : (
              <Play className="w-4 h-4 fill-cream-text ml-0.5" />
            )}
          </button>

          <div className="flex flex-col">
            <span className="text-body font-medium text-text-primary text-[13px]">
              {audioData.label || 'Voice Memo'}
            </span>
            <span className="text-label text-text-secondary font-mono text-[11px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Speed & Delete */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCycleSpeed}
            className="px-2 py-0.5 rounded-pill bg-[#202020] border border-border-subtle text-[11px] font-mono text-text-secondary hover:text-text-primary transition-colors"
          >
            {playbackSpeed}x
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-text-secondary hover:text-red-400 transition-colors"
              title="Delete audio memo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Waveform Visualization Bars */}
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          setProgress(Math.max(0, Math.min(1, clickX / rect.width)));
        }}
        className="w-full h-8 flex items-end gap-[3px] cursor-pointer pt-1"
      >
        {waveformHeights.map((h, i) => {
          const barFraction = (i + 1) / waveformHeights.length;
          const isPassed = barFraction <= progress;
          return (
            <div
              key={i}
              className={`flex-1 rounded-pill transition-colors ${
                isPassed
                  ? 'bg-cream-bg'
                  : 'bg-divider hover:bg-text-secondary/50'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (h * (0.8 + Math.random() * 0.4)))}%` : `${h}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
