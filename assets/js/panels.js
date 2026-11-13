/* Hero console panels. Pick one with <html data-panel="…"> or ?panel=… in the URL.
   Numbers shown in these panels are illustrative animations, not measurements. */
window.PANELS = (() => {
  const { fit, loop, reduce } = window.VIS;
  const MONO = '"Geist Mono", ui-monospace, monospace';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const visible = el => el.offsetParent !== null && !document.hidden;
  async function waitVisible(el) { while (!visible(el)) await sleep(400); }
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

  /* ───────── 1. vision: camera view + bird's-eye view, shared tracks ───────── */
  function vision(root, ui) {
    ui.title('perception.py — cam_01 + BEV');
    root.appendChild(h(`<div class="pv"><div class="pv-cam"><canvas></canvas><span class="pv-l">CAMERA · RF-DETR + SAM</span></div><div class="pv-bev"><canvas></canvas><span class="pv-l">BEV · TRACKS</span></div><div class="pv-ft"></div></div>`));
    const [cc, bc] = root.querySelectorAll('canvas'), ft = root.querySelector('.pv-ft');
    const S1 = fit(cc), S2 = fit(bc);
    const cols = { car: '#c8ff2e', truck: '#ffb000', person: '#ff4fa3', cyclist: '#5ad8ff' };
    const O = [
      { k: 'car', x: -2.2, z: 14, w: 1.9, hh: 1.5, v: -1.6 }, { k: 'truck', x: 2.6, z: 26, w: 2.5, hh: 3, v: -.6 },
      { k: 'person', x: -5.2, z: 9, w: .6, hh: 1.75, v: .5 }, { k: 'cyclist', x: 4.6, z: 17, w: .7, hh: 1.7, v: -1.1 },
      { k: 'car', x: 2.4, z: 38, w: 1.9, hh: 1.5, v: -2.4 }, { k: 'person', x: 5.8, z: 22, w: .6, hh: 1.7, v: -.4 }
    ].map((o, i) => ({ ...o, id: 11 + i * 3, tr: [] }));
    let last = 0;
    loop(cc, t => {
      const dt = Math.min(.05, t - last); last = t;
      for (const o of O) { if (!reduce) { o.z += o.v * dt; if (o.z < 4) o.z = 44; if (o.z > 46) o.z = 5; } o.tr.push([o.x, o.z]); if (o.tr.length > 90) o.tr.shift(); }
      // camera
      const { cx, w, h: H } = S1; if (!w) return;
      const hz = H * .4, f = w * 1.25;
      cx.fillStyle = '#050607'; cx.fillRect(0, 0, w, H);
      cx.strokeStyle = '#ffffff10'; cx.lineWidth = 1;
      for (const lx of [-7, -3.5, 0, 3.5, 7]) { cx.beginPath(); cx.moveTo(w / 2 + f * lx / 4, H); cx.lineTo(w / 2 + f * lx / 60, hz + f * 1.4 / 60); cx.stroke(); }
      for (let i = 0; i < 6; i++) { const z = 4 + ((i * 7 - t * 6) % 42 + 42) % 42; const y = hz + f * 1.4 / z; cx.strokeStyle = `rgba(255,255,255,${.05 * (1 - z / 46)})`; cx.beginPath(); cx.moveTo(0, y); cx.lineTo(w, y); cx.stroke(); }
      [...O].sort((a, b) => b.z - a.z).forEach(o => {
        const u = w / 2 + f * o.x / o.z, bw = f * o.w / o.z, bh = f * o.hh / o.z, base = hz + f * 1.4 / o.z, X = u - bw / 2, Y = base - bh;
        cx.fillStyle = cols[o.k] + '30'; cx.fillRect(X, Y, bw, bh);
        cx.fillStyle = '#3a3f47';
        if (o.k === 'person' || o.k === 'cyclist') { cx.beginPath(); cx.arc(u, Y + bh * .1, bw * .3, 0, 7); cx.fill(); cx.fillRect(X + bw * .2, Y + bh * .2, bw * .6, bh * .8); }
        else { cx.fillRect(X, Y + bh * .35, bw, bh * .5); cx.fillRect(X + bw * .15, Y + bh * .05, bw * .7, bh * .35); }
        cx.strokeStyle = cols[o.k]; cx.lineWidth = 1.3; cx.strokeRect(X, Y, bw, bh);
        if (bh > 12) { const lab = `${o.k} #${o.id}`; cx.font = `600 9.5px ${MONO}`; const tw = cx.measureText(lab).width + 6; cx.fillStyle = cols[o.k]; cx.fillRect(X - .6, Y - 12, tw, 12); cx.fillStyle = '#000'; cx.fillText(lab, X + 2.5, Y - 3); }
      });
      // bird's-eye view
      const B = S2; if (!B.w) return; const g = B.cx, bw2 = B.w, bh2 = B.h, ex = bw2 / 2, ey = bh2 - 14, sc = (bh2 - 24) / 44;
      g.fillStyle = '#06080a'; g.fillRect(0, 0, bw2, bh2);
      g.strokeStyle = '#ffffff0e'; for (const r of [10, 20, 30, 40]) { g.beginPath(); g.arc(ex, ey, r * sc, Math.PI, 0); g.stroke(); }
      g.fillStyle = '#c8ff2e0c'; g.beginPath(); g.moveTo(ex, ey); g.arc(ex, ey, 44 * sc, -Math.PI / 2 - .55, -Math.PI / 2 + .55); g.closePath(); g.fill();
      g.strokeStyle = '#ffffff12'; for (const lx of [-3.5, 0, 3.5]) { g.setLineDash([4, 5]); g.beginPath(); g.moveTo(ex + lx * sc, ey); g.lineTo(ex + lx * sc, 0); g.stroke(); } g.setLineDash([]);
      for (const o of O) {
        const px = ex + o.x * sc, pz = ey - o.z * sc;
        g.strokeStyle = cols[o.k] + '55'; g.beginPath(); o.tr.forEach(([x, z], i) => i ? g.lineTo(ex + x * sc, ey - z * sc) : g.moveTo(ex + x * sc, ey - z * sc)); g.stroke();
        g.fillStyle = cols[o.k]; const ww = Math.max(3, o.w * sc), ll = Math.max(3, (o.k === 'car' ? 4.5 : o.k === 'truck' ? 7 : .6) * sc); g.fillRect(px - ww / 2, pz - ll / 2, ww, ll);
        g.strokeStyle = cols[o.k]; g.beginPath(); g.moveTo(px, pz); g.lineTo(px, pz + o.v * 1.4 * sc); g.stroke();
        g.font = `9px ${MONO}`; g.fillStyle = '#d9dde3aa'; g.fillText('#' + o.id, px + ww / 2 + 3, pz + 3);
      }
      g.fillStyle = '#fafbfc'; g.beginPath(); g.moveTo(ex, ey - 7); g.lineTo(ex - 5, ey + 5); g.lineTo(ex + 5, ey + 5); g.closePath(); g.fill();
      ft.textContent = `▶ ${O.length} tracks · det ${(11.8 + Math.sin(t * 2)).toFixed(1)} ms · bev ${(3.1 + Math.sin(t * 3) * .4).toFixed(1)} ms · ${Math.round(60 + Math.sin(t) * 2)} fps`;
    });
  }

  /* ───────── 2. pipeline: CI/CD run for each project ───────── */
  function pipeline(root, ui) {
    ui.title('ci — main · github actions');
    const runs = [
      { repo: 'remote-dev-ai', sha: 'a3f9c21', msg: 'feat: security review agent', st: [['lint', 'ruff · mypy'], ['test', 'pytest · 142 passed'], ['build', 'docker buildx · 4 layers'], ['eval', 'agent bench · pass@1 0.87'], ['deploy', 'container · rev-42']] },
      { repo: 'LORE', sha: '7be0d14', msg: 'feat: live voice branching', st: [['lint', 'eslint · ruff'], ['test', 'vitest 64 · pytest 38'], ['build', 'vite build · 212 kB'], ['eval', 'story coherence 0.91'], ['deploy', 'vertex ai · v12']] },
      { repo: 'ai_project', sha: 'c40e8aa', msg: 'perf: rerank top-k chunks', st: [['lint', 'ruff'], ['test', 'pytest · 57 passed'], ['build', 'ollama · llama3 q4'], ['eval', 'recall@5 0.93'], ['deploy', 'gradio app · v7']] }
    ];
    root.appendChild(h(`<div class="pp"><div class="pp-dag"></div><div class="pp-log"></div></div>`));
    const dag = root.querySelector('.pp-dag'), log = root.querySelector('.pp-log');
    const line = html => { log.insertAdjacentHTML('beforeend', `<div>${html}</div>`); while (log.children.length > 11) log.firstChild.remove(); return log.lastChild; };
    (async () => {
      for (let r = 0; ; r = (r + 1) % runs.length) {
        await waitVisible(root);
        const R = runs[r]; log.innerHTML = '';
        dag.innerHTML = R.st.map(([n]) => `<span class="pp-s" data-s="${n}"><i></i>${n}</span>`).join('<b>→</b>');
        line(`<span class="g">$</span> git push origin main`); await sleep(500);
        line(`<span class="m">→ ${R.repo}</span> <span class="a">${R.sha}</span> ${esc(R.msg)}`); await sleep(500);
        let total = 0;
        for (const [n, d] of R.st) {
          const pill = dag.querySelector(`[data-s="${n}"]`); pill.className = 'pp-s run';
          const el = line(`<span class="c">▸ ${n.padEnd(7)}</span><span class="d">${esc(d)}</span><span class="bar"><i></i></span><span class="r"></span>`);
          const bar = el.querySelector('.bar i'), res = el.querySelector('.r'), dur = 700 + Math.random() * 900;
          if (!reduce) { const t0 = performance.now(); while (performance.now() - t0 < dur) { bar.style.width = ((performance.now() - t0) / dur * 100) + '%'; await sleep(40); } }
          bar.style.width = '100%'; const secs = dur / 1000 * 9; total += secs; res.innerHTML = `<span class="g">✓</span> ${secs.toFixed(1)}s`; pill.className = 'pp-s ok';
        }
        line(`<span class="g">✓ shipped</span> in ${Math.floor(total / 60)}m ${Math.round(total % 60)}s · all checks passed`);
        await sleep(2600);
      }
    })();
  }

  /* ───────── 3. editor: code typing across three files, with run output ───────── */
  function editor(root, ui) {
    ui.title('~/projects — editor');
    const files = [
      { n: 'agent.py', lang: 'py', code:
`from langgraph.graph import StateGraph, END
from agents import researcher, coder, reviewer

graph = StateGraph(TaskState)
graph.add_node("research", researcher)
graph.add_node("code", coder)
graph.add_node("review", reviewer)
graph.add_edge("research", "code")
graph.add_edge("code", "review")
graph.add_conditional_edges("review", verdict,
    {"fix": "code", "ok": END})

app = graph.compile()
await app.ainvoke({"issue": 42})`,
        out: ['[research] read 6 files · 2.1s', '[code]     patch +48 −12 · 4.8s', '[review]   2 comments → fix', '[code]     patch +7 −3 · 1.9s', '[review]   ✓ approved · tests pass'] },
      { n: 'track.py', lang: 'py', code:
`import cv2
from rfdetr import RFDETRBase
from tracking import ByteTracker

model, tracker = RFDETRBase(), ByteTracker()
cap = cv2.VideoCapture("cam_01.mp4")

while cap.isOpened():
    ok, frame = cap.read()
    if not ok: break
    dets = model.predict(frame, threshold=0.5)
    tracks = tracker.update(dets)
    masks = sam.predict(frame, boxes=tracks.xyxy)
    out.write(draw(frame, tracks, masks))`,
        out: ['frame 0410 · 5 tracks · 13.6 ms', 'frame 0411 · 5 tracks · 13.2 ms', 'frame 0412 · 6 tracks · 14.1 ms', 'id 17 cyclist entered roi', '✓ 1,204 frames · 71 fps avg'] },
      { n: 'api.py', lang: 'py', code:
`from fastapi import FastAPI
from qdrant_client import QdrantClient

app = FastAPI()
db = QdrantClient("qdrant:6333")

@app.post("/ask")
async def ask(q: Query) -> Answer:
    vec = embed(q.text)
    hits = db.search("ros2_docs", vec, limit=5)
    ctx = "\\n".join(h.payload["text"] for h in hits)
    return await llm.generate(q.text, context=ctx)`,
        out: ['INFO  uvicorn running on :8000', 'POST /ask 200 · 184 ms', 'POST /ask 200 · 162 ms', 'GET  /health 200 · 2 ms', 'POST /ask 200 · 171 ms'] }
    ];
    root.appendChild(h(`<div class="pe"><div class="pe-tabs">${files.map((f, i) => `<button data-i="${i}">${f.n}</button>`).join('')}</div><div class="pe-code"><div class="pe-ln"></div><pre></pre></div><div class="pe-out"></div></div>`));
    const tabs = [...root.querySelectorAll('.pe-tabs button')], pre = root.querySelector('pre'), ln = root.querySelector('.pe-ln'), out = root.querySelector('.pe-out');
    const RX = /(#.*$)|("(?:[^"\\]|\\.)*"?)|(@\w+(?:\.\w+)*)|\b(from|import|await|async|def|return|while|for|in|if|not|break|as|class|with)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_]\w*)(?=\()/gm;
    const hl = s => esc(s).replace(RX, (m, c, st, dec, kw, num, fn) => c ? `<i class="cm">${c}</i>` : st ? `<i class="st">${st}</i>` : dec ? `<i class="dc">${dec}</i>` : kw ? `<i class="kw">${kw}</i>` : num ? `<i class="nu">${num}</i>` : `<i class="fn">${fn}</i>`);
    let jump = -1; tabs.forEach(b => b.addEventListener('click', () => jump = +b.dataset.i));
    (async () => {
      for (let i = 0; ; ) {
        await waitVisible(root);
        const F = files[i]; tabs.forEach((b, k) => b.classList.toggle('on', k === i)); out.innerHTML = ''; jump = -1;
        const total = F.code.length, lines = F.code.split('\n').length;
        ln.innerHTML = Array.from({ length: lines }, (_, k) => k + 1).join('<br>');
        for (let k = reduce ? total : 0; k <= total; k += 3) { if (jump >= 0) break; pre.innerHTML = hl(F.code.slice(0, k)) + '<span class="cur"></span>'; await sleep(16); }
        if (jump < 0) { pre.innerHTML = hl(F.code); out.insertAdjacentHTML('beforeend', `<div class="g">$ python ${F.n}</div>`);
          for (const o of F.out) { if (jump >= 0) break; await sleep(380); out.insertAdjacentHTML('beforeend', `<div>${esc(o)}</div>`); }
          for (let w = 0; w < 30 && jump < 0; w++) await sleep(100); }
        i = jump >= 0 ? jump : (i + 1) % files.length;
      }
    })();
  }

  /* ───────── 4. system: live architecture map with traffic and metrics ───────── */
  function system(root, ui) {
    ui.title('system design — AI app');
    root.appendChild(h(`<div class="ps"><canvas></canvas><div class="ps-m"></div><div class="ps-cap">example architecture · simulated traffic</div><div class="ps-log"></div></div>`));
    const cv = root.querySelector('canvas'), m = root.querySelector('.ps-m'), lg = root.querySelector('.ps-log'), S = fit(cv);
    const N = {
      client: { x: .12, y: .5, l: 'client', s: 'web · mobile' }, api: { x: .35, y: .5, l: 'api', s: 'FastAPI' },
      orch: { x: .58, y: .3, l: 'orchestrator', s: 'LangGraph' }, vis: { x: .58, y: .7, l: 'vision', s: 'RF-DETR · SAM' },
      llm: { x: .85, y: .2, l: 'llm', s: 'Gemini · Claude' }, vdb: { x: .85, y: .4, l: 'vectors', s: 'Qdrant' },
      pg: { x: .85, y: .64, l: 'postgres', s: 'SQL' }, obj: { x: .85, y: .8, l: 'frames', s: 'object store' }
    };
    Object.values(N).forEach(n => { n.load = 0; });
    const E = [['client', 'api'], ['api', 'orch'], ['api', 'vis'], ['orch', 'llm'], ['orch', 'vdb'], ['orch', 'pg'], ['vis', 'pg'], ['vis', 'obj']];
    const routes = [['client', 'api', 'orch', 'vdb'], ['client', 'api', 'orch', 'llm'], ['client', 'api', 'vis', 'obj'], ['client', 'api', 'orch', 'pg'], ['client', 'api', 'vis', 'pg']];
    const reqs = []; let spawn = 0, last = 0, rps = 240, p50 = 42, p99 = 180;
    const events = ['autoscale vision 2 → 3 replicas', 'deploy api rev-43 ✓ canary 10%', 'cache hit rate 84%', 'qdrant compaction done', 'deploy api rev-43 ✓ 100%', 'llm fallback ok · p99 within slo'];
    let ev = 0; setInterval(() => { if (!visible(root)) return; const d = new Date(); lg.insertAdjacentHTML('beforeend', `<div><span>${d.toTimeString().slice(0, 8)}</span> ${events[ev++ % events.length]}</div>`); while (lg.children.length > 2) lg.firstChild.remove(); }, 2600);
    loop(cv, t => {
      const { cx, w, h: H } = S; if (!w) return;
      const dt = Math.min(.05, t - last); last = t;
      const P = k => [N[k].x * w, N[k].y * H];
      cx.fillStyle = '#050607'; cx.fillRect(0, 0, w, H);
      cx.strokeStyle = '#ffffff08'; for (let x = 0; x < w; x += 20) for (let y = 0; y < H; y += 20) cx.strokeRect(x, y, .5, .5);
      cx.lineWidth = 1; for (const [a, b] of E) { const [x1, y1] = P(a), [x2, y2] = P(b); cx.strokeStyle = '#ffffff1a'; cx.beginPath(); cx.moveTo(x1, y1); cx.bezierCurveTo((x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2); cx.stroke(); }
      spawn += dt * (reduce ? 0 : 7); while (spawn > 1) { spawn--; const r = routes[(Math.random() * routes.length) | 0]; reqs.push({ path: [...r, ...r.slice(0, -1).reverse()], i: 0, k: 0, sp: 2.2 + Math.random() }); }
      for (let q = reqs.length - 1; q >= 0; q--) {
        const r = reqs[q]; r.k += dt * r.sp; if (r.k >= 1) { r.k = 0; r.i++; N[r.path[r.i]] && (N[r.path[r.i]].load = Math.min(1, N[r.path[r.i]].load + .12)); }
        if (r.i >= r.path.length - 1) { reqs.splice(q, 1); continue; }
        const [x1, y1] = P(r.path[r.i]), [x2, y2] = P(r.path[r.i + 1]), k = r.k, u = 1 - k;
        const bx = u * u * u * x1 + 3 * u * u * k * (x1 + x2) / 2 + 3 * u * k * k * (x1 + x2) / 2 + k * k * k * x2, by = u * u * u * y1 + 3 * u * u * k * y1 + 3 * u * k * k * y2 + k * k * k * y2;
        const back = r.i >= (r.path.length - 1) / 2; cx.fillStyle = back ? '#5ad8ff' : '#c8ff2e'; cx.fillRect(bx - 1.5, by - 1.5, 3, 3);
      }
      cx.font = `600 11px ${MONO}`;
      for (const n of Object.values(N)) {
        n.load *= .97; const tiny = w < 440, [x, y] = [n.x * w, n.y * H], bw = tiny ? w * .23 : Math.min(108, w * .2), bh = tiny ? 26 : 34;
        cx.fillStyle = '#0f1114'; cx.strokeStyle = n.load > .5 ? '#c8ff2e' : '#2a2f36'; cx.lineWidth = 1;
        cx.beginPath(); cx.roundRect ? cx.roundRect(x - bw / 2, y - bh / 2, bw, bh, 6) : cx.rect(x - bw / 2, y - bh / 2, bw, bh); cx.fill(); cx.stroke();
        cx.fillStyle = '#fafbfc'; cx.font = `600 ${tiny ? 9.5 : 10.5}px ${MONO}`; cx.fillText(n.l, x - bw / 2 + (tiny ? 5 : 8), tiny ? y + 2 : y - 3);
        if (!tiny) { cx.fillStyle = '#8e96a1'; cx.font = `9.5px ${MONO}`; cx.fillText(n.s, x - bw / 2 + 8, y + 10); }
        cx.fillStyle = '#2a2f36'; cx.fillRect(x - bw / 2 + 8, y + bh / 2 - 5, bw - 16, 2); cx.fillStyle = n.load > .7 ? '#ffb000' : '#2fd67b'; cx.fillRect(x - bw / 2 + 8, y + bh / 2 - 5, (bw - 16) * n.load, 2);
      }
      rps += (230 + Math.sin(t * .7) * 40 - rps) * .05; p50 += (40 + Math.sin(t * 1.3) * 4 - p50) * .05; p99 += (170 + Math.sin(t * .9) * 22 - p99) * .05;
      m.innerHTML = `<span>rps <b>${rps.toFixed(0)}</b></span><span>p50 <b>${p50.toFixed(0)}ms</b></span><span>p99 <b>${p99.toFixed(0)}ms</b></span><span>err <b class="g">0.02%</b></span>`;
    });
  }

  /* ───────── 5. tabs: rotate through pipeline / system / vision ───────── */
  function tabs(root, ui) {
    const set = [['pipeline', pipeline, 'ci'], ['system', system, 'system'], ['vision', vision, 'vision'], ['editor', editor, 'code']];
    root.appendChild(h(`<div class="pt"><div class="pt-bar">${set.map(([k, , l], i) => `<button data-i="${i}">${l}<i></i></button>`).join('')}</div><div class="pt-body">${set.map(() => '<div class="pt-pane"></div>').join('')}</div></div>`));
    const btns = [...root.querySelectorAll('.pt-bar button')], panes = [...root.querySelectorAll('.pt-pane')], titles = [];
    set.forEach(([, fn], i) => fn(panes[i], { title: s => titles[i] = s }));
    let cur = 0, t0 = performance.now(), held = false;
    const show = i => { cur = i; t0 = performance.now(); btns.forEach((b, k) => b.classList.toggle('on', k === i)); panes.forEach((p, k) => p.classList.toggle('on', k === i)); ui.title(titles[i]); };
    btns.forEach(b => b.addEventListener('click', () => { held = true; show(+b.dataset.i); }));
    root.addEventListener('pointerenter', () => held = true); root.addEventListener('pointerleave', () => held = false);
    show(0);
    (function tick() { requestAnimationFrame(tick); const p = (performance.now() - t0) / 9000; btns[cur].querySelector('i').style.transform = `scaleX(${Math.min(1, p)})`; if (p >= 1 && !held && !reduce) show((cur + 1) % set.length); else if (held) t0 = performance.now() - Math.min(p, 1) * 9000; })();
  }

  return { vision, pipeline, editor, system, tabs };
})();
