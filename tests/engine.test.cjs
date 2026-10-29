'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { Game, GROUND, LENGTH, MEMES, overlaps } = require('../dist/engine.js');

function advance(game, seconds, fps = 60, input = {}) {
  for (let i = 0; i < Math.round(seconds * fps); i++) game.tick(1 / fps, input);
}
function quietGame(events = []) {
  const game = new Game((name, value) => events.push({ name, value }));
  game.start();
  game.spawnIn = game.tokenIn = 1000;
  return game;
}
function play(fps) {
  const events = [];
  const seenTypes = new Set();
  const seenMemes = new Set();
  const game = new Game((name, value) => events.push({ name, value }));
  game.start();
  let frames = 0;
  while (game.phase === 'running' && frames++ < fps * 90) {
    const p = game.player;
    const nearest = game.obstacles.filter(o => o.x + o.w > p.x + 10).sort((a, b) => a.x - b.x)[0];
    if (nearest) {
      const gap = nearest.x - (p.x + p.w);
      const low = nearest.y + nearest.h > GROUND - 100;
      if (low && gap > -20 && gap < 80 && p.grounded) game.jump();
      if (gap < 25 && gap > -nearest.w && overlaps(p, nearest, 0) && p.cooldown <= 0) game.dash();
    }
    game.tick(1 / fps);
    for (const obstacle of game.obstacles) {
      seenTypes.add(obstacle.type);
      if (obstacle.meme) seenMemes.add(obstacle.text);
    }
  }
  return { game, events, frames, seenTypes, seenMemes };
}

test('starts from menu and restart resets the complete session', () => {
  const game = new Game();
  assert.equal(game.phase, 'menu');
  assert.equal(game.jump(), false);
  assert.equal(game.dash(), false);
  game.start();
  game.tick(0.1, { right: true });
  game.tokens = 4;
  game.lives = 1;
  game.addObstacle('police');
  game.start();
  assert.equal(game.phase, 'running');
  assert.equal(game.distance, 0);
  assert.equal(game.score, 0);
  assert.equal(game.lives, 4);
  assert.equal(game.tokens, 0);
  assert.equal(game.obstacles.length, 0);
  assert.equal(game.player.x, 220);
  assert.equal(game.player.y + game.player.h, GROUND);
});

test('double jump limits airborne jumps and landing restores them', () => {
  const game = quietGame();
  assert.equal(game.jump(), true);
  advance(game, 0.2);
  const firstY = game.player.y;
  assert.equal(game.jump(), true);
  assert.equal(game.jump(), false);
  advance(game, 0.15);
  assert.ok(game.player.y < firstY);
  advance(game, 1.6);
  assert.equal(game.player.grounded, true);
  assert.equal(game.player.y + game.player.h, GROUND);
  assert.equal(game.player.jumps, 0);
  assert.equal(game.jump(), true);
});

test('dash protects against collisions and obeys its cooldown', () => {
  const game = quietGame();
  game.addObstacle('police', game.player.x + 8);
  assert.equal(game.dash(), true);
  game.tick(1 / 60);
  assert.equal(game.lives, 4);
  assert.equal(game.dash(), false);
  advance(game, 3.1);
  assert.equal(game.dash(), true);
});

test('pause freezes every engine clock and ignores game inputs', () => {
  const game = quietGame();
  game.jump();
  game.dash();
  advance(game, 0.2);
  game.pause();
  const before = JSON.stringify(game);
  advance(game, 3, 60, { right: true });
  assert.equal(game.jump(), false);
  assert.equal(game.dash(), false);
  assert.equal(JSON.stringify(game), before);
  game.pause();
  assert.equal(game.phase, 'running');
  game.tick(0.1);
  assert.ok(game.time > 0.2);
});

test('collisions deal one hit per invulnerability period and end the game', () => {
  const events = [];
  const game = quietGame(events);
  for (let n = 0; n < 4; n++) {
    game.player.invincible = 0;
    game.obstacles = [];
    game.addObstacle('police', game.player.x + 10);
    game.tick(1 / 60);
    assert.equal(game.lives, 3 - n);
    if (n < 3) {
      game.tick(1 / 60);
      assert.equal(game.lives, 3 - n);
    }
  }
  assert.equal(game.phase, 'lost');
  assert.equal(events.filter(e => e.name === 'lost').length, 1);
  const frozen = game.time;
  game.tick(0.1);
  assert.equal(game.time, frozen);
});

test('pickups score once and every ninth token heals within the life cap', () => {
  const events = [];
  const game = quietGame(events);
  game.tokens = 8;
  game.lives = 3;
  game.pickups.push({ x: game.player.x + 10, y: game.player.y + 30, w: 28, h: 28 });
  game.tick(1 / 60);
  assert.equal(game.tokens, 9);
  assert.equal(game.lives, 4);
  assert.equal(game.pickups.length, 0);
  assert.equal(game.bonus, 100);
  assert.ok(events.some(e => e.name === 'heal'));
  game.tick(1 / 60);
  assert.equal(game.bonus, 100);
});

test('stage transitions enter the boss and victory awards remaining lives once', () => {
  const events = [];
  const game = quietGame(events);
  game.distance = LENGTH * 0.34 - 1;
  game.tick(1 / 60);
  assert.equal(game.stage, 1);
  game.distance = LENGTH * 0.7 - 1;
  game.tick(1 / 60);
  assert.equal(game.stage, 2);
  assert.ok(game.bossRemaining <= 1 && game.bossRemaining > 0.9);
  advance(game, 2.2);
  assert.equal(game.obstacles[0].type, 'bubble');
  game.distance = LENGTH - 1;
  game.tick(1 / 60);
  assert.equal(game.phase, 'won');
  assert.equal(game.progress, 1);
  assert.equal(game.bossRemaining, 0);
  assert.equal(game.score, 3000);
  const score = game.score;
  game.tick(0.1);
  assert.equal(game.score, score);
  assert.deepEqual(events.filter(e => e.name === 'stage').map(e => e.value), [1, 2]);
  assert.equal(events.filter(e => e.name === 'won').length, 1);
});

test('horizontal movement stays within bridge bounds and invalid dt is harmless', () => {
  const game = quietGame();
  advance(game, 3, 60, { left: true });
  assert.equal(game.player.x, 100);
  advance(game, 4, 60, { right: true });
  assert.equal(game.player.x, 700);
  const before = game.time;
  for (const dt of [NaN, Infinity, 0, -2]) game.tick(dt);
  assert.equal(game.time, before);
});

test('30/60/120 FPS produce the same deterministic movement and distance', () => {
  const results = [30, 60, 120].map(fps => {
    const game = quietGame();
    game.jump();
    advance(game, 5, fps);
    return [game.time, game.distance, game.player.y, game.lives];
  });
  for (let i = 1; i < results.length; i++) {
    results[0].forEach((value, j) => assert.ok(Math.abs(value - results[i][j]) < 1e-7));
  }
});

test('the expanded second-stage cast emits its names and creates distinct cartoon speech', () => {
  const events = [];
  const game = quietGame(events);
  game.distance = LENGTH * 0.4;
  game.stage = 1;
  game.spawnCount = 7;
  for (let i = 0; i < 7; i++) game.spawn();
  assert.ok(events.some(e => e.name === 'cast' && e.value === 'erika'));
  assert.ok(events.some(e => e.name === 'cast' && e.value === 'cortez'));
  assert.ok(events.some(e => e.name === 'janones'));
  for (const o of game.obstacles) o.x = 870;
  game.tick(1 / 60);
  assert.ok(game.obstacles.some(o => o.type === 'bubble' && o.text === 'NA TRIBUNA!' && o.caption === 'CARTUM'));
  assert.ok(game.obstacles.some(o => o.type === 'bubble' && o.text === 'ATENÇÃO!' && o.caption === 'CARTUM'));
});

test('all four boss phrases rotate with the larger hitbox and a high third phrase', () => {
  assert.equal(MEMES.length, 4);
  assert.equal(new Set(MEMES.map(m => m.text)).size, 4);
  const game = quietGame();
  game.distance = LENGTH * 0.71;
  game.stage = 2;
  for (let i = 0; i < 8; i++) {
    game.bossShotIn = 0;
    game.tick(1 / 60);
    const shot = game.obstacles[game.obstacles.length - 1];
    assert.equal(shot.type, 'bubble');
    assert.equal(shot.meme, true);
    assert.equal(shot.w, 162);
    assert.equal(shot.h, 56);
    assert.equal(shot.text, MEMES[i % 4].text);
    assert.equal(shot.caption, MEMES[i % 4].caption);
    assert.equal(shot.y, i % 4 === 2 ? GROUND - 200 : GROUND - 58);
  }
});

for (const fps of [30, 60, 120]) {
  test(`a reactive player can finish the full course at ${fps} FPS using only jump/dash`, () => {
    const { game, events, seenTypes, seenMemes } = play(fps);
    assert.equal(game.phase, 'won');
    assert.ok(game.lives >= 1);
    assert.ok(events.some(e => e.name === 'janones'));
    assert.ok(events.some(e => e.name === 'bossShot'));
    assert.ok(seenTypes.has('erika'));
    assert.ok(seenTypes.has('cortez'));
    assert.deepEqual([...seenMemes].sort(), MEMES.map(m => m.text).sort());
    assert.ok(game.time > 50 && game.time < 70);
  });
}
