/* Operação Travessia — uma sátira fictícia, feita inteiramente em JavaScript. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const W = 1280, H = 640;
  const inputs = { left: false, right: false };
  const particles = [];
  let last = performance.now(), visualTime = 0, hudAt = 0, shake = 0, toastUntil = 0;
  let best = 0, audio, sound = true, noteAt = 0, noteIndex = 0;
  let storageAvailable = true;
  let endingTime = null, endingPaused = false, endingComplete = false, endingPreview = false;
  try { best = Math.max(0, Number(localStorage.getItem('travessia-recorde-v1')) || 0); } catch { storageAvailable = false; }
  const stages = ['01 / A PONTE', '02 / AO VIVO', '03 / O PALANQUE FINAL'];
  const game = new TravessiaEngine.Game(handleEvent);

  function tone(frequency, duration = 0.09, type = 'square', volume = 0.035, endFrequency) {
    if (!sound) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      if (audio.state !== 'running') return;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const now = audio.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(now + duration);
    } catch { /* O jogo também funciona em navegadores sem Web Audio. */ }
  }
  function burst(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) particles.push({ x, y, vx: (Math.random() - 0.5) * 280, vy: -50 - Math.random() * 260, life: 0.45 + Math.random() * 0.5, max: 1, color, size: 3 + Math.random() * 5 });
  }
  function announce(text) { $('liveMessage').textContent = text; }
  function toast(text, duration = 3) {
    $('toast').textContent = text;
    $('toast').hidden = false;
    toastUntil = visualTime + duration;
    announce(text);
  }
  function saveBest() {
    best = Math.max(best, game.score);
    if (storageAvailable) {
      try { localStorage.setItem('travessia-recorde-v1', String(best)); } catch { storageAvailable = false; }
    }
  }
  function handleEvent(name, data) {
    const p = game.player;
    if (name === 'start') { endingTime = null; endingPaused = endingComplete = false; $('skipEndingBtn').hidden = true; $('endingPreviewBtn').hidden = true; $('overlay').hidden = true; particles.length = 0; toast('ESPAÇO: pulo duplo  ·  SHIFT: arrancada', 4); tone(440, 0.2, 'triangle', 0.05, 880); }
    if (name === 'jump') { tone(data === 1 ? 390 : 590, 0.14, 'square', 0.028, 900); burst(p.x + 26, p.y + 80, '#edd68c', 7); }
    if (name === 'dash') { tone(160, 0.25, 'sawtooth', 0.023, 620); burst(p.x, p.y + 42, '#69e5cd', 18); }
    if (name === 'token') { tone(1120, 0.11, 'sine', 0.06, 1680); burst(p.x + 26, p.y + 30, '#f7ca62', 6); }
    if (name === 'heal') { tone(660, 0.3, 'triangle', 0.05, 1320); toast('Fôlego extra! 9 selos = 1 vida.'); }
    if (name === 'hit') { shake = 13; tone(150, 0.25, 'sawtooth', 0.055, 45); burst(p.x + 26, p.y + 36, '#ff8e71', 16); announce('Obstáculo! ' + data + ' vidas restantes.'); }
    if (name === 'stage') {
      if (data === 1) toast('A TURMA CHEGOU · Janones, Erika e Cortez na ponte!');
      if (data === 2) { toast('PALANQUE DOS MEMES · Desvie até o discurso acabar!', 5); tone(110, 0.6, 'sawtooth', 0.04, 220); }
    }
    if (name === 'cast' && data === 'erika') announce('Cartum de Erika Hilton na pista. Desvie da tribuna!');
    if (name === 'cast' && data === 'cortez') announce('Cartum de Guilherme Cortez na pista. Atenção ao megafone!');
    if (name === 'pause') showOverlay('INTERVALO', 'Respira.<br>A ponte espera.', 'Aperte P ou continue quando estiver pronto.', 'CONTINUAR', 'O percurso está pausado.');
    if (name === 'resume') { $('overlay').hidden = true; last = performance.now(); }
    if (name === 'lost') {
      saveBest();
      showOverlay('FIM DA TENTATIVA', 'Deu ruim<br>na travessia.', 'Você percorreu ' + Math.floor(game.progress * 100) + '% da ponte e fez ' + game.score.toLocaleString('pt-BR') + ' pontos. Bora tentar de novo?', 'TENTAR DE NOVO', 'Dica: a arrancada atravessa obstáculos e recarrega em 3 segundos.');
      announce('Fim de jogo. ' + game.score + ' pontos. Tente novamente.');
    }
    if (name === 'won') {
      saveBest();
      beginEnding(false);
    }
    updateHud();
  }
  function showOverlay(eyebrow, title, text, button, hint) {
    $('overlayEyebrow').textContent = eyebrow;
    $('overlayTitle').innerHTML = title;
    $('overlayText').textContent = text;
    $('startBtn').textContent = button + '  →';
    $('overlayHint').textContent = hint;
    $('overlay').hidden = false;
    $('endingPreviewBtn').hidden = true;
    $('startBtn').focus({ preventScroll: true });
  }
  function startOrResume() {
    if (endingTime !== null && !endingComplete) togglePause();
    else if (game.phase === 'paused') game.pause();
    else game.start();
    canvas.focus({ preventScroll: true });
  }
  function updateHud() {
    $('score').textContent = String(game.score).padStart(6, '0');
    $('best').textContent = String(Math.max(best, game.score)).padStart(6, '0');
    $('lives').textContent = '♥'.repeat(game.lives) + '♡'.repeat(4 - game.lives);
    $('lives').setAttribute('aria-label', game.lives + ' de 4 vidas');
    $('progress').style.width = (game.progress * 100).toFixed(1) + '%';
    $('progressLabel').textContent = Math.floor(game.progress * 100) + '%';
    const cinematic = endingTime !== null;
    $('stageLabel').textContent = cinematic ? (endingTime < 8 ? '04 / EMBARQUE' : endingTime < 11 ? '05 / EM VOO' : '06 / ESTADOS UNIDOS') : stages[game.stage];
    const paused = cinematic ? endingPaused : game.phase === 'paused';
    $('pauseBtn').textContent = paused ? '▶' : 'Ⅱ';
    $('pauseBtn').setAttribute('aria-label', paused ? 'Continuar jogo' : 'Pausar jogo');
    $('pauseBtn').disabled = cinematic ? endingComplete : !['paused', 'running'].includes(game.phase);
  }
  function beginEnding(preview) {
    endingPreview = preview;
    endingTime = 0;
    endingComplete = endingPaused = false;
    inputs.left = inputs.right = false;
    particles.length = 0;
    $('overlay').hidden = true;
    $('toast').hidden = true;
    $('skipEndingBtn').hidden = false;
    canvas.focus({ preventScroll: true });
    tone(523, 0.7, 'triangle', 0.05, 1046);
    announce('Animação fictícia: Flávio embarca, voa para os Estados Unidos e encontra Trump.');
  }
  function finishEnding() {
    if (endingComplete) return;
    endingTime = TravessiaEnding.duration;
    endingComplete = true;
    endingPaused = false;
    $('skipEndingBtn').hidden = true;
    const text = endingPreview ? 'Avião, viagem e recepção do Trump: essa é a cena que espera no fim do percurso.' : 'Ponte vencida, avião no ar e Trump na recepção. Você chegou com ' + game.score.toLocaleString('pt-BR') + ' pontos e ' + game.tokens + ' selos na bagagem.';
    showOverlay(endingPreview ? 'PRÉVIA DO FINAL' : 'MISSÃO CONCLUÍDA', 'Welcome,<br><span>Flávio!</span>', text, endingPreview ? 'JOGAR A TRAVESSIA' : 'JOGAR DE NOVO', 'Viagem e recepção inventadas para este universo de cartum.');
    $('endingPreviewBtn').textContent = '↻ REVER A ANIMAÇÃO';
    $('endingPreviewBtn').hidden = false;
    announce(endingPreview ? 'Prévia da animação concluída.' : 'Vitória! Chegada aos Estados Unidos. ' + game.score + ' pontos.');
  }
  function togglePause() {
    inputs.left = inputs.right = false;
    if (endingTime !== null && !endingComplete) {
      endingPaused = !endingPaused;
      if (endingPaused) showOverlay('INTERVALO', 'Voo<br>pausado.', 'A viagem continua quando você quiser.', 'CONTINUAR VOO', 'P ou Escape para continuar.');
      else { $('overlay').hidden = true; last = performance.now(); canvas.focus({ preventScroll: true }); }
      updateHud();
    } else if (endingTime === null) game.pause();
  }
  $('startBtn').addEventListener('click', startOrResume);
  $('pauseBtn').addEventListener('click', togglePause);
  $('endingPreviewBtn').addEventListener('click', () => beginEnding(true));
  $('skipEndingBtn').addEventListener('click', finishEnding);
  $('soundBtn').addEventListener('click', () => {
    sound = !sound;
    updateSound();
    if (sound) tone(740, 0.12, 'sine');
  });
  function updateSound() {
    $('soundBtn').textContent = sound ? '♪' : '♪̸';
    $('soundBtn').setAttribute('aria-label', sound ? 'Desativar som' : 'Ativar som');
    $('soundBtn').setAttribute('aria-pressed', String(sound));
    $('soundBtn').title = sound ? 'Som ligado' : 'Som desligado';
  }
  function jumpAction() {
    if (endingTime !== null && !endingComplete) { if (endingPaused) togglePause(); return; }
    if (game.phase === 'menu' || game.phase === 'lost' || game.phase === 'won') startOrResume();
    else if (game.phase === 'paused') game.pause();
    else game.jump();
  }
  const gameKeys = new Set(['Space', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyD', 'ShiftLeft', 'ShiftRight', 'KeyP', 'Escape', 'KeyR']);
  window.addEventListener('keydown', e => {
    if (!gameKeys.has(e.code) || e.ctrlKey || e.altKey || e.metaKey) return;
    // Preserve activation of focused toolbar buttons by keyboard.
    if (e.code === 'Space' && e.target instanceof HTMLButtonElement && e.target !== $('startBtn')) return;
    e.preventDefault();
    if (['ArrowLeft', 'KeyA'].includes(e.code)) inputs.left = true;
    if (['ArrowRight', 'KeyD'].includes(e.code)) inputs.right = true;
    if (e.repeat) return;
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) jumpAction();
    if (['ShiftLeft', 'ShiftRight'].includes(e.code)) game.dash();
    if (['KeyP', 'Escape'].includes(e.code)) togglePause();
    if (e.code === 'KeyR') { game.start(); canvas.focus({ preventScroll: true }); }
  });
  window.addEventListener('keyup', e => {
    if (['ArrowLeft', 'KeyA'].includes(e.code)) inputs.left = false;
    if (['ArrowRight', 'KeyD'].includes(e.code)) inputs.right = false;
  });
  function releaseAndPause() {
    inputs.left = inputs.right = false;
    if (endingTime !== null && !endingComplete && !endingPaused) togglePause();
    else if (endingTime === null && game.phase === 'running') game.pause();
  }
  window.addEventListener('blur', releaseAndPause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAndPause(); });
  for (const [id, action] of [['leftBtn', 'left'], ['rightBtn', 'right'], ['jumpBtn', 'jump'], ['dashBtn', 'dash']]) {
    const button = $(id);
    button.style.touchAction = 'none';
    button.addEventListener('pointerdown', e => {
      e.preventDefault();
      button.setPointerCapture(e.pointerId);
      if (action === 'jump') jumpAction();
      else if (action === 'dash') game.dash();
      else inputs[action] = true;
    });
    const release = () => { if (action === 'left' || action === 'right') inputs[action] = false; };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    button.addEventListener('click', e => {
      // Keyboard activation; pointer actions are already handled above.
      if (e.detail === 0) { if (action === 'jump') jumpAction(); else if (action === 'dash') game.dash(); }
    });
  }
  canvas.addEventListener('pointerdown', e => { e.preventDefault(); canvas.focus({ preventScroll: true }); if (game.phase === 'running') game.jump(); });

  function roundRect(x, y, w, h, r, fill) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  }
  function label(text, x, y, size, color, align = 'left', weight = 700) {
    ctx.font = weight + ' ' + size + 'px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, x, y);
  }
  function drawToken(t) {
    const bob = Math.sin(visualTime * 4 + t.x * 0.01) * 3;
    ctx.save(); ctx.translate(t.x + 14, t.y + 14 + bob);
    ctx.shadowColor = '#ffd174'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#f6c765'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#a8782a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke();
    label('★', 0, 5, 15, '#6c4e24', 'center'); ctx.restore();
  }
  function drawEffects(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt;
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
  function drawFinish() {
    if (game.progress < 0.92) return;
    const x = 1520 - (game.progress - 0.92) * 15000;
    roundRect(x, 295, 16, 220, 4, '#e9d7a5');
    roundRect(x + 260, 295, 16, 220, 4, '#e9d7a5');
    roundRect(x - 10, 274, 296, 58, 5, '#234c4e');
    label('¡BIENVENIDOS!', x + 138, 311, 24, '#fff0c7', 'center');
    for (let i = 0; i < 11; i++) { ctx.fillStyle = i % 2 ? '#ece9d5' : '#172d33'; ctx.fillRect(x + i * 25, 494, 25, 16); }
    TravessiaEnding.drawPlane(ctx, x + 505, 423, 0.83, 0);
    label('PRÓXIMA PARADA: EMBARQUE', x + 138, 354, 12, '#fff0c7', 'center');
  }
  function drawGame(dt) {
    ctx.clearRect(0, 0, W, H);
    const active = game.phase !== 'menu';
    const world = active ? game.distance : visualTime * 22;
    TravessiaArt.drawBackground(ctx, W, H, world, visualTime);
    ctx.save();
    if (shake > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
    shake = Math.max(0, shake - dt * 38);
    if (!active) {
      // Personagens do cartaz inicial, no mesmo cenário do jogo.
      TravessiaArt.drawObstacle(ctx, { type: 'barrier', x: 1130, y: 444, w: 84, h: 66 }, visualTime);
      TravessiaArt.drawObstacle(ctx, { type: 'cone', x: 737, y: 456, w: 42, h: 54 }, visualTime);
      ctx.save(); ctx.translate(845, 365); ctx.scale(1.7, 1.7);
      TravessiaArt.drawPlayer(ctx, 0, 0, 52, 84, visualTime, { running: true, grounded: true }); ctx.restore();
      roundRect(802, 283, 175, 35, 6, '#f4ca6c');
      label('FLÁVIO', 889, 307, 18, '#193238', 'center', 800);
      label('O PERSONAGEM', 889, 272, 11, '#d2e5d8', 'center');
    } else {
      drawFinish();
      if (game.stage === 2) {
        const bossX = game.progress > 0.95 ? 1050 + (game.progress - 0.95) * 6000 : 1050;
        TravessiaArt.drawBoss(ctx, bossX, 316 + Math.sin(visualTime * 1.8) * 6, visualTime, game.bossRemaining);
      }
      for (const token of game.pickups) drawToken(token);
      for (const o of game.obstacles) TravessiaArt.drawObstacle(ctx, o, visualTime);
      const p = game.player;
      if (p.dash > 0) {
        ctx.globalAlpha = 0.16;
        for (let i = 3; i > 0; i--) TravessiaArt.drawPlayer(ctx, p.x - i * 25, p.y, p.w, p.h, visualTime, { running: true, dash: true, grounded: p.grounded });
        ctx.globalAlpha = 1;
      }
      if (p.invincible <= 0 || p.dash > 0 || Math.floor(visualTime * 15) % 2 === 0) {
        TravessiaArt.drawPlayer(ctx, p.x, p.y, p.w, p.h, visualTime, { running: game.phase === 'running', grounded: p.grounded, invincible: p.invincible > 0, dash: p.dash > 0 });
      }
      // A faixa inferior mantém as informações longe dos obstáculos.
      roundRect(28, 565, 230, 49, 9, '#0c222bdb');
      label('ARRANCADA', 44, 584, 10, '#b4d3cf');
      label(p.cooldown <= 0 ? 'SHIFT · PRONTA' : p.cooldown.toFixed(1) + 's', 240, 584, 10, p.cooldown <= 0 ? '#77e4c7' : '#e7c16f', 'right');
      roundRect(44, 596, 196, 5, 2, '#29464c');
      roundRect(44, 596, Math.max(1, 196 * (1 - p.cooldown / 3)), 5, 2, '#6bd8ba');
      label('★ ' + game.tokens + ' SELOS', 1216, 593, 14, '#f7cf72', 'right');
      if (game.stage === 2) {
        roundRect(414, 34, 450, 62, 10, '#1c262de8');
        label('CHEFÃO: LULA', 432, 58, 12, '#ffe1c3');
        label('MEMES DE 2026 · DESVIE!', 846, 58, 10, '#d9c3b7', 'right');
        roundRect(432, 75, 414, 6, 3, '#593c40');
        roundRect(432, 75, Math.max(1, 414 * game.bossRemaining), 6, 3, '#f27864');
      }
    }
    drawEffects(dt);
    ctx.restore();
    // Moldura discreta de lente arcade.
    const vignette = ctx.createRadialGradient(640, 300, 280, 640, 320, 780);
    vignette.addColorStop(0, '#00101800'); vignette.addColorStop(1, '#00101855');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
  }
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    visualTime += dt;
    if (endingTime === null) game.tick(dt, inputs);
    const cinematic = endingTime !== null;
    const paused = cinematic ? endingPaused : game.phase === 'paused';
    if (cinematic && !endingComplete && !paused) {
      endingTime = Math.min(TravessiaEnding.duration, endingTime + dt);
      if (endingTime >= TravessiaEnding.duration) finishEnding();
    }
    if (game.phase === 'running' && sound && game.time >= noteAt) {
      const notes = [147, 0, 220, 0, 196, 0, 165, 220];
      const n = notes[noteIndex++ % notes.length];
      if (n) tone(n, 0.17, 'triangle', 0.017);
      noteAt = game.time + 0.3;
    }
    if (game.phase !== 'running') noteAt = 0;
    if (!paused) {
      if (cinematic) TravessiaEnding.draw(ctx, endingTime, { score: game.score, tokens: game.tokens, lives: game.lives });
      else drawGame(dt);
    }
    if (visualTime >= hudAt) { updateHud(); hudAt = visualTime + 0.1; }
    if (!$('toast').hidden && visualTime > toastUntil) $('toast').hidden = true;
    requestAnimationFrame(frame);
  }
  // O canvas mantém coordenadas estáveis; o CSS escala toda a área sem recortar.
  updateHud(); updateSound();
  requestAnimationFrame(frame);
})();
