/* Shared behaviour. No dependencies. */
(function () {
  'use strict';

  /* ---- nav: solid after the hero, mobile toggle ---- */
  const nav = document.getElementById('nav');
  const sentinel = document.getElementById('nav-sentinel');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => nav.classList.toggle('solid', !e.isIntersecting), { rootMargin: '-60px 0px 0px 0px' }).observe(sentinel);
  } else if (nav) {
    nav.classList.add('solid');
  }
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* ---- release state: Spinning 'Round Again drops 2026-11-11 (local midnight) ---- */
  const RELEASE = new Date(2026, 10, 11, 0, 0, 0);
  const root = document.documentElement;
  const applyRelease = () => {
    const out = new Date() >= RELEASE;
    root.classList.toggle('released', out);
    document.querySelectorAll('[data-presave]').forEach(a => { a.textContent = out ? 'Listen now' : (a.dataset.label || a.textContent); });
    document.querySelectorAll('[data-when]').forEach(el => { el.textContent = out ? 'New single, out now' : 'New single, out November 11'; });
    document.querySelectorAll('[data-count]').forEach(el => {
      const ms = RELEASE - new Date();
      if (ms <= 0) { el.innerHTML = ''; return; }
      const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
      el.innerHTML = `<div><div class="n">${d}</div><div class="l">days</div></div><div><div class="n">${h}</div><div class="l">hours</div></div><div><div class="n">${m}</div><div class="l">min</div></div>`;
    });
  };
  document.querySelectorAll('[data-presave]').forEach(a => { a.dataset.label = a.textContent; });
  applyRelease(); setInterval(applyRelease, 30000);

  /* ---- splash: the single, once per session ---- */
  const splash = document.getElementById('splash');
  if (splash) {
    const close = () => {
      root.classList.remove('splash-on'); root.classList.add('no-splash');
      try { sessionStorage.setItem('sss-splash', '1'); } catch (e) {}
      const first = document.querySelector('.hero .ctas a'); if (first) first.focus({ preventScroll: true });
    };
    splash.querySelector('[data-enter]').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('splash-on')) close(); });
    if (root.classList.contains('splash-on')) { const b = splash.querySelector('[data-enter]'); if (b) b.focus({ preventScroll: true }); }
  }

  /* ---- hero video: only when motion is allowed ---- */
  const hv = document.querySelector('.hero video');
  if (hv) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { hv.remove(); }
    else { hv.play().catch(() => {}); }
  }

  /* ---- click-to-load video embeds ---- */
  document.querySelectorAll('.vid[data-yt]').forEach(box => {
    const btn = box.querySelector('.play');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const id = box.dataset.yt;
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      f.title = btn.querySelector('.t') ? btn.querySelector('.t').textContent : 'Video';
      box.innerHTML = '';
      box.appendChild(f);
    });
  });

  /* ---- click-to-play self-hosted clips ---- */
  document.querySelectorAll('.vid[data-src]').forEach(box => {
    const btn = box.querySelector('.play');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const v = document.createElement('video');
      v.src = box.dataset.src; v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('aria-label', btn.querySelector('.t') ? btn.querySelector('.t').textContent : 'Video');
      box.innerHTML = ''; box.appendChild(v); v.play().catch(() => {});
    });
  });

  /* ---- gallery lightbox ---- */
  const lb = document.getElementById('lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const items = [...document.querySelectorAll('[data-gallery] a')];
    const img = lb.querySelector('img'), cap = lb.querySelector('.cap');
    let i = 0;
    const show = n => {
      i = (n + items.length) % items.length;
      const a = items[i];
      img.src = a.getAttribute('href'); img.alt = a.querySelector('img').alt; cap.textContent = a.dataset.cap || '';
    };
    items.forEach((a, n) => a.addEventListener('click', e => { e.preventDefault(); show(n); lb.showModal(); }));
    lb.querySelector('[data-close]').addEventListener('click', () => lb.close());
    lb.querySelector('[data-prev]').addEventListener('click', () => show(i - 1));
    lb.querySelector('[data-next]').addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
  }

  /* ---- shows ---- */
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
  function fmtLong(d) { return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); }

  function showRow(s, past) {
    const d = parseDate(s.date);
    const who = s.who === 'band' ? 'The Cherokee Roses' : (s.who === 'duo' ? 'Duo' : 'Solo');
    const cta = past
      ? '<span></span>'
      : (s.url ? `<a class="btn btn-ghost cta" href="${s.url}" target="_blank" rel="noopener">Tickets</a>`
               : '<span class="btn btn-ghost cta past">Free entry</span>');
    return `<article class="show${past ? ' past' : ''}">
      <div class="date num" aria-label="${fmtLong(d)}"><div class="d">${d.getDate()}</div><div class="m">${MONTHS[d.getMonth()]}</div><div class="y">${d.getFullYear()}</div></div>
      <div>
        <div class="venue">${s.venue}<span class="who ${s.who}">${who}</span></div>
        <div class="where">${s.city}${s.time ? ' · ' + s.time : ''}</div>
        ${s.note ? `<div class="note">${s.note}</div>` : ''}
      </div>
      ${cta}
    </article>`;
  }

  function eventLd(s) {
    const d = parseDate(s.date);
    return {
      '@type': 'MusicEvent',
      name: (s.who === 'band' ? 'Spencer Scott Smith & The Cherokee Roses' : 'Spencer Scott Smith') + ' at ' + s.venue,
      startDate: s.date,
      location: { '@type': 'Place', name: s.venue, address: s.city },
      performer: { '@type': 'MusicGroup', name: 'Spencer Scott Smith & The Cherokee Roses' },
      eventStatus: 'https://schema.org/EventScheduled',
      ...(s.url ? { offers: { '@type': 'Offer', url: s.url } } : {}),
      ...(d < new Date() ? {} : {})
    };
  }

  async function loadShows() {
    const targets = document.querySelectorAll('[data-shows]');
    if (!targets.length) return;
    let data;
    try {
      const r = await fetch('/data/shows.json', { cache: 'no-cache' });
      data = (await r.json()).shows;
    } catch (e) {
      targets.forEach(t => { t.innerHTML = '<div class="empty"><strong>Show list did not load.</strong> Reload the page, or check Instagram for dates.</div>'; });
      return;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const all = data.slice().sort((a, b) => a.date < b.date ? -1 : 1);

    targets.forEach(t => {
      const mode = t.dataset.shows;            // upcoming | recent
      const limit = Number(t.dataset.limit || 0);
      let filter = t.dataset.filter || 'all';   // all | band | solo
      const render = () => {
        const pick = all.filter(s => filter === 'all' ? true : (filter === 'band' ? s.who === 'band' : s.who !== 'band'));
        let rows = mode === 'upcoming'
          ? pick.filter(s => parseDate(s.date) >= today)
          : pick.filter(s => parseDate(s.date) < today).reverse();
        if (limit) rows = rows.slice(0, limit);
        if (!rows.length) {
          t.innerHTML = mode === 'upcoming'
            ? '<div class="empty"><strong>Nothing on the calendar yet.</strong> One more band show is planned for 2026 and the date is not public. Join the list below and you will hear first.</div>'
            : '<div class="empty"><strong>No past shows listed.</strong></div>';
          return;
        }
        t.innerHTML = rows.map(s => showRow(s, mode !== 'upcoming')).join('');
      };
      render();
      const fl = t.closest('section') && t.closest('section').querySelector('.filters');
      if (fl) fl.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        fl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        filter = b.dataset.filter; render();
      }));
    });

    /* MusicEvent JSON-LD for upcoming dates */
    const up = all.filter(s => parseDate(s.date) >= today);
    if (up.length) {
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': up.map(eventLd) });
      document.head.appendChild(ld);
    }
  }

  /* ---- catalog ---- */
  async function loadMusic() {
    const strip = document.querySelector('[data-catalog]');
    if (!strip) return;
    let data;
    try { data = await (await fetch('/data/music.json', { cache: 'no-cache' })).json(); }
    catch (e) { strip.innerHTML = '<div class="empty"><strong>Catalog did not load.</strong> Everything is on Spotify under Spencer Scott Smith.</div>'; return; }
    strip.innerHTML = data.releases.map(r => {
      const links = r.next
        ? `<a href="${r.presave || r.page}" target="_blank" rel="noopener">${new Date() < RELEASE ? 'Pre-save' : 'Listen'}</a><a href="${r.page}">About</a>`
        : [r.spotify && `<a href="${r.spotify}" target="_blank" rel="noopener">Spotify</a>`,
           r.apple && `<a href="${r.apple}" target="_blank" rel="noopener">Apple</a>`,
           r.youtube && `<a href="${r.youtube}" target="_blank" rel="noopener">YouTube</a>`].filter(Boolean).join('');
      return `<article class="rel${r.next ? ' next' : ''}">
        <div class="yr num">${r.next && new Date() < RELEASE ? 'Out Nov 11' : r.year}</div>
        <div class="ti">${r.title}</div>
        <div class="by">${r.credit}</div>
        <div class="links">${links}</div>
      </article>`;
    }).join('');
  }

  /* ---- forms: Formspree with inline validation ---- */
  document.querySelectorAll('form[data-formspree]').forEach(form => {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const err = form.querySelector('.err'); const ok = form.parentElement.querySelector('.form-ok');
      err.style.display = 'none';
      const email = form.querySelector('input[type=email]');
      if (!email.checkValidity()) { err.textContent = 'Enter a valid email address, like name@example.com.'; err.style.display = 'block'; email.focus(); return; }
      if (form.action.includes('YOUR_FORM_ID')) { err.textContent = 'Form is not connected yet (placeholder Formspree id). Nothing was sent.'; err.style.display = 'block'; return; }
      const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(String(r.status));
        form.style.display = 'none'; ok.style.display = 'block';
      } catch (e) {
        err.textContent = 'Could not send (' + e.message + '). Try again, or email us directly.'; err.style.display = 'block';
      } finally { btn.disabled = false; }
    });
  });

  loadShows();
  loadMusic();
})();
