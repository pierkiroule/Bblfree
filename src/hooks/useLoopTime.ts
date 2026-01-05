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
  opacity: number;
  mode: BrushMode;
  stampType?: string;
  customText?: string;
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
  const [manualProgress, setManualProgress] = useState<number | null>(null);
  
  // Undo/Redo history
  const [history, setHistory] = useState<LoopStroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const loopStartRef = useRef<number>(Date.now());
  const pauseTimeRef = useRef<number>(0);
  const animationRef = useRef<number>();

  // Get normalized time (0-1) in the current loop
  const getNormalizedTime = useCallback(() => {
    // If paused with manual progress, use that
    if (!isPlaying && manualProgress !== null) {
      return manualProgress;
    }
    const elapsed = Date.now() - loopStartRef.current;
    return (elapsed % loopDuration) / loopDuration;
  }, [loopDuration, isPlaying, manualProgress]);

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
    opacity: number,
    mode: BrushMode = 'pencil',
    stampType?: string,
    customText?: string
  ) => {
    const t = getNormalizedTime();
    setCurrentStroke({
      points: [{ x, y, t }],
      color,
      width,
      opacity,
      mode,
      stampType,
      customText,
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
    setIsPlaying(prev => {
      if (prev) {
        // Pausing - store current progress
        pauseTimeRef.current = getNormalizedTime();
        setManualProgress(pauseTimeRef.current);
      } else {
        // Resuming - adjust loop start to continue from pause point
        const currentProgress = manualProgress ?? pauseTimeRef.current;
        loopStartRef.current = Date.now() - (currentProgress * loopDuration);
        setManualProgress(null);
      }
      return !prev;
    });
  }, [getNormalizedTime, manualProgress, loopDuration]);

  // Seek to specific progress (0-1)
  const seekTo = useCallback((progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    setManualProgress(clampedProgress);
    setLoopProgress(clampedProgress);
    
    // If playing, also update loop start
    if (isPlaying) {
      loopStartRef.current = Date.now() - (clampedProgress * loopDuration);
    }
  }, [isPlaying, loopDuration]);

  // Step forward/backward
  const stepForward = useCallback(() => {
    const step = 0.02; // 2% of loop
    const current = manualProgress ?? loopProgress;
    seekTo((current + step) % 1);
  }, [manualProgress, loopProgress, seekTo]);

  const stepBackward = useCallback(() => {
    const step = 0.02; // 2% of loop
    const current = manualProgress ?? loopProgress;
    seekTo((current - step + 1) % 1);
  }, [manualProgress, loopProgress, seekTo]);

  // Animation loop for progress tracking
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // When paused, use manual progress
      if (manualProgress !== null) {
        setLoopProgress(manualProgress);
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
  }, [isPlaying, getNormalizedTime, manualProgress]);

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
    seekTo,
    stepForward,
    stepBackward,
  };
}
