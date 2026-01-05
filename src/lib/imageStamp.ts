export interface StampImageData {
  source: HTMLCanvasElement;
  previewUrl: string;
}

const STICKER_BASE_SIZE = 512;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function loadImageFromFile(file: File) {
  const dataUrl = await readFileAsDataUrl(file);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = dataUrl;
  });
}

function buildCircleStampCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = STICKER_BASE_SIZE;
  canvas.height = STICKER_BASE_SIZE;
  return canvas;
}

function applyPhotocopyMask(ctx: CanvasRenderingContext2D) {
  const imageData = ctx.getImageData(0, 0, STICKER_BASE_SIZE, STICKER_BASE_SIZE);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const normalized = luminance / 255;

    // Strong contrast curve to mimic photocopy/serigraphic ink
    const contrasted = Math.min(1, Math.max(0, (normalized - 0.5) * 1.6 + 0.5));
    const ink = 1 - contrasted;
    const softened = Math.max(0, (Math.pow(ink, 1.35) - 0.08) / 0.92);
    const alpha = Math.min(1, softened);

    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = Math.round(alpha * 255);
  }

  ctx.putImageData(imageData, 0, 0);

  // Add a subtle grainy vignette for a printed look
  const gradient = ctx.createRadialGradient(
    STICKER_BASE_SIZE / 2,
    STICKER_BASE_SIZE / 2,
    STICKER_BASE_SIZE * 0.05,
    STICKER_BASE_SIZE / 2,
    STICKER_BASE_SIZE / 2,
    STICKER_BASE_SIZE / 2
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.7, 'rgba(0,0,0,0.05)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.18)');

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STICKER_BASE_SIZE, STICKER_BASE_SIZE);
  ctx.restore();
}

export async function createImageStamp(file: File): Promise<StampImageData> {
  const img = await loadImageFromFile(file);
  const canvas = buildCircleStampCanvas();
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error("Impossible d'initialiser le traitement de l'image.");
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(
    STICKER_BASE_SIZE / 2,
    STICKER_BASE_SIZE / 2,
    STICKER_BASE_SIZE / 2,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.clip();

  // Draw the source image cropped to a circle with high-contrast grayscale filter
  const scale = Math.max(STICKER_BASE_SIZE / img.width, STICKER_BASE_SIZE / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const dx = (STICKER_BASE_SIZE - drawWidth) / 2;
  const dy = (STICKER_BASE_SIZE - drawHeight) / 2;

  ctx.filter = 'grayscale(100%) contrast(190%) brightness(112%)';
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
  ctx.restore();

  applyPhotocopyMask(ctx);

  // Force a clean circular alpha mask (no square edges)
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.arc(
    STICKER_BASE_SIZE / 2,
    STICKER_BASE_SIZE / 2,
    STICKER_BASE_SIZE / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  const previewUrl = canvas.toDataURL('image/png', 0.92);

  return {
    source: canvas,
    previewUrl,
  };
}
