import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLoopTime, BrushMode } from '@/hooks/useLoopTime';
import { useCameraMotion } from '@/hooks/useCameraMotion';
import { useAudioReactive } from '@/hooks/useAudioReactive';
import { renderStroke, StampType } from './BrushRenderer';
import BubbleControls from './BubbleControls';
import Timeline from './Timeline';

interface BubbleCanvasProps {
  loopDuration?: number;
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#ffffff', '#1e1b4b',
];

export default function BubbleCanvas({ loopDuration = 10000 }: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, radius: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#6366f1');
  const [brushSize, setBrushSize] = useState(8);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [brushMode, setBrushMode] = useState<BrushMode>('pencil');
  const [stampType, setStampType] = useState<StampType>('star');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  const {
    strokes,
    currentStroke,
    loopProgress,
    isPlaying,
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
  } = useLoopTime({ loopDuration });

  const { offset } = useCameraMotion({ intensity: 0.4, enabled: true });
  
  const { isListening, audioData, toggleListening } = useAudioReactive();

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
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

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const startTime = performance.now();

    const render = () => {
      timeRef.current = (performance.now() - startTime) / 1000;

      // Audio reactive values
      const audioScale = isListening ? 1 + audioData.bass * 0.15 : 1;
      const audioGlow = isListening ? audioData.volume * 0.5 : 0;
      const audioPulse = isListening ? Math.sin(timeRef.current * 8) * audioData.treble * 5 : 0;

      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw background circle with audio-reactive gradient
      ctx.save();
      const bgGradient = ctx.createRadialGradient(
        dimensions.width / 2, dimensions.height / 2, 0,
        dimensions.width / 2, dimensions.height / 2, dimensions.radius
      );
      
      if (isListening && audioData.volume > 0.1) {
        const hue = 239 + audioData.mid * 60;
        bgGradient.addColorStop(0, `hsl(${hue} 30% 98%)`);
        bgGradient.addColorStop(1, `hsl(${hue} 40% 95%)`);
      } else {
        bgGradient.addColorStop(0, '#ffffff');
        bgGradient.addColorStop(1, '#f8fafc');
      }
      
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
      ctx.clip();

      // Apply zoom and pan transform for content only
      ctx.save();
      ctx.translate(dimensions.width / 2 + pan.x, dimensions.height / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-dimensions.width / 2, -dimensions.height / 2);

      // Draw visible strokes with camera offset and audio reactivity
      const visibleStrokes = getVisibleStrokes(loopProgress);
      visibleStrokes.forEach((stroke, i) => {
        // Apply audio-reactive scale transformation
        const strokeScale = isListening ? 1 + (audioData.frequencies[i % audioData.frequencies.length] || 0) * 0.1 : 1;
        
        ctx.save();
        ctx.translate(dimensions.width / 2, dimensions.height / 2);
        ctx.scale(strokeScale * audioScale, strokeScale * audioScale);
        ctx.translate(-dimensions.width / 2, -dimensions.height / 2);
        
        renderStroke(
          ctx,
          stroke,
          dimensions.width / 2,
          dimensions.height / 2,
          offset.x + audioPulse,
          offset.y + audioPulse,
          timeRef.current
        );
        ctx.restore();
      });

      // Draw current stroke
      if (currentStroke) {
        renderStroke(
          ctx,
          currentStroke,
          dimensions.width / 2,
          dimensions.height / 2,
          offset.x,
          offset.y,
          timeRef.current
        );
      }

      // Close content transform (zoom/pan)
      ctx.restore();
      // Close background clip
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

    setIsDrawing(true);
    canvasRef.current?.setPointerCapture(e.pointerId);
    
    // Eraser uses white color and full opacity
    const color = brushMode === 'eraser' ? '#ffffff' : brushColor;
    const opacity = brushMode === 'eraser' ? 1 : brushOpacity;
    startStroke(point.x, point.y, color, brushSize, opacity, brushMode, stampType);
  }, [getCanvasPoint, startStroke, brushColor, brushSize, brushOpacity, brushMode, stampType]);

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

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Controls */}
      <BubbleControls
        colors={COLORS}
        activeColor={brushColor}
        brushSize={brushSize}
        brushOpacity={brushOpacity}
        brushMode={brushMode}
        stampType={stampType}
        isPlaying={isPlaying}
        loopProgress={loopProgress}
        zoom={zoom}
        canUndo={canUndo}
        canRedo={canRedo}
        isListening={isListening}
        audioData={audioData}
        onColorChange={setBrushColor}
        onBrushSizeChange={setBrushSize}
        onBrushOpacityChange={setBrushOpacity}
        onBrushModeChange={setBrushMode}
        onStampTypeChange={setStampType}
        onTogglePlayback={togglePlayback}
        onClear={clearStrokes}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onUndo={undo}
        onRedo={redo}
        onToggleAudio={toggleListening}
      />

      {/* Timeline Scrubber */}
      <Timeline
        progress={loopProgress}
        isPlaying={isPlaying}
        loopDuration={actualLoopDuration}
        onSeek={seekTo}
        onTogglePlayback={togglePlayback}
        onStepBack={stepBackward}
        onStepForward={stepForward}
      />

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-[600px]"
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="touch-none"
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

        {/* Floating effect overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
            transform: `translate(${offset.x * 0.5}px, ${offset.y * 0.5}px)`,
          }}
        />
      </div>

      {/* Mode indicator */}
      <p className="text-xs text-muted-foreground text-center">
        {brushMode === 'pencil' && '✏️ Crayon'}
        {brushMode === 'glow' && '✨ Glow'}
        {brushMode === 'particles' && '🌟 Particules'}
        {brushMode === 'stamp' && `🎨 ${stampType}`}
        {brushMode === 'eraser' && '🧹 Gomme'}
        {isListening && ' • 🎤 Audio'}
        {zoom !== 1 && ` • 🔍 ${Math.round(zoom * 100)}%`}
      </p>
    </div>
  );
}
