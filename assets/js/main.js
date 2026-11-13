/* Page orchestration: content render, boot, smooth scroll, scroll animations, interactions. */
(() => {
  const D = window.RVK_DATA, V = window.VIS;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = V.reduce, fine = matchMedia('(pointer:fine)').matches;
  const G = window.gsap && window.ScrollTrigger ? window.gsap : null;
  const html = document.documentElement;
  if (G) G.registerPlugin(ScrollTrigger); else html.classList.add('no-g');
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ───────── render content ───────── */
  $('#kpis').innerHTML = [['NYU GPA', 3.7, 1, '/4.0', .6], ['HACKATHONS', 4, 0, '+', .5], ['PROJECTS', 8, 0, '+', .7]].map(([l, n, d, s, dr], i) =>
    `<div class="kpi"><div class="l">${l}</div><div class="v"><span data-n="${n}" data-d="${d}">0</span><small>${s}</small></div>${V.spark(V.walk(28, i * 31 + 5, dr), '#2fd67b', 120, 24)}</div>`).join('');

  $('#sk').innerHTML = D.skills.map((s, i) => {
    const d = V.walk(30, i * 77 + 11, .45 + i * .08);
    return `<div class="srow" style="--c:${s.c}"><span class="ln">${i + 1}</span><span class="k">"${s.k}"<small>${s.sub} · ${s.items.length} items</small></span><div class="chips">${s.items.map(x => `<span>${x}</span>`).join('')}</div><div class="tz">${V.spark(d, '#2fd67b')}<span class="up">▲ ${V.pct(d)}%</span></div></div>`;
  }).join('');
  $('#m2').textContent = D.skills.reduce((a, s) => a + s.items.length, 0) + ' tools indexed';

  $('#pt').innerHTML = D.projects.map((p, i) => `<article class="pc">
    <div class="thumb"><canvas data-viz="${p.viz}" aria-hidden="true"></canvas><span class="lbl">fig.${i + 1}</span></div>
    <div class="body"><div class="mt"><span class="h">${p.hash}</span><span>${p.org}</span></div><h3>${p.title}</h3><p>${p.desc}</p>
    <div class="tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
    <div class="ft"><span>${p.m[0]} <b>${p.m[1]}</b></span>${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" data-cur="repo ↗">repo ↗</a>` : '<span>private</span>'}</div></div></article>`).join('');

  $('#tl').insertAdjacentHTML('beforeend', D.edu.map((e, i) => `<div class="ti"><span class="dot"></span><div class="w">${e.when}</div><h3>${e.school}</h3><div class="s">${e.sub}</div><div class="b">${e.body}</div><div class="gpa">${e.g}</div></div>`).join(''));

  // ticker tape + marquee content (duplicated for seamless loop)
  (() => {
    const t = ['PYTORCH', 'LANGGRAPH', 'OWLV2', 'SAM', 'RF-DETR', 'BEVFORMER', 'OPENCV', 'RAG', 'GEMINI', 'VERTEX', 'AZURE', 'DOCKER', 'SPARK', 'QDRANT', 'WEAVIATE', 'FASTAPI', 'LLAMA3', 'FFMPEG'];
    let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const h = t.map(k => { const u = r() > .2; return `<span class="tk"><b>${k}</b> <span class="px">${(r() * 900 + 100).toFixed(2)}</span> <span class="fl ${u ? 'up' : 'dn'}">${u ? '▲' : '▼'}${(r() * 4 + .2).toFixed(2)}%</span></span>`; }).join('');
    $('#tape').innerHTML = `<div class="tape-in">${h}${h}</div>`;
    const m = '<span>AI Engineer <em>✦</em></span><span>Computer Vision <em>✦</em></span><span>Multi-Agent Systems <em>✦</em></span><span>Generative AI <em>✦</em></span>';
    $('#marq').innerHTML = m + m;
  })();

  /* ───────── helpers ───────── */
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1800); }
  function copy(text) { if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('✓ copied ' + text + ' to clipboard'), () => location.href = 'mailto:' + text); else location.href = 'mailto:' + text; }
  $$('[data-copy]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); copy(a.dataset.copy); }));
  function counters(root) {
    $$('[data-n]', root).forEach(el => {
      if (el._d) return; el._d = 1; const n = +el.dataset.n, d = +(el.dataset.d || 0);
      if (reduce || !G) { el.textContent = n.toFixed(d); return; }
      const o = { v: 0 }; G.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => el.textContent = o.v.toFixed(d) });
    });
  }
  function drawSparks(root) { $$('.spark-l', root).forEach(p => { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength())); } catch (e) { } }); requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('drawn'))); }
  function scramble(el) {
    if (reduce) return; const txt = el.textContent, ch = '▓▒░<>/_#01'; let f = 0;
    (function s() { el.textContent = [...txt].map((c, i) => c === ' ' || i < f / 2 ? c : ch[(Math.random() * ch.length) | 0]).join(''); if (f++ / 2 <= txt.length) requestAnimationFrame(s); else el.textContent = txt; })();
  }
  const onEnter = (el, fn, start = 'top 85%') => {
    if (G) ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => fn(el) });
    else new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); fn(el); } }, { threshold: .15 }).observe(el);
  };

  /* ───────── boot loader ───────── */
  async function boot() {
    const b = $('#boot');
    if (!html.classList.contains('booting')) { b.remove(); return; }
    let skip = false; const sk = () => skip = true;
    addEventListener('keydown', sk, { once: true }); b.addEventListener('click', sk);
    const lines = $$('.l', b), bar = $('.bar i', b);
    for (let i = 0; i < lines.length && !skip; i++) { lines[i].classList.add('on'); bar.style.width = ((i + 1) / lines.length * 100) + '%'; await sleep(i === lines.length - 1 ? 260 : 130 + Math.random() * 90); }
    try { sessionStorage.setItem('rvk-boot', '1'); } catch (e) { }
    b.classList.add('done'); html.classList.remove('booting');
    setTimeout(() => b.remove(), 900); await sleep(380);
  }

  /* ───────── smooth scroll (Lenis) ───────── */
  let lenis = null, vel = 0;
  if (window.Lenis && G && !reduce) {
    lenis = new Lenis({ lerp: .1, wheelMultiplier: 1 });
    lenis.on('scroll', e => { ScrollTrigger.update(); vel = e.velocity || 0; });
    G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0);
  }
  const scrollTo = target => { const el = typeof target === 'string' ? $(target) : target; if (!el) return; lenis ? lenis.scrollTo(el, { offset: el.id === 'hero' ? -200 : -90, duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' }); };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const h = a.getAttribute('href'); if (h.length > 1) { e.preventDefault(); scrollTo(h); history.replaceState(null, '', h); } }));

  // header hides on scroll down, returns on scroll up
  (() => { let ly = 0; const hd = $('#hdr'); addEventListener('scroll', () => { const y = scrollY; hd.classList.toggle('hide', y > 300 && y > ly + 4); if (y < ly - 4 || y < 300) hd.classList.remove('hide'); ly = y; }, { passive: true }); })();

  /* ───────── hero ───────── */
  const nameEl = $('#name');
  const HERO_LIST = ['flow', 'terrain', 'net', 'swarm', 'lidar'], qp = new URLSearchParams(location.search).get('hero');
  const HERO = HERO_LIST.includes(qp) ? qp : (html.dataset.hero || 'net'), FX = window.HERO;
  if (new URLSearchParams(location.search).get('console') === 'off') html.classList.add('noconsole');
  async function typeRoles(el) {
    if (reduce) { el.textContent = D.roles[0]; return; }
    for (let i = 0; ; i++) { const r = D.roles[i % D.roles.length]; for (const c of r) { el.textContent += c; await sleep(48 + Math.random() * 30); } await sleep(2000); while (el.textContent.length) { el.textContent = el.textContent.slice(0, -1); await sleep(20); } await sleep(260); }
  }

  async function heroIntro() {
    if (G && !reduce) G.set('.h-in', { opacity: 0, y: 24 });
    if (!reduce) nameEl.classList.add('fx');
    await boot();
    try { await Promise.race([document.fonts.ready, sleep(1500)]); } catch (e) { }
    const bg = $('#herobg');
    if (HERO === 'lidar') V.lidar(bg); else if (HERO !== 'swarm') FX[HERO](bg);
    const PANEL_LIST = ['vision', 'pipeline', 'editor', 'system', 'tabs'], pq = new URLSearchParams(location.search).get('panel');
    const PANEL = PANEL_LIST.includes(pq) ? pq : (html.dataset.panel || 'tabs');
    window.PANELS[PANEL]($('#panel'), { title: s => { $('#ptitle').textContent = s; } });
    if (G && !reduce) G.to('.h-in', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .09, delay: .5 });
    try { if (HERO === 'swarm' && !reduce) await FX.swarm(nameEl); else await V.nameParticles(nameEl); } catch (e) { }
    nameEl.classList.remove('fx');
    typeRoles($('#role'));
    counters($('#kpis')); drawSparks($('#kpis'));
    // parallax: hero content drifts up as you scroll away
    if (G && !reduce) {
      G.to('.hero', { yPercent: -8, opacity: .25, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
      G.to('#herobg', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
  }
  heroIntro();

  // console tilts toward the cursor
  if (G && fine && !reduce) {
    const c = $('#console'), rx = G.quickTo(c, 'rotationX', { duration: .6, ease: 'power3' }), ry = G.quickTo(c, 'rotationY', { duration: .6, ease: 'power3' });
    G.set(c, { transformPerspective: 1100 });
    $('#hero').addEventListener('pointermove', e => { const b = c.getBoundingClientRect(); rx(-((e.clientY - b.top) / b.height - .5) * 7); ry(((e.clientX - b.left) / b.width - .5) * 9); });
    $('#hero').addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  /* ───────── scroll-driven section animations ───────── */
  function splitText(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(w => `<span class="w" aria-hidden="true">${[...w].map(c => `<span class="c">${c}</span>`).join('')}</span>`).join(' ');
    return $$('.c', el);
  }
  $$('.split').forEach(h => {
    const chars = splitText(h);
    if (G && !reduce) G.from(chars, { yPercent: 115, rotate: 8, opacity: 0, duration: .9, ease: 'power4.out', stagger: .018, scrollTrigger: { trigger: h, start: 'top 88%' } });
  });
  $$('.div').forEach(d => {
    const meta = $('.meta', d);
    if (G && !reduce) G.from($('.ln', d), { scaleX: 0, duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: d, start: 'top 92%' } });
    onEnter(d, () => meta && scramble(meta), 'top 92%');
  });
  if (G && !reduce) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.fromTo(b, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .1, overwrite: true }) });
  else $$('.rv').forEach(el => onEnter(el, e => e.classList.add('in')));

  // about: underline key phrases, git log lines type in
  $$('.ab p').forEach(p => onEnter(p, e => e.classList.add('lit'), 'top 75%'));
  if (G && !reduce) G.from('#gl li', { opacity: 0, x: 26, duration: .7, ease: 'power3.out', stagger: .12, scrollTrigger: { trigger: '#gl', start: 'top 82%' } });

  // skills table
  if (G && !reduce) {
    G.from('.srow', { opacity: 0, x: -30, duration: .8, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '#tbl', start: 'top 80%' } });
    $$('.srow').forEach(r => G.from($$('.chips span', r), { opacity: 0, scale: .7, y: 8, duration: .45, ease: 'back.out(2)', stagger: .025, scrollTrigger: { trigger: r, start: 'top 88%' } }));
  }
  onEnter($('#tbl'), drawSparks, 'top 75%');


  // projects: thumbnails, tilt, spotlight, horizontal pin on desktop
  $$('.pc canvas[data-viz]').forEach(c => V.thumb(c, c.dataset.viz));
  $$('.pc').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); });
  });
  if (G && !reduce) ScrollTrigger.batch('.pc', { start: 'top 88%', once: true, onEnter: b => G.fromTo(b, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .12, overwrite: true }) });

  // education: rail draws with scroll; dots + bars light up
  if (G && !reduce) G.to('#rail', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#tl', start: 'top 70%', end: 'bottom 55%', scrub: .6 } });
  else $('#rail').style.transform = 'scaleY(1)';
  $$('.ti').forEach(t => onEnter(t, e => { e.classList.add('in'); if (G && !reduce) G.from(e.children, { opacity: 0, x: 24, duration: .8, ease: 'power3.out', stagger: .07 }); }, 'top 78%'));

  // contact: heading rises in letter by letter
  (() => {
    const t = $('#lbt'), txt = t.textContent; t.setAttribute('aria-label', txt);
    t.innerHTML = [...txt].map(c => c === ' ' ? ' ' : `<span class="ch2" aria-hidden="true">${c}</span>`).join('');
    const lb = $('#lb');
    if (G && !reduce) G.from($$('.ch2', t), { yPercent: 100, opacity: 0, rotate: 10, duration: 1, ease: 'power4.out', stagger: .04, scrollTrigger: { trigger: lb, start: 'top 85%' } });
  })();

  // marquee + ticker move with scroll velocity
  (() => {
    const m = $('#marq'), tp = $('.tape-in'); let mx = 0, tx = 0, sk = 0;
    const tick = () => {
      const v = Math.max(-40, Math.min(40, vel));
      mx -= .6 + Math.abs(v) * .25; tx -= .35 + Math.abs(v) * .08; sk += (v * .25 - sk) * .1;
      const mw = m.scrollWidth / 2, tw = tp.scrollWidth / 2;
      if (-mx > mw) mx += mw; if (-tx > tw) tx += tw;
      m.style.transform = `translate3d(${mx}px,0,0) skewX(${-sk}deg)`; tp.style.transform = `translate3d(${tx}px,0,0)`;
      vel *= .92;
    };
    if (!reduce) (G ? G.ticker.add(tick) : (function f() { tick(); requestAnimationFrame(f); })());
    // occasional live price ticks
    if (!reduce) setInterval(() => {
      const ts = $$('.tk', tp), k = (Math.random() * ts.length / 2) | 0;
      [ts[k], ts[k + ts.length / 2]].forEach(el => { if (!el) return; const px = $('.px', el), fl = $('.fl', el), up = Math.random() > .35, v = (+px.textContent * (1 + (up ? 1 : -1) * Math.random() * .004)).toFixed(2);
        px.textContent = v; fl.className = 'fl ' + (up ? 'up' : 'dn'); fl.textContent = (up ? '▲' : '▼') + (Math.random() * 4 + .2).toFixed(2) + '%'; px.style.color = up ? 'var(--up)' : 'var(--dn)'; setTimeout(() => px.style.color = '', 600); });
    }, 900);
  })();

  /* ───────── nav: active section + sliding pill ───────── */
  (() => {
    const as = $$('#links a'), pill = $('#navpill');
    const set = id => { let hit = null; as.forEach(a => { const on = a.dataset.s === id; a.classList.toggle('on', on); if (on) hit = a; });
      if (hit) { pill.style.opacity = 1; pill.style.width = hit.offsetWidth + 'px'; pill.style.transform = `translateX(${hit.offsetLeft}px)`; } else pill.style.opacity = 0; };
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && set(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id]').forEach(s => io.observe(s));
  })();

  /* ───────── cursor glow, magnetic buttons ───────── */
  if (fine && !reduce) {
    const glow = $('#glow'); let x = -999, y = -999, gx = x, gy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    (function f() { gx += (x - gx) * .06; gy += (y - gy) * .06; glow.style.setProperty('--gx', gx + 'px'); glow.style.setProperty('--gy', gy + 'px'); requestAnimationFrame(f); })();
    $$('.mag').forEach(b => {
      const tx = G ? G.quickTo(b, 'x', { duration: .5, ease: 'power3' }) : null, ty = G ? G.quickTo(b, 'y', { duration: .5, ease: 'power3' }) : null;
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top; b.style.setProperty('--bx', dx + 'px'); b.style.setProperty('--by', dy + 'px'); if (tx) { tx((dx - r.width / 2) * .28); ty((dy - r.height / 2) * .35); } });
      b.addEventListener('pointerleave', () => { if (tx) { G.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' }); } });
    });
  }

  /* ───────── ⌘K command palette ───────── */
  const openPal = (() => {
    const items = [...$$('section[id]').map(s => [s.dataset.name, '#' + s.id, 'section']), ['copy email', D.links.email, 'action'], ['github', D.links.github, 'link'], ['linkedin', D.links.linkedin, 'link']];
    const bg = document.createElement('div'); bg.className = 'rvk-pal';
    bg.innerHTML = '<div class="rvk-pal-box" role="dialog" aria-label="Command menu"><input placeholder="Jump to…  (↑ ↓ ⏎)" autocomplete="off"><ul></ul><div class="rvk-pal-ft"><span>esc to close</span><span>⌘K / ctrl K</span></div></div>';
    document.body.appendChild(bg);
    const inp = $('input', bg), ul = $('ul', bg); let sel = 0, shown = items;
    const render = () => ul.innerHTML = shown.map((it, i) => `<li class="${i === sel ? 'sel' : ''}" data-i="${i}"><span>${it[0]}</span><em>${it[2]}</em></li>`).join('');
    const open = () => { bg.classList.add('open'); inp.value = ''; shown = items; sel = 0; render(); lenis && lenis.stop(); setTimeout(() => inp.focus(), 20); };
    const close = () => { bg.classList.remove('open'); lenis && lenis.start(); };
    const go = it => { close(); if (it[2] === 'section') scrollTo(it[1]); else if (it[2] === 'action') copy(it[1]); else window.open(it[1], '_blank', 'noopener'); };
    bg.onclick = e => { if (e.target === bg) close(); }; ul.onclick = e => { const li = e.target.closest('li'); if (li) go(shown[+li.dataset.i]); };
    inp.oninput = () => { const q = inp.value.toLowerCase(); shown = items.filter(i => i[0].toLowerCase().includes(q)); sel = 0; render(); };
    addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); bg.classList.contains('open') ? close() : open(); return; }
      if (!bg.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, shown.length - 1); render(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); render(); e.preventDefault(); }
      if (e.key === 'Enter' && shown[sel]) go(shown[sel]);
    });
    return open;
  })();
  $('#kb').onclick = openPal;

  /* ───────── interactive contact terminal ───────── */
  (() => {
    const out = $('#tout'), inp = $('#ti'), term = $('#term'), esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const cmds = {
      help: () => 'commands: whoami · skills · cv · projects · email · github · linkedin · resume · clear · sudo hire-me',
      whoami: () => 'Ritvik Vasantha Kumar — AI Engineer, MS CS @ NYU Tandon',
      skills: () => D.skills.map(s => `${s.k.padEnd(17)} ${s.items.slice(0, 4).join(', ')}…`).join('\n'),
      cv: () => 'computer_vision: ' + D.skills.find(s => s.k === 'computer_vision').items.join(', '),
      projects: () => D.projects.map(p => `${p.hash}  ${p.title}`).join('\n'),
      email: () => { copy(D.links.email); return `<a href="mailto:${D.links.email}">${D.links.email}</a> (copied ✓)`; },
      github: () => { open(D.links.github, '_blank', 'noopener'); return 'opening github.com/ritvikvk-ai …'; },
      linkedin: () => { open(D.links.linkedin, '_blank', 'noopener'); return 'opening linkedin.com/in/ritvik-vk …'; },
      resume: () => 'resume available on request → email rv2459@nyu.edu',
      'sudo hire-me': () => '[sudo] password for recruiter: ********\n✓ access granted. next step: email rv2459@nyu.edu',
      clear: () => { out.innerHTML = ''; return null; }
    };
    const hist = []; let hi = 0;
    term.addEventListener('click', () => inp.focus());
    $('#tf').addEventListener('submit', e => {
      e.preventDefault(); const v = inp.value.trim(); inp.value = ''; if (!v) return; hist.push(v); hi = hist.length;
      out.insertAdjacentHTML('beforeend', `<div><span class="p">$</span> ${esc(v)}</div>`);
      const f = cmds[v.toLowerCase()], r = f ? f() : null;
      if (f && r !== null) out.insertAdjacentHTML('beforeend', `<div class="o">${r}</div>`);
      if (!f) out.insertAdjacentHTML('beforeend', `<div class="e">zsh: command not found: ${esc(v)} (try help)</div>`);
      term.scrollTop = term.scrollHeight;
    });
    inp.addEventListener('keydown', e => { if (e.key === 'ArrowUp' && hist.length) { hi = Math.max(0, hi - 1); inp.value = hist[hi]; e.preventDefault(); } if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ''; } });
    // terminal input scrolls inside itself, not the page
    term.setAttribute('data-lenis-prevent', '');
  })();

  /* ───────── status bar: clock, market, epoch, fps ───────── */
  (() => {
    const clk = $('#clk'), mk = $('#mk2');
    const u = () => {
      const now = new Date(), t = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/New_York' });
      const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
      const g = k => p.find(x => x.type === k).value, m = (+g('hour') % 24) * 60 + +g('minute'), open = !['Sat', 'Sun'].includes(g('weekday')) && m >= 570 && m < 960;
      clk.innerHTML = `<i></i>NYC ${t}`; clk.classList.toggle('open', open); mk.innerHTML = `<i></i>NYSE ${open ? 'open' : 'closed'}`; mk.classList.toggle('open', open);
    }; u(); setInterval(u, 1000);
    const secs = $$('section[id]'), ep = $('#ep'), pb = $('#pbi'), loss = $('#loss');
    const e = () => { const h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? Math.min(scrollY / h, 1) : 0;
      ep.textContent = Math.min(secs.length, 1 + Math.floor(p * secs.length)) + '/' + secs.length; pb.style.width = p * 100 + '%'; loss.textContent = (.9 * Math.exp(-3.2 * p) + .031 + Math.sin(p * 40) * .004).toFixed(3); };
    addEventListener('scroll', e, { passive: true }); e();
    let fr = 0, lt = performance.now(); const fps = $('#fps'); (function f(t) { fr++; if (t - lt > 1000) { fps.textContent = fr; fr = 0; lt = t; } requestAnimationFrame(f); })(lt);
  })();

  // refresh trigger positions once fonts/layout settle
  if (G) { addEventListener('load', () => ScrollTrigger.refresh()); document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh()); }
})();
