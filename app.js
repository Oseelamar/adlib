(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* Mobile menu */
  const burger = $('#burger'), links = $('#navLinks');
  const setMenu = open => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  /* Torn paper edges: fixed seed, so every load tears the same way */
  function tear(el, seed) {
    let s = seed;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const W = 1440, H = 60;
    const edge = (base, amp, step) => {
      const p = [];
      let x = 0, y = base;
      while (x < W) {
        y = clamp(y + (r() - .5) * amp, 6, H - 3);
        p.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        x += step * (.45 + r());
      }
      p.push(`${W},${y.toFixed(1)}`);
      return p;
    };
    const shape = pts => `0,0 ${pts.join(' ')} ${W},0`;
    const fill = el.dataset.fill;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <polygon points="${shape(edge(40, 13, 9))}" fill="${fill}" opacity=".42"/>
      <polygon points="${shape(edge(28, 13, 7))}" fill="${fill}"/>
    </svg>`;
  }
  $$('.torn').forEach((el, i) => tear(el, 4127 + i * 977));

  /* Film: starts from a click, so browsers allow sound */
  const film = $('.film'), video = $('#filmVideo');
  $('#filmPlay').addEventListener('click', () => {
    film.classList.add('playing');
    video.controls = true;
    video.play().catch(() => {});
  });

  /* Card rail: touch and trackpad scroll natively, a mouse can drag, dots follow and jump */
  const rail = $('#rail'), railTiles = $$('.tile', rail), railDots = $$('#railDots button');
  const motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  const stops = () => {
    const left = rail.getBoundingClientRect().left;
    const pad = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
    const max = rail.scrollWidth - rail.clientWidth;
    return railTiles.map(t => clamp(t.getBoundingClientRect().left - left + rail.scrollLeft - pad, 0, max));
  };
  const nearest = x => stops().reduce((best, s, i, all) => Math.abs(s - x) < Math.abs(all[best] - x) ? i : best, 0);
  const goTo = i => rail.scrollTo({ left: stops()[i], behavior: motion });
  let railTick = false;
  rail.addEventListener('scroll', () => {
    if (railTick) return;
    railTick = true;
    requestAnimationFrame(() => {
      railTick = false;
      const i = nearest(rail.scrollLeft);
      railDots.forEach((d, k) => d.classList.toggle('on', k === i));
      /* Cards fade as they slide behind the text column, in step with the scroll */
      rail.style.setProperty('--fade', Math.min(rail.scrollLeft, 56) + 'px');
    });
  }, { passive: true });
  railDots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  let drag = null, settle = 0;
  const unfree = () => { clearTimeout(settle); if (!drag) rail.classList.remove('free'); };
  rail.addEventListener('scrollend', unfree);
  rail.addEventListener('dragstart', e => e.preventDefault());
  rail.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button) return;
    clearTimeout(settle);
    drag = { x: e.clientX, left: rail.scrollLeft, from: nearest(rail.scrollLeft) };
    rail.setPointerCapture(e.pointerId);
    rail.classList.add('free', 'dragging');
  });
  rail.addEventListener('pointermove', e => { if (drag) rail.scrollLeft = drag.left - (e.clientX - drag.x); });
  const drop = () => {
    if (!drag) return;
    const moved = rail.scrollLeft - drag.left;
    let i = nearest(rail.scrollLeft);
    if (i === drag.from && Math.abs(moved) > 60) i = clamp(i + Math.sign(moved), 0, railTiles.length - 1);
    drag = null;
    rail.classList.remove('dragging');
    goTo(i);
    settle = setTimeout(unfree, 800);
  };
  rail.addEventListener('pointerup', drop);
  rail.addEventListener('pointercancel', drop);

  /* Pinned platform story */
  const fall = $('#fall'), fallStage = $('.fall__stage', fall), pinStage = $('.pin__stage');
  const pin = $('#pin'), listItems = $$('#pinList li'), vis = $$('#pinVisual .vis'), texts = $$('#pinText p');
  let cur = 0;
  function setStep(i) {
    if (i === cur) return;
    cur = i;
    [listItems, vis, texts].forEach(g => g.forEach((el, k) => el.classList.toggle('on', k === i)));
  }
  const stacked = () => matchMedia('(max-width: 900px)').matches;
  const stickyTop = () => parseFloat(getComputedStyle(fallStage).top) || 72;
  /* The steps share their pinned frame with the chips, so they count from after the transition */
  const stepRange = () => {
    const lead = fall.offsetHeight - fallStage.offsetHeight;
    return { lead, span: pin.offsetHeight - pinStage.offsetHeight - lead };
  };
  let ticking = false;
  function frame() {
    ticking = false;
    const { lead, span } = stepRange();
    const p = clamp((stickyTop() - pin.getBoundingClientRect().top - lead) / span, 0, .9999);
    setStep(Math.floor(p * listItems.length));
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame);
  frame();
  listItems.forEach((li, i) => $('button', li).addEventListener('click', () => {
    const { lead, span } = stepRange();
    const top = pin.getBoundingClientRect().top + scrollY - stickyTop() + lead;
    scrollTo({ top: top + span * ((i + .5) / listItems.length), behavior: 'smooth' });
  }));

  /* DSP Sync: the chips line up in AdLib's DSP Sync panel and switch on one by one as you scroll.
     The panel then shuts like a shutter and the platform steps take over the same pinned frame */
  const dsps = $('#dsps'), fallHead = $('.platform__head', fall), chips = $$('.dsp', fall);
  const visual = $('#pinVisual'), textWrap = $('#pinText'), N = chips.length;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seg = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
  const ease = t => t * t * (3 - 2 * t);
  const sync = document.createElement('div');
  sync.className = 'sync';
  sync.setAttribute('aria-hidden', 'true');
  sync.innerHTML = `<header><img src="assets/logo-white.svg" alt=""><span>DSP Sync</span></header><p class="count"><b>0</b> of ${N} platforms connected</p>${chips.map(() => '<i class="tg"></i>').join('')}`;
  fallStage.appendChild(sync);
  const toggles = $$('.tg', sync), counter = $('.count b', sync);
  let G = null;
  const measureChips = () => {
    chips.forEach(c => { c.style.transform = ''; });
    const S = fallStage.getBoundingClientRect(), W = S.width, H = S.height, phone = stacked();
    const base = chips.map(c => {
      const r = c.getBoundingClientRect(), cx = r.left + r.width / 2 - S.left;
      return { cx, cy: r.top + r.height / 2 - S.top, w: r.width, h: r.height, side: (cx - W / 2) / (W / 2) };
    });
    /* Two columns of six on desktop, one column on a phone */
    /* Phones: a full-width panel, larger pills and more air between rows. Desktop: larger toggles */
    const cols = phone ? 1 : 2, perCol = N / cols, chipH = base[0].h, tgW = phone ? 40 : 48, tgH = phone ? 22 : 26;
    const headH = phone ? 44 : 52, footH = phone ? 40 : 48, avail = phone ? H - 8 : H - 20;
    const gapRow = phone ? clamp((avail - 8 - headH - footH - chipH * 1.1 * perCol) / perCol, 6, 14) : 8;
    /* Never smaller than about 12px text, even on short phones */
    const s = Math.max(.9, Math.min(phone ? 1.14 : .9, (avail - 8 - headH - footH - gapRow * perCol) / (chipH * perCol)));
    const rowH = chipH * s + gapRow, maxW = Math.max(...base.map(b => b.w)) * s;
    const colW = phone ? W - 24 : maxW + 28 + 24 + tgW, colGap = 10;
    const pw = colW * cols + colGap * (cols - 1), ph = headH + rowH * perCol + footH;
    const left = W / 2 - pw / 2, top = Math.max(6, (avail - ph) / 2);
    Object.assign(sync.style, { left: left + 'px', top: top + 'px', width: pw + 'px', height: ph + 'px' });
    const order = base.map((b, i) => i).sort((a, b) => (base[a].cy - base[b].cy) || (base[a].cx - base[b].cx));
    const slots = [];
    order.forEach((i, n) => {
      const col = Math.floor(n / perCol), r = n % perCol, colLeft = left + col * (colW + colGap);
      const y = top + headH + rowH * (r + .5);
      slots[i] = { x: colLeft + 14 + base[i].w * s / 2, y, s, n };
      toggles[n].style.left = (colLeft - left + colW - 14 - tgW) + 'px';
      toggles[n].style.top = (y - top - tgH / 2) + 'px';
    });
    G = { base, slots, box: { left, top, w: pw, h: ph }, dl: dsps.offsetLeft, dt: dsps.offsetTop };
  };
  const renderFall = p => {
    const h = seg(p, .03, .16);
    fallHead.style.opacity = 1 - h;
    fallHead.style.transform = calm || !h ? '' : `translateY(${(-34 * h).toFixed(1)}px)`;
    const open = ease(seg(p, .2, .32));
    /* The shutter: top and bottom edges meet in the middle, clipping the chips with them */
    const close = ease(seg(p, .62, .74)), gone = seg(p, .735, .77);
    const b = G.box, cut = b.h / 2 * close;
    sync.style.opacity = open * (1 - gone);
    sync.style.transform = open < 1 ? `scale(${(.96 + .04 * open).toFixed(3)})` : '';
    sync.style.clipPath = close ? `inset(${cut.toFixed(1)}px 0 round ${Math.min(22, b.h / 2 - cut).toFixed(1)}px)` : '';
    if (close) {
      const l = b.left - G.dl, r = l + b.w, t = b.top - G.dt + cut, bt = b.top - G.dt + b.h - cut;
      dsps.style.clipPath = `polygon(${l.toFixed(1)}px ${t.toFixed(1)}px,${r.toFixed(1)}px ${t.toFixed(1)}px,${r.toFixed(1)}px ${bt.toFixed(1)}px,${l.toFixed(1)}px ${bt.toFixed(1)}px)`;
    } else dsps.style.clipPath = '';
    let on = 0;
    chips.forEach((c, i) => {
      const sl = G.slots[i], bs = G.base[i];
      const e = ease(seg(p, .06 + sl.n * .008, .3 + sl.n * .008));
      const arc = calm ? 0 : Math.sin(Math.PI * e) * 40, tilt = calm ? 0 : -Math.sign(bs.side) * 12 * Math.sin(Math.PI * e);
      c.style.transform = `translate(${((sl.x - bs.cx) * e).toFixed(1)}px,${((sl.y - bs.cy) * e + arc).toFixed(1)}px) rotate(${tilt.toFixed(2)}deg) scale(${(1 + (sl.s - 1) * e).toFixed(3)})`;
      c.style.opacity = 1 - gone;
      const live = p > .36 + sl.n * .018;
      c.classList.toggle('lit', live);
      toggles[sl.n].classList.toggle('on', live);
      if (live) on++;
    });
    counter.textContent = on;
    /* The first step lands where the panel shut */
    const v = ease(seg(p, .72, .86)), a = ease(seg(p, .76, .9));
    visual.style.opacity = v;
    visual.style.transform = v < 1 ? `scale(${(.94 + .06 * v).toFixed(3)})` : '';
    listItems.forEach(li => { li.style.opacity = a; });
    textWrap.style.opacity = a;
    fallStage.style.visibility = p >= 1 ? 'hidden' : '';
    pinStage.style.pointerEvents = p > .9 ? '' : 'none';
  };
  let fallNow = 0, fallGoal = 0, fallRunning = false;
  const fallTick = () => {
    const gap = fallGoal - fallNow;
    fallNow = Math.abs(gap) < .0005 ? fallGoal : fallNow + gap * .14;
    renderFall(fallNow);
    if (fallNow !== fallGoal) requestAnimationFrame(fallTick); else fallRunning = false;
  };
  const fallRead = () => {
    fallGoal = clamp((stickyTop() - fall.getBoundingClientRect().top) / (fall.offsetHeight - fallStage.offsetHeight), 0, 1);
    if (!fallRunning && fallNow !== fallGoal) { fallRunning = true; requestAnimationFrame(fallTick); }
  };
  const fallSetup = () => { measureChips(); renderFall(fallNow); fallRead(); };
  addEventListener('scroll', fallRead, { passive: true });
  addEventListener('resize', fallSetup);
  addEventListener('load', fallSetup);
  document.fonts.ready.then(fallSetup);
  fallSetup();

  /* White label preview: the billboard's paper takes the chosen colour */
  const swatches = $$('#swatches button'), boards = $$('#boards img');
  swatches.forEach((b, i) => b.addEventListener('click', () => {
    swatches.forEach(s => s.classList.toggle('on', s === b));
    boards.forEach((im, k) => im.classList.toggle('on', k === i));
  }));

  /* Why tabs */
  const tabs = $$('#whyTabs button'), bodies = $$('#whyBody > div');
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    tabs.forEach((x, k) => x.setAttribute('aria-selected', String(k === i)));
    bodies.forEach((x, k) => x.classList.toggle('on', k === i));
  }));

  /* Quotes */
  const quotes = $$('#quotes figure');
  let q = 0;
  const showQ = i => { q = (i + quotes.length) % quotes.length; quotes.forEach((f, k) => f.classList.toggle('on', k === q)); };
  $('#qPrev').addEventListener('click', () => showQ(q - 1));
  $('#qNext').addEventListener('click', () => showQ(q + 1));

  /* Reveal once, on the way down */
  const io = new IntersectionObserver(ents => ents.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .06 });
  $$('.reveal').forEach(el => io.observe(el));
})();
