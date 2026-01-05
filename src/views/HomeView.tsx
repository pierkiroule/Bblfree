import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BubbleLoopLogo from '../components/BubbleLoopLogo';
import FeaturesModal from '../components/FeaturesModal';
import TutorialModal from '../components/TutorialModal';
const PUNCHLINES = [
  'Une adaptation transnumériste du squiggle de Winnicott.',
  'Un dispositif de co-création fondé sur l\'aire transitionnelle.',
  'Le dessin comme médiation, non comme production à interpréter.',
  'Le temps intégré comme tiers relationnel.',
  'Un looper transmedia au service du processus.',
  'Aucune analyse automatique. Aucun scoring.',
  'Un cadre contenant, favorisant le jeu et l\'exploration.',
  'Pensé pour la psychothérapie, l\'art-thérapie et la médiation.',
  'Le numérique utilisé comme support de la relation.',
  'BubbleLoop. Un espace de jeu clinique transnumériste.',
];

interface HomeViewProps {
  onStart: () => void;
  onOpenGallery: () => void;
}

export default function HomeView({ onStart, onOpenGallery }: HomeViewProps) {
  const [punchlineIndex, setPunchlineIndex] = useState(0);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setPunchlineIndex((prev) => (prev + 1) % PUNCHLINES.length);
    }, 3800);

    return () => clearInterval(id);
  }, []);

  const goToSlide = (direction: 'prev' | 'next') => {
    setPunchlineIndex((prev) => {
      if (direction === 'next') return (prev + 1) % PUNCHLINES.length;
      if (direction === 'prev') return (prev - 1 + PUNCHLINES.length) % PUNCHLINES.length;
      return prev;
    });
  };

  return (
    <section className="flex-1 flex flex-col items-center justify-start py-6 px-4 gap-6 max-w-2xl mx-auto w-full">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center gap-4"
      >
        {/* Logo with version pill */}
        <div className="relative animate-pulse-logo">
          <BubbleLoopLogo size={170} />
          <div className="absolute -top-2 -right-2 bg-card text-primary px-3 py-1 rounded-full text-xs font-black uppercase shadow-soft">
            v1
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black uppercase italic bg-gradient-to-r from-slate-800 via-primary to-slate-800 bg-clip-text text-transparent">
          BubbleLoop•°
        </h1>
        
        <p className="text-muted-foreground text-lg max-w-md">
          Dessinez en harmonie. Vos traits s'animent en boucle au rythme de la musique.
        </p>

        {/* Icon Grid */}
        <div className="grid grid-cols-3 gap-5 w-full max-w-sm my-6">
          {[
            { icon: <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>, label: 'Tracer' },
            { icon: <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>, label: 'Rythmer' },
            { icon: <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>, label: 'Animer' },
          ].map(({ icon, label }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl bg-card shadow-soft flex items-center justify-center">
                {icon}
              </div>
              <span className="badge">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full max-w-sm bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-wider shadow-primary transition-all hover:bg-primary-dark"
        >
          Démarrer l'expérience
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenGallery}
          className="w-full max-w-sm glass-panel py-3 rounded-2xl font-bold text-foreground border border-slate-200 hover:bg-card/90 transition-all"
        >
          Galerie constellation
        </motion.button>

        <button className="text-slate-400 font-extrabold uppercase text-xs tracking-widest mt-2 hover:text-slate-600 transition-colors">
          Mes Archives
        </button>

        <button
          onClick={() => setShowFeaturesModal(true)}
          className="text-primary font-bold text-sm mt-3 hover:text-primary/80 transition-colors underline underline-offset-2"
        >
          Fonctionnalités – Démo & futur
        </button>

        <button
          onClick={() => setShowTutorialModal(true)}
          className="text-amber-600 font-bold text-sm mt-1 hover:text-amber-500 transition-colors underline underline-offset-2"
        >
          Mini-tuto : Comment ça marche ?
        </button>
      </motion.div>

      {/* Features Modal */}
      <FeaturesModal open={showFeaturesModal} onOpenChange={setShowFeaturesModal} />

      {/* Tutorial Modal */}
      <TutorialModal open={showTutorialModal} onOpenChange={setShowTutorialModal} />

      {/* Concept Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full glass-panel p-5 rounded-2xl"
      >
        <div className="flex flex-col gap-2 mb-3">
          <span className="badge w-fit">Présentation du concept</span>
          <p className="text-slate-700">
            Créé par <strong className="text-foreground">Pierre-Henri Garnier</strong>, Psychologue clinicien et Docteur en sciences de l'information et de la communication.
          </p>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          BubbleLoop est une expérience de dessin en boucle, inspirée du squiggle de Winnicott et prolongée par une approche transnumériste.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed mt-2">
          Il propose un espace de résonance contenant où le geste, le son, le texte et l'image se répondent, favorisant l'exploration projective, l'émergence du sens et la co-création dans la relation.
        </p>
      </motion.div>

      {/* Punchline Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full glass-panel p-5 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="badge">Punchlines concept</span>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              {punchlineIndex + 1} / {PUNCHLINES.length}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToSlide('prev')}
              className="w-10 h-10 rounded-xl bg-card border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors font-bold"
              aria-label="Précédent"
            >
              ←
            </button>
            <button
              onClick={() => goToSlide('next')}
              className="w-10 h-10 rounded-xl bg-card border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors font-bold"
              aria-label="Suivant"
            >
              →
            </button>
          </div>
        </div>

        <div className="min-h-[3rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={punchlineIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-foreground font-semibold text-lg">
                {PUNCHLINES[punchlineIndex]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-4" role="tablist">
          {PUNCHLINES.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === punchlineIndex 
                  ? 'bg-primary w-4' 
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              onClick={() => setPunchlineIndex(idx)}
              aria-label={`Punchline ${idx + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
