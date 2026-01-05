import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw } from 'lucide-react';

interface ColorPaletteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colors: string[];
  onColorsChange: (colors: string[]) => void;
}

const ALL_COLORS = [
  '#1e1b4b', '#312e81', '#4338ca', '#6366f1', '#818cf8', '#a5b4fc',
  '#701a75', '#86198f', '#a21caf', '#c026d3', '#d946ef', '#e879f9',
  '#9f1239', '#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af',
  '#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74',
  '#854d0e', '#a16207', '#ca8a04', '#eab308', '#facc15', '#fde047',
  '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac',
  '#115e59', '#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4',
  '#0e7490', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc',
  '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
  '#5b21b6', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#ffffff', '#f1f5f9', '#cbd5e1', '#94a3b8', '#475569', '#1e293b',
];

const DEFAULT_PALETTE = ['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#8b5cf6'];

export default function ColorPaletteModal({
  open,
  onOpenChange,
  colors,
  onColorsChange,
}: ColorPaletteModalProps) {
  const [tempColors, setTempColors] = useState<string[]>(colors);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);

  const handleColorSelect = (color: string) => {
    const newColors = [...tempColors];
    newColors[selectedSlot] = color;
    setTempColors(newColors);
    
    // Move to next slot
    if (selectedSlot < 5) {
      setSelectedSlot(selectedSlot + 1);
    }
  };

  const handleReset = () => {
    setTempColors(DEFAULT_PALETTE);
  };

  const handleConfirm = () => {
    onColorsChange(tempColors);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Composer votre palette</DialogTitle>
        </DialogHeader>

        {/* Current palette slots */}
        <div className="flex justify-center gap-3 py-4">
          {tempColors.map((color, index) => (
            <button
              key={index}
              onClick={() => setSelectedSlot(index)}
              className={`
                w-12 h-12 rounded-xl transition-all duration-200
                ${selectedSlot === index 
                  ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                  : 'hover:scale-105'
                }
              `}
              style={{
                backgroundColor: color,
                boxShadow: selectedSlot === index
                  ? `0 0 20px ${color}`
                  : '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {selectedSlot === index && (
                <span className="text-white drop-shadow text-xs font-bold">
                  {index + 1}
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Slot {selectedSlot + 1} sélectionné — cliquez sur une couleur ci-dessous
        </p>

        {/* Color grid */}
        <div className="grid grid-cols-6 gap-2 py-4 max-h-[7.5rem] overflow-y-auto">
          {ALL_COLORS.map((color) => {
            const isInPalette = tempColors.includes(color);
            
            return (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`
                  w-full aspect-square rounded-lg transition-all duration-150
                  hover:scale-110 relative
                  ${isInPalette ? 'ring-2 ring-primary ring-offset-1' : ''}
                `}
                style={{
                  backgroundColor: color,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                }}
              >
                {isInPalette && (
                  <Check className="w-3 h-3 text-white drop-shadow absolute inset-0 m-auto" />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom color picker */}
        <div className="flex items-center gap-3 py-2">
          <span className="text-sm text-muted-foreground">Autre:</span>
          <input
            type="color"
            value={tempColors[selectedSlot]}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0"
          />
          <span className="text-xs font-mono text-muted-foreground">
            {tempColors[selectedSlot]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={handleConfirm}>
            <Check className="w-4 h-4 mr-2" />
            Appliquer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
