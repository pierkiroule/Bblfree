import { useState, useRef, useCallback, useEffect } from 'react';

export type BrushMode = 'pencil' | 'glow' | 'particles' | 'stamp' | 'eraser';
export type LoopMode = 'loop' | 'ping-pong';

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
  textFont?: string;
}

interface UseLoopTimeOptions {
  loopDuration?: number; // in milliseconds
  autoPlay?: boolean;
  initialMode?: LoopMode;
}

export function useLoopTime(options: UseLoopTimeOptions = {}) {
  const { loopDuration = 10000, autoPlay = true, initialMode = 'loop' } = options;
  
  const [strokes, setStrokes] = useState<LoopStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<LoopStroke | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [loopProgress, setLoopProgress] = useState(0);
  const [manualProgress, setManualProgress] = useState<number | null>(null);
  const [loopMode, setLoopModeState] = useState<LoopMode>(initialMode);
  
  // Undo/Redo history
  const [history, setHistory] = useState<LoopStroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const loopStartRef = useRef<number>(Date.now());
  const directionRef = useRef<1 | -1>(1);
  const animationRef = useRef<number>();

  const getCycleDuration = useCallback((mode: LoopMode = loopMode) => (
    mode === 'ping-pong' ? loopDuration * 2 : loopDuration
  ), [loopDuration, loopMode]);

  const getCycleTimeForProgress = useCallback((
    progress: number,
    direction: 1 | -1 = 1,
    mode: LoopMode = loopMode
  ) => {
    const clamped = Math.max(0, Math.min(1, progress));
    if (mode === 'ping-pong') {
      if (direction === -1) {
        return loopDuration + (1 - clamped) * loopDuration;
      }
      return clamped * loopDuration;
    }
    return clamped * loopDuration;
  }, [loopDuration, loopMode]);

  const getLoopState = useCallback((allowManual = true) => {
    if (allowManual && !isPlaying && manualProgress !== null) {
      return { progress: manualProgress, direction: directionRef.current };
    }

    const cycleDuration = getCycleDuration();
    const elapsed = Date.now() - loopStartRef.current;
    const cycleTime = ((elapsed % cycleDuration) + cycleDuration) % cycleDuration;

    if (loopMode === 'ping-pong') {
      if (cycleTime <= loopDuration) {
        return { progress: cycleTime / loopDuration, direction: 1 as const };
      }
      const backwardTime = cycleTime - loopDuration;
      return { progress: 1 - backwardTime / loopDuration, direction: -1 as const };
    }

    return { progress: cycleTime / loopDuration, direction: 1 as const };
  }, [getCycleDuration, isPlaying, loopMode, loopDuration, manualProgress]);

  // Get normalized time (0-1) in the current loop
  const getNormalizedTime = useCallback(() => {
    return getLoopState().progress;
  }, [getLoopState]);

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
    customText?: string,
    textFont?: string
  ): LoopStroke => {
    const t = getNormalizedTime();
    const stroke: LoopStroke = {
      points: [{ x, y, t }],
      color,
      width,
      opacity,
      mode,
      stampType,
      customText,
      textFont,
    };
    setCurrentStroke(stroke);
    return stroke;
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
  const endStroke = useCallback((strokeOverride?: LoopStroke | null) => {
    const strokeToCommit = strokeOverride ?? currentStroke;

    if (strokeToCommit && strokeToCommit.points.length > 0) {
      setStrokes(prev => {
        const newStrokes = [...prev, strokeToCommit];
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

  const syncLoopStart = useCallback((progress: number, direction: 1 | -1 = 1, mode: LoopMode = loopMode) => {
    const cycleTime = getCycleTimeForProgress(progress, direction, mode);
    loopStartRef.current = Date.now() - cycleTime;
  }, [getCycleTimeForProgress, loopMode]);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => {
      if (prev) {
        const { progress, direction } = getLoopState(false);
        directionRef.current = direction;
        setManualProgress(progress);
        return false;
      }

      const resumeProgress = manualProgress ?? getLoopState(false).progress;
      syncLoopStart(resumeProgress, directionRef.current);
      setManualProgress(null);
      return true;
    });
  }, [getLoopState, manualProgress, syncLoopStart]);

  // Seek to specific progress (0-1)
  const seekTo = useCallback((progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    setManualProgress(clampedProgress);
    setLoopProgress(clampedProgress);
    
    // If playing, also update loop start
    if (isPlaying) {
      const { direction } = getLoopState(false);
      directionRef.current = direction;
      syncLoopStart(clampedProgress, direction);
    }
  }, [getLoopState, isPlaying, syncLoopStart]);

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

  const setLoopMode = useCallback((mode: LoopMode) => {
    setLoopModeState(prev => {
      if (prev === mode) return prev;
      const { progress, direction } = getLoopState();
      const nextDirection = mode === 'ping-pong' ? direction : 1;
      directionRef.current = nextDirection;
      syncLoopStart(progress, nextDirection, mode);
      return mode;
    });
  }, [getLoopState, syncLoopStart]);

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
    loopMode,
    togglePlayback,
    getVisibleStrokes,
    getNormalizedTime,
    undo,
    redo,
    seekTo,
    stepForward,
    stepBackward,
    setLoopMode,
  };
}
