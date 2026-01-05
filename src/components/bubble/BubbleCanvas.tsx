import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLoopTime, BrushMode, LoopStroke } from '@/hooks/useLoopTime';
import { useCameraMotion } from '@/hooks/useCameraMotion';
import { useAudioReactive } from '@/hooks/useAudioReactive';
import { useGallery } from '@/hooks/useGallery';
import { useWebpExport } from '@/hooks/useWebpExport';
import { renderStroke, StampType, TextFontKey } from './BrushRenderer';
import BrushToolbar from './BrushToolbar';
import ColorToolbar from './ColorToolbar';
import { Slider } from '@/components/ui/slider';
import ColorPaletteModal from './ColorPaletteModal';
import BottomControls from './BottomControls';
import ExportDialog from './ExportDialog';
import GalleryDialog from './GalleryDialog';
import { toast } from 'sonner';

interface BubbleCanvasProps {
  loopDuration?: number;
}

const DEFAULT_COLORS = [
  '#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#8b5cf6',
];

export default function BubbleCanvas({ loopDuration = 10000 }: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const watermarkCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, radius: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [paletteColors, setPaletteColors] = useState<string[]>(DEFAULT_COLORS);
  const [brushColor, setBrushColor] = useState('#6366f1');
  const [brushSize, setBrushSize] = useState(8);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [brushMode, setBrushMode] = useState<BrushMode>('pencil');
  const [stampType, setStampType] = useState<StampType>('star');
  const [customText, setCustomText] = useState('');
  const [textFont, setTextFont] = useState<TextFontKey>('sans');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const { isListening, audioData, source, startMic, loadAudioFile, stop } = useAudioReactive();

  // Modals
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);

  const {
    strokes,
    currentStroke,
    loopProgress,
    isPlaying,
    loopMode,
    loopDuration: actualLoopDuration,
    canUndo,
    canRedo,
    startStroke,
    addPoint,
    endStroke,
    clearStrokes,
    togglePlayback,
    getVisibleStrokes,
    undo,
    redo,
    seekTo,
    stepForward,
    stepBackward,
    setLoopMode,
  } = useLoopTime({ loopDuration });

  const { offset } = useCameraMotion({ intensity: 0.4, enabled: true });
  

  // Gallery & Export
  const { items: galleryItems, saveItem, deleteItem, renameItem } = useGallery();
  const { exportWebp, isExporting, progress: exportProgress } = useWebpExport();
  const [videoDataUrl, setVideoDataUrl] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');
  const [savedToGallery, setSavedToGallery] = useState(false);
  const audioDataRef = useRef(audioData);

  useEffect(() => {
    audioDataRef.current = audioData;
  }, [audioData]);

  const getAudioSnapshot = useCallback(() => audioDataRef.current, []);

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25));

  // Export handler
  const handleExport = async () => {
    try {
      const result = await exportWebp({
        width: dimensions.width,
        height: dimensions.height,
        radius: dimensions.radius,
        loopDuration: actualLoopDuration,
        strokes,
        fps: 15,
        isListening,
        getAudioSnapshot,
      });
      setVideoDataUrl(result.video);
      setVideoThumbnail(result.thumbnail);
      setSavedToGallery(false);
      toast.success('Vidéo WebP générée avec succès !');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Erreur lors de la génération de la vidéo');
    }
  };

  const handleSaveToGallery = () => {
    if (videoDataUrl && videoThumbnail) {
      saveItem(videoDataUrl, videoThumbnail, actualLoopDuration);
      setSavedToGallery(true);
      toast.success('Sauvegardé dans la galerie !');
    }
  };

  const handleDownloadVideo = () => {
    if (videoDataUrl) {
      const now = new Date();
      const filename = `BubbleLoop_${now.toISOString().slice(0, 10)}_${now
        .toTimeString()
        .slice(0, 5)
        .replace(':', 'h')}.webp`;
      const link = document.createElement('a');
      link.href = videoDataUrl;
      link.download = filename;
      link.click();
    }
  };

  const handleOpenExportDialog = () => {
    setVideoDataUrl(null);
    setSavedToGallery(false);
    setShowExportDialog(true);
  };

  // Calculate dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      const radius = size / 2 - 10;

      setDimensions({
        width: size,
        height: size,
        radius,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Get center-relative coordinates with zoom and pan transform
  const getCanvasPoint = useCallback((clientX: number, clientY: number, checkBounds = true) => {
    if (!canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = clientX - rect.left - dimensions.width / 2;
    const screenY = clientY - rect.top - dimensions.height / 2;

    // Check if point is inside the circle (in screen space)
    if (checkBounds) {
      const dist = Math.sqrt(screenX * screenX + screenY * screenY);
      if (dist > dimensions.radius) return null;
    }

    // Transform to canvas space (inverse of zoom and pan)
    const canvasX = (screenX - pan.x) / zoom;
    const canvasY = (screenY - pan.y) / zoom;

    return { x: canvasX, y: canvasY, screenX, screenY };
  }, [dimensions, zoom, pan]);

  // Offscreen canvas for multi-pass rendering (eraser doesn't pierce background)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create/resize offscreen canvas for strokes
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const offscreen = offscreenCanvasRef.current;
    offscreen.width = dimensions.width;
    offscreen.height = dimensions.height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    let animationId: number;
    const startTime = performance.now();

    const render = () => {
      timeRef.current = (performance.now() - startTime) / 1000;

      // Audio reactive values
      const beatEnvelope = isListening ? audioData.beatEnvelope ?? audioData.energy ?? audioData.volume : 0;
      const audioScale = isListening ? 1 + audioData.bass * 0.15 : 1;
      const audioGlow = beatEnvelope * 0.4;
      const audioPulse = isListening ? Math.sin(timeRef.current * 8) * (audioData.treble * 5 + beatEnvelope * 4) : 0;

      // === PASS 1: Draw background on main canvas ===
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      ctx.save();
      const bgGradient = ctx.createRadialGradient(
        dimensions.width / 2, dimensions.height / 2, 0,
        dimensions.width / 2, dimensions.height / 2, dimensions.radius
      );
      bgGradient.addColorStop(0, '#ffffff');
      bgGradient.addColorStop(1, '#f8fafc');
      
      ctx.beginPath();
      ctx.arc(
        dimensions.width / 2,
        dimensions.height / 2,
        dimensions.radius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = bgGradient;
      ctx.fill();
      ctx.restore();

      // === PASS 2: Draw strokes on offscreen canvas (eraser works here) ===
      offCtx.clearRect(0, 0, dimensions.width, dimensions.height);

      offCtx.save();
      offCtx.translate(dimensions.width / 2 + pan.x, dimensions.height / 2 + pan.y);
      offCtx.scale(zoom, zoom);
      offCtx.translate(-dimensions.width / 2, -dimensions.height / 2);
      const freqs = audioData.frequencies;
      const freqsLen = freqs.length || 1;
      const visibleStrokes = getVisibleStrokes(loopProgress);
      visibleStrokes.forEach((stroke, i) => {
        const freqValue = freqs[i % freqsLen] || 0;
        const energy = audioData.beatEnvelope ?? audioData.energy ?? audioData.volume;
        const strokeScale = isListening
          ? 1 + freqValue * 0.1
          : 1;
        const widthBoost = 1 + energy * 0.35 + freqValue * 0.45;
        const boostedOpacity = Math.min(1, (stroke.opacity ?? 1) + energy * 0.25);
        const boostedStroke: LoopStroke = {
          ...stroke,
          width: stroke.width * widthBoost,
          opacity: boostedOpacity,
        };
        
        offCtx.save();
        offCtx.translate(dimensions.width / 2, dimensions.height / 2);
        offCtx.scale(strokeScale * audioScale, strokeScale * audioScale);
        offCtx.translate(-dimensions.width / 2, -dimensions.height / 2);
        
        renderStroke(
          offCtx,
          boostedStroke,
          dimensions.width / 2,
          dimensions.height / 2,
          offset.x + audioPulse,
          offset.y + audioPulse,
          timeRef.current,
          isListening ? { volume: audioData.volume, treble: audioData.treble } : undefined
        );
        offCtx.restore();
      });

      // Draw current stroke on offscreen
      if (currentStroke) {
        const energy = audioData.beatEnvelope ?? audioData.energy ?? audioData.volume;
        const boostedStroke: LoopStroke = {
          ...currentStroke,
          width: currentStroke.width * (1 + energy * 0.3),
          opacity: Math.min(1, (currentStroke.opacity ?? 1) + energy * 0.2),
        };

        renderStroke(
          offCtx,
          boostedStroke,
          dimensions.width / 2,
          dimensions.height / 2,
          offset.x,
          offset.y,
          timeRef.current,
          isListening ? { volume: audioData.volume, treble: audioData.treble } : undefined
        );
      }

      offCtx.restore();

      // === PASS 3: Composite offscreen onto main canvas (clipped to circle) ===
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        dimensions.width / 2,
        dimensions.height / 2,
        dimensions.radius,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(offscreen, 0, 0);
      ctx.restore();

      // Draw border glow with audio reactivity
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        dimensions.width / 2,
        dimensions.height / 2,
        dimensions.radius,
        0,
        Math.PI * 2
      );
      const borderGradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
      const glowIntensity = 0.4 + audioGlow;
      borderGradient.addColorStop(0, `hsl(239 84% 67% / ${glowIntensity})`);
      borderGradient.addColorStop(0.5, `hsl(280 84% 67% / ${glowIntensity * 0.5})`);
      borderGradient.addColorStop(1, `hsl(239 84% 67% / ${glowIntensity})`);
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 4 + (isListening ? audioData.bass * 4 : 0);
      ctx.stroke();
      
      // Extra glow ring when audio is active
      if (isListening && audioData.volume > 0.15) {
        ctx.save();
        ctx.filter = `blur(${8 + audioData.bass * 12}px)`;
        ctx.globalAlpha = audioData.volume * 0.6;
        ctx.beginPath();
        ctx.arc(
          dimensions.width / 2,
          dimensions.height / 2,
          dimensions.radius + audioData.bass * 10,
          0,
          Math.PI * 2
        );
        const pulseGradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
        pulseGradient.addColorStop(0, 'hsl(280 84% 67%)');
        pulseGradient.addColorStop(0.5, 'hsl(320 84% 67%)');
        pulseGradient.addColorStop(1, 'hsl(239 84% 67%)');
        ctx.strokeStyle = pulseGradient;
        ctx.lineWidth = 6 + audioData.bass * 8;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // === AUDIO RING (VISIBLE SUPPORT) ===
      if (isListening) {
        ctx.save();
        ctx.beginPath();

        const ringRadius =
          dimensions.radius + 6 + audioData.bass * 12;

        ctx.arc(
          dimensions.width / 2,
          dimensions.height / 2,
          ringRadius,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle = `hsla(280, 90%, 65%, ${0.35 + audioData.volume * 0.4})`;
        ctx.lineWidth = 2 + audioData.bass * 2;
        ctx.shadowBlur = 10 + audioData.bass * 20;
        ctx.shadowColor = 'hsla(280,90%,70%,0.6)';

        ctx.stroke();
        ctx.restore();
      }

      // === MICRO-BUBBLES AUDIO-REACTIVE EFFECT WITH DISPERSION ===
      if (isListening && audioData.volume > 0.05) {
        // Collect colors from strokes (or use defaults)
        const strokeColors = visibleStrokes
          .filter(s => s.mode !== 'eraser')
          .map(s => s.color);
        const bubbleColors = strokeColors.length > 0 
          ? strokeColors 
          : ['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4'];

        const bubbleCount = Math.floor(16 + audioData.volume * 24);
        const time = timeRef.current;

        for (let i = 0; i < bubbleCount; i++) {
          // Each bubble has its own lifecycle (3-6 seconds)
          const seed = i * 137.5;
          const lifecycleDuration = 3 + (seed % 30) / 10; // 3-6 seconds
          const bubbleTime = (time + seed / 50) % lifecycleDuration;
          const lifecycleProgress = bubbleTime / lifecycleDuration; // 0 to 1

          // Fixed angle per bubble (stable position on the ring)
          const baseAngle = ((seed % 360) / 360) * Math.PI * 2;
          // Slight wobble as it escapes
          const wobble = Math.sin(time * 3 + i * 2) * 0.15 * lifecycleProgress;
          const angle = baseAngle + wobble;

          // Distance: starts at border, escapes outward progressively
          const ringRadius = dimensions.radius + 6 + audioData.bass * 12;
          const startDist = ringRadius;
          const maxEscape = 40 + (seed % 20); // Max distance to travel
          const escapeEase = 1 - Math.pow(1 - lifecycleProgress, 2); // Ease out
          const escapeDist = escapeEase * maxEscape;
          
          const freqs = audioData.frequencies;
          const freqsLen = freqs.length || 1;
          // Audio makes them jump/pulse
          const freqIndex = i % freqsLen;
          const freqValue = freqs[freqIndex] || 0;
          const audioPush = freqValue * 15 + audioData.bass * 8;
          
          const dist = startDist + escapeDist + audioPush;

          // Position
          const bx = dimensions.width / 2 + Math.cos(angle) * dist;
          const by = dimensions.height / 2 + Math.sin(angle) * dist;

          // Size: starts small, grows slightly, then shrinks as it fades
          const baseSize = 1 + (seed % 2.5);
          const sizeLifecycle = lifecycleProgress < 0.3 
            ? lifecycleProgress / 0.3 // Grow in
            : 1 - (lifecycleProgress - 0.3) / 0.7 * 0.6; // Shrink out
          const audioSize = freqValue * 3 + audioData.treble * 1.5;
          const finalSize = (baseSize + audioSize) * sizeLifecycle;

          // Color from strokes
          const color = bubbleColors[i % bubbleColors.length];

          // Alpha: fade in quickly, fade out as it escapes
          const fadeIn = Math.min(1, lifecycleProgress * 5); // Quick fade in
          const fadeOut = 1 - Math.pow(lifecycleProgress, 1.5); // Gradual fade out
          const audioAlpha = 0.2 + audioData.volume * 0.3 + freqValue * 0.2;
          const alpha = fadeIn * fadeOut * audioAlpha;

          if (alpha < 0.02 || finalSize < 0.3) continue;

          ctx.save();
          ctx.globalAlpha = Math.min(alpha, 0.75);
          ctx.fillStyle = color;
          
          // Soft glow effect
          ctx.shadowBlur = finalSize * 2.5;
          ctx.shadowColor = color;

          ctx.beginPath();
          ctx.arc(bx, by, Math.max(0.5, finalSize), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // === ESCAPING MICRO-BUBBLE JETS HUGGING THE CONTOUR ===
      if (isListening && (audioData.beatEnvelope ?? audioData.energy) > 0.08) {
        const energy = audioData.beatEnvelope ?? audioData.energy ?? audioData.volume;
        const jetCount = Math.min(32, Math.floor(12 + energy * 32));
        const ringRadius = dimensions.radius + 8 + audioData.bass * 10;
        const jetTime = timeRef.current;

        for (let i = 0; i < jetCount; i++) {
          const angle = (i / jetCount) * Math.PI * 2 + Math.sin(jetTime * 0.6 + i) * 0.08;
          const freqValue = freqs[i % freqsLen] || 0;
          const push = (0.4 + energy * 0.9 + freqValue * 0.8) * 32;
          const jitter = Math.sin(jetTime * 2 + i * 1.7) * 6;

          const startX = dimensions.width / 2 + Math.cos(angle) * ringRadius;
          const startY = dimensions.height / 2 + Math.sin(angle) * ringRadius;
          const endX = dimensions.width / 2 + Math.cos(angle) * (ringRadius + push + jitter);
          const endY = dimensions.height / 2 + Math.sin(angle) * (ringRadius + push + jitter);

          const bubbleSize = 1.2 + energy * 2 + freqValue * 3;
          const alpha = 0.25 + energy * 0.5;

          ctx.save();
          ctx.globalAlpha = Math.min(0.9, alpha);
          const grd = ctx.createLinearGradient(startX, startY, endX, endY);
          grd.addColorStop(0, 'rgba(99,102,241,0.25)');
          grd.addColorStop(1, 'rgba(236,72,153,0.6)');
          ctx.strokeStyle = grd;
          ctx.lineWidth = bubbleSize * 0.6;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          ctx.beginPath();
          ctx.fillStyle = `rgba(236,72,153,${alpha})`;
          ctx.arc(endX, endY, bubbleSize * 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw loop progress ring with gradient
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        dimensions.width / 2,
        dimensions.height / 2,
        dimensions.radius + 8,
        -Math.PI / 2,
        -Math.PI / 2 + loopProgress * Math.PI * 2
      );
      const progressGradient = ctx.createLinearGradient(0, 0, dimensions.width, 0);
      progressGradient.addColorStop(0, 'hsl(239 84% 67%)');
      progressGradient.addColorStop(0.5, 'hsl(280 84% 67%)');
      progressGradient.addColorStop(1, 'hsl(320 84% 67%)');
      ctx.strokeStyle = progressGradient;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [dimensions, strokes, currentStroke, loopProgress, offset, getVisibleStrokes, isListening, audioData, zoom, pan]);

  // Watermark canvas render (separate layer, never affected by eraser)
  useEffect(() => {
    const watermarkCanvas = watermarkCanvasRef.current;
    if (!watermarkCanvas || dimensions.width === 0) return;

    const ctx = watermarkCanvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw watermark
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw watermark text centered
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.35;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Main title
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.strokeText('Démo BubbleLoop', dimensions.width / 2, dimensions.height / 2 - 12);
    ctx.fillText('Démo BubbleLoop', dimensions.width / 2, dimensions.height / 2 - 12);

    // Subtitle
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#8b5cf6';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.strokeText('Version en cours de finalisation', dimensions.width / 2, dimensions.height / 2 + 14);
    ctx.fillText('Version en cours de finalisation', dimensions.width / 2, dimensions.height / 2 + 14);

    ctx.restore();
  }, [dimensions]);

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Middle mouse or Alt+click for panning
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
      canvasRef.current?.setPointerCapture(e.pointerId);
      return;
    }

    const point = getCanvasPoint(e.clientX, e.clientY);
    if (!point) return;

    // Eraser uses white color and full opacity
    const color = brushMode === 'eraser' ? '#ffffff' : brushColor;
    const opacity = brushMode === 'eraser' ? 1 : brushOpacity;
    const stroke = startStroke(point.x, point.y, color, brushSize, opacity, brushMode, stampType, customText, textFont);

    // For stamp mode, end stroke immediately (single stamp per click)
    if (brushMode === 'stamp') {
      endStroke(stroke);
      return;
    }

    setIsDrawing(true);
    canvasRef.current?.setPointerCapture(e.pointerId);
  }, [getCanvasPoint, startStroke, endStroke, brushColor, brushSize, brushOpacity, brushMode, stampType, customText, textFont]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPoint.current.x;
      const dy = e.clientY - lastPanPoint.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (!isDrawing) return;

    const point = getCanvasPoint(e.clientX, e.clientY, false);
    if (point) {
      addPoint(point.x, point.y);
    }
  }, [isDrawing, isPanning, getCanvasPoint, addPoint]);

  const handlePointerUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (isDrawing) {
      setIsDrawing(false);
      endStroke();
    }
  }, [isDrawing, isPanning, endStroke]);

  // Mouse wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.25, Math.min(5, z + delta)));
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-3xl mx-auto px-4">
      {/* Toolbars */}
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <BrushToolbar
            brushMode={brushMode}
            stampType={stampType}
            customText={customText}
            textFont={textFont}
            activeColor={brushColor}
            onBrushModeChange={setBrushMode}
            onStampTypeChange={setStampType}
            onCustomTextChange={setCustomText}
            onTextFontChange={setTextFont}
          />
          <ColorToolbar
            colors={paletteColors}
            activeColor={brushColor}
            onColorChange={setBrushColor}
            onOpenPalette={() => setShowPaletteModal(true)}
          />
        </div>

        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 px-4 py-2 bg-card/80 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs w-12">Taille</span>
              <Slider
                value={[brushSize]}
                min={4}
                max={40}
                step={1}
                onValueChange={(v) => setBrushSize(v[0])}
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
                onValueChange={(v) => setBrushOpacity(v[0] / 100)}
              />
              <span className="text-xs w-8">{Math.round(brushOpacity * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-[500px]"
      >
        {/* Drawing canvas (bottom layer - user drawings + eraser) */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="touch-none absolute inset-0 z-0"
          style={{
            width: dimensions.width || '100%',
            height: dimensions.height || '100%',
            cursor: isPanning ? 'grabbing' : 'crosshair',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          onPointerCancel={handlePointerUp}
        />

        {/* Watermark canvas (top layer - never receives events, immune to eraser) */}
        <canvas
          ref={watermarkCanvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            width: dimensions.width || '100%',
            height: dimensions.height || '100%',
          }}
        />

        {/* Floating effect overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full z-10"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
            transform: `translate(${offset.x * 0.5}px, ${offset.y * 0.5}px)`,
          }}
        />
      </div>

      {/* Bottom Controls */}
      <BottomControls
        progress={loopProgress}
        isPlaying={isPlaying}
        loopDuration={actualLoopDuration}
        onSeek={seekTo}
        onTogglePlayback={togglePlayback}
        onStepBack={stepBackward}
        onStepForward={stepForward}
        loopMode={loopMode}
        onLoopModeChange={setLoopMode}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onClear={clearStrokes}
        onExport={handleOpenExportDialog}
        onOpenGallery={() => setShowGalleryDialog(true)}
        isListening={isListening}
        audioData={audioData}
        onStartMic={startMic}
        onImportAudio={loadAudioFile}
        onStopAudio={stop}
        audioSource={source}
      />

      {/* Color Palette Modal */}
      <ColorPaletteModal
        open={showPaletteModal}
        onOpenChange={setShowPaletteModal}
        colors={paletteColors}
        onColorsChange={setPaletteColors}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        isExporting={isExporting}
        progress={exportProgress}
        videoDataUrl={videoDataUrl}
        onExport={handleExport}
        onSaveToGallery={handleSaveToGallery}
        onDownload={handleDownloadVideo}
        savedToGallery={savedToGallery}
      />

      {/* Gallery Dialog */}
      <GalleryDialog
        open={showGalleryDialog}
        onOpenChange={setShowGalleryDialog}
        items={galleryItems}
        onDelete={deleteItem}
        onRename={renameItem}
      />
    </div>
  );
}
