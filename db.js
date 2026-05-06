// ── Shared pose helpers ──────────────────
const lmFn = {
  armsUp:   lm => lm[15].y < lm[0].y && lm[16].y < lm[0].y,
  armsDown: lm => lm[15].y > lm[11].y && lm[16].y > lm[12].y,
  armsWide: lm => Math.abs(lm[15].x-lm[11].x)>0.22 && Math.abs(lm[16].x-lm[12].x)>0.22,
  armsRest: lm => Math.abs(lm[15].x-lm[11].x)<0.12 && Math.abs(lm[16].x-lm[12].x)<0.12,
  standing: lm => ((lm[25].y+lm[26].y)/2)-((lm[23].y+lm[24].y)/2) > 0.22,
  squat:    lm => ((lm[25].y+lm[26].y)/2)-((lm[23].y+lm[24].y)/2) < 0.13,
  kneeUp:   lm => lm[25].y < lm[23].y || lm[26].y < lm[24].y,
  kneeDown: lm => lm[25].y > lm[23].y+0.05 && lm[26].y > lm[24].y+0.05,
  headUp:   lm => lm[0].y < (lm[23].y+lm[24].y)/2 - 0.15,
  headFwd:  lm => lm[0].y > (lm[23].y+lm[24].y)/2 + 0.08,
  shoulderUp: lm => (lm[11].y+lm[12].y)/2 < 0.38,
  shoulderNorm: lm => (lm[11].y+lm[12].y)/2 > 0.42,
  legsWide: lm => Math.abs(lm[27].x-lm[28].x) > 0.28,
  legsTog:  lm => Math.abs(lm[27].x-lm[28].x) < 0.15,
  elbowBend: lm => (lm[11].y+lm[12].y)/2-(lm[15].y+lm[16].y)/2 < 0.10,
  elbowStr: lm => (lm[11].y+lm[12].y)/2-(lm[15].y+lm[16].y)/2 > 0.18,
  lunge:    lm => (lm[25].y-lm[23].y>0.28)||(lm[26].y-lm[24].y>0.28),
  lungRest: lm => Math.abs((lm[25].y-lm[23].y)-(lm[26].y-lm[24].y))<0.10,
  armAsym:  lm => Math.abs(lm[15].y-lm[16].y)>0.24,
  armSym:   lm => Math.abs(lm[15].y-lm[16].y)<0.10,
};

const DB = {
  warmup: {
    label:'Warm-Up', color:'rgb(251,146,60)', badgeBg:'rgba(251,146,60,0.16)',
    desc:'Activate muscles and raise your heart rate before your main session.',
    exercises:[
      { id:'jacks',       name:'Jumping Jacks',       icon:'⭐', reps:15, restCue:'Stand — feet together, arms at sides',      cue:'Jump — arms up & legs wide',              restPose:'stand', workPose:'armsWide', checkRest:lm=>lmFn.armsDown(lm)&&lmFn.legsTog(lm),  check:lm=>lmFn.armsUp(lm)&&lmFn.legsWide(lm) },
      { id:'high-knees',  name:'High Knees',           icon:'🏃', reps:20, restCue:'Stand upright — both feet on the ground',   cue:'Drive your knee up above hip height',     restPose:'stand', workPose:'kneeUp', checkRest:lmFn.kneeDown,  check:lmFn.kneeUp },
      { id:'butt-kicks',  name:'Butt Kicks',           icon:'🦵', reps:20, restCue:'Stand upright — both feet on the ground',   cue:'Kick heel up toward your glutes',         restPose:'stand', workPose:'kneeUp', checkRest:lmFn.kneeDown,  check:lmFn.kneeUp },
      { id:'arm-circles', name:'Arm Circles',          icon:'🔄', reps:20, restCue:'Stand tall — arms relaxed by your sides',   cue:'10 forward, then 10 backward',            restPose:'stand', workPose:'armsWide', checkRest:lmFn.armsRest,  check:lmFn.armsWide },
      { id:'shoulder-rolls', name:'Shoulder Rolls',    icon:'🌀', reps:10, restCue:'Relax shoulders — arms by your sides',      cue:'Roll shoulders up toward your ears',      restPose:'stand', workPose:'armsUp', checkRest:lmFn.shoulderNorm, check:lmFn.shoulderUp },
      { id:'torso-twists', name:'Torso Twists',        icon:'🌪️', reps:12, restCue:'Stand tall — arms out to the sides',       cue:'Rotate torso left and right',             restPose:'armsWide', workPose:'armsAsym', checkRest:lmFn.armsWide,  check:lmFn.armAsym },
      { id:'mountain-climbers', name:'Mountain Climbers', icon:'🧗', reps:20, restCue:'Get into plank — arms fully extended',   cue:'Drive knees to chest alternately',        restPose:'plank', workPose:'plankDown', checkRest:lmFn.elbowStr,  check:lmFn.kneeUp },
      { id:'inchworms',   name:'Inchworms',            icon:'🐛', reps:8,  restCue:'Stand tall — back straight',              cue:'Walk hands out to plank, then back',      restPose:'stand', workPose:'plank', checkRest:lmFn.headUp,    check:lmFn.headFwd },
      { id:'leg-swings',  name:'Leg Swings',           icon:'🦵', reps:15, restCue:'Stand on one leg — hold for balance',      cue:'Swing leg forward and back',              restPose:'stand', workPose:'kneeUp', checkRest:lmFn.kneeDown,  check:lmFn.kneeUp },
      { id:'lat-shuffles', name:'Lateral Shuffles',    icon:'↔️', reps:16, restCue:'Athletic stance — slight squat',           cue:'Shuffle left and right quickly',          restPose:'squat', workPose:'armsWide', checkRest:lmFn.legsTog,   check:lmFn.legsWide },
      { id:'gate-openers', name:'Gate Openers',        icon:'🚪', reps:12, restCue:'Stand tall — feet hip-width apart',        cue:'Lift knee and rotate hip outward',        restPose:'stand', workPose:'kneeUp', checkRest:lmFn.kneeDown,  check:lmFn.kneeUp },
      { id:'plank-jacks', name:'Plank Jacks',          icon:'🏋️', reps:15, restCue:'High plank — feet together',              cue:'Jump feet wide then back together',       restPose:'plank', workPose:'armsWide', checkRest:lmFn.legsTog,   check:lmFn.legsWide },
      { id:'skater-hops', name:'Skater Hops',          icon:'⛸️', reps:14, restCue:'Athletic stance — feet together',          cue:'Leap side to side like a speed skater',   restPose:'stand', workPose:'armsWide', checkRest:lmFn.legsTog,   check:lmFn.legsWide },
      { id:'side-crunches', name:'Standing Side Crunches', icon:'🤸', reps:12, restCue:'Stand tall — arms overhead',           cue:'Crunch elbow down to lifted knee',        restPose:'armsUp', workPose:'armsAsym', checkRest:lmFn.armsUp,    check:lmFn.armAsym },
      { id:'hip-circles', name:'Hip Circles',          icon:'🌀', reps:10, restCue:'Stand — hands on hips, feet shoulder-width', cue:'Make big circles with your hips',       restPose:'stand', workPose:'lunge', checkRest:lmFn.standing,  check:lmFn.lunge },
      { id:'wrist-ankles', name:'Wrist & Ankle Rotations', icon:'✋', reps:10, restCue:'Stand tall — lift one foot slightly',  cue:'Rotate wrists and ankles in circles',     restPose:'stand', workPose:'armsWide', checkRest:lmFn.armsDown,  check:lmFn.armsWide },
      { id:'shadow-boxing', name:'Shadow Boxing',      icon:'🥊', reps:20, restCue:'Guard position — fists up, knees soft',    cue:'Throw punches — extend arm fully',        restPose:'stand', workPose:'armsFront', checkRest:lmFn.armsRest,  check:lmFn.armsWide },
      { id:'windmills',   name:'Windmills',            icon:'🌬️', reps:12, restCue:'Stand — arms out wide at shoulder height', cue:'Reach down to opposite foot, rotate up',  restPose:'armsWide', workPose:'fold', checkRest:lmFn.armsWide,  check:lmFn.headFwd },
      { id:'seal-jacks',  name:'Seal Jacks',           icon:'🦭', reps:15, restCue:'Stand — arms straight out in front',       cue:'Jump wide, swing arms open to sides',     restPose:'armsFront', workPose:'armsWide', checkRest:lmFn.armsRest,  check:lmFn.legsWide },
      { id:'cat-cow',     name:'Cat-Cow',              icon:'🐄', reps:10, restCue:'On hands and knees — flat back',           cue:'Arch up then dip spine alternately',      restPose:'quadruped', workPose:'plankDown', checkRest:lmFn.elbowStr,  check:lmFn.shoulderUp },
      { id:'worlds-stretch', name:"World's Greatest Stretch", icon:'🌍', reps:8, restCue:'Stand tall — feet hip-width',        cue:'Step into lunge, reach arm to sky',       restPose:'stand', workPose:'lunge', checkRest:lmFn.standing,  check:lmFn.lunge },
      { id:'forward-fold-w', name:'Windmill Fold',     icon:'🙇', reps:8,  restCue:'Stand tall — back straight',              cue:'Hinge forward, reach to opposite foot',   restPose:'stand', workPose:'fold', checkRest:lmFn.headUp,    check:lmFn.headFwd },
    ]
  },
  workout: {
    label:'Workout', color:'#0070FF', badgeBg:'rgba(0,112,255,0.16)',
    desc:'Strength exercises tracked rep-by-rep with AI precision.',
    exercises:[
      { id:'squats',      name:'Air Squats',           icon:'🏋️', reps:15, restCue:'Stand — feet shoulder-width apart',        cue:'Lower hips to parallel',                  restPose:'stand', workPose:'squat', checkRest:lmFn.standing,  check:lmFn.squat },
      { id:'pushups',     name:'Standard Push-Ups',    icon:'💪', reps:12, restCue:'Plank — arms fully extended',              cue:'Lower chest toward the floor',            restPose:'plank', workPose:'plankDown', checkRest:lmFn.elbowStr,  check:lmFn.elbowBend },
      { id:'fwd-lunges',  name:'Forward Lunges',       icon:'🦵', reps:12, restCue:'Stand upright — feet hip-width',           cue:'Step forward and lower back knee',        restPose:'stand', workPose:'lunge', checkRest:lmFn.lungRest,  check:lmFn.lunge },
      { id:'rev-lunges',  name:'Reverse Lunges',       icon:'🔙', reps:12, restCue:'Stand upright — feet hip-width',           cue:'Step back and lower back knee',           restPose:'stand', workPose:'lunge', checkRest:lmFn.lungRest,  check:lmFn.lunge },
      { id:'burpees',     name:'Burpees',              icon:'🔥', reps:10, restCue:'Stand upright — arms relaxed',             cue:'Jump up — arms fully overhead',           restPose:'stand', workPose:'armsUp', checkRest:lmFn.armsDown,  check:lmFn.armsUp },
      { id:'plank',       name:'Plank Hold',           icon:'🪵', reps:8,  restCue:'Stand upright',                           cue:'Hold plank — keep hips level',            restPose:'stand', workPose:'plank', checkRest:lmFn.standing,  check:lmFn.elbowBend },
      { id:'glute-bridge', name:'Glute Bridges',       icon:'🍑', reps:15, restCue:'Lie on back — knees bent, feet flat',      cue:'Drive hips up — squeeze glutes at top',   restPose:'sit', workPose:'armsWide', checkRest:lmFn.squat,     check:lmFn.standing },
      { id:'diamond-pu',  name:'Diamond Push-Ups',     icon:'💎', reps:10, restCue:'Plank — arms extended, hands diamond',     cue:'Lower chest, elbows in tight',            restPose:'plank', workPose:'plankDown', checkRest:lmFn.elbowStr,  check:lmFn.elbowBend },
      { id:'pike-pu',     name:'Pike Push-Ups',        icon:'🔺', reps:10, restCue:'Pike position — hips high, arms extended', cue:'Lower head toward floor',                 restPose:'plank', workPose:'plankDown', checkRest:lmFn.elbowStr,  check:lmFn.elbowBend },
      { id:'superman',    name:'Superman',             icon:'🦸', reps:12, restCue:'Lie face down — arms and legs relaxed',    cue:'Lift arms and legs off the floor',        restPose:'sit', workPose:'armsUp', checkRest:lmFn.headFwd,   check:lmFn.headUp },
      { id:'bicycle',     name:'Bicycle Crunches',     icon:'🚲', reps:20, restCue:'Lie on back — hands behind head',          cue:'Elbow to opposite knee, rotate',          restPose:'sit', workPose:'kneeUp', checkRest:lmFn.kneeDown,  check:lmFn.kneeUp },
      { id:'lat-lunges',  name:'Lateral Lunges',       icon:'↔️', reps:12, restCue:'Stand — feet together',                   cue:'Step wide to the side, lower hips',       restPose:'stand', workPose:'lunge', checkRest:lmFn.legsTog,   check:lmFn.legsWide },
      { id:'calf-raises', name:'Calf Raises',          icon:'🦶', reps:20, restCue:'Stand — feet hip-width, flat on ground',   cue:'Rise onto your toes',                     restPose:'stand', workPose:'armsUp', checkRest:lmFn.kneeDown,  check:lmFn.shoulderUp },
      { id:'bird-dog',    name:'Bird-Dog',             icon:'🐦', reps:12, restCue:'On hands and knees — flat back',           cue:'Extend opposite arm and leg',             restPose:'quadruped', workPose:'armsAsym', checkRest:lmFn.elbowStr,  check:lmFn.armAsym },
      { id:'russian-twists', name:'Russian Twists',    icon:'🌀', reps:20, restCue:'Sit — knees bent, lean back slightly',     cue:'Rotate torso side to side',               restPose:'sit', workPose:'armsAsym', checkRest:lmFn.armSym,    check:lmFn.armAsym },
      { id:'wide-pu',     name:'Wide-Grip Push-Ups',   icon:'🤲', reps:12, restCue:'Plank — hands wider than shoulders',       cue:'Lower chest to floor, flare elbows',      restPose:'plank', workPose:'plankDown', checkRest:lmFn.elbowStr,  check:lmFn.elbowBend },
      { id:'sumo-squats', name:'Sumo Squats',          icon:'🤼', reps:15, restCue:'Wide stance — toes pointed out',           cue:'Lower hips — keep chest up',              restPose:'stand', workPose:'squat', checkRest:lmFn.standing,  check:lmFn.squat },
      { id:'hollow-body', name:'Hollow Body Hold',     icon:'🪸', reps:8,  restCue:'Lie flat on back — arms overhead',         cue:'Lift shoulders and legs, hold tension',   restPose:'sit', workPose:'armsUp', checkRest:lmFn.armsUp,    check:lmFn.elbowBend },
      { id:'v-ups',       name:'V-Ups',                icon:'✌️', reps:12, restCue:'Lie flat — arms overhead, legs extended',  cue:'Lift arms and legs to meet at centre',    restPose:'sit', workPose:'armsUp', checkRest:lmFn.headFwd,   check:lmFn.armsUp },
      { id:'bear-crawls', name:'Bear Crawls',          icon:'🐻', reps:10, restCue:'Quadruped — knees hovering',              cue:'Crawl forward — keep knees low',          restPose:'quadruped', workPose:'kneeUp', checkRest:lmFn.elbowStr,  check:lmFn.kneeUp },
      { id:'frog-pumps',  name:'Frog Pumps',           icon:'🐸', reps:20, restCue:'Lie on back — soles of feet together',     cue:'Press hips up, squeeze glutes hard',      restPose:'sit', workPose:'armsWide', checkRest:lmFn.kneeDown,  check:lmFn.standing },
      { id:'flutter-kicks', name:'Flutter Kicks',      icon:'🦵', reps:20, restCue:'Lie on back — legs extended',             cue:'Alternate kicking legs up and down',      restPose:'sit', workPose:'kneeUp', checkRest:lmFn.kneeDown,  check:lmFn.kneeUp },
    ]
  },
  stretch: {
    label:'Stretch', color:'rgb(52,211,153)', badgeBg:'rgba(52,211,153,0.13)',
    desc:'Hold each position 20–30 s. Breathe deeply and move with control.',
    exercises:[
      { id:'forward-fold', name:'Forward Fold',        icon:'🙇', reps:6,  restCue:'Stand tall — back straight',              cue:'Bend forward — reach toward your feet',   restPose:'stand', workPose:'fold', checkRest:lmFn.headUp,    check:lmFn.headFwd },
      { id:'cobra',        name:'Cobra Stretch',       icon:'🐍', reps:6,  restCue:'Lie face down — arms at sides',           cue:'Press up — chest high, shoulders back',   restPose:'sit', workPose:'armsUp', checkRest:lmFn.headFwd,   check:lmFn.headUp },
      { id:'childs-pose',  name:"Child's Pose",        icon:'🧎', reps:4,  restCue:'Sit on heels — arms at sides',            cue:'Reach arms forward, lower chest to mat',  restPose:'sit', workPose:'squat', checkRest:lmFn.standing,  check:lmFn.squat },
      { id:'pigeon',       name:'Pigeon Pose',         icon:'🕊️', reps:4, restCue:'Stand tall',                              cue:'Front shin across mat, hips sink',        restPose:'stand', workPose:'lunge', checkRest:lmFn.standing,  check:lmFn.lunge },
      { id:'quad-stretch', name:'Standing Quad Stretch', icon:'🦵', reps:6, restCue:'Stand on both feet',                   cue:'Grab ankle behind — pull heel to glute',  restPose:'stand', workPose:'kneeUp', checkRest:lmFn.kneeDown,  check:lmFn.kneeUp },
      { id:'cross-body',   name:'Cross-Body Shoulder', icon:'🤸', reps:6,  restCue:'Stand — arms relaxed',                   cue:'Pull arm across chest, hold',             restPose:'stand', workPose:'armsWide', checkRest:lmFn.armsDown,  check:lmFn.armsWide },
      { id:'tricep-str',   name:'Overhead Tricep Stretch', icon:'💪', reps:6, restCue:'Stand tall — arms down',              cue:'Raise arm, bend elbow behind head',        restPose:'stand', workPose:'armsUp', checkRest:lmFn.armsDown,  check:lmFn.armsUp },
      { id:'butterfly',    name:'Butterfly Stretch',   icon:'🦋', reps:4,  restCue:'Sit — legs extended',                    cue:'Bring soles together, lean forward',      restPose:'sit', workPose:'fold', checkRest:lmFn.headUp,    check:lmFn.headFwd },
      { id:'downdog',      name:'Downward Dog',        icon:'🐕', reps:6,  restCue:'Stand tall — feet hip-width',            cue:'Hips up — form an inverted V',            restPose:'stand', workPose:'fold', checkRest:lmFn.standing,  check:lmFn.headFwd },
      { id:'spinal-twist', name:'Lying Spinal Twist',  icon:'🌀', reps:4,  restCue:'Lie flat on back',                       cue:'Bring knee across, arms wide',            restPose:'sit', workPose:'armsAsym', checkRest:lmFn.armSym,    check:lmFn.armAsym },
      { id:'sphinx',       name:'Sphinx Pose',         icon:'🏛️', reps:4,  restCue:'Lie face down — forearms on mat',        cue:'Press through forearms, lift chest',       restPose:'sit', workPose:'armsUp', checkRest:lmFn.headFwd,   check:lmFn.headUp },
      { id:'crescent',     name:'Crescent Lunge Stretch', icon:'🌙', reps:4, restCue:'Stand tall — feet together',           cue:'Step back, sink hips, arms overhead',     restPose:'stand', workPose:'lunge', checkRest:lmFn.standing,  check:lmFn.lunge },
      { id:'neck-flex',    name:'Neck Lateral Flexion', icon:'🧘', reps:6,  restCue:'Sit or stand tall',                     cue:'Tilt ear toward shoulder gently',         restPose:'stand', workPose:'armsAsym', checkRest:lmFn.armSym,    check:lmFn.armAsym },
      { id:'chest-opener', name:'Chest Opener',        icon:'🦅', reps:4,  restCue:'Lie face down — arms out wide',          cue:'Roll onto chest, lift and open',          restPose:'sit', workPose:'armsWide', checkRest:lmFn.armsDown,  check:lmFn.armsWide },
      { id:'deep-squat',   name:'Deep Squat Hold',     icon:'🪑', reps:4,  restCue:'Stand — feet slightly wider than hips',  cue:'Sink into deep squat, hold open',         restPose:'stand', workPose:'squat', checkRest:lmFn.standing,  check:lmFn.squat },
      { id:'thread-needle', name:'Thread the Needle',  icon:'🪡', reps:4,  restCue:'On hands and knees — flat back',         cue:'Slide one arm under, rotate open',        restPose:'quadruped', workPose:'armsAsym', checkRest:lmFn.armSym,    check:lmFn.armAsym },
      { id:'seated-ham',   name:'Seated Hamstring Reach', icon:'🙌', reps:6, restCue:'Sit — legs extended, back tall',       cue:'Reach forward toward toes, hold',         restPose:'sit', workPose:'fold', checkRest:lmFn.headUp,    check:lmFn.headFwd },
      { id:'happy-baby',   name:'Happy Baby Pose',     icon:'👶', reps:4,  restCue:'Lie on back',                            cue:'Grab outside of feet, pull knees down',   restPose:'sit', workPose:'kneeUp', checkRest:lmFn.kneeDown,  check:lmFn.kneeUp },
      { id:'wrist-flex',   name:'Wrist Flexor Stretch', icon:'✋', reps:6,  restCue:'Stand — arms relaxed',                  cue:'Extend arm, pull fingers back',           restPose:'stand', workPose:'armsWide', checkRest:lmFn.armsDown,  check:lmFn.armsWide },
      { id:'calf-stretch', name:'Standing Calf Stretch', icon:'🦶', reps:6, restCue:'Stand — feet hip-width',               cue:'Step back, press heel down',              restPose:'stand', workPose:'armsWide', checkRest:lmFn.legsTog,   check:lmFn.legsWide },
      { id:'kneeling-hip', name:'Kneeling Hip Flexor', icon:'🧎', reps:4,  restCue:'Stand tall',                             cue:'Kneel — sink hips forward',               restPose:'stand', workPose:'lunge', checkRest:lmFn.standing,  check:lmFn.lunge },
      { id:'savasana',     name:'Savasana',            icon:'😌', reps:2,  restCue:'Stand or sit comfortably',               cue:'Lie flat — total stillness, breathe',     restPose:'stand', workPose:'sit', checkRest:lmFn.standing,  check:lmFn.squat },
    ]
  }
};

// ── Unique Stick Figure Animations (100% Custom for all 66) ──
const J = (x,y) => ({x,y});


const REF_POSES = {
  // WARM-UP
  'jacks': {
    label: 'Jumping Jacks',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,16), neck:J(90,28), ls:J(72,40), rs:J(108,40), le:J(58,18), re:J(122,18), lw:J(48,6),  rw:J(132,6),  hip:J(90,74), lk:J(66,102),rk:J(114,102),la:J(50,128), ra:J(130,128) }
  },
  'high-knees': {
    label: 'High Knees',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(60,40), re:J(120,40), lw:J(60,30), rw:J(120,30), hip:J(90,70), lk:J(70,64), rk:J(100,98), la:J(70,94),  ra:J(100,128) }
  },
  'butt-kicks': {
    label: 'Butt Kicks',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(60,54), re:J(120,54), lw:J(60,40), rw:J(120,40), hip:J(90,70), lk:J(80,98), rk:J(104,80), la:J(80,128), ra:J(106,60) }
  },
  'arm-circles': {
    label: 'Arm Circles',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(70,36), rs:J(110,36), le:J(40,30), re:J(140,30), lw:J(10,36), rw:J(170,36), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) }
  },
  'shoulder-rolls': {
    label: 'Shoulder Rolls',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,28), rs:J(106,28), le:J(68,46), re:J(112,46), lw:J(66,64), rw:J(114,64), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) }
  },
  'torso-twists': {
    label: 'Torso Twists',
    rest: { head:J(90,12), neck:J(90,24), ls:J(70,36), rs:J(110,36), le:J(40,36), re:J(140,36), lw:J(10,36), rw:J(170,36), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(82,36), rs:J(102,36), le:J(64,30), re:J(130,42), lw:J(50,20), rw:J(160,50), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) }
  },
  'mountain-climbers': {
    label: 'Mountain Climbers',
    rest: { head:J(30,60), neck:J(46,66), ls:J(56,68), rs:J(80,74),  le:J(30,90), re:J(80,95),  lw:J(15,110),rw:J(80,115), hip:J(112,80),lk:J(140,86),rk:J(140,86),  la:J(168,90), ra:J(168,90) },
    work: { head:J(30,60), neck:J(46,66), ls:J(56,68), rs:J(80,74),  le:J(30,90), re:J(80,95),  lw:J(15,110),rw:J(80,115), hip:J(112,80),lk:J(90,78), rk:J(140,86),  la:J(70,90),  ra:J(168,90) }
  },
  'inchworms': {
    label: 'Inchworms',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,82), neck:J(90,70), ls:J(74,64), rs:J(106,64), le:J(90,86), re:J(90,86),  lw:J(90,110),rw:J(90,110), hip:J(90,58), lk:J(80,88), rk:J(100,88),  la:J(80,120), ra:J(100,120) }
  },
  'leg-swings': {
    label: 'Leg Swings',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(70,110),rk:J(100,98), la:J(40,110), ra:J(100,128) }
  },
  'lat-shuffles': {
    label: 'Lateral Shuffles',
    rest: { head:J(90,30), neck:J(90,42), ls:J(72,50), rs:J(108,50), le:J(60,66), re:J(120,66), lw:J(60,82), rw:J(120,82), hip:J(90,85), lk:J(74,106),rk:J(106,106),la:J(74,128), ra:J(106,128) },
    work: { head:J(60,30), neck:J(60,42), ls:J(42,50), rs:J(78,50),  le:J(30,66), re:J(90,66),  lw:J(30,82), rw:J(90,82),  hip:J(60,85), lk:J(30,106),rk:J(110,106),la:J(20,128), ra:J(120,128) }
  },
  'gate-openers': {
    label: 'Gate Openers',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(60,84), rk:J(100,98), la:J(40,84),  ra:J(100,128) }
  },
  'plank-jacks': {
    label: 'Plank Jacks',
    rest: { head:J(30,60), neck:J(46,66), ls:J(56,68), rs:J(80,74),  le:J(30,90), re:J(80,95),  lw:J(15,110),rw:J(80,115), hip:J(112,80),lk:J(140,86),rk:J(140,86),  la:J(168,90), ra:J(168,90) },
    work: { head:J(30,60), neck:J(46,66), ls:J(56,68), rs:J(80,74),  le:J(30,90), re:J(80,95),  lw:J(15,110),rw:J(80,115), hip:J(112,80),lk:J(140,70),rk:J(140,102), la:J(168,60), ra:J(168,112) }
  },
  'skater-hops': {
    label: 'Skater Hops',
    rest: { head:J(90,30), neck:J(90,42), ls:J(72,50), rs:J(108,50), le:J(60,66), re:J(120,66), lw:J(60,82), rw:J(120,82), hip:J(90,85), lk:J(74,106),rk:J(106,106),la:J(74,128), ra:J(106,128) },
    work: { head:J(110,24),neck:J(110,36),ls:J(92,44), rs:J(128,44), le:J(80,60), re:J(140,60), lw:J(70,76), rw:J(150,76), hip:J(110,79),lk:J(90,100),rk:J(130,100),la:J(120,124),ra:J(130,124) }
  },
  'side-crunches': {
    label: 'Side Crunches',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(60,16), re:J(120,16), lw:J(50,4),  rw:J(130,4),  hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(84,14), neck:J(88,26), ls:J(72,38), rs:J(104,38), le:J(76,46), re:J(120,16), lw:J(80,56), rw:J(130,4),  hip:J(90,70), lk:J(76,74), rk:J(100,98), la:J(80,84),  ra:J(100,128) }
  },
  'hip-circles': {
    label: 'Hip Circles',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(60,46), re:J(120,46), lw:J(60,38), rw:J(120,38), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,14), neck:J(90,26), ls:J(74,38), rs:J(106,38), le:J(60,48), re:J(120,48), lw:J(60,40), rw:J(120,40), hip:J(106,72),lk:J(88,98), rk:J(108,98), la:J(80,128), ra:J(100,128) }
  },
  'wrist-ankles': {
    label: 'Wrist & Ankles',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(60,54), re:J(120,54), lw:J(54,64), rw:J(126,64), hip:J(90,70), lk:J(80,98), rk:J(110,94), la:J(80,128), ra:J(120,118) }
  },
  'shadow-boxing': {
    label: 'Shadow Boxing',
    rest: { head:J(90,12), neck:J(90,24), ls:J(78,36), rs:J(102,36), le:J(72,50), re:J(108,50), lw:J(84,40), rw:J(96,40),  hip:J(90,70), lk:J(84,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(78,36), rs:J(102,36), le:J(110,36),re:J(108,50), lw:J(140,36),rw:J(96,40),  hip:J(90,70), lk:J(84,98), rk:J(100,98), la:J(80,128), ra:J(100,128) }
  },
  'windmills': {
    label: 'Windmills',
    rest: { head:J(90,12), neck:J(90,24), ls:J(70,36), rs:J(110,36), le:J(40,36), re:J(140,36), lw:J(10,36), rw:J(170,36), hip:J(90,70), lk:J(70,98), rk:J(110,98), la:J(60,128), ra:J(120,128) },
    work: { head:J(90,82), neck:J(90,70), ls:J(74,64), rs:J(106,64), le:J(90,86), re:J(110,40), lw:J(110,110),rw:J(110,10),  hip:J(90,58), lk:J(70,88), rk:J(110,88), la:J(60,120), ra:J(120,120) }
  },
  'seal-jacks': {
    label: 'Seal Jacks',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(90,36), re:J(90,36),  lw:J(110,36),rw:J(110,36), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,16), neck:J(90,28), ls:J(72,40), rs:J(108,40), le:J(40,40), re:J(140,40), lw:J(10,40), rw:J(170,40), hip:J(90,74), lk:J(66,102),rk:J(114,102),la:J(50,128), ra:J(130,128) }
  },
  'cat-cow': {
    label: 'Cat-Cow',
    rest: { head:J(40,50), neck:J(56,58), ls:J(66,64), rs:J(86,70),  le:J(66,90), re:J(86,96),  lw:J(66,120),rw:J(86,120), hip:J(112,70),lk:J(112,100),rk:J(122,100),la:J(140,120),ra:J(140,120) },
    work: { head:J(40,64), neck:J(56,66), ls:J(66,70), rs:J(86,74),  le:J(66,90), re:J(86,96),  lw:J(66,120),rw:J(86,120), hip:J(112,50),lk:J(112,100),rk:J(122,100),la:J(140,120),ra:J(140,120) }
  },
  'worlds-stretch': {
    label: 'Worlds Stretch',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(80,48), neck:J(80,60), ls:J(64,70), rs:J(96,70),  le:J(58,88), re:J(102,40), lw:J(56,104),rw:J(104,10), hip:J(80,106),lk:J(56,116),rk:J(120,110),la:J(52,128), ra:J(140,128) }
  },
  'forward-fold-w': {
    label: 'Windmill Fold',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,82), neck:J(90,70), ls:J(74,64), rs:J(106,64), le:J(70,90), re:J(120,64), lw:J(70,120),rw:J(150,64), hip:J(90,58), lk:J(80,88), rk:J(100,88),  la:J(80,120), ra:J(100,120) }
  },

  // WORKOUT
  'squats': {
    label: 'Air Squats',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,36), neck:J(90,48), ls:J(72,60), rs:J(108,60), le:J(50,60), re:J(130,60), lw:J(30,60), rw:J(150,60), hip:J(90,95), lk:J(60,104),rk:J(120,104),la:J(70,128), ra:J(110,128) }
  },
  'pushups': {
    label: 'Push-Ups',
    rest: { head:J(30,60), neck:J(46,66), ls:J(56,68), rs:J(80,74),  le:J(30,90), re:J(80,95),  lw:J(15,110),rw:J(80,115), hip:J(112,80),lk:J(140,86),rk:J(140,86),  la:J(168,90), ra:J(168,90) },
    work: { head:J(30,86), neck:J(46,92), ls:J(56,94), rs:J(80,100), le:J(30,86), re:J(80,90),  lw:J(15,110),rw:J(80,115), hip:J(112,100),lk:J(140,102),rk:J(140,102),la:J(168,106),ra:J(168,106) }
  },
  'fwd-lunges': {
    label: 'Forward Lunges',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(80,18), neck:J(80,30), ls:J(64,40), rs:J(96,40),  le:J(58,58), re:J(102,58), lw:J(56,74), rw:J(104,74), hip:J(80,76), lk:J(56,86), rk:J(108,100), la:J(52,128), ra:J(108,128) }
  },
  'rev-lunges': {
    label: 'Reverse Lunges',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(100,18),neck:J(100,30),ls:J(84,40), rs:J(116,40), le:J(78,58), re:J(122,58), lw:J(76,74), rw:J(124,74), hip:J(100,76),lk:J(124,86),rk:J(72,100), la:J(128,128),ra:J(72,128) }
  },
  'burpees': {
    label: 'Burpees',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,8),  neck:J(90,20), ls:J(74,32), rs:J(106,32), le:J(60,12), re:J(120,12), lw:J(50,0),  rw:J(130,0),  hip:J(90,66), lk:J(80,88), rk:J(100,88), la:J(80,110), ra:J(100,110) }
  },
  'plank': {
    label: 'Plank Hold',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(30,60), neck:J(46,66), ls:J(56,68), rs:J(80,74),  le:J(30,90), re:J(80,95),  lw:J(15,110),rw:J(80,115), hip:J(112,80),lk:J(140,86),rk:J(140,86),  la:J(168,90), ra:J(168,90) }
  },
  'glute-bridge': {
    label: 'Glute Bridges',
    rest: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(120,90), re:J(120,130),lw:J(120,80), rw:J(120,140),hip:J(100,110),lk:J(80,90), rk:J(80,130), la:J(80,110), ra:J(80,110) },
    work: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(120,90), re:J(120,130),lw:J(120,80), rw:J(120,140),hip:J(70,110), lk:J(40,90), rk:J(40,130), la:J(40,110), ra:J(40,110) }
  },
  'diamond-pu': {
    label: 'Diamond Push-Ups',
    rest: { head:J(30,60), neck:J(46,66), ls:J(56,68), rs:J(80,74),  le:J(56,86), re:J(80,90),  lw:J(66,110),rw:J(66,110), hip:J(112,80),lk:J(140,86),rk:J(140,86),  la:J(168,90), ra:J(168,90) },
    work: { head:J(30,86), neck:J(46,92), ls:J(56,94), rs:J(80,100), le:J(50,100),re:J(74,106), lw:J(66,110),rw:J(66,110), hip:J(112,100),lk:J(140,102),rk:J(140,102),la:J(168,106),ra:J(168,106) }
  },
  'pike-pu': {
    label: 'Pike Push-Ups',
    rest: { head:J(70,80), neck:J(80,70), ls:J(90,66), rs:J(110,74), le:J(80,90), re:J(100,95), lw:J(70,110),rw:J(90,115), hip:J(130,50),lk:J(150,70),rk:J(150,70),  la:J(170,100),ra:J(170,100) },
    work: { head:J(50,100),neck:J(60,90), ls:J(70,86), rs:J(90,94),  le:J(50,90), re:J(70,95),  lw:J(70,110),rw:J(90,115), hip:J(130,70),lk:J(150,86),rk:J(150,86),  la:J(170,106),ra:J(170,106) }
  },
  'superman': {
    label: 'Superman',
    rest: { head:J(30,110),neck:J(46,110),ls:J(56,106),rs:J(56,114),le:J(76,106),re:J(76,114),lw:J(96,106),rw:J(96,114),hip:J(112,110),lk:J(130,110),rk:J(130,110),la:J(150,110),ra:J(150,110) },
    work: { head:J(30,90), neck:J(46,94), ls:J(56,90), rs:J(56,98), le:J(40,76), re:J(40,106), lw:J(20,60), rw:J(20,120), hip:J(112,110),lk:J(140,96), rk:J(140,96), la:J(168,80), ra:J(168,80) }
  },
  'bicycle': {
    label: 'Bicycle Crunches',
    rest: { head:J(140,90),neck:J(124,94),ls:J(120,86),rs:J(120,102),le:J(136,80),re:J(136,110),lw:J(150,70),rw:J(150,120),hip:J(100,106),lk:J(80,90), rk:J(80,120),la:J(80,106),ra:J(80,106) },
    work: { head:J(134,80),neck:J(118,84),ls:J(114,76),rs:J(114,92), le:J(100,70),re:J(130,100),lw:J(86,60), rw:J(140,110),hip:J(100,106),lk:J(86,60),  rk:J(70,120),la:J(70,60),  ra:J(50,120) }
  },
  'lat-lunges': {
    label: 'Lateral Lunges',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(60,30), neck:J(60,42), ls:J(44,54), rs:J(76,54),  le:J(30,72), re:J(90,72),  lw:J(30,88), rw:J(90,88),  hip:J(60,85), lk:J(30,100),rk:J(110,100),la:J(20,128), ra:J(120,128) }
  },
  'calf-raises': {
    label: 'Calf Raises',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,4),  neck:J(90,16), ls:J(74,28), rs:J(106,28), le:J(68,46), re:J(112,46), lw:J(66,62), rw:J(114,62), hip:J(90,62), lk:J(80,90), rk:J(100,90), la:J(80,120), ra:J(100,120) }
  },
  'bird-dog': {
    label: 'Bird-Dog',
    rest: { head:J(40,50), neck:J(56,58), ls:J(66,64), rs:J(86,70),  le:J(66,90), re:J(86,96),  lw:J(66,120),rw:J(86,120), hip:J(112,70),lk:J(112,100),rk:J(122,100),la:J(140,120),ra:J(140,120) },
    work: { head:J(30,50), neck:J(46,58), ls:J(56,64), rs:J(76,70),  le:J(30,64), re:J(76,96),  lw:J(10,64), rw:J(76,120), hip:J(112,70),lk:J(112,100),rk:J(132,70), la:J(140,120),ra:J(162,70) }
  },
  'russian-twists': {
    label: 'Russian Twists',
    rest: { head:J(120,60),neck:J(104,70),ls:J(96,64), rs:J(96,76),  le:J(90,70), re:J(90,70),  lw:J(100,70),rw:J(100,70), hip:J(90,95), lk:J(60,80), rk:J(60,80),  la:J(40,90),  ra:J(40,90) },
    work: { head:J(120,60),neck:J(104,70),ls:J(96,64), rs:J(96,76),  le:J(110,90),re:J(80,50),  lw:J(130,100),rw:J(70,40),  hip:J(90,95), lk:J(60,80), rk:J(60,80),  la:J(40,90),  ra:J(40,90) }
  },
  'wide-pu': {
    label: 'Wide Push-Ups',
    rest: { head:J(30,60), neck:J(46,66), ls:J(56,54), rs:J(80,88),  le:J(30,64), re:J(80,121), lw:J(15,110),rw:J(80,115), hip:J(112,80),lk:J(140,86),rk:J(140,86),  la:J(168,90), ra:J(168,90) },
    work: { head:J(30,86), neck:J(46,92), ls:J(56,80), rs:J(80,114), le:J(15,90), re:J(95,110), lw:J(15,110),rw:J(80,115), hip:J(112,100),lk:J(140,102),rk:J(140,102),la:J(168,106),ra:J(168,106) }
  },
  'sumo-squats': {
    label: 'Sumo Squats',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(70,98), rk:J(110,98), la:J(50,128), ra:J(130,128) },
    work: { head:J(90,36), neck:J(90,48), ls:J(72,60), rs:J(108,60), le:J(50,60), re:J(130,60), lw:J(30,60), rw:J(150,60), hip:J(90,95), lk:J(50,104),rk:J(130,104),la:J(30,128), ra:J(150,128) }
  },
  'hollow-body': {
    label: 'Hollow Body',
    rest: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(130,90),re:J(130,130),lw:J(150,80),rw:J(150,140),hip:J(100,110),lk:J(80,110),rk:J(80,110),la:J(60,110),ra:J(60,110) },
    work: { head:J(130,100),neck:J(114,104),ls:J(110,94),rs:J(110,114),le:J(120,84),re:J(120,124),lw:J(140,74),rw:J(140,134),hip:J(100,110),lk:J(70,90), rk:J(70,90), la:J(40,70), ra:J(40,70) }
  },
  'v-ups': {
    label: 'V-Ups',
    rest: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(130,90),re:J(130,130),lw:J(150,80),rw:J(150,140),hip:J(100,110),lk:J(80,110),rk:J(80,110),la:J(60,110),ra:J(60,110) },
    work: { head:J(110,70), neck:J(94,74),  ls:J(90,64), rs:J(90,84),  le:J(70,54), re:J(70,94),  lw:J(50,44), rw:J(50,104), hip:J(100,110),lk:J(70,70), rk:J(70,70), la:J(40,30), ra:J(40,30) }
  },
  'bear-crawls': {
    label: 'Bear Crawls',
    rest: { head:J(40,80), neck:J(56,88), ls:J(66,94), rs:J(86,100), le:J(66,110),re:J(86,116), lw:J(66,128),rw:J(86,128), hip:J(112,80),lk:J(112,110),rk:J(122,110),la:J(120,128),ra:J(140,128) },
    work: { head:J(50,80), neck:J(66,88), ls:J(76,94), rs:J(96,100), le:J(76,110),re:J(116,90), lw:J(76,128),rw:J(136,90), hip:J(122,80),lk:J(102,110),rk:J(132,110),la:J(82,128), ra:J(150,128) }
  },
  'frog-pumps': {
    label: 'Frog Pumps',
    rest: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(120,90),re:J(120,130),lw:J(120,80),rw:J(120,140),hip:J(100,110),lk:J(80,80), rk:J(80,140),la:J(80,110),ra:J(80,110) },
    work: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(120,90),re:J(120,130),lw:J(120,80),rw:J(120,140),hip:J(70,110), lk:J(50,80), rk:J(50,140),la:J(80,110),ra:J(80,110) }
  },
  'flutter-kicks': {
    label: 'Flutter Kicks',
    rest: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(120,90),re:J(120,130),lw:J(120,80),rw:J(120,140),hip:J(100,110),lk:J(80,110),rk:J(80,110),la:J(60,110),ra:J(60,110) },
    work: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(120,90),re:J(120,130),lw:J(120,80),rw:J(120,140),hip:J(100,110),lk:J(80,80), rk:J(80,110),la:J(60,50), ra:J(60,110) }
  },

  // STRETCH
  'forward-fold': {
    label: 'Forward Fold',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,110),neck:J(90,98), ls:J(74,92), rs:J(106,92), le:J(68,106),re:J(112,106),lw:J(68,122),rw:J(112,122),hip:J(90,70), lk:J(84,98), rk:J(96,98),  la:J(84,128), ra:J(96,128) }
  },
  'cobra': {
    label: 'Cobra Stretch',
    rest: { head:J(30,120),neck:J(46,120),ls:J(56,116),rs:J(56,124),le:J(46,110),re:J(46,130),lw:J(40,110),rw:J(40,130),hip:J(112,120),lk:J(130,120),rk:J(130,120),la:J(150,120),ra:J(150,120) },
    work: { head:J(40,60), neck:J(56,68), ls:J(66,74), rs:J(86,80),  le:J(50,84), re:J(70,90),  lw:J(40,110),rw:J(80,120), hip:J(112,110),lk:J(130,115),rk:J(130,115),la:J(160,120),ra:J(160,120) }
  },
  'childs-pose': {
    label: 'Childs Pose',
    rest: { head:J(90,90), neck:J(90,102),ls:J(74,112),rs:J(106,112),le:J(68,120),re:J(112,120),lw:J(66,128),rw:J(114,128),hip:J(90,128),lk:J(80,128),rk:J(100,128),la:J(80,128), ra:J(100,128) },
    work: { head:J(40,120),neck:J(56,114),ls:J(66,108),rs:J(86,114),le:J(40,100),re:J(70,106),lw:J(10,100),rw:J(10,116),hip:J(112,128),lk:J(100,128),rk:J(124,128),la:J(100,128),ra:J(124,128) }
  },
  'pigeon': {
    label: 'Pigeon Pose',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(60,80), neck:J(76,88), ls:J(86,94), rs:J(106,100),le:J(70,110),re:J(106,120),lw:J(50,120),rw:J(126,120),hip:J(112,106),lk:J(80,120), rk:J(140,116),la:J(110,120),ra:J(168,124) }
  },
  'quad-stretch': {
    label: 'Quad Stretch',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,74), lw:J(66,72), rw:J(100,94), hip:J(90,70), lk:J(80,98), rk:J(104,80), la:J(80,128), ra:J(100,70) }
  },
  'cross-body': {
    label: 'Cross-Body Stretch',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(100,36),re:J(112,54), lw:J(130,36),rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) }
  },
  'tricep-str': {
    label: 'Tricep Stretch',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(80,10), re:J(112,54), lw:J(100,30),rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) }
  },
  'butterfly': {
    label: 'Butterfly Stretch',
    rest: { head:J(90,60), neck:J(90,72), ls:J(74,82), rs:J(106,82), le:J(68,100),re:J(112,100),lw:J(66,118),rw:J(114,118),hip:J(90,118),lk:J(60,110),rk:J(120,110),la:J(90,128), ra:J(90,128) },
    work: { head:J(90,90), neck:J(90,102),ls:J(74,106),rs:J(106,106),le:J(68,114),re:J(112,114),lw:J(90,128),rw:J(90,128), hip:J(90,118),lk:J(60,124),rk:J(120,124),la:J(90,128), ra:J(90,128) }
  },
  'downdog': {
    label: 'Downward Dog',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(40,110),neck:J(56,98), ls:J(66,92), rs:J(86,98),  le:J(40,80), re:J(70,86),  lw:J(20,110),rw:J(50,120), hip:J(112,50),lk:J(130,80),rk:J(130,80), la:J(160,110),ra:J(160,110) }
  },
  'spinal-twist': {
    label: 'Spinal Twist',
    rest: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(120,90),re:J(120,130),lw:J(120,80),rw:J(120,140),hip:J(100,110),lk:J(80,110),rk:J(80,110),la:J(60,110),ra:J(60,110) },
    work: { head:J(140,110),neck:J(124,110),ls:J(120,80), rs:J(120,140),le:J(120,50),re:J(120,170),lw:J(120,20),rw:J(120,200),hip:J(100,110),lk:J(80,110),rk:J(60,140), la:J(60,110),ra:J(40,160) }
  },
  'sphinx': {
    label: 'Sphinx Pose',
    rest: { head:J(30,120),neck:J(46,120),ls:J(56,116),rs:J(56,124),le:J(46,110),re:J(46,130),lw:J(40,110),rw:J(40,130),hip:J(112,120),lk:J(130,120),rk:J(130,120),la:J(150,120),ra:J(150,120) },
    work: { head:J(40,80), neck:J(56,88), ls:J(66,94), rs:J(86,100), le:J(50,104),re:J(70,110), lw:J(50,120),rw:J(70,128), hip:J(112,110),lk:J(130,115),rk:J(130,115),la:J(160,120),ra:J(160,120) }
  },
  'crescent': {
    label: 'Crescent Lunge',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(80,12), neck:J(80,24), ls:J(64,34), rs:J(96,34),  le:J(58,16), re:J(102,16), lw:J(56,0),  rw:J(104,0),  hip:J(80,76), lk:J(56,86), rk:J(108,100), la:J(52,128), ra:J(108,128) }
  },
  'neck-flex': {
    label: 'Neck Flexion',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(102,14),neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) }
  },
  'chest-opener': {
    label: 'Chest Opener',
    rest: { head:J(30,120),neck:J(46,120),ls:J(56,116),rs:J(56,124),le:J(46,110),re:J(46,130),lw:J(40,110),rw:J(40,130),hip:J(112,120),lk:J(130,120),rk:J(130,120),la:J(150,120),ra:J(150,120) },
    work: { head:J(30,110),neck:J(46,110),ls:J(56,106),rs:J(56,114),le:J(50,80), re:J(50,140),lw:J(40,60), rw:J(40,160),hip:J(112,110),lk:J(130,110),rk:J(130,110),la:J(150,110),ra:J(150,110) }
  },
  'deep-squat': {
    label: 'Deep Squat',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,50), neck:J(90,62), ls:J(72,74), rs:J(108,74), le:J(60,86), re:J(120,86), lw:J(50,100),rw:J(130,100),hip:J(90,110),lk:J(54,110),rk:J(126,110),la:J(40,128), ra:J(140,128) }
  },
  'thread-needle': {
    label: 'Thread Needle',
    rest: { head:J(40,50), neck:J(56,58), ls:J(66,64), rs:J(86,70),  le:J(66,90), re:J(86,96),  lw:J(66,120),rw:J(86,120), hip:J(112,70),lk:J(112,100),rk:J(122,100),la:J(140,120),ra:J(140,120) },
    work: { head:J(40,64), neck:J(56,66), ls:J(66,70), rs:J(86,74),  le:J(86,84), re:J(100,40), lw:J(110,94),rw:J(120,10), hip:J(112,70),lk:J(112,100),rk:J(122,100),la:J(140,120),ra:J(140,120) }
  },
  'seated-ham': {
    label: 'Seated Hamstring',
    rest: { head:J(90,40), neck:J(90,52), ls:J(74,62), rs:J(106,62), le:J(68,80), re:J(112,80), lw:J(66,96), rw:J(114,96), hip:J(90,98), lk:J(60,98), rk:J(120,98),  la:J(30,120), ra:J(150,120) },
    work: { head:J(90,90), neck:J(90,78), ls:J(74,72), rs:J(106,72), le:J(60,90), re:J(120,90), lw:J(30,120),rw:J(150,120),hip:J(90,98), lk:J(60,98), rk:J(120,98),  la:J(30,120), ra:J(150,120) }
  },
  'happy-baby': {
    label: 'Happy Baby',
    rest: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(120,90),re:J(120,130),lw:J(120,80),rw:J(120,140),hip:J(100,110),lk:J(80,110),rk:J(80,110),la:J(60,110),ra:J(60,110) },
    work: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(80,70), re:J(80,150),lw:J(40,50), rw:J(40,170),hip:J(100,110),lk:J(60,70), rk:J(60,150),la:J(40,70), ra:J(40,150) }
  },
  'wrist-flex': {
    label: 'Wrist Flex',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(100,36),re:J(112,54), lw:J(130,36),rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) }
  },
  'calf-stretch': {
    label: 'Calf Stretch',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(80,18), neck:J(80,30), ls:J(64,40), rs:J(96,40),  le:J(50,50), re:J(110,50), lw:J(40,70), rw:J(120,70), hip:J(80,76), lk:J(56,86), rk:J(110,110),la:J(52,128), ra:J(110,128) }
  },
  'kneeling-hip': {
    label: 'Kneeling Hip',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,72), rw:J(114,72), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(80,60), neck:J(80,72), ls:J(64,82), rs:J(96,82),  le:J(58,100),re:J(102,100),lw:J(56,118),rw:J(104,118),hip:J(80,118),lk:J(100,128),rk:J(124,128),la:J(100,128),ra:J(124,128) }
  },
  'savasana': {
    label: 'Savasana',
    rest: { head:J(90,12), neck:J(90,24), ls:J(74,36), rs:J(106,36), le:J(68,54), re:J(112,54), lw:J(66,70), rw:J(114,70), hip:J(90,70), lk:J(80,98), rk:J(100,98), la:J(80,128), ra:J(100,128) },
    work: { head:J(140,110),neck:J(124,110),ls:J(120,100),rs:J(120,120),le:J(120,90),re:J(120,130),lw:J(120,80),rw:J(120,140),hip:J(100,110),lk:J(80,110),rk:J(80,110),la:J(60,110),ra:J(60,110) }
  }
};
