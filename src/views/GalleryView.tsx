import React from 'react';
import { motion } from 'framer-motion';

const DEMO_ITEMS = [
  { id: 1, color: 'bg-gradient-to-br from-primary/30 to-primary/10' },
  { id: 2, color: 'bg-gradient-to-br from-pink-300/30 to-pink-100/10' },
  { id: 3, color: 'bg-gradient-to-br from-amber-300/30 to-amber-100/10' },
  { id: 4, color: 'bg-gradient-to-br from-emerald-300/30 to-emerald-100/10' },
  { id: 5, color: 'bg-gradient-to-br from-cyan-300/30 to-cyan-100/10' },
  { id: 6, color: 'bg-gradient-to-br from-violet-300/30 to-violet-100/10' },
];

export default function GalleryView() {
  return (
    <section className="flex-1 flex flex-col items-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="badge mb-3">Galerie constellation</span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">
            Explorez les créations
          </h1>
          <p className="text-muted-foreground max-w-md">
            Découvrez les boucles créatives partagées par la communauté BubbleLoop.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DEMO_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className={`aspect-square rounded-full ${item.color} glass-panel cursor-pointer flex items-center justify-center shadow-soft hover:shadow-elevated transition-all`}
            >
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🎨</div>
                <span className="text-xs font-semibold text-muted-foreground">
                  Boucle #{item.id}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <button className="px-6 py-3 rounded-2xl font-bold text-muted-foreground border border-slate-200 hover:bg-card hover:text-foreground transition-all">
            Charger plus de créations
          </button>
        </div>
      </motion.div>
    </section>
  );
}
