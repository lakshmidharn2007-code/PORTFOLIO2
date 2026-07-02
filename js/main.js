/* ==========================================================================
   LN.SYS — Behavior
   ========================================================================== */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------- boot sequence ---------------------------- */
  const boot = document.getElementById('boot');
  const bootLines = document.getElementById('bootLines');
  if (boot && bootLines) {
    const alreadyBooted = sessionStorage.getItem('ln_booted') === '1';
    if (alreadyBooted || reduceMotion) {
      boot.classList.add('done');
      boot.style.display = 'none';
    } else {
      const lines = [
        'INITIALIZING LN.SYS v1.0.0 ...',
        'LOADING MODULES: AI_CORE · DATA_ENGINE · UI_RENDER',
        'AUTH: GUEST_ACCESS_GRANTED',
        'MOUNTING PORTFOLIO_INDEX ... <span class="ok">OK</span>',
        '<b>STATUS: ONLINE</b>'
      ];
      lines.forEach((text, i) => {
        const div = document.createElement('div');
        div.className = 'bl';
        div.innerHTML = text;
        bootLines.appendChild(div);
        setTimeout(() => div.classList.add('show'), 140 + i * 220);
      });
      setTimeout(() => {
        boot.classList.add('done');
        sessionStorage.setItem('ln_booted', '1');
        setTimeout(() => { boot.style.display = 'none'; }, 550);
      }, 140 + lines.length * 220 + 350);
    }
  }

  /* ------------------------------ scroll progress -------------------------- */
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

  /* -------------------------------- live clock ------------------------------ */
  const liveDate = document.getElementById('liveDate');
  function updateClock() {
    if (!liveDate) return;
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    liveDate.textContent = `[DATE] ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* --------------------------------- nav active ------------------------------ */
  const page = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a, .mobile-drawer a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ------------------------------- mobile drawer ------------------------------ */
  const menuBtn = document.getElementById('menuBtn');
  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('scrim');
  function closeDrawer() {
    drawer?.classList.remove('open');
    scrim?.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }
  function openDrawer() {
    drawer?.classList.add('open');
    scrim?.classList.add('open');
    menuBtn?.setAttribute('aria-expanded', 'true');
  }
  menuBtn?.addEventListener('click', () => {
    drawer?.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  scrim?.addEventListener('click', closeDrawer);
  drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* --------------------------------- typed tag --------------------------------- */
  const typedTag = document.getElementById('typedTag');
  if (typedTag) {
    const full = typedTag.getAttribute('aria-label') || typedTag.textContent || '';
    if (reduceMotion) {
      typedTag.textContent = full;
    } else {
      typedTag.textContent = '';
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      cursor.textContent = '_';
      typedTag.appendChild(span);
      typedTag.appendChild(cursor);
      let i = 0;
      function type() {
        if (i <= full.length) {
          span.textContent = full.slice(0, i);
          i++;
          setTimeout(type, 34);
        }
      }
      setTimeout(type, 900);
    }
  }

  /* ------------------------------- scroll reveal -------------------------------- */
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

  /* --------------------------------- stat count-up -------------------------------- */
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
          if (entry.isIntersecting) {
            animateStat(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      statNums.forEach(el => statIo.observe(el));
    } else {
      statNums.forEach(animateStat);
    }
  }

  /* --------------------------------- skill bars ------------------------------------ */
  const skillFills = document.querySelectorAll('.skillbar-fill');
  if (skillFills.length) {
    if ('IntersectionObserver' in window) {
      const skillIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const w = entry.target.getAttribute('data-width') || '0';
            entry.target.style.width = w + '%';
            skillIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      skillFills.forEach(el => skillIo.observe(el));
    } else {
      skillFills.forEach(el => { el.style.width = (el.getAttribute('data-width') || '0') + '%'; });
    }
  }

  /* ------------------------------------ back to top -------------------------------- */
  const toTop = document.getElementById('toTop');
  function toggleToTop() {
    if (!toTop) return;
    toTop.classList.toggle('show', window.scrollY > 480);
  }
  document.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();
  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* --------------------------------------- project modal ---------------------------------- */
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
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn?.focus();
  };

  window.closeModal = function () {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    lastFocused?.focus();
  };

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) window.closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) window.closeModal();
  });

  /* ------------------------------------------- contact form -------------------------------------- */
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
        note.style.color = '#ff8a8a';
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

  /* ---------------------------------------------- footer year ------------------------------------- */
  const copyYear = document.getElementById('copyYear');
  if (copyYear) {
    const y = new Date().getFullYear();
    copyYear.textContent = copyYear.textContent.replace(/©\s*\d{4}/, `© ${y}`);
  }
})();
