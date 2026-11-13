/* Canvas visuals: LiDAR hero, particle name, CV demo, project thumbnails. */
window.VIS = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = () => Math.min(devicePixelRatio || 1, 2);
  const MONO = '"Geist Mono", ui-monospace, monospace';

  /* fit a canvas to its CSS box; returns {cx,w,h} and keeps it updated */
  function fit(cv, onResize) {
    const s = { cx: cv.getContext('2d'), w: 0, h: 0 };
    const r = () => {
      const b = cv.getBoundingClientRect(), d = DPR();
      s.w = b.width; s.h = b.height; cv.width = Math.max(1, b.width * d); cv.height = Math.max(1, b.height * d);
      s.cx.setTransform(d, 0, 0, d, 0, 0); onResize && onResize(s);
    };
    new ResizeObserver(r).observe(cv); r();
    return s;
  }
  /* run a draw loop only while the canvas is on screen and the tab is visible */
  function loop(cv, draw) {
    let vis = false, raf = 0, t0 = performance.now();
    const tick = t => { raf = requestAnimationFrame(tick); draw((t - t0) / 1000); };
    const set = v => { if (v && !raf && !document.hidden) raf = requestAnimationFrame(tick); if (!v && raf) { cancelAnimationFrame(raf); raf = 0; } };
    new IntersectionObserver(es => { vis = es[0].isIntersecting; set(vis); }, { rootMargin: '80px' }).observe(cv);
    document.addEventListener('visibilitychange', () => set(vis && !document.hidden));
    if (reduce) requestAnimationFrame(() => draw(2.5));
    return { stop: () => set(false) };
  }
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function walk(n, seed, drift = .4) { let v = 50, a = [], r = rng(seed * 7 + 3); for (let i = 0; i < n; i++) { v += (r() - .5) * 6 + drift; a.push(v); } return a; }
  function spark(d, col, w = 110, h = 30) {
    const mn = Math.min(...d), mx = Math.max(...d);
    const p = d.map((v, i) => `${(i / (d.length - 1) * w).toFixed(1)},${(h - 3 - (v - mn) / (mx - mn || 1) * (h - 6)).toFixed(1)}`).join(' ');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline class="spark-l" fill="none" style="stroke:${col}" stroke-width="1.5" points="${p}"/></svg>`;
  }
  const pct = d => ((d[d.length - 1] - d[0]) / d[0] * 100).toFixed(1);

  /* ─────────────── LiDAR point cloud (hero background) ─────────────── */
  function lidar(cv) {
    const s = fit(cv);
    const small = innerWidth < 760;
    const r = rng(42), P = [];
    // ground returns: concentric rings like a spinning sensor, spacing grows with range
    for (let i = 0, rad = 3; rad < 34; i++, rad *= small ? 1.16 : 1.11) {
      const n = Math.round((small ? 70 : 130) + rad * 2);
      for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + r() * .01; P.push({ x: Math.cos(a) * rad, y: (r() - .5) * .06, z: Math.sin(a) * rad, kind: 0 }); }
    }
    // buildings along both sides of the street
    for (const side of [-1, 1]) for (let z = -30; z < 30; z += small ? 1 : .6) {
      const ht = 4 + (Math.sin(z * .37 + side) + 1) * 3;
      for (let y = 0; y < ht; y += small ? .9 : .55) if (r() > .25) P.push({ x: side * (13 + r() * .2), y, z, kind: 1 });
    }
    // trees
    for (let t = 0; t < 7; t++) {
      const tx = (t % 2 ? 1 : -1) * (9.5 + r()), tz = -26 + t * 8 + r() * 2;
      for (let k = 0; k < (small ? 40 : 90); k++) { const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1), rr = 1.6; P.push({ x: tx + rr * Math.sin(v) * Math.cos(u), y: 3.4 + rr * Math.cos(v) * .8, z: tz + rr * Math.sin(v) * Math.sin(u), kind: 2 }); }
      for (let y = 0; y < 2.6; y += .3) P.push({ x: tx, y, z: tz, kind: 2 });
    }
    // dynamic objects (cars + pedestrians) described as boxes; their points are sampled on the surface each frame
    const objs = [
      { x: -3.4, z: -18, l: 4.6, w: 1.9, h: 1.5, v: 4.2, lbl: 'car', c: '#c8ff2e' },
      { x: 3.4, z: 12, l: 4.4, w: 1.9, h: 1.6, v: -3.2, lbl: 'car', c: '#c8ff2e' },
      { x: -3.4, z: 10, l: 6.5, w: 2.4, h: 2.8, v: 3.0, lbl: 'truck', c: '#ffb000' },
      { x: 7.6, z: -6, l: .6, w: .6, h: 1.8, v: .9, lbl: 'ped', c: '#ff4fa3' },
      { x: -7.6, z: 4, l: .6, w: .6, h: 1.75, v: -.7, lbl: 'ped', c: '#ff4fa3' }
    ];
    objs.forEach(o => { o.pts = []; const n = o.lbl === 'ped' ? 40 : (small ? 80 : 160); for (let k = 0; k < n; k++) { const f = Math.floor(r() * 5); const a = r() - .5, b = r(); o.pts.push(f === 0 ? [a, b, -.5] : f === 1 ? [a, b, .5] : f === 2 ? [-.5, b, a] : f === 3 ? [.5, b, a] : [a, 1, b - .5]); } });

    let mx = 0, my = 0, tmx = 0, tmy = 0;
    addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });
    const cols = [[200, 255, 46], [90, 216, 255], [167, 139, 250]];
    const lerpC = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

    let last = 0;
    return loop(cv, t => {
      const { cx, w, h } = s; if (!w) return;
      const dt = Math.min(.05, t - last); last = t;
      mx += (tmx - mx) * .05; my += (tmy - my) * .05;
      cx.clearRect(0, 0, w, h);
      const yaw = (reduce ? .6 : t * .045) + mx * .5, pitch = .36 + my * .12, dist = 30;
      const cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const f = Math.min(w, h * 1.6) * .9, ox = w * (w > 900 ? .66 : .5), oy = h * .56;
      const proj = (x, y, z) => {
        const x1 = x * cy_ - z * sy_, z1 = x * sy_ + z * cy_;
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp + dist;
        if (z2 < 1) return null; return [ox + f * x1 / z2, oy - f * (y2 - 2.2) / z2, z2];
      };
      const sweep = (t * 1.8) % (Math.PI * 2);
      // range rings
      cx.lineWidth = 1;
      for (const rr of [10, 20, 30]) {
        cx.beginPath(); let first = true;
        for (let k = 0; k <= 64; k++) { const a = k / 64 * Math.PI * 2, p = proj(Math.cos(a) * rr, 0, Math.sin(a) * rr); if (!p) { first = true; continue; } first ? cx.moveTo(p[0], p[1]) : cx.lineTo(p[0], p[1]); first = false; }
        cx.strokeStyle = '#ffffff10'; cx.stroke();
        const lp = proj(rr, 0, 0); if (lp) { cx.fillStyle = '#ffffff30'; cx.font = `10px ${MONO}`; cx.fillText(rr + 'm', lp[0] + 4, lp[1]); }
      }
      // sweep beam
      const b0 = proj(0, 0, 0), b1 = proj(Math.cos(sweep) * 32, 0, Math.sin(sweep) * 32);
      if (b0 && b1) { const g = cx.createLinearGradient(b0[0], b0[1], b1[0], b1[1]); g.addColorStop(0, '#c8ff2e55'); g.addColorStop(1, '#c8ff2e00'); cx.strokeStyle = g; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(b0[0], b0[1]); cx.lineTo(b1[0], b1[1]); cx.stroke(); }
      const draw = (x, y, z) => {
        const p = proj(x, y, z); if (!p) return;
        let a = Math.atan2(z, x); if (a < 0) a += Math.PI * 2;
        let d = sweep - a; if (d < 0) d += Math.PI * 2;
        const hot = d < .5 ? 1 - d / .5 : 0;
        const rng_ = Math.hypot(x, z) / 32;
        const c = rng_ < .5 ? lerpC(cols[0], cols[1], rng_ * 2) : lerpC(cols[1], cols[2], (rng_ - .5) * 2);
        const al = Math.max(.08, Math.min(.85, 1.4 - p[2] / 45)) * (.45 + hot * .55);
        const sz = (hot > .4 ? 2.2 : 1.3) * Math.min(1.6, 30 / p[2]);
        cx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${al.toFixed(3)})`; cx.fillRect(p[0], p[1], sz, sz);
      };
      for (const q of P) draw(q.x, q.y, q.z);
      // moving objects + 3D boxes
      for (const o of objs) {
        if (!reduce) { o.z += o.v * dt; if (o.z > 30) o.z = -30; if (o.z < -30) o.z = 30; }
        for (const [a, b, c] of o.pts) draw(o.x + a * o.w, b * o.h, o.z + c * o.l);
      }
      // ego vehicle
      const e = [[-1, -2.2], [1, -2.2], [1, 2.2], [-1, 2.2]].map(([x, z]) => proj(x, 0, z));
      if (e.every(Boolean)) { cx.strokeStyle = '#c8ff2e'; cx.lineWidth = 1.5; cx.beginPath(); e.forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1])); cx.closePath(); cx.stroke(); }
    });
  }

  /* ─────────────── name: particles assemble into the text ─────────────── */
  function nameParticles(nameEl) {
    return new Promise(res => {
      if (reduce) return res();
      const words = [...nameEl.querySelectorAll('.tx')];
      const nb = nameEl.getBoundingClientRect(), PAD = 60;
      const cv = document.createElement('canvas'); cv.id = 'namefx';
      Object.assign(cv.style, { left: -PAD + 'px', top: -PAD + 'px', width: Math.ceil(nb.width + PAD * 2) + 'px', height: Math.ceil(nb.height + PAD * 2) + 'px' });
      nameEl.appendChild(cv);
      const d = DPR(), W = Math.ceil(nb.width + PAD * 2), H = Math.ceil(nb.height + PAD * 2);
      cv.width = W * d; cv.height = H * d; const cx = cv.getContext('2d'); cx.setTransform(d, 0, 0, d, 0, 0);
      // rasterise the words off-screen at their exact positions, then sample filled pixels
      const off = document.createElement('canvas'); off.width = W; off.height = H; const oc = off.getContext('2d', { willReadFrequently: true });
      const cs = getComputedStyle(words[0]);
      oc.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; if ('letterSpacing' in oc) oc.letterSpacing = cs.letterSpacing;
      oc.textBaseline = 'alphabetic'; oc.fillStyle = '#fff';
      const fs = parseFloat(cs.fontSize);
      words.forEach(wd => { const b = wd.getBoundingClientRect(); oc.fillText(wd.textContent, b.left - nb.left + PAD, b.top - nb.top + PAD + fs * .78); });
      const img = oc.getImageData(0, 0, W, H).data, pts = [], step = fs > 80 ? 4 : 3;
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (img[(y * W + x) * 4 + 3] > 140) pts.push([x, y]);
      const cols = ['#fafbfc', '#fafbfc', '#c8ff2e', '#5ad8ff', '#ffb000'];
      const parts = pts.map(([x, y]) => {
        const a = Math.random() * Math.PI * 2, r = 200 + Math.random() * 500;
        return { tx: x, ty: y, sx: x + Math.cos(a) * r + 300, sy: y + Math.sin(a) * r * .6, delay: Math.random() * .45 + (x / W) * .35, c: cols[(Math.random() * cols.length) | 0] };
      });
      const dur = 1.25, t0 = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 4);
      (function frame(now) {
        const t = (now - t0) / 1000; cx.clearRect(0, 0, W, H);
        let done = true;
        for (const p of parts) {
          const k = Math.max(0, Math.min(1, (t - p.delay) / dur)); if (k < 1) done = false;
          const e = ease(k), x = p.sx + (p.tx - p.sx) * e, y = p.sy + (p.ty - p.sy) * e;
          cx.globalAlpha = Math.min(1, k * 3); cx.fillStyle = k > .9 ? '#fafbfc' : p.c; cx.fillRect(x, y, step - .6, step - .6);
        }
        if (!done) return requestAnimationFrame(frame);
        nameEl.classList.remove('fx');
        cv.style.transition = 'opacity .6s'; cv.style.opacity = 0;
        setTimeout(() => cv.remove(), 700); res();
      })(t0);
    });
  }

  /* ─────────────── CV demo: detect / segment / track / open-vocab query ─────────────── */
  function cvDemo(cv, info, getMode) {
    const s = fit(cv);
    const cols = ['#c8ff2e', '#5ad8ff', '#ffb000', '#ff4fa3'];
    const O = [
      { n: 'car', x: .06, y: .58, w: .24, h: .2, vx: .045, sh: 0 },
      { n: 'person', x: .62, y: .38, w: .07, h: .34, vx: -.028, sh: 1 },
      { n: 'bicycle', x: .34, y: .53, w: .14, h: .22, vx: .033, sh: 2 },
      { n: 'person', x: .84, y: .41, w: .065, h: .31, vx: -.018, sh: 1 },
      { n: 'dog', x: .2, y: .7, w: .08, h: .1, vx: .05, sh: 3 }
    ].map((o, i) => ({ ...o, id: i + 1, c: cols[i % 4], tr: [] }));
    const names = ['DETECT · RF-DETR', 'SEGMENT · SAM', 'TRACK · multi-object', 'QUERY · OWLv2 "a person"'];
    function shape(cx, o, X, Y, w, h) {
      cx.beginPath();
      if (o.sh === 0) { cx.rect(X, Y + h * .35, w, h * .42); cx.rect(X + w * .2, Y + h * .05, w * .55, h * .32); cx.moveTo(X + w * .22 + h * .16, Y + h * .82); cx.arc(X + w * .22, Y + h * .82, h * .16, 0, 7); cx.moveTo(X + w * .78 + h * .16, Y + h * .82); cx.arc(X + w * .78, Y + h * .82, h * .16, 0, 7); }
      else if (o.sh === 1) { cx.moveTo(X + w * .5 + w * .33, Y + h * .1); cx.arc(X + w / 2, Y + h * .1, w * .33, 0, 7); cx.rect(X + w * .18, Y + h * .2, w * .64, h * .45); cx.rect(X + w * .2, Y + h * .65, w * .22, h * .35); cx.rect(X + w * .58, Y + h * .65, w * .22, h * .35); }
      else if (o.sh === 2) { cx.moveTo(X + h * .44, Y + h * .76); cx.arc(X + h * .22, Y + h * .76, h * .22, 0, 7); cx.moveTo(X + w, Y + h * .76); cx.arc(X + w - h * .22, Y + h * .76, h * .22, 0, 7); cx.rect(X + w * .32, Y, w * .32, h * .55); }
      else { cx.rect(X, Y + h * .2, w * .8, h * .5); cx.rect(X + w * .7, Y, w * .3, h * .4); cx.rect(X + w * .05, Y + h * .7, w * .12, h * .3); cx.rect(X + w * .6, Y + h * .7, w * .12, h * .3); }
    }
    let last = 0;
    return loop(cv, t => {
      const { cx, w: W, h: H } = s; if (!W) return;
      const dt = Math.min(.05, t - last); last = t;
      const forced = getMode ? getMode() : -1;
      const mode = forced >= 0 ? forced : (reduce ? 0 : Math.floor(t / 3.6) % 4);
      cx.fillStyle = '#050607'; cx.fillRect(0, 0, W, H);
      // road perspective
      cx.strokeStyle = '#ffffff10'; cx.lineWidth = 1;
      for (let i = 0; i < 11; i++) { cx.beginPath(); cx.moveTo(W / 2, H * .3); cx.lineTo(i / 10 * W * 2 - W * .5, H); cx.stroke(); }
      for (let i = 0; i < 6; i++) { const yy = H * .3 + Math.pow((i + (t * .6 % 1)) / 6, 2) * H * .7; cx.beginPath(); cx.moveTo(0, yy); cx.lineTo(W, yy); cx.strokeStyle = '#ffffff08'; cx.stroke(); }
      let shown = 0;
      for (const o of O) {
        if (!reduce) { o.x += o.vx * dt; if (o.x > 1.02) o.x = -o.w; if (o.x < -o.w - .02) o.x = 1; }
        const X = o.x * W, Y = o.y * H, w = o.w * W, h = o.h * H;
        const q = mode === 3 && o.n !== 'person';
        shape(cx, o, X, Y, w, h); cx.fillStyle = mode === 1 && !q ? o.c + '70' : '#363b43'; cx.fill();
        if (q) continue; shown++;
        if (mode === 1) { shape(cx, o, X, Y, w, h); cx.strokeStyle = o.c; cx.lineWidth = 1; cx.stroke(); }
        if (mode === 2) {
          o.tr.push([X + w / 2, Y + h]); if (o.tr.length > 80) o.tr.shift();
          cx.lineWidth = 1.5; for (let i = 1; i < o.tr.length; i++) { cx.strokeStyle = o.c + Math.round(i / o.tr.length * 255).toString(16).padStart(2, '0'); cx.beginPath(); cx.moveTo(...o.tr[i - 1]); cx.lineTo(...o.tr[i]); cx.stroke(); }
        } else o.tr = [];
        if (mode !== 1) { cx.strokeStyle = o.c; cx.lineWidth = 1.5; cx.strokeRect(X, Y, w, h); }
        const lab = mode === 2 ? `${o.n} #${o.id}` : mode === 3 ? `"a person" ${(0.79 + o.id * .035).toFixed(2)}` : mode === 1 ? `${o.n} mask` : `${o.n} ${(0.9 + ((o.id * 13) % 9) / 100).toFixed(2)}`;
        cx.font = `600 10px ${MONO}`; const tw = cx.measureText(lab).width + 8;
        cx.fillStyle = o.c; cx.fillRect(X - .75, Y - 14, tw, 14); cx.fillStyle = '#000'; cx.fillText(lab, X + 3, Y - 4);
      }
      // scanline
      const sy = (t * 90) % (H + 40) - 20; const g = cx.createLinearGradient(0, sy - 20, 0, sy); g.addColorStop(0, '#c8ff2e00'); g.addColorStop(1, '#c8ff2e14'); cx.fillStyle = g; cx.fillRect(0, sy - 20, W, 20);
      if (info) info.textContent = `▶ ${names[mode]} · ${shown} obj · ${(13.5 + Math.sin(t * 2) * 1.4).toFixed(1)} ms`;
      s.mode = mode;
    });
  }

  /* ─────────────── project thumbnails ─────────────── */
  const thumbs = {
    agents(cx, w, h, t) {
      const N = ['research', 'codegen', 'review', 'test', 'security'];
      const P = N.map((n, i) => [w * (.14 + i * .18), h * (.5 + (i % 2 ? -.18 : .18))]);
      cx.strokeStyle = '#ffffff22'; cx.lineWidth = 1; cx.beginPath(); P.forEach((p, i) => i ? cx.lineTo(...p) : cx.moveTo(...p)); cx.stroke();
      cx.beginPath(); cx.moveTo(...P[4]); cx.quadraticCurveTo(w * .5, h * .02, ...P[1]); cx.setLineDash([3, 4]); cx.stroke(); cx.setLineDash([]);
      const k = (t * .45) % 1, seg = Math.floor(k * 4), u = k * 4 - seg, a = P[seg], b = P[seg + 1];
      P.forEach((p, i) => {
        const act = i === seg || (i === seg + 1 && u > .9);
        cx.fillStyle = act ? '#c8ff2e' : '#15181c'; cx.strokeStyle = act ? '#c8ff2e' : '#5d6570'; cx.beginPath(); cx.arc(p[0], p[1], act ? 9 : 7, 0, 7); cx.fill(); cx.stroke();
        cx.fillStyle = act ? '#fafbfc' : '#8e96a1'; cx.font = `11px ${MONO}`; cx.fillText(N[i], p[0] - 22, p[1] + (i % 2 ? -16 : 24));
      });
      cx.fillStyle = '#fff'; cx.shadowColor = '#c8ff2e'; cx.shadowBlur = 10; cx.beginPath(); cx.arc(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 3, 0, 7); cx.fill(); cx.shadowBlur = 0;
    },
    voice(cx, w, h, t) {
      const n = 48, bw = w * .6 / n;
      for (let i = 0; i < n; i++) { const v = Math.abs(Math.sin(i * .5 + t * 4) * Math.sin(i * .13 + t * 1.3)) * h * .45 + 2; cx.fillStyle = i / n < (t * .3 % 1) ? '#5ad8ff' : '#2a2f36'; cx.fillRect(w * .06 + i * bw, h * .5 - v / 2, bw * .6, v); }
      const txt = 'Once upon a time, in a city of glass…', k = Math.floor((t * 14) % (txt.length + 20));
      cx.fillStyle = '#d9dde3'; cx.font = `12px ${MONO}`; cx.fillText(txt.slice(0, k), w * .06, h * .88);
      for (let i = 0; i < 3; i++) { const on = (t * .5 + i * .33) % 1; const x = w * (.7 + i * .09), y = h * .2; cx.fillStyle = `rgba(167,139,250,${.15 + on * .5})`; cx.fillRect(x, y, w * .075, h * .55); cx.strokeStyle = '#a78bfa'; cx.strokeRect(x, y, w * .075, h * .55); }
      cx.fillStyle = '#8e96a1'; cx.fillText('text · image · voice', w * .7, h * .88);
    },
    robot(cx, w, h, t) {
      const g = 16; cx.strokeStyle = '#ffffff0c'; for (let x = 0; x < w; x += g) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, h); cx.stroke(); } for (let y = 0; y < h; y += g) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(w, y); cx.stroke(); }
      cx.fillStyle = '#2a2f36'; [[.3, .1, .06, .5], [.55, .45, .25, .08], [.75, .1, .05, .3]].forEach(([x, y, a, b]) => cx.fillRect(x * w, y * h, a * w, b * h));
      const path = [[.08, .85], [.2, .85], [.2, .7], [.45, .7], [.45, .3], [.9, .3], [.9, .8]];
      cx.strokeStyle = '#c8ff2e55'; cx.setLineDash([4, 4]); cx.beginPath(); path.forEach(([x, y], i) => i ? cx.lineTo(x * w, y * h) : cx.moveTo(x * w, y * h)); cx.stroke(); cx.setLineDash([]);
      const L = path.slice(1).map((p, i) => Math.hypot((p[0] - path[i][0]) * w, (p[1] - path[i][1]) * h)), tot = L.reduce((a, b) => a + b);
      let d = (t * 60) % tot, i = 0; while (d > L[i]) d -= L[i++]; const a = path[i], b = path[i + 1], u = d / L[i];
      const rx = (a[0] + (b[0] - a[0]) * u) * w, ry = (a[1] + (b[1] - a[1]) * u) * h;
      for (let k = 0; k < 24; k++) { const an = k / 24 * Math.PI * 2 + t; cx.strokeStyle = '#5ad8ff22'; cx.beginPath(); cx.moveTo(rx, ry); cx.lineTo(rx + Math.cos(an) * 40, ry + Math.sin(an) * 40); cx.stroke(); }
      cx.fillStyle = '#c8ff2e'; cx.beginPath(); cx.arc(rx, ry, 5, 0, 7); cx.fill();
      cx.font = `11px ${MONO}`; cx.fillStyle = '#8e96a1'; cx.fillText('retrieved: nav2/costmap.md · 0.91', 10, 16);
    },
    vectors(cx, w, h, t) {
      if (!thumbs._v) { const r = rng(9); thumbs._v = []; [[.25, .35, '#5ad8ff'], [.7, .3, '#a78bfa'], [.5, .72, '#ffb000']].forEach(([x, y, c]) => { for (let i = 0; i < 26; i++) thumbs._v.push([x + (r() - .5) * .28, y + (r() - .5) * .3, c]); }); }
      const q = [.5 + Math.cos(t * .5) * .22, .5 + Math.sin(t * .7) * .2];
      const near = thumbs._v.map(p => [Math.hypot((p[0] - q[0]) * w, (p[1] - q[1]) * h), p]).sort((a, b) => a[0] - b[0]).slice(0, 5);
      near.forEach(([d, p]) => { cx.strokeStyle = '#c8ff2e80'; cx.beginPath(); cx.moveTo(q[0] * w, q[1] * h); cx.lineTo(p[0] * w, p[1] * h); cx.stroke(); });
      thumbs._v.forEach(p => { const n = near.some(x => x[1] === p); cx.fillStyle = n ? '#fafbfc' : p[2] + '99'; cx.beginPath(); cx.arc(p[0] * w, p[1] * h, n ? 3.2 : 2.2, 0, 7); cx.fill(); });
      const rr = (t * 40) % 50; cx.strokeStyle = `rgba(200,255,46,${1 - rr / 50})`; cx.beginPath(); cx.arc(q[0] * w, q[1] * h, rr, 0, 7); cx.stroke();
      cx.fillStyle = '#c8ff2e'; cx.beginPath(); cx.arc(q[0] * w, q[1] * h, 4.5, 0, 7); cx.fill();
      cx.font = `11px ${MONO}`; cx.fillStyle = '#8e96a1'; cx.fillText('query → top-5 · cosine ' + (0.84 + Math.sin(t) * .05).toFixed(2), 10, 16);
    },
    candles(cx, w, h, t) {
      const n = 34, cw = w / n, off = (t * 8) % cw, base = Math.floor(t * 8 / cw);
      for (let i = -1; i < n + 1; i++) {
        const k = i + base, r = rng(k * 31 + 7), o = .5 + Math.sin(k * .3) * .15 + (r() - .5) * .1, c = o + (r() - .5) * .14, hi = Math.min(o, c) - r() * .06, lo = Math.max(o, c) + r() * .06;
        const x = i * cw - off, up = c < o, anom = k % 23 === 0;
        cx.strokeStyle = cx.fillStyle = anom ? '#ff5d5d' : up ? '#2fd67b' : '#3a4049';
        cx.beginPath(); cx.moveTo(x + cw / 2, hi * h); cx.lineTo(x + cw / 2, lo * h); cx.stroke(); cx.fillRect(x + cw * .2, Math.min(o, c) * h, cw * .6, Math.max(2, Math.abs(c - o) * h));
        if (anom) { cx.strokeStyle = '#ff5d5d'; cx.lineWidth = 1.5; cx.strokeRect(x - 4, hi * h - 8, cw + 8, (lo - hi) * h + 16); cx.lineWidth = 1; cx.font = `600 10px ${MONO}`; cx.fillStyle = '#ff5d5d'; cx.fillRect(x - 4, hi * h - 22, 82, 14); cx.fillStyle = '#000'; cx.fillText('anomaly 0.85', x - 1, hi * h - 12); }
      }
    },
    caption(cx, w, h, t) {
      const iw = w * .42, ih = h * .78, ix = 12, iy = (h - ih) / 2;
      const g = cx.createLinearGradient(0, iy, 0, iy + ih); g.addColorStop(0, '#1b2a3a'); g.addColorStop(1, '#2a2f36'); cx.fillStyle = g; cx.fillRect(ix, iy, iw, ih);
      cx.fillStyle = '#ffb000'; cx.beginPath(); cx.arc(ix + iw * .75, iy + ih * .25, 10, 0, 7); cx.fill();
      cx.fillStyle = '#3a4a3a'; cx.beginPath(); cx.moveTo(ix, iy + ih * .75); cx.lineTo(ix + iw * .35, iy + ih * .4); cx.lineTo(ix + iw * .6, iy + ih * .65); cx.lineTo(ix + iw * .8, iy + ih * .5); cx.lineTo(ix + iw, iy + ih * .7); cx.lineTo(ix + iw, iy + ih); cx.lineTo(ix, iy + ih); cx.fill();
      const ax = ix + ((Math.sin(t * .9) + 1) / 2) * iw, ay = iy + ((Math.cos(t * .6) + 1) / 2) * ih; const rg = cx.createRadialGradient(ax, ay, 0, ax, ay, 40); rg.addColorStop(0, '#c8ff2e66'); rg.addColorStop(1, '#c8ff2e00'); cx.fillStyle = rg; cx.fillRect(ix, iy, iw, ih);
      cx.strokeStyle = '#c8ff2e'; cx.strokeRect(ix, iy, iw, ih);
      const words = ['a', 'sunset', 'over', 'the', 'mountains', 'with', 'a', 'clear', 'sky'], k = Math.floor((t * 2.2) % (words.length + 4));
      cx.font = `13px ${MONO}`; let y = iy + 18, x = ix + iw + 16, line = '';
      cx.fillStyle = '#8e96a1'; cx.fillText('caption:', x, y); y += 22; cx.fillStyle = '#fafbfc';
      words.slice(0, k).forEach(wd => { if (cx.measureText(line + wd).width > w - x - 10) { cx.fillText(line, x, y); y += 18; line = ''; } line += wd + ' '; }); cx.fillText(line, x, y);
      cx.fillStyle = '#8e96a1'; cx.fillText('BLEU ↑ · acc ~95%', x, iy + ih - 4);
    }
  };
  function thumb(cv, kind) { const s = fit(cv); return loop(cv, t => { const { cx, w, h } = s; if (!w) return; cx.clearRect(0, 0, w, h); cx.lineWidth = 1; thumbs[kind](cx, w, h, reduce ? 3 : t); }); }

  return { reduce, fit, loop, walk, spark, pct, lidar, nameParticles, cvDemo, thumb };
})();
