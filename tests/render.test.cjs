'use strict';
// Runtime smoke coverage only; browser screenshots are used for visual QA.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function canvasStub() {
  const calls = [];
  let depth = 0;
  const ctx = { globalAlpha: 1, calls };
  const numeric = args => args.forEach(arg => { if (typeof arg === 'number') assert.ok(Number.isFinite(arg), 'canvas argument must be finite'); });
  for (const name of ['beginPath', 'closePath', 'clip', 'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'rect', 'roundRect', 'translate', 'rotate', 'scale', 'setLineDash']) {
    ctx[name] = (...args) => { numeric(args); calls.push({ name, args }); };
  }
  for (const name of ['arc', 'ellipse', 'arcTo']) {
    ctx[name] = (...args) => {
      numeric(args);
      if (name === 'arc') assert.ok(args[2] >= 0, 'arc radius');
      if (name === 'ellipse') assert.ok(args[2] >= 0 && args[3] >= 0, 'ellipse radii');
      if (name === 'arcTo') assert.ok(args[4] >= 0, 'arcTo radius');
      calls.push({ name, args });
    };
  }
  ctx.save = () => { depth++; };
  ctx.restore = () => { depth--; assert.ok(depth >= 0, 'unmatched restore'); };
  ctx.fillText = (...args) => { numeric(args); assert.equal(typeof args[0], 'string'); calls.push({ name: 'fillText', args }); };
  ctx.measureText = str => ({ width: String(str).length * 8 });
  for (const name of ['createLinearGradient', 'createRadialGradient']) {
    ctx[name] = (...args) => {
      numeric(args);
      return { addColorStop: (offset, color) => { assert.ok(offset >= 0 && offset <= 1); assert.equal(typeof color, 'string'); } };
    };
  }
  ctx.checkBalanced = () => assert.equal(depth, 0, 'save/restore must balance');
  return ctx;
}

function loadArt() {
  const window = {};
  const context = vm.createContext({ window, console });
  for (const name of ['scene.js', 'ending.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'dist', name), 'utf8'), context, { filename: name });
  }
  return window;
}

test('all gameplay character renderers accept their actual engine shapes', () => {
  const { TravessiaArt: art } = loadArt();
  const { Game } = require('../dist/engine.js');
  const game = new Game();
  const ctx = canvasStub();
  for (const time of [0, 1.5, 40, 65]) {
    art.drawBackground(ctx, 1280, 640, time * 305, time);
    for (const type of ['cone', 'barrier', 'police', 'janones', 'erika', 'cortez', 'bubble', 'mic']) {
      const o = game.addObstacle(type, 700);
      art.drawObstacle(ctx, o, time);
    }
    art.drawObstacle(ctx, { type: 'bubble', x: 700, y: 452, w: 162, h: 56, meme: true, text: 'VOTE EM MIM, BOLSONARO!', caption: 'DEBATE · BAND' }, time);
    for (const options of [{ running: true, grounded: true }, { running: true, grounded: false, dash: true }, { running: false, grounded: true, invincible: true }]) {
      art.drawPlayer(ctx, 220, 426, 52, 84, time, options);
    }
    art.drawBoss(ctx, 1050, 316, time, Math.max(0, 1 - time / 65));
    ctx.checkBalanced();
  }
  assert.ok(ctx.calls.length > 100);
});

test('cinematic draws every scene boundary without invalid geometry or missing APIs', () => {
  const { TravessiaEnding: ending } = loadArt();
  assert.equal(ending.duration, 18);
  const ctx = canvasStub();
  for (const time of [-1, 0, 1, 4.99, 5, 7.99, 8, 10.99, 11, 14.9, 15, 17.5, 18, 19, NaN]) {
    ending.draw(ctx, time, { score: 4500, tokens: 18 });
    ctx.checkBalanced();
  }
  const text = ctx.calls.filter(c => c.name === 'fillText').map(c => c.args[0]);
  assert.ok(text.includes('EMBARQUE NO PARAGUAI'));
  assert.ok(text.includes('AUTORIZADO A DECOLAR'));
  assert.ok(text.includes('PRÓXIMO DESTINO: ESTADOS UNIDOS'));
  assert.ok(text.includes('POUSO NOS ESTADOS UNIDOS'));
  assert.ok(text.includes('UM ENCONTRO IMPROVÁVEL'));
  assert.ok(text.includes('TRAVESSIA CONCLUÍDA'));
});
