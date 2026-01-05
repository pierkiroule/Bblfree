import React, { useRef, useState } from 'react';
import { Pencil, Sparkles, CircleDot, Stamp, Eraser, Type, Check, ImageDown } from 'lucide-react';
import { BrushMode } from '@/hooks/useLoopTime';
import { STAMPS, StampType, TEXT_STAMP_KEY, TEXT_FONTS, TextFontKey, IMAGE_STAMP_KEY } from './BrushRenderer';
import type { StampImageData } from '@/lib/imageStamp';

interface BrushToolbarProps {
  brushMode: BrushMode;
  stampType: StampType;
  customText: string;
  textFont: TextFontKey;
  activeColor: string;
  imageStamp: StampImageData | null;
  isImportingImage: boolean;
  onBrushModeChange: (mode: BrushMode) => void;
  onStampTypeChange: (stamp: StampType) => void;
  onCustomTextChange: (text: string) => void;
  onTextFontChange: (font: TextFontKey) => void;
  onImportImage: (file: File) => void;
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
  imageStamp,
  isImportingImage,
  onBrushModeChange,
  onStampTypeChange,
  onCustomTextChange,
  onTextFontChange,
  onImportImage,
}: BrushToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportImage(file);
      event.target.value = '';
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();
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
            const isImageStamp = stamp === IMAGE_STAMP_KEY;
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
                title={isTextStamp ? 'Texte personnalisé' : isImageStamp ? 'Sticker image' : stamp}
              >
                {isTextStamp ? (
                  <Type className="w-4 h-4" />
                ) : isImageStamp && imageStamp?.previewUrl ? (
                  <span className="w-8 h-8 rounded-full overflow-hidden border border-border bg-accent/40 flex items-center justify-center">
                    <img
                      src={imageStamp.previewUrl}
                      alt="Aperçu sticker"
                      className="w-full h-full object-cover"
                    />
                  </span>
                ) : isImageStamp ? (
                  <ImageDown className="w-4 h-4" />
                ) : (
                  STAMPS[stamp]
                )}
              </button>
            );
          })}
          <div className="ml-2 flex items-center gap-1">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isImportingImage}
              className={`
                w-9 h-9 rounded-lg border
                flex items-center justify-center transition-colors
                ${isImportingImage
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }
              `}
              title="Importer une image"
            >
              <ImageDown className={`w-4 h-4 ${isImportingImage ? 'animate-pulse' : ''}`} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
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
                  ? 'bg-primary/20 text-foreground ring-2 ring-primary'
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
