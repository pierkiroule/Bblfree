import React from 'react';

export default function CGU() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed text-slate-800">
      <h1 className="text-2xl font-bold mb-6">
        Conditions Générales d’Utilisation – BubbleLoop
      </h1>

      <section className="space-y-4">
        <p>
          BubbleLoop est une application web expérimentale de création graphique
          et audio-réactive, proposée à des fins artistiques, ludiques et
          exploratoires.
        </p>

        <h2 className="font-semibold text-lg mt-6">1. Nature de l’application</h2>
        <p>
          BubbleLoop n’est pas un dispositif médical, thérapeutique ou
          diagnostique.  
          Il ne remplace en aucun cas un avis médical, psychologique ou
          professionnel.
        </p>

        <h2 className="font-semibold text-lg mt-6">2. Responsabilité</h2>
        <p>
          L’utilisateur utilise BubbleLoop sous sa seule responsabilité.
          L’éditeur ne saurait être tenu responsable de tout dommage direct ou
          indirect résultant de l’utilisation de l’application.
        </p>

        <h2 className="font-semibold text-lg mt-6">3. Données et confidentialité</h2>
        <p>
          BubbleLoop ne collecte, ne stocke et ne transmet aucune donnée
          personnelle.  
          Les créations sont générées localement dans le navigateur de
          l’utilisateur.
        </p>

        <h2 className="font-semibold text-lg mt-6">4. Contenus générés</h2>
        <p>
          Les contenus créés par l’utilisateur (dessins, animations, exports)
          restent sous sa responsabilité exclusive.  
          L’éditeur décline toute responsabilité quant à leur usage ou diffusion.
        </p>

        <h2 className="font-semibold text-lg mt-6">5. Propriété intellectuelle</h2>
        <p>
          L’application BubbleLoop, son code, son interface et son concept sont
          protégés par le droit d’auteur.  
          Toute reproduction ou exploitation non autorisée est interdite.
        </p>

        <h2 className="font-semibold text-lg mt-6">6. Évolution et interruption</h2>
        <p>
          BubbleLoop est un projet en cours d’évolution.  
          L’éditeur se réserve le droit de modifier, suspendre ou interrompre
          l’application à tout moment, sans préavis.
        </p>

        <h2 className="font-semibold text-lg mt-6">7. Acceptation</h2>
        <p>
          L’utilisation de BubbleLoop implique l’acceptation pleine et entière
          des présentes Conditions Générales d’Utilisation.
        </p>
      </section>

      <p className="mt-10 text-xs text-slate-500">
        Dernière mise à jour : {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
