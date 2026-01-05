import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// Lazy load the bubble canvas for better performance
const BubbleCanvas = lazy(() => import('../components/bubble/BubbleCanvas'));

function CanvasLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground font-medium">Préparation de la bulle...</p>
    </div>
  );
}

export default function AtelierView() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center py-4 px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl flex flex-col items-center"
      >
        {/* Minimal Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-foreground">
            BubbleLoop
          </h1>
          <p className="text-muted-foreground text-sm">
            Dessinez • Résonnez • Partagez
          </p>
        </div>

        {/* Bubble Canvas */}
        <Suspense fallback={<CanvasLoader />}>
          <BubbleCanvas loopDuration={10000} />
        </Suspense>
      </motion.div>
    </section>
  );
}
