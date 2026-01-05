import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface FeaturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeaturesModal({ open, onOpenChange }: FeaturesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-primary">
            BubbleLoop — Démo & évolution
          </DialogTitle>
          <DialogDescription className="text-muted-foreground italic">
            Cette démo montre les bases. Les prochaines versions ouvrent l'animation et l'immersion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Bloc 1 — Fonctionnalités actuelles */}
          <div className="space-y-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Fonctionnalités actuelles (Démo)
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground pl-4">
              <li>• Dessin audioreactif en temps réel</li>
              <li>• 5 brosses audioreactives</li>
              <li>• Réaction au microphone</li>
              <li>• Outil texte simple</li>
              <li>• Boucle lecture / pause</li>
              <li>• Galerie locale</li>
              <li>• Export vidéo WebP en boucle</li>
              <li>• Export avec watermark Démo</li>
            </ul>
          </div>

          {/* Bloc 2 — Fonctionnalités à venir */}
          <div className="space-y-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Fonctionnalités à venir
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground pl-4">
              <li>• Nouvelles brosses et styles visuels</li>
              <li>• Réactivité audio améliorée</li>
              <li>• Animations caméra (zoom / dézoom)</li>
              <li>• Boucles plus fluides</li>
              <li>• Export vidéo HD</li>
            </ul>
          </div>

          {/* Bloc 3 — Vision future */}
          <div className="space-y-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
              Vision future
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground pl-4">
              <li>• Création d'univers immersifs</li>
              <li>• Export 360° / VR</li>
              <li className="font-medium text-foreground">• Un dessin + un son = un monde</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
