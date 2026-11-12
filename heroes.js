(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The twelve platforms from the page, with their logos */
  const D = [['Amazon DSP', 'm01'], ['DV360', 'm05'], ['Yahoo', 'm12'], ['Viant', 'm10'], ['Criteo', 'm04'], ['Magnite', 'm06'], ['Beeswax', 'm02'], ['Broadsign', 'm03'], ['Vistar', 'm11'], ['Smadex', 'm09'], ['Moloco', 'm08'], ['MediaMath', 'm07']]
    .map(([n, m]) => ({ n, src: `assets/marks/${m}.png` }));

  const MARK = '<svg class="mk" viewBox="0 3.3 28.3 19.4" aria-hidden="true"><path fill="currentColor" d="M14.1168 13.0013L18.8223 17.7068L23.5277 13.0013L14.1168 13.0013ZM9.41175 17.7064L14.1172 22.4118L18.8226 17.7064L9.41175 17.7064ZM23.5276 13.0007L18.8223 8.2953L14.1169 13.0007L23.5276 13.0007ZM23.5296 13.0003L28.235 8.29492L23.5296 3.58954L23.5296 13.0003ZM23.527 3.58949L18.8216 8.29492L23.527 13.0004L23.527 3.58949ZM9.41246 17.7057L4.70703 13.0003L0.00159695 17.7057L9.41246 17.7057ZM0.00165601 17.7064L4.70704 22.4117L9.41241 17.7064L0.00165601 17.7064ZM9.41246 17.7064L14.1179 13.001L9.41247 8.29554L9.41246 17.7064ZM18.8226 17.7058L14.1172 13.0004L9.41181 17.7058L18.8226 17.7058ZM9.41181 8.2956L4.70643 13.001L9.41181 17.7064L9.41181 8.2956Z"/></svg>';
  const TICK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.3l2.3 2.3 4.7-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const WARN = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.2l6.2 11.1H.8z" fill="currentColor"/><path d="M7 5.4v3.2M7 10.3v.2" stroke="#C63B2F" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const ARROW = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1l10 4.2-4.4 1.5L5.1 11z" fill="#0F1222"/></svg>';

  const lt = (d, z = 30) => `<span class="lt" style="--z:${z}px"><img src="${d.src}" alt="" draggable="false"></span>`;
  const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
  const add = (st, html) => st.appendChild(h(html));
  const wires = (st, H) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', `0 0 360 ${H}`); s.setAttribute('class', 'wires'); s.setAttribute('aria-hidden', 'true'); st.appendChild(s); return s; };
  const path = (svg, d, cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.setAttribute('class', cls); svg.appendChild(p); return p; };
  const cursor = (st, label, x, y, cls = '') => add(st, `<span class="ct ${cls}" style="--x:${x}px;--y:${y}px">${ARROW}<span>${label}</span></span>`);
  const fire = p => { p.classList.remove('go'); void p.getBoundingClientRect(); p.classList.add('go'); };
  const on = (els, c = 'in') => [].concat(els).forEach(e => e.classList.add(c));
  const off = (els, ...c) => [].concat(els).forEach(e => e.classList.remove(...c));

  /* Right-angled wire with rounded corners */
  const rpath = (p, r = 14) => {
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length - 1; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1];
      const a = Math.min(r, Math.hypot(x1 - x0, y1 - y0) / 2), b = Math.min(r, Math.hypot(x2 - x1, y2 - y1) / 2);
      const ux = Math.sign(x1 - x0), uy = Math.sign(y1 - y0), vx = Math.sign(x2 - x1), vy = Math.sign(y2 - y1);
      d += `L${x1 - ux * a} ${y1 - uy * a}Q${x1} ${y1} ${x1 + vx * b} ${y1 + vy * b}`;
    }
    const l = p[p.length - 1];
    return d + `L${l[0]} ${l[1]}`;
  };

  /* A small clock per stage, so a replay can cancel whatever is still queued */
  let lastMs = 0;
  const clock = () => {
    let ids = [], rafs = new Set();
    return {
      at(ms, fn) { lastMs = Math.max(lastMs, ms); if (calm) fn(); else ids.push(setTimeout(fn, ms)); },
      count(el, to, ms, fmt = v => v) {
        if (calm) { el.textContent = fmt(to); return; }
        const t0 = performance.now();
        const step = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(to * e)); if (k < 1) { const id = requestAnimationFrame(step); rafs.add(id); } };
        rafs.add(requestAnimationFrame(step));
      },
      stop() { ids.forEach(clearTimeout); ids = []; rafs.forEach(cancelAnimationFrame); rafs.clear(); }
    };
  };
  const still = (st, fn) => { st.classList.add('nt'); fn(); void st.offsetWidth; if (!calm) st.classList.remove('nt'); };

  /* 1 Untangle: scattered platform chores straighten into one tree */
  const untangle = st => {
    const H = 392, c = clock();
    const tasks = ['Log in again', 'Check pacing', 'Export report', 'Update budget', 'Set up campaign', 'Reconcile invoice', 'Upload creative', 'Fix tracking'];
    const mess = [[6, 8, -4], [188, 30, 3], [22, 84, 3], [176, 104, -2.5], [4, 236, -3], [190, 222, 2.5], [26, 312, 2], [184, 300, -3.5]];
    const svg = wires(st, H);
    const tangle = [
      [[60, 62], [60, 150], [150, 150], [150, 196]],
      [[271, 84], [271, 62], [120, 62], [120, 258], [87, 258]],
      [[259, 158], [259, 196], [226, 196]],
      [[105, 138], [105, 172], [334, 172], [334, 296], [267, 296]],
      [[87, 290], [87, 334], [18, 334], [18, 204], [134, 204]],
      [[273, 276], [273, 292], [160, 292], [160, 344], [109, 344]],
      [[240, 212], [240, 244], [44, 244], [44, 138]]
    ].map(p => path(svg, rpath(p), 'ln'));
    const tree = [91, 269].map(x => path(svg, rpath([[180, 46], [180, 72], [x, 72], [x, 330]]), 'ln'));
    const cards = mess.map((m, i) => add(st, `<div class="uc" style="--x:${m[0]}px;--y:${m[1]}px;--r:${m[2]}deg;--gx:${i % 2 ? 186 : 8}px;--gy:${96 + 76 * (i >> 1)}px;--d:${i * 45}ms">${lt(D[i])}<span class="uc__t"><span class="fa"><small>${D[i].n}</small><b>${tasks[i]}</b></span><span class="fb"><small class="ok">${TICK}Connected</small><b>${D[i].n}</b></span></span></div>`));
    add(st, `<div class="pl pl--warn"><span class="fa">${WARN}12 platforms to manage</span><span class="fb">${MARK}All managed in AdLib</span></div>`);
    const tag = cursor(st, 'AdLib', 252, 46);
    return {
      H,
      reset() { c.stop(); still(st, () => { off(st, 'done'); on(tangle, 'on'); off(tree, 'on'); off(cards, 'fixed'); off(tag, 'on'); }); },
      play() {
        c.at(1500, () => off(tangle, 'on'));
        c.at(1950, () => on(st, 'done'));
        c.at(2800, () => on(tree, 'on'));
        cards.forEach((e, i) => c.at(3150 + i * 90, () => on(e, 'fixed')));
        c.at(3300, () => on(tag, 'on'));
      }
    };
  };

  /* 2 Hub: twelve platforms plug into AdLib, then one action reaches all of them */
  const hub = st => {
    const H = 410, c = clock(), cx = 180, cy = 190, R = 148;
    const svg = wires(st, H);
    const spokes = D.map((d, k) => {
      const a = (-75 + 30 * k) * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
      const far = [cx + (R - 24) * co, cy + (R - 24) * si], near = [cx + 46 * co, cy + 46 * si];
      return {
        wire: path(svg, `M${far[0]} ${far[1]}L${near[0]} ${near[1]}`, 'ln'),
        pulse: path(svg, `M${near[0]} ${near[1]}L${far[0]} ${far[1]}`, 'cm'),
        tile: add(st, `<span class="tl" style="--x:${cx + R * co}px;--y:${cy + R * si}px">${lt(d, 40)}<span class="bd">${TICK}</span></span>`)
      };
    });
    const core = add(st, `<div class="hb" style="--x:${cx}px;--y:${cy}px"><span class="rp"></span>${MARK}</div>`);
    const pill = add(st, `<div class="pl pl--soft" style="--x:180px;--y:384px"><span class="fa"><span class="n">0</span>&nbsp;of 12 platforms connected</span><span class="fb">${TICK}Campaign live on 12 platforms</span></div>`);
    const n = $('.n', pill);
    return {
      H,
      reset() { c.stop(); still(st, () => { off(st, 'sent'); off(core, 'in', 'send'); off(pill, 'in'); n.textContent = '0'; spokes.forEach(s => { off(s.wire, 'on'); off(s.pulse, 'go'); off(s.tile, 'in', 'conn', 'live'); }); }); },
      play() {
        c.at(150, () => on(core));
        spokes.forEach((s, k) => c.at(350 + k * 60, () => on(s.tile)));
        c.at(1100, () => on(pill));
        spokes.forEach((s, k) => {
          c.at(1300 + k * 120, () => on(s.wire, 'on'));
          c.at(1950 + k * 120, () => { on(s.tile, 'conn'); n.textContent = String(k + 1); });
        });
        const t = 1950 + 11 * 120 + 700;
        c.at(t, () => { on(core, 'send'); spokes.forEach(s => fire(s.pulse)); });
        c.at(t + 800, () => { spokes.forEach(s => on(s.tile, 'live')); on(st, 'sent'); });
      }
    };
  };

  /* 3 Arch: platforms sit on the outer arch and feed the AdLib core */
  const arch = st => {
    const H = 222, c = clock(), cx = 180, by = 192;
    const svg = wires(st, H);
    const half = (r, cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', `M${cx - r} ${by}A${r} ${r} 0 0 1 ${cx + r} ${by}Z`); p.setAttribute('class', 'band ' + cls); svg.appendChild(p); return p; };
    const bands = [half(172, 'band--o'), half(112, 'band--m')];
    const spokes = [165, 140, 115, 90, 65, 40, 15].map((deg, k) => {
      const a = deg * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
      const d = `M${cx + 121 * co} ${by - 121 * si}L${cx + 60 * co} ${by - 60 * si}`;
      return { wire: path(svg, d, 'ln'), pulse: path(svg, d, 'cm'), tile: add(st, `<span class="tl" style="--x:${cx + 142 * co}px;--y:${by - 142 * si}px">${lt(D[k], 36)}</span>`) };
    });
    const coreBand = half(56, 'band--c');
    const core = add(st, `<div class="hb" style="--x:180px;--y:${by - 27}px">${MARK}</div>`);
    const chips = [['Buying', 156], ['Pacing', 116], ['Reporting', 64], ['Billing', 24]].map(([t, deg]) => { const a = deg * Math.PI / 180; return add(st, `<span class="chip3" style="--x:${cx + 84 * Math.cos(a)}px;--y:${by - 84 * Math.sin(a)}px">${t}</span>`); });
    const strip = add(st, '<div class="strip"><span>Every platform, run from AdLib</span></div>');
    return {
      H,
      reset() { c.stop(); still(st, () => { off([...bands, coreBand, core, strip, ...chips], 'in'); spokes.forEach(s => { off(s.wire, 'on'); off(s.pulse, 'go'); off(s.tile, 'in', 'live'); }); }); },
      play() {
        c.at(150, () => on([coreBand, core]));
        c.at(400, () => on(bands[1]));
        c.at(650, () => on(bands[0]));
        spokes.forEach((s, k) => {
          c.at(1150 + k * 80, () => on(s.tile));
          c.at(1800 + k * 90, () => on(s.wire, 'on'));
          c.at(2700 + k * 90, () => { fire(s.pulse); on(s.tile, 'live'); });
        });
        chips.forEach((e, i) => c.at(2500 + i * 130, () => on(e)));
        c.at(3500, () => on(strip));
      }
    };
  };

  /* 4 Command: one campaign in AdLib, launched on five platforms with one button */
  const command = st => {
    const H = 468, c = clock();
    const svg = wires(st, H);
    const rows = D.slice(0, 5).map((d, i) => {
      const y = 198 + 54 * i, d2 = rpath([[180, 162], [180, 180], [34, 180], [34, y + 22], [62, y + 22]], 12);
      return { wire: path(svg, d2, 'ln'), pulse: path(svg, d2, 'cm'), row: add(st, `<div class="rw" style="top:${y}px">${lt(d, 28)}<b>${d.n}</b><span class="stt"><span class="fa">Draft</span><span class="fb"><span class="dot"></span>Live</span></span></div>`) };
    });
    const card = add(st, `<div class="cc" style="left:30px;top:6px;width:300px"><div class="cc__h"><span class="mkt">${MARK}</span><span><small>New campaign</small><b>Holiday CTV</b></span><span class="chip">5 platforms</span></div><div class="cc__f"><span><small>Budget</small><b>$48,250</b></span><span><small>Flight</small><b>Nov 20 to Dec 31</b></span></div><div class="cc__b" data-s="0"><span class="f0">Launch on 5 platforms</span><span class="f1">Launching…</span><span class="f2">${TICK}Live on 5 platforms</span></div></div>`);
    const btn = $('.cc__b', card), tag = cursor(st, 'You', 300, 320, 'ct--o');
    const park = () => { tag.style.setProperty('--x', '300px'); tag.style.setProperty('--y', '320px'); };
    return {
      H,
      reset() { c.stop(); still(st, () => { off(card, 'in'); off(btn, 'press'); btn.dataset.s = '0'; off(tag, 'on'); park(); rows.forEach(r => { off(r.wire, 'on'); off(r.pulse, 'go'); off(r.row, 'in', 'live'); }); }); },
      play() {
        c.at(150, () => on(card));
        rows.forEach((r, i) => c.at(450 + i * 80, () => on(r.row)));
        c.at(1100, () => { on(tag, 'on'); tag.style.setProperty('--x', '236px'); tag.style.setProperty('--y', '140px'); });
        c.at(2150, () => on(btn, 'press'));
        c.at(2350, () => { off(btn, 'press'); btn.dataset.s = '1'; rows.forEach(r => on(r.wire, 'on')); });
        c.at(2900, () => off(tag, 'on'));
        rows.forEach((r, i) => {
          c.at(3150 + i * 150, () => fire(r.pulse));
          c.at(3850 + i * 150, () => on(r.row, 'live'));
        });
        c.at(3850 + 5 * 150 + 150, () => { btn.dataset.s = '2'; });
      }
    };
  };

  /* 5 Funnel: nine platforms flow into AdLib and come out as one report */
  const funnel = st => {
    const H = 476, c = clock();
    const svg = wires(st, H);
    const spots = [[60, 4], [120, 4], [180, 4], [240, 4], [300, 4], [90, 52], [150, 52], [210, 52], [270, 52]];
    const feeds = spots.map(([x, y], k) => {
      const y0 = y + 39, k2 = (196 - y0) * .55, d = `M${x} ${y0}C${x} ${y0 + k2} 180 ${196 - k2} 180 196`;
      return { wire: path(svg, d, 'ln'), pulse: path(svg, d, 'cm'), tile: add(st, `<span class="tl" style="--x:${x}px;--y:${y + 18}px">${lt(D[k], 36)}</span>`) };
    });
    const trunk = path(svg, 'M180 232L180 262', 'ln');
    const node = add(st, `<div class="nd" style="--x:180px;--y:214px"><span class="rp"></span>${MARK}AdLib</div>`);
    const vals = [.5, .82, .62, .96, .7, .46, .86, .6, .76];
    const card = add(st, `<div class="cc" style="left:20px;top:262px;width:320px"><div class="cc__h"><span class="mkt">${MARK}</span><span><small>Campaign report</small><b>All platforms</b></span><span class="chip">9 platforms</span></div><div class="cc__fig"><strong>$0</strong><small>spend this month</small></div><div class="bars">${vals.map(v => `<span style="--v:${v}"></span>`).join('')}</div></div>`);
    const fig = $('strong', card), bars = $$('.bars span', card);
    const money = v => '$' + v.toLocaleString('en-US');
    return {
      H,
      reset() { c.stop(); still(st, () => { off([node, card, ...bars], 'in'); off(node, 'send'); off(trunk, 'on'); fig.textContent = '$0'; feeds.forEach(f => { off(f.wire, 'on'); off(f.pulse, 'go'); off(f.tile, 'in', 'live'); }); }); },
      play() {
        feeds.forEach((f, k) => c.at(150 + k * 70, () => on(f.tile)));
        c.at(900, () => on(node));
        feeds.forEach((f, k) => {
          c.at(1150 + k * 70, () => on(f.wire, 'on'));
          c.at(2050 + k * 90, () => { fire(f.pulse); on(f.tile, 'live'); });
        });
        c.at(2900, () => { on(node, 'send'); on(trunk, 'on'); });
        c.at(3350, () => on(card));
        c.at(3600, () => c.count(fig, 48250, 1100, money));
        bars.forEach((b, k) => c.at(3650 + k * 70, () => on(b)));
      }
    };
  };

  /* ---------- The quieter set: three takes on Hub, three on Funnel ---------- */
  const money = v => '$' + v.toLocaleString('en-US');
  const tileAt = (st, d, x, y, z = 38) => add(st, `<span class="tl" style="--x:${x}px;--y:${y}px">${lt(d, z)}</span>`);
  const circle = (cx, cy, r) => `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx - .01} ${cy - r}`;
  const head = (small, title, chip) => `<div class="cc__h"><span class="mkt">${MARK}</span><span><small>${small}</small><b>${title}</b></span>${chip ? `<span class="chip">${chip}</span>` : ''}</div>`;

  /* 2.1 Orbit: platforms sit on two fine rings; one sweep of light carries the campaign round */
  const hubOrbit = st => {
    const H = 404, c = clock(), cx = 180, cy = 184;
    const svg = wires(st, H);
    const rings = [88, 150].map(r => ({ r, line: path(svg, circle(cx, cy, r), 'ring'), sweep: path(svg, circle(cx, cy, r), 'swp') }));
    const spots = D.map((d, k) => {
      const inner = k < 5, deg = inner ? -90 + 72 * k : -90 + 25.7 + (360 / 7) * (k - 5), a = deg * Math.PI / 180, r = inner ? 88 : 150;
      return { ring: inner ? 0 : 1, f: (((deg + 90) % 360) + 360) % 360 / 360, tile: tileAt(st, d, cx + r * Math.cos(a), cy + r * Math.sin(a)) };
    });
    const core = add(st, `<div class="core" style="--x:${cx}px;--y:${cy}px"><span class="wv" style="--i:0"></span><span class="wv" style="--i:1"></span><span class="wv" style="--i:2"></span>${MARK}</div>`);
    const pill = add(st, `<div class="pl pl--soft" style="--x:180px;--y:382px"><span class="fa">Sending campaign</span><span class="fb">${MARK}Live on 12 platforms</span></div>`);
    return {
      H,
      reset() { c.stop(); still(st, () => { off(st, 'sent'); off([core, pill], 'in'); off(core, 'wave'); rings.forEach(r => { off(r.line, 'on'); off(r.sweep, 'go'); }); spots.forEach(s => off(s.tile, 'in', 'live', 'bump')); }); },
      play() {
        c.at(150, () => on(core));
        rings.forEach((r, i) => c.at(450 + i * 200, () => on(r.line, 'on')));
        spots.forEach((s, k) => c.at(900 + k * 60, () => on(s.tile)));
        c.at(1900, () => on(pill));
        rings.forEach((r, i) => { const t = 2400 + i * 250; c.at(t, () => fire(r.sweep)); c.at(t + 1650, () => off(r.sweep, 'go')); });
        spots.forEach(s => c.at(2400 + s.ring * 250 + s.f * 1600 + 60, () => on(s.tile, 'live')));
        c.at(4450, () => on(core, 'wave'));
        spots.forEach(s => c.at(4450 + (s.ring ? 620 : 300), () => on(s.tile, 'bump')));
        c.at(5500, () => on(st, 'sent'));
      }
    };
  };

  /* 2.2 Chip: the campaign lives in one AdLib card, with every platform pinned to its edge */
  const hubChip = st => {
    const H = 296, c = clock();
    const svg = wires(st, H);
    const pins = [];
    [96, 152, 208, 264].forEach(x => pins.push([x, 22, x, 41, x, 66]));
    [116, 176].forEach(y => pins.push([332, y, 313, y, 290, y]));
    [264, 208, 152, 96].forEach(x => pins.push([x, 270, x, 251, x, 226]));
    [176, 116].forEach(y => pins.push([28, y, 47, y, 70, y]));
    const legs = pins.map(([tx, ty, x1, y1, x2, y2], k) => ({
      wire: path(svg, `M${x2} ${y2}L${x1} ${y1}`, 'ln'), pulse: path(svg, `M${x1} ${y1}L${x2} ${y2}`, 'cm'), tile: tileAt(st, D[k], tx, ty)
    }));
    const card = add(st, `<div class="cc cc--chip" style="left:70px;top:66px;width:220px;height:160px">${head('Campaign', 'Holiday CTV')}<div class="cc__fig"><strong>0.0M</strong><small>people reached</small></div><div><div class="lbl"><small>Budget delivered</small><small class="n">0%</small></div><div class="meter"><span></span></div></div></div>`);
    const fig = $('strong', card), pct = $('.n', card), meter = $('.meter', card);
    return {
      H,
      reset() { c.stop(); still(st, () => { off([card, meter], 'in'); fig.textContent = '0.0M'; pct.textContent = '0%'; legs.forEach(l => { off(l.wire, 'on'); off(l.pulse, 'go'); off(l.tile, 'in', 'live'); }); }); },
      play() {
        c.at(150, () => on(card));
        legs.forEach((l, k) => {
          c.at(800 + k * 70, () => on(l.wire, 'on'));
          c.at(1150 + k * 70, () => on(l.tile));
          c.at(2500 + k * 60, () => { fire(l.pulse); on(l.tile, 'live'); });
        });
        c.at(3300, () => { c.count(fig, 182, 1400, v => (v / 10).toFixed(1) + 'M'); c.count(pct, 72, 1400, v => v + '%'); on(meter); });
      }
    };
  };

  /* 2.3 Budget: one budget in the middle, split across the platforms */
  const hubBudget = st => {
    const H = 304, c = clock(), cx = 180, cy = 80, r = 62;
    const svg = wires(st, H);
    const share = [26, 22, 18, 14, 12, 8], tint = ['#3940CF', '#535BFE', '#7A80FF', '#9EA3FF', '#C0C3FF', '#DDDFFF'];
    let at = -90;
    const segs = share.map((s, i) => {
      const a0 = (at + 1.2) * Math.PI / 180, a1 = (at + s * 3.6 - 1.2) * Math.PI / 180; at += s * 3.6;
      const p = path(svg, `M${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)}A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`, 'seg');
      p.style.stroke = tint[i]; return p;
    });
    const bus = [60, 180, 300].map(x => path(svg, x === 180 ? 'M180 152L180 246' : rpath([[180, 152], [180, 166], [x, 166], [x, 246]], 12), 'ln'));
    const mid = add(st, `<div class="mid" style="--x:${cx}px;--y:${cy}px"><small>Budget</small><strong>$0</strong></div>`);
    const chips = share.map((s, i) => {
      const e = add(st, `<div class="bc" style="left:${4 + 120 * (i % 3)}px;top:${182 + 62 * (i > 2)}px">${lt(D[i], 26)}<span><small><span class="sw3" style="background:${tint[i]}"></span>${D[i].n.replace(' DSP', '')}</small><b>$0</b></span></div>`);
      return { e, amt: $('b', e), v: Math.round(48250 * s / 100) };
    });
    const total = $('strong', mid);
    return {
      H,
      reset() { c.stop(); still(st, () => { off([mid, ...segs, ...bus], 'in', 'on'); total.textContent = '$0'; chips.forEach(ch => { off(ch.e, 'in'); ch.amt.textContent = '$0'; }); }); },
      play() {
        c.at(150, () => on(mid));
        c.at(400, () => c.count(total, 48250, 1500, money));
        segs.forEach((p, i) => c.at(500 + i * 230, () => on(p, 'on')));
        c.at(2100, () => on(bus, 'on'));
        chips.forEach((ch, i) => c.at(2700 + i * 130, () => { on(ch.e); c.count(ch.amt, ch.v, 900, money); }));
      }
    };
  };

  /* 5.1 Ledger: six platforms drop straight into AdLib and come out as one table */
  const funnelBus = st => {
    const H = 392, c = clock();
    const svg = wires(st, H);
    const feeds = [40, 96, 152, 208, 264, 320].map((x, k) => {
      const d = `M${x} 45L${x} 118`;
      return { wire: path(svg, d, 'ln'), pulse: path(svg, d, 'cm'), tile: tileAt(st, D[k], x, 24) };
    });
    const trunk = path(svg, 'M180 154L180 186', 'ln');
    const bus = add(st, `<div class="bus">${MARK}AdLib</div>`);
    const rowsData = [['Spend', 48250, money], ['Impressions', 182, v => (v / 10).toFixed(1) + 'M'], ['Viewability', 92, v => v + '%']];
    const card = add(st, `<div class="cc" style="left:20px;top:186px;width:320px">${head('Unified report', 'All platforms', '6 platforms')}<div class="tbl">${rowsData.map(r => `<div class="trow"><span>${r[0]}</span><strong>${r[2](0)}</strong></div>`).join('')}</div></div>`);
    const cells = $$('.trow strong', card);
    return {
      H,
      reset() { c.stop(); still(st, () => { off([bus, card], 'in'); off(trunk, 'on'); cells.forEach((e, i) => { e.textContent = rowsData[i][2](0); }); feeds.forEach(f => { off(f.wire, 'on'); off(f.pulse, 'go'); off(f.tile, 'in', 'live'); }); }); },
      play() {
        feeds.forEach((f, k) => c.at(150 + k * 70, () => on(f.tile)));
        c.at(800, () => on(bus));
        feeds.forEach((f, k) => {
          c.at(1100 + k * 70, () => on(f.wire, 'on'));
          c.at(2000 + k * 110, () => { fire(f.pulse); on(f.tile, 'live'); });
        });
        c.at(3000, () => on(trunk, 'on'));
        c.at(3400, () => on(card));
        cells.forEach((e, i) => c.at(3750 + i * 260, () => c.count(e, rowsData[i][1], 1100, rowsData[i][2])));
      }
    };
  };

  /* 5.2 Merge: three separate platform reports become one combined report */
  const funnelMerge = st => {
    const H = 420, c = clock();
    const svg = wires(st, H);
    const lines = ['2,20 16,14 30,17 44,8 58,11 72,4 88,7', '2,8 16,12 30,6 44,15 58,10 72,18 88,12', '2,18 16,19 30,12 44,13 58,6 72,9 88,3'];
    const loose = [[4, 14, -5], [126, 2, 2.5], [248, 18, 5]];
    const feeds = [62, 180, 298].map(x => { const d = `M${x} 90C${x} 132 180 124 180 166`; return { wire: path(svg, d, 'ln'), pulse: path(svg, d, 'cm') }; });
    const trunk = path(svg, 'M180 202L180 226', 'ln');
    const minis = loose.map((m, i) => add(st, `<div class="mc" style="--x:${m[0]}px;--y:${m[1]}px;--r:${m[2]}deg;--gx:${8 + 118 * i}px;--d:${i * 70}ms"><div>${lt(D[i], 22)}<b>${D[i].n.replace(' DSP', '')}</b></div><svg viewBox="0 0 90 24" aria-hidden="true"><polyline points="${lines[i]}"/></svg></div>`));
    const node = add(st, `<div class="nd" style="--x:180px;--y:184px"><span class="rp"></span>${MARK}AdLib</div>`);
    const card = add(st, `<div class="cc" style="left:20px;top:226px;width:320px">${head('Combined report', 'All platforms')}<div class="cc__fig"><strong>$0</strong><small>spend this month</small></div><svg class="chart" viewBox="0 0 292 64" aria-hidden="true"><path class="ln g" pathLength="1" d="M2 52L50 44L98 47L146 36L194 40L242 30L290 33"/><path class="ln g" pathLength="1" d="M2 40L50 46L98 38L146 50L194 44L242 54L290 46"/><path class="ln g" pathLength="1" d="M2 58L50 57L98 50L146 52L194 43L242 46L290 38"/><path class="ln p" pathLength="1" d="M2 34L50 28L98 26L146 20L194 16L242 12L290 6"/></svg></div>`);
    const fig = $('strong', card), chart = $$('.chart path', card);
    return {
      H,
      reset() { c.stop(); still(st, () => { off(st, 'tidy'); off([node, card], 'in'); off(node, 'send'); off([trunk, ...chart], 'on'); fig.textContent = '$0'; feeds.forEach(f => { off(f.wire, 'on'); off(f.pulse, 'go'); }); }); },
      play() {
        c.at(1300, () => on(st, 'tidy'));
        feeds.forEach((f, k) => c.at(2100 + k * 90, () => on(f.wire, 'on')));
        c.at(2500, () => on(node));
        feeds.forEach((f, k) => c.at(3000 + k * 120, () => fire(f.pulse)));
        c.at(3700, () => { on(node, 'send'); on(trunk, 'on'); });
        c.at(4050, () => on(card));
        c.at(4350, () => c.count(fig, 48250, 1200, money));
        chart.forEach((p, i) => c.at(4400 + i * 160, () => on(p, 'on')));
      }
    };
  };

  /* 5.3 Ribbons: each platform's share flows down as a band and joins one stream */
  const funnelRibbon = st => {
    const H = 380, c = clock();
    const svg = wires(st, H);
    const w = [14, 10, 18, 8, 12], tint = ['#C6C9FF', '#A9ADFF', '#8F94FF', '#D9DBFF', '#B8BCFF'], xs = [36, 108, 180, 252, 324];
    let edge = 180 - 31;
    const bands = xs.map((x, i) => {
      const mx = edge + w[i] / 2; edge += w[i];
      const p = path(svg, `M${x} 44C${x} 132 ${mx} 118 ${mx} 201`, 'rb'); p.style.stroke = tint[i]; p.style.strokeWidth = w[i];
      return { band: p, tile: tileAt(st, D[i], x, 24) };
    });
    const main = path(svg, 'M180 200L180 242', 'rb'); main.style.stroke = 'var(--purple)'; main.style.strokeWidth = 62;
    const badge = add(st, `<div class="rbm" style="--x:180px;--y:220px">${MARK}</div>`);
    const card = add(st, `<div class="cc" style="left:20px;top:240px;width:320px">${head('This month', 'All platforms', '5 platforms')}<div class="cc__fig"><strong>$0</strong><small>total spend</small></div><div class="stack">${w.map((v, i) => `<span style="--w:${v};--c:${tint[i]}"></span>`).join('')}</div></div>`);
    const fig = $('strong', card), parts = $$('.stack span', card);
    return {
      H,
      reset() { c.stop(); still(st, () => { off([main, badge, card, ...parts], 'on', 'in'); fig.textContent = '$0'; bands.forEach(b => { off(b.band, 'on'); off(b.tile, 'in', 'live'); }); }); },
      play() {
        bands.forEach((b, k) => c.at(150 + k * 80, () => on(b.tile)));
        bands.forEach((b, k) => c.at(900 + k * 150, () => { on(b.band, 'on'); on(b.tile, 'live'); }));
        c.at(2300, () => on(main, 'on'));
        c.at(2700, () => on(badge));
        c.at(3000, () => on(card));
        c.at(3300, () => c.count(fig, 48250, 1200, money));
        parts.forEach((p, i) => c.at(3400 + i * 140, () => on(p)));
      }
    };
  };

  /* Build every stage once */
  const list = [
    ['1', 'Untangle', untangle, 'Eight scattered platform tasks untangle into one tree managed in AdLib'],
    ['2', 'Hub', hub, 'Twelve platforms connect to AdLib in the centre, then one campaign goes live on all of them'],
    ['2.1', 'Hub .1', hubOrbit, 'Twelve platforms on two rings around AdLib, as one campaign goes live on all of them', 1],
    ['2.2', 'Hub .2', hubChip, 'One AdLib campaign card with twelve platforms pinned to its edges', 1],
    ['2.3', 'Hub .3', hubBudget, 'One budget in AdLib split across six platforms', 1],
    ['3', 'Arch', arch, 'Platforms arranged on an arch, all feeding into AdLib at the centre'],
    ['4', 'Command', command, 'One campaign in AdLib launches on five platforms at once'],
    ['5', 'Funnel', funnel, 'Nine platforms flow into AdLib and come out as one report'],
    ['5.1', 'Funnel .1', funnelBus, 'Six platforms feed AdLib, which shows one table of results', 1],
    ['5.2', 'Funnel .2', funnelMerge, 'Three separate platform reports merge into one combined AdLib report', 1],
    ['5.3', 'Funnel .3', funnelRibbon, 'Five bands of spend flow into one AdLib stream and one total', 1]
  ];
  const sw = $('#sw'), bar = $('#switch'), hint = $('#hint');
  const items = list.map(([key, name, make, label, quiet]) => {
    const view = document.createElement('div');
    view.className = 'sv'; view.setAttribute('role', 'img'); view.setAttribute('aria-label', label);
    const st = document.createElement('div');
    st.className = `st s${key.replace('.', '')}` + (quiet ? ' mt' : '') + (calm ? ' nt' : '');
    view.appendChild(st); sw.appendChild(view);
    const api = make(st);
    view.style.setProperty('--h', api.H + 'px');
    api.reset();
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = key; btn.setAttribute('aria-label', name);
    bar.appendChild(btn);
    return { key, name, view, api, btn };
  });

  /* One scale for the whole board, so it looks the same at every width */
  const fit = () => sw.style.setProperty('--s', (sw.clientWidth / 360).toFixed(4));
  new ResizeObserver(fit).observe(sw);
  fit();

  /* Play when the stage is on screen; switching concepts starts it again */
  let cur = items[0], played = false;
  const io = new IntersectionObserver(ents => ents.forEach(e => { if (e.isIntersecting && !played) { played = true; run(); } }), { threshold: .35 });
  let again = 0, fadeId = 0;
  const start = () => { clearTimeout(again); clearTimeout(fadeId); cur.view.classList.remove('fade'); cur.api.reset(); played = false; io.unobserve(sw); requestAnimationFrame(() => io.observe(sw)); };
  /* Autoplay: three seconds after a run settles, fade out and play it again */
  const run = () => {
    lastMs = 0; cur.api.play();
    if (calm) return;
    again = setTimeout(() => { cur.view.classList.add('fade'); fadeId = setTimeout(start, 450); }, lastMs + 1500 + 3000);
  };
  const pick = it => {
    history.replaceState(null, '', '#' + it.key);
    clearTimeout(again); clearTimeout(fadeId); cur.view.classList.remove('fade'); cur.api.reset();
    cur = it;
    items.forEach(x => { x.view.classList.toggle('on', x === it); x.btn.setAttribute('aria-pressed', String(x === it)); });
    hint.textContent = it.name;
    it.btn.scrollIntoView({ block: 'nearest', inline: 'center' });
    start();
  };
  items.forEach(it => it.btn.addEventListener('click', () => pick(it)));
  pick(items.find(it => it.key === location.hash.slice(1)) || items[0]);
})();
