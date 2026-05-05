// ═══════════════════════════════════════════
//  AURA — app.js  (rep-counting, categorised)
// ═══════════════════════════════════════════

// DOM
const video   = document.getElementById('vid');
const canvas  = document.getElementById('pose-cv');
const ctx     = canvas.getContext('2d');

// ── Database ─────────────────────────────
const DB = {
    warmup: {
        label:'Warm-Up', color:'rgb(251,146,60)', badgeBg:'rgba(251,146,60,0.16)',
        desc:'Activate muscles and raise your heart rate before your main session.',
        exercises:[
            { id:'arm-circles', name:'Arm Circles', icon:'🔄', reps:12, cue:'Raise arms out to your sides — wide as possible',
              check: lm => Math.abs(lm[15].x - lm[11].x) > 0.22 && Math.abs(lm[16].x - lm[12].x) > 0.22 },
            { id:'high-knees',  name:'High Knees',  icon:'🏃', reps:20, cue:'Drive your knee up above hip height',
              check: lm => lm[25].y < lm[23].y || lm[26].y < lm[24].y },
            { id:'shoulder-rolls', name:'Shoulder Rolls', icon:'🌀', reps:10, cue:'Roll shoulders up toward your ears',
              check: lm => (lm[11].y + lm[12].y) / 2 < 0.38 },
            { id:'jacks', name:'Jumping Jacks', icon:'⭐', reps:15, cue:'Jump — arms up & legs wide',
              check: lm => lm[15].y < lm[0].y && lm[16].y < lm[0].y && Math.abs(lm[27].x - lm[28].x) > 0.28 }
        ]
    },
    workout: {
        label:'Workout', color:'#0070FF', badgeBg:'rgba(0,112,255,0.16)',
        desc:'Strength exercises. Each rep is detected the moment you complete the full movement.',
        exercises:[
            { id:'squats', name:'Squats', icon:'🏋️', reps:12, cue:'Lower hips — thighs near parallel',
              check: lm => ((lm[25].y + lm[26].y)/2) - ((lm[23].y + lm[24].y)/2) < 0.13 },
            { id:'pushups', name:'Push-Ups', icon:'💪', reps:10, cue:'Lower your chest toward the floor',
              check: lm => Math.abs((lm[11].y + lm[12].y)/2 - (lm[15].y + lm[16].y)/2) < 0.10 },
            { id:'lunges', name:'Lunges', icon:'🦵', reps:10, cue:'Step forward and lower your back knee',
              check: lm => (lm[25].y - lm[23].y > 0.28) || (lm[26].y - lm[24].y > 0.28) },
            { id:'burpees', name:'Burpees', icon:'🔥', reps:8,  cue:'Jump up — arms fully overhead',
              check: lm => lm[15].y < lm[0].y - 0.04 && lm[16].y < lm[0].y - 0.04 }
        ]
    },
    stretch: {
        label:'Stretch', color:'rgb(52,211,153)', badgeBg:'rgba(52,211,153,0.13)',
        desc:'Hold each position for 2–3 seconds. Breathe deeply and move with control.',
        exercises:[
            { id:'overhead', name:'Overhead Reach', icon:'🙌', reps:6, cue:'Raise both arms fully overhead and hold',
              check: lm => lm[15].y < lm[0].y - 0.05 && lm[16].y < lm[0].y - 0.05 },
            { id:'side-bend', name:'Side Bend', icon:'↔️', reps:8, cue:'Lean sideways — arm reaching over head',
              check: lm => Math.abs(lm[15].y - lm[16].y) > 0.24 },
            { id:'forward-fold', name:'Forward Fold', icon:'🙇', reps:6, cue:'Bend forward — reach toward your feet',
              check: lm => lm[0].y > (lm[23].y + lm[24].y)/2 + 0.08 }
        ]
    }
};

// ── State ─────────────────────────────────
let catId      = null;
let activeEx   = null;
let reps       = 0;
let inPos      = false;
let formPct    = 0;
let camOk      = false;
let mpOk       = false;
let mpCamera   = null;
let mpPose     = null;

// ── Screens ───────────────────────────────
const SCRIDS = ['s-splash','s-cat','s-list','s-active'];
function go(id) { SCRIDS.forEach(s => document.getElementById(s).classList.toggle('off', s !== id)); }

// ── Splash ────────────────────────────────
document.getElementById('btn-start').addEventListener('click', () => {
    startCamera();
    go('s-cat');
    gsap.from('.cat-card', { opacity:0, y:28, stagger:.1, duration:.65, ease:'power3.out' });
});

// ── Category → List ───────────────────────
function showList(id) {
    if (id) catId = id;          // null = reuse current catId
    const cat = DB[catId];
    document.getElementById('bc-cat').textContent     = cat.label;
    document.getElementById('list-phase').textContent = cat.label;
    document.getElementById('list-desc').textContent  = cat.desc;

    const ul = document.getElementById('ex-list');
    ul.innerHTML = '';
    cat.exercises.forEach(ex => {
        const d = document.createElement('div');
        d.className = 'ex-card';
        d.innerHTML = `
          <div class="ex-ico">${ex.icon}</div>
          <div class="ex-info">
            <h4>${ex.name}</h4>
            <p>${ex.cue}</p>
          </div>
          <div class="ex-reps">
            <span style="color:${cat.color}">${ex.reps}</span>
            <small>reps</small>
          </div>`;
        d.addEventListener('click', () => launch(ex));
        ul.appendChild(d);
    });

    go('s-list');
    gsap.from('.ex-card', { opacity:0, x:-18, stagger:.06, duration:.45, ease:'power2.out' });
}

function showCat() { stopEx(); go('s-cat'); }

// ── Launch Exercise ───────────────────────
function launch(ex) {
    const cat = DB[catId];
    activeEx = ex; reps = 0; inPos = false; formPct = 0;

    // Breadcrumb
    document.getElementById('ab-cat').textContent = cat.label;
    document.getElementById('ab-ex').textContent  = ex.name;

    // Badge
    const b = document.getElementById('act-badge');
    b.textContent = cat.label;
    b.style.cssText += `background:${cat.badgeBg};color:${cat.color};border:1px solid ${cat.color}44;`;

    // Labels
    document.getElementById('act-name').textContent = ex.name;
    document.getElementById('act-cue').textContent  = ex.cue;
    document.getElementById('rep-n').textContent    = '0';
    document.getElementById('rep-t').textContent    = ` / ${ex.reps}`;
    document.getElementById('ff').style.width       = '0%';
    document.getElementById('align').textContent    = '–';

    go('s-active');
    if (camOk && !mpOk) initMP();
    setStatus('blue', ex.cue);

    // Card slide-in
    const card = document.querySelector('.panel-card');
    gsap.from(card, { opacity:0, x:40, duration:.7, ease:'power3.out' });
}

function stopEx() { activeEx = null; }
function backToList() { stopEx(); showList(null); }  // global so onclick works

// ── Camera ────────────────────────────────
function startCamera() {
    if (camOk) return;
    navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user' }, audio:false })
        .then(stream => { video.srcObject = stream; camOk = true; setStatus('green','Optics Online'); initMP(); })
        .catch(e  => { console.error(e); setStatus('red','Camera Denied'); });
}

// ── MediaPipe ─────────────────────────────
function initMP() {
    if (mpOk || typeof Pose === 'undefined') return;
    mpPose = new Pose({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` });
    mpPose.setOptions({ modelComplexity:1, smoothLandmarks:true, minDetectionConfidence:.5, minTrackingConfidence:.5 });
    mpPose.onResults(onResults);
    mpCamera = new Camera(video, { onFrame: async () => { await mpPose.send({ image:video }); }, width:1280, height:720 });
    mpCamera.start().then(() => { mpOk = true; setStatus('blue','AI Tracking Active'); }).catch(console.warn);
}

// ── Pose Results ──────────────────────────
function onResults(r) {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!r.poseLandmarks) return;

    const lm = r.poseLandmarks;

    // Draw skeleton
    if (window.POSE_CONNECTIONS) drawConnectors(ctx, lm, POSE_CONNECTIONS, { color:'rgba(255,255,255,0.13)', lineWidth:2 });
    drawLandmarks(ctx, lm, { color:'#0070FF', lineWidth:1, radius:4 });

    if (!activeEx) return;
    processRep(lm);
    updatePhysics(lm);
    updateAlign(lm);
}

// ── Rep counting ──────────────────────────
function processRep(lm) {
    const hit = activeEx.check(lm);

    // Form bar
    formPct = hit ? Math.min(100, formPct + 5) : Math.max(0, formPct - 3);
    const ff = document.getElementById('ff');
    ff.style.width = `${formPct}%`;
    ff.style.background = formPct > 60 ? '#10B981' : formPct > 30 ? '#F59E0B' : '#EF4444';
    document.getElementById('form-pct-txt').textContent = `${Math.round(formPct)}%`;

    if (hit && !inPos) {
        inPos = true;
        setStatus('green','Hold — good form!');
    } else if (!hit && inPos) {
        // Completed one rep
        inPos = false;
        reps++;
        document.getElementById('rep-n').textContent = reps;
        const remaining = activeEx.reps - reps;
        setStatus('blue', remaining > 0 ? `${remaining} more — ${activeEx.cue}` : '🎉 Set done!');

        gsap.fromTo('#rep-n',
            { scale:1.45, color:'#0070FF' },
            { scale:1,    color:'#ffffff', duration:.4, ease:'power3.out' });

        if (reps >= activeEx.reps) completeSet();
    } else if (!hit && !inPos) {
        setStatus('orange', activeEx.cue);
    }
}

function completeSet() {
    const exName = activeEx.name;
    activeEx = null;
    setStatus('green',`✓ ${exName} complete! Great work!`);
    document.getElementById('act-cue').textContent = 'Excellent! Rest and choose your next exercise.';
    document.getElementById('ff').style.cssText += 'width:100%;background:#10B981;';
    setTimeout(() => backToList(), 3500);
}

// ── Physics tilt ──────────────────────────
function updatePhysics(lm) {
    const cx = 1 - (lm[11].x + lm[12].x) / 2;
    const cy = (lm[11].y + lm[12].y) / 2;
    const card = document.querySelector('.panel-card');
    gsap.to(card, { rotationY:(cx-.5)*14, rotationX:-(cy-.5)*10, duration:.9, ease:'power2.out' });
}

// ── Alignment ─────────────────────────────
function updateAlign(lm) {
    const cx = (lm[11].x + lm[12].x) / 2;
    document.getElementById('align').textContent = Math.max(0, 100 - Math.abs(cx-.5)*220).toFixed(1);
}

// ── Status ────────────────────────────────
const COL = { green:'#10B981', red:'#EF4444', blue:'#0070FF', orange:'#F59E0B' };
function setStatus(c, msg) {
    document.getElementById('sdot').style.background = COL[c] || c;
    document.getElementById('stxt').textContent = msg;
}

// ── Entrance ──────────────────────────────
window.addEventListener('load', () => {
    gsap.from('#sp-h1',    { opacity:0, y:28, duration:1.5, ease:'power3.out' });
    gsap.from('#btn-start',{ opacity:0, y:14, duration:1,   ease:'power3.out', delay:.85 });
});

// Expose globals needed by inline onclicks
window.showCat  = showCat;
window.showList = showList;
window.backToList = backToList;
