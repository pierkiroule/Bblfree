import { useCallback, useState } from 'react';
import GIF from 'gif.js';
import { LoopStroke, BrushMode } from './useLoopTime';
import { renderStroke } from '@/components/bubble/BrushRenderer';

interface ExportOptions {
  width: number;
  height: number;
  radius: number;
  loopDuration: number;
  strokes: LoopStroke[];
  fps?: number;
  quality?: number;
}

export function useGifExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportGif = useCallback(async (options: ExportOptions): Promise<{ gif: string; thumbnail: string }> => {
    const { width, height, radius, loopDuration, strokes, fps = 20, quality = 10 } = options;

    return new Promise((resolve, reject) => {
      setIsExporting(true);
      setProgress(0);

      const gif = new GIF({
        workers: 2,
        quality,
        width,
        height,
        workerScript: '/gif.worker.js',
      });

      const totalFrames = Math.floor((loopDuration / 1000) * fps);
      const frameDelay = 1000 / fps;

      // Create offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      let thumbnailDataUrl = '';

      // Generate frames
      for (let i = 0; i < totalFrames; i++) {
        const progress = i / totalFrames;
        
        // Clear and draw background
        ctx.clearRect(0, 0, width, height);
        
        // Background circle
        ctx.save();
        const bgGradient = ctx.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, radius
        );
        bgGradient.addColorStop(0, '#ffffff');
        bgGradient.addColorStop(1, '#f8fafc');
        
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = bgGradient;
        ctx.fill();
        ctx.clip();

        // Get visible strokes for this progress
        const visibleStrokes = getVisibleStrokesForProgress(strokes, progress);
        
        visibleStrokes.forEach(stroke => {
          renderStroke(ctx, stroke, width / 2, height / 2, 0, 0, i * frameDelay / 1000);
        });

        ctx.restore();

        // Border
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        const borderGradient = ctx.createLinearGradient(0, 0, width, height);
        borderGradient.addColorStop(0, 'hsl(239, 84%, 67%)');
        borderGradient.addColorStop(0.5, 'hsl(280, 84%, 67%)');
        borderGradient.addColorStop(1, 'hsl(239, 84%, 67%)');
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();

        // Progress ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          width / 2,
          height / 2,
          radius + 8,
          -Math.PI / 2,
          -Math.PI / 2 + progress * Math.PI * 2
        );
        const progressGradient = ctx.createLinearGradient(0, 0, width, 0);
        progressGradient.addColorStop(0, 'hsl(239, 84%, 67%)');
        progressGradient.addColorStop(0.5, 'hsl(280, 84%, 67%)');
        progressGradient.addColorStop(1, 'hsl(320, 84%, 67%)');
        ctx.strokeStyle = progressGradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // Watermark "BubbleLoop" bottom right
        ctx.save();
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('BubbleLoop', width - 10, height - 10);
        ctx.restore();

        // Add frame to GIF
        gif.addFrame(ctx, { copy: true, delay: frameDelay });

        // Capture thumbnail at middle of animation
        if (i === Math.floor(totalFrames / 2)) {
          thumbnailDataUrl = canvas.toDataURL('image/png');
        }

        setProgress((i + 1) / totalFrames * 0.8); // 80% for frame generation
      }

      gif.on('progress', (p: number) => {
        setProgress(0.8 + p * 0.2); // Last 20% for encoding
      });

      gif.on('finished', (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          setIsExporting(false);
          setProgress(1);
          resolve({
            gif: reader.result as string,
            thumbnail: thumbnailDataUrl,
          });
        };
        reader.onerror = () => {
          setIsExporting(false);
          reject(new Error('Failed to read GIF blob'));
        };
        reader.readAsDataURL(blob);
      });

      gif.render();
    });
  }, []);

  return {
    exportGif,
    isExporting,
    progress,
  };
}

// Helper to get visible strokes at a specific progress point
function getVisibleStrokesForProgress(strokes: LoopStroke[], progress: number): LoopStroke[] {
  return strokes.map(stroke => {
    // Filter points that should be visible at this progress
    const visiblePoints = stroke.points.filter(p => {
      const startT = stroke.points[0]?.t ?? 0;
      if (startT > 0.8 && progress < 0.2) {
        return p.t >= startT || p.t <= progress;
      }
      return p.t <= progress;
    });

    return { ...stroke, points: visiblePoints };
  }).filter(s => s.points.length > 0);
}
