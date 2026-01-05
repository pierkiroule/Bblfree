import React, { useState } from 'react';
import { Pencil, Sparkles, CircleDot, Stamp, Eraser, Type, Check } from 'lucide-react';
import { BrushMode } from '@/hooks/useLoopTime';
import { STAMPS, StampType, TEXT_STAMP_KEY, TEXT_FONTS, TextFontKey } from './BrushRenderer';

interface BrushToolbarProps {
  brushMode: BrushMode;
  stampType: StampType;
  customText: string;
  textFont: TextFontKey;
  activeColor: string;
  onBrushModeChange: (mode: BrushMode) => void;
  onStampTypeChange: (stamp: StampType) => void;
  onCustomTextChange: (text: string) => void;
  onTextFontChange: (font: TextFontKey) => void;
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
  textFont,
  activeColor,
  onBrushModeChange,
  onStampTypeChange,
  onCustomTextChange,
  onTextFontChange,
}: BrushToolbarProps) {
  const [inputText, setInputText] = useState(customText);
  const stampTypes = Object.keys(STAMPS) as StampType[];
  const showStamps = brushMode === 'stamp';
  const showTextInput = showStamps && stampType === TEXT_STAMP_KEY;
  const fontKeys = Object.keys(TEXT_FONTS) as TextFontKey[];
  const isTextValidated = customText === inputText && customText.trim() !== '';

  const handleValidateText = () => {
    if (inputText.trim()) {
      onCustomTextChange(inputText.trim());
    }
  };
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

      {/* Text input and font selector when text stamp is selected */}
      {showTextInput && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border shadow-lg">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleValidateText()}
              placeholder="Votre texte..."
              maxLength={20}
              className="w-32 px-3 py-1.5 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ color: activeColor, fontFamily: TEXT_FONTS[textFont].family }}
            />
            <button
              onClick={handleValidateText}
              disabled={!inputText.trim()}
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center
                transition-all duration-200
                ${isTextValidated
                  ? 'bg-green-500/20 text-green-500 ring-2 ring-green-500'
                  : inputText.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }
              `}
              title="Valider le texte"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
          
          {/* Font selector */}
          <div className="flex items-center gap-1 p-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg">
            {fontKeys.map((fontKey) => {
              const font = TEXT_FONTS[fontKey];
              const isActive = textFont === fontKey;
              return (
                <button
                  key={fontKey}
                  onClick={() => onTextFontChange(fontKey)}
                  className={`
                    px-2 py-1 rounded-lg text-xs font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'hover:bg-accent'
                    }
                  `}
                  style={{ fontFamily: font.family, color: activeColor }}
                  title={font.name}
                >
                  {font.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
