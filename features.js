(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* The second feature set, word for word from getadlib.com, in its original order.
     Objects are stand-ins borrowed from other sections until dedicated ones are made. */
  const F = [
    { n: '01', name: 'Premium Sites &amp; Apps', img: 'tv', alt: 'A vintage television printed in halftone',
      body: "Advertise in a high quality ecosystem that reaches real consumers across the world's most popular sites and apps." },
    { n: '02', name: 'Global Scale', img: 'globe', alt: 'A desk globe printed in halftone',
      body: "Reaching 95% of the world's consumers across 250+ countries and territories over 500 BILLION times a day." },
    { n: '03', name: 'Every Programmatic Ad Impression', ui: true, alt: 'AdLib Supply Sources panel',
      body: 'Every major global media supply source across display, mobile, native, connected tv, audio, and digital out of home.' },
    { n: '04', name: 'Audience Targeting', img: 'megaphone', alt: 'A megaphone printed in halftone',
      body: 'Every audience of every size and every type. Select from over 1,000,000 audience segments from 50+ data providers and target your own audiences from online and offline sources.' },
    { n: '05', name: 'First-Party Data Onboarding', img: 'typewriter', alt: 'A typewriter printed in halftone',
      body: 'Easily onboard customer lists from email, postal, or phone sources, match them securely to digital IDs, and reach those audiences across CTV, display, mobile, and audio, and video.' },
    { n: '06', name: 'Meta Reporting Dashboard', img: 'radio', alt: 'A tabletop radio printed in halftone',
      body: 'Facebook and Instagram campaign data right alongside consolidated reporting from every major DSP.' }
  ];
  const obj = f => `assets/objects/${f.img}-cut.webp?v=13`;
  const UI = 'assets/ui/UI-Supply-Sources-1.png';
  const visual = (f, cls = '') => f.ui
    ? `<figure class="ui ${cls}"><img src="${UI}" alt="${f.alt}" width="717" height="1411" loading="lazy"></figure>`
    : `<img class="${cls}" src="${obj(f)}" alt="${f.alt}" width="1024" height="1024" loading="lazy">`;
  const num = f => `<span class="num"><b>${f.n}</b>${f.name}</span>`;
  const chips = list => `<div class="chips">${list.map(t => `<span class="chip">${t}</span>`).join('')}</div>`;

  /* 1 Numbers */
  $('#f1').innerHTML = `
    <article class="cell c-global">${num(F[1])}<p class="big">500B<small>times a day</small></p><p>${F[1].body}</p>
      <div class="stats"><div>95%<span>of the world's consumers</span></div><div>250+<span>countries and territories</span></div></div>${visual(F[1])}</article>
    <article class="cell c-aud">${num(F[3])}<p class="big">1,000,000+<small>audience segments from 50+ data providers</small></p><p>${F[3].body}</p></article>
    <article class="cell c-imp">${num(F[2])}<h3>Every channel</h3>${chips(['Display', 'Mobile', 'Native', 'Connected TV', 'Audio', 'Digital out of home'])}<p>${F[2].body}</p></article>
    <article class="cell c-prem">${visual(F[0])}${num(F[0])}<p>${F[0].body}</p></article>
    <article class="cell c-first">${num(F[4])}<div class="flow">${['Email', 'Postal', 'Phone'].map(t => `<span class="chip">${t}</span>`).join('')}<i>→</i><span class="chip to">Digital IDs</span><i>→</i>${['CTV', 'Display', 'Mobile', 'Audio', 'Video'].map(t => `<span class="chip">${t}</span>`).join('')}</div><p>${F[4].body}</p></article>
    <article class="cell c-meta">${num(F[5])}<p class="big">Facebook + Instagram<small>alongside every major DSP</small></p><p>${F[5].body}</p></article>`;

  /* 2 Product */
  const call = (f, i) => `<button type="button" class="call" data-i="${i}" aria-expanded="${!i}"><span class="call__t"><b>${f.n}</b>${f.name}</span><span class="call__p"><span>${f.body}</span></span></button>`;
  $('#f2l').innerHTML = F.slice(0, 3).map((f, i) => call(f, i)).join('');
  $('#f2r').innerHTML = F.slice(3).map((f, i) => call(f, i + 3)).join('');
  const calls = $$('#f2 .call'), stage2 = $('#f2'), shot = $('.f2__shot'), lines = $('#f2lines');
  const drawLines = () => {
    if (!stage2.offsetParent || getComputedStyle(lines).display === 'none') return;
    const S = stage2.getBoundingClientRect(), I = shot.getBoundingClientRect();
    lines.innerHTML = calls.map(c => {
      const r = c.getBoundingClientRect(), left = r.right < I.left + 1;
      const x1 = (left ? r.right : r.left) - S.left, y = r.top + r.height / 2 - S.top;
      const x2 = (left ? I.left + 26 : I.right - 26) - S.left, y2 = clamp(y, I.top - S.top + 60, I.bottom - S.top - 120);
      const on = c.getAttribute('aria-expanded') === 'true';
      return `<path d="M${x1} ${y} C${(x1 + x2) / 2} ${y} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}" style="opacity:${on ? 1 : .45}"/><circle cx="${x2}" cy="${y2}" r="${on ? 5 : 3.5}"/>`;
    }).join('');
  };
  calls.forEach(c => c.addEventListener('click', () => {
    calls.forEach(x => x.setAttribute('aria-expanded', String(x === c)));
    drawLines();
    setTimeout(drawLines, 520);
  }));

  /* 3 Scroll */
  $('#f3c').innerHTML = F.map((f, i) => `<article class="${i ? '' : 'on'}"><h3>${f.name}</h3><p>${f.body}</p></article>`).join('');
  $('#f3s').innerHTML = F.map((f, i) => f.ui
    ? `<figure class="${i ? '' : 'on'}"><div class="ui"><img src="${UI}" alt="${f.alt}" width="717" height="1411" loading="lazy"></div></figure>`
    : `<figure class="${i ? '' : 'on'}"><img src="${obj(f)}" alt="${f.alt}" width="1024" height="1024" loading="lazy"></figure>`).join('');
  $('#f3b').innerHTML = F.map(() => '<i><b></b></i>').join('');
  const f3 = $('.f3'), f3copy = $$('#f3c article'), f3fig = $$('#f3s figure'), f3bars = $$('#f3b b'), f3n = $('#f3n');
  let f3cur = 0;
  const scrollFrame = () => {
    const top = parseFloat(getComputedStyle($('.f3__stick')).top) || 72;
    const span = f3.offsetHeight - (innerHeight - top);
    const p = clamp((top - f3.getBoundingClientRect().top) / span, 0, .9999) * F.length;
    const i = Math.floor(p);
    f3bars.forEach((b, k) => { b.style.transform = `scaleX(${clamp(p - k, 0, 1).toFixed(3)})`; });
    if (i === f3cur) return;
    f3cur = i;
    f3n.textContent = F[i].n;
    [f3copy, f3fig].forEach(g => g.forEach((el, k) => el.classList.toggle('on', k === i)));
  };

  /* 4 Index */
  $('#f4').innerHTML = F.map((f, i) => `<div class="row${i ? '' : ' open'}">
      <button type="button" class="row__h" aria-expanded="${!i}"><b>${f.n}</b><span>${f.name}</span><i aria-hidden="true"></i></button>
      <div class="row__b"><div><div class="row__inner"><p>${f.body}</p><div class="row__vis${f.ui ? ' ui' : ''}">${f.ui ? `<img src="${UI}" alt="${f.alt}" width="717" height="1411" loading="lazy">` : `<img src="${obj(f)}" alt="${f.alt}" width="1024" height="1024" loading="lazy">`}</div></div></div></div>
    </div>`).join('');
  const rows = $$('#f4 .row');
  rows.forEach(r => $('.row__h', r).addEventListener('click', () => {
    const opening = !r.classList.contains('open');
    rows.forEach(x => { const on = x === r && opening; x.classList.toggle('open', on); $('.row__h', x).setAttribute('aria-expanded', String(on)); });
  }));

  /* 5 Gallery */
  const tones = ['t-purple', 't-tint', 't-navy', 't-tint', 't-purple', 't-navy'];
  $('#f5').innerHTML = `<div class="pane pane--intro"><p class="eyebrow">Reach &amp; data</p><h2 class="ftitle">Every screen. Every audience. One platform.</h2><p class="hint">Keep scrolling →</p></div>` +
    F.map((f, i) => `<article class="pane ${tones[i]}"><div><p class="big">${f.n}</p><h3>${f.name}</h3><p>${f.body}</p></div>${f.ui ? `<figure class="ui"><img src="${UI}" alt="${f.alt}" width="717" height="1411" loading="lazy"></figure>` : `<img src="${obj(f)}" alt="${f.alt}" width="1024" height="1024" loading="lazy">`}</article>`).join('');
  const f5 = $('.f5'), track = $('#f5');
  const galleryFrame = () => {
    const top = parseFloat(getComputedStyle($('.f5__stick')).top) || 72;
    const span = f5.offsetHeight - (innerHeight - top);
    /* A short hold at each end, so the heading is read before the walk starts */
    const p = clamp(((top - f5.getBoundingClientRect().top) / span - .06) / .88, 0, 1);
    const travel = Math.max(0, track.scrollWidth - innerWidth);
    track.style.transform = `translateX(${(-travel * p).toFixed(1)}px)`;
  };

  /* Concept switch */
  const sections = $$('.fv[data-v]'), buttons = $$('.switch [data-v]'), hint = $('#hint');
  const names = ['Numbers', 'Product', 'Scroll', 'Index', 'Gallery'];
  let mode = clamp(parseInt(location.hash.slice(1), 10) || 1, 1, 5);
  const onScroll = () => {
    if (mode === 3) scrollFrame();
    if (mode === 5) galleryFrame();
  };
  const pick = n => {
    mode = n;
    history.replaceState(null, '', '#' + n);
    sections.forEach(s => s.classList.toggle('on', +s.dataset.v === n));
    buttons.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === n)));
    hint.textContent = names[n - 1];
    scrollTo({ top: 0, behavior: 'instant' });
    f3cur = -1;
    if (n === 2) requestAnimationFrame(drawLines);
    onScroll();
  };
  buttons.forEach(b => b.addEventListener('click', () => pick(+b.dataset.v)));
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', () => { if (mode === 2) drawLines(); onScroll(); });
  addEventListener('load', () => { if (mode === 2) drawLines(); });
  document.fonts.ready.then(() => { if (mode === 2) drawLines(); });
  pick(mode);
})();
