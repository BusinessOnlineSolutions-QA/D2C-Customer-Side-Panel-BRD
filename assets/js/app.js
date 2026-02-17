
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
 // - Center-line detection + hysteresis + rAF throttle
 // =========================================================
 (function(){
   const nav = document.getElementById('sidebarNav');
   const links = Array.from(nav.querySelectorAll('a[data-spy]'));

   const items = links.map(a => {
     const id = a.getAttribute('href').slice(1);
     return { a, id, el: document.getElementById(id) };
   }).filter(x => x.el);

   // Detection line position within viewport (0..1)
   const SPY_Y = 0.46;

   // Hysteresis threshold in px (prevents rapid toggling)
   const HYST = 70;

   let activeId = null;
   let activeDist = Infinity;
   let ticking = false;

   function setActive(id){
     if(activeId === id) return;
     activeId = id;

     links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#'+id));

     // Keep active link visible within sidebar (good UX)
     const activeLink = nav.querySelector('a.active');
     if(activeLink){
       const navRect = nav.getBoundingClientRect();
       const linkRect = activeLink.getBoundingClientRect();
       const topOverflow = linkRect.top < navRect.top + 8;
       const bottomOverflow = linkRect.bottom > navRect.bottom - 8;
       if(topOverflow || bottomOverflow){
         activeLink.scrollIntoView({block:'nearest'});
       }
     }
   }

   function compute(){
     ticking = false;

     const vh = window.innerHeight || document.documentElement.clientHeight;
     const spyYpx = vh * SPY_Y;

     let best = null;

     for(const it of items){
       const r = it.el.getBoundingClientRect();

       // Only consider visible-ish sections
       if(r.bottom < 0 || r.top > vh) continue;

       const center = r.top + (r.height / 2);
       const dist = Math.abs(center - spyYpx);

       if(!best || dist < best.dist){
         best = { id: it.id, dist };
       }
     }

     if(!best) return;

     // First set
     if(activeId === null){
       activeDist = best.dist;
       setActive(best.id);
       return;
     }

     // Same section, update distance
     if(best.id === activeId){
       activeDist = best.dist;
       return;
     }

     // Switch only if it's meaningfully closer
     if(best.dist + HYST < activeDist){
       activeDist = best.dist;
       setActive(best.id);
     } else {
       // soften activeDist so next switch isn't blocked forever
       activeDist = Math.min(activeDist, best.dist + HYST);
     }
   }

   function onScroll(){
     if(ticking) return;
     ticking = true;
     requestAnimationFrame(compute);
   }

   // Smooth scroll click + immediate active set
   links.forEach(a => {
     a.addEventListener('click', (e) => {
       const href = a.getAttribute('href');
       const target = document.querySelector(href);
       if(!target) return;
       e.preventDefault();

       setActive(href.slice(1)); // immediate highlight
       target.scrollIntoView({behavior:'smooth', block:'start'});

       // Recompute after scroll settles
       setTimeout(compute, 140);
       setTimeout(compute, 320);
     });
   });

   window.addEventListener('scroll', onScroll, {passive:true});
   window.addEventListener('resize', onScroll);

   // Initial compute
   setTimeout(compute, 0);
 })();

