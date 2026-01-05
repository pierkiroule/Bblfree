import React, { useRef, useState } from 'react';
import {
  Trash2,
  Pencil,
  Sparkles,
  CircleDot,
  Stamp,
  Mic,
  Eraser,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Image,
} from 'lucide-react';

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { BrushMode } from '@/hooks/useLoopTime';
import { STAMPS, StampType } from './BrushRenderer';
import { AudioData } from '@/hooks/useAudioReactive';

/* ===============================
   TYPES
=============================== */

interface BubbleControlsProps {
  colors: string[];
  activeColor: string;
  brushSize: number;
  brushOpacity: number;
  brushMode: BrushMode;
  stampType: StampType;
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

  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onClear: () => void;

  /* AUDIO */
  onStartMic?: () => void;
  onImportAudio?: (file: File) => void;

  onExport: () => void;
  onOpenGallery: () => void;
}

const BRUSH_MODES: { mode: BrushMode; icon: typeof Pencil; label: string }[] = [
  { mode: 'pencil', icon: Pencil, label: 'Crayon' },
  { mode: 'glow', icon: Sparkles, label: 'Glow' },
  { mode: 'particles', icon: CircleDot, label: 'Particules' },
  { mode: 'stamp', icon: Stamp, label: 'Tampons' },
  { mode: 'eraser', icon: Eraser, label: 'Gomme' },
];

/* ===============================
   COMPONENT
=============================== */

export default function BubbleControls(props: BubbleControlsProps) {
  const {
    colors,
    activeColor,
    brushSize,
    brushOpacity,
    brushMode,
    stampType,
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
    onUndo,
    onRedo,
    onZoomIn,
    onZoomOut,
    onClear,
    onStartMic,
    onImportAudio,
    onExport,
    onOpenGallery,
  } = props;

  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ===============================
     RENDER
  =============================== */

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">

      {/* ================= Brush Modes ================= */}
      <div className="flex justify-center gap-2">
        {BRUSH_MODES.map(({ mode, icon: Icon, label }) => (
          <Button
            key={mode}
            size="sm"
            variant={brushMode === mode ? 'default' : 'outline'}
            onClick={() => onBrushModeChange(mode)}
            className="gap-1.5"
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">{label}</span>
          </Button>
        ))}
      </div>

      {/* ================= Stamp Selector ================= */}
      {brushMode === 'stamp' && (
        <div className="flex justify-center gap-2 flex-wrap">
          {(Object.keys(STAMPS) as StampType[]).map((stamp) => (
            <button
              key={stamp}
              onClick={() => onStampTypeChange(stamp)}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-xl
                border-2 transition-all
                ${stampType === stamp
                  ? 'border-primary bg-primary/10 scale-110'
                  : 'border-muted bg-card hover:border-primary/50'}
              `}
              style={{ color: activeColor }}
            >
              {STAMPS[stamp]}
            </button>
          ))}
        </div>
      )}

      {/* ================= Colors ================= */}
      <div className="flex flex-wrap justify-center gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              w-7 h-7 rounded-full transition-all
              ${activeColor === color
                ? 'ring-2 ring-offset-2 ring-primary scale-110'
                : 'hover:scale-105'}
            `}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* ================= Size / Opacity ================= */}
      <div className="flex gap-3 glass-panel px-4 py-3 rounded-xl flex-wrap items-center">

        {/* Preview */}
        <div
          className="rounded-full shrink-0"
          style={{
            width: Math.max(12, brushSize),
            height: Math.max(12, brushSize),
            backgroundColor:
              brushMode === 'eraser'
                ? '#fff'
                : brushMode === 'glow'
                ? 'transparent'
                : activeColor,
            opacity: brushMode === 'eraser' ? 1 : brushOpacity,
            boxShadow:
              brushMode === 'glow'
                ? `0 0 ${brushSize}px ${activeColor}`
                : 'none',
          }}
        />

        {/* Size */}
        <div className="flex items-center gap-2 flex-1 min-w-[100px]">
          <span className="text-xs w-8">Taille</span>
          <Slider
            value={[brushSize]}
            min={4}
            max={40}
            step={1}
            onValueChange={(v) => onBrushSizeChange(v[0])}
          />
          <span className="text-xs w-6">{brushSize}</span>
        </div>

        {/* Opacity */}
        <div className="flex items-center gap-2 flex-1 min-w-[100px]">
          <span className="text-xs w-8">Opacité</span>
          <Slider
            value={[brushOpacity * 100]}
            min={10}
            max={100}
            step={5}
            onValueChange={(v) => onBrushOpacityChange(v[0] / 100)}
          />
          <span className="text-xs w-6">{Math.round(brushOpacity * 100)}%</span>
        </div>
      </div>

      {/* ================= Actions ================= */}
      <div className="flex justify-center gap-2 flex-wrap glass-panel px-4 py-2 rounded-xl">

        <Button size="icon" variant="ghost" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="w-4 h-4" />
        </Button>

        <Button size="icon" variant="ghost" onClick={onZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="ghost" onClick={onZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>

        {/* AUDIO */}
        <Button
          size="icon"
          variant={isListening ? 'default' : 'ghost'}
          onClick={() => setShowAudioMenu(v => !v)}
        >
          <Mic />
        </Button>

        <Button size="icon" variant="ghost" onClick={onClear} className="text-destructive">
          <Trash2 />
        </Button>

        <Button size="icon" variant="ghost" onClick={onExport}>
          <Download />
        </Button>
        <Button size="icon" variant="ghost" onClick={onOpenGallery}>
          <Image />
        </Button>
      </div>

      {/* ================= Audio Source Menu ================= */}
      {showAudioMenu && (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowAudioMenu(false);
              onStartMic?.();
            }}
          >
            🎙️ Micro
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowAudioMenu(false);
              fileInputRef.current?.click();
            }}
          >
            📁 Import audio
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportAudio?.(file);
            }}
          />
        </div>
      )}

      {/* ================= Audio Visualizer ================= */}
      {isListening && audioData && (
        <div className="flex gap-1 h-6 items-end justify-center">
          {audioData.frequencies.slice(0, 16).map((v, i) => (
            <div
              key={i}
              className="w-2 rounded-sm bg-gradient-to-t from-primary to-accent"
              style={{ height: `${Math.max(4, v * 24)}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}