import React from 'react';
import { Palette } from 'lucide-react';

interface ColorToolbarProps {
  colors: string[];
  activeColor: string;
  onColorChange: (color: string) => void;
  onOpenPalette: () => void;
}

export default function ColorToolbar({
  colors,
  activeColor,
  onColorChange,
  onOpenPalette,
}: ColorToolbarProps) {
  // Only show 6 colors max
  const displayColors = colors.slice(0, 6);

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg">
      {displayColors.map((color) => {
        const isActive = activeColor === color;

        return (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              w-8 h-8 rounded-full transition-all duration-200
              ${isActive ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'}
            `}
            style={{
              backgroundColor: color,
              boxShadow: isActive
                ? `0 0 12px ${color}`
                : 'inset 0 0 0 2px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.15)',
            }}
            aria-label={`Couleur ${color}`}
          />
        );
      })}

      {/* Palette button */}
      <button
        onClick={onOpenPalette}
        className="w-8 h-8 rounded-full flex items-center justify-center
          border-2 border-dashed border-muted-foreground/50
          hover:border-primary hover:scale-110 transition-all duration-200"
        title="Plus de couleurs"
      >
        <Palette className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
