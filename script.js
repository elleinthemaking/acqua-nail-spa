// Acqua Nail Spa
// 1. Loads the content files from /content (edited at /admin).
// 2. Fills the page with that content.
// 3. Wires up the tabs, animations, mobile menu and reviews strip.
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sup = (code) => {
    // "R3" -> R<sup>3</sup>
    const m = String(code || '').match(/^([A-Za-z]+)(\d)$/);
    return m ? `${esc(m[1])}<sup>${esc(m[2])}</sup>` : esc(code);
  };
  const ARROW = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 9l6-6M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const FILES = ['general', 'packages', 'menu', 'gallery', 'reviews', 'policies'];

  // ---------- load content (fetched from /content, or read from an inline copy) ----------
  async function loadContent() {
    const inline = $('#site-data');
    if (inline) {
      try { return JSON.parse(inline.textContent); } catch (e) { /* fall through */ }
    }
    const out = {};
    await Promise.all(FILES.map(async (name) => {
      const res = await fetch(`content/${name}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Could not load content/${name}.json`);
      out[name] = await res.json();
    }));
    return out;
  }

  // ---------- helpers ----------
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

  function fillText(root, data) {
    $$('[data-text]', root).forEach((el) => {
      const v = get(data, el.dataset.text);
      if (v !== undefined && v !== null) el.textContent = v;
    });
  }

  // ---------- section renderers ----------
  function renderPillars(items) {
    return items.map((p, i) => `
      <div class="pillar reveal" style="--d:${i * 0.1}s">
        <span class="pillar__index">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
      </div>`).join('');
  }

  function renderGallery(photos) {
    return photos.map((p, i) => `
      <figure class="work__item reveal" style="--d:${i * 0.08}s">
        <img src="${esc(p.image)}" alt="${esc(p.caption)}" loading="lazy" />
        <figcaption>${esc(p.caption)}</figcaption>
      </figure>`).join('');
  }

  // A tier "includes" a service when its checkbox (r0..r3) is ticked.
  const included = (service, tier) => !!service[String(tier.code || '').toLowerCase()];

  function renderTiers(group, badge, bookUrl) {
    const tiers = group.tiers || [];
    const services = group.services || [];
    return tiers.map((tier, i) => {
      const prev = tiers[i - 1];
      const lines = [];
      if (prev) lines.push(`Everything in ${sup(prev.code)}`);
      services.forEach((s) => {
        if (included(s, tier) && !(prev && included(s, prev))) lines.push(esc(s.name));
      });
      return `
      <article class="tier${tier.featured ? ' tier--featured' : ''} reveal" style="--d:${i * 0.08}s">
        ${tier.featured ? `<span class="tier__badge">${esc(badge)}</span>` : ''}
        <header class="tier__head">
          <span class="tier__code">${sup(tier.code)}</span>
          <h3>${esc(tier.name)}</h3>
        </header>
        <div class="tier__price"><span class="cur">$</span>${esc(tier.price)}</div>
        <ul class="tier__list">${lines.map((l) => `<li><i></i>${l}</li>`).join('')}</ul>
        <a class="tier__cta" href="${esc(bookUrl)}" target="_blank" rel="noopener">Book ${sup(tier.code)}</a>
      </article>`;
    }).join('');
  }

  function renderCompare(group, title) {
    const tiers = [...(group.tiers || [])].reverse(); // highest first, like the printed menu
    const services = group.services || [];
    return `
      <table class="compare__table">
        <caption>${esc(title)}</caption>
        <thead><tr><th scope="col">Service <small>(a la carte value)</small></th>${tiers.map((t) => `<th scope="col">${sup(t.code)}</th>`).join('')}</tr></thead>
        <tbody>${services.map((s) => `
          <tr><th scope="row">${esc(s.name)}${s.value ? ` <small>${esc(s.value)}</small>` : ''}</th>${tiers.map((t) => `<td>${included(s, t) ? '✓' : ''}</td>`).join('')}</tr>`).join('')}
        </tbody>
        <tfoot><tr><th scope="row">Price</th>${tiers.map((t) => `<td>$${esc(t.price)}</td>`).join('')}</tr></tfoot>
      </table>`;
  }

  function renderMenu(sections) {
    return sections.map((sec, i) => `
      <div class="menu__col${sec.highlight ? ' menu__col--accent' : ''} reveal" style="--d:${i * 0.06}s">
        <h3>${esc(sec.title)}</h3>
        ${sec.note ? `<p class="menu__hint">${esc(sec.note)}</p>` : ''}
        <ul class="price-list${sec.two_columns ? ' price-list--two' : ''}">
          ${(sec.items || []).map((it) => `<li><span>${esc(it.name)}</span><b>${esc(it.price)}</b></li>`).join('')}
        </ul>
      </div>`).join('');
  }

  function renderSip(items) {
    return items.map((it, i) => `
      <li class="reveal" style="--d:${i * 0.06}s"><span class="sip__icon">${esc(it.icon)}</span><span>${esc(it.name)}</span></li>`).join('');
  }

  const POLICY_ICONS = [
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16c3-2 5-2 8 0 3-2 5-2 8 0M12 5c2-3 6-1 6 2 0 2-6 6-6 6s-6-4-6-6c0-3 4-5 6-2Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12l9-9h9v9l-9 9z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="16.5" cy="7.5" r="1.5" fill="currentColor"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 10h18M7 14h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  ];

  function renderPolicies(items) {
    return items.map((p, i) => `
      <li class="reveal" style="--d:${i * 0.06}s">
        ${POLICY_ICONS[i % POLICY_ICONS.length]}
        <div><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p></div>
      </li>`).join('');
  }

  const SOURCE_LOGOS = {
    yelp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3l1 8-4 1-3-6 6-3Zm2 9 6-3 1 4-6 1-1-2Zm-1 3 4 4-3 3-3-5 2-2Zm-2 0-4 5-2-3 4-3 2 1Zm-1-3-6-1 1-4 5 3v2Z" fill="#d32323"/></svg>',
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853"/><path d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9L6.4 14Z" fill="#FBBC05"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5L6.4 10c.8-2.3 3-4 5.6-4Z" fill="#EA4335"/></svg>',
  };

  function renderReviews(data) {
    const list = data.reviews || [];
    const source = String(data.source_name || 'Yelp');
    const logo = SOURCE_LOGOS[source.toLowerCase()] || SOURCE_LOGOS.yelp;
    const paras = (t) => esc(t).split(/\n+/).map((x) => `<span class="review__para">${x}</span>`).join('');
    const track = $('#reviewsTrack');
    track.innerHTML = list.map((r) => {
      const stars = Math.max(1, Math.min(5, Number(r.stars) || 5));
      return `
      <article class="review">
        <div class="review__top">
          <span class="review__avatar">${esc(String(r.name || '?').trim().charAt(0).toUpperCase())}</span>
          <div>
            <div class="review__name">${esc(r.name)}</div>
            ${r.location ? `<div class="review__loc">${esc(r.location)}</div>` : ''}
          </div>
        </div>
        <div class="review__stars" aria-label="${stars} out of 5 stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div>
        <p class="review__text">${paras(r.text)}</p>
        <button class="review__more" type="button" hidden>Read more</button>
        <span class="review__g">${logo} Posted on ${esc(source)}</span>
      </article>`;
    }).join('');

    const avg = list.length ? list.reduce((a, r) => a + (Number(r.stars) || 5), 0) / list.length : 5;
    $('#reviewsAvg').textContent = avg.toFixed(1);
    $('#reviewsCount').textContent = list.length;
    $('[data-source-logo]').innerHTML = logo;
    const link = $('#reviewsLink');
    if (data.source_url) link.href = data.source_url; else link.removeAttribute('href');
  }

  // ---------- fill the page ----------
  function render(data) {
    const g = data.general || {};
    const flat = { ...g, packages: data.packages, menu: data.menu, gallery: data.gallery, reviews: data.reviews, policies: data.policies };
    fillText(document, flat);

    if (g.site_title) document.title = `${g.site_title} · Relax · Recharge · Rejuvenate`;
    const meta = $('meta[name="description"]');
    if (meta && g.site_description) meta.content = g.site_description;
    if (g.logo) $$('[data-logo]').forEach((img) => { img.src = g.logo; });
    $$('[data-book]').forEach((a) => { a.href = g.booking_url || '#'; });
    const tel = $('[data-tel]');
    if (tel) tel.href = 'tel:' + String(g.phone || '').replace(/[^\d+]/g, '');
    const map = $('[data-map]');
    if (map) map.href = 'https://maps.google.com/?q=' + encodeURIComponent(`${g.address_line1 || ''}, ${g.address_line2 || ''}`);

    $('[data-list="hours"]').innerHTML = (g.hours || []).map((h) => `${esc(h.days)} · ${esc(h.time)}`).join('<br/>');
    $('[data-list="pillars"]').innerHTML = renderPillars(g.pillars || []);
    $('[data-list="sip"]').innerHTML = renderSip(get(g, 'sip.items') || []);
    $('[data-list="gallery"]').innerHTML = renderGallery(get(data, 'gallery.photos') || []);
    $('[data-list="menu"]').innerHTML = renderMenu(get(data, 'menu.sections') || []);
    $('[data-list="policies"]').innerHTML = renderPolicies(get(data, 'policies.items') || []);

    const pk = data.packages || {};
    ['pedicure', 'manicure'].forEach((kind) => {
      const group = pk[kind] || { tiers: [], services: [] };
      const grid = $(`[data-tiers="${kind}"]`);
      grid.className = `tier-grid tier-grid--${Math.min(4, Math.max(1, (group.tiers || []).length))}`;
      grid.innerHTML = renderTiers(group, pk.featured_badge || 'The full ritual', g.booking_url || '#');
      $(`[data-compare="${kind}"]`).innerHTML = renderCompare(group, `${kind[0].toUpperCase()}${kind.slice(1)} inclusions by tier`);
    });

    renderReviews(data.reviews || {});
  }

  // ---------- behaviour ----------
  function initTabs() {
    const tabs = $$('.tab');
    const glider = $('.tabs__glider');
    const moveGlider = (tab) => {
      if (!glider || !tab) return;
      glider.style.width = tab.offsetWidth + 'px';
      glider.style.transform = `translateX(${tab.offsetLeft}px)`;
    };
    const activate = (name) => {
      tabs.forEach((t) => {
        const on = t.dataset.tab === name;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on);
        if (on) moveGlider(t);
      });
      $$('[data-panel]').forEach((p) => {
        const on = p.dataset.panel === name;
        p.hidden = !on;
        if (on) $$('.reveal', p).forEach((el) => { el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in'); });
      });
    };
    tabs.forEach((t) => t.addEventListener('click', () => activate(t.dataset.tab)));
    window.addEventListener('resize', () => moveGlider($('.tab.is-active')));
    document.fonts?.ready.then(() => moveGlider($('.tab.is-active')));
    moveGlider($('.tab.is-active'));
  }

  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach((el) => io.observe(el));
  }

  function initNav() {
    const toggle = $('.nav__toggle');
    const nav = $('.nav');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('.nav__links a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }));
  }

  function initParallax() {
    const scene = $('.hero__scene');
    const hero = $('.hero');
    if (!scene || !hero || !matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      scene.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      scene.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener('mouseleave', () => { scene.style.setProperty('--px', 0); scene.style.setProperty('--py', 0); });
  }

  function initReviewsStrip() {
    const track = $('#reviewsTrack');
    if (!track) return;
    const setupMore = () => {
      $$('.review', track).forEach((card) => {
        const p = $('.review__text', card);
        const btn = $('.review__more', card);
        if (card.classList.contains('is-open')) return;
        btn.hidden = p.scrollHeight <= p.clientHeight + 2;
      });
    };
    track.addEventListener('click', (e) => {
      const btn = e.target.closest('.review__more');
      if (!btn) return;
      const open = btn.closest('.review').classList.toggle('is-open');
      btn.textContent = open ? 'Show less' : 'Read more';
    });
    document.fonts?.ready.then(setupMore);
    setupMore();

    const prev = $('.reviews__nav--prev');
    const next = $('.reviews__nav--next');
    const step = () => ($('.review', track)?.offsetWidth || 320) + 24;
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    const updateNav = () => {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    track.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', () => { updateNav(); setupMore(); });
    updateNav();

    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('mousedown', (e) => { down = true; moved = false; startX = e.pageX; startLeft = track.scrollLeft; track.classList.add('is-dragging'); });
    window.addEventListener('mouseup', () => { down = false; track.classList.remove('is-dragging'); });
    window.addEventListener('mousemove', (e) => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  // ---------- go ----------
  async function start() {
    try {
      render(await loadContent());
    } catch (err) {
      console.error(err);
    }
    initTabs();
    initReveal();
    initNav();
    initParallax();
    initReviewsStrip();
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
