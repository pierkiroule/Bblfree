import { LoopStroke, LoopPoint, BrushMode } from '@/hooks/useLoopTime';

// Stamp shapes
export const STAMPS = {
  star: '★',
  heart: '♥',
  bubble: '●',
  sparkle: '✦',
  flower: '✿',
  moon: '☽',
} as const;

export type StampType = keyof typeof STAMPS;

// Draw a basic pencil stroke
function drawPencilStroke(
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
  ctx.strokeStyle = color;
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
  stampType: StampType
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${width * 2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const stamp = STAMPS[stampType] || STAMPS.star;
  
  // Only draw stamp every few points to avoid overcrowding
  const spacing = Math.max(1, Math.floor(points.length / 20));
  
  points.forEach((point, i) => {
    if (i % spacing !== 0 && i !== 0 && i !== points.length - 1) return;
    
    const x = point.x + centerX + offsetX;
    const y = point.y + centerY + offsetY;
    
    // Slight rotation for visual interest
    const rotation = (i * 0.3) % (Math.PI * 2);
    
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
  time: number = 0
) {
  if (stroke.points.length === 0) return;

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
        (stroke.stampType as StampType) || 'star'
      );
      break;
    case 'pencil':
    default:
      drawPencilStroke(
        ctx, stroke.points, stroke.color, stroke.width,
        centerX, centerY, offsetX, offsetY
      );
      break;
  }
}
