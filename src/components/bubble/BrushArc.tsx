import React from 'react';
import { Pencil, Sparkles, CircleDot, Stamp, Eraser } from 'lucide-react';
import { BrushMode } from '@/hooks/useLoopTime';
import { STAMPS, StampType } from './BrushRenderer';

interface BrushArcProps {
  brushMode: BrushMode;
  stampType: StampType;
  activeColor: string;
  onBrushModeChange: (mode: BrushMode) => void;
  onStampTypeChange: (stamp: StampType) => void;
  canvasSize: number;
}

const BRUSH_MODES: { mode: BrushMode; icon: typeof Pencil; label: string }[] = [
  { mode: 'pencil', icon: Pencil, label: 'Crayon' },
  { mode: 'glow', icon: Sparkles, label: 'Glow' },
  { mode: 'particles', icon: CircleDot, label: 'Particules' },
  { mode: 'stamp', icon: Stamp, label: 'Tampons' },
  { mode: 'eraser', icon: Eraser, label: 'Gomme' },
];

export default function BrushArc({
  brushMode,
  stampType,
  activeColor,
  onBrushModeChange,
  onStampTypeChange,
  canvasSize,
}: BrushArcProps) {
  const arcRadius = canvasSize / 2 + 50;
  const startAngle = Math.PI + Math.PI * 0.2; // Start from left-top
  const endAngle = Math.PI * 2 - Math.PI * 0.2; // End at right-top
  
  const stampTypes = Object.keys(STAMPS) as StampType[];
  const showStamps = brushMode === 'stamp';
  const items = showStamps ? stampTypes : BRUSH_MODES;
  const itemCount = items.length;
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        width: canvasSize,
        height: canvasSize / 2 + 70,
        top: -70,
        left: 0,
      }}
    >
      {BRUSH_MODES.map((item, index) => {
        const angle = startAngle + ((endAngle - startAngle) / (BRUSH_MODES.length - 1)) * index;
        const x = canvasSize / 2 + Math.cos(angle) * arcRadius;
        const y = canvasSize / 2 + Math.sin(angle) * arcRadius;
        const Icon = item.icon;
        const isActive = brushMode === item.mode;
        
        return (
          <button
            key={item.mode}
            onClick={() => onBrushModeChange(item.mode)}
            className={`
              pointer-events-auto absolute w-11 h-11 rounded-full flex items-center justify-center
              transition-all duration-200 -translate-x-1/2 -translate-y-1/2
              ${isActive 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                : 'bg-card/90 backdrop-blur-sm border border-border hover:bg-accent hover:scale-105'
              }
            `}
            style={{ left: x, top: y }}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
      
      {/* Stamp selector overlay when stamp mode is active */}
      {showStamps && (
        <div 
          className="absolute flex gap-2 pointer-events-auto"
          style={{
            left: '50%',
            top: -20,
            transform: 'translateX(-50%)',
          }}
        >
          {stampTypes.map((stamp) => (
            <button
              key={stamp}
              onClick={() => onStampTypeChange(stamp)}
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center text-lg
                transition-all duration-200 border-2
                ${stampType === stamp
                  ? 'border-primary bg-primary/20 scale-110'
                  : 'border-muted bg-card/90 backdrop-blur-sm hover:border-primary/50'
                }
              `}
              style={{ color: activeColor }}
              title={stamp}
            >
              {STAMPS[stamp]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
