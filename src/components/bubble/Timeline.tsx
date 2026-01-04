import React, { useRef, useCallback, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineProps {
  progress: number;
  isPlaying: boolean;
  loopDuration: number;
  onSeek: (progress: number) => void;
  onTogglePlayback: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
}

export default function Timeline({
  progress,
  isPlaying,
  loopDuration,
  onSeek,
  onTogglePlayback,
  onStepBack,
  onStepForward,
}: TimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (progressValue: number) => {
    const seconds = (progressValue * loopDuration) / 1000;
    return seconds.toFixed(2) + 's';
  };

  const handleSeek = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, x / rect.width));
    onSeek(newProgress);
  }, [onSeek]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    trackRef.current?.setPointerCapture(e.pointerId);
    handleSeek(e.clientX);
  }, [handleSeek]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    handleSeek(e.clientX);
  }, [isDragging, handleSeek]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate frame markers (10 markers)
  const frameMarkers = Array.from({ length: 11 }, (_, i) => i / 10);

  return (
    <div className="w-full max-w-md space-y-2">
      {/* Timeline Track */}
      <div className="flex items-center gap-3">
        {/* Step Back */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onStepBack}
          className="shrink-0 h-8 w-8"
          aria-label="Reculer"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant={isPlaying ? 'default' : 'outline'}
          size="icon"
          onClick={onTogglePlayback}
          className="shrink-0 h-8 w-8"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        {/* Step Forward */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onStepForward}
          className="shrink-0 h-8 w-8"
          aria-label="Avancer"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        {/* Track */}
        <div
          ref={trackRef}
          className="flex-1 h-8 relative cursor-pointer select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Background Track */}
          <div className="absolute inset-y-2 inset-x-0 bg-muted rounded-full overflow-hidden">
            {/* Progress Fill */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-[width] duration-75"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Frame Markers */}
          <div className="absolute inset-y-2 inset-x-0">
            {frameMarkers.map((marker) => (
              <div
                key={marker}
                className="absolute top-0 bottom-0 w-px bg-foreground/20"
                style={{ left: `${marker * 100}%` }}
              />
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-4 -ml-2 flex items-center justify-center transition-[left] duration-75"
            style={{ left: `${progress * 100}%` }}
          >
            <div 
              className={`w-4 h-4 rounded-full bg-primary shadow-lg border-2 border-background transition-transform ${isDragging ? 'scale-125' : ''}`}
            />
          </div>
        </div>

        {/* Time Display */}
        <div className="shrink-0 w-14 text-xs text-muted-foreground text-right font-mono">
          {formatTime(progress)}
        </div>
      </div>

      {/* Status */}
      <div className="flex justify-center">
        <span className={`text-xs px-2 py-0.5 rounded-full ${isPlaying ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600'}`}>
          {isPlaying ? '▶ Lecture' : '⏸ Pause - Dessinez sur cette frame'}
        </span>
      </div>
    </div>
  );
}
