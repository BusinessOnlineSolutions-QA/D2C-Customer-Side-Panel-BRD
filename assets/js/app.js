// =========================================================
// Payment scenario tabs
// =========================================================
(function(){
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tabpanel');

  function activate(id){
    panels.forEach(p => p.classList.toggle('active', p.id === id));
    tabs.forEach(t => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
  }

  tabs.forEach(t => {
    t.addEventListener('click', () => activate(t.dataset.tab));
    t.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(t.dataset.tab); }
      if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        e.preventDefault();
        const arr = Array.from(tabs);
        const i = arr.indexOf(t);
        const next = e.key === 'ArrowRight' ? (i+1) % arr.length : (i-1+arr.length) % arr.length;
        arr[next].focus();
        activate(arr[next].dataset.tab);
      }
    });
  });
})();


// =========================================================
// Flicker-Free Sidebar Highlight (Scroll Spy)
// - IntersectionObserver (most visible section wins)
// - No flicker, no jitter
// =========================================================
(function(){
  const nav = document.getElementById('sidebarNav');
  if(!nav) return;

  const links = Array.from(nav.querySelectorAll('a[data-spy]'));
  const items = links.map(a => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    return el ? { a, id, el } : null;
  }).filter(Boolean);

  let activeId = null;
  let programmaticScroll = false;
  let programmaticTimer = null;

  function setActive(id){
    if(!id || activeId === id) return;
    activeId = id;

    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#'+id));

    // Keep active link visible inside sidebar without scrollIntoView thrash
    const activeLink = nav.querySelector('a.active');
    if(activeLink){
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();

      const topOverflow = linkRect.top < navRect.top + 10;
      const bottomOverflow = linkRect.bottom > navRect.bottom - 10;

      if(topOverflow){
        nav.scrollTop -= (navRect.top + 10 - linkRect.top);
      } else if(bottomOverflow){
        nav.scrollTop += (linkRect.bottom - (navRect.bottom - 10));
      }
    }
  }

  const thresholds = Array.from({length: 21}, (_, i) => i / 20);
  const vis = new Map();

  const io = new IntersectionObserver((entries) => {
    if(programmaticScroll) return;

    for(const e of entries){
      vis.set(e.target.id, e.intersectionRatio || 0);
    }

    let bestId = null;
    let bestRatio = 0;

    for(const it of items){
      const ratio = vis.get(it.id) ?? 0;
      if(ratio > bestRatio){
        bestRatio = ratio;
        bestId = it.id;
      }
    }

    // Fallback if user scrolls fast
    if(!bestId || bestRatio < 0.08){
      const vh = window.innerHeight || document.documentElement.clientHeight;
      let bestTop = Infinity;
      for(const it of items){
        const r = it.el.getBoundingClientRect();
        if(r.bottom < 0 || r.top > vh) continue;
        const t = Math.abs(r.top);
        if(t < bestTop){
          bestTop = t;
          bestId = it.id;
        }
      }
    }

    if(bestId) setActive(bestId);
  }, {
    root: null,
    rootMargin: "-20% 0px -55% 0px",
    threshold: thresholds
  });

  items.forEach(it => io.observe(it.el));

  // Click: smooth scroll + pause observer until animation ends
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      const target = document.querySelector(href);
      if(!target) return;

      e.preventDefault();

      programmaticScroll = true;
      clearTimeout(programmaticTimer);

      setActive(href.slice(1));
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      programmaticTimer = setTimeout(() => {
        programmaticScroll = false;
      }, 450);
    });
  });

  // Initial
  setTimeout(() => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const firstVisible = items.find(it => {
      const r = it.el.getBoundingClientRect();
      return r.bottom > 0 && r.top < vh;
    });
    setActive((firstVisible ? firstVisible.id : (items[0] && items[0].id)) || null);
  }, 0);
})();
