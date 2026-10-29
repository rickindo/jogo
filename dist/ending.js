/* A fictional, illustrated ending for Operação Travessia. No external assets. */
(() => {
  'use strict';

  const W = 1280, H = 640, duration = 18;
  const C = { ink: '#122b38', cream: '#fff0d2', amber: '#ffd36a', teal: '#65d5c1' };
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
  const ease = n => { const v = clamp(n); return v * v * (3 - 2 * v); };
  const mix = (a, b, n) => a + (b - a) * n;

  function path(ctx, points, fill, stroke = C.ink, width = 2) {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  }

  function round(ctx, x, y, w, h, r, fill, stroke) {
    const d = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + d, y);
    ctx.arcTo(x + w, y, x + w, y + h, d);
    ctx.arcTo(x + w, y + h, x, y + h, d);
    ctx.arcTo(x, y + h, x, y, d);
    ctx.arcTo(x, y, x + w, y, d);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }

  function ellipse(ctx, x, y, rx, ry, fill, stroke) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }

  function line(ctx, pts, color, width = 2) {
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.lineWidth = width; ctx.strokeStyle = color; ctx.stroke();
  }

  function text(ctx, str, x, y, size = 16, color = C.cream, align = 'left', weight = 700) {
    ctx.font = `${weight} ${size}px "Trebuchet MS", system-ui, sans-serif`;
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  function cloud(ctx, x, y, scale = 1, alpha = .5) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.globalAlpha *= alpha;
    ctx.fillStyle = '#eff2d9';
    ctx.beginPath();
    ctx.moveTo(-90, 18); ctx.bezierCurveTo(-115, 5, -90, -16, -62, -10);
    ctx.bezierCurveTo(-56, -45, -4, -49, 8, -16);
    ctx.bezierCurveTo(37, -39, 77, -19, 71, 2);
    ctx.bezierCurveTo(120, -4, 137, 25, 101, 29);
    ctx.lineTo(-66, 29); ctx.bezierCurveTo(-80, 28, -94, 26, -90, 18);
    ctx.fill(); ctx.restore();
  }

  function sky(ctx, t, usa = false) {
    const g = ctx.createLinearGradient(0, 0, 0, 490);
    g.addColorStop(0, usa ? '#376c85' : '#153d4c');
    g.addColorStop(.65, usa ? '#87b3bc' : '#8caaa2');
    g.addColorStop(1, usa ? '#e2e7ce' : '#edbe87');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(1030, 175, 15, 1030, 175, 210);
    glow.addColorStop(0, '#ffd69b55'); glow.addColorStop(1, '#ffd69b00');
    ctx.fillStyle = glow; ctx.fillRect(810, 0, 470, 440);
    ellipse(ctx, 1030, 175, usa ? 38 : 48, usa ? 38 : 48, usa ? '#f6eac3' : '#ffe0a0');
    for (let i = 0; i < 6; i++) cloud(ctx, ((i * 249 - t * 7 + 160) % 1620 + 1620) % 1620 - 160, 90 + (i % 3) * 58, .6 + i % 2 * .35, .12);
  }

  function flag(ctx, x, y, usa, time) {
    line(ctx, [[x, y], [x, y + 134]], '#d5ddd0', 3);
    ellipse(ctx, x, y - 3, 4, 4, C.amber);
    const wave = Math.sin(time * 2) * 2;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.lineTo(x + 78, y + wave);
    ctx.lineTo(x + 78, y + 45 + wave); ctx.lineTo(x + 2, y + 45); ctx.closePath(); ctx.clip();
    ctx.fillStyle = '#f7efdc'; ctx.fillRect(x, y, 82, 50);
    if (usa) {
      ctx.fillStyle = '#c65351';
      for (let j = 0; j < 7; j++) ctx.fillRect(x, y + j * 7, 82, 3.5);
      ctx.fillStyle = '#254966'; ctx.fillRect(x, y, 34, 25);
      for (let j = 0; j < 4; j++) for (let k = 0; k < 5; k++) ellipse(ctx, x + 5 + k * 6, y + 4 + j * 6, 1, 1, '#fff2d0');
    } else {
      ctx.fillStyle = '#c85551'; ctx.fillRect(x, y, 82, 15);
      ctx.fillStyle = '#27496c'; ctx.fillRect(x, y + 30, 82, 18);
      ellipse(ctx, x + 37, y + 23, 4, 4, '#91a475');
    }
    ctx.restore();
    line(ctx, [[x + 2, y], [x + 78, y + wave], [x + 78, y + 45 + wave]], '#203c4b55', 1);
  }

  function airport(ctx, t, usa = false) {
    sky(ctx, t, usa);
    const horizon = usa ? '#678b8e' : '#718f81';
    ctx.fillStyle = horizon;
    for (let i = 0; i < 20; i++) {
      const bx = i * 70 - 10, bh = usa ? 48 + (i * 37 % 90) : 25 + i * 19 % 43;
      ctx.fillRect(bx, 375 - bh, 42 + i % 3 * 13, bh);
      if (usa && i % 4 === 0) ctx.fillRect(bx + 17, 361 - bh, 5, 17);
    }
    ctx.fillStyle = usa ? '#97aaa0' : '#8ba38a'; ctx.fillRect(0, 375, W, 88);
    for (let i = 0; i < 13; i++) {
      const x = i * 113 + 28;
      ellipse(ctx, x, 385, 26, 15, '#456e67');
      ellipse(ctx, x + 14, 380, 15, 18, '#4f7b6b');
    }

    // A small terminal, its glass roof and control tower.
    const tx = usa ? 794 : 18;
    round(ctx, tx, 303, usa ? 450 : 430, 131, 5, usa ? '#b9ceca' : '#b3c9ba', '#345a61');
    path(ctx, [[tx - 10, 305], [tx + 30, 284], [tx + 430, 284], [tx + 450, 305]], '#446f73', '#345a61');
    ctx.fillStyle = '#224c5b'; ctx.fillRect(tx + 13, 336, 410, 64);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#84aaa5' : '#5e969a'; ctx.fillRect(tx + 20 + i * 51, 341, 40, 53);
      line(ctx, [[tx + 27 + i * 51, 346], [tx + 46 + i * 51, 346]], '#b6d4bf66', 2);
    }
    const sign = usa ? 'USA  ARRIVALS' : 'AEROPORTO · EMBARQUE';
    round(ctx, tx + 31, 303, usa ? 344 : 340, 29, 4, '#183c4a');
    text(ctx, sign, tx + 201, 318, usa ? 17 : 14, C.amber, 'center');
    const towerX = usa ? 719 : 473;
    path(ctx, [[towerX, 421], [towerX + 10, 254], [towerX + 55, 254], [towerX + 64, 421]], '#6d9492', '#345a61');
    path(ctx, [[towerX - 8, 251], [towerX + 70, 251], [towerX + 60, 287], [towerX + 1, 287]], '#1d4758', '#345a61');
    line(ctx, [[towerX - 11, 246], [towerX + 73, 246]], '#d2ddc5', 4);
    line(ctx, [[towerX + 32, 243], [towerX + 32, 217]], '#244f5c', 2);
    ellipse(ctx, towerX + 32, 215, 3, 3, C.amber);
    for (let k = 0; k < 3; k++) line(ctx, [[towerX + 11 + k * 20, 255], [towerX + 14 + k * 17, 282]], '#80aaa9', 2);
    flag(ctx, usa ? 1155 : 547, 252, usa, t);

    // Runway and apron share the game's 510px ground line.
    ctx.fillStyle = '#355253'; ctx.fillRect(0, 434, W, 80);
    ctx.fillStyle = '#263f48'; ctx.fillRect(0, 447, W, 62);
    ctx.fillStyle = '#7d958a'; ctx.fillRect(0, 510, W, 58);
    ctx.fillStyle = '#b2ba99'; ctx.fillRect(0, 511, W, 4);
    ctx.fillStyle = '#c9d2ac';
    for (let i = 0; i < 11; i++) ctx.fillRect(i * 140 + 30, 472, 69, 4);
    for (let i = 0; i < 17; i++) {
      const x = i * 81 + 4;
      round(ctx, x, 440, 10, 3, 1, C.amber);
      line(ctx, [[x + 5, 443], [x + 5, 448]], '#1c4149', 2);
    }
    line(ctx, [[0, 545], [1280, 545]], '#d1bb72', 3);
    for (let i = 0; i < 8; i++) line(ctx, [[i * 190, 514], [i * 190 + 12, 566]], '#627b7433', 2);
  }

  function gear(ctx, x, y, scale, tilt, amount = 1) {
    if (amount <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(scale, scale);
    for (const gx of [-36, 102]) {
      line(ctx, [[gx, 22], [gx + 10 * (1 - amount), 22 + 33 * amount]], '#2e5260', 5);
      ellipse(ctx, gx + 10 * (1 - amount), 25 + 32 * amount, 9 * amount + 2, 9 * amount + 2, '#183442', '#b3c6be');
      ellipse(ctx, gx + 10 * (1 - amount), 25 + 32 * amount, 3, 3, '#769896');
    }
    ctx.restore();
  }

  // Coordinates refer to the center of the fuselage. Tilt is measured in radians.
  function drawPlane(ctx, x, y, scale = 1, tilt = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(scale, scale);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // Far wing, tail and vertical stabilizer.
    path(ctx, [[-26, -19], [-81, -86], [-109, -87], [-70, -8]], '#a4c9c1', C.ink, 3);
    path(ctx, [[-127, -8], [-171, -64], [-151, -66], [-91, -5]], '#70b7aa', C.ink, 3);
    path(ctx, [[-148, -6], [-143, -87], [-122, -87], [-92, -6]], '#277b7c', C.ink, 3);
    path(ctx, [[-141, -70], [-124, -70], [-112, -40], [-139, -40]], '#ffd36a', null);
    // Long white fuselage, nose to the right.
    ctx.beginPath(); ctx.moveTo(-157, -12);
    ctx.bezierCurveTo(-138, -26, -81, -33, 85, -31);
    ctx.bezierCurveTo(120, -32, 150, -19, 171, 0);
    ctx.bezierCurveTo(180, 9, 162, 23, 130, 26);
    ctx.bezierCurveTo(48, 32, -105, 26, -145, 13);
    ctx.quadraticCurveTo(-166, 6, -157, -12); ctx.closePath();
    ctx.fillStyle = '#f5f0d9'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-150, 8); ctx.bezierCurveTo(-69, 20, 74, 17, 171, 2);
    ctx.lineTo(161, 15); ctx.bezierCurveTo(94, 35, -108, 25, -146, 12); ctx.closePath();
    ctx.fillStyle = '#38928d'; ctx.fill();
    line(ctx, [[-129, 4], [147, 4]], '#b1d5c3', 2);
    // Cockpit, boarding door and passenger windows.
    path(ctx, [[109, -26], [135, -18], [147, -8], [110, -10]], '#173d53', null);
    line(ctx, [[126, -22], [128, -9]], '#9fc9c5', 2);
    round(ctx, -59, -24, 20, 45, 7, '#b8d2c7', '#4e7d7e');
    round(ctx, -55, -19, 12, 12, 4, '#2a5968');
    for (let i = 0; i < 8; i++) round(ctx, -26 + i * 16, -20, 9, 10, 4, '#2a5968', '#9dbdb7');
    ellipse(ctx, -42, 1, 2, 2, C.amber);
    text(ctx, 'TRAVESSIA AIR', 7, -43, 8, '#315e67', 'center', 800);
    // Near wing, engine and a small nav light.
    path(ctx, [[-18, 4], [-99, 66], [-63, 71], [51, 12]], '#e0e4cc', C.ink, 3);
    path(ctx, [[-78, 57], [-99, 66], [-63, 71], [-45, 62]], '#348b87', null);
    round(ctx, 0, 23, 58, 25, 12, '#cedfd0', C.ink);
    ellipse(ctx, 51, 35, 9, 12, '#1c4b5c', '#72a6a3');
    ellipse(ctx, 52, 35, 4, 7, '#497f88');
    ellipse(ctx, -97, 64, 3, 2, '#ffb175');
    ctx.restore();
  }

  function walkingPlayer(ctx, x, y, t, running = true) {
    if (window.TravessiaArt?.drawPlayer) {
      window.TravessiaArt.drawPlayer(ctx, x, y, 52, 84, t, { running, grounded: true, invincible: false, dash: false });
    } else {
      // Also works when the ending is previewed on its own.
      ellipse(ctx, x + 26, y + 17, 16, 18, '#e9b18a', C.ink);
      round(ctx, x + 8, y + 35, 36, 36, 9, '#35946c', C.ink);
      line(ctx, [[x + 15, y + 69], [x + 13, y + 83]], '#1a3b4c', 8);
      line(ctx, [[x + 36, y + 69], [x + 40, y + 83]], '#1a3b4c', 8);
    }
  }

  function trump(ctx, x, y, t) {
    ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ellipse(ctx, 35, 101, 39, 6, '#132f392f');
    // Trousers and navy suit.
    line(ctx, [[23, 70], [20, 96]], '#203d5b', 14);
    line(ctx, [[48, 70], [52, 96]], '#203d5b', 14);
    round(ctx, 6, 95, 24, 7, 3, '#122b38'); round(ctx, 43, 95, 24, 7, 3, '#122b38');
    path(ctx, [[15, 38], [55, 38], [63, 78], [8, 78]], '#214c72', C.ink, 3);
    path(ctx, [[25, 38], [44, 38], [37, 72]], '#f5ead9', null);
    path(ctx, [[33, 42], [39, 42], [42, 65], [36, 73], [31, 65]], '#d45850', C.ink, 1);
    path(ctx, [[20, 40], [30, 57], [24, 62], [33, 77], [10, 76]], '#315e7c', null);
    path(ctx, [[48, 40], [39, 57], [46, 62], [39, 77], [61, 76]], '#315e7c', null);
    // Left hand by his side, right hand waving.
    line(ctx, [[15, 46], [1, 67]], '#234f73', 14);
    ellipse(ctx, -1, 72, 7, 8, '#edb18a', C.ink);
    const wave = Math.sin(t * 7) * 4;
    line(ctx, [[54, 46], [71, 34], [75 + wave, 16]], '#244f73', 13);
    ellipse(ctx, 77 + wave, 10, 8, 11, '#edb18a', C.ink);
    for (let i = 0; i < 3; i++) line(ctx, [[72 + wave + i * 4, 5], [72 + wave + i * 4, -1 - i % 2 * 3]], '#edb18a', 4);
    // Peach face, ears and distinctive swept blond hair.
    ellipse(ctx, 12, 22, 6, 8, '#e5a17e', C.ink);
    ellipse(ctx, 58, 22, 6, 8, '#e5a17e', C.ink);
    round(ctx, 13, 0, 44, 45, 15, '#edb18a', C.ink);
    path(ctx, [[12, 14], [9, 4], [17, -9], [40, -14], [62, -7], [54, 2], [46, 6], [37, 2], [25, 4], [20, 16]], '#e8bf62', C.ink, 2);
    path(ctx, [[17, -5], [45, -8], [57, -5], [40, -1], [23, 0]], '#f6d88a', null);
    line(ctx, [[21, 18], [29, 16]], '#946541', 2);
    line(ctx, [[42, 16], [50, 18]], '#946541', 2);
    ellipse(ctx, 26, 21, 2, 2, '#24414f'); ellipse(ctx, 45, 21, 2, 2, '#24414f');
    path(ctx, [[36, 22], [33, 30], [39, 30]], '#dd9673', null);
    ctx.beginPath(); ctx.moveTo(27, 35); ctx.quadraticCurveTo(36, 40, 45, 34);
    ctx.strokeStyle = '#945f4f'; ctx.lineWidth = 2; ctx.stroke();
    round(ctx, -1, 109, 77, 17, 4, '#183849', '#6da69c');
    text(ctx, 'TRUMP', 37, 118, 10, C.cream, 'center', 800);
    ctx.restore();
  }

  function speech(ctx, x, y, t) {
    ctx.save();
    const p = ease((t - 15.55) / .5);
    ctx.globalAlpha = p;
    ctx.translate(x + 105, y + 54); ctx.scale(.85 + .15 * p, .85 + .15 * p); ctx.translate(-105, -54);
    round(ctx, 0, 0, 225, 52, 15, '#fff0d7', '#173949');
    path(ctx, [[139, 50], [153, 68], [157, 50]], '#fff0d7', '#173949');
    line(ctx, [[140, 50], [156, 50]], '#fff0d7', 3);
    text(ctx, 'WELCOME, FLÁVIO!', 112, 25, 15, '#183c4b', 'center', 800);
    ctx.restore();
  }

  function boarding(ctx, t) {
    airport(ctx, t, false);
    text(ctx, 'PARAGUAI', 1174, 399, 12, '#355a58', 'right');
    ellipse(ctx, 776, 508, 172, 9, '#13343c30');
    gear(ctx, 770, 442, 1, 0, 1); drawPlane(ctx, 770, 442, 1, 0);
    // A short boarding stair by the door.
    path(ctx, [[688, 510], [716, 464], [731, 464], [706, 510]], '#e0dbb8', '#4e7070');
    for (let i = 0; i < 5; i++) line(ctx, [[691 + i * 5, 505 - i * 9], [709 + i * 4, 505 - i * 9]], '#607d79', 2);
    line(ctx, [[687, 487], [717, 445], [731, 445]], '#e0ddbe', 3);
    const p = ease(t / 4.8), x = mix(104, 699, p);
    if (t < 4.9) {
      ctx.save(); ctx.globalAlpha = 1 - ease((t - 4.35) / .55);
      walkingPlayer(ctx, x, 426 - ease((t - 4) / .9) * 37, t * 1.5, t < 4.7);
      ctx.restore();
    }
    if (t < 3.5) {
      round(ctx, 79, 381, 130, 25, 6, '#163e4bdc', '#73a397');
      text(ctx, 'PRÓXIMA PARADA: CÉU', 144, 394, 8, C.cream, 'center');
    }
  }

  function takeoff(ctx, t) {
    airport(ctx, t, false);
    const p = ease((t - 5) / 3), x = mix(770, 1340, p), y = mix(442, 98, ease((t - 5.4) / 2.6));
    ellipse(ctx, Math.min(1210, x), 508, 170 - p * 100, 9 - p * 6, `rgba(19,52,60,${.18 * (1 - p)})`);
    const angle = -.18 * ease((t - 5.25) / 1.3);
    if (p > .2) {
      ctx.save(); ctx.globalAlpha = .2 * (1 - p);
      line(ctx, [[x - 230, y + 10], [x - 360, y + 40]], '#e8e4ba', 9);
      line(ctx, [[x - 200, y + 40], [x - 290, y + 60]], '#e8e4ba', 5); ctx.restore();
    }
    gear(ctx, x, y, 1 - p * .2, angle, 1 - ease((t - 5.9) / .8));
    drawPlane(ctx, x, y, 1 - p * .2, angle);
    if (t > 6.3) {
      text(ctx, 'PONTE ATRAVESSADA.', 78, 124, 38, C.cream);
      text(ctx, 'Agora o mapa ficou um pouco maior.', 81, 163, 17, '#d7e5d0');
    }
  }

  function journey(ctx, t) {
    sky(ctx, t * 3, true);
    for (let i = 0; i < 8; i++) cloud(ctx, ((i * 221 + 240 - t * 45) % 1700 + 1700) % 1700 - 200, 330 + i % 3 * 60, 1 + i % 2 * .4, .45);
    // Poster-like route map, deliberately stylized rather than geographic detail.
    round(ctx, 72, 77, 1136, 391, 18, '#123849a8', '#b0d6c344');
    text(ctx, 'CONEXÃO INTERNACIONAL', 108, 111, 10, C.teal);
    text(ctx, 'PARAGUAI  →  ESTADOS UNIDOS', 108, 151, 29, C.cream);
    ctx.save(); ctx.translate(242, 182);
    path(ctx, [[150, 19], [116, 21], [101, 43], [60, 44], [30, 64], [25, 95], [67, 118], [87, 151], [122, 155], [141, 183], [165, 166], [181, 126], [207, 97], [202, 63], [180, 48]], '#4d928c80', '#7bb6a577');
    path(ctx, [[164, 175], [179, 201], [194, 212], [196, 235], [208, 256], [211, 284], [225, 313], [246, 303], [257, 275], [276, 255], [285, 225], [264, 203], [232, 190], [221, 170], [193, 166]], '#4d928c80', '#7bb6a577');
    path(ctx, [[186, 157], [204, 167], [213, 172], [223, 169], [232, 183]], null, '#74a89d', 5);
    ctx.restore();
    const from = {x:488,y:414}, to = {x:778,y:260};
    ctx.setLineDash([4, 10]); ctx.lineDashOffset = -(t - 8) * 22;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.bezierCurveTo(550, 208, 690, 174, to.x, to.y);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
    ellipse(ctx, from.x, from.y, 7, 7, C.amber, '#183c4a');
    ellipse(ctx, to.x, to.y, 7, 7, C.teal, '#183c4a');
    text(ctx, 'PARAGUAI', from.x - 18, from.y + 26, 12, C.cream, 'right');
    text(ctx, 'ESTADOS UNIDOS', to.x + 21, to.y - 2, 12, C.cream);
    const p = ease((t - 8) / 3), q = 1 - p;
    const px = q*q*q*from.x + 3*q*q*p*550 + 3*q*p*p*690 + p*p*p*to.x;
    const py = q*q*q*from.y + 3*q*q*p*208 + 3*q*p*p*174 + p*p*p*to.y;
    const dx = 3*q*q*(550-from.x) + 6*q*p*(690-550) + 3*p*p*(to.x-690);
    const dy = 3*q*q*(208-from.y) + 6*q*p*(174-208) + 3*p*p*(to.y-174);
    drawPlane(ctx, px, py, .32, Math.atan2(dy, dx));
    text(ctx, 'UMA ROTA. MAIS UMA CONFUSÃO.', 1054, 417, 9, '#a2c4bc', 'right');
  }

  function arrival(ctx, t, stats) {
    airport(ctx, t, true);
    text(ctx, 'UNITED STATES', 74, 398, 12, '#355a58');
    const landing = ease((t - 11) / 3.4);
    const x = mix(-195, 620, landing), y = mix(190, 442, landing);
    const tilt = .07 * (1 - landing);
    ellipse(ctx, Math.max(5, x), 508, 110 + landing * 62, 6 + landing * 3, `rgba(19,52,60,${.07 + landing * .12})`);
    gear(ctx, x, y, 1, tilt, ease((t - 11.1) / .8));
    drawPlane(ctx, x, y, 1, tilt);
    if (t > 13.6 && t < 14.6) {
      ctx.save(); ctx.globalAlpha = (1 - clamp((t - 13.8) / .8)) * .4;
      ellipse(ctx, x - 45, 498, 28, 8, '#e3e2c5'); ellipse(ctx, x + 98, 498, 18, 6, '#e3e2c5'); ctx.restore();
    }
    trump(ctx, 1042, 407, t);
    if (t >= 15) {
      const p = ease((t - 15) / 2.5), fx = mix(570, 944, p);
      // Player walks into the foreground toward the waiting character.
      walkingPlayer(ctx, fx, 426, t * 1.6, p < 1);
      speech(ctx, 912, 299, t);
      if (t > 17.1) {
        const a = ease((t - 17.1) / .7);
        ctx.save(); ctx.globalAlpha = a;
        round(ctx, 72, 85, 390, 94, 10, '#123849e8', '#7cbba566');
        text(ctx, 'TRAVESSIA CONCLUÍDA', 95, 113, 23, C.amber);
        const score = Math.max(0, Math.floor(Number(stats?.score) || 0));
        const tokens = Math.max(0, Math.floor(Number(stats?.tokens) || 0));
        text(ctx, `${score.toLocaleString('pt-BR')} PONTOS   ·   ${tokens} PASSAPORTES`, 97, 148, 12, C.cream);
        ctx.restore();
      }
    }
  }

  function captions(ctx, t) {
    const scenes = [
      {start:0, end:5, n:'01', title:'EMBARQUE NO PARAGUAI', line:'Ponte vencida. Flávio corre para o próximo embarque.'},
      {start:5, end:8, n:'02', title:'AUTORIZADO A DECOLAR', line:'O avião sobe. As confusões ficam pequenininhas lá embaixo.'},
      {start:8, end:11, n:'03', title:'PRÓXIMO DESTINO: ESTADOS UNIDOS', line:'Uma conexão internacional, no universo fictício deste jogo.'},
      {start:11, end:15, n:'04', title:'POUSO NOS ESTADOS UNIDOS', line:'Trem de pouso baixado. Tem alguém esperando no desembarque.'},
      {start:15, end:18, n:'05', title:'UM ENCONTRO IMPROVÁVEL', line:'Trump recebe Flávio. Mais um capítulo desta sátira fictícia.'}
    ];
    const s = scenes.find(v => t < v.end) || scenes[scenes.length - 1];
    ctx.fillStyle = '#091b25f5'; ctx.fillRect(0, 566, W, 74);
    ctx.fillStyle = '#31595b'; ctx.fillRect(0, 566, W, 1);
    round(ctx, 31, 584, 38, 34, 5, '#1d3e47', '#4e7c76');
    text(ctx, s.n, 50, 602, 14, C.amber, 'center', 800);
    text(ctx, s.title, 88, 589, 10, C.teal);
    text(ctx, s.line, 88, 613, 16, C.cream);
    text(ctx, 'CENA FINAL', 1248, 588, 8, '#7a9d9e', 'right');
    text(ctx, `${Math.min(18, Math.floor(t)).toString().padStart(2,'0')} / 18s`, 1248, 611, 11, '#b1c8bd', 'right');
    ctx.fillStyle = '#1e3d45'; ctx.fillRect(0, 637, W, 3);
    ctx.fillStyle = C.amber; ctx.fillRect(0, 637, W * clamp(t / duration), 3);
    round(ctx, 1022, 20, 232, 26, 5, '#102d3bcb', '#6d9e8e77');
    text(ctx, 'CENA E DIÁLOGOS FICTÍCIOS', 1138, 34, 8, '#d3e2cc', 'center');
  }

  function draw(ctx, t, stats = {}) {
    const time = Number.isFinite(t) ? Math.max(0, t) : 0;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    if (time < 5) boarding(ctx, time);
    else if (time < 8) takeoff(ctx, time);
    else if (time < 11) journey(ctx, time);
    else arrival(ctx, time, stats);
    captions(ctx, Math.min(time, duration));
    // Brief cream-colored cuts make the scene changes intentional and readable.
    for (const cut of [8, 11]) {
      const alpha = Math.max(0, 1 - Math.abs(time - cut) / .16) * .65;
      if (alpha > 0) { ctx.fillStyle = `rgba(242,235,205,${alpha})`; ctx.fillRect(0, 0, W, 566); }
    }
    ctx.restore();
  }

  window.TravessiaEnding = { duration, draw, drawPlane };
})();
