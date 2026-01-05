import React, { useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Undo2, Redo2, ZoomIn, ZoomOut,
  Download, Image, Trash2,
  Mic, MicOff, Music
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
  audioSource?: 'mic' | 'file' | null;
  onStartMic?: () => void;
  onImportAudio?: (file: File) => void;
  onStopAudio?: () => void;

  // Brush
  brushSize: number;
  brushOpacity: number;
  onBrushSizeChange: (size: number) => void;
  onBrushOpacityChange: (opacity: number) => void;
}

export default function BottomControls(props: BottomControlsProps) {
  const {
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
    audioSource = null,
    onStartMic,
    onImportAudio,
    onStopAudio,
    brushSize,
    brushOpacity,
    onBrushSizeChange,
    onBrushOpacityChange,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (p: number) =>
    ((p * loopDuration) / 1000).toFixed(1) + 's';

  return (
    <div className="w-full max-w-2xl space-y-3">

      {/* Brush */}
      <div className="flex items-center gap-4 px-4 py-2 bg-card/80 rounded-xl border">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs w-12">Taille</span>
          <Slider
            value={[brushSize]}
            min={4}
            max={40}
            step={1}
            onValueChange={(v) => onBrushSizeChange(v[0])}
          />
          <span className="text-xs w-8">{brushSize}px</span>
        </div>

        <div className="w-px h-6 bg-border" />

        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs w-12">Opacité</span>
          <Slider
            value={[brushOpacity * 100]}
            min={10}
            max={100}
            step={5}
            onValueChange={(v) => onBrushOpacityChange(v[0] / 100)}
          />
          <span className="text-xs w-8">{Math.round(brushOpacity * 100)}%</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-2 px-4 py-2 bg-card/80 rounded-xl border">
        <Button size="icon" variant="ghost" onClick={onStepBack}><SkipBack /></Button>
        <Button size="icon" variant={isPlaying ? 'default' : 'outline'} onClick={onTogglePlayback}>
          {isPlaying ? <Pause /> : <Play />}
        </Button>
        <Button size="icon" variant="ghost" onClick={onStepForward}><SkipForward /></Button>

        <Slider
          value={[progress * 100]}
          min={0}
          max={100}
          step={0.1}
          onValueChange={(v) => onSeek(v[0] / 100)}
          className="flex-1"
        />

        <span className="text-xs w-12 text-right">{formatTime(progress)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-1 px-4 py-2 bg-card/80 rounded-xl border">

        <Button size="icon" variant="ghost" onClick={onUndo} disabled={!canUndo}><Undo2 /></Button>
        <Button size="icon" variant="ghost" onClick={onRedo} disabled={!canRedo}><Redo2 /></Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button size="icon" variant="ghost" onClick={onZoomOut}><ZoomOut /></Button>
        <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="ghost" onClick={onZoomIn}><ZoomIn /></Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* AUDIO */}
        {!audioSource && (
          <>
            {onStartMic && (
              <Button
                size="icon"
                variant="ghost"
                title="Micro"
                onClick={() => onStartMic()}
              >
                <Mic />
              </Button>
            )}

            {onImportAudio && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Importer un audio"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Music />
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = ''; // reset indispensable (mobile / même fichier)
                    if (f && onImportAudio) onImportAudio(f);
                  }}
                />
              </>
            )}
          </>
        )}

        {audioSource && onStopAudio && (
          <Button
            size="icon"
            variant="default"
            className="bg-red-500 hover:bg-red-600"
            title="Arrêter l’audio"
            onClick={() => onStopAudio()}
          >
            <MicOff />
          </Button>
        )}

        <div className="w-px h-6 bg-border mx-1" />

        <Button size="icon" variant="ghost" onClick={onClear} className="text-destructive">
          <Trash2 />
        </Button>

        <Button size="icon" variant="ghost" onClick={onExport}><Download /></Button>
        <Button size="icon" variant="ghost" onClick={onOpenGallery}><Image /></Button>
      </div>

      {/* Audio visualizer */}
      {isListening && audioData && (
        <div className="flex gap-0.5 h-4 justify-center">
          {audioData.frequencies.slice(0, 24).map((f, i) => (
            <div
              key={i}
              className="w-1.5 rounded-sm bg-gradient-to-t from-primary to-accent"
              style={{ height: `${Math.max(2, f * 16)}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}