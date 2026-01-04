import React from 'react';
import { motion } from 'framer-motion';

interface ColorPaletteProps {
  activeColor: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#1e293b', // slate-800
  '#6366f1', // indigo (primary)
  '#4338ca', // indigo-dark
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
];

export default function ColorPalette({ activeColor, onColorChange }: ColorPaletteProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-3 glass-panel rounded-2xl max-w-xl">
      {PRESET_COLORS.map((color) => (
        <motion.button
          key={color}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onColorChange(color)}
          className={`w-8 h-8 rounded-full transition-all ${
            activeColor === color
              ? 'ring-2 ring-offset-2 ring-primary scale-110'
              : 'hover:ring-2 hover:ring-offset-1 hover:ring-slate-300'
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      
      {/* Custom color picker */}
      <div className="relative">
        <input
          type="color"
          value={activeColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
          title="Couleur personnalisée"
        />
        <div 
          className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-gradient-to-br from-red-400 via-green-400 to-blue-400"
          title="Plus de couleurs"
        >
          <span className="text-xs font-bold text-white drop-shadow">+</span>
        </div>
      </div>
    </div>
  );
}
