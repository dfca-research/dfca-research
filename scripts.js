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
  const mNavItems  = document.querySelectorAll('.m-nav-item');

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
        mNavItems.forEach(m =>
          m.classList.toggle('active', m.getAttribute('href') === '#' + id)
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

/* ── Scroll-driven background shift (light blue family) ─── */
function initScrollColorTransition() {
  const root = document.documentElement;
  let rafId  = null;
  const interp = (a, b, t) => Math.round(a + (b - a) * t);
  const c0 = [238, 244, 250]; // --cream baseline  (#EEF4FA light blue tint)
  const c1 = [230, 238, 247]; // slightly deeper blue at end of page (#E6EEF7)

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

  /* ── Depth defs: gradients, bevel lighting, vignette ──────
     Light source is upper-left (azimuth 225°) to agree with the
     hero's existing radial gradient. */
  const EXTRUDE_LAYERS = 6;   // stacked clones that form the slab edge
  const EXTRUDE_STEP   = 1;   // px between clones, counter-scaled on zoom

  const defs = svg.append("defs");

  function linearGrad(id, stops) {
    const g = defs.append("linearGradient")
      .attr("id", id)
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    stops.forEach(s => g.append("stop")
      .attr("offset", s[0]).attr("stop-color", s[1]).attr("stop-opacity", s[2]));
    return g;
  }

  // Province surface gradients — light top-left → saturated bottom-right
  linearGrad("grad-kpk", [
    ["0%",   "#F0DFA8", 0.95],
    ["45%",  "#D8B863", 0.80],
    ["100%", "#A8853A", 0.72]
  ]);
  linearGrad("grad-punjab", [
    ["0%",   "#BFD9F7", 0.95],
    ["45%",  "#7FB0E8", 0.80],
    ["100%", "#2F6FBF", 0.72]
  ]);

  // Pin gradients — lit face / shaded side
  linearGrad("grad-pin-kpk",    [["0%", "#F2DFA4", 1], ["55%", "#C9A84C", 1], ["100%", "#8A6C24", 1]]);
  linearGrad("grad-pin-punjab", [["0%", "#A9CCF5", 1], ["55%", "#3B82F6", 1], ["100%", "#1D4E9B", 1]]);

  // Bevel relief: blur the alpha, light it, mask it back, add over the fill
  const bevel = defs.append("filter")
    .attr("id", "map-bevel")
    .attr("x", "-25%").attr("y", "-25%")
    .attr("width", "150%").attr("height", "150%");

  bevel.append("feGaussianBlur")
    .attr("in", "SourceAlpha").attr("stdDeviation", 2.5).attr("result", "blur");

  const lighting = bevel.append("feDiffuseLighting")
    .attr("in", "blur")
    .attr("surfaceScale", 5)
    .attr("diffuseConstant", 1.05)
    .attr("lighting-color", "#ffffff")
    .attr("result", "light");
  lighting.append("feDistantLight").attr("azimuth", 225).attr("elevation", 55);

  bevel.append("feComposite")
    .attr("in", "light").attr("in2", "SourceAlpha")
    .attr("operator", "in").attr("result", "litShape");

  bevel.append("feComposite")
    .attr("in", "litShape").attr("in2", "SourceGraphic")
    .attr("operator", "arithmetic")
    .attr("k1", 1).attr("k2", 0).attr("k3", 1).attr("k4", -0.35);

  // Canvas vignette — seats the map plate in a recess
  const vig = defs.append("radialGradient").attr("id", "map-vignette");
  vig.append("stop").attr("offset", "55%").attr("stop-color", "#0D1B2A").attr("stop-opacity", 0);
  vig.append("stop").attr("offset", "100%").attr("stop-color", "#0D1B2A").attr("stop-opacity", 0.13);

  svg.append("rect")
    .attr("class", "map-vignette")
    .attr("width", width).attr("height", height)
    .attr("fill", "url(#map-vignette)")
    .style("pointer-events", "none");

  // Single transformed root so provinces and pins zoom/pan together.
  // Draw order: extruded slab → province surfaces → pin shadows → pins.
  const root       = svg.append("g").attr("class", "map-root");
  const extrudeG   = root.append("g").attr("class", "extrude").style("pointer-events", "none");
  const provinceG  = root.append("g").attr("class", "provinces");

  // Shared zoom state — pins, strokes and slab depth counter-scale so
  // they hold a constant on-screen size as the user zooms in.
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", (event) => {
      const k = event.transform.k;
      root.attr("transform", event.transform);
      provinceG.selectAll("path").attr("stroke-width", d =>
        (d === focusedFeature ? 2.5 : 1.5) / k
      );
      root.selectAll(".pin").attr("transform", pinTransform(k));
      root.selectAll(".pin-shadow").attr("transform", shadowTransform(k));
      extrudeG.selectAll("path").attr("transform", d =>
        `translate(0, ${(d.__layer * EXTRUDE_STEP) / k})`
      );
    });

  svg.call(zoom);

  let focusedFeature = null;

  /* Pin geometry: the 24×24 pin path has its tip at (12,22) in local
     units, so this places the tip exactly on the projected coordinate. */
  const pinTransform = (k) => (d) => {
    const s = 0.5 / k;
    const p = projection(d.coords);
    return `translate(${p[0] - 12 * s}, ${p[1] - 22 * s}) scale(${s})`;
  };

  /* Ground shadow sits at the pin tip and squashes flat */
  const shadowTransform = (k) => (d) => {
    const s = 1 / k;
    const p = projection(d.coords);
    return `translate(${p[0]}, ${p[1]}) scale(${s})`;
  };

  /* ── Tooltip ──────────────────────────────────────────── */
  const canvas  = document.querySelector('.map-canvas');
  const tipEl   = document.getElementById('map-tooltip');

  function showTip(html, event) {
    if (!tipEl || !canvas) return;
    const r = canvas.getBoundingClientRect();
    tipEl.innerHTML = html;
    tipEl.classList.add('visible');
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    // Flip to the left near the right edge so the card never overflows
    tipEl.style.left = (x > r.width - 150 ? x - 14 : x + 14) + 'px';
    tipEl.style.top  = (y - 12) + 'px';
    tipEl.style.transform = x > r.width - 150 ? 'translate(-100%, -100%)' : 'translateY(-100%)';
  }
  function hideTip() { if (tipEl) tipEl.classList.remove('visible'); }

  /* ── Detail panel ─────────────────────────────────────── */
  const detailEl = document.getElementById('map-detail');
  function showDetail(eyebrow, name, meta) {
    if (!detailEl) return;
    detailEl.querySelector('.map-detail-eyebrow').textContent = eyebrow;
    detailEl.querySelector('.map-detail-name').textContent    = name;
    detailEl.querySelector('.map-detail-meta').textContent    = meta;
    detailEl.classList.add('visible');
  }
  function hideDetail() { if (detailEl) detailEl.classList.remove('visible'); }

  /* ── Camera helpers ───────────────────────────────────── */
  function zoomToBounds(bounds, maxK) {
    const [[x0, y0], [x1, y1]] = bounds;
    const k = Math.min(maxK, 0.85 / Math.max((x1 - x0) / width, (y1 - y0) / height));
    const t = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(k)
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    svg.transition().duration(750).ease(d3.easeCubicInOut).call(zoom.transform, t);
  }

  function zoomToPoint(coords, k) {
    const p = projection(coords);
    const t = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(k)
      .translate(-p[0], -p[1]);
    svg.transition().duration(750).ease(d3.easeCubicInOut).call(zoom.transform, t);
  }

  function resetView() {
    focusedFeature = null;
    provinceG.selectAll("path").classed('focused', false);
    hideDetail();
    svg.transition().duration(600).ease(d3.easeCubicInOut)
       .call(zoom.transform, d3.zoomIdentity);
  }

  // Clicking empty map background clears the focus
  svg.on("click", (event) => { if (event.target === svg.node()) resetView(); });

  // Zoom / reset buttons
  document.querySelectorAll('.map-zoom-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.zoom;
      if (mode === 'reset') return resetView();
      svg.transition().duration(300)
         .call(zoom.scaleBy, mode === 'in' ? 1.6 : 1 / 1.6);
    });
  });

  detailEl?.querySelector('.map-detail-close')
    ?.addEventListener('click', resetView);

  // Local GeoJSON — filtered to KPK (N.W.F.P.) + Punjab, no external dependency
  d3.json('data/pakistan-kpk-punjab.geojson').then(data => {
    const isPunjab = d => d.properties.NAME_1 === 'Punjab';
    const fillOf   = d => isPunjab(d) ? 'url(#grad-punjab)' : 'url(#grad-kpk)';

    /* ── Extruded slab ────────────────────────────────────
       Six stacked clones per province, 1px apart and darkening
       with depth, so the landmass reads as a raised solid rather
       than a flat shape with a single offset ghost. */
    const slab = [];
    for (let layer = EXTRUDE_LAYERS; layer >= 1; layer--) {
      data.features.forEach(f => {
        slab.push({ feature: f, __layer: layer });
      });
    }

    extrudeG.selectAll("path")
      .data(slab)
      .enter()
      .append("path")
      .attr("d", d => path(d.feature))
      .attr("data-province", d => isPunjab(d.feature) ? 'Punjab' : 'KPK')
      .attr("transform", d => `translate(0, ${d.__layer * EXTRUDE_STEP})`)
      .attr("fill", d => {
        // Deepest layer darkest; top layer nearly meets the surface
        const t = d.__layer / EXTRUDE_LAYERS;
        return isPunjab(d.feature)
          ? `rgba(21, 52, 99, ${0.20 + 0.42 * t})`
          : `rgba(72, 55, 18, ${0.20 + 0.42 * t})`;
      })
      .attr("stroke", "none");

    const paths = provinceG
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", d => isPunjab(d) ? 'province-punjab' : 'province-kpk')
      .attr("data-province", d => isPunjab(d) ? 'Punjab' : 'KPK')
      .attr("fill", d => fillOf(d))
      .style("fill-opacity", 0)
      .attr("stroke", d => isPunjab(d) ? '#3B82F6' : '#C9A84C')
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("mousemove", function (event, d) {
        const prov  = isPunjab(d) ? 'Punjab' : 'Khyber Pakhtunkhwa';
        const count = isPunjab(d) ? 11 : 23;
        showTip(
          `<span class="tip-eyebrow">Province</span>` +
          `<span class="tip-name">${prov}</span>` +
          `<span class="tip-meta">${count} districts administered</span>`,
          event
        );
        d3.select(this).style("fill-opacity", 0.55);
      })
      .on("mouseout", function () {
        hideTip();
        d3.select(this).style("fill-opacity", 1);
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        focusedFeature = d;
        provinceG.selectAll("path").classed('focused', p => p === d);
        const prov  = isPunjab(d) ? 'Punjab' : 'Khyber Pakhtunkhwa';
        const count = isPunjab(d) ? 11 : 23;
        showDetail('Province', prov, `${count} districts administered · field operations active`);
        zoomToBounds(path.bounds(d), 6);
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
          sel.transition().duration(500).style("fill-opacity", 1)
            .on("end", () => sel.style("transition", "fill-opacity 0.3s ease"));
        });
    });

    // Relief is applied to the group, not per path, so the lighting
    // filter costs one raster pass instead of one per province.
    provinceG.attr("filter", "url(#map-bevel)");

    // Slab rises once the outlines have finished drawing
    extrudeG.style("opacity", 0)
      .transition().delay(1150).duration(700).ease(d3.easeCubicOut)
      .style("opacity", 1);

    renderD3Markers(root, projection, pinTransform, shadowTransform, {
      showTip, hideTip, showDetail, zoomToPoint,
      clearFocus: () => {
        focusedFeature = null;
        provinceG.selectAll("path").classed('focused', false);
      }
    });

    initMapFilters(root, provinceG);
  }).catch(err => {
    console.error("[DFCA] D3 GeoJSON Error:", err);
  });
}

/* ── Province filter toggles ────────────────────────────── */
function initMapFilters(root, provinceG) {
  const buttons = document.querySelectorAll('.map-filter');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      buttons.forEach(b => b.classList.toggle('active', b === btn));

      root.selectAll('.pin')
        .transition().duration(400)
        .style('opacity', d => (f === 'all' || d.type === f) ? 1 : 0.08);

      root.selectAll('.pin-shadow')
        .transition().duration(400)
        .style('opacity', d => (f === 'all' || d.type === f) ? 0.22 : 0.02);

      // The extruded slab dims with its province
      root.selectAll('.extrude path')
        .transition().duration(400)
        .style('opacity', function () {
          return (f === 'all' || this.getAttribute('data-province') === f) ? 1 : 0.12;
        });

      provinceG.selectAll('path')
        .transition().duration(400)
        .style('fill-opacity', function () {
          return (f === 'all' || this.getAttribute('data-province') === f) ? 1 : 0.15;
        })
        .style('stroke-opacity', function () {
          return (f === 'all' || this.getAttribute('data-province') === f) ? 1 : 0.25;
        });
    });
  });
}

/* ── D3 Markers ─────────────────────────────────────────── */
function renderD3Markers(root, projection, pinTransform, shadowTransform, ui) {
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

  // Ground shadows sit beneath the pins so each marker appears lifted
  const shadowG = root.append("g")
    .attr("class", "pin-shadows")
    .style("pointer-events", "none");

  shadowG.selectAll(".pin-shadow")
    .data(sites)
    .enter()
    .append("ellipse")
    .attr("class", "pin-shadow")
    .attr("rx", 3.2)
    .attr("ry", 1.1)
    .attr("fill", "#0D1B2A")
    .style("opacity", 0)
    .attr("transform", shadowTransform(1));

  const g = root.append("g").attr("class", "markers");

  // Material Design Pin Path
  const pinPath = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

  const markers = g.selectAll(".pin")
    .data(sites)
    .enter()
    .append("path")
    .attr("class", "pin")
    .attr("d", pinPath)
    .attr("fill", d => d.type === 'KPK' ? 'url(#grad-pin-kpk)' : 'url(#grad-pin-punjab)')
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .style("opacity", 0)
    .attr("transform", pinTransform(1))
    .on("mousemove", function (event, d) {
      event.stopPropagation();
      ui.showTip(
        `<span class="tip-eyebrow">Field Site</span>` +
        `<span class="tip-name">${d.name}</span>` +
        `<span class="tip-meta">${d.type === 'KPK' ? 'Khyber Pakhtunkhwa' : 'Punjab'} · active site</span>`,
        event
      );
      d3.select(this).classed('pin-hover', true);
    })
    .on("mouseout", function () {
      ui.hideTip();
      d3.select(this).classed('pin-hover', false);
    })
    .on("click", function (event, d) {
      event.stopPropagation();
      ui.clearFocus();
      ui.showDetail(
        'Field Site',
        `${d.name} District`,
        `${d.type === 'KPK' ? 'Khyber Pakhtunkhwa' : 'Punjab'} · administered under active deployment`
      );
      ui.zoomToPoint(d.coords, 5);
    });

  // Staggered fade-in and drop-down animation, shadow following the pin
  const shadows = shadowG.selectAll(".pin-shadow");

  markers.each(function(d, i) {
    d3.select(this).transition()
      .delay(1200 + i * 40)
      .duration(600)
      .ease(d3.easeBackOut.overshoot(1.5))
      .style("opacity", 1)
      .attr("transform", pinTransform(1)(d));
  });

  shadows.each(function(d, i) {
    d3.select(this).transition()
      .delay(1200 + i * 40)
      .duration(600)
      .style("opacity", 0.22);
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
