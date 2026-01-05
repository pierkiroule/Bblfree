import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TUTORIAL_STEPS = [
  {
    number: 1,
    title: 'Activez la bande-son',
    description: "Choisissez d'abord un son qui tournera en boucle. Ce son n'est pas qu'un accompagnement, il impose la vitesse et le rythme (le tempo) de tout ce que vous allez créer.",
  },
  {
    number: 2,
    title: 'Gribouillez librement',
    description: "Prenez votre pinceau et tracez un trait libre (le « squiggle ») sans essayer de dessiner quelque chose de précis. L'instrument ne se contente pas de l'image, il enregistre le mouvement de votre main dans le temps.",
  },
  {
    number: 3,
    title: "Laissez l'animation se jouer",
    description: 'Votre trait se rejoue automatiquement. Votre geste initial devient alors un mouvement perpétuel et un rythme que vous pouvez observer.',
  },
  {
    number: 4,
    title: 'Observez les interactions physiques',
    description: "À cette étape, le son fait vibrer ou varier votre trait, tandis que votre tracé influence l'image globale. Le but est de ressentir physiquement le passage du geste d'un média à l'autre (le son, le trait, l'image).",
  },
  {
    number: 5,
    title: 'Empilez les couches',
    description: "Ajoutez d'autres traits et différentes textures par-dessus les premiers. Chaque nouvelle couche doit venir dialoguer avec celles déjà présentes pour enrichir la boucle.",
  },
  {
    number: 6,
    title: 'Découvrez le résultat',
    description: "Ne partez pas d'une idée préconçue. Regardez simplement les formes et les idées apparaître d'elles-mêmes à force de voir la boucle tourner ; c'est là que le sens de votre œuvre naît.",
  },
  {
    number: 7,
    title: 'Enregistrez et diffusez',
    description: "Une fois que la composition vous plaît, exportez cette « bulle » pour la partager. Votre simple trait de départ est devenu un objet numérique complet.",
  },
];

export default function TutorialModal({ open, onOpenChange }: TutorialModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-primary">
            Comment utiliser BubbleLoop
          </DialogTitle>
          <DialogDescription className="text-muted-foreground italic">
            Transformez un simple gribouillis en une œuvre vivante, un squiggle transmédia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {TUTORIAL_STEPS.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm">
                {step.number}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
