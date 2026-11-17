(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile menu */
  const burger = $('#burger'), links = $('#navLinks');
  burger.addEventListener('click', () => { const o = !links.classList.contains('open'); links.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); });

  const DSP = [['Amazon DSP', 'm01'], ['DV360', 'm05'], ['Yahoo', 'm12'], ['Viant', 'm10'], ['Criteo', 'm04'], ['Magnite', 'm06'], ['Beeswax', 'm02'], ['Broadsign', 'm03'], ['Vistar', 'm11'], ['Smadex', 'm09'], ['Moloco', 'm08'], ['MediaMath', 'm07']];
  const I = {
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
    audio: '<path d="M4 10v4M8 6v12M12 9v6M16 4v16M20 10v4"/>',
    dooh: '<rect x="3" y="4" width="18" height="10" rx="1.5"/><path d="M8 14v6M16 14v6M5 20h14"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
    display: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 14h6"/>',
    live: '<circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/>',
    pace: '<path d="M5 17a8 8 0 1 1 14 0"/><path d="M12 13l4-4"/>',
    chart: '<path d="M5 19V11M12 19V5M19 19v-6"/>',
    bill: '<path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21z"/><path d="M10 8h4M10 12h4"/>',
    shift: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>'
  };
  const icon = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;
  const MINI = { gear: '<path d="M8 4.5v7M4.5 8h7"/>', wave: '<path d="M3 9.5l2.5-3 2.5 2 2.5-3 2.5 2"/>', bars: '<path d="M4.5 12V8M8 12V4.5M11.5 12V9.5"/>', tick: '<path d="M4 8.3l2.6 2.6L12 5.5"/>' };
  const mini = k => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${MINI[k].match(/d="([^"]+)"/)[1]}"/></svg>`;
  const ARROW = '<svg viewBox="0 0 15 15" aria-hidden="true"><path d="M1 1l12.5 5.2-5.4 1.9L6.2 13.5z"/></svg>';

  /* Two directions. 1: platforms flow in, results flow out. 2: campaigns flow in, go live on every platform. */
  const V = {
    1: {
      label: 'Twelve buying platforms flow into AdLib, which handles setup, pacing and reporting and sends back one stream of results',
      wheel: { side: 'in', items: DSP.map(([n, m]) => ({ n, m })) },
      stack: { side: 'out', items: [
        ['live', 'Campaign live', 'Holiday CTV, 12 platforms', 'Now'],
        ['pace', 'Pacing on track', 'DV360 at 98% of plan', '2m'],
        ['shift', 'Budget moved', '$4,000 shifted to CTV', '6m'],
        ['chart', 'Report ready', 'Every platform, one view', '9m'],
        ['bill', 'Invoice sent', 'Client billing, automatic', '1h']
      ] },
      cursors: [['Setup', 'gear', '#535BFE', 148, 'l'], ['Pacing', 'wave', '#F08A1C', 22, 'r'], ['Reporting', 'bars', '#0A8585', 258, 'r']]
    },
    2: {
      label: 'Twelve buying platforms flow into AdLib, which buys, optimizes and bills, and each campaign goes live',
      wheel: { side: 'in', items: DSP.map(([n, m]) => ({ n, m })) },
      stack: { side: 'out', items: [
        ['tv', 'Holiday CTV', 'Connected TV, $48,250', 'Live'],
        ['audio', 'Spring launch', 'Audio, $12,000', 'Live'],
        ['dooh', 'Store opening', 'Digital out-of-home, $20,000', 'Live'],
        ['video', 'Brand story', 'Video, $30,000', 'Live'],
        ['display', 'Retargeting', 'Display, $8,500', 'Live']
      ] },
      cursors: [['Buying', 'tick', '#535BFE', 152, 'l'], ['Optimizing', 'wave', '#F08A1C', 30, 'r'], ['Billing', 'bars', '#0A8585', 262, 'r']]
    }
  };

  const fl = $('#fl');
  let v = 1, S = null, timers = [], raf = 0, running = false, visible = false, lastW = 0;
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const el = (html, parent = fl) => { const t = document.createElement('template'); t.innerHTML = html.trim(); const e = t.content.firstChild; parent.appendChild(e); return e; };
  const svgEl = (svg, tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, val]) => e.setAttribute(k, val)); svg.appendChild(e); return e; };
  const rad = d => d * Math.PI / 180;

  /* A list that ticks forward one step at a time, like a picker settling into its detent */
  const ticker = (n, place) => {
    let pos = 0, from = 0, to = 0, t0 = 0;
    const wrap = d => ((d % n) + n + n / 2) % n - n / 2;
    return {
      next() { from = pos; to = Math.round(pos) + 1; t0 = performance.now(); },
      frame(now) {
        if (t0) { const k = Math.min(1, (now - t0) / 820); pos = from + (to - from) * ease(k); if (k === 1) { t0 = 0; pos = to; } }
        for (let i = 0; i < n; i++) place(i, wrap(i - pos));
      },
      focus() { return ((Math.round(pos) % n) + n) % n; }
    };
  };

  const build = () => {
    stop();
    fl.innerHTML = '';
    const cfg = V[v], W = fl.clientWidth, vert = W < 860;
    lastW = W;
    fl.classList.toggle('vert', vert);
    fl.setAttribute('aria-label', cfg.label);
    const H = vert ? 700 : 420;
    fl.style.height = H + 'px';
    const svg = svgEl(fl, 'svg', { class: 'wires', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });

    /* Layout: where the wheel, core and stack sit */
    const cx = W / 2, coreD = vert ? 116 : 148, cy = vert ? (cfg.wheel.side === 'in' ? 300 : 318) : H / 2;
    const L = {};
    if (!vert) {
      const inX = Math.max(W * .2, 150), outX = Math.min(W * .8, W - 150);
      L.wheel = cfg.wheel.side === 'in' ? { x: inX - 70, y: cy, dir: 'left' } : { x: W - inX - 130, y: cy, dir: 'right' };
      L.stack = cfg.stack.side === 'in' ? { x: Math.max(W * .3, 330) - 150, y: cy } : { x: Math.min(W * .7, W - 330) + 150, y: cy };
    } else {
      const top = 92, bottom = H - 120;
      if (cfg.wheel.side === 'in') { L.wheel = { x: cx, y: top, dir: 'top' }; L.stack = { x: cx, y: bottom - 30 }; }
      else { L.stack = { x: cx, y: 128 }; L.wheel = { x: cx, y: bottom + 20, dir: 'bottom' }; }
    }

    /* Wires: three fine lines in, three out, and a streak that runs along each */
    const cardW = vert ? Math.min(330, W - 40) : 300;
    let inA, inB, outA, outB;
    const wheelEdge = L.wheel.dir === 'left' ? [L.wheel.x + 200, cy] : L.wheel.dir === 'right' ? [L.wheel.x - 30, cy] : L.wheel.dir === 'top' ? [cx, L.wheel.y + 34] : [cx, L.wheel.y - 34];
    const stackEdge = vert ? (cfg.stack.side === 'in' ? [cx, L.stack.y + 105] : [cx, L.stack.y - 105]) : (cfg.stack.side === 'in' ? [L.stack.x + cardW / 2 + 10, cy] : [L.stack.x - cardW / 2 - 10, cy]);
    const coreIn = vert ? [cx, cy - coreD / 2 - 26] : [cx - coreD / 2 - 26, cy], coreOut = vert ? [cx, cy + coreD / 2 + 26] : [cx + coreD / 2 + 26, cy];
    if (cfg.wheel.side === 'in') { inA = wheelEdge; outB = stackEdge; } else { inA = stackEdge; outB = wheelEdge; }
    inB = coreIn; outA = coreOut;
    const wire = (a, b) => {
      [-4, 0, 4].forEach(o => { const dx = vert ? o : 0, dy = vert ? 0 : o; svgEl(svg, 'path', { class: 'hl3', d: `M${a[0] + dx} ${a[1] + dy}L${b[0] + dx} ${b[1] + dy}` }); });
      const d = `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
      return [svgEl(svg, 'path', { class: 'stk stk--glow', d, pathLength: 1 }), svgEl(svg, 'path', { class: 'stk', d, pathLength: 1 })];
    };
    const streakIn = wire(inA, inB), streakOut = wire(outA, outB);

    /* Brackets: fine arcs around the core and beside the wheel */
    const arc = (x, y, r, a0, a1) => { const p = a => [x + r * Math.cos(rad(a)), y - r * Math.sin(rad(a))]; const s = p(a0), e = p(a1); return `M${s[0]} ${s[1]}A${r} ${r} 0 0 ${a1 > a0 ? 0 : 1} ${e[0]} ${e[1]}`; };
    const spans = vert ? [[60, 120], [240, 300]] : [[150, 210], [-30, 30]];
    [coreD / 2 + 16, coreD / 2 + 26].forEach(r => spans.forEach(([a, b]) => svgEl(svg, 'path', { class: 'brk', d: arc(cx, cy, r, a, b) })));

    /* Core and its pulse */
    const pulses = [.16, .1].map((o, i) => el(`<span class="pz" style="--d:${coreD}px;--x:${cx}px;--y:${cy}px;--o:${o};--i:${i}"></span>`));
    el(`<div class="co" style="--d:${coreD}px;--x:${cx}px;--y:${cy}px"><img src="assets/logo-white.svg" alt="" width="126" height="26"></div>`);

    /* Cursors around the core */
    const rc = coreD / 2 + (vert ? 30 : 58);
    const cursors = cfg.cursors.map(([label, ic, color, deg, side]) => {
      let d = deg; if (vert) d = { 148: 140, 152: 140, 22: 40, 30: 40, 258: 305, 262: 305 }[deg] ?? deg;
      const x = cx + rc * Math.cos(rad(d)), y = cy - rc * Math.sin(rad(d));
      const rot = Math.atan2(cy - y, cx - x) * 180 / Math.PI - 22.6;
      const s = side;
      const e = el(`<div class="cu ${s}" style="--x:${x}px;--y:${y}px;--r:${rot}deg">${ARROW}<span><i style="--c:${color}">${mini(ic)}</i>${label}</span></div>`);
      return { e, x, y, ph: Math.random() * 6.28, sp: .00055 + Math.random() * .0003 };
    });

    /* Wheel */
    const w = cfg.wheel, wn = w.items.length;
    const wEls = w.items.map(it => el(`<div class="wi"><span class="lg"><img src="assets/marks/${it.m}.png" alt="" draggable="false"></span>${it.n}${w.live ? '<span class="st"><i></i>Live</span>' : ''}</div>`));
    const R = vert ? 300 : 300, step = vert ? 30 : 13;
    const wheel = ticker(wn, (i, d) => {
      const e = wEls[i], th = rad(d * step), lim = vert ? 1.3 : 3.3;
      if (Math.abs(d) > lim + .6) { e.style.opacity = 0; e.style.visibility = 'hidden'; return; }
      e.style.visibility = 'visible';
      let x, y;
      if (L.wheel.dir === 'left') { x = L.wheel.x - R * (1 - Math.cos(th)); y = L.wheel.y + R * Math.sin(th); e.style.transform = `translate(${x}px,${y - 20}px)`; }
      else if (L.wheel.dir === 'right') { x = L.wheel.x + R * (1 - Math.cos(th)); y = L.wheel.y + R * Math.sin(th); e.style.transform = `translate(${x}px,${y - 20}px)`; }
      else if (L.wheel.dir === 'top') { x = L.wheel.x + R * Math.sin(th); y = L.wheel.y - R * (1 - Math.cos(th)); e.style.transform = `translate(calc(${x}px - 50%),${y - 20}px)`; }
      else { x = L.wheel.x + R * Math.sin(th); y = L.wheel.y + R * (1 - Math.cos(th)); e.style.transform = `translate(calc(${x}px - 50%),${y - 20}px)`; }
      const a = Math.abs(d);
      e.style.opacity = Math.max(0, Math.min(1, 1 - Math.max(0, a - .6) / (lim - .2))).toFixed(3);
      e.style.setProperty('--f', Math.max(0, 1 - a * 1.6).toFixed(3));
      e.classList.toggle('on', a < .35);
    });

    /* Stack */
    const s = cfg.stack, sn = s.items.length, gap = vert ? 70 : 78;
    const sEls = s.items.map(([ic, t, sub, time]) => el(`<div class="ca" style="width:${cardW}px"><span class="ic">${icon(ic)}</span><span class="tx"><b>${t}</b><small>${sub}</small></span><time>${time}</time></div>`));
    const stack = ticker(sn, (i, d) => {
      const e = sEls[i], a = Math.abs(d), lim = vert ? 1.4 : 2.2;
      if (a > lim + .4) { e.style.opacity = 0; e.style.visibility = 'hidden'; return; }
      e.style.visibility = 'visible';
      const y = L.stack.y + d * gap - 31, sc = 1 - Math.min(a, 2) * .07;
      e.style.transform = `translate(${L.stack.x - cardW / 2}px,${y}px) scale(${sc})`;
      e.style.zIndex = 10 - Math.round(a * 2);
      e.style.opacity = Math.max(0, 1 - a * .42 - Math.max(0, a - 1.4) * .9).toFixed(3);
      e.classList.toggle('on', a < .35);
    });

    S = { wheel, stack, streakIn, streakOut, pulses, cursors, wheelIn: w.side === 'in' };
    frame(performance.now());
  };

  const fire = list => list.forEach(p => { p.classList.remove('go'); void p.getBoundingClientRect(); p.classList.add('go'); });
  const frame = now => {
    if (!S) return;
    S.wheel.frame(now); S.stack.frame(now);
    S.cursors.forEach(c => {
      const ox = Math.sin(now * c.sp + c.ph) * 4, oy = Math.cos(now * c.sp * .8 + c.ph) * 3;
      c.e.style.setProperty('--x', c.x + ox + 'px'); c.e.style.setProperty('--y', c.y + oy + 'px');
    });
  };
  const loop = now => { frame(now); raf = requestAnimationFrame(loop); };

  /* One beat: something comes in, AdLib works on it, something goes out */
  const beat = () => {
    const inList = S.wheelIn ? S.wheel : S.stack, outList = S.wheelIn ? S.stack : S.wheel;
    inList.next();
    later(650, () => fire(S.streakIn));
    later(1300, () => { fire(S.pulses); S.cursors.forEach((c, i) => later(i * 120, () => { c.e.classList.add('tap'); later(420, () => c.e.classList.remove('tap')); })); });
    later(1750, () => fire(S.streakOut));
    later(2350, () => outList.next());
    later(3400, beat);
  };
  const start = () => { if (running || calm || !S) return; running = true; raf = requestAnimationFrame(loop); later(700, beat); };
  const stop = () => { running = false; timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); };

  new IntersectionObserver(ents => ents.forEach(e => { visible = e.isIntersecting; visible ? start() : stop(); }), { threshold: .1 }).observe(fl);
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : visible && start(); });
  let rz = 0;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (fl.clientWidth !== lastW) { build(); if (visible) start(); } }, 180); });

  const buttons = $$('.switch [data-v]'), hint = $('#hint');
  const pick = n => {
    v = n;
    history.replaceState(null, '', '#' + n);
    document.body.classList.toggle('t1', n === 1); document.body.classList.toggle('t2', n === 2);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === n)));
    hint.textContent = n === 1 ? 'White' : 'Purple';
    build();
    if (visible) start();
  };
  buttons.forEach(b => b.addEventListener('click', () => pick(+b.dataset.v)));
  pick(location.hash === '#2' ? 2 : 1);
})();
