import React from 'react';
import { Play, Pause, Trash2, Pencil, Sparkles, CircleDot, Stamp, Mic, MicOff, Eraser, Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { BrushMode } from '@/hooks/useLoopTime';
import { STAMPS, StampType } from './BrushRenderer';
import { AudioData } from '@/hooks/useAudioReactive';

interface BubbleControlsProps {
  colors: string[];
  activeColor: string;
  brushSize: number;
  brushOpacity: number;
  brushMode: BrushMode;
  stampType: StampType;
  isPlaying: boolean;
  loopProgress: number;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  isListening?: boolean;
  audioData?: AudioData;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onBrushOpacityChange: (opacity: number) => void;
  onBrushModeChange: (mode: BrushMode) => void;
  onStampTypeChange: (stamp: StampType) => void;
  onTogglePlayback: () => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleAudio?: () => void;
}

const BRUSH_MODES: { mode: BrushMode; icon: typeof Pencil; label: string }[] = [
  { mode: 'pencil', icon: Pencil, label: 'Crayon' },
  { mode: 'glow', icon: Sparkles, label: 'Glow' },
  { mode: 'particles', icon: CircleDot, label: 'Particules' },
  { mode: 'stamp', icon: Stamp, label: 'Tampons' },
  { mode: 'eraser', icon: Eraser, label: 'Gomme' },
];

export default function BubbleControls({
  colors,
  activeColor,
  brushSize,
  brushOpacity,
  brushMode,
  stampType,
  isPlaying,
  loopProgress,
  zoom,
  canUndo,
  canRedo,
  isListening = false,
  audioData,
  onColorChange,
  onBrushSizeChange,
  onBrushOpacityChange,
  onBrushModeChange,
  onStampTypeChange,
  onTogglePlayback,
  onClear,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  onToggleAudio,
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

      {/* Brush Size & Opacity Controls */}
      <div className="flex items-center gap-3 glass-panel px-4 py-3 rounded-xl flex-wrap">
        {/* Brush Preview */}
        <div
          className="rounded-full shrink-0 flex items-center justify-center"
          style={{
            width: Math.max(12, brushSize),
            height: Math.max(12, brushSize),
            backgroundColor: brushMode === 'eraser' ? '#ffffff' : (brushMode === 'glow' ? 'transparent' : activeColor),
            opacity: brushMode === 'eraser' ? 1 : brushOpacity,
            boxShadow: brushMode === 'glow' ? `0 0 ${brushSize}px ${activeColor}` : (brushMode === 'eraser' ? 'inset 0 0 0 2px hsl(var(--muted))' : 'none'),
            border: brushMode === 'glow' ? `2px solid ${activeColor}` : 'none',
          }}
        >
          {brushMode === 'stamp' && (
            <span style={{ fontSize: brushSize * 0.8, color: activeColor }}>
              {STAMPS[stampType]}
            </span>
          )}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2 flex-1 min-w-[100px]">
          <span className="text-xs text-muted-foreground w-8">Taille</span>
          <Slider
            value={[brushSize]}
            min={4}
            max={40}
            step={1}
            onValueChange={(v) => onBrushSizeChange(v[0])}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-6">{brushSize}</span>
        </div>

        {/* Brush Opacity */}
        <div className="flex items-center gap-2 flex-1 min-w-[100px]">
          <span className="text-xs text-muted-foreground w-8">Opacité</span>
          <Slider
            value={[brushOpacity * 100]}
            min={10}
            max={100}
            step={5}
            onValueChange={(v) => onBrushOpacityChange(v[0] / 100)}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-6">{Math.round(brushOpacity * 100)}%</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap glass-panel px-4 py-2 rounded-xl">
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="shrink-0"
          aria-label="Annuler"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="shrink-0"
          aria-label="Rétablir"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Zoom */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          disabled={zoom <= 0.5}
          className="shrink-0"
          aria-label="Zoom arrière"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          disabled={zoom >= 3}
          className="shrink-0"
          aria-label="Zoom avant"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Audio Toggle */}
        {onToggleAudio && (
          <Button
            variant={isListening ? 'default' : 'ghost'}
            size="icon"
            onClick={onToggleAudio}
            className={`shrink-0 transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
            aria-label={isListening ? 'Désactiver micro' : 'Activer micro'}
          >
            {isListening ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>
        )}

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

      {/* Audio Level Indicator */}
      {isListening && audioData && (
        <div className="flex gap-1 h-6 items-end justify-center">
          {audioData.frequencies.slice(0, 16).map((freq, i) => (
            <div
              key={i}
              className="w-2 bg-gradient-to-t from-primary to-accent rounded-sm transition-all duration-75"
              style={{ height: `${Math.max(4, freq * 24)}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
