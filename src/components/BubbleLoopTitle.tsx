import React from "react";

interface BubbleLoopTitleProps {
  className?: string;
}

const BubbleLoopTitle: React.FC<BubbleLoopTitleProps> = ({ className }) => {
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* SVG A — violet profond */}
      <svg
        viewBox="0 0 600 140"
        className="absolute inset-0 w-full h-full bubbleloop-title-a"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="grad-violet-a" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="50%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>
        </defs>

        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={72}
          fontWeight={900}
          fontStyle="italic"
          fill="url(#grad-violet-a)"
        >
          BubbleLoop
        </text>
      </svg>

      {/* SVG B — violet lumineux */}
      <svg
        viewBox="0 0 600 140"
        className="w-full h-full bubbleloop-title-b"
        role="img"
        aria-label="BubbleLoop"
      >
        <defs>
          <linearGradient id="grad-violet-b" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
        </defs>

        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={72}
          fontWeight={900}
          fontStyle="italic"
          fill="url(#grad-violet-b)"
        >
          BubbleLoop
        </text>

        {/* Signature */}
        <text
          x="82%"
          y="48%"
          fontSize={26}
          fontWeight={700}
          fill="#a78bfa"
          aria-hidden="true"
        >
          •°
        </text>
      </svg>

      {/* Animation crossfade */}
      <style>
        {`
          .bubbleloop-title-a {
            animation: bubbleVioletA 10s ease-in-out infinite;
          }

          .bubbleloop-title-b {
            animation: bubbleVioletB 10s ease-in-out infinite;
          }

          @keyframes bubbleVioletA {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }

          @keyframes bubbleVioletB {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default BubbleLoopTitle;