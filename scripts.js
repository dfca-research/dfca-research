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

/* ── Leaflet Implementation ──────────────────────────────── */
function initLeaflet() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  const map = L.map('map').setView([32.5, 72.5], 6);

  // Esri World Imagery Tile Server
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }).addTo(map);

  fetchBoundaries(map);
  plotSites(map);
}

/**
 * Fetch and render GeoJSON administrative boundaries
 */
async function fetchBoundaries(map) {
  const geojsonUrl = 'https://raw.githubusercontent.com/mamoorkhan/pakistan-geojson/main/kpk-punjab.json';
  
  try {
    const response = await fetch(geojsonUrl);
    const data = await response.json();

    L.geoJSON(data, {
      style: function(feature) {
        const name = feature.properties.name;
        return {
          fillColor: name === 'Punjab' ? '#3B82F6' : '#10B981',
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.15
        };
      }
    }).addTo(map);
  } catch (err) {
    console.error('[DFCA] Error loading GeoJSON boundaries:', err);
  }
}

/**
 * Plot point markers for field operation sites
 */
function plotSites(map) {
  const sites = [
    { name: 'Peshawar HQ', coords: [34.0151, 71.5249], type: 'KPK' },
    { name: 'Swat Field Office', coords: [34.7700, 72.3600], type: 'KPK' },
    { name: 'Lahore Hub', coords: [31.5204, 74.3587], type: 'Punjab' },
    { name: 'Multan Office', coords: [30.1575, 71.4589], type: 'Punjab' },
    { name: 'Waziristan Station', coords: [32.3000, 70.1000], type: 'KPK' },
    { name: 'Bahawalpur Site', coords: [29.3956, 71.6833], type: 'Punjab' },
    { name: 'Gujranwala Field Office', coords: [32.1877, 74.1944], type: 'Punjab' }
  ];

  sites.forEach(site => {
    const markerColor = site.type === 'KPK' ? '#10B981' : '#3B82F6';
    
    // Create a custom circle marker
    L.circleMarker(site.coords, {
      radius: 6,
      fillColor: markerColor,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map)
      .bindPopup(`<strong>${site.name}</strong><br>Active Field Operations`);
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
    initLeaflet(); // Initialise Leaflet after sections are loaded
  });
});
