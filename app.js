/**
 * =============================================================================
 * Maple Air — app.js
 * Premium vanilla JS: scroll effects, FAQ, quantity selector,
 * checkout modal with multi-step form and validation.
 * No dependencies — runs as-is on GitHub Pages.
 * =============================================================================
 */

'use strict';

/* --------------------------------------------------------------------------
   Utility helpers
   -------------------------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Format a number as USD currency string (no decimals) */
const formatPrice = (n) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/** Generate a random order number like MA-294817 */
const generateOrderNumber = () =>
  'MA-' + Math.floor(100000 + Math.random() * 900000);


/* --------------------------------------------------------------------------
   1. Navigation — blur + shadow on scroll, hamburger menu
   -------------------------------------------------------------------------- */
(function initNav() {
  const nav       = $('#main-nav');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.nav__mobile-link');

  if (!nav) return;

  // Throttled scroll handler for performance
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });
})();


/* --------------------------------------------------------------------------
   2. Smooth scroll for all anchor links
   -------------------------------------------------------------------------- */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    const navHeight = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height'), 10) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();


/* --------------------------------------------------------------------------
   3. Scroll Reveal — IntersectionObserver
   -------------------------------------------------------------------------- */
(function initScrollReveal() {
  const elements = $$('.reveal, .reveal-left, .reveal-right');
  if (!elements.length) return;

  // Skip animation if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* --------------------------------------------------------------------------
   4. Hero parallax — subtle, performant
   -------------------------------------------------------------------------- */
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const hero = $('.hero');
  if (!hero) return;

  const orb1 = $('.hero__orb--1');
  const orb2 = $('.hero__orb--2');

  let lastY = 0;
  let rafId;

  const update = () => {
    const scrollY = window.scrollY;
    if (scrollY === lastY) {
      rafId = requestAnimationFrame(update);
      return;
    }
    lastY = scrollY;

    const heroBottom = hero.offsetHeight;
    if (scrollY > heroBottom) {
      rafId = requestAnimationFrame(update);
      return;
    }

    const factor = scrollY * 0.15;
    if (orb1) orb1.style.transform = `translateY(${factor}px)`;
    if (orb2) orb2.style.transform = `translateY(${-factor * 0.6}px)`;

    rafId = requestAnimationFrame(update);
  };

  rafId = requestAnimationFrame(update);

  // Cleanup on hero out of view
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(update);
      }
    },
    { threshold: 0 }
  );
  heroObserver.observe(hero);
})();


/* --------------------------------------------------------------------------
   5. Quantity Selector (on landing page)
   -------------------------------------------------------------------------- */
const UNIT_PRICE = 799; // SWAP: Update this when real price is set

(function initQuantitySelector() {
  const qtyInput  = $('#hvac-qty');
  const minusBtn  = $('#qty-minus');
  const plusBtn   = $('#qty-plus');

  if (!qtyInput) return;

  const update = (val) => {
    const n = Math.max(1, Math.min(10, parseInt(val) || 1));
    qtyInput.value = n;

    // Update landing page subtotal display
    const unitEl  = $('#subtotal-unit');
    const totalEl = $('#subtotal-total');
    if (unitEl)  unitEl.textContent  = formatPrice(UNIT_PRICE) + ' × ' + n;
    if (totalEl) totalEl.textContent = formatPrice(UNIT_PRICE * n);

    // Sync to checkout modal cart quantity display
    const cartQtyEl     = $('#cart-qty');
    const cartLineEl    = $('#cart-line-price');
    const cartSubtotEl  = $('#cart-subtotal');
    const cartTotalEl   = $('#cart-total');
    if (cartQtyEl)    cartQtyEl.textContent    = n;
    if (cartLineEl)   cartLineEl.textContent   = formatPrice(UNIT_PRICE * n);
    if (cartSubtotEl) cartSubtotEl.textContent = formatPrice(UNIT_PRICE * n);
    if (cartTotalEl)  cartTotalEl.textContent  = formatPrice(UNIT_PRICE * n);
  };

  if (minusBtn) minusBtn.addEventListener('click', () => update(+qtyInput.value - 1));
  if (plusBtn)  plusBtn.addEventListener('click',  () => update(+qtyInput.value + 1));

  qtyInput.addEventListener('input', () => update(qtyInput.value));
  qtyInput.addEventListener('blur',  () => update(qtyInput.value));

  update(1); // Initialize
})();


/* --------------------------------------------------------------------------
   6. FAQ Accordion
   -------------------------------------------------------------------------- */
(function initFaq() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq-item__question');
    const answer   = item.querySelector('.faq-item__answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other open items (only one open at a time)
      items.forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          other.querySelector('.faq-item__question')
              ?.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle this one
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    });

    // Keyboard: Enter + Space
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });
})();


/* --------------------------------------------------------------------------
   7. Checkout Modal — open/close + trap focus
   -------------------------------------------------------------------------- */
const modalOverlay = $('#checkout-modal');
const modalBox     = $('#modal-box');

function openModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  goToStep(1); // Always start at step 1
  // Move focus inside modal
  setTimeout(() => {
    const firstFocusable = modalBox?.querySelector('button, input, select');
    firstFocusable?.focus();
  }, 350);
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// All "Buy Now" buttons open modal
(function initBuyButtons() {
  const buyIds = ['nav-buy-btn', 'hero-buy-btn', 'mobile-buy-btn', 'purchase-btn', 'final-buy-btn'];
  buyIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', openModal);
  });
})();

// Close via X button
$('#modal-close')?.addEventListener('click', closeModal);

// Close via overlay click
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Close via Escape key + trap Tab focus
document.addEventListener('keydown', (e) => {
  if (!modalOverlay?.classList.contains('open')) return;

  if (e.key === 'Escape') {
    closeModal();
    return;
  }

  // Tab trap
  if (e.key === 'Tab') {
    const focusable = $$('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', modalBox);
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
});

// Done button on confirmation
$('#close-confirm')?.addEventListener('click', closeModal);


/* --------------------------------------------------------------------------
   8. Multi-step Checkout Flow
   -------------------------------------------------------------------------- */
let currentStep = 1;

function goToStep(n) {
  currentStep = n;

  // Show/hide steps
  $$('.modal__step').forEach((step, i) => {
    step.classList.toggle('active', i + 1 === n);
  });

  // Update progress bar
  $$('.progress-step').forEach((ps, i) => {
    ps.classList.remove('active', 'completed');
    if (i + 1 === n) {
      ps.classList.add('active');
      ps.setAttribute('aria-current', 'step');
    } else if (i + 1 < n) {
      ps.classList.add('completed');
      ps.removeAttribute('aria-current');
      // Show checkmark in completed dot
      ps.querySelector('.progress-step__dot').textContent = '✓';
    } else {
      ps.removeAttribute('aria-current');
      ps.querySelector('.progress-step__dot').textContent = String(i + 1);
    }
  });

  // Update modal title
  const titles = {
    1: 'Review Your Order',
    2: 'Your Information',
    3: 'Schedule Installation',
    4: 'Order Confirmed',
  };
  const titleEl = $('#modal-title');
  if (titleEl) titleEl.textContent = titles[n] || 'Complete Your Order';

  // Scroll modal to top on step change
  if (modalBox) modalBox.scrollTop = 0;
}

// Step navigation buttons
$('#step1-next')?.addEventListener('click', () => goToStep(2));
$('#step2-back')?.addEventListener('click', () => goToStep(1));
$('#step3-back')?.addEventListener('click', () => goToStep(2));

// Step 2 → Step 3: validate customer form
$('#step2-next')?.addEventListener('click', () => {
  if (validateCustomerForm()) {
    goToStep(3);
  }
});

// Step 3 → Step 4: validate schedule form + generate order
$('#step3-next')?.addEventListener('click', () => {
  if (validateScheduleForm()) {
    // Generate order number
    const orderNumEl = $('#order-number');
    if (orderNumEl) orderNumEl.textContent = generateOrderNumber();
    goToStep(4);
  }
});


/* --------------------------------------------------------------------------
   9. Form Validation
   -------------------------------------------------------------------------- */

/** Mark a form group as errored or clear error */
function setFieldError(groupId, hasError) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.classList.toggle('has-error', hasError);
  const input = group.querySelector('.form-input, .form-select');
  if (input) input.classList.toggle('error', hasError);
}

/** Basic email regex check */
const isValidEmail = (val) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

/** Basic US phone check — allows (555) 555-5555, 555-555-5555, 5555555555, etc. */
const isValidPhone = (val) =>
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(val.replace(/\s/g, ''));

/** Basic US ZIP check */
const isValidZip = (val) =>
  /^\d{5}(-\d{4})?$/.test(val.trim());

function validateCustomerForm() {
  let valid = true;

  const checks = [
    { id: 'first-name', fg: 'fg-first',   test: v => v.trim().length >= 1 },
    { id: 'last-name',  fg: 'fg-last',    test: v => v.trim().length >= 1 },
    { id: 'email',      fg: 'fg-email',   test: v => isValidEmail(v) },
    { id: 'phone',      fg: 'fg-phone',   test: v => isValidPhone(v) },
    { id: 'address',    fg: 'fg-address', test: v => v.trim().length >= 3 },
    { id: 'city',       fg: 'fg-city',    test: v => v.trim().length >= 2 },
    { id: 'state',      fg: 'fg-state',   test: v => v !== '' },
    { id: 'zip',        fg: 'fg-zip',     test: v => isValidZip(v) },
  ];

  checks.forEach(({ id, fg, test }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const hasError = !test(el.value);
    setFieldError(fg, hasError);
    if (hasError) valid = false;
  });

  // Focus first error field
  if (!valid) {
    const firstError = $('#customer-form .has-error .form-input, #customer-form .has-error .form-select');
    firstError?.focus();
  }

  return valid;
}

function validateScheduleForm() {
  let valid = true;

  const checks = [
    { id: 'hvac-count-confirm', fg: 'fg-hvac-confirm', test: v => v !== '' },
    { id: 'day-pref',           fg: 'fg-day-pref',     test: v => v !== '' },
    { id: 'time-pref',          fg: 'fg-time-pref',    test: v => v !== '' },
  ];

  checks.forEach(({ id, fg, test }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const hasError = !test(el.value);
    setFieldError(fg, hasError);
    if (hasError) valid = false;
  });

  if (!valid) {
    const firstError = $('#schedule-form .has-error .form-select');
    firstError?.focus();
  }

  return valid;
}

// Live validation — clear errors as user types/selects
(function initLiveValidation() {
  const fields = [
    '#first-name', '#last-name', '#email', '#phone',
    '#address', '#city', '#state', '#zip',
    '#hvac-count-confirm', '#day-pref', '#time-pref'
  ];

  fields.forEach(sel => {
    const el = $(sel);
    if (!el) return;
    const fgId = el.closest('.form-group')?.id;
    if (!fgId) return;

    el.addEventListener('input', () => {
      if (el.closest('.form-group')?.classList.contains('has-error')) {
        setFieldError(fgId, false);
      }
    });
  });
})();


/* --------------------------------------------------------------------------
   10. Phone input auto-formatting (US)
   -------------------------------------------------------------------------- */
(function initPhoneFormat() {
  const phone = $('#phone');
  if (!phone) return;

  phone.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 10);
    if (val.length >= 7) {
      val = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
    } else if (val.length >= 4) {
      val = `(${val.slice(0, 3)}) ${val.slice(3)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    e.target.value = val;
  });
})();


/* --------------------------------------------------------------------------
   11. Subtle entrance animation for stat cards in hero
   -------------------------------------------------------------------------- */
(function initHeroCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = $$('.hero__stat-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 800 + i * 200);
  });
})();


/* --------------------------------------------------------------------------
   12. Benefit card micro-interaction — 3D tilt on hover (desktop only)
   -------------------------------------------------------------------------- */
(function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const cards = $$('.benefit-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* --------------------------------------------------------------------------
   13. Animated counter for statistics in Problem section
   -------------------------------------------------------------------------- */
(function initCounterAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Only animate simple integers; skip complex values like "2–5×"
  const statNums = $$('.problem__stat-num');
  if (!statNums.length) return;

  const animateCounter = (el) => {
    const text  = el.textContent.trim();
    const match = text.match(/^(\d+)/);
    if (!match) return; // Skip non-numeric or complex strings

    const target   = parseInt(match[1], 10);
    const suffix   = text.slice(match[0].length);
    const duration = 1200;
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(ease * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNums.forEach(el => observer.observe(el));
})();


/* --------------------------------------------------------------------------
   14. Proof stat counter animation
   -------------------------------------------------------------------------- */
(function initProofCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const proofNums = $$('.proof__stat-number');
  if (!proofNums.length) return;

  const animateProof = (el) => {
    const raw   = el.textContent.trim();
    const match = raw.match(/^([\d.]+)/);
    if (!match) return;

    const target   = parseFloat(match[1]);
    const suffix   = raw.slice(match[0].length);
    const isFloat  = match[1].includes('.');
    const duration = 1500;
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = ease * target;
      el.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateProof(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  proofNums.forEach(el => observer.observe(el));
})();


/* --------------------------------------------------------------------------
   15. Floating particles — very subtle canvas effect on hero (optional)
   Disabled by default to keep performance clean.
   To enable: set ENABLE_PARTICLES = true
   -------------------------------------------------------------------------- */
const ENABLE_PARTICLES = false;

(function initParticles() {
  if (!ENABLE_PARTICLES) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const hero = $('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  hero.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const resize = () => {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  };

  const createParticle = () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(Math.random() * 0.3 + 0.1),
    alpha: Math.random() * 0.12 + 0.04,
  });

  const init = () => {
    resize();
    particles = Array.from({ length: 40 }, createParticle);
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 5; p.x = Math.random() * W; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(61, 107, 80, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize, { passive: true });
  init();
  draw();
})();


/* --------------------------------------------------------------------------
   16. "Add to cart" visual feedback on purchase button
   -------------------------------------------------------------------------- */
(function initPurchaseBtnFeedback() {
  const purchaseBtn = $('#purchase-btn');
  if (!purchaseBtn) return;

  // The button already opens the modal via the shared event in #7.
  // This adds a brief "loading" visual before the modal opens.
  purchaseBtn.addEventListener('click', () => {
    purchaseBtn.textContent = 'Opening…';
    purchaseBtn.disabled = true;

    setTimeout(() => {
      purchaseBtn.textContent = 'Purchase';
      purchaseBtn.disabled = false;
    }, 600);
  }, { capture: true }); // capture so this runs before the openModal handler
})();


/* --------------------------------------------------------------------------
   17. Accessibility: skip link (injected via JS for clean HTML)
   -------------------------------------------------------------------------- */
(function injectSkipLink() {
  const link = document.createElement('a');
  link.href = '#hero';
  link.className = 'visually-hidden';
  link.textContent = 'Skip to main content';
  link.style.cssText = `
    position: fixed; top: -9999px; left: 16px; z-index: 9999;
    background: var(--sage-600); color: white; padding: 8px 16px;
    border-radius: 4px; font-size: 14px; font-weight: 600;
    text-decoration: none; transition: top 0.1s;
  `;

  link.addEventListener('focus', () => {
    link.style.top = '8px';
  });
  link.addEventListener('blur', () => {
    link.style.top = '-9999px';
  });

  document.body.prepend(link);
})();


/* --------------------------------------------------------------------------
   18. Lazy preload fonts indicator (ensures Fraunces renders before paint)
   -------------------------------------------------------------------------- */
(function checkFonts() {
  if (!document.fonts) return;
  document.fonts.ready.then(() => {
    document.documentElement.classList.add('fonts-loaded');
  });
})();


/* --------------------------------------------------------------------------
   Console message (for curious developers)
   -------------------------------------------------------------------------- */
console.log(
  '%c🍁 Maple Air %c— Built with care. Swap the placeholders, deploy, breathe easy.',
  'color: #3d6b50; font-weight: 700; font-size: 14px;',
  'color: #6b7280; font-size: 12px;'
);
