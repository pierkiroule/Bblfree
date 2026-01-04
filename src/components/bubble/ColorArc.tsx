import React from 'react';
import { Palette } from 'lucide-react';

interface ColorArcProps {
  colors: string[];
  activeColor: string;
  onColorChange: (color: string) => void;
  onOpenPalette: () => void;
  canvasSize: number;
}

export default function ColorArc({
  colors,
  activeColor,
  onColorChange,
  onOpenPalette,
  canvasSize,
}: ColorArcProps) {
  const arcRadius = canvasSize / 2 + 50;
  const startAngle = -Math.PI * 0.35; // Start from top-right
  const endAngle = Math.PI * 0.35; // End at bottom-right
  
  // Only show 6 colors max
  const displayColors = colors.slice(0, 6);
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        width: 70,
        height: canvasSize,
        top: 0,
        right: -70,
      }}
    >
      {displayColors.map((color, index) => {
        const angle = startAngle + ((endAngle - startAngle) / (displayColors.length - 1)) * index;
        const x = -arcRadius + canvasSize / 2 + 70 + Math.cos(angle) * arcRadius;
        const y = canvasSize / 2 + Math.sin(angle) * arcRadius;
        const isActive = activeColor === color;
        
        return (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              pointer-events-auto absolute w-9 h-9 rounded-full
              transition-all duration-200 -translate-x-1/2 -translate-y-1/2
              ${isActive 
                ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                : 'hover:scale-110'
              }
            `}
            style={{
              left: x,
              top: y,
              backgroundColor: color,
              boxShadow: isActive
                ? `0 0 16px ${color}`
                : 'inset 0 0 0 2px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.2)',
            }}
            aria-label={`Couleur ${color}`}
          />
        );
      })}
      
      {/* Palette button at the end of the arc */}
      <button
        onClick={onOpenPalette}
        className={`
          pointer-events-auto absolute w-10 h-10 rounded-full
          flex items-center justify-center
          bg-card/90 backdrop-blur-sm border-2 border-dashed border-muted-foreground/50
          hover:border-primary hover:scale-110 transition-all duration-200
          -translate-x-1/2 -translate-y-1/2
        `}
        style={{
          left: -arcRadius + canvasSize / 2 + 70 + Math.cos(endAngle + 0.3) * arcRadius,
          top: canvasSize / 2 + Math.sin(endAngle + 0.3) * arcRadius,
        }}
        title="Plus de couleurs"
      >
        <Palette className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
