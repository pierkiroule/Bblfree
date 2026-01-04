import React, { useState } from 'react';
import BubbleLoopLogo from './BubbleLoopLogo';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  activeView: 'home' | 'atelier' | 'gallery';
  onNavigateHome: () => void;
  onNavigateAtelier: () => void;
  onNavigateGallery: () => void;
}

const navItems = [
  { key: 'home', label: 'Accueil' },
  { key: 'atelier', label: 'Atelier' },
  { key: 'gallery', label: 'Galerie' },
] as const;

export default function Header({
  activeView,
  onNavigateHome,
  onNavigateAtelier,
  onNavigateGallery,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (key: typeof activeView) => {
    switch (key) {
      case 'home':
        onNavigateHome();
        break;
      case 'atelier':
        onNavigateAtelier();
        break;
      case 'gallery':
        onNavigateGallery();
        break;
    }
    setMenuOpen(false);
  };

  return (
    <header className="relative z-50 w-full glass-panel flex items-center justify-between px-4 py-3 md:px-6 gap-4 border-b border-slate-200">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <BubbleLoopLogo size={54} showLabel={false} />
        <div className="flex flex-col">
          <h1 className="text-lg font-black uppercase italic tracking-tight">
            Bubble Loop <span className="text-primary">#BBL</span>
          </h1>
        </div>
      </div>

      {/* Mobile Toggle */}
      <button
        type="button"
        className="md:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-slate-200 text-xl"
        aria-label={menuOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span aria-hidden="true">☰</span>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`px-4 py-2 rounded-xl font-bold transition-all duration-150 ${
              activeView === item.key
                ? 'bg-primary text-primary-foreground shadow-primary'
                : 'text-slate-700 hover:bg-primary/10'
            }`}
            aria-current={activeView === item.key ? 'page' : undefined}
            onClick={() => handleNav(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Archive Button */}
      <div className="hidden md:flex items-center">
        <button 
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-slate-200 hover:bg-slate-100 transition-colors"
          aria-label="Ouvrir les archives"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 glass-panel flex flex-col p-4 gap-2 border-b border-slate-200 md:hidden"
            aria-label="Navigation mobile"
          >
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`w-full px-4 py-3 rounded-xl font-bold text-left transition-all ${
                  activeView === item.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-700 hover:bg-primary/10'
                }`}
                onClick={() => handleNav(item.key)}
              >
                {item.label}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
