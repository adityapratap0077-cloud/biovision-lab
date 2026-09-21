/* ============ BioVision Lab · app.js ============ */
"use strict";
const $  = (id) => document.getElementById(id);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- nav ---------- */
(() => {
  const toggle = $("navToggle"), links = $("navLinks");
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  $$(".nav-link").forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open");
    $$(".nav-link").forEach(x => x.classList.remove("active"));
    a.classList.add("active");
  }));
  // scroll spy
  const secs = ["home","dna","heart","cell","quiz"].map(id => $(id));
  const linkFor = id => $( "navLinks" ).querySelector(`a[href="#${id}"]`);
  window.addEventListener("scroll", () => {
    let cur = "home";
    secs.forEach(s => { if (s && window.scrollY >= s.offsetTop - 160) cur = s.id; });
    $$(".nav-link").forEach(x => x.classList.toggle("active", x.getAttribute("href") === "#" + cur));
  }, { passive:true });
})();

/* ---------- canvas helpers ---------- */
function fitCanvas(c){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = c.clientWidth, h = c.clientHeight;
  if (c.width !== Math.round(w*dpr) || c.height !== Math.round(h*dpr)){
    c.width = Math.round(w*dpr); c.height = Math.round(h*dpr);
  }
  const ctx = c.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return { ctx, w, h };
}
window.addEventListener("resize", () => { fitCanvas($("heroCanvas")); fitCanvas($("dnaCanvas")); });

/* ---------- HERO: drifting DNA helixes + particles ---------- */
(() => {
  const c = $("heroCanvas");
  let parts = [];
  function seed(w,h){
    parts = Array.from({length: Math.min(70, w/14)}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*2.2+0.6, s: Math.random()*0.35+0.12,
      a: Math.random()*0.5+0.15, hue: Math.random()<0.6 ? "45,212,191" : "52,211,153"
    }));
  }
  let phase = 0, seeded = false;
  function helix(ctx,w,h,ox,alpha,amp,dir){
    const top=-40, bot=h+40;
    const L=[], R=[];
    for(let y=top; y<=bot; y+=10){
      const th = (y-top)*0.045 + phase*dir;
      const x = ox + Math.sin(th)*amp;
      L.push([x,y]); R.push([2*ox-x,y]);
    }
    ctx.strokeStyle = `rgba(45,212,191,${alpha})`; ctx.lineWidth=3;
    ctx.beginPath(); L.forEach(([x,y],i)=> i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.stroke();
    ctx.beginPath(); R.forEach(([x,y],i)=> i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.stroke();
    ctx.strokeStyle = `rgba(52,211,153,${alpha*0.7})`; ctx.lineWidth=2;
    for(let i=0;i<L.length;i+=4){
      ctx.beginPath(); ctx.moveTo(L[i][0],L[i][1]); ctx.lineTo(R[i][0],R[i][1]); ctx.stroke();
    }
  }
  function frame(){
    const {ctx,w,h} = fitCanvas(c);
    if(!seeded || parts.length===0){ seed(w,h); seeded=true; }
    ctx.clearRect(0,0,w,h);
    if(!reducedMotion) phase += 0.008;
    helix(ctx,w,h, w*0.18, 0.20, 60, 1);
    helix(ctx,w,h, w*0.82, 0.15, 74,-1);
    helix(ctx,w,h, w*0.55, 0.08, 46, 1);
    parts.forEach(p=>{
      if(!reducedMotion){ p.y -= p.s; if(p.y < -6){ p.y = h+6; p.x = Math.random()*w; } }
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7);
      ctx.fillStyle = `rgba(${p.hue},${p.a})`; ctx.fill();
    });
    // vignette fade at bottom into page
    const g = ctx.createLinearGradient(0,h*0.72,0,h);
    g.addColorStop(0,"rgba(5,10,18,0)"); g.addColorStop(1,"rgba(5,10,18,1)");
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ---------- DNA REPLICATION module ---------- */
const ENZYMES = [
  { name:"Helicase",        color:"#f472b6", steps:[0,1] },
  { name:"Primase",         color:"#fbbf24", steps:[2]   },
  { name:"DNA Polymerase",  color:"#34d399", steps:[3]   },
  { name:"Ligase",          color:"#a78bfa", steps:[4]   },
];
const DNA_STEPS = [
  {
    title:"Initiation",
    text:"Replication begins at specific origins — oriC in bacteria, and many origins along each eukaryotic chromosome. Initiator proteins melt the double helix and load helicase, forming the pre-replication complex. This is the most tightly regulated step of the cell cycle: each origin fires only once per division.",
    marker:{ label:"Helicase loading at oriC", color:"#f472b6" }
  },
  {
    title:"Unwinding",
    text:"Helicase races ahead of the fork, breaking hydrogen bonds between base pairs (about 1,000 bp per second in E. coli). Single-strand binding proteins (SSBs) keep the exposed strands apart, while topoisomerase relieves the torsional strain building up ahead. The result is the classic Y-shaped replication fork.",
    marker:{ label:"Helicase unwinding", color:"#f472b6" }
  },
  {
    title:"Primer synthesis",
    text:"DNA polymerases have one strict rule: they can only add nucleotides to an existing 3′-OH group — they cannot start a chain from nothing. Primase solves this by laying down a short RNA primer (~10 nucleotides) complementary to each template strand, giving polymerase its starting point.",
    marker:{ label:"Primase laying RNA primer", color:"#fbbf24" }
  },
  {
    title:"Elongation",
    text:"DNA polymerase III extends the primers 5′→3′. The leading strand is built continuously toward the fork, while the lagging strand is synthesized away from the fork in short Okazaki fragments (~1,000–2,000 nt in bacteria, ~100–200 in eukaryotes). DNA polymerase I then swaps each RNA primer for DNA.",
    marker:{ label:"DNA Pol III extending", color:"#34d399" }
  },
  {
    title:"Termination",
    text:"DNA ligase seals the nicks between Okazaki fragments, forging continuous phosphodiester backbones. In circular bacterial chromosomes replication ends at ter sites; in eukaryotes, telomerase protects the chromosome ends from shortening. The payoff: two identical, semi-conservative DNA molecules — each with one old and one new strand.",
    marker:{ label:"Ligase sealing nicks", color:"#a78bfa" }
  },
];
const dna = { step:0, progress:1, playing:false, phase:0 };

function renderDnaUI(){
  const s = DNA_STEPS[dna.step];
  $("dnaStepCount").textContent = `STEP ${dna.step+1} / ${DNA_STEPS.length}`;
  $("dnaStepTitle").textContent = s.title;
  $("dnaStepText").textContent  = s.text;
  $("btnDnaPlay").innerHTML = dna.playing ? "⏸ Pause" : "▶ Play";
  // pills
  const pills = $("stepPills"); pills.innerHTML = "";
  DNA_STEPS.forEach((st,i)=>{
    const b = document.createElement("button");
    b.className = "pill" + (i===dna.step ? " active" : "");
    b.textContent = st.title.split(" ")[0];
    b.addEventListener("click", ()=>{ dna.step=i; dna.progress=1; dna.playing=false; renderDnaUI(); });
    pills.appendChild(b);
  });
  // enzyme chips
  const row = $("enzymeChips"); row.innerHTML = "";
  ENZYMES.forEach(e=>{
    const on = e.steps.includes(dna.step);
    const d = document.createElement("span");
    d.className = "enzyme-chip" + (on ? " active" : "");
    if(on){ d.style.background = e.color; }
    d.innerHTML = `<i style="color:${e.color}"></i>${e.name}`;
    row.appendChild(d);
  });
}
$("btnDnaPrev").addEventListener("click", ()=>{ dna.step=(dna.step+DNA_STEPS.length-1)%DNA_STEPS.length; dna.progress=1; dna.playing=false; renderDnaUI(); });
$("btnDnaNext").addEventListener("click", ()=>{ dna.step=(dna.step+1)%DNA_STEPS.length; dna.progress=1; dna.playing=false; renderDnaUI(); });
$("btnDnaPlay").addEventListener("click", ()=>{
  if(dna.playing){ dna.playing=false; }
  else{
    if(dna.progress>=1){ dna.step = (dna.step>=DNA_STEPS.length-1) ? 0 : dna.step+1; dna.progress=0; }
    dna.playing = true;
  }
  renderDnaUI();
});

function drawDNA(){
  const c = $("dnaCanvas");
  const {ctx,w,h} = fitCanvas(c);
  const dt = 1/60;
  if(!reducedMotion) dna.phase += dt*1.4;

  if(dna.playing){
    dna.progress += dt/2.4;
    if(dna.progress >= 1){
      dna.progress = 1;
      if(dna.step < DNA_STEPS.length-1){ dna.step++; dna.progress = 0; }
      else { dna.playing = false; }
      renderDnaUI();
    }
  }

  const step = dna.step, prog = dna.progress;
  const cx = w/2, y0 = 30, y1 = h-30, fy = (y0+y1)/2;
  const A = Math.min(46, w*0.09), sigma = 100;
  const gauss = y => Math.exp(-((y-fy)*(y-fy))/(2*sigma*sigma));
  const open = step===0 ? 0 : step===1 ? prog : 1;
  const primerP = step===2 ? prog : step>2 ? 1 : 0;
  const elongP  = step===3 ? prog : step>3 ? 1 : 0;
  const sealP   = step===4 ? prog : 0;
  const ph = dna.phase;

  ctx.clearRect(0,0,w,h);

  const xAt = (y, side) => {
    const th = (y-y0)*0.052 + ph;
    const off = A*Math.sin(th);
    const extra = open*80*gauss(y);
    return side<0 ? cx-off-extra : cx+off+extra;
  };

  // rungs (base pairs) — only where helix is still zipped
  for(let y=y0+8; y<y1-8; y+=15){
    if(gauss(y) > 0.42) continue;
    const th = (y-y0)*0.052 + ph;
    const even = Math.round((y-y0)/15)%2===0;
    ctx.strokeStyle = even ? "rgba(45,212,191,.75)" : "rgba(52,211,153,.75)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(xAt(y,-1),y); ctx.lineTo(xAt(y,1),y); ctx.stroke();
  }

  // parental strands
  const strand = side => {
    ctx.beginPath();
    for(let y=y0; y<=y1; y+=4){
      const x = xAt(y,side);
      y===y0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.strokeStyle = "rgba(45,212,191,.16)"; ctx.lineWidth = 9; ctx.stroke();
    ctx.strokeStyle = "#2dd4bf"; ctx.lineWidth = 4; ctx.stroke();
  };
  strand(-1); strand(1);

  // 5' / 3' polarity labels (antiparallel)
  ctx.font = "600 11px 'JetBrains Mono', monospace"; ctx.fillStyle = "#8fa3bf";
  ctx.fillText("5′", xAt(y0,-1)-26, y0+4);  ctx.fillText("3′", xAt(y0,1)+12, y0+4);
  ctx.fillText("3′", xAt(y1,-1)-26, y1+4);   ctx.fillText("5′", xAt(y1,1)+12, y1+4);

  // primers (short red ticks at fork boundary)
  if(primerP > 0){
    const yT = fy - sigma*1.15, yB = fy + sigma*1.15;
    ctx.strokeStyle = "#f87171"; ctx.lineWidth = 6; ctx.lineCap = "round";
    [[yT,-1],[yT,1],[yB,-1],[yB,1]].forEach(([y,s])=>{
      const x = xAt(y,s);
      ctx.globalAlpha = primerP;
      ctx.beginPath(); ctx.moveTo(x, y-9*primerP); ctx.lineTo(x, y+9*primerP); ctx.stroke();
    });
    ctx.globalAlpha = 1; ctx.lineCap = "butt";
  }

  // new strands during elongation
  if(elongP > 0){
    const len = sigma*1.5*elongP;
    ctx.lineWidth = 4;
    // leading strand — continuous (left)
    ctx.strokeStyle = "rgba(52,211,153,.25)"; ctx.lineWidth = 8;
    ctx.beginPath();
    for(let y=fy-len; y<=fy+len; y+=4){ const x=xAt(y,-1)+11; y<=fy-len+1?ctx.moveTo(x,y):ctx.lineTo(x,y); }
    ctx.stroke();
    ctx.strokeStyle = "#34d399"; ctx.lineWidth = 4; ctx.stroke();
    // lagging strand — Okazaki fragments (right)
    ctx.strokeStyle = "#34d399"; ctx.lineWidth = 4; ctx.lineCap="round";
    for(let y=fy-len; y<fy+len; y+=38){
      const y2 = Math.min(y+24, fy+len);
      ctx.beginPath();
      for(let yy=y; yy<=y2; yy+=4){ const x=xAt(yy,1)-11; yy<=y+1?ctx.moveTo(x,yy):ctx.lineTo(x,yy); }
      ctx.stroke();
    }
    ctx.lineCap="butt";
  }

  // ligase seal sparkles
  if(sealP > 0){
    const pts = [[fy-sigma*0.8],[fy],[fy+sigma*0.8]];
    pts.forEach(([y],i)=>{
      const tw = 0.5 + 0.5*Math.sin(ph*6 + i*2.1);
      const r = (5+5*tw)*sealP;
      const x = cx;
      const g = ctx.createRadialGradient(x,y,0,x,y,r*3);
      g.addColorStop(0,`rgba(167,139,250,${0.85*sealP})`); g.addColorStop(1,"rgba(167,139,250,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r*3,0,7); ctx.fill();
      ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x-r*1.6,y); ctx.lineTo(x+r*1.6,y);
      ctx.moveTo(x,y-r*1.6); ctx.lineTo(x,y+r*1.6);
      ctx.stroke();
    });
  }

  // replication fork marker ring
  if(step>=1){
    const pulse = 10 + 4*Math.sin(ph*5);
    ctx.strokeStyle = DNA_STEPS[step].marker.color; ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(cx, fy, pulse+open*46, 0, 7); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // initiation pulse at oriC
  if(step===0){
    const pulse = 8 + 6*Math.sin(ph*4);
    ctx.strokeStyle = "#f472b6"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, fy, pulse+8, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, fy, 4, 0, 7); ctx.fillStyle="#f472b6"; ctx.fill();
  }

  // enzyme marker label
  const m = DNA_STEPS[step].marker;
  const my = step<=1 ? fy-118 : step===2 ? fy-sigma*1.15-26 : step===3 ? fy-sigma*0.9 : fy+sigma*0.8+30;
  const bobY = my + Math.sin(ph*2.2)*5;
  ctx.font = "700 12px Inter, sans-serif";
  const tw = ctx.measureText(m.label).width;
  const lx = Math.min(Math.max(cx - tw/2, 8), w - tw - 24);
  ctx.fillStyle = "rgba(5,10,18,.85)";
  ctx.strokeStyle = m.color; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(lx-10, bobY-18, tw+20, 26, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(lx-2, bobY-5, 4, 0, 7); ctx.fill();
  ctx.fillStyle = "#e8f1ff"; ctx.fillText(m.label, lx+8, bobY);

  requestAnimationFrame(drawDNA);
}
renderDnaUI();
drawDNA();

/* ---------- HEART module ---------- */
(() => {
  const svg = $("heartSvg");
  const beat = $("heartBeat");
  const labels = $("heartLabels");
  const dotsG = $("flowDots");
  const slider = $("bpmSlider");
  let bpm = 72, flowOn = true;

  function bpmStateText(b){
    if(b < 60)  return "· slow — athlete mode";
    if(b <= 100) return "· resting";
    return "· elevated — cardio zone";
  }
  function applyBpm(){
    bpm = parseInt(slider.value, 10);
    $("bpmValue").textContent = bpm;
    $("bpmState").textContent = bpmStateText(bpm);
    beat.style.animationDuration = (60/bpm).toFixed(3) + "s";
  }
  slider.addEventListener("input", applyBpm);
  applyBpm();

  const tglL = $("toggleLabels"), tglF = $("toggleFlow");
  tglL.addEventListener("click", ()=>{
    const on = tglL.classList.toggle("on");
    tglL.setAttribute("aria-pressed", on);
    labels.style.display = on ? "" : "none";
  });
  tglF.addEventListener("click", ()=>{
    const on = tglF.classList.toggle("on");
    tglF.setAttribute("aria-pressed", on);
    flowOn = on;
    dotsG.style.display = on ? "" : "none";
  });

  // blood-flow dots along the circulation paths
  const segs = [
    { el:$("pathBlue"),  color:"#60a5fa" },
    { el:$("pathBlue2"), color:"#60a5fa" },
    { el:$("pathRed"),   color:"#f87171" },
    { el:$("pathRed2"),  color:"#f87171" },
    { el:$("pathRed3"),  color:"#f87171" },
  ];
  let total = 0;
  const lens = segs.map(s => { const L = s.el.getTotalLength(); total += L; return L; });
  const N = 26;
  const dots = Array.from({length:N}, (_,i)=>({ d: (i/N)*total }));
  const NS = "http://www.w3.org/2000/svg";
  const nodes = dots.map(()=>{
    const g = document.createElementNS(NS,"g");
    const halo = document.createElementNS(NS,"circle");
    halo.setAttribute("r","8"); halo.setAttribute("opacity","0.25");
    const core = document.createElementNS(NS,"circle");
    core.setAttribute("r","4");
    g.appendChild(halo); g.appendChild(core);
    dotsG.appendChild(g);
    return { g, halo, core };
  });

  let last = performance.now();
  function tick(now){
    const dt = Math.min((now-last)/1000, 0.05); last = now;
    if(flowOn){
      const circuitTime = (60/bpm)*6;          // one full circuit ≈ 6 beats
      const speed = total/circuitTime;
      dots.forEach((dot,i)=>{
        dot.d = (dot.d + speed*dt) % total;
        let acc = 0, si = 0;
        while(si < segs.length-1 && dot.d > acc + lens[si]){ acc += lens[si]; si++; }
        const pt = segs[si].el.getPointAtLength(dot.d - acc);
        const n = nodes[i];
        n.g.setAttribute("transform", `translate(${pt.x},${pt.y})`);
        n.core.setAttribute("fill", segs[si].color);
        n.halo.setAttribute("fill", segs[si].color);
      });
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------- CELL EXPLORER module ---------- */
const ORG_DATA = {
  nucleus:{ name:"Nucleus",
    func:"The control center of the cell. It stores the cell's genetic material (DNA) organized as chromatin, and directs all cellular activities — growth, metabolism and reproduction.",
    fact:"Uncoiled, the DNA packed inside one nucleus would stretch about 2 meters long." },
  mitochondria:{ name:"Mitochondria",
    func:"The site of aerobic respiration. Mitochondria burn glucose with oxygen to produce ATP — the cell's energy currency — through the Krebs cycle and oxidative phosphorylation on their folded inner membranes (cristae).",
    fact:"Mitochondria carry their own small circular DNA — inherited only from your mother." },
  ribosome:{ name:"Ribosomes",
    func:"Tiny molecular machines that translate mRNA into protein, linking amino acids into polypeptide chains. They float free in the cytoplasm or dock onto the rough ER.",
    fact:"A single cell can contain millions of ribosomes, each building ~200 amino acids per minute." },
  roughER:{ name:"Rough Endoplasmic Reticulum",
    func:"A maze of membranes studded with ribosomes. Newly made proteins enter the rough ER to be folded, modified, and packed into vesicles bound for the Golgi apparatus.",
    fact:"Its 'rough' texture under the microscope is literally thousands of ribosomes stuck to its surface." },
  smoothER:{ name:"Smooth Endoplasmic Reticulum",
    func:"Ribosome-free tubular network that synthesizes lipids and steroid hormones, detoxifies drugs and poisons, and stores calcium ions for muscle contraction and signaling.",
    fact:"Liver cells are loaded with smooth ER — it's what detoxifies alcohol and medication." },
  golgi:{ name:"Golgi Apparatus",
    func:"The cell's post office. It receives proteins and lipids from the ER, then modifies, sorts, tags and packages them into vesicles for secretion or delivery to their destination.",
    fact:"Discovered in 1898 by Camillo Golgi, who spotted it using a silver-staining technique." },
  membrane:{ name:"Cell Membrane",
    func:"A phospholipid bilayer that encloses the cell and controls what enters and exits. It is selectively permeable, studded with transport proteins, receptors and channels.",
    fact:"Only 7–10 nanometers thick — roughly 10,000× thinner than a human hair." },
  lysosome:{ name:"Lysosome",
    func:"The cell's recycling center. Lysosomes contain powerful hydrolytic enzymes that digest worn-out organelles, cellular waste and invading pathogens.",
    fact:"If a lysosome's membrane ruptures, its enzymes digest the whole cell — a process called autolysis." },
  vacuole:{ name:"Vacuole",
    func:"A fluid-filled sac that stores water, nutrients, pigments and waste. Animal cells have small vacuoles; plant cells rely on one giant central vacuole for turgor pressure.",
    fact:"A plant cell's central vacuole can occupy up to 90% of the cell's volume." },
};
(() => {
  const empty = $("cellCardEmpty"), body = $("cellCardBody");
  function openOrg(key){
    const d = ORG_DATA[key]; if(!d) return;
    $$(".org").forEach(g => g.classList.toggle("selected", g.dataset.org===key));
    $("cellInfoKicker").textContent = "ORGANELLE FILE · " + d.name.toUpperCase();
    $("cellInfoName").textContent = d.name;
    $("cellInfoFunc").textContent = d.func;
    $("cellInfoFact").textContent = d.fact;
    empty.hidden = true; body.hidden = false;
  }
  function closeCard(){
    empty.hidden = false; body.hidden = true;
    $$(".org").forEach(g => g.classList.remove("selected"));
  }
  $$(".org").forEach(g=>{
    g.addEventListener("click", ()=> openOrg(g.dataset.org));
    g.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openOrg(g.dataset.org); } });
  });
  $("cellInfoClose").addEventListener("click", closeCard);
})();

/* ---------- QUIZ module ---------- */
const QUESTIONS = [
  { topic:"DNA Replication",
    q:"Which enzyme unwinds the DNA double helix ahead of the replication fork?",
    opts:["DNA ligase","Helicase","Primase","DNA polymerase I"],
    a:1,
    why:"Helicase breaks the hydrogen bonds between base pairs, unzipping the duplex so each strand can be copied." },
  { topic:"DNA Replication",
    q:"Why does replication need an RNA primer?",
    opts:["RNA is more stable than DNA","DNA polymerase can only extend an existing 3′-OH end","Primers mark where genes begin","To prevent mutations"],
    a:1,
    why:"DNA polymerases cannot start a chain from nothing — primase lays down a short RNA primer that provides the free 3′-OH group polymerase needs." },
  { topic:"DNA Replication",
    q:"Okazaki fragments are synthesized on which strand?",
    opts:["The leading strand","Both strands equally","The lagging strand","Neither — they are primers"],
    a:2,
    why:"The lagging strand runs 3′→5′ toward the fork, so polymerase must work away from it in short discontinuous Okazaki fragments." },
  { topic:"DNA Replication",
    q:"Which enzyme seals the nicks between Okazaki fragments?",
    opts:["Topoisomerase","DNA polymerase III","DNA ligase","Primase"],
    a:2,
    why:"DNA ligase forms the missing phosphodiester bonds, joining fragments into one continuous strand." },
  { topic:"The Heart",
    q:"What is the correct path of blood through the heart?",
    opts:["Left atrium → left ventricle → lungs → right atrium → right ventricle",
          "Right atrium → right ventricle → lungs → left atrium → left ventricle",
          "Right ventricle → right atrium → left ventricle → left atrium → lungs",
          "Left ventricle → aorta → lungs → right atrium → vena cava"],
    a:1,
    why:"Deoxygenated blood enters the right side, goes to the lungs, returns oxygenated to the left side, and is pumped to the body." },
  { topic:"The Heart",
    q:"Which valve sits between the left atrium and the left ventricle?",
    opts:["Tricuspid valve","Pulmonary valve","Aortic valve","Mitral (bicuspid) valve"],
    a:3,
    why:"The mitral — or bicuspid — valve has two cusps and guards the left atrioventricular opening." },
  { topic:"The Heart",
    q:"The pulmonary artery is unusual because it carries…",
    opts:["Oxygenated blood to the body","Deoxygenated blood to the lungs","Oxygenated blood to the lungs","Deoxygenated blood to the body"],
    a:1,
    why:"Arteries usually carry oxygenated blood, but the pulmonary artery carries deoxygenated blood from the right ventricle to the lungs." },
  { topic:"The Heart",
    q:"Which heart chamber has the thickest muscular wall, and why?",
    opts:["Right atrium — it receives all body blood","Right ventricle — it pumps to the lungs","Left ventricle — it pumps blood to the entire body","Left atrium — it handles oxygenated blood"],
    a:2,
    why:"The left ventricle generates the highest pressure to push blood through the entire systemic circulation." },
  { topic:"The Cell",
    q:"Which organelle is the site of ATP production?",
    opts:["Ribosome","Golgi apparatus","Mitochondrion","Lysosome"],
    a:2,
    why:"Mitochondria perform aerobic respiration — the Krebs cycle and oxidative phosphorylation — yielding ~30–32 ATP per glucose." },
  { topic:"The Cell",
    q:"Proteins are modified, sorted and packaged by the…",
    opts:["Smooth ER","Golgi apparatus","Nucleolus","Vacuole"],
    a:1,
    why:"The Golgi apparatus is the cell's post office: it processes ER products and ships them in vesicles." },
  { topic:"The Cell",
    q:"Ribosomes are the site of…",
    opts:["Photosynthesis","Protein synthesis (translation)","Lipid synthesis","DNA replication"],
    a:1,
    why:"Ribosomes read mRNA codons and join amino acids into polypeptide chains — the process of translation." },
  { topic:"The Cell",
    q:"The cell membrane is primarily composed of…",
    opts:["A cellulose wall","A phospholipid bilayer","Layers of keratin","Chitin fibers"],
    a:1,
    why:"The fluid-mosaic membrane is a phospholipid bilayer with embedded proteins — selectively permeable and only ~8 nm thick." },
];
(() => {
  const start=$("quizStart"), main=$("quizMain"), done=$("quizDone");
  let qi=0, score=0, answered=false;

  const store = {
    get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
    set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  };
  const best = ()=>{ const v=parseInt(store.get("bvl_best")||"0",10); return isNaN(v)?0:v; };
  function paintBest(){
    const b=best(), t=b>0?`${b} / 12`:"—";
    $("quizBestStart").textContent=t; $("quizBest").textContent=t;
  }
  paintBest();

  $("btnStartQuiz").addEventListener("click", ()=>{
    qi=0; score=0; start.hidden=true; done.hidden=true; main.hidden=false; renderQ();
  });
  $("btnRetry").addEventListener("click", ()=>{
    qi=0; score=0; done.hidden=true; main.hidden=false; renderQ();
  });

  function renderQ(){
    answered=false;
    const Q=QUESTIONS[qi];
    $("quizQCount").textContent=`Q ${qi+1}/12`;
    $("quizTopic").textContent=Q.topic;
    $("quizProgress").style.width=(qi/12*100)+"%";
    $("quizQ").textContent=Q.q;
    const box=$("quizOpts"); box.innerHTML="";
    $("quizFeedback").hidden=true;
    $("btnNextQ").hidden=true;
    const keys=["A","B","C","D"];
    Q.opts.forEach((opt,i)=>{
      const b=document.createElement("button");
      b.className="opt";
      b.innerHTML=`<span class="key">${keys[i]}</span>${opt}`;
      b.addEventListener("click",()=>answer(i,b));
      box.appendChild(b);
    });
  }
  function answer(i,btn){
    if(answered) return; answered=true;
    const Q=QUESTIONS[qi];
    const btns=$$("#quizOpts .opt");
    btns.forEach(b=>b.disabled=true);
    const fb=$("quizFeedback"); fb.hidden=false;
    if(i===Q.a){
      score++;
      btn.classList.add("correct");
      fb.className="quiz-feedback good";
      fb.innerHTML=`<b>✓ Correct.</b> ${Q.why}`;
    }else{
      btn.classList.add("wrong");
      btns[Q.a].classList.add("correct");
      fb.className="quiz-feedback bad";
      fb.innerHTML=`<b>✗ Not quite.</b> ${Q.why}`;
    }
    $("quizProgress").style.width=((qi+1)/12*100)+"%";
    const nb=$("btnNextQ");
    nb.textContent = qi===QUESTIONS.length-1 ? "See results →" : "Next →";
    nb.hidden=false;
  }
  $("btnNextQ").addEventListener("click", ()=>{
    qi++;
    if(qi<QUESTIONS.length) renderQ(); else finish();
  });
  function finish(){
    main.hidden=true; done.hidden=false;
    $("quizScore").textContent=`${score} / 12`;
    let v, icon;
    if(score===12){ v="Flawless. Lab coat earned — you could teach this module. 🧬"; icon="🏆"; }
    else if(score>=9){ v="Excellent — publishable results. One quick review and you're perfect."; icon="🌟"; }
    else if(score>=6){ v="Solid benchwork. Revisit the modules above, then run it back."; icon="🔬"; }
    else if(score>=3){ v="Keep pipetting — scroll up, explore the modules, and retry."; icon="🧫"; }
    else { v="Back to the textbook! The DNA, heart and cell modules are waiting for you."; icon="📚"; }
    $("quizVerdict").textContent=v;
    $("quizDoneIcon").textContent=icon;
    if(score>best()) store.set("bvl_best", String(score));
    paintBest();
  }
})();

/* ---------- footer ---------- */
$("year").textContent = new Date().getFullYear();
