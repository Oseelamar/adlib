(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* AdLib's G2 reviews as they appear on getadlib.com. Longer ones are cut to whole sentences, never reworded. */
  const R = [
    { name: 'Gian A.', role: 'Senior Director', c: ['#EEE9FE', '#6A45DC'],
      q: "AdLib makes it easy to run campaigns across the world's top DSPs. We know its broad mix of channels, creative formats, and inventory partners will never hold us back, which gives us the confidence to deliver exactly what our clients expect." },
    { name: 'Joe M.', role: 'G2 reviewer', c: ['#FDEBDC', '#D35A10'],
      q: 'Ease of use in a domain where simplicity is rare.' },
    { name: 'Pedro Paulo M.', role: 'Head of Media Operations', c: ['#E3EDFE', '#2161D6'],
      q: 'The on-boarding process is easy, transparent and very quick. The interface is intuitive, and it provides a seamless experience from campaign setup to optimization.' },
    { name: 'Napoleon P.', role: 'AD Operation Specialist', c: ['#DCF3F2', '#0A8585'],
      q: 'Multiple DSPs are available on the ADLIB Platform. We can run YouTube ads in ADLIB I have never seen such an option in any other DSPs.' },
    { name: 'Sushil C.', role: 'Vice President', c: ['#FDE5E2', '#D2433A'],
      q: 'Most Helpful Team. Best Tech. Prompt Response.' },
    { name: 'German "Yerman" T.', role: 'Co-Founder & CEO', c: ['#FBF0D6', '#A87106'],
      q: 'The targeting capabilities are impressive, allowing us to reach the right audience segments with pinpoint accuracy, enabling us to make data-driven decisions effortlessly.' },
    { name: 'Emily C.', role: 'Content Marketing Manager', c: ['#E2F5E9', '#16834A'],
      q: "AdLib DSP Is a great platform that helps us with outreach further than our normal ad platforms that we use. It's easy to set up campaigns." },
    { name: 'Verified User', role: 'Marketing and Advertising', c: ['#EEEEFF', '#535BFE'],
      q: 'Using AdLib has been a game-changer. The interface is incredibly user-friendly, allowing me to manage multiple ad campaigns with ease.' }
  ];
  const G2 = 'assets/badges/g2-logo-png_seeklogo-407782-1.png';
  const initials = n => n.replace(/"[^"]+"/, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const who = r => `<span class="who"><i class="av" style="--bg:${r.c[0]};--fg:${r.c[1]}">${initials(r.name)}</i><span><b>${r.name}</b><span>${r.role}</span></span></span>`;
  const star = '<svg viewBox="0 0 20 20"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.500 7.7l5.9-.8z"/></svg>';
  const card = (r, i, cls = '') => `<figure class="rv rise ${cls}" style="--i:${i}"><div class="rv__top"><span class="stars" aria-label="G2 review">${star.repeat(5)}</span><img src="${G2}" alt="G2" width="22" height="22"></div><blockquote>${r.q}</blockquote><figcaption>${who(r)}</figcaption></figure>`;

  const headHTML = `<div><p class="eyebrow">Don't take our word for it</p><h2>Trusted by agencies, growth marketers, and performance teams worldwide.</h2></div>`;
  const scoreHTML = `<div class="score"><img src="${G2}" alt="G2" width="34" height="34"><b>4.7 / 5</b><span>on G2, from verified<br>AdLib users</span></div>`;
  const medalsHTML = `<div class="medals">${[['grid-leader-spring-2025.png', 'G2 Grid Leader'], ['momentum-leader-fall-2026.png', 'G2 Momentum Leader'], ['users-love-us.png', 'G2 Users Love Us'], ['easiet-to-use-summer-2025.png', 'G2 Easiest To Use']].map(m => `<img src="assets/badges/${m[0]}" alt="${m[1]}" loading="lazy">`).join('')}</div>`;
  $$('[data-head]').forEach(el => { el.innerHTML = el.classList.contains('thead--row') ? headHTML + `<div class="rise" style="--i:1">${scoreHTML}</div>` : `<div class="thead" style="margin:0">${headHTML.replace(/^<div>|<\/div>$/g, '')}${scoreHTML}</div>`; });
  $$('[data-score]').forEach(el => { el.innerHTML = scoreHTML; });
  $$('[data-medals]').forEach(el => { el.innerHTML = medalsHTML; });

  /* 1 Wall */
  $('#t1').innerHTML = R.map((r, i) => card(r, i % 3, i === 0 || i === 4 ? 'rv--lg' : '')).join('');

  /* 2 Spotlight */
  $('#t2q').innerHTML = R.map((r, i) => `<figure class="${i ? '' : 'on'}"><blockquote class="${r.q.length > 150 ? 'long' : ''}">${r.q}</blockquote><figcaption>${who(r)}</figcaption></figure>`).join('');
  $('#t2p').innerHTML = R.map((r, i) => `<button type="button" role="tab" aria-selected="${!i}">${who(r)}</button>`).join('');
  const t2q = $$('#t2q figure'), t2p = $$('#t2p button');
  t2p.forEach((b, i) => b.addEventListener('click', () => {
    t2p.forEach((x, k) => x.setAttribute('aria-selected', String(k === i)));
    t2q.forEach((x, k) => x.classList.toggle('on', k === i));
  }));

  /* 3 Rail */
  const rail = $('#t3');
  rail.innerHTML = R.map((r, i) => card(r, Math.min(i, 3), 'rv--lg')).join('');
  const railCards = $$('.rv', rail), t3count = $('#t3count');
  const railIndex = () => { const l = rail.getBoundingClientRect().left; let best = 0, d = Infinity; railCards.forEach((c, i) => { const x = Math.abs(c.getBoundingClientRect().left - l); if (x < d) { d = x; best = i; } }); return best; };
  const railGo = i => { const c = railCards[clamp(i, 0, R.length - 1)]; rail.scrollTo({ left: c.offsetLeft - rail.offsetLeft, behavior: 'smooth' }); };
  $('#t3prev').addEventListener('click', () => railGo(railIndex() - 1));
  $('#t3next').addEventListener('click', () => railGo(railIndex() + 1));
  rail.addEventListener('scroll', () => { t3count.textContent = `${railIndex() + 1} / ${R.length}`; }, { passive: true });

  /* 4 Stack */
  const deck = $('#t4');
  deck.innerHTML = R.map(r => card(r, 0, 'rv--lg').replace('rv rise', 'rv')).join('');
  const deckCards = $$('.rv', deck), t4count = $('#t4count');
  let cur = 0;
  const lay = from => {
    deckCards.forEach((c, k) => { const pos = (k - cur + R.length) % R.length; c.dataset.pos = k === from ? 'out' : pos < 3 ? String(pos) : 'x'; });
    if (from !== undefined) setTimeout(() => { const pos = (from - cur + R.length) % R.length; deckCards[from].dataset.pos = pos < 3 ? String(pos) : 'x'; }, 480);
    t4count.textContent = `${cur + 1} / ${R.length}`;
  };
  $('#t4next').addEventListener('click', () => { const from = cur; cur = (cur + 1) % R.length; lay(from); });
  $('#t4prev').addEventListener('click', () => { cur = (cur - 1 + R.length) % R.length; lay(); });
  lay();

  /* 5 Headline */
  $('#t5big').innerHTML = 'Ease of use in a domain where <em>simplicity is rare.</em>';
  $('#t5by').innerHTML = who(R[1]);
  $('#t5').innerHTML = [R[0], R[2], R[5]].map((r, i) => card(r, i)).join('');

  /* Entrances */
  const io = new IntersectionObserver(ents => ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });

  /* Layout switch */
  const sections = $$('.tv[data-v]'), buttons = $$('.switch [data-v]'), hint = $('#hint');
  const names = ['Wall', 'Spotlight', 'Rail', 'Stack', 'Headline'];
  const pick = n => {
    history.replaceState(null, '', '#' + n);
    sections.forEach(s => s.classList.toggle('on', +s.dataset.v === n));
    buttons.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === n)));
    hint.textContent = names[n - 1];
    scrollTo({ top: 0, behavior: 'instant' });
    $$('.rise', $(`.tv[data-v="${n}"]`)).forEach(el => { el.classList.remove('in'); io.unobserve(el); requestAnimationFrame(() => io.observe(el)); });
    if (n === 3) { rail.scrollLeft = 0; t3count.textContent = `1 / ${R.length}`; }
    if (n === 4) { cur = 0; lay(); }
  };
  buttons.forEach(b => b.addEventListener('click', () => pick(+b.dataset.v)));
  pick(clamp(parseInt(location.hash.slice(1), 10) || 1, 1, 5));
})();
