import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UseCasesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const useCases = [
  {
    emoji: '🫧',
    number: 1,
    title: 'Le Squiggle-Ressource Vibrant',
    tools: 'Dessin · Micro · Boucle',
    recipe: 'Dessiner une forme ressource, dire des mots ressources, laisser vibrer.',
    works: 'Ancrage, sécurité interne.',
  },
  {
    emoji: '📝',
    number: 2,
    title: 'Le Squiggle-Mot Vivant',
    tools: 'Texte · Micro',
    recipe: 'Écrire un mot important et le faire réagir par la voix ou le silence.',
    works: 'Symbolisation, mise à distance.',
  },
  {
    emoji: '🌋',
    number: 3,
    title: 'Le Squiggle-Décharge Contenue',
    tools: 'Dessin · Micro',
    recipe: 'Laisser la voix guider le geste, puis ralentir progressivement.',
    works: 'Régulation émotionnelle.',
  },
  {
    emoji: '🔁',
    number: 4,
    title: 'Le Squiggle-Cadre',
    tools: 'Boucle · Lecture',
    recipe: 'Créer une boucle imparfaite et la laisser tourner sans corriger.',
    works: 'Frustration, rapport au cadre.',
  },
  {
    emoji: '⏸️',
    number: 5,
    title: "Le Squiggle-Arrêt",
    tools: 'Pause',
    recipe: 'Mettre pause au moment le plus intense, observer, puis relancer.',
    works: 'Inhibition, attention.',
  },
  {
    emoji: '⏩',
    number: 6,
    title: 'Le Squiggle-Tempo',
    tools: 'Accélérer · Ralentir',
    recipe: "Accélérer jusqu'à inconfort, puis ralentir volontairement.",
    works: 'Autorégulation.',
  },
  {
    emoji: '🔍',
    number: 7,
    title: 'Le Squiggle-Point de Vue',
    tools: 'Zoom · Dézoom',
    recipe: "Passer du détail à la vue d'ensemble, puis comparer.",
    works: 'Décentration, recul.',
  },
  {
    emoji: '🧩',
    number: 8,
    title: 'Le Squiggle-Palimpseste',
    tools: 'Tampon · Dessin',
    recipe: 'Transformer un dessin existant uniquement par ajouts.',
    works: 'Intégration, continuité.',
  },
  {
    emoji: '🪞',
    number: 9,
    title: 'Le Squiggle-Avant / Après',
    tools: 'Galerie',
    recipe: 'Créer deux boucles à des moments différents et les comparer.',
    works: 'Auto-observation, évolution.',
  },
  {
    emoji: '🤝',
    number: 10,
    title: 'Le Squiggle-Tiers',
    tools: 'Lecture · Pause · Regard partagé',
    recipe: "Regarder la boucle ensemble et parler d'abord de ce qui est vu.",
    works: 'Alliance, co-élaboration.',
  },
];

const UseCasesModal: React.FC<UseCasesModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center">
            Cas d'usage
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] px-6 pb-6">
          <div className="space-y-4">
            {useCases.map((useCase) => (
              <div
                key={useCase.number}
                className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">{useCase.emoji}</span>
                  <span>{useCase.number}. {useCase.title}</span>
                </h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Outils :</span> {useCase.tools}</p>
                  <p><span className="font-medium text-foreground">Recette :</span> {useCase.recipe}</p>
                  <p><span className="font-medium text-foreground">Travaille :</span> {useCase.works}</p>
                </div>
              </div>
            ))}
            
            <p className="text-center text-sm text-muted-foreground italic pt-4 pb-2">
              Ces recettes sont des points de départ.<br />
              Chaque squiggle s'adapte au contexte et à la personne.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UseCasesModal;
