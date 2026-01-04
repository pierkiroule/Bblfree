import { useCallback, useState } from 'react';
import { LoopStroke } from './useLoopTime';
import { renderStroke } from '@/components/bubble/BrushRenderer';

interface ExportOptions {
  width: number;
  height: number;
  radius: number;
  loopDuration: number;
  strokes: LoopStroke[];
  fps?: number;
}

export function useGifExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportGif = useCallback(async (options: ExportOptions): Promise<{ gif: string; thumbnail: string }> => {
    const { width, height, radius, loopDuration, strokes, fps = 15 } = options;

    setIsExporting(true);
    setProgress(0);

    const totalFrames = Math.floor((loopDuration / 1000) * fps);
    const frameDelay = Math.round(1000 / fps);

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const frames: string[] = [];
    let thumbnailDataUrl = '';

    // Generate frames
    for (let i = 0; i < totalFrames; i++) {
      const frameProgress = i / totalFrames;
      
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
      const visibleStrokes = getVisibleStrokesForProgress(strokes, frameProgress);
      
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
        -Math.PI / 2 + frameProgress * Math.PI * 2
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

      // Store frame as PNG data URL
      frames.push(canvas.toDataURL('image/png'));

      // Capture thumbnail at middle of animation
      if (i === Math.floor(totalFrames / 2)) {
        thumbnailDataUrl = canvas.toDataURL('image/png');
      }

      setProgress((i + 1) / totalFrames * 0.5);

      // Yield to prevent UI freezing
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Encode to GIF using simple approach
    setProgress(0.5);
    
    try {
      const gifDataUrl = await encodeGif(frames, width, height, frameDelay);
      setIsExporting(false);
      setProgress(1);
      return { gif: gifDataUrl, thumbnail: thumbnailDataUrl };
    } catch (error) {
      setIsExporting(false);
      throw error;
    }
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

// Simple GIF encoder without workers
async function encodeGif(frames: string[], width: number, height: number, delay: number): Promise<string> {
  const gif = new GifWriter(width, height);
  
  for (let i = 0; i < frames.length; i++) {
    const img = await loadImage(frames[i]);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    gif.addFrame(imageData.data, delay);
  }
  
  return gif.finish();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Minimal GIF encoder
class GifWriter {
  private width: number;
  private height: number;
  private frames: { data: Uint8ClampedArray; delay: number }[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  addFrame(pixels: Uint8ClampedArray, delay: number) {
    this.frames.push({ data: pixels, delay });
  }

  finish(): string {
    const bytes: number[] = [];
    
    // GIF Header
    this.writeString(bytes, 'GIF89a');
    
    // Logical Screen Descriptor
    this.writeShort(bytes, this.width);
    this.writeShort(bytes, this.height);
    bytes.push(0xF7); // Global color table, 256 colors
    bytes.push(0);    // Background color index
    bytes.push(0);    // Pixel aspect ratio
    
    // Global Color Table (256 colors)
    for (let i = 0; i < 256; i++) {
      bytes.push(i, i, i);
    }
    
    // Netscape Extension for looping
    bytes.push(0x21, 0xFF, 0x0B);
    this.writeString(bytes, 'NETSCAPE2.0');
    bytes.push(0x03, 0x01);
    this.writeShort(bytes, 0); // Loop forever
    bytes.push(0x00);
    
    // Write each frame
    for (const frame of this.frames) {
      // Graphics Control Extension
      bytes.push(0x21, 0xF9, 0x04);
      bytes.push(0x00); // Disposal method
      this.writeShort(bytes, Math.round(frame.delay / 10)); // Delay in centiseconds
      bytes.push(0x00); // Transparent color index
      bytes.push(0x00); // Block terminator
      
      // Image Descriptor
      bytes.push(0x2C);
      this.writeShort(bytes, 0); // Left
      this.writeShort(bytes, 0); // Top
      this.writeShort(bytes, this.width);
      this.writeShort(bytes, this.height);
      bytes.push(0x00); // No local color table
      
      // Image Data with LZW encoding
      const pixels = this.quantizeFrame(frame.data);
      const lzw = this.lzwEncode(pixels);
      bytes.push(8); // LZW minimum code size
      
      // Write LZW data in sub-blocks
      let pos = 0;
      while (pos < lzw.length) {
        const blockSize = Math.min(255, lzw.length - pos);
        bytes.push(blockSize);
        for (let i = 0; i < blockSize; i++) {
          bytes.push(lzw[pos++]);
        }
      }
      bytes.push(0x00); // Block terminator
    }
    
    // GIF Trailer
    bytes.push(0x3B);
    
    // Convert to base64 data URL
    const uint8 = new Uint8Array(bytes);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return 'data:image/gif;base64,' + btoa(binary);
  }

  private writeString(bytes: number[], str: string) {
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
  }

  private writeShort(bytes: number[], value: number) {
    bytes.push(value & 0xFF);
    bytes.push((value >> 8) & 0xFF);
  }

  private quantizeFrame(rgba: Uint8ClampedArray): Uint8Array {
    const pixels = new Uint8Array(this.width * this.height);
    for (let i = 0; i < pixels.length; i++) {
      const r = rgba[i * 4];
      const g = rgba[i * 4 + 1];
      const b = rgba[i * 4 + 2];
      // Convert to grayscale for simple palette
      pixels[i] = Math.round((r * 0.299 + g * 0.587 + b * 0.114));
    }
    return pixels;
  }

  private lzwEncode(pixels: Uint8Array): number[] {
    const minCodeSize = 8;
    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;
    
    const output: number[] = [];
    let codeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    const maxCode = 4096;
    
    const dictionary = new Map<string, number>();
    
    // Initialize dictionary
    for (let i = 0; i < clearCode; i++) {
      dictionary.set(String(i), i);
    }
    
    let bitBuffer = 0;
    let bitCount = 0;
    
    const writeBits = (code: number, size: number) => {
      bitBuffer |= code << bitCount;
      bitCount += size;
      while (bitCount >= 8) {
        output.push(bitBuffer & 0xFF);
        bitBuffer >>= 8;
        bitCount -= 8;
      }
    };
    
    writeBits(clearCode, codeSize);
    
    let current = String(pixels[0]);
    
    for (let i = 1; i < pixels.length; i++) {
      const next = String(pixels[i]);
      const combined = current + ',' + next;
      
      if (dictionary.has(combined)) {
        current = combined;
      } else {
        writeBits(dictionary.get(current)!, codeSize);
        
        if (nextCode < maxCode) {
          dictionary.set(combined, nextCode++);
          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize++;
          }
        } else {
          writeBits(clearCode, codeSize);
          dictionary.clear();
          for (let j = 0; j < clearCode; j++) {
            dictionary.set(String(j), j);
          }
          nextCode = eoiCode + 1;
          codeSize = minCodeSize + 1;
        }
        
        current = next;
      }
    }
    
    writeBits(dictionary.get(current)!, codeSize);
    writeBits(eoiCode, codeSize);
    
    if (bitCount > 0) {
      output.push(bitBuffer & 0xFF);
    }
    
    return output;
  }
}
