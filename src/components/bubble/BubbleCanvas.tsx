import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLoopTime, BrushMode } from '@/hooks/useLoopTime';
import { useCameraMotion } from '@/hooks/useCameraMotion';
import { useAudioReactive } from '@/hooks/useAudioReactive';
import { renderStroke, StampType } from './BrushRenderer';
import BubbleControls from './BubbleControls';

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
  const [brushMode, setBrushMode] = useState<BrushMode>('pencil');
  const [stampType, setStampType] = useState<StampType>('star');
  const [zoom, setZoom] = useState(1);
  const timeRef = useRef(0);

  const {
    strokes,
    currentStroke,
    loopProgress,
    isPlaying,
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
  } = useLoopTime({ loopDuration });

  const { offset } = useCameraMotion({ intensity: 0.4, enabled: true });
  
  const { isListening, audioData, toggleListening } = useAudioReactive();

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));

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

  // Get center-relative coordinates
  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left - dimensions.width / 2;
    const y = clientY - rect.top - dimensions.height / 2;

    // Check if point is inside the circle
    const dist = Math.sqrt(x * x + y * y);
    if (dist > dimensions.radius) return null;

    return { x, y };
  }, [dimensions]);

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

      // Apply zoom
      ctx.save();
      ctx.translate(dimensions.width / 2, dimensions.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-dimensions.width / 2, -dimensions.height / 2);

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

      // Close zoom transform
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [dimensions, strokes, currentStroke, loopProgress, offset, getVisibleStrokes, isListening, audioData, zoom]);

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    if (!point) return;

    // Apply inverse zoom to coordinates
    const zoomedPoint = {
      x: point.x / zoom,
      y: point.y / zoom,
    };

    setIsDrawing(true);
    canvasRef.current?.setPointerCapture(e.pointerId);
    
    // Eraser uses white color
    const color = brushMode === 'eraser' ? '#ffffff' : brushColor;
    startStroke(zoomedPoint.x, zoomedPoint.y, color, brushSize, brushMode, stampType);
  }, [getCanvasPoint, startStroke, brushColor, brushSize, brushMode, stampType, zoom]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e.clientX, e.clientY);
    if (point) {
      // Apply inverse zoom to coordinates
      addPoint(point.x / zoom, point.y / zoom);
    }
  }, [isDrawing, getCanvasPoint, addPoint, zoom]);

  const handlePointerUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      endStroke();
    }
  }, [isDrawing, endStroke]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Controls */}
      <BubbleControls
        colors={COLORS}
        activeColor={brushColor}
        brushSize={brushSize}
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

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-[600px]"
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="touch-none cursor-crosshair"
          style={{
            width: dimensions.width || '100%',
            height: dimensions.height || '100%',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
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
        {brushMode === 'pencil' && '✏️ Crayon classique'}
        {brushMode === 'glow' && '✨ Trail lumineux avec halo'}
        {brushMode === 'particles' && '🌟 Particules flottantes'}
        {brushMode === 'stamp' && `🎨 Tampons ${stampType}`}
        {brushMode === 'eraser' && '🧹 Gomme dure'}
        {isListening && ' • 🎤 Audio réactif'}
        {zoom !== 1 && ` • 🔍 ${Math.round(zoom * 100)}%`}
        {' • '} Boucle de {loopDuration / 1000}s
      </p>
    </div>
  );
}
