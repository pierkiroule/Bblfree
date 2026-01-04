import React, { useEffect, useRef } from 'react';

const BUBBLE_COUNT = 20;

export default function BubbleBackground() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;
    
    // Clear any existing bubbles
    while (bg.firstChild) {
      bg.removeChild(bg.firstChild);
    }
    
    for (let i = 0; i < BUBBLE_COUNT; i += 1) {
      const bubble = document.createElement('div');
      const size = Math.random() * 90 + 20;
      const duration = Math.random() * 12 + 8;
      const delay = Math.random() * 10;
      const left = Math.random() * 100;
      
      bubble.style.cssText = `
        position: absolute;
        bottom: -120px;
        width: ${size}px;
        height: ${size}px;
        left: ${left}vw;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.6);
        animation: rise ${duration}s infinite linear;
        animation-delay: ${delay}s;
      `;
      bg.appendChild(bubble);
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-130vh) scale(1.3); opacity: 0; }
        }
      `}</style>
      <div 
        ref={bgRef} 
        className="fixed inset-0 overflow-hidden z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(210 40% 96%) 0%, hsl(214 32% 88%) 100%)'
        }}
        aria-hidden="true" 
      />
    </>
  );
}