import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, PencilBrush, CircleBrush, SprayBrush, FabricObject } from 'fabric';
import { toast } from 'sonner';
import CanvasToolbar from './CanvasToolbar';
import ColorPalette from './ColorPalette';

export type BrushType = 'pencil' | 'brush' | 'spray' | 'eraser';

interface DrawingCanvasProps {
  size?: number;
}

export default function DrawingCanvas({ size = 500 }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState('#6366f1');
  const [brushSize, setBrushSize] = useState(8);
  const [activeBrush, setActiveBrush] = useState<BrushType>('pencil');
  const [canvasSize, setCanvasSize] = useState(size);
  
  // Undo/Redo state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Calculate size based on container
    const container = containerRef.current;
    const computedSize = Math.min(container.offsetWidth, container.offsetHeight, 600);
    setCanvasSize(computedSize);

    const canvas = new FabricCanvas(canvasRef.current, {
      width: computedSize,
      height: computedSize,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    });

    // Set initial brush
    const pencilBrush = new PencilBrush(canvas);
    pencilBrush.color = activeColor;
    pencilBrush.width = brushSize;
    canvas.freeDrawingBrush = pencilBrush;

    setFabricCanvas(canvas);

    // Save initial state
    const initialState = JSON.stringify(canvas.toJSON());
    setHistory([initialState]);
    setHistoryIndex(0);

    toast.success('Canvas prêt !', { description: 'Commencez à dessiner' });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Save state after drawing
  useEffect(() => {
    if (!fabricCanvas) return;

    const saveState = () => {
      if (isUndoRedo.current) {
        isUndoRedo.current = false;
        return;
      }

      const json = JSON.stringify(fabricCanvas.toJSON());
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        return [...newHistory, json];
      });
      setHistoryIndex(prev => prev + 1);
    };

    fabricCanvas.on('path:created', saveState);
    fabricCanvas.on('object:modified', saveState);

    return () => {
      fabricCanvas.off('path:created', saveState);
      fabricCanvas.off('object:modified', saveState);
    };
  }, [fabricCanvas, historyIndex]);

  // Update brush when settings change
  useEffect(() => {
    if (!fabricCanvas) return;

    let brush;
    
    switch (activeBrush) {
      case 'brush':
        brush = new CircleBrush(fabricCanvas);
        break;
      case 'spray':
        brush = new SprayBrush(fabricCanvas);
        (brush as SprayBrush).density = 20;
        break;
      case 'eraser':
        brush = new PencilBrush(fabricCanvas);
        brush.color = '#ffffff';
        break;
      case 'pencil':
      default:
        brush = new PencilBrush(fabricCanvas);
        break;
    }

    if (activeBrush !== 'eraser') {
      brush.color = activeColor;
    }
    brush.width = brushSize;
    fabricCanvas.freeDrawingBrush = brush;
    fabricCanvas.isDrawingMode = true;
  }, [activeBrush, activeColor, brushSize, fabricCanvas]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (!fabricCanvas || historyIndex <= 0) return;

    isUndoRedo.current = true;
    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    
    fabricCanvas.loadFromJSON(JSON.parse(state)).then(() => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [fabricCanvas, history, historyIndex]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;

    isUndoRedo.current = true;
    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    
    fabricCanvas.loadFromJSON(JSON.parse(state)).then(() => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [fabricCanvas, history, historyIndex]);

  // Clear canvas
  const handleClear = useCallback(() => {
    if (!fabricCanvas) return;
    
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    
    const json = JSON.stringify(fabricCanvas.toJSON());
    setHistory(prev => [...prev, json]);
    setHistoryIndex(prev => prev + 1);
    
    toast.success('Canvas effacé !');
  }, [fabricCanvas]);

  // Download canvas
  const handleDownload = useCallback(() => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    link.download = `bubbleloop-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    toast.success('Image téléchargée !');
  }, [fabricCanvas]);

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {/* Toolbar */}
      <CanvasToolbar
        activeBrush={activeBrush}
        brushSize={brushSize}
        onBrushChange={setActiveBrush}
        onBrushSizeChange={setBrushSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onDownload={handleDownload}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      {/* Color Palette */}
      <ColorPalette 
        activeColor={activeColor} 
        onColorChange={setActiveColor} 
      />

      {/* Canvas Container - Circular */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[600px] aspect-square"
      >
        <div 
          className="absolute inset-0 rounded-full bg-card shadow-elevated border-[6px] border-card overflow-hidden flex items-center justify-center"
          style={{ 
            clipPath: 'circle(50% at center)',
          }}
        >
          <canvas 
            ref={canvasRef} 
            className="touch-none"
            style={{
              borderRadius: '50%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
