/* Hero background animations. Pick one with <html data-hero="…"> or ?hero=… in the URL. */
window.HERO = (() => {
  const { fit, loop, reduce } = window.VIS;
  const MONO = '"Geist Mono", ui-monospace, monospace';
  const small = () => innerWidth < 760;
  const mouse = { x: -1e4, y: -1e4, nx: 0, ny: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.nx = e.clientX / innerWidth - .5; mouse.ny = e.clientY / innerHeight - .5; }, { passive: true });
  const local = cv => { const b = cv.getBoundingClientRect(); return { x: mouse.x - b.left, y: mouse.y - b.top }; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const PAL = [[200, 255, 46], [90, 216, 255], [167, 139, 250]];
  const pal = t => { t = Math.max(0, Math.min(1, t)); const i = t < .5 ? 0 : 1, k = t < .5 ? t * 2 : (t - .5) * 2; return PAL[i].map((v, j) => Math.round(lerp(v, PAL[i + 1][j], k))); };

  /* 1 ── flow: particles streaming through a shifting vector field */
  function flow(cv) {
    const N = small() ? 900 : 2400;
    const X = new Float32Array(N), Y = new Float32Array(N), A = new Float32Array(N), L = new Float32Array(N);
    let W = 1, Hh = 1;
    const reset = i => { X[i] = Math.random() * W; Y[i] = Math.random() * Hh; A[i] = Math.random() * 60; L[i] = 80 + Math.random() * 220; };
    const seed = st => { W = st.w || 1; Hh = st.h || 1; for (let i = 0; i < N; i++) reset(i); };
    const s = fit(cv, seed);
    const B = 6, paths = Array.from({ length: B }, () => []);
    const field = (x, y, t) => {
      const a = Math.sin(x * .0023 + t * .21) + Math.cos(y * .0031 - t * .17) + Math.sin((x - y) * .0016 + t * .11) * .8;
      return a * 1.6;
    };
    let last = 0;
    return loop(cv, t => {
      const { cx, w, h } = s; if (!w) return;
      const dt = Math.min(2, (t - last) * 60 || 1); last = t;
      cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = 'rgba(0,0,0,.075)'; cx.fillRect(0, 0, w, h);
      cx.globalCompositeOperation = 'lighter';
      const m = local(cv);
      for (let b = 0; b < B; b++) paths[b].length = 0;
      for (let i = 0; i < N; i++) {
        const x = X[i], y = Y[i]; let an = field(x, y, t);
        let vx = Math.cos(an) * 1.5, vy = Math.sin(an) * 1.5;
        const dx = x - m.x, dy = y - m.y, d2 = dx * dx + dy * dy;
        if (d2 < 32000) { const f = (1 - d2 / 32000) * 4; vx += -dy / Math.sqrt(d2 + 1) * f; vy += dx / Math.sqrt(d2 + 1) * f; }
        const nx = x + vx * dt, ny = y + vy * dt;
        paths[Math.max(0, Math.min(B - 1, Math.floor(x / w * B)))].push(x, y, nx, ny);
        X[i] = nx; Y[i] = ny; A[i] += dt;
        if (A[i] > L[i] || nx < -5 || nx > w + 5 || ny < -5 || ny > h + 5) reset(i);
      }
      cx.lineWidth = 1.1;
      for (let b = 0; b < B; b++) {
        const c = pal(b / (B - 1)); cx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},.55)`; cx.beginPath();
        const p = paths[b]; for (let k = 0; k < p.length; k += 4) { cx.moveTo(p[k], p[k + 1]); cx.lineTo(p[k + 2], p[k + 3]); }
        cx.stroke();
      }
      cx.globalCompositeOperation = 'source-over';
    });
  }

  /* 2 ── terrain: a 3D depth-scan surface flying toward the camera */
  function terrain(cv) {
    const s = fit(cv);
    const C = small() ? 34 : 64, R = small() ? 26 : 44;
    let mx = 0, my = 0;
    return loop(cv, t => {
      const { cx, w, h } = s; if (!w) return;
      mx = lerp(mx, mouse.nx, .04); my = lerp(my, mouse.ny, .04);
      cx.clearRect(0, 0, w, h);
      const speed = reduce ? 0 : t * 5, f = Math.min(w, h * 1.7) * .8, ox = w * (w > 900 ? .6 : .5), oy = h * .18;
      const yaw = mx * .35, cyw = Math.cos(yaw), syw = Math.sin(yaw), camY = 7 + my * 2;
      const H = (x, z) => { const zz = z + speed; return 2.4 * Math.sin(x * .17 + zz * .05) * Math.cos(zz * .11) + 1.4 * Math.sin((x * .6 + zz) * .09) + .6 * Math.sin(x * .5 - zz * .3); };
      const P = [];
      for (let r = 0; r < R; r++) {
        const row = [], z = 2 + r * 1.35 - (speed % 1.35);
        for (let c = 0; c < C; c++) {
          const x = (c / (C - 1) - .5) * 70, y = H(x, z);
          const x1 = x * cyw - z * syw, z1 = x * syw + z * cyw + 6;
          row.push(z1 > .5 ? [ox + f * x1 / z1, oy + f * (camY - y) / z1 * .8, z1, y] : null);
        }
        P.push(row);
      }
      const scan = (t * 14) % 70;
      for (let r = 0; r < R; r++) {
        const row = P[r], z = 2 + r * 1.35 - (speed % 1.35), fade = Math.max(0, 1 - z / 62);
        const hot = Math.max(0, 1 - Math.abs(z - scan) / 4);
        cx.beginPath(); let started = false;
        for (let c = 0; c < C; c++) { const p = row[c]; if (!p) { started = false; continue; } started ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); started = true; }
        const col = pal(z / 62);
        cx.strokeStyle = hot > 0 ? `rgba(200,255,46,${(.25 + hot * .75) * fade + .05})` : `rgba(${col[0]},${col[1]},${col[2]},${.45 * fade})`;
        cx.lineWidth = hot > .5 ? 1.6 : 1; cx.stroke();
      }
      for (let c = 0; c < C; c += 2) {
        cx.beginPath(); let started = false;
        for (let r = 0; r < R; r++) { const p = P[r][c]; if (!p) { started = false; continue; } started ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); started = true; }
        cx.strokeStyle = 'rgba(90,216,255,.07)'; cx.lineWidth = 1; cx.stroke();
      }
      // peak markers riding the surface
      cx.font = `10px ${MONO}`;
      for (let r = 4; r < R; r += 9) for (let c = 6; c < C; c += 17) {
        const p = P[r][c]; if (!p || p[3] < 2) continue; const a = Math.max(0, 1 - p[2] / 50);
        cx.fillStyle = `rgba(200,255,46,${a})`; cx.fillRect(p[0] - 2, p[1] - 2, 4, 4);
        cx.fillStyle = `rgba(217,221,227,${a * .7})`; cx.fillText(`z ${p[3].toFixed(2)}`, p[0] + 6, p[1] - 4);
      }
    });
  }

  /* 3 ── net: a 3D neural network doing forward passes */
  function net(cv) {
    const s = fit(cv);
    const sizes = small() ? [4, 7, 8, 7, 4] : [6, 10, 12, 10, 4], outs = ['agents', 'vision', 'gen_ai', 'mlops'];
    const nodes = [], edges = [];
    sizes.forEach((n, li) => {
      const layer = [];
      for (let k = 0; k < n; k++) {
        const a = k / n * Math.PI * 2, r = li === sizes.length - 1 ? 3.2 : 2 + n * .32;
        layer.push({ x: (li - (sizes.length - 1) / 2) * 7.5, y: Math.cos(a) * r, z: Math.sin(a) * r, act: 0, li, k });
      }
      nodes.push(layer);
    });
    for (let li = 0; li < sizes.length - 1; li++) for (const a of nodes[li]) for (const b of nodes[li + 1]) edges.push({ a, b, w: Math.random() });
    const pulses = []; let probs = [.25, .25, .25, .25], target = [.25, .25, .25, .25], winner = 0;
    const fire = () => { winner = (winner + 1) % 4; for (const n of nodes[0]) if (Math.random() < .7) n.act = 1, emit(n); };
    function emit(n) { if (n.li >= sizes.length - 1) return; const next = nodes[n.li + 1]; const k = n.li === sizes.length - 2 ? 1 : 2 + (Math.random() * 2 | 0);
      for (let i = 0; i < k; i++) { const b = n.li === sizes.length - 2 ? next[winner] : next[(Math.random() * next.length) | 0]; pulses.push({ a: n, b, t: 0, sp: .9 + Math.random() * .6 }); } }
    let lastFire = -9, last = 0, mx = 0, my = 0;
    return loop(cv, t => {
      const { cx, w, h } = s; if (!w) return;
      const dt = Math.min(.05, t - last); last = t;
      mx = lerp(mx, mouse.nx, .04); my = lerp(my, mouse.ny, .04);
      if (!reduce && t - lastFire > 2.4) { lastFire = t; fire(); target = [0, 0, 0, 0].map((_, i) => i === winner ? .82 + Math.random() * .15 : Math.random() * .1); }
      probs = probs.map((p, i) => lerp(p, target[i], .04));
      const yaw = -.55 + (reduce ? 0 : Math.sin(t * .15) * .35) + mx * .6, pitch = .25 + my * .3, dist = 34;
      const cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const f = Math.min(w, h * 1.6) * .95, ox = w * (w > 900 ? .66 : .5), oy = h * .5;
      const proj = n => { const x1 = n.x * cy_ - n.z * sy_, z1 = n.x * sy_ + n.z * cy_; const y2 = n.y * cp - z1 * sp, z2 = n.y * sp + z1 * cp + dist; return [ox + f * x1 / z2, oy - f * y2 / z2, z2]; };
      nodes.flat().forEach(n => { n.p = proj(n); n.act *= .965; });
      cx.clearRect(0, 0, w, h);
      cx.lineWidth = 1;
      for (const e of edges) { const a = e.a.p, b = e.b.p, k = Math.max(e.a.act, e.b.act); cx.strokeStyle = `rgba(90,216,255,${.035 + e.w * .04 + k * .18})`; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const q = pulses[i]; q.t += dt * q.sp * 1.4;
        const a = q.a.p, b = q.b.p, k = Math.min(1, q.t);
        const x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k);
        cx.strokeStyle = 'rgba(200,255,46,.55)'; cx.lineWidth = 1.4; cx.beginPath(); cx.moveTo(lerp(a[0], b[0], Math.max(0, k - .25)), lerp(a[1], b[1], Math.max(0, k - .25))); cx.lineTo(x, y); cx.stroke();
        cx.fillStyle = '#fff'; cx.fillRect(x - 1.5, y - 1.5, 3, 3);
        if (q.t >= 1) { pulses.splice(i, 1); q.b.act = 1; emit(q.b); }
      }
      cx.lineWidth = 1;
      nodes.flat().sort((a, b) => b.p[2] - a.p[2]).forEach(n => {
        const p = n.p, r = (n.li === sizes.length - 1 ? 5 : 3.2) * 34 / p[2];
        const c = pal(n.li / (sizes.length - 1));
        cx.fillStyle = n.act > .05 ? `rgba(200,255,46,${.3 + n.act * .7})` : '#0f1114';
        cx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${.5 + n.act * .5})`;
        cx.beginPath(); cx.arc(p[0], p[1], r + n.act * 2, 0, 7); cx.fill(); cx.stroke();
        if (n.act > .3) { cx.strokeStyle = `rgba(200,255,46,${n.act * .4})`; cx.beginPath(); cx.arc(p[0], p[1], r + (1 - n.act) * 14, 0, 7); cx.stroke(); }
      });
      // output read-out
      cx.font = `11px ${MONO}`;
      nodes[sizes.length - 1].forEach((n, i) => {
        const p = n.p, x = p[0] + 14, y = p[1] + 4, on = i === winner && probs[i] > .5;
        cx.fillStyle = on ? '#c8ff2e' : 'rgba(142,150,161,.8)'; cx.fillText(`${outs[i]} ${probs[i].toFixed(2)}`, x, y);
        cx.fillStyle = 'rgba(255,255,255,.08)'; cx.fillRect(x, y + 5, 60, 2); cx.fillStyle = on ? '#c8ff2e' : '#5d6570'; cx.fillRect(x, y + 5, 60 * probs[i], 2);
      });
    });
  }

  /* 4 ── swarm: the name itself is made of particles that scatter around the cursor */
  function swarm(nameEl) {
    return new Promise(res => {
      const words = [...nameEl.querySelectorAll('.tx')];
      const PAD = 90; let cv, cx, W, H, parts = [], step;
      function build() {
        const nb = nameEl.getBoundingClientRect(); W = Math.ceil(nb.width + PAD * 2); H = Math.ceil(nb.height + PAD * 2);
        if (!cv) { cv = document.createElement('canvas'); cv.id = 'namefx'; nameEl.appendChild(cv); cx = cv.getContext('2d'); }
        Object.assign(cv.style, { left: -PAD + 'px', top: -PAD + 'px', width: W + 'px', height: H + 'px' });
        const d = Math.min(devicePixelRatio || 1, 2); cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
        const off = document.createElement('canvas'); off.width = W; off.height = H; const oc = off.getContext('2d', { willReadFrequently: true });
        const cs = getComputedStyle(words[0]), fs = parseFloat(cs.fontSize);
        oc.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; if ('letterSpacing' in oc) oc.letterSpacing = cs.letterSpacing; oc.fillStyle = '#fff';
        words.forEach(wd => { const b = wd.getBoundingClientRect(); oc.fillText(wd.textContent, b.left - nb.left + PAD, b.top - nb.top + PAD + fs * .78); });
        const img = oc.getImageData(0, 0, W, H).data; step = fs > 80 ? 4 : 3; const homes = [];
        for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (img[((y | 0) * W + (x | 0)) * 4 + 3] > 130) homes.push([x, y]);
        const old = parts;
        parts = homes.map(([x, y], i) => old[i] ? Object.assign(old[i], { hx: x, hy: y }) : { hx: x, hy: y, x: x + (Math.random() - .5) * W, y: y + (Math.random() - .5) * H * 2, vx: 0, vy: 0, s: Math.random() });
      }
      build();
      let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
      let resolved = false; const t0 = performance.now();
      (function frame(now) {
        requestAnimationFrame(frame);
        const r = cv.getBoundingClientRect(); if (r.bottom < 0 || document.hidden) return;
        const t = (now - t0) / 1000, mx = mouse.x - r.left, my = mouse.y - r.top;
        cx.clearRect(0, 0, W, H);
        let settled = 0;
        for (const p of parts) {
          const ax = (p.hx - p.x) * .075, ay = (p.hy - p.y) * .075; p.vx = (p.vx + ax) * .82; p.vy = (p.vy + ay) * .82;
          const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { const d = Math.sqrt(d2) || 1, f = (1 - d / 95) * 9; p.vx += dx / d * f; p.vy += dy / d * f; }
          if (!reduce) { p.vx += Math.sin(t * 2 + p.s * 40) * .04; p.vy += Math.cos(t * 1.7 + p.s * 30) * .04; }
          p.x += p.vx; p.y += p.vy;
          const off = Math.abs(p.x - p.hx) + Math.abs(p.y - p.hy); if (off < 2) settled++;
          cx.fillStyle = off > 6 ? (p.s < .33 ? '#c8ff2e' : p.s < .66 ? '#5ad8ff' : '#ffb000') : '#fafbfc';
          const sz = off > 6 ? step * .5 : step * .72; cx.fillRect(p.x, p.y, sz, sz);
        }
        if (!resolved && (settled > parts.length * .9 || t > 2.5)) { resolved = true; res(); }
      })(t0);
      nameEl.classList.add('swarm');
    });
  }

  return { flow, terrain, net, swarm };
})();
