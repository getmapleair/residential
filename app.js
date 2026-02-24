/**
 * =============================================================================
 * Maple Air — app.js v2
 * Vanilla JS: nav effects, FAQ, quantity selector, checkout modal.
 * No dependencies. Runs as-is on GitHub Pages.
 * =============================================================================
 */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const formatPrice = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const generateOrderNumber = () => 'MA-' + Math.floor(100000 + Math.random() * 900000);

/* --------------------------------------------------------------------------
   1. Nav — backdrop blur + shadow on scroll, hamburger
   -------------------------------------------------------------------------- */
(function initNav() {
  const nav  = $('#main-nav');
  const hbg  = $('#hamburger');
  const menu = $('#mobile-menu');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  if (hbg && menu) {
    hbg.addEventListener('click', () => {
      const open = menu.classList.contains('open');
      hbg.classList.toggle('active');
      menu.classList.toggle('open');
      hbg.setAttribute('aria-expanded', String(!open));
    });
    $$('.nav__mobile-link').forEach(l => l.addEventListener('click', () => {
      hbg.classList.remove('active');
      menu.classList.remove('open');
      hbg.setAttribute('aria-expanded', 'false');
    }));
  }
  document.addEventListener('click', (e) => {
    if (menu?.classList.contains('open') && !menu.contains(e.target) && !hbg?.contains(e.target)) {
      hbg?.classList.remove('active');
      menu.classList.remove('open');
      hbg?.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* --------------------------------------------------------------------------
   2. Smooth scroll — all internal anchor links
   -------------------------------------------------------------------------- */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href').slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 72;
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 16, behavior: 'smooth' });
});

/* --------------------------------------------------------------------------
   3. Scroll Reveal — IntersectionObserver
   -------------------------------------------------------------------------- */
(function initReveal() {
  const els = $$('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } }),
    { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => obs.observe(el));
})();

/* --------------------------------------------------------------------------
   4. Hero parallax — subtle, performant
   -------------------------------------------------------------------------- */
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;
  const orb1 = $('.hero__orb--1');
  const orb2 = $('.hero__orb--2');
  if (!orb1 && !orb2) return;
  let lastY = -1, rafId;
  const update = () => {
    const y = window.scrollY;
    if (y !== lastY) {
      lastY = y;
      const f = y * 0.14;
      if (orb1) orb1.style.transform = `translateY(${f}px)`;
      if (orb2) orb2.style.transform = `translateY(${-f * 0.6}px)`;
    }
    rafId = requestAnimationFrame(update);
  };
  rafId = requestAnimationFrame(update);
  const hero = $('.hero');
  if (hero) {
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) cancelAnimationFrame(rafId);
      else rafId = requestAnimationFrame(update);
    }, { threshold: 0 }).observe(hero);
  }
})();

/* --------------------------------------------------------------------------
   5. Quantity Selector
   -------------------------------------------------------------------------- */
const UNIT_PRICE = 799; // SWAP: update when real price is set

(function initQty() {
  const inp  = $('#hvac-qty');
  const minus = $('#qty-minus');
  const plus  = $('#qty-plus');
  if (!inp) return;

  const update = (v) => {
    const n = Math.max(1, Math.min(10, parseInt(v) || 1));
    inp.value = n;

    // Landing page subtotal
    const uEl = $('#subtotal-unit');
    const tEl = $('#subtotal-total');
    if (uEl) uEl.textContent = formatPrice(UNIT_PRICE) + ' × ' + n;
    if (tEl) tEl.textContent = formatPrice(UNIT_PRICE * n);

    // Modal cart sync
    const cqEl  = $('#cart-qty');
    const clpEl = $('#cart-line-price');
    const csEl  = $('#cart-subtotal');
    const ctEl  = $('#cart-total');
    if (cqEl)  cqEl.textContent  = n;
    if (clpEl) clpEl.textContent = formatPrice(UNIT_PRICE * n);
    if (csEl)  csEl.textContent  = formatPrice(UNIT_PRICE * n);
    if (ctEl)  ctEl.textContent  = formatPrice(UNIT_PRICE * n);
  };

  minus?.addEventListener('click', () => update(+inp.value - 1));
  plus?.addEventListener('click',  () => update(+inp.value + 1));
  inp.addEventListener('input', () => update(inp.value));
  inp.addEventListener('blur',  () => update(inp.value));
  update(1);
})();

/* --------------------------------------------------------------------------
   6. FAQ Accordion
   -------------------------------------------------------------------------- */
(function initFaq() {
  $$('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-item__question');
    if (!q) return;
    q.addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('.faq-item.open').forEach(o => {
        if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-item__question')?.setAttribute('aria-expanded', 'false'); }
      });
      item.classList.toggle('open', !open);
      q.setAttribute('aria-expanded', String(!open));
    });
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); q.click(); } });
  });
})();

/* --------------------------------------------------------------------------
   7. Checkout Modal — open/close/focus trap
   -------------------------------------------------------------------------- */
const overlay  = $('#checkout-modal');
const modalBox = $('#modal-box');

function openModal() {
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  goToStep(1);
  setTimeout(() => modalBox?.querySelector('button, input, select')?.focus(), 360);
}
function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// All buy buttons
['nav-buy-btn','hero-buy-btn','mobile-buy-btn','purchase-btn','final-buy-btn'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', openModal);
});
$('#modal-close')?.addEventListener('click', closeModal);
overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
$('#close-confirm')?.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (!overlay?.classList.contains('open')) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    const focusable = $$('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', modalBox);
    if (!focusable.length) return;
    if (e.shiftKey && document.activeElement === focusable[0]) { e.preventDefault(); focusable[focusable.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) { e.preventDefault(); focusable[0].focus(); }
  }
});

/* --------------------------------------------------------------------------
   8. Multi-step checkout
   -------------------------------------------------------------------------- */
let currentStep = 1;

function goToStep(n) {
  currentStep = n;
  $$('.modal__step').forEach((s, i) => s.classList.toggle('active', i + 1 === n));
  $$('.progress-step').forEach((ps, i) => {
    ps.classList.remove('active', 'completed');
    const dot = ps.querySelector('.progress-step__dot');
    if (i + 1 === n) { ps.classList.add('active'); ps.setAttribute('aria-current', 'step'); if (dot) dot.textContent = String(i + 1); }
    else if (i + 1 < n) { ps.classList.add('completed'); ps.removeAttribute('aria-current'); if (dot) dot.textContent = '✓'; }
    else { ps.removeAttribute('aria-current'); if (dot) dot.textContent = String(i + 1); }
  });
  const titles = { 1: 'Review Your Order', 2: 'Your Information', 3: 'Schedule Installation', 4: 'Order Confirmed' };
  const t = $('#modal-title'); if (t) t.textContent = titles[n] || 'Complete Your Order';
  if (modalBox) modalBox.scrollTop = 0;
}

$('#step1-next')?.addEventListener('click', () => goToStep(2));
$('#step2-back')?.addEventListener('click', () => goToStep(1));
$('#step3-back')?.addEventListener('click', () => goToStep(2));
$('#step2-next')?.addEventListener('click', () => { if (validateCustomerForm()) goToStep(3); });
$('#step3-next')?.addEventListener('click', () => {
  if (validateScheduleForm()) {
    const el = $('#order-number'); if (el) el.textContent = generateOrderNumber();
    goToStep(4);
  }
});

/* --------------------------------------------------------------------------
   9. Form Validation
   -------------------------------------------------------------------------- */
function setFieldError(fgId, hasError) {
  const g = document.getElementById(fgId); if (!g) return;
  g.classList.toggle('has-error', hasError);
  g.querySelector('.form-input, .form-select')?.classList.toggle('error', hasError);
}
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isPhone = v => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(v.replace(/\s/g,''));
const isZip   = v => /^\d{5}(-\d{4})?$/.test(v.trim());

function validateCustomerForm() {
  let valid = true;
  const checks = [
    { id: 'first-name', fg: 'fg-first',   test: v => v.trim().length >= 1 },
    { id: 'last-name',  fg: 'fg-last',    test: v => v.trim().length >= 1 },
    { id: 'email',      fg: 'fg-email',   test: v => isEmail(v) },
    { id: 'phone',      fg: 'fg-phone',   test: v => isPhone(v) },
    { id: 'address',    fg: 'fg-address', test: v => v.trim().length >= 3 },
    { id: 'city',       fg: 'fg-city',    test: v => v.trim().length >= 2 },
    { id: 'state',      fg: 'fg-state',   test: v => v !== '' },
    { id: 'zip',        fg: 'fg-zip',     test: v => isZip(v) },
  ];
  checks.forEach(({ id, fg, test }) => {
    const el = document.getElementById(id); if (!el) return;
    const err = !test(el.value); setFieldError(fg, err); if (err) valid = false;
  });
  if (!valid) $('#customer-form .has-error .form-input, #customer-form .has-error .form-select')?.focus();
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
    const el = document.getElementById(id); if (!el) return;
    const err = !test(el.value); setFieldError(fg, err); if (err) valid = false;
  });
  if (!valid) $('#schedule-form .has-error .form-select')?.focus();
  return valid;
}

// Live clear
['#first-name','#last-name','#email','#phone','#address','#city','#state','#zip','#hvac-count-confirm','#day-pref','#time-pref'].forEach(sel => {
  const el = $(sel); if (!el) return;
  const fg = el.closest('.form-group')?.id; if (!fg) return;
  el.addEventListener('input', () => { if (el.closest('.form-group')?.classList.contains('has-error')) setFieldError(fg, false); });
});

/* --------------------------------------------------------------------------
   10. Phone auto-format
   -------------------------------------------------------------------------- */
(function initPhoneFmt() {
  const ph = $('#phone'); if (!ph) return;
  ph.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g,'').slice(0,10);
    if (v.length >= 7)      v = `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
    else if (v.length >= 4) v = `(${v.slice(0,3)}) ${v.slice(3)}`;
    else if (v.length > 0)  v = `(${v}`;
    e.target.value = v;
  });
})();

/* --------------------------------------------------------------------------
   11. Hero stat card entrance
   -------------------------------------------------------------------------- */
(function initHeroCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.hero__stat-card').forEach((card, i) => {
    card.style.opacity = '0'; card.style.transform = 'translateY(14px)';
    card.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 850 + i * 200);
  });
})();

/* --------------------------------------------------------------------------
   12. Benefit card 3D tilt (desktop only)
   -------------------------------------------------------------------------- */
(function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;
  $$('.benefit-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `translateY(-5px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* --------------------------------------------------------------------------
   13. Animated counters — problem stats
   -------------------------------------------------------------------------- */
(function initProblemCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nums = $$('.problem__stat-num');
  if (!nums.length) return;
  const animate = el => {
    const t = el.textContent.trim();
    const m = t.match(/^(\d+)/);
    if (!m) return;
    const target = parseInt(m[1], 10), suffix = t.slice(m[0].length);
    const dur = 1200, start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } }), { threshold: 0.5 })
    .observe; // re-assign cleanly below
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nums.forEach(el => obs.observe(el));
})();

/* --------------------------------------------------------------------------
   14. Animated counters — proof stats
   -------------------------------------------------------------------------- */
(function initProofCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nums = $$('.proof__stat-number');
  if (!nums.length) return;
  const animate = el => {
    const raw = el.textContent.trim();
    const m = raw.match(/^([\d.]+)/); if (!m) return;
    const target = parseFloat(m[1]), suffix = raw.slice(m[0].length);
    const isFloat = m[1].includes('.');
    const dur = 1500, start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1), ease = 1 - Math.pow(1 - p, 3), cur = ease * target;
      el.textContent = (isFloat ? cur.toFixed(1) : Math.round(cur)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.4 });
  nums.forEach(el => obs.observe(el));
})();

/* --------------------------------------------------------------------------
   15. Proof bar chart — animate width on scroll into view
   -------------------------------------------------------------------------- */
(function initProofBar() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const afterBar = $('#proof-bar-after');
  if (!afterBar) return;
  afterBar.style.width = '0%';
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => { afterBar.style.width = '7%'; }, 300);
      obs.unobserve(afterBar);
    }
  }, { threshold: 0.5 });
  obs.observe(afterBar);
})();

/* --------------------------------------------------------------------------
   16. Purchase button micro-feedback
   -------------------------------------------------------------------------- */
(function initPurchaseFeedback() {
  const btn = $('#purchase-btn'); if (!btn) return;
  btn.addEventListener('click', () => {
    btn.textContent = 'Opening…'; btn.disabled = true;
    setTimeout(() => { btn.textContent = 'Purchase'; btn.disabled = false; }, 600);
  }, { capture: true });
})();

/* --------------------------------------------------------------------------
   17. Accessibility: skip link (injected)
   -------------------------------------------------------------------------- */
(function injectSkip() {
  const a = document.createElement('a');
  a.href = '#hero';
  a.textContent = 'Skip to main content';
  a.style.cssText = 'position:fixed;top:-9999px;left:16px;z-index:9999;background:#3d6b50;color:white;padding:8px 18px;border-radius:4px;font-size:14px;font-weight:600;transition:top .1s;text-decoration:none;';
  a.addEventListener('focus', () => { a.style.top = '8px'; });
  a.addEventListener('blur',  () => { a.style.top = '-9999px'; });
  document.body.prepend(a);
})();

/* --------------------------------------------------------------------------
   18. Font readiness flag
   -------------------------------------------------------------------------- */
document.fonts?.ready.then(() => document.documentElement.classList.add('fonts-loaded'));

console.log('%c🍁 Maple Air v2 %c— Swap placeholders, deploy, breathe.','color:#3d6b50;font-weight:700;font-size:14px;','color:#6b7280;font-size:12px;');
