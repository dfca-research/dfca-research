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

/* ── D3.js Map Implementation ───────────────────────────── */
function initD3Map() {
  const svg = d3.select("#d3-map");
  if (svg.empty()) return;

  const width  = 400;
  const height = 500;

  // 1. Define Projection (Centered on KPK/Punjab area)
  const projection = d3.geoMercator()
    .center([72.5, 32.5])
    .scale(2200)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // 2. Load and Render GeoJSON
  const geojsonUrl = 'https://raw.githubusercontent.com/mamoorkhan/pakistan-geojson/main/kpk-punjab.json';

  d3.json(geojsonUrl).then(data => {
    // Render Provinces
    svg.append("g")
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", d => d.properties.name === 'Punjab' ? 'province-punjab' : 'province-kpk')
      .attr("fill", d => d.properties.name === 'Punjab' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.14)')
      .attr("stroke", d => d.properties.name === 'Punjab' ? '#3B82F6' : '#10B981')
      .attr("stroke-width", 1.5)
      .style("transition", "all 0.3s ease")
      .on("mouseover", function() {
        d3.select(this).style("fill-opacity", 0.3).attr("stroke-width", 2.5);
      })
      .on("mouseout", function() {
        d3.select(this).style("fill-opacity", 1).attr("stroke-width", 1.5);
      });

    // 3. Plot Field Operation Sites
    renderD3Markers(svg, projection);
  }).catch(err => {
    console.error("[DFCA] D3 GeoJSON Error:", err);
  });
}

/**
 * Plot point markers using D3
 */
function renderD3Markers(svg, projection) {
  const sites = [
    { name: 'Peshawar HQ', coords: [71.5249, 34.0151], type: 'KPK' },
    { name: 'Swat Field Office', coords: [72.3600, 34.7700], type: 'KPK' },
    { name: 'Lahore Hub', coords: [74.3587, 31.5204], type: 'Punjab' },
    { name: 'Multan Office', coords: [71.4589, 30.1575], type: 'Punjab' },
    { name: 'Waziristan Station', coords: [70.1000, 32.3000], type: 'KPK' },
    { name: 'Bahawalpur Site', coords: [71.6833, 29.3956], type: 'Punjab' },
    { name: 'Gujranwala Field Office', coords: [74.1944, 32.1877], type: 'Punjab' }
  ];

  const markers = svg.append("g").attr("class", "markers");

  markers.selectAll("circle")
    .data(sites)
    .enter()
    .append("circle")
    .attr("cx", d => projection(d.coords)[0])
    .attr("cy", d => projection(d.coords)[1])
    .attr("r", 5)
    .attr("fill", d => d.type === 'KPK' ? '#10B981' : '#3B82F6')
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .style("cursor", "pointer")
    .append("title")
    .text(d => `${d.name} (Active Site)`);
}

/* ── Bootstrap ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadSections().then(() => {
    initReveal();
    initSectionLines();
    initCounters();
    initNavScroll();
    initDotNav();
    initD3Map(); // Initialise D3 map after sections are loaded
  });
});
