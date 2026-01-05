import React from 'react';
import { motion } from 'framer-motion';
import type { BrushType } from './DrawingCanvas';

interface CanvasToolbarProps {
  activeBrush: BrushType;
  brushSize: number;
  onBrushChange: (brush: BrushType) => void;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDownload: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const brushTools: { type: BrushType; icon: React.ReactNode; label: string }[] = [
  { 
    type: 'pencil', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    label: 'Crayon' 
  },
  { 
    type: 'brush', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Pinceau' 
  },
  { 
    type: 'spray', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="6" r="1" />
        <circle cx="12" cy="18" r="1" />
        <circle cx="6" cy="12" r="1" />
        <circle cx="18" cy="12" r="1" />
        <circle cx="8" cy="8" r="1" />
        <circle cx="16" cy="16" r="1" />
        <circle cx="16" cy="8" r="1" />
        <circle cx="8" cy="16" r="1" />
      </svg>
    ),
    label: 'Spray' 
  },
  { 
    type: 'eraser', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    label: 'Gomme' 
  },
];

export default function CanvasToolbar({
  activeBrush,
  brushSize,
  onBrushChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClear,
  onDownload,
  canUndo,
  canRedo,
}: CanvasToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-3 glass-panel rounded-2xl w-full max-w-xl">
      {/* Brush Tools */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
        {brushTools.map(({ type, icon, label }) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBrushChange(type)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              activeBrush === type
                ? 'bg-primary text-primary-foreground shadow-primary'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
            title={label}
          >
            {icon}
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-slate-200 hidden sm:block" />

      {/* Brush Size */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Taille</span>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-20 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <span className="text-xs font-bold text-foreground w-6">{brushSize}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-slate-200 hidden sm:block" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            canUndo
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Annuler"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRedo}
          disabled={!canRedo}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            canRedo
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Rétablir"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </motion.button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-slate-200 hidden sm:block" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-all"
          title="Effacer tout"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDownload}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
          title="Télécharger"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
