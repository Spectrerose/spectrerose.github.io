/* ============================================================
   Spectre Rose — ui.js
   Améliorations partagées pour tous les articles
   À appeler en fin de <body> : <script src="ui.js"></script>
   ============================================================ */

(function () {

  /* ── 1. BARRE DE PROGRESSION DE LECTURE ── */
  const progressBar = document.createElement('div');
  progressBar.id = 'sr-progress';
  Object.assign(progressBar.style, {
    position:   'fixed',
    top:        '0',
    left:       '0',
    height:     '2px',
    width:      '0%',
    background: 'linear-gradient(to right, #7a3d4a, #d4909a, #f0c4cc)',
    zIndex:     '9999',
    transition: 'width .1s linear',
    pointerEvents: 'none',
  });
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });


  /* ── 2. BOUTON RETOUR EN HAUT ── */
  const backBtn = document.createElement('button');
  backBtn.id        = 'sr-back-top';
  backBtn.innerHTML = '↑';
  backBtn.setAttribute('aria-label', 'Retour en haut');
  Object.assign(backBtn.style, {
    position:       'fixed',
    bottom:         '2rem',
    right:          '2rem',
    width:          '40px',
    height:         '40px',
    border:         '1px solid rgba(212,144,154,0.35)',
    background:     'rgba(14,8,18,0.92)',
    color:          '#d4909a',
    fontFamily:     'DM Mono, monospace',
    fontSize:       '1rem',
    cursor:         'pointer',
    opacity:        '0',
    transform:      'translateY(10px)',
    transition:     'opacity .35s, transform .35s',
    zIndex:         '500',
    backdropFilter: 'blur(6px)',
  });
  backBtn.addEventListener('mouseenter', () => backBtn.style.borderColor = '#d4909a');
  backBtn.addEventListener('mouseleave', () => backBtn.style.borderColor = 'rgba(212,144,154,0.35)');
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(backBtn);

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    backBtn.style.opacity   = show ? '1' : '0';
    backBtn.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
  }, { passive: true });


  /* ── 3. SYNOPSIS DÉPLIABLE ── */
  /*
    Pour activer sur un article, ajouter ce bloc HTML juste après le <nav> :

    <div class="sr-synopsis" data-game="Umineko no Naku Koro ni">
      <p>Texte du synopsis ici…</p>
    </div>

    Le composant se construit automatiquement.
  */
  const synopsisBlocks = document.querySelectorAll('.sr-synopsis');
  synopsisBlocks.forEach(block => {
    const game    = block.dataset.game || 'ce jeu';
    const content = block.innerHTML;

    // Styles du bloc — placé dans le flux de l'article
    Object.assign(block.style, {
      maxWidth:     '680px',
      margin:       '0 auto 2.5rem',
      padding:      '0 2rem',
      position:     'relative',
      zIndex:       '10',
    });

    block.innerHTML = `
      <div class="sr-syn-inner" style="
        border: 1px solid rgba(212,144,154,0.25);
        background: rgba(14,8,18,0.95);
        overflow: hidden;
      ">
        <button class="sr-syn-toggle" aria-expanded="false" style="
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 1.4rem; background: none; border: none; cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: .55rem; letter-spacing: .25em;
          text-transform: uppercase; color: #d4909a;
        ">
          <span>✦ Vous ne connaissez pas <em style="font-style:italic;font-family:'Cormorant Garamond',serif;font-size:.9rem;letter-spacing:.05em;color:#f0c4cc;">${game}</em> ? Lire le synopsis</span>
          <span class="sr-syn-arrow" style="transition: transform .35s; display:inline-block; color:#d4909a;">▾</span>
        </button>
        <div class="sr-syn-body" style="
          max-height: 0; overflow: hidden;
          transition: max-height .55s ease, padding .4s ease;
          padding: 0 1.4rem;
          font-family: 'Crimson Text', serif; font-size: 1rem;
          color: #c4b0b8; line-height: 1.85;
          border-top: 0px solid rgba(212,144,154,0.2);
        ">
          ${content}
        </div>
      </div>
    `;

    const toggle  = block.querySelector('.sr-syn-toggle');
    const body    = block.querySelector('.sr-syn-body');
    const arrow   = block.querySelector('.sr-syn-arrow');
    const border  = block.querySelector('.sr-syn-body');

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isOpen);
      if (!isOpen) {
        body.style.maxHeight    = body.scrollHeight + 48 + 'px';
        body.style.padding      = '1.2rem 1.4rem 1.6rem';
        body.style.borderTopWidth = '1px';
        arrow.style.transform   = 'rotate(180deg)';
      } else {
        body.style.maxHeight    = '0';
        body.style.padding      = '0 1.4rem';
        body.style.borderTopWidth = '0px';
        arrow.style.transform   = 'rotate(0deg)';
      }
    });
  });


  /* ── 4. NAVIGATION PRÉCÉDENT / SUIVANT ── */
  /*
    Pour activer, ajouter en fin d'article avant </article> :

    <div class="sr-prevnext"
         data-prev-href="article-precedent.html"
         data-prev-title="Titre précédent"
         data-prev-tag="Jeu · Thème"
         data-next-href="article-suivant.html"
         data-next-title="Titre suivant"
         data-next-tag="Jeu · Thème">
    </div>
  */
  const prevNext = document.querySelector('.sr-prevnext');
  if (prevNext) {
    const ph  = prevNext.dataset.prevHref  || '';
    const pt  = prevNext.dataset.prevTitle || '';
    const ptg = prevNext.dataset.prevTag   || '';
    const nh  = prevNext.dataset.nextHref  || '';
    const nt  = prevNext.dataset.nextTitle || '';
    const ntg = prevNext.dataset.nextTag   || '';

    prevNext.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(212,144,154,0.18);
    `;

    const makeCard = (href, title, tag, dir) => {
      if (!href) return `<div></div>`;
      const align = dir === 'prev' ? 'left' : 'right';
      return `
        <a href="${href}" style="
          display: block; text-decoration: none; color: inherit;
          border: 1px solid rgba(212,144,154,0.18);
          background: rgba(14,8,18,0.8);
          padding: 1.2rem 1.4rem;
          transition: border-color .3s, background .3s;
          text-align: ${align};
        "
        onmouseenter="this.style.borderColor='rgba(212,144,154,0.5)';this.style.background='rgba(19,12,26,0.9)'"
        onmouseleave="this.style.borderColor='rgba(212,144,154,0.18)';this.style.background='rgba(14,8,18,0.8)'"
        >
          <span style="
            font-family: 'DM Mono', monospace; font-size: .48rem;
            letter-spacing: .22em; text-transform: uppercase; color: #7a3d4a;
            display: block; margin-bottom: .5rem;
          ">${dir === 'prev' ? '← Article précédent' : 'Article suivant →'}</span>
          <span style="
            font-family: 'Cormorant Garamond', serif; font-size: 1.05rem;
            color: #ede4e6; line-height: 1.25; display: block; margin-bottom: .4rem;
          ">${title}</span>
          <span style="
            font-family: 'DM Mono', monospace; font-size: .46rem;
            letter-spacing: .16em; text-transform: uppercase; color: #6e5860;
          ">${tag}</span>
        </a>
      `;
    };

    prevNext.innerHTML =
      makeCard(ph, pt, ptg, 'prev') +
      makeCard(nh, nt, ntg, 'next');
  }


  /* ── 5. SCROLL REVEAL (si pas déjà présent) ── */
  if (!document.querySelector('[data-sr-init]')) {
    document.body.setAttribute('data-sr-init', '1');
    const rvItems = document.querySelectorAll('.rv');
    const rvObs   = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); rvObs.unobserve(e.target); }
      });
    }, { threshold: 0.07 });
    rvItems.forEach(el => rvObs.observe(el));
  }

})();
