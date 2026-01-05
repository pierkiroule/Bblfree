import { LoopStroke, LoopPoint, BrushMode } from '@/hooks/useLoopTime';

// Stamp shapes
export const STAMPS = {
  star: '★',
  heart: '♥',
  bubble: '●',
  sparkle: '✦',
  flower: '✿',
  moon: '☽',
  text: 'Aa', // Special marker for custom text stamp
} as const;

export type StampType = keyof typeof STAMPS;

// Custom text stamp value
export const TEXT_STAMP_KEY = 'text' as const;

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
  offsetY: number
) {
  if (points.length < 2) return;

  ctx.save();
  
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
  time: number
) {
  ctx.save();

  // Generate particles at each point with some randomness
  points.forEach((point, i) => {
    const particleCount = 3;
    const seed = i * 1000;
    
    for (let p = 0; p < particleCount; p++) {
      // Pseudo-random offset based on seed
      const angle = ((seed + p * 137.5) % 360) * (Math.PI / 180);
      const dist = ((seed + p * 73.2) % (width * 2));
      const size = (width * 0.3) + ((seed + p * 23.7) % (width * 0.5));
      
      // Animate particles slightly
      const animOffset = Math.sin(time * 3 + seed + p) * 2;
      
      const px = point.x + centerX + offsetX + Math.cos(angle) * (dist + animOffset);
      const py = point.y + centerY + offsetY + Math.sin(angle) * (dist + animOffset);
      
      // Alpha based on distance from center
      const alpha = 0.3 + (1 - dist / (width * 2)) * 0.7;
      
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
  textFont?: string
) {
  if (points.length === 0) return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Use custom text for text stamp, otherwise use predefined stamp
  const isTextStamp = stampType === TEXT_STAMP_KEY;
  
  // If text stamp but no custom text, don't draw anything
  if (isTextStamp && (!customText || customText.trim() === '')) {
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
  
  // For single point (single click), just draw one stamp
  if (points.length === 1) {
    const x = points[0].x + centerX + offsetX;
    const y = points[0].y + centerY + offsetY;
    ctx.fillText(stamp, x, y);
    ctx.restore();
    return;
  }
  
  // Only draw stamp every few points to avoid overcrowding
  // More spacing for text stamps since they're wider
  const baseSpacing = isTextStamp ? 30 : 20;
  const spacing = Math.max(1, Math.floor(points.length / baseSpacing));
  
  points.forEach((point, i) => {
    if (i % spacing !== 0 && i !== 0 && i !== points.length - 1) return;
    
    const x = point.x + centerX + offsetX;
    const y = point.y + centerY + offsetY;
    
    // Rotation based on position along stroke (gentler for text)
    const rotationIntensity = isTextStamp ? 0.15 : 0.3;
    const rotation = (i * rotationIntensity) % (Math.PI * 2);
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillText(stamp, 0, 0);
    ctx.restore();
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
        centerX, centerY, offsetX, offsetY
      );
      break;
    case 'particles':
      drawParticleStroke(
        ctx, stroke.points, stroke.color, stroke.width,
        centerX, centerY, offsetX, offsetY, time
      );
      break;
    case 'stamp':
      drawStampStroke(
        ctx, stroke.points, stroke.color, stroke.width,
        centerX, centerY, offsetX, offsetY,
        (stroke.stampType as StampType) || 'star',
        stroke.customText,
        stroke.textFont
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
