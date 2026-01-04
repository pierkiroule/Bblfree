import React, { useState } from 'react';
import BubbleBackground from '../components/BubbleBackground';
import Header from '../components/Header';
import HomeView from '../views/HomeView';
import AtelierView from '../views/AtelierView';
import GalleryView from '../views/GalleryView';
import { Helmet } from 'react-helmet-async';

type ViewType = 'home' | 'atelier' | 'gallery';

const Index = () => {
  const [view, setView] = useState<ViewType>('home');

  const goHome = () => setView('home');
  const goAtelier = () => setView('atelier');
  const goGallery = () => setView('gallery');

  return (
    <>
      <Helmet>
        <title>BubbleLoop - Dessinez en harmonie, animez vos boucles créatives</title>
        <meta 
          name="description" 
          content="BubbleLoop est une expérience de dessin en boucle inspirée du squiggle de Winnicott. Créez, animez et partagez vos œuvres au rythme de la musique." 
        />
      </Helmet>
      
      <div className="relative min-h-screen flex flex-col">
        <BubbleBackground />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header
            activeView={view}
            onNavigateHome={goHome}
            onNavigateAtelier={goAtelier}
            onNavigateGallery={goGallery}
          />

          <main className="flex-1 flex flex-col">
            {view === 'home' && (
              <HomeView 
                onStart={goAtelier} 
                onOpenGallery={goGallery} 
              />
            )}
            {view === 'atelier' && <AtelierView />}
            {view === 'gallery' && <GalleryView />}
          </main>
        </div>
      </div>
    </>
  );
};

export default Index;
