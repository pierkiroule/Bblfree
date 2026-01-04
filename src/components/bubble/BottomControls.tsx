import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Undo2, Redo2, ZoomIn, ZoomOut, 
  Download, Image, Trash2, Mic, MicOff 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudioData } from '@/hooks/useAudioReactive';

interface BottomControlsProps {
  // Timeline
  progress: number;
  isPlaying: boolean;
  loopDuration: number;
  onSeek: (progress: number) => void;
  onTogglePlayback: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  
  // Zoom
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  
  // Actions
  onClear: () => void;
  onExport: () => void;
  onOpenGallery: () => void;
  
  // Audio
  isListening?: boolean;
  audioData?: AudioData;
  onToggleAudio?: () => void;
  
  // Brush
  brushSize: number;
  brushOpacity: number;
  onBrushSizeChange: (size: number) => void;
  onBrushOpacityChange: (opacity: number) => void;
}

export default function BottomControls({
  progress,
  isPlaying,
  loopDuration,
  onSeek,
  onTogglePlayback,
  onStepBack,
  onStepForward,
  zoom,
  onZoomIn,
  onZoomOut,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onOpenGallery,
  isListening = false,
  audioData,
  onToggleAudio,
  brushSize,
  brushOpacity,
  onBrushSizeChange,
  onBrushOpacityChange,
}: BottomControlsProps) {
  const formatTime = (progressValue: number) => {
    const seconds = (progressValue * loopDuration) / 1000;
    return seconds.toFixed(1) + 's';
  };

  return (
    <div className="w-full max-w-2xl space-y-3">
      {/* Brush size and opacity */}
      <div className="flex items-center gap-4 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground w-12">Taille</span>
          <Slider
            value={[brushSize]}
            min={4}
            max={40}
            step={1}
            onValueChange={(v) => onBrushSizeChange(v[0])}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8">{brushSize}px</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground w-12">Opacité</span>
          <Slider
            value={[brushOpacity * 100]}
            min={10}
            max={100}
            step={5}
            onValueChange={(v) => onBrushOpacityChange(v[0] / 100)}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8">{Math.round(brushOpacity * 100)}%</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50">
        <Button variant="ghost" size="icon" onClick={onStepBack} className="h-8 w-8">
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button 
          variant={isPlaying ? 'default' : 'outline'} 
          size="icon" 
          onClick={onTogglePlayback} 
          className="h-8 w-8"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onStepForward} className="h-8 w-8">
          <SkipForward className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 h-8 relative">
          <Slider
            value={[progress * 100]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={(v) => onSeek(v[0] / 100)}
            className="h-full"
          />
        </div>
        
        <span className="text-xs font-mono text-muted-foreground w-12 text-right">
          {formatTime(progress)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-1 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50">
        {/* Undo/Redo */}
        <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} className="h-9 w-9">
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} className="h-9 w-9">
          <Redo2 className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Zoom */}
        <Button variant="ghost" size="icon" onClick={onZoomOut} disabled={zoom <= 0.5} className="h-9 w-9">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" onClick={onZoomIn} disabled={zoom >= 3} className="h-9 w-9">
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Audio */}
        {onToggleAudio && (
          <Button
            variant={isListening ? 'default' : 'ghost'}
            size="icon"
            onClick={onToggleAudio}
            className={`h-9 w-9 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
        )}
        
        {/* Clear */}
        <Button variant="ghost" size="icon" onClick={onClear} className="h-9 w-9 text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Export & Gallery */}
        <Button variant="ghost" size="icon" onClick={onExport} className="h-9 w-9">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenGallery} className="h-9 w-9">
          <Image className="w-4 h-4" />
        </Button>
      </div>

      {/* Audio visualizer */}
      {isListening && audioData && (
        <div className="flex gap-0.5 h-4 items-end justify-center">
          {audioData.frequencies.slice(0, 24).map((freq, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-primary to-accent rounded-sm transition-all duration-75"
              style={{ height: `${Math.max(2, freq * 16)}px` }}
            />
          ))}
        </div>
      )}

      {/* Status */}
      <div className="flex justify-center">
        <span className={`text-xs px-3 py-1 rounded-full ${isPlaying ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600'}`}>
          {isPlaying ? '▶ Lecture' : '⏸ Pause — Dessinez'}
        </span>
      </div>
    </div>
  );
}
