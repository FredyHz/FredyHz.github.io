(function () {

  /* ══════════════════════════════════
     AUDIO ENGINE  (Web Audio API)
  ══════════════════════════════════ */
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  /* Utilidad: oscilador simple con envolvente */
  function playTone(freq, type, startTime, duration, gainPeak, detune) {
    const ac  = getCtx();
    const osc = ac.createOscillator();
    const g   = ac.createGain();

    osc.type      = type || 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    if (detune) osc.detune.setValueAtTime(detune, startTime);

    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(g);
    g.connect(ac.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /* Ruido blanco corto (para glitch/estática) */
  function playNoise(startTime, duration, gainPeak) {
    const ac      = getCtx();
    const bufSize = ac.sampleRate * duration;
    const buf     = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;

    const src    = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    const g      = ac.createGain();

    filter.type            = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value         = 0.8;

    src.buffer = buf;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gainPeak, startTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(g);
    g.connect(ac.destination);
    src.start(startTime);
    src.stop(startTime + duration + 0.05);
  }

  /* ── Sonido 1: Boot inicial (sweep ascendente + pulso bajo) ── */
  function soundBoot() {
    const ac = getCtx();
    const t  = ac.currentTime;

    /* Sweep de frecuencia baja → alta */
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.18, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.6);

    /* Pulso de confirmación */
    playTone(880, 'square', t + 0.55, 0.12, 0.10);
    playTone(1100, 'square', t + 0.68, 0.08, 0.07);

    /* Estática corta */
    playNoise(t + 0.02, 0.08, 0.06);
  }

  /* ── Sonido 2: Beep de progreso (tono digital limpio) ── */
  function soundStep(stepIndex) {
    const ac   = getCtx();
    const t    = ac.currentTime;
    const base = 440 + stepIndex * 60;          // sube de tono en cada paso

    playTone(base,        'square', t,        0.06, 0.08);
    playTone(base * 1.5,  'square', t + 0.07, 0.05, 0.05);
  }

  /* ── Sonido 3: Glitch (burst de ruido + tono distorsionado) ── */
  function soundGlitch() {
    const ac = getCtx();
    const t  = ac.currentTime;

    playNoise(t,        0.04, 0.12);
    playNoise(t + 0.05, 0.03, 0.08);
    playTone(220, 'sawtooth', t + 0.02, 0.06, 0.10, 1200);
  }

  /* ── Sonido 4: Finalización (acorde ascendente tipo "sistema listo") ── */
  function soundDone() {
    const ac = getCtx();
    const t  = ac.currentTime;

    [523, 659, 784, 1047].forEach(function (freq, i) {
      playTone(freq, 'sine', t + i * 0.08, 0.25, 0.09);
    });

    /* Shimmer final */
    playTone(2093, 'sine', t + 0.38, 0.4, 0.05);
  }


  /* ══════════════════════════════════
     LOADER UI
  ══════════════════════════════════ */
  const loader = document.createElement('div');
  loader.id = 'fhm-loader';

  loader.innerHTML = `
    <div class="loader-orbit">
      <div class="loader-orbit-ring"></div>
      <div class="loader-orbit-ring ring2"></div>
      <div class="loader-orbit-ring ring3"></div>
      <div class="loader-logo">FHM<span>.</span></div>
    </div>
    <div class="loader-status" id="loaderStatus">Iniciando sistema...</div>
    <div class="loader-bar-wrap">
      <div class="loader-bar-fill" id="loaderBar"></div>
    </div>
    <div class="loader-pct" id="loaderPct">0%</div>
  `;

  document.body.prepend(loader);

  /* Partículas */
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'loader-particle';
    p.style.cssText =
      'left:'               + (Math.random() * 100)       + '%;' +
      'bottom:'             + (Math.random() * 40)         + '%;' +
      'animation-delay:'    + (Math.random() * 4)          + 's;' +
      'animation-duration:' + (3 + Math.random() * 3)     + 's;' +
      'box-shadow:0 0 4px #38b6ff;';
    loader.appendChild(p);
  }

  /* Secuencia de pasos */
  const steps = [
    { pct: 0,   msg: 'Iniciando sistema...'     },
    { pct: 18,  msg: 'Cargando módulos...'       },
    { pct: 36,  msg: 'Configurando entorno...'   },
    { pct: 54,  msg: 'Compilando recursos...'    },
    { pct: 72,  msg: 'Estableciendo conexión...' },
    { pct: 88,  msg: 'Optimizando interfaz...'   },
    { pct: 100, msg: 'Listo.'                     },
  ];

  const bar    = document.getElementById('loaderBar');
  const status = document.getElementById('loaderStatus');
  const pct    = document.getElementById('loaderPct');

  let step     = 0;
  const interval = 380;

  /* El audio necesita un gesto del usuario en algunos navegadores;
     usamos un click/touch único para desbloquear el contexto.       */
  let audioUnlocked = false;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    getCtx();                 /* crea el contexto tras el primer gesto */
    document.removeEventListener('click',     unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  }

  document.addEventListener('click',      unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });

  /* ── Arranque: boot + primer paso ── */
  function start() {
    soundBoot();

    /* Glitch visual+sonoro a los 0.9 s (coincide con el efecto CSS) */
    setTimeout(soundGlitch, 900);

    /* Avanzar pasos */
    setTimeout(runSteps, 200);
  }

  function runSteps() {
    if (step >= steps.length) return;
    const s = steps[step];

    bar.style.width    = s.pct + '%';
    pct.textContent    = s.pct + '%';
    status.textContent = s.msg;

    if (step > 0 && step < steps.length - 1) soundStep(step);
    if (step === steps.length - 1)            soundDone();

    step++;
    if (step < steps.length) setTimeout(runSteps, interval);
  }

  /* ── Iniciar tras interacción o directamente si ya está permitido ── */
  start();

  /* ── Ocultar al terminar ── */
  const totalTime = interval * steps.length + 500;

  setTimeout(function () {
    loader.classList.add('hidden');
    setTimeout(function () { loader.remove(); }, 700);
  }, totalTime);

})();
