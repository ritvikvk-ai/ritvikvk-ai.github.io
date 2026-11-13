/* shared helpers — inlined into each sample at build time */
const RVK=(()=>{
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

const skills=[
 {k:'ai_ml',n:'AI / ML',sub:'LLMs · deep learning',items:['PyTorch','TensorFlow','Keras','Scikit-Learn','LangGraph','RAG','LLaMA 3','Multi-Agent Systems','HuggingFace Transformers','Gemini API','Anthropic LLMs','Google ADK']},
 {k:'computer_vision',n:'Computer Vision',sub:'perception',items:['OWLv2','SAM','RF-DETR','BEVFormer','OpenCV','FFmpeg','Instance Segmentation','Object Tracking'],isNew:true},
 {k:'cloud_mlops',n:'Cloud & MLOps',sub:'infra',items:['Azure','Azure OpenAI','GCP','Vertex AI','AWS','Docker','CI/CD','Databricks','ZenML','ClearML']},
 {k:'languages',n:'Languages',sub:'core',items:['Python','SQL','JavaScript','C++','Java','C','HTML','CSS']},
 {k:'data_engineering',n:'Data Engineering',sub:'pipelines',items:['Spark','Hadoop','PostgreSQL','MongoDB','Qdrant','Weaviate','Pandas','NumPy','Databricks SQL']},
 {k:'frontend_tools',n:'Frontend & Tools',sub:'product',items:['React','FastAPI','Gradio','Power BI','Tableau','Bootstrap','GitHub','VSCode']},
];
const projects=[
 {hash:'a3f9c21',org:'HOF Capital Hacks',title:'Agentic AI Code Assistant',lbl:'agent_system',conf:.98,desc:'Multi-agent system automating the full SDLC: research, generation, review, testing and security analysis. Specialized agents hand off via LangGraph, with Anthropic LLMs and GitHub MCP orchestrating end-to-end.',tags:['LangGraph','Anthropic','GitHub MCP','Docker','CI/CD'],link:'https://github.com/ritvikvk-ai/remote-dev-ai',m:['status','shipped']},
 {hash:'7be0d14',org:'NYU × Gemini Hackathon',title:'LORE: Multimodal Story Engine',lbl:'multimodal',conf:.97,desc:'Synchronized text, image and voice generation with Gemini 2.5 Pro and Google ADK. Agent-to-agent pipelines, context-aware narrative branching and real-time voice I/O via the Gemini Live API.',tags:['Gemini 2.5 Pro','Google ADK','Vertex AI','FastAPI','React'],link:'https://github.com/ritvikvk-ai/LORE',m:['status','shipped']},
 {hash:'c40e8aa',org:'AI Research',title:'Fine-Tuned RAG for Robotics',lbl:'rag_robotics',conf:.96,desc:'Domain-specific RAG over ROS2 Navigation docs. LLaMA 3 fine-tuned on a robotics corpus with Qdrant retrieval, served via Ollama + Gradio with higher precision and lower latency.',tags:['LLaMA 3','Qdrant','ROS2','Ollama'],link:'https://github.com/ritvikvk-ai/ai_project',m:['status','shipped']},
 {hash:'19d2f7e',org:'Microsoft Hack Night 2025',title:'Weaviate RAG Chatbot',lbl:'rag_chatbot',conf:.95,desc:'Enterprise knowledge assistant with Weaviate as the vector backbone: ingestion, embedding retrieval and context-grounded generation designed to minimise hallucination.',tags:['RAG','Weaviate','FastAPI','LLM'],m:['status','shipped']},
 {hash:'e81b3c0',org:'Financial ML',title:'Insider Trading Detection',lbl:'anomaly',conf:.85,desc:'LSTM sequence model flagging suspicious trading patterns across large-scale market records for compliance and market surveillance.',tags:['LSTM','TensorFlow','Keras','Time Series'],m:['accuracy','~85%']},
 {hash:'5aa07f9',org:'Best Project of the Year',title:'Image-to-Text Conversion',lbl:'caption',conf:.95,desc:'Image captioning with Inception-v3 visual features and an LSTM decoder. Awarded Best Project of the Year.',tags:['Inception-v3','LSTM','Computer Vision','PyTorch'],m:['accuracy','~95%']},
];
const edu=[
 {when:'Sep 2024 — May 2026',school:'New York University',sub:'Tandon School of Engineering · MS Computer Science · New York, NY',body:'Machine learning · AI · deep learning · algorithms · database systems · robotics AI · cloud-based AI systems.',g:'GPA 3.7 / 4.0',w:92.5},
 {when:'Graduated',school:'NMAM Institute of Technology, VTU',sub:'BE Computer Science · Karnataka, India',body:'ML · NLP · cybersecurity · big data analytics · computer architecture · data structures.',g:'CGPA 8.89 / 10',w:88.9},
];
const links={email:'rv2459@nyu.edu',github:'https://github.com/ritvikvk-ai',linkedin:'https://linkedin.com/in/ritvik-vk'};
const roles=['AI Engineer','Computer Vision Engineer','ML Engineer','Multi-Agent Systems Builder','Applied AI'];

function walk(n,seed,drift=.4){let v=50,a=[],s=seed;for(let i=0;i<n;i++){s=(s*9301+49297)%233280;v+=(s/233280-.5)*6+drift;a.push(v)}return a}
function spark(d,col,w=110,h=30){const mn=Math.min(...d),mx=Math.max(...d);const p=d.map((v,i)=>`${(i/(d.length-1)*w).toFixed(1)},${(h-3-(v-mn)/(mx-mn||1)*(h-6)).toFixed(1)}`).join(' ');
 return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline class="spark-l" fill="none" style="stroke:${col}" stroke-width="1.5" points="${p}"/></svg>`}
const pct=d=>((d[d.length-1]-d[0])/d[0]*100).toFixed(1);

function counters(root){$$('[data-n]',root).forEach(el=>{if(el._done)return;el._done=1;const n=+el.dataset.n,d=+(el.dataset.d||0),suf=el.dataset.s||'',t0=performance.now();
 if(reduce){el.textContent=n.toFixed(d)+suf;return}(function f(t){const p=Math.min((t-t0)/1300,1);el.textContent=(n*(1-Math.pow(1-p,3))).toFixed(d)+suf;if(p<1)requestAnimationFrame(f)})(t0)})}
function scramble(el){if(el._sc||reduce)return;el._sc=1;const txt=el.dataset.text||el.textContent;el.dataset.text=txt;const ch='▓▒░<>/_#01';let f=0;const L=txt.length;
 (function s(){let o='';for(let i=0;i<L;i++){o+=txt[i]===' '||i<f/2?txt[i]:ch[(Math.random()*ch.length)|0]}el.textContent=o;f++;if(f/2<=L)requestAnimationFrame(s);else el.textContent=txt})()}
function reveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const t=e.target;t.classList.add('in');io.unobserve(t);counters(t);
 if(t.matches('[data-scramble]'))scramble(t);$$('[data-scramble]',t).forEach(scramble);$$('[data-w]',t).forEach(b=>setTimeout(()=>b.style.width=b.dataset.w+'%',150))}),{threshold:.12});
 $$('.rv,[data-scramble]').forEach(e=>io.observe(e))}

function nyc(){const now=new Date();const t=now.toLocaleTimeString('en-US',{hour12:false,timeZone:'America/New_York'});
 const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(now);
 const g=k=>p.find(x=>x.type===k).value,wd=g('weekday'),m=(+g('hour')%24)*60+ +g('minute');const open=!['Sat','Sun'].includes(wd)&&m>=570&&m<960;return{t,open}}
function clock(el,fmt){const u=()=>{el.innerHTML=fmt(nyc())};u();setInterval(u,1000)}

function toast(msg){let t=$('#rvk-toast');if(!t){t=document.createElement('div');t.id='rvk-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)}
function copyable(){$$('[data-copy]').forEach(a=>a.addEventListener('click',e=>{if(!navigator.clipboard)return;e.preventDefault();navigator.clipboard.writeText(a.dataset.copy).then(()=>toast('✓ copied '+a.dataset.copy+' to clipboard'),()=>location.href='mailto:'+a.dataset.copy)}))}

function palette(extra=[]){const items=[...$$('section[id]').map(s=>[s.dataset.name||s.id,'#'+s.id,'section']),['copy email',links.email,'action'],['github',links.github,'link'],['linkedin',links.linkedin,'link'],...extra];
 const bg=document.createElement('div');bg.className='rvk-pal';bg.innerHTML='<div class="rvk-pal-box" role="dialog" aria-label="Command menu"><input placeholder="Jump to…  (↑ ↓ ⏎)" autocomplete="off"><ul></ul><div class="rvk-pal-ft"><span>esc to close</span><span>⌘K / ctrl K</span></div></div>';document.body.appendChild(bg);
 const inp=$('input',bg),ul=$('ul',bg);let sel=0,shown=items;
 const render=()=>{ul.innerHTML=shown.map((it,i)=>`<li class="${i===sel?'sel':''}" data-i="${i}"><span>${it[0]}</span><em>${it[2]}</em></li>`).join('')};
 const open=()=>{bg.classList.add('open');inp.value='';shown=items;sel=0;render();setTimeout(()=>inp.focus(),10)},close=()=>bg.classList.remove('open');
 const go=it=>{close();if(it[2]==='section')$(it[1]).scrollIntoView({behavior:'smooth'});else if(it[2]==='action'){navigator.clipboard&&navigator.clipboard.writeText(it[1]);toast('✓ copied '+it[1])}else if(it[1].startsWith('fn:'))window[it[1].slice(3)]();else window.open(it[1],'_blank','noopener')};
 bg.onclick=e=>{if(e.target===bg)close()};ul.onclick=e=>{const li=e.target.closest('li');if(li)go(shown[+li.dataset.i])};
 inp.oninput=()=>{const q=inp.value.toLowerCase();shown=items.filter(i=>i[0].toLowerCase().includes(q));sel=0;render()};
 addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();bg.classList.contains('open')?close():open();return}
  if(!bg.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowDown'){sel=Math.min(sel+1,shown.length-1);render();e.preventDefault()}if(e.key==='ArrowUp'){sel=Math.max(sel-1,0);render();e.preventDefault()}if(e.key==='Enter'&&shown[sel])go(shown[sel])});
 return open}

/* scroll progress rendered as a training run */
function epoch(fn){const secs=$$('section[id]');const u=()=>{const h=document.documentElement.scrollHeight-innerHeight;const p=h>0?Math.min(scrollY/h,1):0;
 const ep=Math.min(secs.length,1+Math.floor(p*secs.length));const loss=(0.9*Math.exp(-3.2*p)+0.031+Math.sin(p*40)*0.004).toFixed(3);fn({p,ep,n:secs.length,loss})};addEventListener('scroll',u,{passive:true});u()}

function activeNav(sel,cls='on'){const as=$$(sel);const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)as.forEach(a=>a.classList.toggle(cls,a.dataset.s===e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});$$('section[id]').forEach(s=>io.observe(s))}

async function typeRoles(el){const sl=ms=>new Promise(r=>setTimeout(r,ms));if(reduce){el.textContent=roles[0];return}let i=0;
 while(true){const r=roles[i++%roles.length];for(const c of r){el.textContent+=c;await sl(50+Math.random()*30)}await sl(1900);while(el.textContent.length){el.textContent=el.textContent.slice(0,-1);await sl(22)}await sl(260)}}

function detect(sel,start=400,step=420){$$(sel).forEach((d,i)=>{if(!d.querySelector('.tag'))d.insertAdjacentHTML('afterbegin','<span class="mask"></span><span class="box"></span><span class="tag">'+d.dataset.l+'</span>');
 setTimeout(()=>d.classList.add('on'),reduce?0:start+i*step);setTimeout(()=>d.classList.add('seg'),reduce?0:start+300+i*step)})}

function spotlight(sel){$$(sel).forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}))}

function crosshair(){if(!fine||reduce)return;const x=document.createElement('div');x.className='rvk-xh';x.innerHTML='<i class="h"></i><i class="v"></i><b></b>';document.body.appendChild(x);
 const b=$('b',x);addEventListener('pointermove',e=>{x.style.setProperty('--x',e.clientX+'px');x.style.setProperty('--y',e.clientY+'px');b.textContent=`x:${e.clientX} y:${e.clientY+Math.round(scrollY)}`;x.classList.add('on')},{passive:true});
 document.addEventListener('pointerleave',()=>x.classList.remove('on'))}

/* live line chart */
function chart(cv,o){const cx=cv.getContext('2d');let W,H,data=walk(110,3,.28);
 const sz=()=>{const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);draw()};
 function draw(){if(!W)return;const col=o.col,grid=o.grid,onTick=o.onTick;cx.clearRect(0,0,W,H);const mn=Math.min(...data)-2,mx=Math.max(...data)+2,y=v=>H-10-(v-mn)/(mx-mn)*(H-20),x=i=>i/(data.length-1)*(W-6);
  cx.strokeStyle=grid;cx.lineWidth=1;for(let i=1;i<4;i++){cx.beginPath();cx.moveTo(0,H*i/4);cx.lineTo(W,H*i/4);cx.stroke()}
  const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,col+'38');g.addColorStop(1,col+'00');
  cx.beginPath();data.forEach((v,i)=>i?cx.lineTo(x(i),y(v)):cx.moveTo(0,y(v)));cx.lineTo(x(data.length-1),H);cx.lineTo(0,H);cx.fillStyle=g;cx.fill();
  cx.beginPath();data.forEach((v,i)=>i?cx.lineTo(x(i),y(v)):cx.moveTo(0,y(v)));cx.strokeStyle=col;cx.lineWidth=1.5;cx.stroke();
  const ly=y(data[data.length-1]);cx.setLineDash([3,3]);cx.strokeStyle=col+'70';cx.beginPath();cx.moveTo(0,ly);cx.lineTo(W,ly);cx.stroke();cx.setLineDash([]);
  cx.fillStyle=col;cx.beginPath();cx.arc(x(data.length-1),ly,3,0,7);cx.fill();onTick&&onTick(data[data.length-1],data[data.length-1]-data[data.length-2])}
 new ResizeObserver(sz).observe(cv);if(!reduce)setInterval(()=>{data.push(data[data.length-1]+(Math.random()-.44)*3);data.shift();draw()},800)}

/* synthetic detection / segmentation / tracking demo */
function cvDemo(cv,info,op={}){const period=op.period||3600;const cx=cv.getContext('2d');let W=0,H=0;
 const sz=()=>{const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0)};new ResizeObserver(sz).observe(cv);
 const O=[{n:'car',x:.08,y:.6,w:.22,h:.18,vx:.0015,sh:0},{n:'person',x:.6,y:.4,w:.07,h:.32,vx:-.0009,sh:1},{n:'bicycle',x:.34,y:.55,w:.13,h:.2,vx:.0011,sh:2},{n:'person',x:.84,y:.43,w:.06,h:.29,vx:-.0006,sh:1}].map((o,i)=>({...o,id:i+1,tr:[]}));
 const modes=['DETECT · RF-DETR','SEGMENT · SAM','TRACK · multi-object','QUERY · OWLv2 "a person"'];let vis=true;
 new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(cv);
 function f(t){requestAnimationFrame(f);if(!vis||!W)return;const bg=op.bg||'#050607',ink=op.ink||'#3a3f47',line=op.line||'#ffffff12',cols=op.cols||['#c8ff2e','#ff3d9a','#2ee6ff','#ff3d9a'];O.forEach((o,i)=>o.c=cols[i%cols.length]);const mode=reduce?0:Math.floor(t/period)%4;
  cx.fillStyle=bg;cx.fillRect(0,0,W,H);cx.strokeStyle=line;cx.lineWidth=1;for(let i=0;i<9;i++){cx.beginPath();cx.moveTo(W/2,H*.32);cx.lineTo(i/8*W*1.8-W*.4,H);cx.stroke()}cx.beginPath();cx.moveTo(0,H*.32);cx.lineTo(W,H*.32);cx.stroke();
  let shown=0;
  for(const o of O){if(!reduce){o.x+=o.vx;if(o.x>1)o.x=-o.w;if(o.x<-o.w)o.x=1}const X=o.x*W,Y=o.y*H,w=o.w*W,h=o.h*H;cx.fillStyle=ink;cx.strokeStyle=ink;
   if(o.sh===0){cx.fillRect(X,Y+h*.35,w,h*.42);cx.fillRect(X+w*.2,Y+h*.05,w*.55,h*.35);cx.beginPath();cx.arc(X+w*.22,Y+h*.82,h*.16,0,7);cx.arc(X+w*.78,Y+h*.82,h*.16,0,7);cx.fill()}
   else if(o.sh===1){cx.beginPath();cx.arc(X+w/2,Y+h*.1,w*.33,0,7);cx.fill();cx.fillRect(X+w*.18,Y+h*.2,w*.64,h*.45);cx.fillRect(X+w*.2,Y+h*.65,w*.22,h*.35);cx.fillRect(X+w*.58,Y+h*.65,w*.22,h*.35)}
   else{cx.lineWidth=2.5;cx.beginPath();cx.arc(X+h*.22,Y+h*.76,h*.2,0,7);cx.stroke();cx.beginPath();cx.arc(X+w-h*.22,Y+h*.76,h*.2,0,7);cx.stroke();cx.fillRect(X+w*.32,Y,w*.32,h*.5);cx.lineWidth=1}
   if(mode===3&&o.n!=='person')continue;shown++;
   if(mode===1){cx.fillStyle=o.c+'55';cx.beginPath();cx.ellipse(X+w/2,Y+h/2,w*.52,h*.52,0,0,7);cx.fill()}
   if(mode===2){o.tr.push([X+w/2,Y+h]);if(o.tr.length>70)o.tr.shift();cx.strokeStyle=o.c;cx.lineWidth=1.5;cx.beginPath();o.tr.forEach(([a,b],i)=>i?cx.lineTo(a,b):cx.moveTo(a,b));cx.stroke()}else o.tr=[];
   cx.strokeStyle=o.c;cx.lineWidth=1.5;cx.strokeRect(X,Y,w,h);
   const lab=mode===2?`${o.n} #${o.id}`:mode===3?`"a person" ${(0.81+o.id*.03).toFixed(2)}`:`${o.n} ${(0.9+((o.id*13)%9)/100).toFixed(2)}`;
   cx.font='600 10px "JetBrains Mono",ui-monospace,monospace';const tw=cx.measureText(lab).width+8;cx.fillStyle=o.c;cx.fillRect(X-.75,Y-14,tw,14);cx.fillStyle='#000';cx.fillText(lab,X+3,Y-4)}
  if(info)info.textContent=`▶ ${modes[mode]} · ${shown} obj · ${(14+Math.sin(t/500)*1.4).toFixed(1)} ms`}
 requestAnimationFrame(f)}

/* subtle background: drifting tracked points with ids */
function tracks(cv,{cols,dot='#ffffff28',max=40}){if(reduce)return;const cx=cv.getContext('2d');let W,H;const sz=()=>{const d=devicePixelRatio||1;W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0)};sz();addEventListener('resize',sz);
 const P=Array.from({length:Math.min(max,Math.floor(innerWidth/34))},(_,i)=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,id:i+1,t:[],c:cols[i%cols.length],tr:Math.random()<.2}));
 let mx=-1e4,my=-1e4;addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
 (function f(){cx.clearRect(0,0,W,H);for(const p of P){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);if(d<120){p.x+=dx/d;p.y+=dy/d}
  if(p.tr){p.t.push([p.x,p.y]);if(p.t.length>36)p.t.shift();cx.strokeStyle=p.c+'40';cx.lineWidth=1;cx.beginPath();p.t.forEach(([x,y],i)=>i?cx.lineTo(x,y):cx.moveTo(x,y));cx.stroke();cx.strokeStyle=p.c+'80';cx.strokeRect(p.x-9,p.y-9,18,18);cx.fillStyle=p.c+'a0';cx.font='9px "JetBrains Mono",monospace';cx.fillText('id:'+p.id,p.x-9,p.y-12)}
  cx.fillStyle=p.tr?p.c:dot;cx.beginPath();cx.arc(p.x,p.y,p.tr?1.8:1.1,0,7);cx.fill()}requestAnimationFrame(f)})()}

function tape(el){const t=[['PYTORCH',1],['LANGGRAPH',1],['OWLV2',1],['SAM',1],['RF-DETR',1],['BEVFORMER',1],['OPENCV',1],['RAG',1],['GEMINI',1],['VERTEX',1],['AZURE',0],['DOCKER',1],['SPARK',0],['QDRANT',1],['WEAVIATE',1],['FASTAPI',1],['LLAMA3',1],['FFMPEG',1]];
 let s=7;const r=()=>(s=(s*9301+49297)%233280)/233280;const h=t.map(([k,u])=>`<span class="tk"><b>${k}</b> ${(r()*900+100).toFixed(2)} <span class="${u?'up':'dn'}">${u?'▲':'▼'}${(r()*4+.2).toFixed(2)}%</span></span>`).join('');el.innerHTML=`<div class="tape-in">${h}${h}</div>`}

/* shared css for palette, toast, crosshair */
const css=document.createElement('style');css.textContent=`
.rvk-pal{position:fixed;inset:0;z-index:300;display:none;align-items:flex-start;justify-content:center;padding-top:16vh;background:#0007;backdrop-filter:blur(4px)}
.rvk-pal.open{display:flex}.rvk-pal-box{width:min(560px,92vw);background:var(--pal-bg,#111);color:var(--pal-fg,#ddd);border:1px solid var(--pal-ln,#333);border-radius:var(--pal-r,10px);box-shadow:0 40px 100px #0009;overflow:hidden;font:14px var(--mono,monospace)}
.rvk-pal input{width:100%;background:transparent;border:0;border-bottom:1px solid var(--pal-ln,#333);padding:16px 18px;color:inherit;font:inherit;outline:none}
.rvk-pal ul{list-style:none;max-height:320px;overflow:auto;padding:6px;margin:0}.rvk-pal li{display:flex;justify-content:space-between;padding:10px 12px;border-radius:6px;cursor:pointer;opacity:.75}
.rvk-pal li.sel{background:var(--pal-sel,#ffffff12);opacity:1}.rvk-pal li em{font-style:normal;opacity:.5;font-size:12px}.rvk-pal-ft{display:flex;justify-content:space-between;padding:8px 16px;border-top:1px solid var(--pal-ln,#333);font-size:11px;opacity:.5}
#rvk-toast{position:fixed;left:50%;bottom:56px;transform:translate(-50%,20px);opacity:0;z-index:310;background:var(--toast-bg,#111);color:var(--toast-fg,#c8ff2e);border:1px solid var(--pal-ln,#333);padding:10px 16px;font:13px var(--mono,monospace);border-radius:var(--pal-r,8px);transition:.3s;pointer-events:none}
#rvk-toast.show{opacity:1;transform:translate(-50%,0)}
.rvk-xh{position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;transition:opacity .3s}.rvk-xh.on{opacity:1}
.rvk-xh i{position:absolute;background:var(--xh,#ffffff10)}.rvk-xh .h{left:0;right:0;height:1px;top:var(--y)}.rvk-xh .v{top:0;bottom:0;width:1px;left:var(--x)}
.rvk-xh b{position:absolute;left:calc(var(--x) + 10px);top:calc(var(--y) + 10px);font:500 10px var(--mono,monospace);color:var(--xh-t,#ffffff50);letter-spacing:.5px}
@media(pointer:coarse){.rvk-xh{display:none}}`;document.head.appendChild(css);

return{reduce,fine,$,$$,skills,projects,edu,links,roles,walk,spark,pct,counters,scramble,reveal,nyc,clock,toast,copyable,palette,epoch,activeNav,typeRoles,detect,spotlight,crosshair,chart,cvDemo,tracks,tape}
})();
