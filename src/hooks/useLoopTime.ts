import { useState, useRef, useCallback, useEffect } from 'react';

export type BrushMode = 'pencil' | 'glow' | 'particles' | 'stamp' | 'eraser';

export interface LoopPoint {
  x: number;
  y: number;
  t: number; // normalized time 0-1
  pressure?: number;
}

export interface LoopStroke {
  points: LoopPoint[];
  color: string;
  width: number;
  mode: BrushMode;
  stampType?: string;
}

interface UseLoopTimeOptions {
  loopDuration?: number; // in milliseconds
  autoPlay?: boolean;
}

export function useLoopTime(options: UseLoopTimeOptions = {}) {
  const { loopDuration = 10000, autoPlay = true } = options;
  
  const [strokes, setStrokes] = useState<LoopStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<LoopStroke | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [loopProgress, setLoopProgress] = useState(0);
  
  // Undo/Redo history
  const [history, setHistory] = useState<LoopStroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const loopStartRef = useRef<number>(Date.now());
  const animationRef = useRef<number>();

  // Get normalized time (0-1) in the current loop
  const getNormalizedTime = useCallback(() => {
    const elapsed = Date.now() - loopStartRef.current;
    return (elapsed % loopDuration) / loopDuration;
  }, [loopDuration]);

  // Save state to history
  const saveToHistory = useCallback((newStrokes: LoopStroke[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newStrokes];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Start a new stroke
  const startStroke = useCallback((
    x: number, 
    y: number, 
    color: string, 
    width: number, 
    mode: BrushMode = 'pencil',
    stampType?: string
  ) => {
    const t = getNormalizedTime();
    setCurrentStroke({
      points: [{ x, y, t }],
      color,
      width,
      mode,
      stampType,
    });
  }, [getNormalizedTime]);

  // Add point to current stroke
  const addPoint = useCallback((x: number, y: number) => {
    if (!currentStroke) return;
    
    const t = getNormalizedTime();
    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, { x, y, t }],
      };
    });
  }, [currentStroke, getNormalizedTime]);

  // End current stroke
  const endStroke = useCallback(() => {
    if (currentStroke && currentStroke.points.length > 0) {
      setStrokes(prev => {
        const newStrokes = [...prev, currentStroke];
        saveToHistory(newStrokes);
        return newStrokes;
      });
    }
    setCurrentStroke(null);
  }, [currentStroke, saveToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setStrokes(history[newIndex]);
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setStrokes(history[newIndex]);
  }, [history, historyIndex]);

  // Clear all strokes
  const clearStrokes = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    loopStartRef.current = Date.now();
    saveToHistory([]);
  }, [saveToHistory]);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Animation loop for progress tracking
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      setLoopProgress(getNormalizedTime());
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, getNormalizedTime]);

  // Get visible strokes at current loop progress
  const getVisibleStrokes = useCallback((progress: number): LoopStroke[] => {
    return strokes.map(stroke => {
      // Filter points that should be visible at this progress
      const visiblePoints = stroke.points.filter(p => {
        // Handle wrap-around: if stroke started late in loop
        const startT = stroke.points[0]?.t ?? 0;
        if (startT > 0.8 && progress < 0.2) {
          // Stroke wraps around, show if progress is past start or before end
          return p.t >= startT || p.t <= progress;
        }
        return p.t <= progress;
      });

      return { ...stroke, points: visiblePoints };
    }).filter(s => s.points.length > 0);
  }, [strokes]);

  return {
    strokes,
    currentStroke,
    loopProgress,
    isPlaying,
    loopDuration,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    startStroke,
    addPoint,
    endStroke,
    clearStrokes,
    togglePlayback,
    getVisibleStrokes,
    getNormalizedTime,
    undo,
    redo,
  };
}
