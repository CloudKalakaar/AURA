// ═══════════════════════════════════════════
//  AURA — app.js  (rep-counting, categorised)
// ═══════════════════════════════════════════

// DOM
const video   = document.getElementById('vid');
const canvas  = document.getElementById('pose-cv');
const ctx     = canvas.getContext('2d');
const refCv   = document.getElementById('ref-canvas');
const refCtx  = refCv.getContext('2d');

// ═══════════════════════════════════════════
//  VOICE COACH
// ═══════════════════════════════════════════
let voiceOn  = true;
let voiceKey = '';      // tracks the current voice state; speak() fires only on key change
let voiceList = [];     // preferred voice, cached after first load

function getVoice() {
    if (voiceList.length) return voiceList[0];
    const all = window.speechSynthesis.getVoices();
    // Prefer a natural English voice (avoid Google TTS which can be robotic)
    voiceList = all.filter(v => v.lang.startsWith('en-') && v.localService);
    if (!voiceList.length) voiceList = all.filter(v => v.lang.startsWith('en'));
    return voiceList[0] || null;
}

// key  = unique identifier for this voice context; if same as last, skip.
// Pass a new key each time you want to GUARANTEE the speech fires.
function speak(text, key) {
    if (!voiceOn || !window.speechSynthesis) return;
    if (key && key === voiceKey) return;   // already in this state
    voiceKey = key || text;               // update current key

    // Cancel immediately — no queue, no lag
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.rate   = 1.1;    // slightly faster for responsiveness
    u.pitch  = 1.0;
    u.volume = 1;
    const v = getVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
}

function toggleVoice() {
    voiceOn = !voiceOn;
    window.speechSynthesis.cancel();
    voiceKey = '';   // reset so next speak fires regardless
    const btn = document.getElementById('voice-btn');
    btn.textContent = voiceOn ? '🔊' : '🔇';
    btn.classList.toggle('muted', !voiceOn);
    if (voiceOn) speak('Voice coach enabled.', 'vc-on');
}

// Ensure voices are loaded (Chrome loads them async)
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => { voiceList = []; getVoice(); };
}


// ═══════════════════════════════════════════
//  REFERENCE STICK FIGURE
// ═══════════════════════════════════════════
// Each exercise defines two poses: rest[] and work[]
// Each pose = { head, neck, ls, rs, le, re, lw, rw, hip, lk, rk, la, ra }
// Coordinates are in a 180x140 canvas space.
// REF_POSES and J() are now dynamically generated and provided by db.js

let refAnim = null;   // requestAnimationFrame handle
let refPhase = 0;     // 0 = rest, 1 = work; animates smoothly
let refDir   = 1;     // direction: +1 toward work, -1 toward rest

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpJ(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }

function drawLine(a, b, col, lw) {
    refCtx.strokeStyle = col;
    refCtx.lineWidth   = lw;
    refCtx.lineCap     = 'round';
    refCtx.beginPath();
    refCtx.moveTo(a.x, a.y);
    refCtx.lineTo(b.x, b.y);
    refCtx.stroke();
}

function drawDot(p, r, col) {
    refCtx.fillStyle = col;
    refCtx.beginPath();
    refCtx.arc(p.x, p.y, r, 0, Math.PI*2);
    refCtx.fill();
}

function renderRef(pose, t) {
    refCtx.clearRect(0, 0, refCv.width, refCv.height);

    // Lerp between rest and work
    const P = {};
    for (const k of Object.keys(pose.rest)) {
        P[k] = lerpJ(pose.rest[k], pose.work[k], t);
    }

    // Active colour: blend white→blue as t increases
    const skeleton = t > 0.5 ? '#0070FF' : 'rgba(255,255,255,0.7)';
    const joint    = t > 0.5 ? '#60AEFF' : 'rgba(255,255,255,0.9)';
    const thick = 2.5;

    // Torso
    drawLine(P.neck, P.hip,  skeleton, thick);
    // Head
    drawDot(P.head, 8, joint);
    drawLine(P.head, P.neck, skeleton, thick);
    // Left arm
    drawLine(P.ls, P.neck, skeleton, thick);
    drawLine(P.ls, P.le,   skeleton, thick);
    drawLine(P.le, P.lw,   skeleton, thick);
    // Right arm
    drawLine(P.rs, P.neck, skeleton, thick);
    drawLine(P.rs, P.re,   skeleton, thick);
    drawLine(P.re, P.rw,   skeleton, thick);
    // Left leg
    drawLine(P.hip, P.lk,  skeleton, thick);
    drawLine(P.lk,  P.la,  skeleton, thick);
    // Right leg
    drawLine(P.hip, P.rk,  skeleton, thick);
    drawLine(P.rk,  P.ra,  skeleton, thick);
    // Joints
    [P.neck, P.ls, P.rs, P.le, P.re, P.lw, P.rw, P.hip, P.lk, P.rk, P.la, P.ra]
        .forEach(j => drawDot(j, 3.5, joint));
}

function startRefAnim(exId) {
    if (refAnim) cancelAnimationFrame(refAnim);
    const pose = REF_POSES[exId];
    if (!pose) return;
    refPhase = 0; refDir = 1;
    document.getElementById('ref-label').textContent = pose.label;

    function tick() {
        refPhase += refDir * 0.018;
        if (refPhase >= 1) { refPhase = 1; refDir = -1; }
        else if (refPhase <= 0) { refPhase = 0; refDir = 1; }
        // Ease in-out
        const t = refPhase < 0.5 ? 2*refPhase*refPhase : -1+(4-2*refPhase)*refPhase;
        renderRef(pose, t);
        refAnim = requestAnimationFrame(tick);
    }
    tick();
}

function stopRefAnim() {
    if (refAnim) { cancelAnimationFrame(refAnim); refAnim = null; }
    refCtx.clearRect(0, 0, refCv.width, refCv.height);
}

// ── Database ─────────────────────────────
// FORM_THRESHOLD: rep only counts if peak form% during the working phase was ≥ this
const FORM_THRESHOLD = 65;
// DB and lmFn helpers are defined in db.js (loaded before this script)

// ── State ─────────────────────────────────
let catId    = null;
// Update category counts from DB
['warmup','workout','stretch'].forEach(k => {
    const el = document.getElementById('cat-count-'+k);
    if (el && DB[k]) el.textContent = DB[k].exercises.length + ' exercises';
});
let activeEx = null;
let reps     = 0;
let formPct  = 0;
let camOk    = false;
let mpOk     = false;
let mpCamera = null;
let mpPose   = null;

// Rep-counting phase machine:
//   'waiting_rest' → one-time check: user must show the starting position
//   'counting'     → rest confirmed once; now freely count reps
//                    inWork tracks whether currently in working position
let repPhase = 'waiting_rest';
let inWork   = false;   // true while in working position
let peakForm = 0;       // peak form% during current working hold

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
    activeEx = ex; reps = 0; formPct = 0; peakForm = 0;
    repPhase = 'waiting_rest'; inWork = false;

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
    setStatus('orange', `Get into start position: ${ex.restCue}`);
    speak(`Starting ${ex.name}. ${ex.restCue}`, `launch-${ex.id}`);
    startRefAnim(ex.id);

    // Card slide-in
    const card = document.querySelector('.panel-card');
    gsap.from(card, { opacity:0, x:40, duration:.7, ease:'power3.out' });
}

function stopEx() {
    activeEx = null;
    voiceKey = '';   // reset so next exercise speaks fresh
    stopRefAnim();
    window.speechSynthesis && window.speechSynthesis.cancel();
}
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

// ── Rep counting ─────────────────────────
// Phase 'waiting_rest' : one-time gate — detect start position once, then unlock
// Phase 'counting'     : freely count reps; a rep = enter work → exit work with peakForm ≥ threshold
function processRep(lm) {
    const hitWork = activeEx.check(lm);
    const hitRest = activeEx.checkRest(lm);

    // ── Form quality ──
    // Only accumulate form while in working position
    if (inWork) {
        formPct  = hitWork ? Math.min(100, formPct + 6) : Math.max(0, formPct - 4);
        peakForm = Math.max(peakForm, formPct);
    } else {
        formPct = Math.max(0, formPct - 2);   // gentle decay at rest
    }

    const ff = document.getElementById('ff');
    ff.style.width      = `${formPct}%`;
    ff.style.background = formPct > 65 ? '#10B981' : formPct > 35 ? '#F59E0B' : '#EF4444';
    document.getElementById('form-pct-txt').textContent = `${Math.round(formPct)}%`;

    // ── Phase: one-time start-position gate ──
    if (repPhase === 'waiting_rest') {
        if (hitRest) {
            repPhase = 'counting';
            setStatus('green', `✓ Ready — ${activeEx.cue}`);
            speak(`Starting position set. ${activeEx.cue}`, 'ready');   // fires once
        } else {
            setStatus('orange', `Get into start position: ${activeEx.restCue}`);
            speak(activeEx.restCue, 'wait-rest');                        // fires once
        }
        return;
    }

    // ── Phase: counting ──
    if (!inWork && hitWork) {
        inWork   = true;
        peakForm = 0;
        formPct  = 0;
        setStatus('green', 'Hold — good form!');

    } else if (inWork && !hitWork) {
        inWork = false;

        if (peakForm >= FORM_THRESHOLD) {
            reps++;
            document.getElementById('rep-n').textContent = reps;
            const left = activeEx.reps - reps;
            const msg  = left > 0 ? `Rep ${reps}` : 'Set complete! Great work!';
            setStatus('blue', left > 0 ? `${left} more — ${activeEx.cue}` : '🎉 Set done!');
            speak(msg, `rep-${reps}`);   // unique key per rep — always fires
            gsap.fromTo('#rep-n',
                { scale: 1.5, color: '#0070FF' },
                { scale: 1,   color: '#fff', duration: .4, ease: 'power3.out' });
            if (reps >= activeEx.reps) { completeSet(); return; }
        } else {
            // Form too low
            setStatus('orange', `Form ${Math.round(peakForm)}% — need ${FORM_THRESHOLD}%+ to count. ${activeEx.cue}`);
        }
    } else if (!inWork) {
        setStatus('blue', `${activeEx.reps - reps} left — ${activeEx.cue}`);
    } else {
        setStatus('green', `Holding — form ${Math.round(formPct)}%`);
    }
}

function completeSet() {
    const exName = activeEx.name;
    activeEx = null;
    stopRefAnim();
    setStatus('green', `✓ ${exName} complete! Great work!`);
    document.getElementById('act-cue').textContent = 'Excellent! Rest and choose your next exercise.';
    document.getElementById('ff').style.cssText += 'width:100%;background:#10B981;';
    speak(`Excellent! ${exName} complete. Take a rest and choose your next exercise.`, 'complete');
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
window.showCat    = showCat;
window.showList   = showList;
window.backToList = backToList;
window.toggleVoice = toggleVoice;
