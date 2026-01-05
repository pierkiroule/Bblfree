import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface MediationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MediationModal({ open, onOpenChange }: MediationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black text-primary">
            BubbleLoop — une médiation transnumériste
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            et ses processus psychologiques
          </p>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] px-6 pb-6">
          <div className="space-y-6 text-sm leading-relaxed">
            {/* Introduction */}
            <p className="text-foreground">
              BubbleLoop relève d'une <strong>médiation transnumériste</strong> en ce qu'il considère le numérique non comme un simple outil technique ou un support de production, mais comme un <strong>milieu relationnel et expérientiel</strong>.
            </p>
            <p className="text-foreground">
              Le dispositif participe activement à l'expérience et entre en résonance avec le sujet, médiatisant des processus psychologiques essentiels dans les champs éducatif et thérapeutique.
            </p>

            {/* Section 1 */}
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="font-bold text-foreground mb-2">1. Processus de contenance et de sécurité psychique</h3>
              <p className="text-muted-foreground mb-3">
                La structure en boucle temporelle instaure un cadre stable, répétitif et prévisible.
                Ce cadre agit comme une fonction contenante, réduisant l'angoisse liée à l'indétermination et soutenant l'engagement. La limitation temporelle et formelle permet au sujet d'oser agir sans crainte de l'échec définitif.
              </p>
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-xs font-bold text-primary mb-1">👉 Processus médiatisés :</p>
                <ul className="text-xs text-foreground space-y-1">
                  <li>• sécurité interne</li>
                  <li>• engagement attentionnel</li>
                  <li>• réduction de l'angoisse de performance</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="font-bold text-foreground mb-2">2. Processus d'autorégulation et de tolérance à la frustration</h3>
              <p className="text-muted-foreground mb-3">
                La boucle empêche le contrôle total du résultat. Le sujet doit anticiper, ajuster, renoncer, recommencer.
                L'imprévu (lié au son, au geste, à la répétition) est intégré au processus, favorisant la régulation émotionnelle et l'acceptation des limites.
              </p>
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-xs font-bold text-primary mb-1">👉 Processus médiatisés :</p>
                <ul className="text-xs text-foreground space-y-1">
                  <li>• régulation émotionnelle</li>
                  <li>• tolérance à la frustration</li>
                  <li>• flexibilité cognitive</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="font-bold text-foreground mb-2">3. Processus sensorimoteurs et attentionnels</h3>
              <p className="text-muted-foreground mb-3">
                L'audioreactivité et le dessin non figuratif mobilisent directement le corps en action, les sensations et le rythme.
                L'attention est soutenue par la synchronisation geste–son–image, favorisant un état de présence et d'engagement incarné.
              </p>
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-xs font-bold text-primary mb-1">👉 Processus médiatisés :</p>
                <ul className="text-xs text-foreground space-y-1">
                  <li>• intégration sensorimotrice</li>
                  <li>• attention soutenue</li>
                  <li>• ancrage corporel</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="font-bold text-foreground mb-2">4. Processus projectifs et de symbolisation</h3>
              <p className="text-muted-foreground mb-3">
                L'absence de figuratif et l'ouverture interprétative permettent une projection indirecte.
                Le sujet peut déposer des vécus, affects ou tensions sans les nommer immédiatement. Le sens émerge secondairement, dans l'après-coup, par la répétition et l'observation du processus.
              </p>
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-xs font-bold text-primary mb-1">👉 Processus médiatisés :</p>
                <ul className="text-xs text-foreground space-y-1">
                  <li>• projection</li>
                  <li>• symbolisation progressive</li>
                  <li>• élaboration psychique</li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="font-bold text-foreground mb-2">5. Processus relationnels et d'alliance</h3>
              <p className="text-muted-foreground mb-3">
                BubbleLoop agit comme un tiers médiateur transnumériste.
                L'attention se déplace du sujet vers l'expérience partagée à l'écran, ce qui diminue les résistances et soutient la relation éducative ou thérapeutique. Le professionnel accompagne le cadre et le processus, sans imposer d'interprétation.
              </p>
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-xs font-bold text-primary mb-1">👉 Processus médiatisés :</p>
                <ul className="text-xs text-foreground space-y-1">
                  <li>• alliance</li>
                  <li>• co-création</li>
                  <li>• élaboration dialogique</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="font-bold text-foreground mb-2">6. Primat du processus et transformation subjective</h3>
              <p className="text-muted-foreground mb-3">
                BubbleLoop privilégie le processus plutôt que le résultat.
                La transformation ne réside pas dans l'objet produit, mais dans ce qui se modifie pendant l'expérience : rapport au temps, au contrôle, à l'erreur, à la créativité et à la relation au numérique.
              </p>
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-xs font-bold text-primary mb-1">👉 Processus médiatisés :</p>
                <ul className="text-xs text-foreground space-y-1">
                  <li>• réflexivité</li>
                  <li>• pouvoir d'agir</li>
                  <li>• transformation subjective</li>
                </ul>
              </div>
            </div>

            {/* Définition synthétique */}
            <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl">
              <h3 className="font-black text-primary mb-2">Définition synthétique</h3>
              <p className="text-foreground font-medium">
                BubbleLoop est une <strong>médiation transnumériste</strong> qui mobilise la contenance, l'autorégulation, la projection et la relation en faisant du numérique un <strong>milieu de résonance et de transformation</strong>.
              </p>
            </div>

            {/* Bruno Latour */}
            <div className="space-y-3 pt-2">
              <p className="text-foreground">
                BubbleLoop s'appuie principalement sur la pensée de <strong>Bruno Latour</strong>.
                Il ne considère pas le numérique comme un outil neutre, mais comme un acteur à part entière de l'expérience. Le geste, le son, l'écran, la boucle, les règles du dispositif et la présence du professionnel agissent ensemble et transforment ce qui se passe.
              </p>
              <p className="text-foreground">
                Dans BubbleLoop, on ne « fait » pas quelque chose avec un outil : on entre dans une <strong>situation composée</strong>. La boucle structure l'action, l'audioreactivité modifie le geste, l'écran influence l'attention. Le dispositif participe activement à l'expérience, au même titre que l'utilisateur.
              </p>
              <p className="text-foreground">
                Cette approche permet de comprendre BubbleLoop comme une <strong>médiation transnumériste</strong> : le numérique n'est pas un support passif, mais un milieu de relation. Ce qui compte n'est pas le résultat final, mais ce qui se construit dans l'interaction entre humain et dispositif.
              </p>
              <p className="text-foreground">
                La pensée de Latour permet aussi de relier les autres références :
              </p>
              <ul className="text-muted-foreground space-y-1 ml-4">
                <li>• le <strong>jeu de Winnicott</strong> devient une situation rendue possible par un agencement ;</li>
                <li>• la <strong>fonction contenante</strong> (Bion, Roussillon) émerge du cadre et de la répétition ;</li>
                <li>• la <strong>résonance</strong> (Rosa) décrit la qualité de la relation qui se tisse ;</li>
                <li>• l'<strong>individuation</strong> (Simondon) désigne ce qui se transforme en cours d'expérience.</li>
              </ul>
              <p className="text-foreground font-medium mt-4">
                BubbleLoop propose ainsi une autre manière d'habiter le numérique : non pas l'utiliser, mais <strong>composer avec lui</strong>, dans une logique de médiation, de résonance et de transformation.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
