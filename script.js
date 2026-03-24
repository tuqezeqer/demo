/* ============================================================
   LAFROMED HEALTHCARE — script.js
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Header nav scroll shadow ─────────────────────── */
  const headerNav = document.getElementById('headerNav');
  if (headerNav) {
    window.addEventListener('scroll', () => {
      headerNav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ── 2. Mobile slide-in menu ─────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileClose');

  function openMobile() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobile() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMobile);
  if (mobileClose) mobileClose.addEventListener('click', closeMobile);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobile);

  // Close on link click
  document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', closeMobile);
  });

  /* ── 3. Spotlight search (mobile) ──────────────────────── */
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const spotlightOverlay = document.getElementById('spotlightOverlay');
  const spotlightBackdrop = document.getElementById('spotlightBackdrop');
  const spotlightInput = document.getElementById('spotlightInput');

  function openSpotlight() {
    spotlightOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => spotlightInput.focus(), 150);
  }
  function closeSpotlight() {
    spotlightOverlay.classList.remove('open');
    document.body.style.overflow = '';
    spotlightInput.value = '';
  }

  if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', openSpotlight);
  if (spotlightBackdrop) spotlightBackdrop.addEventListener('click', closeSpotlight);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && spotlightOverlay && spotlightOverlay.classList.contains('open')) {
      closeSpotlight();
    }
  });

  /* ── 4. Language dropdown ────────────────────────────── */
  function initLangDropdown(toggleId, dropdownId, flagId) {
    const toggle = document.getElementById(toggleId);
    const dropdown = document.getElementById(dropdownId);
    const currentFlag = document.getElementById(flagId);
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      document.querySelectorAll('.header-lang.open').forEach(el => {
        if (el !== toggle) el.classList.remove('open');
      });
      toggle.classList.toggle('open');
    });

    dropdown.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const flag = opt.dataset.flag;
        const lang = opt.dataset.lang;
        if (currentFlag) currentFlag.src = flag;
        // Update active state
        dropdown.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        toggle.classList.remove('open');
        // Sync both dropdowns (desktop + mobile)
        document.querySelectorAll('.lang-option').forEach(o => {
          o.classList.toggle('active', o.dataset.lang === lang);
        });
        document.querySelectorAll('#currentFlag, #currentFlagMob').forEach(f => {
          if (f) f.src = flag;
        });
        // Trigger i18n language switch
        if (typeof I18n !== 'undefined' && lang) {
          I18n.setLanguage(lang);
        }
      });
    });
  }

  initLangDropdown('langToggle', 'langDropdown', 'currentFlag');
  initLangDropdown('langToggleMob', 'langDropdownMob', 'currentFlagMob');

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.header-lang.open').forEach(el => el.classList.remove('open'));
  });

  /* ── 5. Animated counters ────────────────────────────── */
  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('az-AZ');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('az-AZ');
    };
    requestAnimationFrame(step);
  };

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stat-number').forEach(el => counterObs.observe(el));

  /* ── 6. Scroll-reveal for cards ──────────────────────── */
  const revealGroups = ['.service-card', '.doctor-card', '.appointment-form', '.appointment-text'];
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealGroups.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
      revealObs.observe(el);
    });
  });

  /* ── 7. Appointment form ─────────────────────────────── */
  const form = document.getElementById('appointmentForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      const original = btn.textContent;
      let valid = true;
      form.querySelectorAll('input[type="text"], input[type="tel"]').forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = '#ef4444';
          input.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
          valid = false;
          input.addEventListener('input', () => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
          }, { once: true });
        }
      });
      if (!valid) return;
      btn.textContent = '✓ Tələbiniz Qəbul Edildi!';
      btn.style.background = '#059669';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3200);
    });
  }

});
