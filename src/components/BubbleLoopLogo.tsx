import React from 'react';

interface BubbleLoopLogoProps {
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export default function BubbleLoopLogo({
  size = 120,
  showLabel = true,
  className = '',
}: BubbleLoopLogoProps) {
  return (
    <svg
      className={`${className}`}
      width={size}
      height={size}
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BubbleLoop"
    >
      <defs>
        <style>
          {`
            .bbl-progress {
              transform-origin: 110px 110px;
              transform: rotate(-90deg);
              stroke-dasharray: 490;
              animation: cycle 15s cubic-bezier(.45,0,.55,1) infinite;
            }
            @keyframes cycle {
              0% { stroke-dashoffset: 490; }
              42% { stroke-dashoffset: 0; }
              56% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: 490; }
            }

            .bbl-bubble {
              opacity: 0;
              animation: popOut 15s ease-out infinite;
            }
            @keyframes popOut {
              0% { opacity: 0; transform: translateY(0) scale(.95); }
              58% { opacity: 0; transform: translateY(0) scale(.95); }
              63% { opacity: 1; transform: translateY(-6px) scale(1); }
              85% { opacity: .55; transform: translateY(-30px) scale(1.02); }
              100% { opacity: 0; transform: translateY(-44px) scale(1.04); }
            }
            .bbl-b1 { animation-delay: 0s; }
            .bbl-b2 { animation-delay: .25s; }
            .bbl-b3 { animation-delay: .5s; }

            .bbl-core {
              transform-origin: 110px 110px;
              animation: corePulse 15s ease-in-out infinite;
            }
            @keyframes corePulse {
              0%, 100% { transform: scale(1); opacity: .12; }
              50% { transform: scale(1.02); opacity: .18; }
            }
          `}
        </style>
      </defs>

      {/* Background circle */}
      <circle cx="110" cy="110" r="110" className="fill-slate-50" />

      {/* Track circle */}
      <circle 
        cx="110" 
        cy="110" 
        r="78" 
        fill="none" 
        className="stroke-primary/20" 
        strokeWidth="10" 
      />

      {/* Progress circle */}
      <circle
        cx="110"
        cy="110"
        r="78"
        fill="none"
        className="stroke-slate-800 bbl-progress"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Core circle */}
      <circle 
        className="bbl-core fill-slate-800" 
        cx="110" 
        cy="110" 
        r="44" 
      />

      {/* Label */}
      {showLabel && (
        <text 
          x="110" 
          y="116" 
          textAnchor="middle" 
          fontSize="22" 
          fontWeight="700" 
          className="fill-slate-800"
          fontFamily="'Outfit', system-ui, sans-serif"
        >
          BubbleLoop
        </text>
      )}

      {/* Bubbles */}
      <g fill="none" className="stroke-primary-dark" strokeWidth="3">
        <g className="bbl-bubble bbl-b1">
          <circle cx="110" cy="28" r="9" className="fill-slate-50" />
          <circle cx="110" cy="28" r="9" />
        </g>
        <g className="bbl-bubble bbl-b2">
          <circle cx="88" cy="36" r="7.5" className="fill-slate-50" />
          <circle cx="88" cy="36" r="7.5" />
        </g>
        <g className="bbl-bubble bbl-b3">
          <circle cx="132" cy="40" r="6.5" className="fill-slate-50" />
          <circle cx="132" cy="40" r="6.5" />
        </g>
      </g>
    </svg>
  );
}
