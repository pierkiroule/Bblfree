import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// Lazy load the drawing canvas for better performance
const DrawingCanvas = lazy(() => import('../components/canvas/DrawingCanvas'));

function CanvasLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground font-medium">Chargement du canvas...</p>
    </div>
  );
}

export default function AtelierView() {
  return (
    <section className="flex-1 flex flex-col items-center py-6 px-4 overflow-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <span className="badge mb-2">Atelier de dessin</span>
          <h1 className="text-2xl font-black text-foreground">
            Créez vos boucles
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tracez librement et laissez votre créativité s'exprimer
          </p>
        </div>

        {/* Canvas */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl">
          <Suspense fallback={<CanvasLoader />}>
            <DrawingCanvas />
          </Suspense>
        </div>

        {/* Tips */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            💡 Astuce : Utilisez la gomme pour effacer, ou téléchargez votre création !
          </p>
        </div>
      </motion.div>
    </section>
  );
}
