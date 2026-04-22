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

/* ── Mapbox Implementation ──────────────────────────────── */
function initMapbox() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  // REPLACE WITH YOUR ACTUAL MAPBOX ACCESS TOKEN
  mapboxgl.accessToken = 'pk.eyJ1IjoibWFtb29ya2hhbiIsImEiOiJjbHlkM2M4Ym8wYmZ4MmxwdzR6Ym56Ym56In0.placeholder'; 

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-v9', // Satellite base map
    center: [72.5, 32.5], // Centered on Northern/Central Pakistan
    zoom: 5.2,
    pitch: 45, // 3D perspective
    bearing: -10,
    antialias: true
  });

  map.on('load', () => {
    fetchAdministrativeBoundaries(map);
    plotFieldOperationSites(map);
  });
}

/**
 * Fetch and render GeoJSON administrative boundaries for KPK and Punjab.
 */
function fetchAdministrativeBoundaries(map) {
  // We use a public source for Pakistan administrative boundaries (simplified for performance)
  const geojsonUrl = 'https://raw.githubusercontent.com/mamoorkhan/pakistan-geojson/main/kpk-punjab.json';

  map.addSource('admin-boundaries', {
    type: 'geojson',
    data: geojsonUrl
  });

  // Layer for Punjab
  map.addLayer({
    'id': 'punjab-layer',
    'type': 'fill',
    'source': 'admin-boundaries',
    'filter': ['==', ['get', 'name'], 'Punjab'],
    'paint': {
      'fill-color': '#3B82F6',
      'fill-opacity': 0.15,
      'fill-outline-color': '#3B82F6'
    }
  });

  // Layer for KPK
  map.addLayer({
    'id': 'kpk-layer',
    'type': 'fill',
    'source': 'admin-boundaries',
    'filter': ['==', ['get', 'name'], 'Khyber Pakhtunkhwa'],
    'paint': {
      'fill-color': '#10B981',
      'fill-opacity': 0.15,
      'fill-outline-color': '#10B981'
    }
  });
}

/**
 * Plot point markers for field operation sites.
 */
function plotFieldOperationSites(map) {
  const sites = [
    { name: 'Peshawar HQ', coords: [71.5249, 34.0151], type: 'KPK' },
    { name: 'Swat Field Office', coords: [72.3600, 34.7700], type: 'KPK' },
    { name: 'Lahore Hub', coords: [74.3587, 31.5204], type: 'Punjab' },
    { name: 'Multan Office', coords: [71.4589, 30.1575], type: 'Punjab' },
    { name: 'Waziristan Station', coords: [70.1000, 32.3000], type: 'KPK' },
    { name: 'Bahawalpur Site', coords: [71.6833, 29.3956], type: 'Punjab' },
    { name: 'Gujranwala Field Office', coords: [74.1944, 32.1877], type: 'Punjab' }
  ];

  sites.forEach(site => {
    // Create a custom marker element
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.width = '12px';
    el.style.height = '12px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = site.type === 'KPK' ? '#10B981' : '#3B82F6';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

    new mapboxgl.Marker(el)
      .setLngLat(site.coords)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${site.name}</h3><p>Active Field Operations</p>`))
      .addTo(map);
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
    initMapbox(); // Initialise Mapbox after sections are loaded
  });
});
