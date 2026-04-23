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
  { mount: 'mount-featured',  src: 'sections/featured.html' },
  { mount: 'mount-rct',      src: 'sections/rct-slideshow.html' },
  { mount: 'mount-approach', src: 'sections/approach.html' },
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
  const sectionIds = ['hero','about','research','featured','rct','approach'];
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

/* ── Hero parallax depth ────────────────────────────────── */
function initParallax() {
  const hero       = document.getElementById('hero');
  const heroText   = document.querySelector('.hero-text');
  const heroVisual = document.querySelector('.hero-visual');
  if (!hero || !heroText || !heroVisual) return;

  window.addEventListener('scroll', () => {
    if (window.innerWidth < 1100) return;
    const y = window.scrollY;
    if (y > hero.offsetTop + hero.offsetHeight) return;
    heroText.style.transform   = `translateY(${y * 0.10}px)`;
    heroVisual.style.transform = `translateY(${y * -0.06}px)`;
  }, { passive: true });
}

/* ── Scroll-driven cream background shift ───────────────── */
function initScrollColorTransition() {
  const root = document.documentElement;
  let rafId  = null;
  const interp = (a, b, t) => Math.round(a + (b - a) * t);
  const c0 = [247, 243, 236]; // --cream baseline
  const c1 = [242, 236, 225]; // warmer/deeper end-of-page cream

  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const raw = Math.min(window.scrollY / max, 1);
      const t   = (1 - Math.cos(raw * Math.PI)) / 2; // smooth ease-in-out
      root.style.setProperty('--cream',
        `rgb(${interp(c0[0],c1[0],t)},${interp(c0[1],c1[1],t)},${interp(c0[2],c1[2],t)})`
      );
    });
  }, { passive: true });
}

/* ── Magnetic CTA buttons ───────────────────────────────── */
function initMagneticButtons() {
  document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transition =
        'background 0.3s var(--ease), color 0.3s var(--ease), ' +
        'box-shadow 0.3s var(--ease), border-color 0.3s var(--ease)';
    });

    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 8 - 3;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'all 0.5s var(--ease)';
      btn.style.transform  = '';
    });
  });
}

/* ── D3.js Map Implementation ───────────────────────────── */
function initD3Map() {
  const svg = d3.select("#d3-map");
  if (svg.empty()) return;

  const width  = 400;
  const height = 500;

  // Projection centred on the combined KPK + Punjab extent
  const projection = d3.geoMercator()
    .center([72.3, 32.3])
    .scale(2300)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // Local GeoJSON — filtered to KPK (N.W.F.P.) + Punjab, no external dependency
  d3.json('data/pakistan-kpk-punjab.geojson').then(data => {
    const isPunjab = d => d.properties.NAME_1 === 'Punjab';

    const paths = svg.append("g")
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", d => isPunjab(d) ? 'province-punjab' : 'province-kpk')
      .attr("fill", "transparent")
      .attr("stroke", d => isPunjab(d) ? '#3B82F6' : '#10B981')
      .attr("stroke-width", 1.5)
      .on("mouseover", function() {
        d3.select(this).style("fill-opacity", 0.3).attr("stroke-width", 2.5);
      })
      .on("mouseout", function() {
        d3.select(this).style("fill-opacity", 1).attr("stroke-width", 1.5);
      });

    // Province-by-province stroke draw-on, then fill fade-in
    paths.each(function(d, i) {
      const node = this;
      const len  = node.getTotalLength();
      const sel  = d3.select(node);

      sel.attr("stroke-dasharray", len).attr("stroke-dashoffset", len);

      sel.transition()
        .delay(i * 280)
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          const fill = isPunjab(d)
            ? 'rgba(59, 130, 246, 0.12)'
            : 'rgba(16, 185, 129, 0.14)';
          sel.transition().duration(500).style("fill", fill)
            .on("end", () => sel.style("transition", "all 0.3s ease"));
        });
    });

    renderD3Markers(svg, projection);
  }).catch(err => {
    console.error("[DFCA] D3 GeoJSON Error:", err);
  });
}

/* ── D3 Markers ─────────────────────────────────────────── */
function renderD3Markers(svg, projection) {
  const sites = [
    // KPK Districts (23)
    { name: 'Peshawar',     coords: [71.5249, 34.0151], type: 'KPK' },
    { name: 'Swat',         coords: [72.3600, 34.7700], type: 'KPK' },
    { name: 'Mardan',       coords: [72.0231, 34.1989], type: 'KPK' },
    { name: 'Charsadda',    coords: [71.7342, 34.1458], type: 'KPK' },
    { name: 'Nowshera',     coords: [71.9715, 34.0105], type: 'KPK' },
    { name: 'Abbottabad',   coords: [73.2215, 34.1688], type: 'KPK' },
    { name: 'Mansehra',     coords: [73.2042, 34.3308], type: 'KPK' },
    { name: 'Haripur',      coords: [72.9361, 33.9946], type: 'KPK' },
    { name: 'Kohat',        coords: [71.4414, 33.5869], type: 'KPK' },
    { name: 'Bannu',        coords: [70.6010, 32.9854], type: 'KPK' },
    { name: 'D.I. Khan',    coords: [70.9019, 31.8315], type: 'KPK' },
    { name: 'Tank',         coords: [70.3833, 32.2167], type: 'KPK' },
    { name: 'Lakki Marwat', coords: [70.9114, 32.6079], type: 'KPK' },
    { name: 'Karak',        coords: [71.0914, 33.1107], type: 'KPK' },
    { name: 'Hangu',        coords: [71.0572, 33.5351], type: 'KPK' },
    { name: 'Buner',        coords: [72.4800, 34.4300], type: 'KPK' },
    { name: 'Shangla',      coords: [72.7500, 34.8800], type: 'KPK' },
    { name: 'Upper Dir',    coords: [71.8500, 35.2000], type: 'KPK' },
    { name: 'Lower Dir',    coords: [71.8400, 34.8400], type: 'KPK' },
    { name: 'Chitral',      coords: [71.7800, 35.8500], type: 'KPK' },
    { name: 'Bajaur',       coords: [71.5000, 34.8000], type: 'KPK' },
    { name: 'Khyber',       coords: [71.1000, 33.9000], type: 'KPK' },
    { name: 'Mohmand',      coords: [71.3000, 34.3000], type: 'KPK' },

    // Punjab Districts (11)
    { name: 'Lahore',       coords: [74.3587, 31.5204], type: 'Punjab' },
    { name: 'Multan',       coords: [71.4589, 30.1575], type: 'Punjab' },
    { name: 'Bahawalpur',   coords: [71.6833, 29.3956], type: 'Punjab' },
    { name: 'Gujranwala',   coords: [74.1944, 32.1877], type: 'Punjab' },
    { name: 'Faisalabad',   coords: [73.0833, 31.4504], type: 'Punjab' },
    { name: 'Rawalpindi',   coords: [73.0479, 33.5984], type: 'Punjab' },
    { name: 'Sargodha',     coords: [72.6711, 32.0836], type: 'Punjab' },
    { name: 'Sialkot',      coords: [74.5229, 32.4945], type: 'Punjab' },
    { name: 'Sheikhupura',  coords: [73.9783, 31.7130], type: 'Punjab' },
    { name: 'Jhang',        coords: [72.3289, 31.2781], type: 'Punjab' },
    { name: 'D.G. Khan',    coords: [70.6355, 30.0489], type: 'Punjab' }
  ];

  const g = svg.append("g").attr("class", "markers");

  // Material Design Pin Path
  const pinPath = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

  const markers = g.selectAll(".pin")
    .data(sites)
    .enter()
    .append("path")
    .attr("class", "pin")
    .attr("d", pinPath)
    .attr("fill", d => d.type === 'KPK' ? '#C9A84C' : '#3B82F6')
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .style("opacity", 0)
    .attr("transform", d => {
      const p = projection(d.coords);
      return `translate(${p[0] - 6}, ${p[1] - 11}) scale(0.5)`;
    });

  markers.append("title").text(d => `${d.name} District (Active Site)`);

  // Staggered fade-in and drop-down animation
  markers.each(function(d, i) {
    const sel = d3.select(this);
    const p = projection(d.coords);
    
    sel.transition()
      .delay(1200 + i * 40)
      .duration(600)
      .ease(d3.easeBackOut.overshoot(1.5))
      .style("opacity", 1)
      .attr("transform", `translate(${p[0] - 6}, ${p[1] - 11}) scale(0.5)`);
  });
}

/* ── RCT stat counter (reused on every slide transition) ── */
function animateRCTStat(el) {
  const original = el.dataset.statOriginal || el.textContent.trim();
  el.dataset.statOriginal = original;

  const clean    = original.replace(/,/g, '');
  const numMatch = clean.match(/^([+\-−]?)(\d+(?:\.\d+)?)(.*)/);
  if (!numMatch) return;

  const sign    = numMatch[1];
  const target  = parseFloat(numMatch[2]);
  const suffix  = numMatch[3];
  const isFloat = numMatch[2].includes('.');

  const duration = 700;
  const start    = performance.now();
  const ease     = t => 1 - Math.pow(1 - t, 3);

  const fmt = v => {
    if (isFloat) return v.toFixed(1);
    const n = Math.round(v);
    return n > 999 ? n.toLocaleString() : String(n);
  };

  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = sign + fmt(ease(p) * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = original; // land on exact original string
  };

  requestAnimationFrame(tick);
}

/* ── RCT Slideshow ──────────────────────────────────────── */
function initRCTSlideshow() {
  const slides = document.querySelectorAll('.rct-slide');
  const dots   = document.querySelectorAll('.rct-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');

    const statEl = slides[current].querySelector('.rct-stat-num');
    if (statEl) animateRCTStat(statEl);
  }

  function startAuto() { timer = setInterval(() => goTo(current + 1), 6000); }
  function resetAuto()  { clearInterval(timer); startAuto(); }

  document.querySelector('.rct-next')?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  document.querySelector('.rct-prev')?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  dots.forEach(dot => dot.addEventListener('click', () => { goTo(+dot.dataset.index); resetAuto(); }));

  // Animate first stat when section scrolls into view
  const rctSection = document.getElementById('rct');
  if (rctSection) {
    const introObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const firstStat = slides[0].querySelector('.rct-stat-num');
        if (firstStat) animateRCTStat(firstStat);
        introObs.disconnect();
      }
    }, { threshold: 0.3 });
    introObs.observe(rctSection);
  }

  startAuto();
}

/* ── Development Disclaimer ───────────────────────────── */
function initDisclaimer() {
  const modal    = document.getElementById('dev-disclaimer');
  const closeBtn = document.getElementById('close-disclaimer');
  if (!modal || !closeBtn) return;

  setTimeout(() => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }, 1000);

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  });
}

/* ── Project List Toggles ───────────────────────────── */
function initProjectToggles() {
  document.querySelectorAll('.r-card-footer').forEach(footer => {
    footer.addEventListener('click', (e) => {
      const card = footer.closest('.r-card');
      const list = card.querySelector('.r-projects-list');
      if (list) {
        list.classList.toggle('active');
        footer.classList.toggle('active');
      }
    });
  });
}

/* ── Mobile Menu Toggle ─────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const nav    = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.classList.toggle('active');
    nav.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      nav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && !nav.contains(e.target) && !toggle.contains(e.target)) {
      toggle.classList.remove('active');
      nav.classList.remove('active');
      document.body.style.overflow = '';
    }
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
    initMobileMenu();
    initParallax();
    initScrollColorTransition();
    initMagneticButtons();
    initD3Map();
    initRCTSlideshow();
    initDisclaimer();
    initProjectToggles();
  });
});
