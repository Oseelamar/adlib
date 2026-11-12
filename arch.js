(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Outer ring: the twelve buying platforms from the page */
  const D = [['Amazon DSP', 'm01'], ['DV360', 'm05'], ['Yahoo', 'm12'], ['Viant', 'm10'], ['Criteo', 'm04'], ['Magnite', 'm06'], ['Beeswax', 'm02'], ['Broadsign', 'm03'], ['Vistar', 'm11'], ['Smadex', 'm09'], ['Moloco', 'm08'], ['MediaMath', 'm07']];
  /* Next ring in: the ad channels. Long names sit on the outer step of the zigzag on phones. */
  const CH = [
    ['Connected TV', '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>'],
    ['Audio', '<path d="M4 10v4M8 6v12M12 9v6M16 4v16M20 10v4"/>'],
    ['Digital Out-of-Home', '<rect x="3" y="4" width="18" height="10" rx="1.5"/><path d="M8 14v6M16 14v6M5 20h14"/>'],
    ['Video', '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>'],
    ['Display', '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 14h6"/>'],
    ['Native', '<path d="M4 6h16M4 11h10M4 16h16M4 20h7"/>']
  ];
  /* Middle band: what AdLib takes care of */
  const OPS = [
    '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
    '<path d="M5 17a8 8 0 1 1 14 0"/><path d="M12 13l4-4"/>',
    '<path d="M6 19v-8M12 19V5M18 19v-6"/>',
    '<path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21z"/><path d="M10 8h4M10 12h4"/>'
  ];
  const MARK = '<svg viewBox="0 3.3 28.3 19.4" aria-hidden="true"><path fill="currentColor" d="M14.1168 13.0013L18.8223 17.7068L23.5277 13.0013L14.1168 13.0013ZM9.41175 17.7064L14.1172 22.4118L18.8226 17.7064L9.41175 17.7064ZM23.5276 13.0007L18.8223 8.2953L14.1169 13.0007L23.5276 13.0007ZM23.5296 13.0003L28.235 8.29492L23.5296 3.58954L23.5296 13.0003ZM23.527 3.58949L18.8216 8.29492L23.527 13.0004L23.527 3.58949ZM9.41246 17.7057L4.70703 13.0003L0.00159695 17.7057L9.41246 17.7057ZM0.00165601 17.7064L4.70704 22.4117L9.41241 17.7064L0.00165601 17.7064ZM9.41246 17.7064L14.1179 13.001L9.41247 8.29554L9.41246 17.7064ZM18.8226 17.7058L14.1172 13.0004L9.41181 17.7058L18.8226 17.7058ZM9.41181 8.2956L4.70643 13.001L9.41181 17.7064L9.41181 8.2956Z"/></svg>';
  const TICK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.3l2.3 2.3 4.7-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const root = $('#arch');
  const names = ['Classic', 'Sweep', 'Drift'];
  let v = 1, timers = [], raf = 0, seen = false, parts = null, lastW = 0;
  const at = (ms, fn) => { if (calm) fn(); else timers.push(setTimeout(fn, ms)); };
  const stop = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); raf = 0; };
  const add = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); const e = t.content.firstChild; root.appendChild(e); return e; };
  const rad = d => d * Math.PI / 180;

  const build = () => {
    stop();
    root.innerHTML = '';
    root.className = 'arch v' + v;
    root.parentElement.dataset.v = v;
    if (v === 1) return buildClassic();
    const W = root.clientWidth, phone = W < 700, half = W / 2;
    lastW = W;
    const R = phone ? 300 : Math.min(half - 6, 560), H = Math.round(R + 8), cx = half, by = H;
    root.style.height = H + 'px';
    const r2 = R * .8, r3 = R * .5, r4 = R * .3, rm = (r3 + r4) / 2, rl = R * .9, rc = R * .655;
    const pt = (r, deg) => [cx + r * Math.cos(rad(deg)), by - r * Math.sin(rad(deg))];
    const dome = r => `M${cx - r} ${by}A${r} ${r} 0 0 1 ${cx + r} ${by}Z`;
    const arc = (r, flip) => flip ? `M${cx + r} ${by}A${r} ${r} 0 0 0 ${cx - r} ${by}` : `M${cx - r} ${by}A${r} ${r} 0 0 1 ${cx + r} ${by}`;
    const org = `style="transform-origin:${cx}px ${by}px"`;

    /* Channel angles: an even spread on desktop, a tighter zigzag on phones */
    const c0 = phone ? Math.acos(Math.min(1, (half - 40) / (R * .72))) * 180 / Math.PI : 22;
    const chAt = CH.map((_, i) => ({ deg: 180 - c0 - i * (180 - 2 * c0) / (CH.length - 1), r: phone ? R * (i % 2 ? .64 : .72) : rc }));
    const spokes = chAt.slice(0, -1).map((a, i) => { const d = (a.deg + chAt[i + 1].deg) / 2, p = pt(r3, d), q = pt(r2, d); return `<path class="hair" d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}"/>`; }).join('');

    const midFill = v === 3 ? '#6C73FF' : '#E6E7FF', midLine = v === 3 ? 'rgba(255,255,255,.45)' : '#B5B9F8';
    root.insertAdjacentHTML('beforeend', `<svg class="bands" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs>
        <linearGradient id="ag" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${by}"><stop offset="0" stop-color="#ECECF7"/><stop offset=".7" stop-color="#F4F4FB"/><stop offset="1" stop-color="#F4F4FB" stop-opacity="0"/></linearGradient>
        <pattern id="ad" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.3" fill="#fff" fill-opacity=".24"/></pattern>
      </defs>
      <path class="bnd" data-b="3" ${org} d="${dome(R)}" fill="${v === 2 ? '#fff' : 'url(#ag)'}" ${v === 2 ? 'stroke="#E4E5F0" stroke-width="1.2"' : ''}/>
      <path class="bnd" data-b="2" ${org} d="${dome(r2)}" fill="#fff" stroke="#E4E5F0" stroke-width="1.2"/>
      ${spokes}
      <path class="bnd" data-b="1" ${org} d="${dome(r3)}" fill="${midFill}"/>
      <path class="hair" d="${arc(rm)}" style="stroke:${midLine}"/>
      <path class="bnd" data-b="0" ${org} d="${dome(r4)}" fill="#535BFE"/>
      <path class="bnd" data-b="0" ${org} d="${dome(r4)}" fill="url(#ad)"/>
      ${v === 2 ? `<path class="swp" data-s="0" pathLength="1" d="${arc(rl)}"/><path class="swp" data-s="1" pathLength="1" d="${arc(rc, true)}"/>` : ''}
    </svg>`);

    [.2, .14, .09].forEach((o, i) => add(`<span class="wf" style="--x:${cx}px;--y:${by}px;--d:${2 * r4}px;--k:${(R * 1.05 / r4).toFixed(2)};--o:${o};--i:${i}"></span>`));

    /* Platforms: as many as fit along the visible part of the outer band */
    const z = phone ? 38 : 46;
    const l0 = half >= rl + 44 ? 9 : Math.acos(Math.min(1, (half - z / 2 - 6) / rl)) * 180 / Math.PI;
    const n = v === 3 ? 12 : Math.min(12, Math.floor(rad(180 - 2 * l0) * rl / (phone ? 60 : 98)) + 1);
    const logos = D.slice(0, n).map(([name, m], i) => {
      const deg = 180 - l0 - i * (180 - 2 * l0) / (n - 1), p = pt(rl, deg);
      const e = add(`<span class="al" style="--z:${z}px;--x:${p[0]}px;--y:${p[1]}px"><span class="lt"><img src="assets/marks/${m}.png" alt="" draggable="false"><span class="bd">${TICK}</span></span><small>${name}</small></span>`);
      return { e, deg };
    });

    const zc = phone ? 36 : 56;
    const chans = CH.map(([name, icon], i) => {
      const p = pt(chAt[i].r, chAt[i].deg);
      return { e: add(`<span class="ach" style="--z:${zc}px;--x:${p[0]}px;--y:${p[1]}px"><span class="ai"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg></span><b>${name}</b></span>`), deg: chAt[i].deg };
    });

    const mid = add(`<div class="amid" style="--w:${phone ? 190 : Math.round(r3 * .95)}px;--x:${cx}px;--y:${by - r3 + (phone ? 12 : 24)}px"><strong>One platform</strong><span>${phone ? 'Setup, pacing, reporting, billing' : 'Setup, pacing, reporting and billing'}</span></div>`);
    const dots = [157, 133, 47, 23].map((deg, i) => { const p = pt(rm, deg); return add(`<span class="adot" style="--z:${phone ? 22 : 30}px;--x:${p[0]}px;--y:${p[1]}px"><svg viewBox="0 0 24 24" aria-hidden="true">${OPS[i]}</svg></span>`); });
    const mark = add(`<div class="amark" style="--w:${Math.round(r4 * .5)}px;--x:${cx}px;--y:${by - r4 * .64}px">${MARK}</div>`);

    parts = { logos, chans, mid, dots, mark, bands: $$('.bnd', root), hairs: $$('.hair', root), sweeps: $$('.swp', root), rl, cx, by };
    if (calm) { $$('.bnd,.hair,.al,.ach,.amid,.adot,.amark', root).forEach(e => e.classList.add('in')); }
  };


  /* Variation 1, Classic: full rings around a full purple circle. Logos ride the outer edge and
     turn slowly; the lower part of the rings fades out, so logos leave and re-enter the frame. */
  const KEEP = [1, 0, 2, 3]; /* Audio, Connected TV, Digital Out-of-Home, Video */
  const buildClassic = () => {
    const W = root.clientWidth, phone = W < 700, half = W / 2;
    lastW = W;
    const z = phone ? 44 : 54, top = z / 2 + 10;
    const R = phone ? 300 : Math.min(half - 56, 500), cx = half, cy = Math.round(top + R);
    const r2 = R * .8, r3 = R * .42, r4 = R * .17;
    const H = Math.round(cy + r4 + (phone ? 26 : 40));
    root.style.height = H + 'px';
    const pt = (r, deg) => [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))];
    const org = `style="transform-origin:${cx}px ${cy}px"`;
    const chDeg = phone ? [137, 108, 72, 43] : [156, 113, 67, 24], chR = phone ? [.63, .68, .68, .63] : [.62, .62, .62, .62];
    const spokes = [(chDeg[0] + chDeg[1]) / 2, 90, (chDeg[2] + chDeg[3]) / 2].map(d => { const p = pt(r3, d), q = pt(r2, d); return `<path class="hair" d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}"/>`; }).join('');

    root.insertAdjacentHTML('beforeend', `<svg class="bands" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs><linearGradient id="ag1" gradientUnits="userSpaceOnUse" x1="0" y1="${cy - R}" x2="0" y2="${cy}"><stop offset="0" stop-color="#EBEBF7"/><stop offset="1" stop-color="#F6F6FC"/></linearGradient></defs>
      <circle class="bnd" data-b="2" ${org} cx="${cx}" cy="${cy}" r="${R}" fill="url(#ag1)" stroke="#E2E3EF" stroke-width="1.2"/>
      <circle class="bnd" data-b="1" ${org} cx="${cx}" cy="${cy}" r="${r2}" fill="#fff" stroke="#E6E7F1" stroke-width="1.2"/>
      ${spokes}
      <circle class="bnd" data-b="0" ${org} cx="${cx}" cy="${cy}" r="${r3}" fill="#E8E9FF"/>
    </svg>`);
    [.2, .14, .09].forEach((o, i) => add(`<span class="wf" style="--x:${cx}px;--y:${cy}px;--d:${2 * r4}px;--k:${(R * 1.04 / r4).toFixed(2)};--o:${o};--i:${i}"></span>`));

    const logos = D.map(([name, m]) => ({ e: add(`<span class="al al--edge" style="--z:${z}px;--x:${cx}px;--y:${cy - R}px"><span class="lt"><img src="assets/marks/${m}.png" alt="" draggable="false"></span><small>${name}</small></span>`), deg: 0 }));

    const zc = phone ? 38 : 56;
    const chans = KEEP.map((k, i) => {
      const p = pt(R * chR[i], chDeg[i]);
      return { e: add(`<span class="ach" style="--z:${zc}px;--x:${p[0]}px;--y:${p[1]}px"><span class="ai"><svg viewBox="0 0 24 24" aria-hidden="true">${CH[k][1]}</svg></span><b>${CH[k][0]}</b></span>`), deg: chDeg[i] };
    });

    const mid = add(`<div class="amid amid--serif" style="--w:${phone ? 170 : 300}px;--x:${cx}px;--y:${cy - (r3 + r4) / 2}px"><strong>One platform<span>with AdLib</span></strong></div>`);
    add(`<div class="afade" style="--t:${cy - (phone ? 16 : 30)}px"></div>`);
    const core = add(`<div class="acore" style="--d:${2 * r4}px;--x:${cx}px;--y:${cy}px"></div>`);
    const mark = add(`<div class="amark amark--mid" style="--w:${Math.round(r4 * .58)}px;--x:${cx}px;--y:${cy}px">${MARK}</div>`);

    parts = { logos, chans, mid, dots: [], mark, core, bands: $$('.bnd', root), hairs: $$('.hair', root), sweeps: [], R, cx, cy };
    if (calm) {
      $$('.bnd,.hair,.al,.ach,.amid,.amark,.acore', root).forEach(e => e.classList.add('in'));
      logos.forEach((l, i) => { const p = pt(R, 105 - i * 30); l.e.style.setProperty('--x', p[0] + 'px'); l.e.style.setProperty('--y', p[1] + 'px'); });
    }
  };

  /* Logos travel the whole outer ring, thirty degrees apart, one slow turn every two minutes */
  const spin = () => {
    const { logos, R, cx, cy } = parts, t0 = performance.now();
    const place = t => {
      const base = (t - t0) / 120000 * 360;
      logos.forEach((l, i) => {
        const a = rad(105 - i * 30 - base);
        l.e.style.setProperty('--x', (cx + R * Math.cos(a)).toFixed(1) + 'px');
        l.e.style.setProperty('--y', (cy - R * Math.sin(a)).toFixed(1) + 'px');
      });
    };
    place(t0);
    logos.forEach(l => l.e.classList.add('live'));
    const step = t => { place(t); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  };

  /* Variation 3: logos travel along the outer band, so every platform passes through on any screen */
  const drift = () => {
    const { logos, rl, cx, by } = parts, t0 = performance.now(), N = logos.length;
    logos.forEach(l => l.e.classList.add('live'));
    const step = t => {
      const base = (t - t0) / 70000;
      logos.forEach((l, i) => {
        const p = ((i / N + base) % 1 + 1) % 1, deg = 188 - p * 196;
        const edge = Math.min(deg + 4, 184 - deg) / 14;
        l.e.style.setProperty('--x', cx + rl * Math.cos(rad(deg)) + 'px');
        l.e.style.setProperty('--y', by - rl * Math.sin(rad(deg)) + 'px');
        l.e.style.setProperty('--o', Math.max(0, Math.min(1, edge)).toFixed(3));
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const wave = () => {
    root.classList.remove('wave'); void root.offsetWidth; root.classList.add('wave');
    if (v !== 2) { at(520, () => parts.chans.forEach(c => c.e.classList.add('hit'))); at(1700, () => parts.chans.forEach(c => c.e.classList.remove('hit'))); }
  };
  const fire = p => { p.classList.remove('go'); void p.getBoundingClientRect(); p.classList.add('go'); };

  /* What keeps playing after the entrance */
  const cycle = () => {
    const { logos, chans, sweeps } = parts;
    if (v === 2) {
      logos.forEach(l => l.e.classList.remove('lit', 'ok'));
      chans.forEach(c => c.e.classList.remove('hit'));
      at(500, () => fire(sweeps[0]));
      logos.forEach(l => at(500 + (180 - l.deg) / 180 * 1900, () => l.e.classList.add('lit')));
      at(2450, () => sweeps[0].classList.remove('go'));
      at(2600, () => fire(sweeps[1]));
      chans.forEach(c => at(2600 + c.deg / 180 * 1900, () => c.e.classList.add('hit')));
      at(4550, () => sweeps[1].classList.remove('go'));
      at(4800, wave);
      at(5600, () => logos.forEach(l => l.e.classList.add('ok')));
      at(4800 + 2600 + 3000, cycle);
    } else {
      at(600, wave);
      at(600 + 2600 + 3000, cycle);
    }
  };

  const intro = () => {
    if (calm) return;
    const { logos, chans, mid, dots, mark, bands, hairs } = parts;
    bands.forEach(b => at(100 + (+b.dataset.b) * 220, () => b.classList.add('in')));
    if (parts.core) { at(100, () => parts.core.classList.add('in')); spin(); }
    at(350, () => mark.classList.add('in'));
    at(1000, () => hairs.forEach(e => e.classList.add('in')));
    chans.forEach((c, i) => at(1050 + i * 90, () => c.e.classList.add('in')));
    at(1300, () => mid.classList.add('in'));
    dots.forEach((e, i) => at(1350 + i * 90, () => e.classList.add('in')));
    logos.forEach((l, i) => at(1500 + i * 70, () => l.e.classList.add('in')));
    at(2700, () => { if (v === 3) drift(); cycle(); });
  };

  const buttons = $$('.switch [data-v]'), hint = $('#hint');
  const pick = n => {
    v = n;
    history.replaceState(null, '', '#' + n);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === n)));
    hint.textContent = names[n - 1];
    build();
    if (seen) intro();
  };
  buttons.forEach(b => b.addEventListener('click', () => pick(+b.dataset.v)));

  new IntersectionObserver((ents, io) => ents.forEach(e => { if (e.isIntersecting) { seen = true; io.disconnect(); intro(); } }), { threshold: .2 }).observe(root);
  let rz = 0;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (root.clientWidth !== lastW) { build(); if (seen) intro(); } }, 200); });

  pick(Math.min(3, Math.max(1, parseInt(location.hash.slice(1), 10) || 1)));
})();
