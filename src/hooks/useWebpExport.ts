import { useCallback, useState } from 'react';
import { LoopStroke } from './useLoopTime';
import { AudioData } from './useAudioReactive';
import { renderStroke } from '@/components/bubble/BrushRenderer';

const EMPTY_AUDIO: AudioData = {
  volume: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  frequencies: [],
  energy: 0,
  beatEnvelope: 0,
};

interface ExportOptions {
  width: number;
  height: number;
  radius: number;
  loopDuration: number;
  strokes: LoopStroke[];
  fps?: number;
  isListening?: boolean;
  /**
   * Callback that returns the latest audio analysis values during the export.
   * When provided, audio-reactive visuals are injected in the render.
   */
  getAudioSnapshot?: () => AudioData | null;
}

interface RenderParams {
  ctx: CanvasRenderingContext2D;
  offCtx: CanvasRenderingContext2D;
  width: number;
  height: number;
  radius: number;
  strokes: LoopStroke[];
  loopProgress: number;
  time: number;
  audio: AudioData;
  isListening: boolean;
}

export function useWebpExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportWebp = useCallback(
    async (options: ExportOptions): Promise<{ video: string; thumbnail: string }> => {
      const {
        width,
        height,
        radius,
        loopDuration,
        strokes,
        fps = 24,
        isListening = false,
        getAudioSnapshot,
      } = options;

      if (typeof MediaRecorder === 'undefined') {
        throw new Error("L'export vidéo nécessite un navigateur compatible MediaRecorder.");
      }

      setIsExporting(true);
      setProgress(0);

      try {
        const totalFrames = Math.max(1, Math.floor((loopDuration / 1000) * fps));
        const frameDelay = 1000 / fps;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Impossible d'initialiser le contexte de rendu");

        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) throw new Error("Impossible d'initialiser le contexte hors-écran");

        const stream = canvas.captureStream(fps);
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';

        const chunks: BlobPart[] = [];
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 6_000_000,
        });

        const recordingDone = new Promise<void>((resolve, reject) => {
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          recorder.onerror = () => reject(recorder.error ?? new Error('Erreur enregistrement vidéo'));
          recorder.onstop = () => resolve();
        });

        recorder.start();

        let thumbnail = '';
        for (let i = 0; i < totalFrames; i++) {
          const loopProgress = i / totalFrames;
          const time = loopProgress * (loopDuration / 1000);
          const audio = getAudioSnapshot?.() ?? EMPTY_AUDIO;

          drawFrame({
            ctx,
            offCtx,
            width,
            height,
            radius,
            strokes,
            loopProgress,
            time,
            audio,
            isListening,
          });

          if (i === Math.floor(totalFrames / 2)) {
            thumbnail = canvas.toDataURL('image/webp', 0.92);
          }

          setProgress((i + 1) / totalFrames);
          await wait(frameDelay);
        }

        recorder.stop();
        await recordingDone;
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunks, { type: mimeType });
        const video = await blobToDataUrl(blob);

        setProgress(1);
        return { video, thumbnail };
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return {
    exportWebp,
    isExporting,
    progress,
  };
}

function drawFrame({
  ctx,
  offCtx,
  width,
  height,
  radius,
  strokes,
  loopProgress,
  time,
  audio,
  isListening,
}: RenderParams) {
  const beatEnvelope = isListening ? audio.beatEnvelope ?? audio.energy ?? audio.volume : 0;
  const audioScale = isListening ? 1 + audio.bass * 0.15 : 1;
  const audioGlow = beatEnvelope * 0.4;
  const audioPulse = isListening ? Math.sin(time * 8) * (audio.treble * 5 + beatEnvelope * 4) : 0;

  // Background circle
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, radius);
  bgGradient.addColorStop(0, '#ffffff');
  bgGradient.addColorStop(1, '#f8fafc');
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = bgGradient;
  ctx.fill();
  ctx.restore();

  // Offscreen strokes
  offCtx.clearRect(0, 0, width, height);
  const freqs = audio.frequencies;
  const freqsLen = freqs.length || 1;
  const visibleStrokes = getVisibleStrokesForProgress(strokes, loopProgress);
  visibleStrokes.forEach((stroke, i) => {
    const freqValue = freqs[i % freqsLen] || 0;
    const energy = audio.beatEnvelope ?? audio.energy ?? audio.volume;
    const strokeScale = isListening ? 1 + freqValue * 0.1 : 1;
    const widthBoost = 1 + energy * 0.35 + freqValue * 0.45;
    const boostedOpacity = Math.min(1, (stroke.opacity ?? 1) + energy * 0.25);
    const boostedStroke: LoopStroke = {
      ...stroke,
      width: stroke.width * widthBoost,
      opacity: boostedOpacity,
    };

    offCtx.save();
    offCtx.translate(width / 2, height / 2);
    offCtx.scale(strokeScale * audioScale, strokeScale * audioScale);
    offCtx.translate(-width / 2, -height / 2);
    renderStroke(
      offCtx,
      boostedStroke,
      width / 2,
      height / 2,
      audioPulse,
      audioPulse,
      time,
      isListening ? { volume: audio.volume, treble: audio.treble } : undefined,
    );
    offCtx.restore();
  });

  // Composite strokes inside the bubble
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(offCtx.canvas, 0, 0);
  ctx.restore();

  // Border glow with audio-reactive accent
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  const glowIntensity = 0.4 + audioGlow;
  borderGradient.addColorStop(0, `hsl(239 84% 67% / ${glowIntensity})`);
  borderGradient.addColorStop(0.5, `hsl(280 84% 67% / ${glowIntensity * 0.5})`);
  borderGradient.addColorStop(1, `hsl(239 84% 67% / ${glowIntensity})`);
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 4 + (isListening ? audio.bass * 4 : 0);
  ctx.stroke();

  if (isListening && audio.volume > 0.15) {
    ctx.save();
    ctx.filter = `blur(${8 + audio.bass * 12}px)`;
    ctx.globalAlpha = audio.volume * 0.6;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius + audio.bass * 10, 0, Math.PI * 2);
    const pulseGradient = ctx.createLinearGradient(0, 0, width, height);
    pulseGradient.addColorStop(0, 'hsl(280 84% 67%)');
    pulseGradient.addColorStop(0.5, 'hsl(320 84% 67%)');
    pulseGradient.addColorStop(1, 'hsl(239 84% 67%)');
    ctx.strokeStyle = pulseGradient;
    ctx.lineWidth = 6 + audio.bass * 8;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Audio reactive ring
  if (isListening) {
    ctx.save();
    ctx.beginPath();
    const ringRadius = radius + 6 + audio.bass * 12;
    ctx.arc(width / 2, height / 2, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(280, 90%, 65%, ${0.35 + audio.volume * 0.4})`;
    ctx.lineWidth = 2 + audio.bass * 2;
    ctx.shadowBlur = 10 + audio.bass * 20;
    ctx.shadowColor = 'hsla(280,90%,70%,0.6)';
    ctx.stroke();
    ctx.restore();
  }

  // Micro-bubbles around the bubble
  if (isListening && audio.volume > 0.05) {
    const strokeColors = visibleStrokes.filter((s) => s.mode !== 'eraser').map((s) => s.color);
    const bubbleColors =
      strokeColors.length > 0 ? strokeColors : ['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4'];

    const bubbleCount = Math.floor(16 + audio.volume * 24);

    for (let i = 0; i < bubbleCount; i++) {
      const seed = i * 137.5;
      const lifecycleDuration = 3 + (seed % 30) / 10;
      const bubbleTime = (time + seed / 50) % lifecycleDuration;
      const lifecycleProgress = bubbleTime / lifecycleDuration;

      const baseAngle = ((seed % 360) / 360) * Math.PI * 2;
      const wobble = Math.sin(time * 3 + i * 2) * 0.15 * lifecycleProgress;
      const angle = baseAngle + wobble;

      const ringRadius = radius + 6 + audio.bass * 12;
      const startDist = ringRadius;
      const maxEscape = 40 + (seed % 20);
      const escapeEase = 1 - Math.pow(1 - lifecycleProgress, 2);
      const escapeDist = escapeEase * maxEscape;

      const freqIndex = i % freqsLen;
      const freqValue = freqs[freqIndex] || 0;
      const audioPush = freqValue * 15 + audio.bass * 8;
      const dist = startDist + escapeDist + audioPush;

      const bx = width / 2 + Math.cos(angle) * dist;
      const by = height / 2 + Math.sin(angle) * dist;

      const baseSize = 1 + (seed % 2.5);
      const sizeLifecycle = lifecycleProgress < 0.3 ? lifecycleProgress / 0.3 : 1 - ((lifecycleProgress - 0.3) / 0.7) * 0.6;
      const audioSize = freqValue * 3 + audio.treble * 1.5;
      const finalSize = (baseSize + audioSize) * sizeLifecycle;

      const color = bubbleColors[i % bubbleColors.length];

      const fadeIn = Math.min(1, lifecycleProgress * 5);
      const fadeOut = 1 - Math.pow(lifecycleProgress, 1.5);
      const audioAlpha = 0.2 + audio.volume * 0.3 + freqValue * 0.2;
      const alpha = fadeIn * fadeOut * audioAlpha;

      if (alpha < 0.02 || finalSize < 0.3) continue;

      ctx.save();
      ctx.globalAlpha = Math.min(alpha, 0.75);
      ctx.fillStyle = color;
      ctx.shadowBlur = finalSize * 2.5;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(bx, by, Math.max(0.5, finalSize), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Micro-jet escaping bubbles
  if (isListening && (audio.beatEnvelope ?? audio.energy) > 0.08) {
    const energy = audio.beatEnvelope ?? audio.energy ?? audio.volume;
    const jetCount = Math.min(32, Math.floor(12 + energy * 32));
    const ringRadius = radius + 8 + audio.bass * 10;

    for (let i = 0; i < jetCount; i++) {
      const angle = (i / jetCount) * Math.PI * 2 + Math.sin(time * 0.6 + i) * 0.08;
      const freqValue = freqs[i % freqsLen] || 0;
      const push = (0.4 + energy * 0.9 + freqValue * 0.8) * 32;
      const jitter = Math.sin(time * 2 + i * 1.7) * 6;

      const startX = width / 2 + Math.cos(angle) * ringRadius;
      const startY = height / 2 + Math.sin(angle) * ringRadius;
      const endX = width / 2 + Math.cos(angle) * (ringRadius + push + jitter);
      const endY = height / 2 + Math.sin(angle) * (ringRadius + push + jitter);

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

  // Progress ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius + 8, -Math.PI / 2, -Math.PI / 2 + loopProgress * Math.PI * 2);
  const progressGradient = ctx.createLinearGradient(0, 0, width, 0);
  progressGradient.addColorStop(0, 'hsl(239 84% 67%)');
  progressGradient.addColorStop(0.5, 'hsl(280 84% 67%)');
  progressGradient.addColorStop(1, 'hsl(320 84% 67%)');
  ctx.strokeStyle = progressGradient;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // Watermark
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.35;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#6366f1';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 4;
  ctx.strokeText('Démo BubbleLoop', width / 2, height / 2 - 12);
  ctx.fillText('Démo BubbleLoop', width / 2, height / 2 - 12);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#8b5cf6';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3;
  ctx.strokeText('Version en cours de finalisation', width / 2, height / 2 + 14);
  ctx.fillText('Version en cours de finalisation', width / 2, height / 2 + 14);
  ctx.restore();

  // Bottom-right watermark
  ctx.save();
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('BubbleLoop', width - 10, height - 10);
  ctx.restore();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function getVisibleStrokesForProgress(strokes: LoopStroke[], progress: number): LoopStroke[] {
  return strokes
    .map((stroke) => {
      const visiblePoints = stroke.points.filter((p) => {
        const startT = stroke.points[0]?.t ?? 0;
        if (startT > 0.8 && progress < 0.2) {
          return p.t >= startT || p.t <= progress;
        }
        return p.t <= progress;
      });

      return { ...stroke, points: visiblePoints };
    })
    .filter((s) => s.points.length > 0);
}
