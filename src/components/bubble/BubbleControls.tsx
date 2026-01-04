import React from 'react';
import { Play, Pause, Trash2, Pencil, Sparkles, CircleDot, Stamp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { BrushMode } from '@/hooks/useLoopTime';
import { STAMPS, StampType } from './BrushRenderer';

interface BubbleControlsProps {
  colors: string[];
  activeColor: string;
  brushSize: number;
  brushMode: BrushMode;
  stampType: StampType;
  isPlaying: boolean;
  loopProgress: number;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onBrushModeChange: (mode: BrushMode) => void;
  onStampTypeChange: (stamp: StampType) => void;
  onTogglePlayback: () => void;
  onClear: () => void;
}

const BRUSH_MODES: { mode: BrushMode; icon: typeof Pencil; label: string }[] = [
  { mode: 'pencil', icon: Pencil, label: 'Crayon' },
  { mode: 'glow', icon: Sparkles, label: 'Glow' },
  { mode: 'particles', icon: CircleDot, label: 'Particules' },
  { mode: 'stamp', icon: Stamp, label: 'Tampons' },
];

export default function BubbleControls({
  colors,
  activeColor,
  brushSize,
  brushMode,
  stampType,
  isPlaying,
  loopProgress,
  onColorChange,
  onBrushSizeChange,
  onBrushModeChange,
  onStampTypeChange,
  onTogglePlayback,
  onClear,
}: BubbleControlsProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      {/* Brush Mode Selector */}
      <div className="flex justify-center gap-2">
        {BRUSH_MODES.map(({ mode, icon: Icon, label }) => (
          <Button
            key={mode}
            variant={brushMode === mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBrushModeChange(mode)}
            className="gap-1.5"
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">{label}</span>
          </Button>
        ))}
      </div>

      {/* Stamp Selector (only when stamp mode is active) */}
      {brushMode === 'stamp' && (
        <div className="flex justify-center gap-2 flex-wrap">
          {(Object.keys(STAMPS) as StampType[]).map((stamp) => (
            <button
              key={stamp}
              onClick={() => onStampTypeChange(stamp)}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-xl
                transition-all duration-200 border-2
                ${stampType === stamp
                  ? 'border-primary bg-primary/10 scale-110'
                  : 'border-muted bg-card hover:border-primary/50'
                }
              `}
              style={{ color: activeColor }}
              title={stamp}
            >
              {STAMPS[stamp]}
            </button>
          ))}
        </div>
      )}

      {/* Color Palette */}
      <div className="flex flex-wrap justify-center gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              w-7 h-7 rounded-full transition-all duration-200
              ${activeColor === color
                ? 'ring-2 ring-offset-2 ring-primary scale-110'
                : 'hover:scale-105'
              }
            `}
            style={{
              backgroundColor: color,
              boxShadow: activeColor === color
                ? `0 0 12px ${color}`
                : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
            }}
            aria-label={`Couleur ${color}`}
          />
        ))}
      </div>

      {/* Brush Size & Controls */}
      <div className="flex items-center gap-4 glass-panel px-4 py-3 rounded-xl">
        {/* Brush Size */}
        <div className="flex items-center gap-3 flex-1">
          <div
            className="rounded-full shrink-0 flex items-center justify-center"
            style={{
              width: Math.max(12, brushSize),
              height: Math.max(12, brushSize),
              backgroundColor: brushMode === 'glow' ? 'transparent' : activeColor,
              boxShadow: brushMode === 'glow' ? `0 0 ${brushSize}px ${activeColor}` : 'none',
              border: brushMode === 'glow' ? `2px solid ${activeColor}` : 'none',
            }}
          >
            {brushMode === 'stamp' && (
              <span style={{ fontSize: brushSize * 0.8, color: activeColor }}>
                {STAMPS[stampType]}
              </span>
            )}
          </div>
          <Slider
            value={[brushSize]}
            min={4}
            max={40}
            step={1}
            onValueChange={(v) => onBrushSizeChange(v[0])}
            className="flex-1"
          />
        </div>

        {/* Playback */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePlayback}
          className="shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>

        {/* Clear */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="shrink-0 text-destructive hover:text-destructive"
          aria-label="Effacer"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Loop Progress Bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-100"
          style={{ width: `${loopProgress * 100}%` }}
        />
      </div>
    </div>
  );
}
