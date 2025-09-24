document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});


// --- Book Overlay Controls ---
(function(){
  const trigger = document.getElementById('book-cover-trigger');
  const overlay = document.getElementById('bookOverlay');
  if (!trigger || !overlay) return;
  const closeBtn = overlay.querySelector('.book-close');
  const backdrop = overlay.querySelector('.book-overlay-backdrop');
  let lastFocus = null;
  function openBook(){ lastFocus=document.activeElement; overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); if (closeBtn) closeBtn.focus(); document.addEventListener('keydown', onKeydown); }
  function closeBook(){ overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.removeEventListener('keydown', onKeydown); if (lastFocus&&lastFocus.focus) lastFocus.focus(); }
  function onKeydown(e){ if(e.key==='Escape') closeBook(); }
  trigger.addEventListener('click', openBook);
  trigger.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openBook(); }});
  if (closeBtn) closeBtn.addEventListener('click', closeBook);
  if (backdrop) backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) closeBook(); });
})();


// ===== Book Overlay Hotfix (robusto) =====
(function(){
  function ensureStyle(){
    if (document.getElementById('book-overlay-inline')) return;
    const css = `
      .book-overlay{position:fixed;inset:0;display:grid;place-items:center;opacity:0;pointer-events:none;transition:opacity .25s ease;z-index:100}
      .book-overlay.open{opacity:1;pointer-events:auto}
      .book-overlay-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(2px)}
      .book-wrap{position:relative;width:min(1000px,92vw);height:min(640px,86vh);display:grid;place-items:center;z-index:2}
      .book-close{position:absolute;top:-10px;right:-10px;background:#111827;color:#e5e7eb;border:1px solid #1f2937;border-radius:999px;width:40px;height:40px;display:grid;place-items:center;box-shadow:0 20px 60px rgba(0,0,0,.45);cursor:pointer;z-index:3}
      .book{position:relative;width:100%;height:100%;display:grid;grid-template-columns:1fr 1fr}
      .page{background:#f7f3e7;color:#1f2937;border:1px solid #e4dcc5;border-radius:10px;padding:1.2rem;overflow:auto;box-shadow:0 24px 50px rgba(0,0,0,.25)}
      @media (max-width:720px){.book{grid-template-columns:1fr}.page:nth-child(1){display:none}}
    `.trim();
    const style = document.createElement('style');
    style.id = 'book-overlay-inline';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildOverlay(){
    if (document.getElementById('bookOverlay')) return document.getElementById('bookOverlay');
    const wrap = document.createElement('div');
    wrap.id = 'bookOverlay';
    wrap.className = 'book-overlay';
    wrap.setAttribute('aria-hidden','true');
    wrap.setAttribute('role','dialog');
    wrap.innerHTML = `
      <div class="book-overlay-backdrop" data-close="true"></div>
      <div class="book-wrap" role="document">
        <button class="book-close" aria-label="Fechar visualização">✕</button>
        <div class="book" aria-live="polite">
          <section class="page page-left">
            <header class="page-header"><h2>Meu Livro</h2><p class="small">Amostra • Visualização</p></header>
            <article class="page-content"><p><em>“Para virar a página, basta clicar.”</em></p></article>
          </section>
          <section class="page page-right">
            <header class="page-header"><h3>Sinopse</h3></header>
            <article class="page-content" id="book-sinopse-fallback">
              <p>Escreva aqui a sinopse do livro (4–6 linhas).</p>
            </article>
            <footer class="page-footer"><a class="btn primary" href="comprar.html">Quero comprar</a></footer>
          </section>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  function bind(){
    const cover = document.getElementById('book-cover-trigger') || document.querySelector('.hero .cover');
    const overlay = buildOverlay();
    ensureStyle();
    if (!cover || !overlay) return;
    const closeBtn = overlay.querySelector('.book-close');
    const backdrop = overlay.querySelector('.book-overlay-backdrop');
    let lastFocus = null;
    function openBook(){
      lastFocus = document.activeElement;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      if (closeBtn) closeBtn.focus();
      document.addEventListener('keydown', onKeydown);
    }
    function closeBook(){
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', onKeydown);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKeydown(e){ if (e.key === 'Escape') closeBook(); }
    cover.addEventListener('click', openBook);
    cover.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBook(); }
    });
    if (closeBtn) closeBtn.addEventListener('click', closeBook);
    if (backdrop) backdrop.addEventListener('click', (e)=>{ if (e.target === backdrop) closeBook(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();


// ===== Menu mobile (toggle) =====
(function(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    }
  });
})();


/// ===== Efeito “trincado” — base real se fragmenta (sem cópia atrás) =====
(function(){
  const el = document.getElementById('shatter');
  if (!el) return;

  const text = el.dataset.text || el.textContent.trim();
  // mede o tamanho atual do texto antes de substituir
  const rect = el.getBoundingClientRect();

  // congela o layout do container para não colapsar após remover o texto
  el.style.display  = 'inline-block';
  el.style.position = 'relative';
  el.style.width    = rect.width  + 'px';
  el.style.height   = rect.height + 'px';

  // substitui o conteúdo: só shards (sem base visível)
  el.textContent = '';

  const shards = 12;
  for (let i = 0; i < shards; i++){
    const s = document.createElement('span');
    s.className = 'shard';
    s.setAttribute('data-text', text);

    // micro offsets (trinca), não “explode”
    const tx = (Math.random() * 2 - 1) * 8;   // -8..8 px
    const ty = (Math.random() * 2 - 1) * 4;   // -4..4 px
    const rz = (Math.random() * 2 - 1) * 3;   // -3..3 deg
    const delay = (i * 0.015).toFixed(3);     // leve “stagger”

    s.style.setProperty('--tx', tx.toFixed(1) + 'px');
    s.style.setProperty('--ty', ty.toFixed(1) + 'px');
    s.style.setProperty('--rz', rz.toFixed(1) + 'deg');
    s.style.transitionDelay = delay + 's';

    el.appendChild(s);
  }
})();
