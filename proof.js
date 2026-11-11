(() => {
  const deck = document.querySelector('#deck');
  if (!deck) return;

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
  const star = '<svg viewBox="0 0 20 20"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z"/></svg>';
  deck.innerHTML = R.map(r => `<figure class="rv"><div class="rv__top"><span class="stars" aria-label="G2 review">${star.repeat(5)}</span><img src="${G2}" alt="G2" width="22" height="22" loading="lazy"></div><blockquote>${r.q}</blockquote><figcaption><span class="who"><i class="av" style="--bg:${r.c[0]};--fg:${r.c[1]}">${initials(r.name)}</i><span><b>${r.name}</b><span>${r.role}</span></span></span></figcaption></figure>`).join('');

  const cards = [...deck.querySelectorAll('.rv')], count = document.querySelector('#deckCount');
  let cur = 0;
  const lay = from => {
    cards.forEach((c, k) => { const pos = (k - cur + R.length) % R.length; c.dataset.pos = k === from ? 'out' : pos < 3 ? String(pos) : 'x'; });
    if (from !== undefined) setTimeout(() => { const pos = (from - cur + R.length) % R.length; cards[from].dataset.pos = pos < 3 ? String(pos) : 'x'; }, 480);
    count.textContent = `${cur + 1} / ${R.length}`;
  };
  document.querySelector('#deckNext').addEventListener('click', () => { const from = cur; cur = (cur + 1) % R.length; lay(from); });
  document.querySelector('#deckPrev').addEventListener('click', () => { cur = (cur - 1 + R.length) % R.length; lay(); });
  lay();
})();
