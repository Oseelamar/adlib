(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* AdLib's own copy for the four points */
  const ITEMS = [
    { n: '01', label: 'Simplicity', img: 'wrench', alt: 'An adjustable wrench printed in halftone',
      head: "Programmatic doesn't have to be complicated.",
      body: 'AdLib eliminates the tech barriers so marketers can execute and scale instantly.' },
    { n: '02', label: 'Automation', img: 'stopwatch', alt: 'A stopwatch printed in halftone',
      head: 'No more manual trafficking. No more spreadsheet chaos.',
      body: 'Our platform automates campaign setup, pacing, optimization, and reporting, saving hours every week.' },
    { n: '03', label: 'Premium Inventory', img: 'tv', alt: 'A vintage television printed in halftone',
      head: 'Netflix, YouTube TV, Spotify, Amazon Prime, Paramount+, and curated PMPs.',
      body: 'Access top-tier supply without enterprise minimums. Always-on brand, privacy, &amp; fraud protection from Integral Ad Science, Double Verify, Peer39, and Jounce.' },
    { n: '04', label: 'Growth Partnership', img: 'megaphone', alt: 'A megaphone printed in halftone',
      head: "We're not just a platform, we're your growth partner.",
      body: 'Our team helps you win new business, expand budgets, and deliver measurable ROI that keeps clients coming back.' }
  ];
  const src = it => `assets/objects/${it.img}-cut.webp?v=10`;
  const tag = it => `<span class="tag"><b>${it.n}</b>${it.label}</span>`;

  /* 1 Bento */
  $('#w1').innerHTML = ITEMS.map((it, i) => i === 3
    ? `<article class="card c4"><div>${tag(it)}<h3>${it.head}</h3><p>${it.body}</p></div><img src="${src(it)}" alt="${it.alt}" width="1024" height="1024"></article>`
    : `<article class="card c${i + 1}">${tag(it)}<h3>${it.head}</h3><p>${it.body}</p><img src="${src(it)}" alt="${it.alt}" width="1024" height="1024"></article>`).join('');

  /* 2 Sticky */
  $('#w2l').innerHTML = ITEMS.map((it, i) => `<li${i ? '' : ' class="on"'}>${it.label}</li>`).join('');
  $('#w2b').innerHTML = ITEMS.map(it => `<article class="w2__block"><img src="${src(it)}" alt="${it.alt}" width="1024" height="1024">${tag(it)}<h3>${it.head}</h3><p>${it.body}</p></article>`).join('');
  const w2blocks = $$('.w2__block'), w2labels = $$('#w2l li'), w2n = $('#w2n');
  const stickyFrame = () => {
    const mid = innerHeight * .5;
    let best = 0, bestD = Infinity;
    w2blocks.forEach((b, i) => {
      const r = b.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid);
      b.style.opacity = matchMedia('(max-width: 900px)').matches ? '' : (.22 + .78 * clamp(1 - d / (innerHeight * .45), 0, 1)).toFixed(3);
      if (d < bestD) { bestD = d; best = i; }
    });
    w2n.textContent = ITEMS[best].n;
    w2labels.forEach((l, i) => l.classList.toggle('on', i === best));
  };

  /* 3 Panels */
  $('#w3').innerHTML = ITEMS.map((it, i) => `<article class="pan${i ? '' : ' open'}">
      <button type="button" class="pan__head" aria-expanded="${!i}"><b>${it.n}</b><span>${it.label}</span></button>
      <div class="pan__body"><div>${tag(it)}<h3>${it.head}</h3><p>${it.body}</p></div><img src="${src(it)}" alt="${it.alt}" width="1024" height="1024"></div>
    </article>`).join('');
  const pans = $$('#w3 .pan');
  pans.forEach(p => p.addEventListener('click', () => {
    pans.forEach(q => { q.classList.toggle('open', q === p); $('.pan__head', q).setAttribute('aria-expanded', String(q === p)); });
  }));

  /* 4 Stage */
  $('#w4t').insertAdjacentHTML('beforeend', ITEMS.map((it, i) => `<button type="button" class="tab" role="tab" aria-selected="${!i}">
      <span class="tab__t"><b>${it.n}</b>${it.label}</span><span class="tab__p"><span>${it.body}</span></span>
    </button>`).join(''));
  $('#w4s').innerHTML = ITEMS.map((it, i) => `<div class="scene${i ? '' : ' on'}"><img src="${src(it)}" alt="${it.alt}" width="1024" height="1024"><h3>${it.head}</h3></div>`).join('');
  const tabs = $$('#w4t .tab'), scenes = $$('#w4s .scene'), bar = $('#w4bar');
  const placeBar = () => {
    const t = tabs.find(x => x.getAttribute('aria-selected') === 'true');
    bar.style.height = t.offsetHeight + 'px';
    bar.style.transform = `translateY(${t.offsetTop}px)`;
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    tabs.forEach((x, k) => x.setAttribute('aria-selected', String(k === i)));
    scenes.forEach((s, k) => s.classList.toggle('on', k === i));
    requestAnimationFrame(placeBar);
    setTimeout(placeBar, 560);
  }));

  /* 5 Manifesto */
  $('#w5t').innerHTML = ITEMS.map(it => `<span class="s"><span class="lab">${it.n} ${it.label}</span>${it.head}</span>`).join(' ');
  $('#w5d').innerHTML = ITEMS.map(() => '<i></i>').join('');
  const w5 = $('.w5'), sents = $$('#w5t .s'), dots = $$('#w5d i'), w5b = $('#w5b');
  let w5cur = -1;
  const manifestoFrame = () => {
    const r = w5.getBoundingClientRect(), span = w5.offsetHeight - (innerHeight - 72);
    const p = clamp((72 - r.top) / span, 0, .9999);
    const i = Math.floor(p * ITEMS.length);
    if (i === w5cur) return;
    w5cur = i;
    sents.forEach((s, k) => { s.classList.toggle('past', k < i); s.classList.toggle('on', k === i); });
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    w5b.style.opacity = 0;
    setTimeout(() => { w5b.innerHTML = ITEMS[i].body; w5b.style.opacity = 1; }, 160);
  };

  /* Layout switch */
  const sections = $$('.wv[data-v]'), buttons = $$('.switch [data-v]'), hint = $('#hint');
  const names = ['Bento', 'Sticky', 'Panels', 'Stage', 'Manifesto'];
  let mode = clamp(parseInt(location.hash.slice(1), 10) || 1, 1, 5);
  const onScroll = () => {
    if (mode === 2) stickyFrame();
    if (mode === 5) manifestoFrame();
  };
  const pick = n => {
    mode = n;
    history.replaceState(null, '', '#' + n);
    sections.forEach(s => s.classList.toggle('on', +s.dataset.v === n));
    buttons.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === n)));
    hint.textContent = names[n - 1];
    scrollTo({ top: 0, behavior: 'instant' });
    w5cur = -1;
    if (n === 4) placeBar();
    onScroll();
  };
  buttons.forEach(b => b.addEventListener('click', () => pick(+b.dataset.v)));
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', () => { if (mode === 4) placeBar(); onScroll(); });
  document.fonts.ready.then(() => { if (mode === 4) placeBar(); });
  pick(mode);
})();
