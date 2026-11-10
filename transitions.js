(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
  const ease = t => t * t * (3 - 2 * t);

  /* Torn top edge, same seed as the main page's platform section */
  $$('.torn').forEach(el => {
    let s = 4127;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const edge = (base, amp, step) => {
      const p = [];
      let x = 0, y = base;
      while (x < 1440) { y = clamp(y + (r() - .5) * amp, 6, 57); p.push(`${x.toFixed(1)},${y.toFixed(1)}`); x += step * (.45 + r()); }
      p.push(`1440,${y.toFixed(1)}`);
      return p;
    };
    const shape = pts => `0,0 ${pts.join(' ')} 1440,0`;
    el.innerHTML = `<svg viewBox="0 0 1440 60" preserveAspectRatio="none"><polygon points="${shape(edge(40, 13, 9))}" fill="${el.dataset.fill}" opacity=".42"/><polygon points="${shape(edge(28, 13, 7))}" fill="${el.dataset.fill}"/></svg>`;
  });

  const fall = $('#fall'), stage = $('.fall__stage', fall), head = $('.platform__head', fall), chips = $$('.dsp', fall), dsps = $('#dsps');
  const pin = $('#pin'), pinStage = $('.pin__stage'), listItems = $$('#pinList li');
  const visual = $('#pinVisual'), vis = $$('#pinVisual .vis'), textWrap = $('#pinText'), texts = $$('#pinText p');
  const stacked = () => matchMedia('(max-width: 900px)').matches;
  const N = chips.length;

  /* Drawing layer */
  const morph = document.createElement('div');
  morph.className = 'morph';
  morph.setAttribute('aria-hidden', 'true');
  morph.innerHTML = `<svg class="lines"></svg>
    <div class="sync"><header><img src="assets/logo-white.svg" alt=""><span>DSP Sync</span></header><p class="count"><b>0</b> of ${N} platforms connected</p>${chips.map(() => '<i class="tg"></i>').join('')}</div>
    <div class="mark"><img src="assets/logo-white.svg" alt=""><p class="count"><b>0</b> of ${N} platforms connected</p></div>`;
  stage.appendChild(morph);
  const svg = $('.lines', morph), sync = $('.sync', morph), mark = $('.mark', morph), toggles = $$('.tg', morph);
  const counters = $$('.count b', morph);

  let mode = clamp(parseInt(location.hash.slice(1), 10) || 1, 1, 3);
  let G = null, paths = [];

  const setCount = n => counters.forEach(c => { c.textContent = n; });
  const move = (el, x, y, s = 1, r = 0) => { el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`; };
  const centreAt = (el, x, y, s = 1) => { el.style.transform = `translate(${(x - el.offsetWidth / 2).toFixed(1)}px,${(y - el.offsetHeight / 2).toFixed(1)}px) scale(${s.toFixed(3)})`; };

  const measure = () => {
    chips.forEach(c => { c.style.transform = ''; });
    const S = stage.getBoundingClientRect(), W = S.width, H = S.height, phone = stacked();
    const base = chips.map(c => {
      const r = c.getBoundingClientRect(), cx = r.left + r.width / 2 - S.left;
      return { cx, cy: r.top + r.height / 2 - S.top, w: r.width, h: r.height, side: (cx - W / 2) / (W / 2) };
    });
    const o = $('.object', vis[0]).getBoundingClientRect();
    const lift = vis[0].classList.contains('on') ? 0 : (phone ? 16 : 26);
    const im = { cx: o.left + o.width / 2 - S.left, cy: o.top + o.height / 2 - S.top - lift, w: o.width };
    const chipH = base[0].h, room = phone ? H - 86 : H;
    let html = '';

    if (mode === 1) {
      /* Funnel: rows of 5, 4, 2, 1, longest pills at the top */
      const rows = [5, 4, 2, 1], scales = [.84, .74, .64, .56], widths = [1, .74, .46, .28];
      const limit = Math.min(W - 32, 1060);
      const byWidth = base.map((b, i) => i).sort((a, b) => base[b].w - base[a].w);
      const slots = [], edges = [];
      let y = room * (phone ? .1 : .16), take = 0;
      rows.forEach((n, r) => {
        const members = byWidth.slice(take, take + n); take += n;
        const gap = 10, total = members.reduce((s, i) => s + base[i].w * scales[r], 0) + gap * (n - 1);
        const k = Math.min(1, limit * widths[r] / total), s = scales[r] * k;
        const rowW = members.reduce((t, i) => t + base[i].w * s, 0) + gap * k * (n - 1);
        let x = W / 2 - rowW / 2;
        y += chipH * s / 2;
        members.forEach((i, j) => {
          const w = base[i].w * s;
          slots[i] = { x: x + w / 2, y, s, row: r, j, n };
          x += w + gap * k;
        });
        edges.push({ half: rowW / 2, top: y - chipH * s / 2, bottom: y + chipH * s / 2 });
        y += chipH * s / 2 + 12;
      });
      const neck = { x: W / 2, y: y + 46 };
      const markY = neck.y + (phone ? 70 : 84);
      const pour = base.map((b, i) => i).sort((a, b) => (slots[b].row - slots[a].row) || (Math.abs(slots[a].j - (slots[a].n - 1) / 2) - Math.abs(slots[b].j - (slots[b].n - 1) / 2)));
      pour.forEach((i, k) => { slots[i].k = k; });
      /* The outline hugs each row, so it never cuts across a pill */
      const side = dir => {
        const pts = [];
        /* Straight walls through each row's lower corner, the way a funnel narrows */
        pts.push([W / 2 + dir * (edges[0].half + 24), edges[0].top - 16]);
        edges.forEach((e, r) => pts.push([W / 2 + dir * (e.half + 24 - r * 3), e.bottom + 6]));
        pts.push([neck.x + dir * 24, neck.y], [neck.x + dir * 24, neck.y + 22]);
        return 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L');
      };
      html = [-1, 1].map(d => `<path class="outline" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" stroke-linejoin="round" d="${side(d)}"/>`).join('');
      G = { W, H, base, slots, neck, markY };
    } else if (mode === 2) {
      /* Hub: a ring around AdLib, slots clockwise from the top */
      const s = phone ? .74 : .8, clear = room - 92;
      const maxW = Math.max(...base.map(b => b.w)) * s;
      const c = { x: W / 2, y: phone ? clear * .52 : Math.min(im.cy, clear / 2 + 20) };
      let ring;
      if (phone) {
        /* Two columns either side of AdLib, leaving the logo's row clear; k runs clockwise */
        const gapY = Math.min(54, (clear - 150) / 6);
        ring = Array.from({ length: N }, (_, k) => {
          const right = k < 6, j = right ? k : 11 - k, above = j < 3;
          const y = c.y + (above ? -1 : 1) * (62 + (above ? 2 - j : j - 3) * gapY);
          return { x: W * (right ? .73 : .27), y, k };
        });
      } else {
        const rx = Math.min(W * .36, W / 2 - maxW / 2 - 12), ry = Math.min(clear * .4, c.y - chipH * s / 2 - 16, clear - c.y - chipH * s / 2);
        ring = Array.from({ length: N }, (_, k) => {
          /* Offset half a slot, so no pill sits level with the logo and its counter */
          const a = (-90 + 180 / N + k * 360 / N) * Math.PI / 180;
          return { x: c.x + rx * Math.cos(a), y: c.y + ry * Math.sin(a), k };
        });
      }
      const sortedSlots = [...ring].sort((a, b) => (a.x - b.x) || (a.y - b.y));
      const sortedChips = base.map((b, i) => i).sort((a, b) => (base[a].cx - base[b].cx) || (base[a].cy - base[b].cy));
      const slots = [];
      sortedChips.forEach((i, n) => { slots[i] = { ...sortedSlots[n], s }; });
      html = chips.map(() => '<path/>').join('');
      G = { W, H, base, slots, c, r0: phone ? 74 : 96, im };
    } else {
      /* Switch: a DSP Sync panel, two columns of six on desktop, one column on a phone */
      /* Phones: a full-width panel, larger pills and more air between rows. Desktop: larger toggles */
      const cols = phone ? 1 : 2, perCol = N / cols, tgW = phone ? 40 : 48, tgH = phone ? 22 : 26;
      const headH = phone ? 44 : 52, footH = phone ? 40 : 48, avail = phone ? H - 70 : H - 96;
      const gapRow = phone ? clamp((avail - 8 - headH - footH - chipH * 1.1 * perCol) / perCol, 6, 14) : 8;
      /* Never smaller than about 12px text, even on short phones */
      const s = Math.max(.9, Math.min(phone ? 1.14 : .9, (avail - 8 - headH - footH - gapRow * perCol) / (chipH * perCol)));
      const rowH = chipH * s + gapRow;
      const maxW = Math.max(...base.map(b => b.w)) * s;
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
      G = { W, H, base, slots, box: { left, top, w: pw, h: ph }, dl: dsps.offsetLeft, dt: dsps.offsetTop };
    }
    svg.innerHTML = html;
    paths = $$('path', svg);
    sync.style.display = mode === 3 ? '' : 'none';
    toggles.forEach(t => { t.style.display = mode === 3 ? '' : 'none'; });
    mark.style.display = mode === 3 ? 'none' : '';
  };

  const fadeHead = p => {
    const h = seg(p, .03, .16);
    head.style.opacity = 1 - h;
    head.style.transform = h ? `translateY(${(-34 * h).toFixed(1)}px)` : '';
  };
  const landing = (p, from, scaleFrom = .94) => {
    const v = ease(seg(p, from, from + .14));
    visual.style.opacity = v;
    visual.style.transform = v < 1 ? `scale(${(scaleFrom + (1 - scaleFrom) * v).toFixed(3)})` : '';
    const a = ease(seg(p, .76, .9));
    listItems.forEach(li => { li.style.opacity = a; });
    textWrap.style.opacity = a;
  };
  const travel = (i, e, slot, sag = 60) => {
    const b = G.base[i];
    return { x: (slot.x - b.cx) * e, y: (slot.y - b.cy) * e + Math.sin(Math.PI * e) * sag, r: -Math.sign(b.side) * 12 * Math.sin(Math.PI * e) };
  };

  const versions = {
    /* Funnel: the pills settle into a funnel and pour through it into AdLib */
    1(p) {
      fadeHead(p);
      let poured = 0;
      chips.forEach((c, i) => {
        const sl = G.slots[i], b = G.base[i];
        const e = ease(seg(p, .06 + sl.row * .02 + Math.abs(b.side) * .04, .3 + sl.row * .02 + Math.abs(b.side) * .04));
        const t = travel(i, e, sl);
        const q = ease(seg(p, .38 + sl.k * .02, .47 + sl.k * .02));
        const x = t.x + (G.neck.x - sl.x) * q, y = t.y + (G.neck.y + 12 - sl.y) * q;
        move(c, x, y, (1 + (sl.s - 1) * e) * (1 - .78 * q), t.r * (1 - q));
        c.style.opacity = 1 - seg(q, .55, 1);
        if (q > .7) poured++;
      });
      const outline = ease(seg(p, .26, .38)), gone = seg(p, .64, .72);
      paths.forEach(path => { path.setAttribute('stroke-dashoffset', (1 - outline).toFixed(3)); path.style.opacity = 1 - gone; });
      centreAt(mark, G.W / 2, G.markY);
      mark.style.opacity = ease(seg(p, .3, .4)) * (1 - seg(p, .66, .74));
      setCount(poured);
      landing(p, .66);
    },
    /* Hub: the pills ring AdLib, a line reaches each one and lights it, then the ring closes in */
    2(p) {
      fadeHead(p);
      const close = ease(seg(p, .62, .76));
      let lit = 0;
      chips.forEach((c, i) => {
        const sl = G.slots[i], b = G.base[i];
        const e = ease(seg(p, .06 + Math.abs(b.side) * .08, .32 + Math.abs(b.side) * .08));
        const t = travel(i, e, sl);
        const sx = sl.x + (G.c.x - sl.x) * close, sy = sl.y + (G.c.y - sl.y) * close;
        move(c, t.x + (sx - sl.x), t.y + (sy - sl.y), (1 + (sl.s - 1) * e) * (1 - .7 * close), t.r);
        c.style.opacity = 1 - seg(close, .45, .95);
        const reach = ease(seg(p, .4 + sl.k * .014, .48 + sl.k * .014));
        const on = reach > .97 && close < .5;
        c.classList.toggle('lit', on);
        if (reach > .97) lit++;
        const dx = sx - G.c.x, dy = sy - G.c.y, len = Math.hypot(dx, dy) || 1;
        const start = Math.min(G.r0, len), ux = dx / len, uy = dy / len;
        const path = paths[i];
        path.setAttribute('d', `M${(G.c.x + ux * start).toFixed(1)} ${(G.c.y + uy * start).toFixed(1)}L${sx.toFixed(1)} ${sy.toFixed(1)}`);
        path.setAttribute('pathLength', '1');
        path.setAttribute('stroke-dasharray', '1');
        path.setAttribute('stroke-dashoffset', (1 - reach).toFixed(3));
        path.style.opacity = 1 - seg(close, .3, .8);
      });
      centreAt(mark, G.c.x, G.c.y + 14, 1 - .25 * close);
      mark.style.opacity = ease(seg(p, .3, .4)) * (1 - seg(p, .68, .76));
      setCount(lit);
      landing(p, .68, .7);
    },
    /* Switch: the pills line up in DSP Sync and get switched on one by one */
    3(p) {
      fadeHead(p);
      const open = ease(seg(p, .2, .32));
      /* The panel shuts like a shutter: top and bottom edges meet in the middle, clipping the pills with them */
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
        const sl = G.slots[i];
        const e = ease(seg(p, .06 + sl.n * .008, .3 + sl.n * .008));
        const t = travel(i, e, sl, 40);
        move(c, t.x, t.y, 1 + (sl.s - 1) * e, t.r);
        c.style.opacity = 1 - gone;
        const live = p > .36 + sl.n * .018;
        c.classList.toggle('lit', live);
        toggles[sl.n].classList.toggle('on', live);
        if (live) on++;
      });
      setCount(on);
      landing(p, .72);
    }
  };

  const render = p => {
    versions[mode](p);
    stage.style.visibility = p >= 1 ? 'hidden' : '';
    pinStage.style.pointerEvents = p > .9 ? '' : 'none';
  };

  /* Smooth following of the scroll, stops as soon as it settles */
  let now = 0, goal = 0, running = false;
  const tick = () => {
    const gap = goal - now;
    now = Math.abs(gap) < .0005 ? goal : now + gap * .14;
    render(now);
    if (now !== goal) requestAnimationFrame(tick); else running = false;
  };
  const stickyTop = () => parseFloat(getComputedStyle(stage).top) || 72;
  const read = () => {
    goal = clamp((stickyTop() - fall.getBoundingClientRect().top) / (fall.offsetHeight - stage.offsetHeight), 0, 1);
    if (!running && now !== goal) { running = true; requestAnimationFrame(tick); }
  };
  const setup = () => { measure(); render(now); read(); };

  /* Steps, counted from after the transition */
  let cur = 0;
  const setStep = i => {
    if (i === cur) return;
    cur = i;
    [listItems, vis, texts].forEach(g => g.forEach((el, k) => el.classList.toggle('on', k === i)));
  };
  const stepRange = () => {
    const lead = fall.offsetHeight - stage.offsetHeight;
    return { lead, span: pin.offsetHeight - pinStage.offsetHeight - lead };
  };
  const steps = () => {
    const { lead, span } = stepRange();
    setStep(Math.floor(clamp((stickyTop() - pin.getBoundingClientRect().top - lead) / span, 0, .9999) * listItems.length));
  };
  listItems.forEach((li, i) => $('button', li).addEventListener('click', () => {
    const { lead, span } = stepRange();
    scrollTo({ top: pin.getBoundingClientRect().top + scrollY - stickyTop() + lead + span * ((i + .5) / listItems.length), behavior: 'smooth' });
  }));

  /* Billboard swatches */
  const swatches = $$('#swatches button'), boards = $$('#boards img');
  swatches.forEach((b, i) => b.addEventListener('click', () => {
    swatches.forEach(s => s.classList.toggle('on', s === b));
    boards.forEach((im, k) => im.classList.toggle('on', k === i));
  }));

  /* Version buttons */
  const buttons = $$('.switch [data-v]');
  const clearStyles = () => {
    [...chips, ...listItems, head, visual, textWrap, mark, sync, ...toggles].forEach(el => {
      el.style.transform = ''; el.style.opacity = '';
    });
    chips.forEach(c => c.classList.remove('lit'));
    dsps.style.clipPath = ''; sync.style.clipPath = '';
    toggles.forEach(t => t.classList.remove('on'));
    setCount(0);
  };
  const pick = n => {
    mode = n;
    history.replaceState(null, '', '#' + n);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === n)));
    clearStyles();
    scrollTo({ top: fall.getBoundingClientRect().top + scrollY - stickyTop(), behavior: 'instant' });
    now = goal = 0;
    setStep(0);
    setup();
  };
  buttons.forEach(b => b.addEventListener('click', () => pick(+b.dataset.v)));
  $('#again').addEventListener('click', () => pick(mode));

  addEventListener('scroll', () => { read(); steps(); }, { passive: true });
  addEventListener('resize', () => { setup(); steps(); });
  addEventListener('load', setup);
  document.fonts.ready.then(setup);
  buttons.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === mode)));
  setup();
})();
