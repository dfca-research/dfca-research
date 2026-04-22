/* ═══════════════════════════════════════════════════════════════
   DFCA RESEARCH  —  Main Script
   Loads section HTML fragments, then initialises all interactive
   behaviour (scroll-reveal, counters, dot-nav, etc.)
═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { mount: 'mount-topbar',   src: 'sections/topbar.html' },
  { mount: 'mount-nav',      src: 'sections/nav.html' },
  { mount: 'mount-hero',     src: 'sections/hero.html' },
  { mount: 'mount-stats',    src: 'sections/stats.html' },
  { mount: 'mount-about',    src: 'sections/about.html' },
  { mount: 'mount-research', src: 'sections/research.html' },
  { mount: 'mount-featured', src: 'sections/featured.html' },
  { mount: 'mount-approach', src: 'sections/approach.html' },
  { mount: 'mount-contact',  src: 'sections/contact.html' },
  { mount: 'mount-footer',   src: 'sections/footer.html' }
];

/* ── Section loader ─────────────────────────────────────── */
async function loadSections() {
  await Promise.all(
    SECTIONS.map(async ({ mount, src }) => {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${src}`);
        const html = await res.text();
        const el = document.getElementById(mount);
        if (el) el.innerHTML = html;
      } catch (err) {
        console.error(`[DFCA] Could not load section "${src}":`, err.message);
      }
    })
  );
}

/* ── Scroll-reveal ──────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 70);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── Section entry lines ────────────────────────────────── */
function initSectionLines() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('line-in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.section-mark').forEach(el => obs.observe(el));
}

/* ── Animated counters ──────────────────────────────────── */
function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target   = +e.target.dataset.target;
        const duration = 1800;
        const start    = performance.now();
        const ease     = t => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
          const p   = Math.min((now - start) / duration, 1);
          const val = Math.round(ease(p) * target);
          e.target.textContent = val > 999 ? val.toLocaleString() : val;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.counter').forEach(el => obs.observe(el));
}

/* ── Nav shadow on scroll ───────────────────────────────── */
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ── Scroll dot nav + active nav links ─────────────────── */
function initDotNav() {
  const sectionIds = ['hero','about','research','featured','approach','contact'];
  const dots       = document.querySelectorAll('.dot-nav a');
  const navLinks   = document.querySelectorAll('.nav-links a');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        dots.forEach(d =>
          d.classList.toggle('active', d.getAttribute('href') === '#' + id)
        );
        navLinks.forEach(a =>
          a.classList.toggle('active', a.getAttribute('href') === '#' + id)
        );
      }
    });
  }, { threshold: 0.4 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
}

/* ── Bootstrap ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadSections().then(() => {
    initReveal();
    initSectionLines();
    initCounters();
    initNavScroll();
    initDotNav();
  });
});
