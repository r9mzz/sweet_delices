// Choix de l'envoi d'une commande ou d'un devis : e-mail (mailto) ou message Instagram (texte copié puis conversation ouverte)
const SD_INSTA = 'sweet_delices';
(function(){
  const css = `.sdx-scrim{position:fixed;inset:0;background:rgb(30 25 20 / .45);z-index:90;display:grid;place-items:center;padding:16px}
.sdx{background:var(--surface,#fffaf7);color:var(--ink,#2e2b22);border-radius:24px;padding:24px 22px 20px;width:min(420px,100%);box-shadow:0 24px 60px -20px rgb(40 30 20 / .5);display:flex;flex-direction:column;gap:14px;font-family:var(--f-body,system-ui,sans-serif)}
.sdx h3{margin:0;font-family:var(--f-display,Georgia,serif);font-weight:400;font-size:1.6rem;line-height:1.1}
.sdx p{margin:0;color:var(--muted,#6e675b);font-size:.92rem;line-height:1.5}
.sdx-opts{display:grid;gap:10px}
.sdx-opts button{display:flex;align-items:center;gap:12px;width:100%;text-align:left;font:inherit;font-weight:600;padding:14px 16px;border-radius:16px;border:1px solid var(--line,#dfccc5);background:var(--bg,#f7f1ec);color:inherit;cursor:pointer}
.sdx-opts button:hover{border-color:var(--olive,#56601f)}
.sdx-opts svg{width:22px;height:22px;flex:none;fill:none;stroke:var(--olive,#56601f);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.sdx-opts small{display:block;font-weight:500;color:var(--muted,#6e675b);font-size:.8rem}
.sdx-done{background:var(--olive-soft,#e4e6d0);border-radius:14px;padding:12px 14px;font-size:.9rem;line-height:1.5}
.sdx textarea{width:100%;min-height:110px;font:inherit;font-size:.82rem;border:1px solid var(--line,#dfccc5);border-radius:12px;padding:10px;background:#fff;color:inherit;resize:vertical}
.sdx-close{align-self:center;background:none;border:0;font:inherit;color:var(--muted,#6e675b);text-decoration:underline;text-underline-offset:3px;padding:6px;cursor:pointer}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();

function sdCopy(text){
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => sdCopyOld(text));
  return Promise.resolve(sdCopyOld(text));
}
function sdCopyOld(text){
  const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
  document.body.appendChild(t); t.select(); t.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
  t.remove(); return ok;
}

// Ouvre la fenêtre de choix ; mail = adresse de Sweet Délices
function sdChoose(mail, subject, lines){
  const body = lines.join('\n'), insta = subject + '\n\n' + body;
  const old = document.querySelector('.sdx-scrim'); if (old) old.remove();
  const s = document.createElement('div'); s.className = 'sdx-scrim';
  s.innerHTML = `<div class="sdx" role="dialog" aria-modal="true" aria-labelledby="sdx-t">
    <h3 id="sdx-t">Comment l'envoyer ?</h3>
    <p>Votre demande est prête. Choisissez comment l'envoyer à Sweet Délices.</p>
    <div class="sdx-opts">
      <button type="button" data-sdx="mail"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg><span>Par e-mail<small>Votre messagerie s'ouvre avec le message prêt</small></span></button>
      <button type="button" data-sdx="insta"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg><span>Sur Instagram<small>Le message est copié, il suffit de le coller</small></span></button>
    </div>
    <div class="sdx-after" hidden></div>
    <button type="button" class="sdx-close">Fermer</button>
  </div>`;
  document.body.appendChild(s);
  const close = () => { s.remove(); document.removeEventListener('keydown', esc); };
  const esc = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc);
  s.addEventListener('click', e => { if (e.target === s || e.target.closest('.sdx-close')) close(); });
  s.querySelector('[data-sdx=mail]').addEventListener('click', () => {
    location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    close();
  });
  s.querySelector('[data-sdx=insta]').addEventListener('click', () => {
    const after = s.querySelector('.sdx-after');
    sdCopy(insta).then(ok => {
      after.hidden = false;
      after.innerHTML = ok
        ? '<div class="sdx-done">✓ Message copié. Dans la conversation Instagram qui s\'ouvre, faites un appui long puis « Coller », et envoyez.</div>'
        : '<div class="sdx-done">Copiez ce message, puis collez-le dans la conversation Instagram qui s\'ouvre :</div><textarea readonly></textarea>';
      const ta = after.querySelector('textarea'); if (ta) { ta.value = insta; ta.focus(); ta.select(); }
    });
    window.open('https://ig.me/m/' + SD_INSTA, '_blank', 'noopener');
  });
  s.querySelector('[data-sdx=mail]').focus();
}
