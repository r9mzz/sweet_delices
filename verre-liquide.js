/* Verre liquide : la barre, les boutons et les panneaux en verre courbent ce qui passe derrière eux.
   Moteur : liquid-glass.js (kit liquid-glass-web, liquidglass.dev), à garder à côté de ce fichier.
   La vraie réfraction ne marche que dans Chrome, Edge et Samsung Internet ; Safari et Firefox gardent
   le verre dépoli déjà écrit en CSS, sans rien changer.

     import { verre } from './verre-liquide.js';
     verre('.entete');                      // réglage doux (par défaut)
     verre('.nav', { si: 'scrolled' });     // seulement quand l'élément a cette classe
     verre('.carte', { reglage: 'fort' });  // plus de relief, pour un élément décoratif
*/
import { createGlass, engine } from './liquid-glass.js';

// Effet volontairement discret : le verre courbe surtout le bord, le centre reste net et lisible.
const REGLAGES = {
  doux: { refraction: 10, bezel: 0.3, curvature: 4, chroma: 0, specular: 0.2, specularWidth: 1 },
  fort: { refraction: 18, bezel: 0.45, curvature: 4, chroma: 0.08, specular: 0.32, specularWidth: 1.5 },
};

const actif =
  engine === 'blink' &&
  !matchMedia('(prefers-reduced-transparency: reduce)').matches &&
  !matchMedia('(prefers-contrast: more)').matches;

const cibles = [];

function poser(el, o) {
  if (el.__verre) return;
  const cs = getComputedStyle(el);
  // Le flou du CSS est repris dans le filtre (plafonné, sinon on ne voit plus la courbure).
  const flou = /blur\(([\d.]+)px\)/.exec(cs.backdropFilter || '');
  const visible = () => !o.si || el.classList.contains(o.si);
  const glass = createGlass(el, {
    mode: 'backdrop',
    fit: true,
    radius: parseFloat(cs.borderTopLeftRadius) || 0,
    blur: o.flou ?? (flou ? Math.min(+flou[1], 6) : 0),
    hidden: !visible(),
    ...REGLAGES[o.reglage || 'doux'],
  });
  el.__verre = glass;
  el.classList.add('verre-liquide');
  // Le rayon peut changer avec la taille de l'écran (media queries).
  new ResizeObserver(() => glass.update({ radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 })).observe(el);
  if (o.si) new MutationObserver(() => glass.update({ hidden: !visible() })).observe(el, { attributes: true, attributeFilter: ['class'] });
}

function chercher() {
  for (const [sel, o] of cibles) document.querySelectorAll(sel).forEach((el) => poser(el, o));
}

export function verre(selecteur, options = {}) {
  if (!actif) return;
  cibles.push([selecteur, options]);
  chercher();
}

if (actif) {
  // Certains éléments (barre d'onglets, fenêtres) sont créés après le chargement.
  let attente = 0;
  const plusTard = () => attente || (attente = requestAnimationFrame(() => ((attente = 0), chercher())));
  new MutationObserver(plusTard).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('load', chercher);
}
