// Pièces cocktail vendues à l'unité, partagées par index.html et mobile.html
const PIECES = {
  sale: {label: 'Salé', detail: 'Pièce salée', fallback: 'sale-plateau', groups: [
    [1.8, ['Beef burger', 'Chicken burger', 'Fish burger', 'Hot dog', 'Tacos mexicain', 'Wrap poulet pané', 'Navette saumon', 'Navette poulet', 'Bruschetta tomate à l’ail']],
    [2.5, ['Salade César', 'Brochette à la libanaise', 'Dynamite chicken', 'Crevettes au parmesan', 'Salade mozzarella pesto', 'Verrine avocat crevettes', 'Mille-feuille avocat, crevettes et mangue', 'Brochette de poulet', 'Brochette de crevettes']],
  ], photos: [['sale-brochettes', 'Brochette à la libanaise'], ['sale-crevettes', 'Crevettes au parmesan'], ['sale-plateau', 'Burgers, tacos et bruschettas'], ['sale-wraps', 'Wraps, navettes et burgers'], ['sale-burgers', 'Burgers et navettes saumon'], ['sale-taboule', 'Verrines salées']]},
  sucre: {label: 'Sucré', detail: 'Pièce sucrée', fallback: 'sucre-mignardises', groups: [
    [2, ['Choux à la crème', 'Moelleux au chocolat', 'Tartelette au citron', 'Tartelette aux fruits', 'Tartelette au chocolat', 'Macarons', 'Crème brûlée', 'Panna cotta']],
    [2.5, ['Tiramisu', 'Verrine façon pomme tatin', 'Mousse au chocolat', 'Verrine façon sundae', 'Verrine mangue passion', 'Verrine brownie Dulcey', 'Verrine façon poire Belle-Hélène']],
    [3, ['Mini entremets', 'Pavlova']],
  ], photos: [['sucre-verrines', 'Tiramisu et verrine mangue passion'], ['sucre-pannacotta', 'Panna cotta'], ['sucre-mignardises', 'Choux, macarons et mini entremets'], ['sucre-macarons', 'Macarons']]},
};
// Photo montrée dans le panier quand la pièce a la sienne, sinon celle de la catégorie
const PIECE_IMG = {'Beef burger': 'sale-burgers', 'Chicken burger': 'sale-burgers', 'Fish burger': 'sale-burgers', 'Navette saumon': 'sale-burgers', 'Navette poulet': 'sale-wraps', 'Wrap poulet pané': 'sale-wraps', 'Brochette à la libanaise': 'sale-brochettes', 'Crevettes au parmesan': 'sale-crevettes', 'Tiramisu': 'sucre-verrines', 'Verrine mangue passion': 'sucre-verrines', 'Panna cotta': 'sucre-pannacotta', 'Macarons': 'sucre-macarons'};
const PIECE_START = 10;
const pieceSlug = s => 'p-' + s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const PIECE_LIST = [];
for (const [cat, c] of Object.entries(PIECES)) for (const [price, names] of c.groups) for (const name of names)
  PIECE_LIST.push({id: pieceSlug(name), name, price, cat, detail: c.detail, img: 'img/pieces/' + (PIECE_IMG[name] || c.fallback) + '.jpg'});
const pieceOf = k => PIECE_LIST.find(p => p.id === k);
const pieceQty = v => Math.max(1, Math.min(999, Math.round(v) || 1));

// Construit le choix Salé / Sucré, les photos et la liste ; onAdd(pièce, quantité) ajoute au panier
function sdPieces(root, onAdd){
  const eurP = n => n.toLocaleString('fr-FR', {minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2}) + ' €';
  const minus = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9"/></svg>';
  const plus = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9M8 3.5v9"/></svg>';
  const item = n => { const p = pieceOf(pieceSlug(n)); return `<li class="pc-item"><span class="pc-name">${n}</span>
    <div class="stepper sm pc-step"><button type="button" data-pstep="-1" data-for="${p.id}" aria-label="Moins de ${n}">${minus}</button><input id="pq-${p.id}" type="number" inputmode="numeric" min="1" max="999" value="${PIECE_START}" aria-label="Quantité de ${n}"><button type="button" data-pstep="1" data-for="${p.id}" aria-label="Plus de ${n}">${plus}</button></div>
    <button type="button" class="pc-add" data-padd="${p.id}" aria-label="Ajouter ${n} au panier">Ajouter</button></li>`; };
  const panel = ([cat, c], i) => `<div class="pc-panel" id="pc-${cat}" role="tabpanel"${i ? ' hidden' : ''}>
    <div class="pc-mosaic">${c.photos.map(([f, t]) => `<figure><img src="img/pieces/${f}.jpg" alt="${t}" loading="lazy" width="640" height="800"><figcaption>${t}</figcaption></figure>`).join('')}</div>
    ${c.groups.map(([price, names]) => `<div class="pc-grp"><h4><b>${eurP(price)}</b> la pièce</h4><ul class="pc-list">${names.map(item).join('')}</ul></div>`).join('')}</div>`;
  const cats = Object.entries(PIECES);
  root.innerHTML = `<div class="pc-toggle" role="tablist" aria-label="Pièces salées ou sucrées">${cats.map(([cat, c], i) => `<button type="button" role="tab" data-pc="${cat}" aria-selected="${!i}">${c.label}<small>dès ${eurP(c.groups[0][0])}</small></button>`).join('')}</div>
    <p class="pc-hint">Choisissez la quantité de chaque pièce puis ajoutez-la au panier.</p>` + cats.map(panel).join('');
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-pc]');
    if (t) {
      root.querySelectorAll('[data-pc]').forEach(b => b.setAttribute('aria-selected', b === t));
      root.querySelectorAll('.pc-panel').forEach(p => p.hidden = p.id !== 'pc-' + t.dataset.pc);
    }
    const s = e.target.closest('[data-pstep]');
    if (s) { const i = document.getElementById('pq-' + s.dataset.for); i.value = pieceQty(+i.value + +s.dataset.pstep); }
    const a = e.target.closest('[data-padd]');
    if (a) {
      const p = pieceOf(a.dataset.padd), i = document.getElementById('pq-' + p.id), q = pieceQty(+i.value);
      i.value = q; onAdd(p, q);
      a.textContent = '✓ Ajouté'; a.classList.add('done');
      clearTimeout(a._t); a._t = setTimeout(() => { a.textContent = 'Ajouter'; a.classList.remove('done'); }, 1600);
    }
  });
  root.addEventListener('change', e => { if (e.target.matches('.pc-step input')) e.target.value = pieceQty(+e.target.value); });
}
