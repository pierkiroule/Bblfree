import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLoopTime, LoopStroke } from '@/hooks/useLoopTime';
import { useCameraMotion } from '@/hooks/useCameraMotion';
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
  const [brushSize, setBrushSize] = useState(6);

  const {
    strokes,
    currentStroke,
    loopProgress,
    isPlaying,
    startStroke,
    addPoint,
    endStroke,
    clearStrokes,
    togglePlayback,
    getVisibleStrokes,
  } = useLoopTime({ loopDuration });

  const { offset } = useCameraMotion({ intensity: 0.4, enabled: true });

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

  // Draw a stroke
  const drawStroke = useCallback((
    ctx: CanvasRenderingContext2D,
    stroke: LoopStroke,
    offsetX: number,
    offsetY: number
  ) => {
    if (stroke.points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const firstPoint = stroke.points[0];
    ctx.moveTo(
      firstPoint.x + dimensions.width / 2 + offsetX,
      firstPoint.y + dimensions.height / 2 + offsetY
    );

    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      ctx.lineTo(
        point.x + dimensions.width / 2 + offsetX,
        point.y + dimensions.height / 2 + offsetY
      );
    }

    ctx.stroke();
    ctx.restore();
  }, [dimensions]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw background circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        dimensions.width / 2,
        dimensions.height / 2,
        dimensions.radius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip();

      // Draw visible strokes with camera offset
      const visibleStrokes = getVisibleStrokes(loopProgress);
      visibleStrokes.forEach(stroke => {
        drawStroke(ctx, stroke, offset.x, offset.y);
      });

      // Draw current stroke
      if (currentStroke) {
        drawStroke(ctx, currentStroke, offset.x, offset.y);
      }

      ctx.restore();

      // Draw border glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        dimensions.width / 2,
        dimensions.height / 2,
        dimensions.radius,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = 'hsl(239 84% 67% / 0.3)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // Draw loop progress ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        dimensions.width / 2,
        dimensions.height / 2,
        dimensions.radius + 6,
        -Math.PI / 2,
        -Math.PI / 2 + loopProgress * Math.PI * 2
      );
      ctx.strokeStyle = 'hsl(239 84% 67%)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [dimensions, strokes, currentStroke, loopProgress, offset, getVisibleStrokes, drawStroke]);

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    if (!point) return;

    setIsDrawing(true);
    canvasRef.current?.setPointerCapture(e.pointerId);
    startStroke(point.x, point.y, brushColor, brushSize);
  }, [getCanvasPoint, startStroke, brushColor, brushSize]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e.clientX, e.clientY);
    if (point) {
      addPoint(point.x, point.y);
    }
  }, [isDrawing, getCanvasPoint, addPoint]);

  const handlePointerUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      endStroke();
    }
  }, [isDrawing, endStroke]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Controls */}
      <BubbleControls
        colors={COLORS}
        activeColor={brushColor}
        brushSize={brushSize}
        isPlaying={isPlaying}
        loopProgress={loopProgress}
        onColorChange={setBrushColor}
        onBrushSizeChange={setBrushSize}
        onTogglePlayback={togglePlayback}
        onClear={clearStrokes}
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
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            transform: `translate(${offset.x * 0.5}px, ${offset.y * 0.5}px)`,
          }}
        />
      </div>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center max-w-md">
        Dessinez dans la bulle • Vos traits se rejouent en boucle ({loopDuration / 1000}s) • 
        La caméra flotte doucement pour un effet immersif
      </p>
    </div>
  );
}
