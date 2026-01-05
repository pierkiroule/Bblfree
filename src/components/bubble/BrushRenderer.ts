import type { StampImageData } from '@/lib/imageStamp';
import { LoopStroke, LoopPoint, BrushMode } from '@/hooks/useLoopTime';

// Stamp shapes
export const STAMPS = {
  star: '★',
  heart: '♥',
  bubble: '●',
  sparkle: '✦',
  flower: '✿',
  moon: '☽',
  image: '🖼',
  text: 'Aa', // Special marker for custom text stamp
} as const;

export type StampType = keyof typeof STAMPS;

// Custom text stamp value
export const TEXT_STAMP_KEY = 'text' as const;
export const IMAGE_STAMP_KEY = 'image' as const;

// Available fonts for text stamps
export const TEXT_FONTS = {
  sans: { name: 'Sans-serif', family: 'sans-serif' },
  caveat: { name: 'Manuscrite', family: 'Caveat' },
  playfair: { name: 'Élégante', family: 'Playfair Display' },
  marker: { name: 'Marqueur', family: 'Permanent Marker' },
  pixel: { name: 'Pixel', family: 'Press Start 2P' },
  satisfy: { name: 'Cursive', family: 'Satisfy' },
} as const;

export type TextFontKey = keyof typeof TEXT_FONTS;
export interface StrokeAudioReactiveData {
  volume: number;
  treble: number;
}

// Draw a basic pencil stroke
function drawPencilStroke(
  ctx: CanvasRenderingContext2D,
  points: LoopPoint[],
  color: string,
  width: number,
  centerX: number,
  centerY: number,
  offsetX: number,
  offsetY: number,
  time: number,
  audioReactive?: StrokeAudioReactiveData
) {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  const audioStrength = audioReactive
    ? Math.min(1, audioReactive.volume * 0.6 + audioReactive.treble * 0.9)
    : 0;
  const baseJitter = width * 0.2 * audioStrength;

  const getJitteredPoint = (point: LoopPoint, prev: LoopPoint | null, index: number) => {
    const baseX = point.x + centerX + offsetX;
    const baseY = point.y + centerY + offsetY;

    if (!prev || baseJitter === 0) {
      return { x: baseX, y: baseY };
    }

    const dx = point.x - prev.x;
    const dy = point.y - prev.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      return { x: baseX, y: baseY };
    }

    const speedDamping = 1 / (1 + dist * 0.35);
    const wave = Math.sin(time * 6 + index * 0.6);
    const jitter = baseJitter * speedDamping * wave;
    const normalX = -dy / dist;
    const normalY = dx / dist;

    return {
      x: baseX + normalX * jitter,
      y: baseY + normalY * jitter,
    };
  };

  const firstPoint = getJitteredPoint(points[0], null, 0);
  ctx.moveTo(firstPoint.x, firstPoint.y);

  for (let i = 1; i < points.length; i++) {
    const jittered = getJitteredPoint(points[i], points[i - 1], i);
    ctx.lineTo(jittered.x, jittered.y);
  }

  ctx.stroke();
  ctx.restore();
}

// Draw eraser stroke - actually erases pixels (works even when glow/filters tint the canvas)
function drawEraserStroke(
  ctx: CanvasRenderingContext2D,
  points: LoopPoint[],
  width: number,
  centerX: number,
  centerY: number,
  offsetX: number,
  offsetY: number
) {
  if (points.length < 2) return;

  ctx.save();
  // Punch a transparent hole in what was drawn before (including glow)
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Color doesn't matter with destination-out, but an opaque stroke is required.
  ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(
    points[0].x + centerX + offsetX,
    points[0].y + centerY + offsetY
  );

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(
      points[i].x + centerX + offsetX,
      points[i].y + centerY + offsetY
    );
  }

  ctx.stroke();
  ctx.restore();
}

// Draw a glow trail stroke
function drawGlowStroke(
  ctx: CanvasRenderingContext2D,
  points: LoopPoint[],
  color: string,
  width: number,
  centerX: number,
  centerY: number,
  offsetX: number,
  offsetY: number,
  time: number,
  audioReactive?: StrokeAudioReactiveData
) {
  if (points.length < 2) return;

  ctx.save();
  const treble = audioReactive?.treble ?? 0;
  const fastLfo = 0.5 + 0.5 * Math.sin(time * 12);
  
  // Multiple layers for glow effect
  const layers = [
    { blur: width * 2, alpha: 0.1, lineWidth: width * 3 },
    { blur: width, alpha: 0.2, lineWidth: width * 2 },
    { blur: width * 0.5, alpha: 0.4, lineWidth: width * 1.5 },
    { blur: 0, alpha: 1, lineWidth: width },
  ];

  layers.forEach(layer => {
    ctx.save();
    ctx.filter = layer.blur > 0 ? `blur(${layer.blur}px)` : 'none';
    ctx.globalAlpha = layer.alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = layer.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(
      points[0].x + centerX + offsetX,
      points[0].y + centerY + offsetY
    );

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(
        points[i].x + centerX + offsetX,
        points[i].y + centerY + offsetY
      );
    }

    ctx.stroke();
    ctx.restore();
  });

  // Audio-reactive flare cloud
  const flareSpacing = Math.max(1, Math.floor(points.length / 18));
  const baseFlareOpacity = Math.min(1, 0.25 + treble * 0.9);
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < points.length; i += flareSpacing) {
    const point = points[i];
    const seed = i * 91.7;
    const angle = (seed % 360) * (Math.PI / 180);
    const jitter = (Math.sin(seed) * 0.5 + 0.5) * width * 1.2;
    const lfo = 0.6 + fastLfo * 0.4;
    const px = point.x + centerX + offsetX + Math.cos(angle + time * 0.8) * (width * 2 + jitter);
    const py = point.y + centerY + offsetY + Math.sin(angle + time * 0.8) * (width * 2 + jitter);
    const flareRadius = width * (1.2 + treble * 1.6) * (0.6 + (Math.sin(seed * 0.75 + time * 4) * 0.5 + 0.5));
    const flareAlpha = baseFlareOpacity * lfo;

    if (flareAlpha < 0.02) continue;

    const gradient = ctx.createRadialGradient(px, py, 0, px, py, flareRadius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.35, color);
    gradient.addColorStop(1, 'transparent');

    ctx.save();
    ctx.globalAlpha = flareAlpha;
    ctx.filter = 'blur(6px)';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py, flareRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Ephemeral sparks boosted by treble peaks
  const sparkSpacing = Math.max(1, Math.floor(points.length / 14));
  const sparkCount = Math.floor(2 + treble * 10);

  for (let i = 0; i < points.length; i += sparkSpacing) {
    const basePoint = points[i];
    const seed = i * 133.1;

    for (let s = 0; s < sparkCount; s++) {
      const sparkAngle = ((seed + s * 31.7) % 360) * (Math.PI / 180);
      const pulse = 0.5 + 0.5 * Math.sin(time * 14 + seed + s);
      const sparkDist = width * (1.5 + treble * 2.2) * pulse;
      const px = basePoint.x + centerX + offsetX + Math.cos(sparkAngle) * sparkDist;
      const py = basePoint.y + centerY + offsetY + Math.sin(sparkAngle) * sparkDist;
      const sparkSize = Math.max(1, width * 0.2 + treble * 0.8) * (0.6 + pulse * 0.6);
      const sparkAlpha = Math.min(1, 0.4 + treble * 0.6) * (0.4 + fastLfo * 0.6) * (1 - s / (sparkCount + 1));

      if (sparkAlpha < 0.03) continue;

      ctx.save();
      ctx.globalAlpha = sparkAlpha;
      ctx.filter = 'blur(2px)';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, sparkSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

// Draw particles along the stroke path
function drawParticleStroke(
  ctx: CanvasRenderingContext2D,
  points: LoopPoint[],
  color: string,
  width: number,
  centerX: number,
  centerY: number,
  offsetX: number,
  offsetY: number,
  time: number,
  audioReactive?: StrokeAudioReactiveData
) {
  ctx.save();

  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const smoothStep = (t: number) => t * t * (3 - 2 * t);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const makeOffset = (seed: number, segment: number, maxDist: number) => {
    const angle = pseudoRandom(seed * 0.37 + segment * 11.17) * Math.PI * 2;
    const magnitude = pseudoRandom(seed * 0.91 + segment * 7.31) * maxDist;
    return {
      x: Math.cos(angle) * magnitude,
      y: Math.sin(angle) * magnitude,
    };
  };

  const slowTime = time * 0.35;
  const segment = Math.floor(slowTime);
  const segmentT = smoothStep(slowTime - segment);
  const bassLevel = audioReactive?.volume ?? 0;
  const bassPulse = Math.max(0, bassLevel - 0.35);
  const bassBoost = Math.min(1, bassPulse * 1.6);

  // Generate particles at each point with some randomness
  points.forEach((point, i) => {
    const particleCount = 3;
    const seed = i * 1000;
    
    for (let p = 0; p < particleCount; p++) {
      const particleSeed = seed + p * 137.5;
      const maxOffset =
        width * 0.9 *
        (0.7 + pseudoRandom(particleSeed * 0.13) * 0.3) +
        width * 1.4 * bassBoost;

      const startOffset = makeOffset(particleSeed, segment, maxOffset);
      const endOffset = makeOffset(particleSeed, segment + 1, maxOffset);
      const offset = {
        x: lerp(startOffset.x, endOffset.x, segmentT),
        y: lerp(startOffset.y, endOffset.y, segmentT),
      };

      const dist = Math.hypot(offset.x, offset.y);
      const sizeBase = width * 0.25 + pseudoRandom(particleSeed * 0.71) * width * 0.15;
      const size = Math.max(
        1,
        sizeBase + (width * 0.4 + width * 0.6 * bassBoost) * pseudoRandom(particleSeed * 0.21)
      );
      
      const px = point.x + centerX + offsetX + offset.x;
      const py = point.y + centerY + offsetY + offset.y;
      
      // Alpha based on distance from center
      const alpha = 0.25 + (1 - dist / Math.max(1, maxOffset)) * 0.6;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  ctx.restore();
}

// Draw stamps at each point
function drawStampStroke(
  ctx: CanvasRenderingContext2D,
  points: LoopPoint[],
  color: string,
  width: number,
  centerX: number,
  centerY: number,
  offsetX: number,
  offsetY: number,
  stampType: StampType,
  customText?: string,
  textFont?: string,
  imageStamp?: StampImageData | null
) {
  if (points.length === 0) return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Use custom text for text stamp, otherwise use predefined stamp
  const isTextStamp = stampType === TEXT_STAMP_KEY;
  const isImageStamp = stampType === IMAGE_STAMP_KEY;
  
  // If text stamp but no custom text, don't draw anything
  if (isTextStamp && (!customText || customText.trim() === '')) {
    ctx.restore();
    return;
  }

  if (isImageStamp && !imageStamp) {
    ctx.restore();
    return;
  }
  
  const stamp = isTextStamp ? customText! : (STAMPS[stampType] || STAMPS.star);
  
  // Get font family for text stamps
  const fontFamily = isTextStamp && textFont && TEXT_FONTS[textFont as TextFontKey]
    ? TEXT_FONTS[textFont as TextFontKey].family
    : 'sans-serif';
  
  // Adjust font size for text stamps (smaller for readability, even smaller for pixel font)
  const isPixelFont = textFont === 'pixel';
  const fontSize = isTextStamp 
    ? (isPixelFont ? width * 1.2 : width * 2) 
    : width * 3;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;

  const renderImageSticker = (x: number, y: number, rotation: number) => {
    if (!imageStamp) return;
    const size = width * 5.2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Clip every pass to a perfect circle to prevent bleed outside the sticker
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Base monochrome mask
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageStamp.source, -size / 2, -size / 2, size, size);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    // Silkscreen highlight
    ctx.globalCompositeOperation = 'overlay';
    const highlight = ctx.createRadialGradient(0, 0, size * 0.08, 0, 0, size * 0.65);
    highlight.addColorStop(0, 'rgba(255,255,255,0.24)');
    highlight.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = highlight;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  };
  
  // For single point (single click), just draw one stamp
  if (points.length === 1) {
    const x = points[0].x + centerX + offsetX;
    const y = points[0].y + centerY + offsetY;
    if (isImageStamp) {
      renderImageSticker(x, y, 0);
    } else {
      ctx.fillText(stamp, x, y);
    }
    ctx.restore();
    return;
  }
  
  // Only draw stamp every few points to avoid overcrowding
  // More spacing for text stamps since they're wider
  const baseSpacing = isTextStamp || isImageStamp ? 30 : 20;
  const spacing = Math.max(1, Math.floor(points.length / baseSpacing));
  
  points.forEach((point, i) => {
    if (i % spacing !== 0 && i !== 0 && i !== points.length - 1) return;
    
    const x = point.x + centerX + offsetX;
    const y = point.y + centerY + offsetY;
    
    // Rotation based on position along stroke (gentler for text)
    const rotationIntensity = isTextStamp ? 0.15 : isImageStamp ? 0.2 : 0.3;
    const rotation = (i * rotationIntensity) % (Math.PI * 2);
    
    if (isImageStamp) {
      renderImageSticker(x, y, rotation);
    } else {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(stamp, 0, 0);
      ctx.restore();
    }
  });

  ctx.restore();
}

// Main stroke rendering function
export function renderStroke(
  ctx: CanvasRenderingContext2D,
  stroke: LoopStroke,
  centerX: number,
  centerY: number,
  offsetX: number,
  offsetY: number,
  time: number = 0,
  audioReactive?: StrokeAudioReactiveData
) {
  if (stroke.points.length === 0) return;

  // Apply opacity
  ctx.save();
  ctx.globalAlpha = stroke.opacity ?? 1;

  switch (stroke.mode) {
    case 'glow':
      drawGlowStroke(
        ctx, stroke.points, stroke.color, stroke.width,
        centerX, centerY, offsetX, offsetY, time, audioReactive
      );
      break;
    case 'particles':
      drawParticleStroke(
        ctx, stroke.points, stroke.color, stroke.width,
        centerX, centerY, offsetX, offsetY, time, audioReactive
      );
      break;
    case 'stamp':
      drawStampStroke(
        ctx, stroke.points, stroke.color, stroke.width,
        centerX, centerY, offsetX, offsetY,
        (stroke.stampType as StampType) || 'star',
        stroke.customText,
        stroke.textFont,
        stroke.imageStamp
      );
      break;
    case 'eraser':
      drawEraserStroke(
        ctx, stroke.points, stroke.width,
        centerX, centerY, offsetX, offsetY
      );
      break;
    case 'pencil':
    default:
      drawPencilStroke(
        ctx, stroke.points, stroke.color, stroke.width,
        centerX, centerY, offsetX, offsetY, time, audioReactive
      );
      break;
  }

  ctx.restore();
}
