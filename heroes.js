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
  const clock = () => {
    let ids = [], rafs = new Set();
    return {
      at(ms, fn) { if (calm) fn(); else ids.push(setTimeout(fn, ms)); },
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

  /* Build every stage once */
  const makers = [untangle, hub, arch, command, funnel], names = ['Untangle', 'Hub', 'Arch', 'Command', 'Funnel'];
  const sw = $('#sw'), views = $$('.sv', sw);
  const stages = views.map((v, i) => {
    const st = document.createElement('div');
    st.className = `st s${i + 1}` + (calm ? ' nt' : '');
    v.appendChild(st);
    const api = makers[i](st);
    v.style.setProperty('--h', api.H + 'px');
    api.reset();
    return api;
  });

  /* One scale for the whole board, so it looks the same at every width */
  const fit = () => sw.style.setProperty('--s', (sw.clientWidth / 360).toFixed(4));
  new ResizeObserver(fit).observe(sw);
  fit();

  /* Play when the stage is on screen; switching or Replay starts it again */
  let cur = 0, played = false;
  const io = new IntersectionObserver(ents => ents.forEach(e => { if (e.isIntersecting && !played) { played = true; stages[cur].play(); } }), { threshold: .35 });
  const start = () => { stages[cur].reset(); played = false; io.unobserve(sw); requestAnimationFrame(() => io.observe(sw)); };

  const buttons = $$('.switch [data-v]'), hint = $('#hint');
  const pick = n => {
    history.replaceState(null, '', '#' + n);
    cur = n - 1;
    views.forEach((v, i) => v.classList.toggle('on', i === cur));
    buttons.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === n)));
    hint.textContent = names[cur];
    start();
  };
  buttons.forEach(b => b.addEventListener('click', () => pick(+b.dataset.v)));
  $('#replay').addEventListener('click', start);
  pick(Math.min(5, Math.max(1, parseInt(location.hash.slice(1), 10) || 1)));
})();
