import React from 'react';
import { motion } from 'framer-motion';

export default function AtelierView() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        {/* Canvas Wrapper */}
        <div className="glass-panel p-4 rounded-2xl">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-4 p-3 rounded-xl bg-card border border-slate-200">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Atelier de dessin</span>
              <span className="text-xs text-muted-foreground">Tracez vos boucles créatives</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-bold hover:bg-slate-200 transition-colors">
                −
              </button>
              <span className="text-sm font-bold min-w-[60px] text-center">100%</span>
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-bold hover:bg-slate-200 transition-colors">
                +
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative w-full aspect-square max-h-[70vh] rounded-full bg-card shadow-elevated border-[6px] border-card overflow-hidden flex items-center justify-center mx-auto">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🖌️</div>
              <h2 className="text-xl font-bold text-foreground mb-2">Zone de dessin</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Commencez à dessiner pour créer vos boucles animées au rythme de la musique.
              </p>
            </div>
          </div>

          {/* Tool Palette */}
          <div className="flex items-center justify-center gap-3 mt-4 p-3 rounded-xl bg-card border border-slate-200">
            {['✏️', '🖌️', '💧', '✨', '🎨', '🧽'].map((tool, idx) => (
              <button
                key={idx}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                  idx === 1
                    ? 'bg-primary shadow-primary'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
