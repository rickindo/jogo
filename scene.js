/* Canvas scenery and original cartoon characters for Operação Travessia. */
(() => {
  'use strict';

  const C = {
    ink: '#122b38', cream: '#fff0d2', skin: '#e9b18a',
    peach: '#ffb37f', teal: '#65d5c1', yellow: '#ffd36a'
  };

  function round(ctx, x, y, w, h, r, fill, stroke, lineWidth = 2) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }

  function ellipse(ctx, x, y, rx, ry, fill, stroke, lineWidth = 2) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }

  function line(ctx, points, color, width = 2) {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function poly(ctx, points, fill, stroke, width = 2) {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  }

  function label(ctx, text, x, y, color = C.cream, size = 10, weight = 800) {
    ctx.font = `${weight} ${size}px "Trebuchet MS", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function shadow(ctx, x, y, width) {
    ellipse(ctx, x, y, width, 5, 'rgba(5, 24, 32, .26)');
  }

  function drawBackground(ctx, w, h, progress = 0, time = 0) {
    ctx.save();
    ctx.scale(w / 1280, h / 640);

    const sky = ctx.createLinearGradient(0, 0, 0, 510);
    sky.addColorStop(0, '#113842');
    sky.addColorStop(.48, '#467b7c');
    sky.addColorStop(.79, '#edb07c');
    sky.addColorStop(1, '#d5c69d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1280, 640);

    // The amber sunset and its soft, broad halo.
    const halo = ctx.createRadialGradient(1020, 236, 4, 1020, 236, 250);
    halo.addColorStop(0, 'rgba(255, 198, 128, .5)');
    halo.addColorStop(1, 'rgba(255, 198, 128, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(750, 0, 530, 510);
    ellipse(ctx, 1020 - (progress * .008 % 80), 236, 60, 60, '#ffd69b');
    ctx.fillStyle = 'rgba(245, 203, 158, .16)';
    ctx.fillRect(0, 280, 1280, 2);
    ctx.fillRect(0, 300, 1280, 5);

    // Thin evening clouds, with a deliberately graphic screen-printed feel.
    for (let i = 0; i < 5; i++) {
      const x = ((i * 361 + 60 - progress * .035) % 1700 + 1700) % 1700 - 200;
      const y = 108 + (i % 3) * 48;
      ctx.fillStyle = 'rgba(233, 219, 184, .12)';
      round(ctx, x, y, 180 + (i % 2) * 90, 7, 4, ctx.fillStyle);
      round(ctx, x + 36, y + 13, 120, 3, 2, ctx.fillStyle);
    }

    // Distant banks: buildings move more slowly than the bridge.
    const cityScroll = progress * .08;
    for (let i = -1; i < 31; i++) {
      const x = i * 52 - cityScroll % 52;
      const height = 22 + ((i * i * 13 + 73) % 75 + 75) % 75;
      const bw = 26 + ((i * i * 7) % 21);
      ctx.fillStyle = '#376769';
      ctx.fillRect(x, 335 - height, bw, height + 18);
      if (i % 4 === 0) {
        ctx.fillRect(x + bw / 2 - 1, 326 - height, 2, 11);
      }
      ctx.fillStyle = 'rgba(255, 218, 147, .42)';
      for (let j = 0; j < 3; j++) {
        if ((i + j) % 3 !== 0) ctx.fillRect(x + 6 + j * 7, 344 - height, 3, 4);
      }
    }
    poly(ctx, [[0, 326], [125, 312], [270, 323], [400, 315], [560, 332],
      [790, 321], [950, 332], [1100, 315], [1280, 323], [1280, 370], [0, 370]], '#244e55');

    const river = ctx.createLinearGradient(0, 343, 0, 510);
    river.addColorStop(0, '#3c8b88');
    river.addColorStop(1, '#1a5b68');
    ctx.fillStyle = river;
    ctx.fillRect(0, 343, 1280, 167);
    for (let i = 0; i < 32; i++) {
      const x = ((i * 139 + time * (i % 2 ? 5 : -4) - progress * .13) % 1400 + 1400) % 1400 - 60;
      const y = 351 + (i * 31 % 133);
      line(ctx, [[x, y], [x + 17 + i % 5 * 13, y]], i % 3 ? 'rgba(130, 214, 192, .15)' : 'rgba(255, 214, 156, .28)', 2);
    }
    poly(ctx, [[966, 355], [1018, 355], [1062, 503], [906, 503]], 'rgba(255, 204, 135, .065)');

    // A distant green bank provides depth behind the central bridge arch.
    poly(ctx, [[0, 374], [47, 355], [110, 359], [178, 345], [259, 359],
      [326, 356], [400, 372], [400, 397], [0, 397]], '#224e50');
    poly(ctx, [[1040, 374], [1110, 354], [1170, 360], [1223, 344],
      [1280, 353], [1280, 395], [1040, 395]], '#244f50');

    // Repeating concrete arches and their evenly spaced vertical hangers.
    const archSpan = 1260;
    const archShift = (progress * .26) % archSpan;
    for (let k = -1; k < 2; k++) {
      const start = k * archSpan - archShift - 80;
      ctx.beginPath();
      ctx.moveTo(start, 438);
      ctx.bezierCurveTo(start + 310, -25, start + 920, -25, start + archSpan, 438);
      ctx.strokeStyle = '#25464b';
      ctx.lineWidth = 16;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(start, 434);
      ctx.bezierCurveTo(start + 310, -29, start + 920, -29, start + archSpan, 434);
      ctx.strokeStyle = '#b4b8a0';
      ctx.lineWidth = 9;
      ctx.stroke();
      for (let n = 1; n < 16; n++) {
        const t = n / 16;
        const u = 1 - t;
        const x = u * u * u * start + 3 * u * u * t * (start + 310) + 3 * u * t * t * (start + 920) + t * t * t * (start + archSpan);
        const y = u * u * u * 434 + 3 * u * u * t * -29 + 3 * u * t * t * -29 + t * t * t * 434;
        line(ctx, [[x, y + 7], [x, 425]], 'rgba(181, 196, 170, .56)', 2);
      }
    }

    // Lamps and railings scroll at the bridge's middle distance.
    const midScroll = progress * .55;
    for (let i = -1; i < 7; i++) {
      const x = i * 280 - midScroll % 280;
      line(ctx, [[x, 464], [x, 303], [x + 26, 291], [x + 40, 291]], '#426467', 5);
      const lamp = ctx.createRadialGradient(x + 37, 299, 0, x + 37, 299, 28);
      lamp.addColorStop(0, 'rgba(255, 227, 150, .18)');
      lamp.addColorStop(1, 'rgba(255, 227, 150, 0)');
      ctx.fillStyle = lamp;
      ctx.fillRect(x + 7, 269, 60, 60);
      round(ctx, x + 28, 288, 22, 6, 3, '#fff0bf');
    }
    ctx.fillStyle = '#34575c';
    ctx.fillRect(0, 416, 1280, 10);
    ctx.fillStyle = '#a6b7a3';
    ctx.fillRect(0, 416, 1280, 3);
    for (let i = -1; i < 39; i++) {
      const x = i * 36 - midScroll % 36;
      ctx.fillStyle = '#3b5c61';
      ctx.fillRect(x, 426, 5, 72);
      ctx.fillStyle = '#79988c';
      ctx.fillRect(x, 426, 1, 70);
    }
    ctx.fillStyle = '#2e5058';
    ctx.fillRect(0, 468, 1280, 5);

    // Safe, warm pavement defines the exact y=510 collision floor.
    const pavement = ctx.createLinearGradient(0, 490, 0, 640);
    pavement.addColorStop(0, '#b3b28e');
    pavement.addColorStop(.13, '#bfc3a3');
    pavement.addColorStop(.14, '#36575e');
    pavement.addColorStop(.19, '#1b363f');
    pavement.addColorStop(1, '#102c38');
    ctx.fillStyle = pavement;
    ctx.fillRect(0, 492, 1280, 148);
    ctx.fillStyle = '#e6d5a2';
    ctx.fillRect(0, 507, 1280, 3);
    ctx.fillStyle = 'rgba(17, 40, 45, .23)';
    for (let i = -1; i < 18; i++) {
      const x = i * 92 - progress % 92;
      ctx.fillRect(x, 492, 1, 17);
    }
    for (let i = -1; i < 12; i++) {
      const x = i * 160 - progress % 160;
      round(ctx, x, 568, 82, 5, 2, '#b4a66c');
      ctx.fillStyle = 'rgba(150, 187, 170, .06)';
      ctx.fillRect(x + 51, 530, 31, 1);
      ctx.fillRect(x + 106, 606, 43, 1);
    }
    ctx.fillStyle = '#24434b';
    ctx.fillRect(0, 625, 1280, 15);
    ctx.fillStyle = '#456267';
    ctx.fillRect(0, 625, 1280, 2);
    const vignette = ctx.createLinearGradient(0, 0, 1280, 0);
    vignette.addColorStop(0, 'rgba(6, 28, 35, .12)');
    vignette.addColorStop(.35, 'rgba(6, 28, 35, 0)');
    vignette.addColorStop(1, 'rgba(6, 28, 35, .12)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1280, 640);
    ctx.restore();
  }

  function drawPlayer(ctx, x, y, w, h, time = 0, options = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(w / 52, h / 84);
    const run = options.running === false ? Math.sin(time * 2) * .12 : Math.sin(time * 16);
    const bob = options.grounded === false ? 0 : Math.abs(run) * 1.5;
    if (options.invincible && Math.floor(time * 14) % 2 === 0) ctx.globalAlpha = .52;
    if (options.dash) {
      ctx.shadowColor = '#8cffe2';
      ctx.shadowBlur = 18;
      poly(ctx, [[16, 28], [-65, 37], [-24, 46], [-80, 61], [20, 64]], 'rgba(124, 255, 214, .28)');
      line(ctx, [[-40, 34], [-12, 34]], '#bdffe3', 2);
      line(ctx, [[-60, 55], [-27, 55]], '#bdffe3', 2);
      ctx.shadowBlur = 0;
    }
    if (options.grounded !== false) shadow(ctx, 26, 83, 23);
    ctx.translate(0, -bob);
    // Far arm, legs, then near arm: silhouettes stay readable at game scale.
    line(ctx, [[20, 42], [8 - run * 4, 53], [7 - run * 8, 62]], '#176d5a', 10);
    ellipse(ctx, 7 - run * 8, 62, 4, 4, C.skin, C.ink, 1.5);
    line(ctx, [[24, 62], [20 + run * 7, 72], [16 - run * 7, 80]], '#1c3448', 9);
    line(ctx, [[32, 62], [32 - run * 7, 72], [37 + run * 7, 80]], '#29465b', 9);
    round(ctx, 9 - run * 7, 78, 16, 6, 3, '#071d29', '#061722', 1);
    round(ctx, 29 + run * 7, 78, 17, 6, 3, '#071d29', '#061722', 1);
    round(ctx, 16, 35, 25, 29, 7, '#248b63', C.ink, 2);
    poly(ctx, [[24, 36], [33, 36], [35, 60], [24, 60]], '#f6d765');
    line(ctx, [[24, 38], [24, 61]], '#15594b', 1.5);
    poly(ctx, [[17, 36], [22, 34], [24, 45], [19, 42]], '#34a174');
    round(ctx, 26, 29, 11, 12, 3, C.skin, C.ink, 1.3);
    // An oversized head, strong eyebrows and the dark swept hair.
    ellipse(ctx, 30, 20, 15, 17, C.skin, C.ink, 2);
    ellipse(ctx, 16, 22, 3.5, 5, '#dca17c', C.ink, 1.3);
    poly(ctx, [[16, 18], [15, 10], [19, 4], [30, 1], [42, 4], [46, 10],
      [44, 16], [38, 11], [29, 10], [20, 14], [20, 22]], '#27302e', C.ink, 1.5);
    line(ctx, [[22, 7], [31, 5], [40, 8]], '#525449', 1.4);
    line(ctx, [[25, 17], [30, 16]], '#272c2a', 2.7);
    line(ctx, [[36, 16], [41, 18]], '#272c2a', 2.7);
    ellipse(ctx, 28, 20, 1.5, 1.7, C.ink);
    ellipse(ctx, 39, 21, 1.5, 1.7, C.ink);
    poly(ctx, [[35, 21], [39, 27], [34, 28]], '#d99571');
    line(ctx, [[29, 31], [35, 32], [39, 30]], '#824e40', 1.4);
    line(ctx, [[22, 27], [25, 28]], '#d58b6d', 1.3);
    // Cross-body carry-on bag, with brass details.
    line(ctx, [[19, 38], [39, 58]], '#7f5b3d', 3);
    const handX = 42 + run * 3;
    const handY = 54 - run * 4;
    line(ctx, [[35, 42], [44, 47], [handX, handY]], '#258d65', 9);
    ellipse(ctx, handX, handY, 4.3, 4.5, C.skin, C.ink, 1.4);
    round(ctx, handX - 2, handY + 4, 10, 6, 2, null, '#513c2f', 2);
    round(ctx, handX - 6, handY + 8, 20, 18, 3, '#a97444', C.ink, 2);
    line(ctx, [[handX + 1, handY + 8], [handX + 1, handY + 26]], '#d29a5d', 2);
    round(ctx, handX + 6, handY + 14, 4, 4, 1, '#f2d283');
    ctx.restore();
  }

  function drawPolice(ctx, time) {
    const sway = Math.sin(time * 4) * 1.5;
    shadow(ctx, 26, 83, 23);
    line(ctx, [[19, 60], [17, 79]], '#20384b', 10);
    line(ctx, [[34, 60], [38, 79]], '#20384b', 10);
    round(ctx, 8, 77, 16, 7, 3, '#10222e');
    round(ctx, 31, 77, 16, 7, 3, '#10222e');
    round(ctx, 13, 32, 30, 33, 6, '#254a60', C.ink, 2);
    ctx.fillStyle = '#163446';
    ctx.fillRect(12, 57, 32, 5);
    round(ctx, 25, 57, 7, 5, 1, '#d8bc69');
    line(ctx, [[19, 34], [19, 54]], '#668b99', 2);
    line(ctx, [[38, 34], [38, 54]], '#668b99', 2);
    poly(ctx, [[31, 39], [37, 39], [37, 44], [34, 47], [31, 44]], '#f2d778');
    label(ctx, 'POLÍCIA', 28, 51, '#d9e9e1', 5.6);
    line(ctx, [[37, 39], [48, 46], [49, 32 + sway]], '#254a60', 9);
    ellipse(ctx, 49, 29 + sway, 5, 7, '#e8bc97', C.ink, 1.5);
    line(ctx, [[15, 41], [8, 55]], '#254a60', 9);
    ellipse(ctx, 7, 57, 4, 5, '#e8bc97', C.ink, 1.5);
    round(ctx, 22, 25, 11, 13, 3, '#e8bc97', C.ink, 1.3);
    ellipse(ctx, 27, 19, 14, 16, '#e8bc97', C.ink, 2);
    line(ctx, [[16, 19], [37, 19]], '#142936', 4.5);
    line(ctx, [[20, 20], [23, 21]], '#53747a', 1);
    line(ctx, [[31, 21], [34, 20]], '#53747a', 1);
    poly(ctx, [[29, 22], [33, 27], [28, 27]], '#cc936d');
    line(ctx, [[22, 29], [30, 30]], '#845e4d', 1.3);
    round(ctx, 12, 3, 30, 13, 5, '#2a5268', C.ink, 2);
    round(ctx, 18, 13, 28, 5, 2, '#102f40', C.ink, 1);
    poly(ctx, [[24, 6], [30, 6], [30, 11], [27, 13], [24, 11]], '#f3d578');
  }

  function drawJanones(ctx, time) {
    const bob = Math.sin(time * 5) * 1.5;
    shadow(ctx, 29, 87, 25);
    line(ctx, [[22, 64], [19, 82]], '#273e51', 10);
    line(ctx, [[36, 64], [39, 82]], '#273e51', 10);
    round(ctx, 10, 81, 16, 6, 2, '#102530');
    round(ctx, 33, 81, 17, 6, 2, '#102530');
    round(ctx, 14, 37, 32, 31, 6, '#3e75a1', C.ink, 2);
    poly(ctx, [[24, 38], [34, 38], [33, 64], [24, 64]], '#e6eddf');
    line(ctx, [[16, 42], [7, 52]], '#3e75a1', 10);
    ellipse(ctx, 7, 55, 4, 5, C.skin, C.ink, 1.5);
    line(ctx, [[39, 43], [47, 49], [51, 33 + bob]], '#3e75a1', 9);
    ellipse(ctx, 51, 32 + bob, 5, 5, C.skin, C.ink, 1.5);
    round(ctx, 45, 17 + bob, 12, 20, 3, '#102b39', '#83d5dc', 1.5);
    round(ctx, 47, 20 + bob, 8, 12, 1, '#5ccac2');
    ellipse(ctx, 51, 34 + bob, 1, 1, '#b2e7d7');
    round(ctx, 24, 29, 11, 14, 3, C.skin, C.ink, 1.2);
    ellipse(ctx, 29, 20, 15.5, 18, C.skin, C.ink, 2);
    poly(ctx, [[14, 17], [14, 9], [20, 2], [32, 1], [42, 7], [44, 17],
      [39, 13], [30, 10], [20, 13], [18, 20]], '#30312f', C.ink, 1.5);
    poly(ctx, [[15, 24], [20, 26], [24, 30], [35, 29], [42, 23], [42, 30],
      [35, 39], [23, 38], [16, 31]], '#35352f', C.ink, 1.5);
    line(ctx, [[20, 18], [26, 17]], '#30312f', 2.5);
    line(ctx, [[33, 17], [39, 18]], '#30312f', 2.5);
    ellipse(ctx, 24, 21, 1.5, 1.7, C.ink);
    ellipse(ctx, 37, 21, 1.5, 1.7, C.ink);
    poly(ctx, [[31, 21], [35, 27], [30, 27]], '#cf8e6a');
    line(ctx, [[26, 31], [34, 31]], '#e6be98', 1.5);
    round(ctx, 3, 65, 52, 12, 4, '#153549', '#6ca6b5', 1);
    label(ctx, 'JANONES', 29, 71, '#e9f0da', 7.5);
    ellipse(ctx, 61, 17 + bob, 3.5, 3.5, '#ff7668');
    ctx.strokeStyle = 'rgba(255, 134, 114, .45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(60, 18 + bob, 8, -.8, .8);
    ctx.stroke();
  }

  function drawErika(ctx, time) {
    const wave = Math.sin(time * 4) * 1.5;
    const skin = '#aa6b4e';
    shadow(ctx, 27, 91, 24);
    line(ctx, [[20, 69], [17, 86]], '#39324f', 10);
    line(ctx, [[34, 69], [38, 86]], '#39324f', 10);
    round(ctx, 9, 86, 15, 5, 2, '#172a35');
    round(ctx, 32, 86, 16, 5, 2, '#172a35');
    // Long, gently waved hair frames the face and falls behind the blazer.
    ctx.beginPath();
    ctx.moveTo(13, 44);
    ctx.bezierCurveTo(6, 28, 10, 3, 27, 2);
    ctx.bezierCurveTo(44, -1, 48, 17, 44, 31);
    ctx.bezierCurveTo(42, 43, 50, 49, 43, 60);
    ctx.lineTo(11, 59);
    ctx.bezierCurveTo(5, 52, 11, 48, 13, 44);
    ctx.fillStyle = '#252a2d'; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.7; ctx.stroke();
    round(ctx, 13, 39, 29, 34, 7, '#e8ddca', C.ink, 2);
    poly(ctx, [[22, 40], [32, 40], [33, 70], [23, 70]], '#806b9c');
    poly(ctx, [[15, 40], [21, 37], [25, 52], [18, 47]], '#fff0d7');
    poly(ctx, [[38, 40], [33, 37], [30, 52], [37, 47]], '#fff0d7');
    ellipse(ctx, 35, 59, 1.2, 1.2, '#b49a67');
    line(ctx, [[15, 45], [7, 50], [7, 36]], '#e8ddca', 9);
    ellipse(ctx, 7, 34, 4, 5, skin, C.ink, 1.3);
    round(ctx, 4, 23, 6, 17, 2, '#213c4b', C.ink, 1.2);
    ellipse(ctx, 7, 22, 5, 6, '#78908f', C.ink, 1.5);
    line(ctx, [[5, 21], [9, 21]], '#d2d6be', 1);
    line(ctx, [[38, 45], [47, 51], [49, 36 + wave]], '#e8ddca', 9);
    ellipse(ctx, 49, 31 + wave, 4.5, 7, skin, C.ink, 1.4);
    line(ctx, [[48, 29 + wave], [48, 25 + wave]], '#d89b77', 1);
    round(ctx, 22, 31, 10, 14, 3, skin, C.ink, 1.2);
    ellipse(ctx, 27, 22, 13, 17, skin, C.ink, 1.7);
    // A side part and soft hair highlights give this silhouette its own shape.
    ctx.beginPath();
    ctx.moveTo(14, 27); ctx.bezierCurveTo(11, 10, 18, 4, 28, 5);
    ctx.bezierCurveTo(34, 4, 42, 12, 40, 28);
    ctx.lineTo(36, 17); ctx.lineTo(30, 10);
    ctx.bezierCurveTo(27, 18, 20, 18, 17, 21); ctx.lineTo(17, 30);
    ctx.closePath(); ctx.fillStyle = '#272b2f'; ctx.fill();
    line(ctx, [[16, 12], [14, 22], [16, 39]], '#434143', 1.1);
    line(ctx, [[37, 13], [41, 28], [39, 42]], '#494445', 1.1);
    line(ctx, [[20, 21], [24, 20]], '#332c30', 1.8);
    line(ctx, [[30, 20], [35, 21]], '#332c30', 1.8);
    ellipse(ctx, 23, 24, 1.3, 1.5, C.ink);
    ellipse(ctx, 33, 24, 1.3, 1.5, C.ink);
    poly(ctx, [[28, 24], [31, 30], [27, 30]], '#91563f');
    line(ctx, [[24, 33], [28, 34], [32, 32]], '#683c3b', 1.4);
    ellipse(ctx, 14.5, 30, 1.4, 2.4, '#f1d291');
    ellipse(ctx, 39.5, 30, 1.4, 2.4, '#f1d291');
    round(ctx, 4, 70, 46, 12, 4, '#514468', '#a99bb9', 1);
    label(ctx, 'ERIKA', 27, 76, '#fff0d5', 8);
  }

  function drawCortez(ctx, time) {
    const sway = Math.sin(time * 4.5) * 1.3;
    const skin = '#e6b08e';
    shadow(ctx, 28, 87, 25);
    line(ctx, [[20, 64], [16, 82]], '#2a3f50', 10);
    line(ctx, [[35, 64], [39, 82]], '#2a3f50', 10);
    round(ctx, 8, 81, 16, 6, 3, '#192d39');
    round(ctx, 32, 81, 17, 6, 3, '#192d39');
    round(ctx, 12, 36, 31, 33, 6, '#bc5955', C.ink, 2);
    poly(ctx, [[23, 38], [33, 38], [35, 65], [22, 65]], '#eeecdb');
    poly(ctx, [[15, 38], [20, 35], [24, 49], [17, 45]], '#d47469');
    poly(ctx, [[39, 38], [34, 35], [31, 49], [38, 45]], '#d47469');
    line(ctx, [[14, 42], [7, 56]], '#bc5955', 9);
    ellipse(ctx, 7, 59, 4, 5, skin, C.ink, 1.4);
    line(ctx, [[39, 43], [48, 48], [49, 34 + sway]], '#bc5955', 9);
    ellipse(ctx, 49, 33 + sway, 4, 4, skin, C.ink, 1.2);
    // The megaphone is a playful campaign prop, with no attributed quote.
    round(ctx, 45, 31 + sway, 5, 12, 1, '#233d49', C.ink, 1);
    poly(ctx, [[34, 22 + sway], [48, 17 + sway], [48, 36 + sway], [34, 31 + sway]], '#efdfb7', C.ink, 1.7);
    round(ctx, 29, 22 + sway, 8, 10, 3, '#c96353', C.ink, 1.4);
    ellipse(ctx, 48, 26.5 + sway, 3, 9.5, '#d48062', C.ink, 1.5);
    ellipse(ctx, 48, 26.5 + sway, 1.3, 5.6, '#533d3f');
    line(ctx, [[52, 18 + sway], [55, 15 + sway]], '#efca8a', 1.4);
    line(ctx, [[53, 27 + sway], [56, 27 + sway]], '#efca8a', 1.4);
    round(ctx, 22, 28, 11, 14, 3, skin, C.ink, 1.2);
    ellipse(ctx, 27, 20, 14, 17, skin, C.ink, 1.8);
    poly(ctx, [[13, 19], [12, 10], [17, 4], [26, 1], [36, 3], [42, 10],
      [40, 20], [36, 13], [28, 10], [19, 13], [17, 22]], '#30302e', C.ink, 1.5);
    line(ctx, [[18, 7], [26, 5], [34, 7]], '#4c4740', 1.3);
    poly(ctx, [[14, 24], [19, 27], [24, 29], [32, 29], [39, 24],
      [38, 31], [31, 37], [23, 37], [17, 32]], '#4b3b32', C.ink, 1.2);
    line(ctx, [[18, 18], [23, 17]], '#39332e', 2);
    line(ctx, [[31, 17], [36, 18]], '#39332e', 2);
    ellipse(ctx, 22, 21, 1.4, 1.6, C.ink);
    ellipse(ctx, 34, 21, 1.4, 1.6, C.ink);
    poly(ctx, [[28, 21], [32, 27], [27, 27]], '#cb8e6d');
    line(ctx, [[24, 31], [31, 31]], '#edc09b', 1.2);
    round(ctx, 4, 66, 48, 12, 4, '#803f42', '#d48b7f', 1);
    label(ctx, 'CORTEZ', 28, 72, '#fff0d5', 7.8);
  }

  function drawBubble(ctx, width, height, obstacle) {
    const meme = !!obstacle.meme;
    const bodyHeight = Math.max(18, height - 8);
    const border = meme ? '#e68b45' : '#ba5e48';
    const textColor = meme ? '#713d2a' : '#a43e36';
    ctx.shadowColor = 'rgba(5, 24, 32, .25)'; ctx.shadowBlur = 10;
    round(ctx, 0, 0, width, bodyHeight, 9, '#fff0ce', border, meme ? 2.6 : 2);
    ctx.shadowBlur = 0;
    poly(ctx, [[width * .19, bodyHeight - 2], [width * .15, height],
      [width * .32, bodyHeight - 1]], '#fff0ce', border, 2);
    line(ctx, [[width * .19 + 1, bodyHeight - 1], [width * .31, bodyHeight - 1]], '#fff0ce', 3);

    const text = String(obstacle.text || 'AO VIVO!');
    const innerWidth = Math.max(20, width - 16);
    let fontSize = meme ? Math.min(14, height * .26) : Math.min(11, height * .25);
    let lines = [text];
    const setFont = () => { ctx.font = `900 ${fontSize}px "Trebuchet MS", system-ui, sans-serif`; };
    setFont();
    if (ctx.measureText(text).width > innerWidth && text.includes(' ')) {
      const words = text.split(/\s+/);
      let bestWidth = Infinity;
      for (let split = 1; split < words.length; split++) {
        const trial = [words.slice(0, split).join(' '), words.slice(split).join(' ')];
        const widest = Math.max(...trial.map(value => ctx.measureText(value).width));
        if (widest < bestWidth) { bestWidth = widest; lines = trial; }
      }
    }
    while (fontSize > 7 && lines.some(value => ctx.measureText(value).width > innerWidth)) {
      fontSize -= .5; setFont();
    }
    const caption = obstacle.caption ? String(obstacle.caption) : '';
    const tagHeight = meme && height >= 48 ? 10 : 0;
    if (tagHeight) {
      round(ctx, width / 2 - 31, -4, 62, 11, 4, '#d97838', '#edb16c', 1);
      label(ctx, 'MEME 2026', width / 2, 1.5, '#fff1d3', 6.8, 900);
    }
    const lineHeight = fontSize + 2;
    const topPadding = tagHeight ? 9 : 2;
    const captionSpace = caption ? 10 : 0;
    const centerY = topPadding + (bodyHeight - topPadding - captionSpace) / 2;
    lines.forEach((value, index) => {
      label(ctx, value, width / 2, centerY + (index - (lines.length - 1) / 2) * lineHeight, textColor, fontSize, 900);
    });
    if (caption) {
      let captionSize = 7.5;
      ctx.font = `700 ${captionSize}px "Trebuchet MS", system-ui, sans-serif`;
      while (captionSize > 5 && ctx.measureText(caption).width > innerWidth) {
        captionSize -= .5;
        ctx.font = `700 ${captionSize}px "Trebuchet MS", system-ui, sans-serif`;
      }
      label(ctx, caption, width / 2, bodyHeight - 6, '#9b704f', captionSize, 700);
    }
  }

  function drawObstacle(ctx, obstacle, time = 0) {
    const {type, x, y} = obstacle;
    const sizes = {cone: [42, 54], barrier: [84, 66], police: [52, 84], janones: [58, 88], erika: [54, 92], cortez: [56, 88], bubble: [65, 42], mic: [34, 60], stamp: [54, 44]};
    const normal = sizes[type] || sizes.cone;
    const width = obstacle.w || normal[0];
    const height = obstacle.h || normal[1];
    ctx.save();
    ctx.translate(x, y);
    // Speech bubbles use their real dimensions so typography never stretches.
    if (type !== 'bubble') ctx.scale(width / normal[0], height / normal[1]);
    switch (type) {
      case 'police': drawPolice(ctx, time); break;
      case 'janones': drawJanones(ctx, time); break;
      case 'erika': drawErika(ctx, time); break;
      case 'cortez': drawCortez(ctx, time); break;
      case 'barrier':
        shadow(ctx, 42, 65, 43);
        poly(ctx, [[10, 24], [19, 24], [14, 65], [4, 65]], '#a2b2a5', C.ink, 2);
        poly(ctx, [[65, 24], [74, 24], [80, 65], [70, 65]], '#a2b2a5', C.ink, 2);
        round(ctx, 0, 7, 84, 37, 4, '#ffd574', C.ink, 2.5);
        ctx.save();
        ctx.beginPath(); ctx.rect(3, 10, 78, 31); ctx.clip();
        for (let i = -1; i < 5; i++) poly(ctx, [[i * 26, 9], [i * 26 + 13, 9], [i * 26 + 36, 42], [i * 26 + 23, 42]], '#28424a');
        ctx.restore();
        round(ctx, 19, 18, 46, 14, 3, '#e6e0bd', C.ink, 1);
        label(ctx, 'PARE', 42, 25, '#183541', 9);
        round(ctx, 9, 0, 11, 8, 3, '#ffad64', C.ink, 1.5);
        round(ctx, 65, 0, 11, 8, 3, '#ffad64', C.ink, 1.5);
        if (Math.floor(time * 3) % 2) {
          ellipse(ctx, 14.5, 3, 2.5, 2, '#ffedac');
          ellipse(ctx, 70.5, 3, 2.5, 2, '#ffedac');
        }
        break;
      case 'bubble':
        drawBubble(ctx, width, height, obstacle);
        break;
      case 'mic':
        ctx.rotate(Math.sin(time * 5) * .08);
        round(ctx, 14, 20, 9, 35, 3, '#243d4c', '#0d2632', 2);
        round(ctx, 8, 6, 21, 26, 10, '#647f84', '#152e39', 2);
        line(ctx, [[12, 13], [25, 13]], '#b1c4ba', 1.3);
        line(ctx, [[11, 18], [25, 18]], '#a2b9b2', 1.3);
        line(ctx, [[12, 23], [24, 23]], '#a2b9b2', 1.3);
        round(ctx, 9, 31, 20, 11, 2, '#e16f56', C.ink, 1.5);
        label(ctx, 'TV', 19, 36.5, '#fff2d3', 7);
        break;
      case 'stamp':
        round(ctx, 19, 1, 16, 23, 6, '#e58761', C.ink, 2);
        round(ctx, 13, 20, 28, 12, 4, '#c85b48', C.ink, 2);
        round(ctx, 1, 30, 52, 12, 3, '#223c48', C.ink, 2);
        line(ctx, [[5, 36], [49, 36]], '#ffcc89', 2);
        break;
      default:
        shadow(ctx, 21, 53, 22);
        round(ctx, 1, 46, 40, 8, 3, '#cb6541', C.ink, 2);
        poly(ctx, [[18, 2], [25, 2], [36, 47], [7, 47]], '#f59355', C.ink, 2);
        poly(ctx, [[15, 15], [28, 15], [31, 25], [12, 25]], '#fff1cf');
        poly(ctx, [[10, 34], [33, 34], [35, 42], [8, 42]], '#fff1cf');
        line(ctx, [[20, 7], [14, 42]], 'rgba(255, 211, 139, .6)', 2);
    }
    ctx.restore();
  }

  function drawBoss(ctx, x, y, time = 0, phase = 0) {
    ctx.save();
    ctx.translate(x, y + Math.sin(time * 2.5) * 2);
    shadow(ctx, 70, 160, 68);
    // A travelling debate podium: the encounter is about dodging speeches.
    round(ctx, 7, 131, 126, 22, 5, '#31505d', C.ink, 2);
    ellipse(ctx, 31, 153, 9, 8, '#132d3b', '#729293', 2);
    ellipse(ctx, 111, 153, 9, 8, '#132d3b', '#729293', 2);
    round(ctx, 32, 61, 74, 69, 15, '#ca594b', C.ink, 2.5);
    poly(ctx, [[57, 67], [70, 76], [83, 67], [79, 114], [59, 114]], '#f37256');
    line(ctx, [[36, 77], [18, 94], [14, 81 + Math.sin(time * 6) * 3]], '#c85347', 18);
    ellipse(ctx, 13, 77 + Math.sin(time * 6) * 3, 9, 11, C.skin, C.ink, 2);
    line(ctx, [[102, 77], [121, 90], [126, 74]], '#c85347', 18);
    ellipse(ctx, 126, 69, 9, 11, C.skin, C.ink, 2);
    line(ctx, [[126, 70], [124, 63]], '#ba7f5d', 1.2);
    round(ctx, 59, 49, 23, 24, 6, C.skin, C.ink, 1.8);
    ellipse(ctx, 69, 35, 29, 33, '#e9b48c', C.ink, 2.5);
    ellipse(ctx, 40, 36, 6, 9, '#e5aa81', C.ink, 1.5);
    ellipse(ctx, 97, 36, 6, 9, '#e5aa81', C.ink, 1.5);
    // White side hair and generous beard make the caricature clear at a glance.
    poly(ctx, [[42, 37], [38, 22], [43, 9], [54, 3], [69, 2], [83, 5],
      [94, 14], [99, 29], [95, 40], [89, 25], [85, 16], [73, 12],
      [59, 13], [49, 21], [47, 37]], '#e9e2cb', C.ink, 1.5);
    poly(ctx, [[44, 38], [48, 43], [55, 45], [61, 42], [69, 44], [77, 42],
      [84, 46], [94, 38], [92, 54], [83, 65], [68, 71], [54, 64],
      [46, 54]], '#f3ebd9', C.ink, 1.8);
    line(ctx, [[52, 28], [61, 26]], '#a5a195', 3.5);
    line(ctx, [[76, 26], [86, 29]], '#a5a195', 3.5);
    ellipse(ctx, 58, 32, 2, 2.1, C.ink);
    ellipse(ctx, 81, 32, 2, 2.1, C.ink);
    poly(ctx, [[69, 32], [76, 43], [65, 44]], '#d69972');
    line(ctx, [[59, 52], [69, 55], [79, 52]], '#ad7f68', 1.7);
    line(ctx, [[53, 53], [57, 59]], '#d0c6b3', 1.3);
    line(ctx, [[82, 53], [79, 60]], '#d0c6b3', 1.3);
    line(ctx, [[58, 91], [55, 80]], '#173844', 3);
    line(ctx, [[87, 91], [91, 80]], '#173844', 3);
    ellipse(ctx, 54, 78, 4, 6, '#263e47', '#8ca2a0', 1.3);
    ellipse(ctx, 92, 78, 4, 6, '#263e47', '#8ca2a0', 1.3);
    round(ctx, 24, 92, 93, 46, 5, '#1d4854', '#5a827f', 2);
    poly(ctx, [[17, 88], [123, 88], [117, 100], [24, 100]], '#4e7474', C.ink, 2);
    round(ctx, 40, 104, 61, 22, 4, '#d05e4e', '#e99170', 1);
    label(ctx, 'LULA', 70.5, 115, '#fff0cf', 15, 900);
    // Subtle ready lamps communicate the active encounter without a HUD.
    const active = phase === 'active' || phase === 1 || phase === 'boss';
    ellipse(ctx, 32, 112, 3, 3, active || Math.floor(time * 3) % 2 ? '#ffd379' : '#648b83');
    ellipse(ctx, 109, 112, 3, 3, '#ffd379');
    ctx.restore();
  }

  window.TravessiaArt = {drawBackground, drawPlayer, drawObstacle, drawBoss};
})();
