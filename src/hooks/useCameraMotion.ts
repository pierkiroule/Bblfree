import { useState, useRef, useEffect, useCallback } from 'react';

interface CameraOffset {
  x: number;
  y: number;
}

interface UseCameraMotionOptions {
  intensity?: number; // 0-1, how strong the motion is
  speed?: number; // how fast the drift happens
  enabled?: boolean;
}

// Simple noise function for smooth random movement
function noise(t: number, seed: number = 0): number {
  const x = Math.sin(t * 1.1 + seed) * 0.5;
  const y = Math.sin(t * 0.7 + seed * 2.3) * 0.3;
  const z = Math.sin(t * 1.3 + seed * 0.7) * 0.2;
  return x + y + z;
}

export function useCameraMotion(options: UseCameraMotionOptions = {}) {
  const { intensity = 0.3, speed = 0.0003, enabled = true } = options;
  
  const [offset, setOffset] = useState<CameraOffset>({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const userInfluenceRef = useRef<CameraOffset>({ x: 0, y: 0 });

  // Maximum offset in pixels
  const maxOffset = 30 * intensity;

  // Apply user influence (from gestures)
  const applyInfluence = useCallback((dx: number, dy: number) => {
    userInfluenceRef.current = {
      x: userInfluenceRef.current.x + dx * 0.1,
      y: userInfluenceRef.current.y + dy * 0.1,
    };
  }, []);

  // Reset camera to center
  const resetCamera = useCallback(() => {
    userInfluenceRef.current = { x: 0, y: 0 };
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const t = elapsed * speed;

      // Calculate noise-based drift
      const noiseX = noise(t, 0) * maxOffset;
      const noiseY = noise(t, 100) * maxOffset;

      // Decay user influence over time
      userInfluenceRef.current = {
        x: userInfluenceRef.current.x * 0.995,
        y: userInfluenceRef.current.y * 0.995,
      };

      // Combine noise with user influence
      const finalX = noiseX + userInfluenceRef.current.x;
      const finalY = noiseY + userInfluenceRef.current.y;

      // Clamp to max offset
      setOffset({
        x: Math.max(-maxOffset * 2, Math.min(maxOffset * 2, finalX)),
        y: Math.max(-maxOffset * 2, Math.min(maxOffset * 2, finalY)),
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, maxOffset, speed]);

  return {
    offset,
    applyInfluence,
    resetCamera,
  };
}
