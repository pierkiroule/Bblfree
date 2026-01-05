import React, { useState } from 'react';
import { Pencil, Sparkles, CircleDot, Stamp, Eraser, Type } from 'lucide-react';
import { BrushMode } from '@/hooks/useLoopTime';
import { STAMPS, StampType, TEXT_STAMP_KEY } from './BrushRenderer';

interface BrushToolbarProps {
  brushMode: BrushMode;
  stampType: StampType;
  customText: string;
  activeColor: string;
  onBrushModeChange: (mode: BrushMode) => void;
  onStampTypeChange: (stamp: StampType) => void;
  onCustomTextChange: (text: string) => void;
}

const BRUSH_MODES: { mode: BrushMode; icon: typeof Pencil; label: string }[] = [
  { mode: 'pencil', icon: Pencil, label: 'Crayon' },
  { mode: 'glow', icon: Sparkles, label: 'Glow' },
  { mode: 'particles', icon: CircleDot, label: 'Particules' },
  { mode: 'stamp', icon: Stamp, label: 'Tampons' },
  { mode: 'eraser', icon: Eraser, label: 'Gomme' },
];

export default function BrushToolbar({
  brushMode,
  stampType,
  customText,
  activeColor,
  onBrushModeChange,
  onStampTypeChange,
  onCustomTextChange,
}: BrushToolbarProps) {
  const stampTypes = Object.keys(STAMPS) as StampType[];
  const showStamps = brushMode === 'stamp';
  const showTextInput = showStamps && stampType === TEXT_STAMP_KEY;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Brush modes */}
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg">
        {BRUSH_MODES.map((item) => {
          const Icon = item.icon;
          const isActive = brushMode === item.mode;

          return (
            <button
              key={item.mode}
              onClick={() => onBrushModeChange(item.mode)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-200
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Stamp selector when stamp mode is active */}
      {showStamps && (
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg">
          {stampTypes.map((stamp) => {
            const isTextStamp = stamp === TEXT_STAMP_KEY;
            return (
              <button
                key={stamp}
                onClick={() => onStampTypeChange(stamp)}
                className={`
                  w-9 h-9 rounded-lg flex items-center justify-center text-lg
                  transition-all duration-200
                  ${stampType === stamp
                    ? 'bg-primary/20 ring-2 ring-primary'
                    : 'hover:bg-accent'
                  }
                `}
                style={{ color: activeColor }}
                title={isTextStamp ? 'Texte personnalisé' : stamp}
              >
                {isTextStamp ? <Type className="w-4 h-4" /> : STAMPS[stamp]}
              </button>
            );
          })}
        </div>
      )}

      {/* Text input when text stamp is selected */}
      {showTextInput && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border shadow-lg">
          <input
            type="text"
            value={customText}
            onChange={(e) => onCustomTextChange(e.target.value)}
            placeholder="Votre texte..."
            maxLength={20}
            className="w-32 px-3 py-1.5 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ color: activeColor }}
          />
        </div>
      )}
    </div>
  );
}
