/* ==========================================================================
   LAKSHMIDHAR N — Behavior
   ========================================================================== */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------------------------------- preloader ---------------------------------- */
  const preloader = document.getElementById('preloader');
  const preCount = document.getElementById('preCount');
  const preBar = document.getElementById('preBar');
  if (preloader) {
    const seen = sessionStorage.getItem('ln_loaded') === '1';
    if (seen || reduceMotion) {
      preloader.classList.add('done');
      preloader.style.display = 'none';
    } else {
      let n = 0;
      const dur = 1100;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        n = Math.round(p * 100);
        if (preCount) preCount.textContent = String(n).padStart(3, '0');
        if (preBar) preBar.style.width = (p * 100) + '%';
        if (p < 1) requestAnimationFrame(tick);
        else {
          setTimeout(() => {
            preloader.classList.add('done');
            sessionStorage.setItem('ln_loaded', '1');
            setTimeout(() => { preloader.style.display = 'none'; }, 650);
          }, 200);
        }
      }
      requestAnimationFrame(tick);
    }
  }

  /* ------------------------------------ custom cursor ------------------------------ */
  if (fineHover && !reduceMotion) {
    const cursor = document.createElement('div');
    cursor.id = 'cursor';
    cursor.innerHTML = '<span class="cursor-label"></span>';
    document.body.appendChild(cursor);
    document.body.classList.add('has-cursor');

    let mx = -100, my = -100, cx = -100, cy = -100;
    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    function raf() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const labelEl = cursor.querySelector('.cursor-label');
    document.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('big');
        labelEl.textContent = el.getAttribute('data-cursor') || '';
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('big');
        labelEl.textContent = '';
      });
    });
    document.querySelectorAll('a, button').forEach(el => {
      if (el.hasAttribute('data-cursor')) return;
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
  }

  /* ------------------------------------ noise overlay -------------------------------- */
  const noise = document.createElement('div');
  noise.className = 'noise';
  noise.innerHTML = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter>
    <rect width="100%" height="100%" filter="url(#n)"/>
  </svg>`;
  document.body.appendChild(noise);

  /* -------------------------------------- scroll progress --------------------------------- */
  const progress = document.getElementById('progress');
  function updateProgress() {
    if (!progress) return;
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = max > 0 ? `${(scrolled / max) * 100}%` : '0%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------------------------------------- nav active ------------------------------------- */
  const page = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.menu-links a, .nav-links-inline a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ------------------------------------------ menu overlay ---------------------------------- */
  const menuBtn = document.getElementById('menuBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  function closeMenu() {
    menuOverlay?.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openMenu() {
    if (menuOverlay) menuOverlay.scrollTop = 0;
    menuOverlay?.classList.add('open');
    menuBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  menuBtn?.addEventListener('click', () => {
    menuOverlay?.classList.contains('open') ? closeMenu() : openMenu();
  });
  menuOverlay?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ------------------------------------------- hero decode text ------------------------------ */
  const heroName = document.querySelector('.hero-name[data-decode]');
  if (heroName) {
    const full = heroName.getAttribute('data-decode') || '';
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$*+-/\\';
    if (reduceMotion) {
      heroName.textContent = full;
    } else {
      const chars = full.split('').map(c => {
        const span = document.createElement('span');
        span.className = 'ch';
        span.textContent = c === ' ' ? '\u00A0' : c;
        return span;
      });
      heroName.textContent = '';
      chars.forEach(c => heroName.appendChild(c));

      chars.forEach((span, i) => {
        if (full[i] === ' ') return;
        const target = full[i];
        const startDelay = 250 + i * 45;
        const duration = 500;
        const frameTime = 40;
        const frames = Math.floor(duration / frameTime);
        let f = 0;
        setTimeout(() => {
          const iv = setInterval(() => {
            f++;
            if (f >= frames) {
              span.textContent = target;
              clearInterval(iv);
            } else {
              span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
            }
          }, frameTime);
        }, startDelay);
      });
    }
  }

  /* -------------------------------------------- scroll reveal --------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* --------------------------------------------- stat count-up ---------------------------------- */
  const statNums = document.querySelectorAll('.stat-num');
  function animateStat(el) {
    const target = el.getAttribute('data-target');
    const suffix = el.getAttribute('data-suffix') || '';
    if (target !== null) {
      const end = parseInt(target, 10);
      if (reduceMotion) { el.textContent = end + suffix; return; }
      const dur = 900;
      const start = performance.now();
      function step(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * end) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    } else if (suffix) {
      const endVal = parseFloat(el.textContent);
      if (reduceMotion || isNaN(endVal)) { el.textContent = el.textContent.trim() + suffix; return; }
      const dur = 900;
      const start = performance.now();
      function step(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (eased * endVal).toFixed(2) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }
  if (statNums.length) {
    if ('IntersectionObserver' in window) {
      const statIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { animateStat(entry.target); statIo.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      statNums.forEach(el => statIo.observe(el));
    } else {
      statNums.forEach(animateStat);
    }
  }

  /* ---------------------------------------------- back to top ------------------------------------ */
  const toTop = document.getElementById('toTop');
  function toggleToTop() { if (toTop) toTop.classList.toggle('show', window.scrollY > 480); }
  document.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ----------------------------------------------- project / cert modal --------------------------- */
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  let lastFocused = null;

  window.openModal = function (id) {
    const tpl = document.getElementById('tpl-' + id);
    if (!tpl || !modal || !modalContent) return;
    lastFocused = document.activeElement;
    modalContent.innerHTML = '';
    modalContent.appendChild(tpl.content.cloneNode(true));
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close')?.focus();
  };
  window.closeModal = function () {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    lastFocused?.focus();
  };
  modal?.addEventListener('click', (e) => { if (e.target === modal) window.closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal?.classList.contains('open')) window.closeModal(); });

  /* ------------------------------------------------- certificate scroller -------------------------- */
  const certGrid = document.getElementById('certGrid');
  const certPrev = document.getElementById('certPrev');
  const certNext = document.getElementById('certNext');
  const fadeL = document.querySelector('.cert-fade-l');
  const fadeR = document.querySelector('.cert-fade-r');

  function certStep() {
    if (!certGrid) return 0;
    const card = certGrid.querySelector('.cert-card');
    return card ? card.getBoundingClientRect().width + 18 : 260;
  }
  function updateCertFades() {
    if (!certGrid) return;
    const max = certGrid.scrollWidth - certGrid.clientWidth - 2;
    const atStart = certGrid.scrollLeft <= 2;
    const atEnd = certGrid.scrollLeft >= max;
    fadeL?.classList.toggle('show', !atStart);
    fadeR?.classList.toggle('show', max > 2 && !atEnd);
    if (certPrev) certPrev.disabled = atStart;
    if (certNext) certNext.disabled = max <= 2 || atEnd;
  }
  if (certGrid) {
    certPrev?.addEventListener('click', () => certGrid.scrollBy({ left: -certStep() * 2, behavior: reduceMotion ? 'auto' : 'smooth' }));
    certNext?.addEventListener('click', () => certGrid.scrollBy({ left: certStep() * 2, behavior: reduceMotion ? 'auto' : 'smooth' }));
    certGrid.addEventListener('scroll', updateCertFades, { passive: true });
    window.addEventListener('resize', updateCertFades);
    updateCertFades();
  }

  /* -------------------------------------------------- contact form ------------------------------------ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    let note = contactForm.querySelector('.form-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'form-note mono';
      note.setAttribute('role', 'status');
      note.setAttribute('aria-live', 'polite');
      contactForm.appendChild(note);
    }
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cname')?.value.trim();
      const email = document.getElementById('cemail')?.value.trim();
      const msg = document.getElementById('cmsg')?.value.trim();
      if (!name || !email || !msg) {
        note.textContent = '[ERROR] all fields are required.';
        note.style.color = '#ff6a5a';
        return;
      }
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.textContent = 'SENDING...'; submitBtn.disabled = true; }
      setTimeout(() => {
        note.style.color = '';
        note.textContent = `[OK] message queued — I'll reply at ${email} soon.`;
        contactForm.reset();
        if (submitBtn) { submitBtn.textContent = originalLabel; submitBtn.disabled = false; }
      }, 700);
    });
  }

  /* --------------------------------------------------- footer year -------------------------------------- */
  const copyYear = document.getElementById('copyYear');
  if (copyYear) {
    const y = new Date().getFullYear();
    copyYear.textContent = copyYear.textContent.replace(/©\s*\d{4}/, `© ${y}`);
  }

  /* --------------------------------------------------- live clocks (top strip + footer) ------------------ */
  const liveClocks = document.querySelectorAll('.liveClock');
  if (liveClocks.length) {
    function pad(n) { return String(n).padStart(2, '0'); }
    function tickClock() {
      const d = new Date();
      const stamp = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      liveClocks.forEach(el => { el.textContent = `[DATE] ${stamp}`; });
    }
    tickClock();
    setInterval(tickClock, 1000);
  }
})();