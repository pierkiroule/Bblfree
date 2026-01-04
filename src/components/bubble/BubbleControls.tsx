import React from 'react';
import { Play, Pause, Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface BubbleControlsProps {
  colors: string[];
  activeColor: string;
  brushSize: number;
  isPlaying: boolean;
  loopProgress: number;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onTogglePlayback: () => void;
  onClear: () => void;
}

export default function BubbleControls({
  colors,
  activeColor,
  brushSize,
  isPlaying,
  loopProgress,
  onColorChange,
  onBrushSizeChange,
  onTogglePlayback,
  onClear,
}: BubbleControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Color Palette */}
      <div className="flex flex-wrap justify-center gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              w-8 h-8 rounded-full transition-all duration-200
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
            className="rounded-full bg-foreground shrink-0"
            style={{ 
              width: Math.max(8, brushSize),
              height: Math.max(8, brushSize),
              backgroundColor: activeColor,
            }}
          />
          <Slider
            value={[brushSize]}
            min={2}
            max={30}
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
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${loopProgress * 100}%` }}
        />
      </div>
    </div>
  );
}
