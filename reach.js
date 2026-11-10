/* Reach and data section: AdLib's second feature set as a timeline of animated in-app cards.
   It starts in AdLib purple, carrying on from the platform section above, and fades to white once you are into it. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reach = $('#reach'), platform = $('.platform');
  if (!reach) return;

  /* The second feature set, word for word from getadlib.com, in its original order */
  const F = [
    { n: '01', name: 'Premium Sites &amp; Apps', icon: 'shield',
      body: "Advertise in a high quality ecosystem that reaches real consumers across the world's most popular sites and apps." },
    { n: '02', name: 'Global Scale', icon: 'globe',
      body: "Reaching 95% of the world's consumers across 250+ countries and territories over 500 BILLION times a day." },
    { n: '03', name: 'Every Programmatic Ad Impression', icon: 'layers',
      body: 'Every major global media supply source across display, mobile, native, connected tv, audio, and digital out of home.' },
    { n: '04', name: 'Audience Targeting', icon: 'users',
      body: 'Every audience of every size and every type. Select from over 1,000,000 audience segments from 50+ data providers and target your own audiences from online and offline sources.' },
    { n: '05', name: 'First-Party Data Onboarding', icon: 'file',
      body: 'Easily onboard customer lists from email, postal, or phone sources, match them securely to digital IDs, and reach those audiences across CTV, display, mobile, and audio, and video.' },
    { n: '06', name: 'Meta Reporting Dashboard', icon: 'chart',
      body: 'Facebook and Instagram campaign data right alongside consolidated reporting from every major DSP.' }
  ];

  const ico = {
    globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
    tv: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
    news: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>',
    audio: '<svg viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>',
    display: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    native: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><rect x="6" y="7" width="5" height="5" rx="1"/><path d="M13 8h5M13 11h5M6 15h12"/></svg>',
    dooh: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="11" rx="1.5"/><path d="M9 15v5M15 15v5"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 21z"/><path d="M14 2.5V7h4"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.4 3.6 5.2"/></svg>',
    layers: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    call: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1C10.7 20 4 13.3 4 5a1 1 0 0 1 1-1z"/></svg>'
  };
  /* Solid versions of the same icons, used where a card asks for filled icons */
  const solid = {
    news: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4v2h10V7zm0 4v2h10v-2zm0 4v2h6v-2z',
    phone: 'M8.5 2h7A2.5 2.5 0 0 1 18 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2zM10 18v1.5h4V18z',
    tv: 'M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 15h8v2H8z',
    audio: 'M12 3a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a7 7 0 0 1 14 0h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9z',
    display: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 7v9h4v-9zm6 0v9h8v-9z',
    native: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4v5h5V7zm7 0v2h4V7zm0 3v2h4v-2zm-7 5v2h11v-2z',
    dooh: 'M4 3h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4v6h-2v-6h-4v6H8v-6H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    search: 'M10.5 3a7.5 7.5 0 0 1 6 12l4.3 4.3-1.5 1.5-4.3-4.3A7.5 7.5 0 1 1 10.5 3zm0 2.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
    file: 'M6 2h7v6h6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8.5.6l3.9 3.9h-3.9z',
    check: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1.2 13.6l6-6-1.4-1.4-4.6 4.6-2.2-2.2-1.4 1.4z',
    shield: 'M12 2l8.5 3.5v6.4c0 5.2-3.6 8.8-8.5 10.6-4.9-1.8-8.5-5.4-8.5-10.6V5.5zm-1.2 13.3l5.6-5.6-1.4-1.4-4.2 4.2-2-2-1.4 1.4z',
    chart: 'M3 20h18v2H3zM5 11h3v8H5zm5.5-7h3v15h-3zM16 13h3v6h-3z',
    users: 'M9 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm-7 16c.6-4.1 3.5-6.5 7-6.5s6.4 2.4 7 6.5zM16.5 4.3a4 4 0 0 1 0 7.4 6 6 0 0 0 0-7.4zM18 14c2.3.8 3.7 2.8 4 6h-3.6c-.3-2.4-1.1-4.4-2.6-5.9z',
    layers: 'M12 2l10 5.5L12 13 2 7.5zm-7.7 9.1L12 15.3l7.7-4.2L22 12.4 12 18 2 12.4zm0 5L12 20.3l7.7-4.2L22 17.4 12 23 2 17.4z',
    globe: 'M11 4.1c-1.6 1.9-2.6 4.6-2.8 7.4H4.1A8 8 0 0 1 11 4.1zm2 0a8 8 0 0 1 6.9 7.4h-4.1c-.2-2.8-1.2-5.5-2.8-7.4zm-2.8 7.4c.2-2.5 1-4.7 1.8-6 .8 1.3 1.6 3.5 1.8 6zm-6.1 1h4.1c.2 2.8 1.2 5.5 2.8 7.4a8 8 0 0 1-6.9-7.4zm6.1 0h3.6c-.2 2.5-1 4.7-1.8 6-.8-1.3-1.6-3.5-1.8-6zm5.6 0h4.1a8 8 0 0 1-6.9 7.4c1.6-1.9 2.6-4.6 2.8-7.4z',
    mail: 'M4 4h16a2 2 0 0 1 2 2v.3l-10 6.3L2 6.3V6a2 2 0 0 1 2-2zm-2 4.6l10 6.3 10-6.3V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z',
    pin: 'M12 2a7 7 0 0 1 7 7c0 5.3-7 13-7 13S5 14.3 5 9a7 7 0 0 1 7-7zm0 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    call: 'M6.6 2.5h3l1.8 4.6-2.3 1.6a11.5 11.5 0 0 0 6.2 6.2l1.6-2.3 4.6 1.8v3A2.6 2.6 0 0 1 18.9 21C10.6 21 3 13.4 3 5.1a2.6 2.6 0 0 1 3.6-2.6z'
  };
  let filled = false;
  const I = k => filled && solid[k] ? `<svg class="sf" viewBox="0 0 24 24"><path fill-rule="evenodd" d="${solid[k]}"/></svg>` : ico[k];
  const s = (i, html, cls = '') => `<div class="s ${cls}" style="--i:${i}">${html}</div>`;
  const head = (icon, title, pill) => s(0, `<span class="ac__t"><i class="ac__ic">${I(icon)}</i>${title}</span>${pill}`, 'ac__h');

  /* Six in-app cards. Figures marked sample are illustrative product states, not AdLib claims. */
  const CARD = [
    o => {
      const rows = [['news', 'News &amp; magazines', 'Display · Video', 92], ['phone', 'Sports apps', 'Mobile', 88], ['tv', 'Streaming', 'Connected TV', 95], ['audio', 'Podcasts', 'Audio', 90]].slice(0, o.compact ? 2 : 4);
      return head('shield', 'Premium inventory', `<span class="pill pill--good">${I('check')}Brand safe</span>`) +
        s(1, '<span>Placement</span><span>Viewability</span>', 'ac__lab') +
        rows.map((r, k) => s(k + 2, `<i class="ac__mono">${I(r[0])}</i><span class="ac__name">${r[1]}<small>${r[2]}</small></span><span class="ac__meter"><b data-count="${r[3]}" data-suffix="%">0%</b><span class="bar"><i data-w="${r[3]}"></i></span></span>`, 'ac__row')).join('') +
        s(rows.length + 2, `${I('check')}Verified by Integral Ad Science and DoubleVerify`, 'ac__foot');
    },
    o => {
      const reg = [['North America', 98], ['Europe', 96], ['Latin America', 93], ['Asia Pacific', 94], ['Middle East &amp; Africa', 89]];
      return head('globe', 'Daily reach', '<span class="pill">250+ countries</span>') +
        (o.noBig ? '' : s(1, '<b class="ac__big" data-count="500" data-suffix="B">0B</b><span>times a day</span>', 'ac__kpi')) +
        s(2, '<span>Region</span><span>Consumers reached</span>', 'ac__lab') +
        reg.map((r, k) => s(k + 3, `<span>${r[0]}</span><span class="bar"><i data-w="${r[1]}"></i></span><b data-count="${r[1]}" data-suffix="%">0%</b>`, 'ac__reg')).join('') +
        s(9, `${I('users')}Reaching 95% of the world's consumers`, 'ac__foot');
    },
    () => {
      const ch = [['display', 'Display'], ['phone', 'Mobile'], ['native', 'Native'], ['tv', 'Connected TV'], ['audio', 'Audio'], ['dooh', 'Digital out of home']];
      return head('layers', 'Supply channels', '<span class="pill"><b data-live>0</b> of 6 live</span>') +
        ch.map((c, k) => s(k + 1, `<i class="ac__mono">${I(c[0])}</i><span class="ac__name">${c[1]}</span><i class="tog" data-tog="${k}"></i>`, 'ac__row ac__row--tog')).join('') +
        s(8, `${I('check')}Every major global supply source, one buy`, 'ac__foot');
    },
    () => head('users', 'New audience', '<span class="pill pill--soft">Draft</span>') +
      s(1, `${I('search')}<span data-type="Sports fans aged 25 to 34"></span><i class="caret"></i>`, 'ac__input') +
      `<div class="ac__chips">${['Sports enthusiasts', 'Age 25 to 34', 'Streaming viewers'].map((c, k) => s(k + 2, `${I('check')}${c}`, 'chip2 chip2--on')).join('')}${s(5, '+ Your own list', 'chip2')}</div>` +
      s(6, '<div><span class="ac__cap">Estimated reach</span><b class="ac__big" data-count="18.2" data-dec="1" data-suffix="M">0M</b></div><span class="pill">1,000,000+ segments</span>', 'ac__split') +
      s(7, `${I('layers')}From 50+ data providers, plus your own audiences`, 'ac__foot'),
    () => head('file', 'Customer list', `<span class="pill pill--good">${I('check')}Secure match</span>`) +
      s(1, `<i class="ac__mono">${I('file')}</i><span class="ac__name">customers_q4.csv<small><span data-count="48210" data-sep="1">0</span> records</small></span><span class="pill pill--soft">Uploaded</span>`, 'ac__row') +
      s(2, '<span class="bar bar--lg"><i data-w="100"></i></span>') +
      `<div class="ac__chips">${[['mail', 'Email'], ['pin', 'Postal'], ['call', 'Phone']].map((c, k) => s(k + 3, `${I(c[0])}${c[1]}`, 'chip2')).join('')}</div>` +
      s(6, '<div><span class="ac__cap">Matched to digital IDs</span><b class="ac__big" data-count="72" data-suffix="%">0%</b></div><span class="pill">CTV · Display · Mobile · Audio · Video</span>', 'ac__split'),
    () => {
      const bars = [[38, 18], [52, 22], [44, 26], [66, 24], [58, 30], [74, 28], [82, 34]];
      return head('chart', 'Campaign report', '<span class="pill pill--soft">Last 7 days</span>') +
        s(1, '<span class="on">All DSPs</span><span>Facebook</span><span>Instagram</span>', 'seg2') +
        s(2, '<div><span class="ac__cap">Spend</span><b class="ac__big ac__big--sm" data-count="48250" data-prefix="$" data-sep="1">$0</b></div><div><span class="ac__cap">ROAS</span><b class="ac__big ac__big--sm" data-count="3.4" data-dec="1" data-suffix="x">0x</b></div>', 'ac__kpis') +
        s(3, bars.map(b => `<span><i class="a" data-h="${b[0]}"></i><i class="b" data-h="${b[1]}"></i></span>`).join(''), 'ac__chart') +
        s(4, '<span><i style="background:var(--purple)"></i>DSPs</span><span><i style="background:#C9CCFF"></i>Facebook + Instagram</span>', 'ac__legend');
    }
  ];
  const card = (i, o = {}) => {
    filled = !!o.filled;
    const html = `<div class="ac${filled ? ' ac--filled' : ''}" data-card="${i}">${CARD[i](o)}</div>`;
    filled = false;
    return html;
  };

  /* Card animation: counters, meters, toggles, typing and bars, all started when the card is shown */
  const fmt = (el, v) => {
    const dec = +(el.dataset.dec || 0), txt = el.dataset.sep ? Math.round(v).toLocaleString('en-US') : v.toFixed(dec);
    return (el.dataset.prefix || '') + txt + (el.dataset.suffix || '');
  };
  const reset = el => {
    (el._timers || []).forEach(clearTimeout);
    el._timers = [];
    cancelAnimationFrame(el._raf);
    el.classList.remove('in');
    $$('[data-count]', el).forEach(n => { n.textContent = fmt(n, 0); });
    $$('[data-w]', el).forEach(n => { n.style.width = '0'; });
    $$('[data-h]', el).forEach(n => { n.style.height = '0'; });
    $$('[data-tog]', el).forEach(n => n.classList.remove('on'));
    $$('[data-live]', el).forEach(n => { n.textContent = '0'; });
    $$('[data-type]', el).forEach(n => { n.textContent = ''; });
  };
  const later = (el, ms, fn) => el._timers.push(setTimeout(fn, calm ? 0 : ms));
  const play = el => {
    if (!el) return;
    reset(el);
    void el.offsetWidth;
    el.classList.add('in');
    later(el, 350, () => {
      const counts = $$('[data-count]', el), t0 = performance.now(), dur = calm ? 1 : 1300;
      const step = now => {
        const k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
        counts.forEach(n => { n.textContent = fmt(n, +n.dataset.count * e); });
        if (k < 1) el._raf = requestAnimationFrame(step);
      };
      el._raf = requestAnimationFrame(step);
    });
    $$('[data-w]', el).forEach((n, k) => later(el, 420 + k * 90, () => { n.style.width = n.dataset.w + '%'; }));
    $$('[data-h]', el).forEach((n, k) => later(el, 450 + Math.floor(k / 2) * 80, () => { n.style.height = n.dataset.h + '%'; }));
    const live = $('[data-live]', el);
    $$('[data-tog]', el).forEach((n, k) => later(el, 600 + k * 240, () => { n.classList.add('on'); if (live) live.textContent = k + 1; }));
    $$('[data-type]', el).forEach(n => {
      const text = n.dataset.type;
      [...text].forEach((ch, k) => later(el, 450 + k * 42, () => { n.textContent = text.slice(0, k + 1); }));
    });
  };
  const num = f => `<span class="num"><b>${f.n}</b>${f.name}</span>`;

  /* Timeline: the line draws as you scroll and each card lands on it */
  const line = $('#reachLine'), fill = $('#reachFill');
  line.insertAdjacentHTML('beforeend', F.map((f, i) => `<article class="item"><div class="item__txt">${num(f)}<h3>${f.name}</h3><p>${f.body}</p></div><i class="item__dot"></i><div class="item__card">${card(i, { filled: true })}</div></article>`).join(''));
  const items = $$('.item', line);
  $$('.ac', line).forEach(reset);

  const frame = () => {
    const r = line.getBoundingClientRect(), mark = innerHeight * .62;
    fill.style.height = clamp(mark - r.top, 0, r.height) + 'px';
    items.forEach(it => {
      if (!it.classList.contains('in') && it.getBoundingClientRect().top + 60 < mark) { it.classList.add('in'); play($('.ac', it)); }
    });
    /* Purple until the section has settled into view, then a gentle fade to white; scrolling back up reverses it */
    const light = reach.getBoundingClientRect().top < innerHeight * .18;
    reach.classList.toggle('light', light);
    /* The bottom of the purple section above fades with it, so the whole screen turns white together */
    if (platform) platform.classList.toggle('to-white', light);
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); } }, { passive: true });
  addEventListener('resize', frame);
  frame();
})();
