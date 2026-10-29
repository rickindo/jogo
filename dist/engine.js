(function (root) {
  'use strict';
  const GROUND = 510;
  const LENGTH = 20000;
  const SHAPES = { cone: [42, 54], barrier: [84, 66], police: [52, 84], janones: [58, 88], erika: [54, 92], cortez: [56, 88], bubble: [78, 46], mic: [34, 60] };
  // Recortes curtos da campanha de 2026. Contexto e referências em fontes.html.
  const MEMES = [
    { text: 'ATÉ TEU PAI!', caption: 'DEBATE · BAND' },
    { text: 'GUGO', caption: 'DEBATE · GLOBO' },
    { text: 'O BRASIL ACABOU', caption: 'LAPSO NO DEBATE' },
    { text: 'VOTE EM MIM, BOLSONARO!', caption: 'DEBATE · BAND' }
  ];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function overlaps(a, b, inset = 0) {
    return a.x + a.w - inset > b.x + inset && a.x + inset < b.x + b.w - inset &&
      a.y + a.h - inset > b.y + inset && a.y + inset < b.y + b.h - inset;
  }
  class Game {
    constructor(onEvent = () => {}, seed = 1631) {
      this.onEvent = onEvent;
      this.seed = seed;
      this.reset();
      this.phase = 'menu';
    }
    reset() {
      this.rng = this.seed;
      this.time = 0;
      this.distance = 0;
      this.speed = 305;
      this.lives = 4;
      this.tokens = 0;
      this.bonus = 0;
      this.score = 0;
      this.stage = 0;
      this.spawnIn = 2.3;
      this.spawnCount = 0;
      this.tokenIn = 1.1;
      this.bossShotIn = 0.8;
      this.bossShots = 0;
      this.obstacles = [];
      this.pickups = [];
      this.player = { x: 220, y: GROUND - 84, w: 52, h: 84, vy: 0, jumps: 0, grounded: true, invincible: 0, dash: 0, cooldown: 0 };
    }
    random() {
      this.rng = (Math.imul(this.rng, 1664525) + 1013904223) >>> 0;
      return this.rng / 4294967296;
    }
    emit(name, data) { this.onEvent(name, data); }
    start() { this.reset(); this.phase = 'running'; this.emit('start'); }
    pause() {
      if (this.phase === 'running') { this.phase = 'paused'; this.emit('pause'); }
      else if (this.phase === 'paused') { this.phase = 'running'; this.emit('resume'); }
    }
    jump() {
      const p = this.player;
      if (this.phase !== 'running' || p.jumps >= 2) return false;
      p.vy = p.jumps === 0 ? -720 : -640;
      p.jumps++;
      p.grounded = false;
      this.emit('jump', p.jumps);
      return true;
    }
    dash() {
      const p = this.player;
      if (this.phase !== 'running' || p.cooldown > 0) return false;
      p.dash = 0.48;
      p.cooldown = 3;
      p.invincible = Math.max(p.invincible, 0.54);
      this.emit('dash');
      return true;
    }
    addObstacle(type, x = 1330, y, extra = {}) {
      const [w, h] = SHAPES[type];
      const o = { type, x, y: y ?? GROUND - h, w, h, passed: false, ...extra };
      this.obstacles.push(o);
      return o;
    }
    spawn() {
      const n = this.spawnCount++;
      let type;
      if (n < 2) type = n ? 'barrier' : 'cone';
      else if (this.stage === 0) type = ['cone', 'police', 'barrier'][n % 3];
      else type = ['janones', 'erika', 'cortez', 'police', 'barrier', 'erika', 'cortez'][n % 7];
      this.addObstacle(type);
      if (type === 'janones') this.emit('janones');
      if (type === 'erika' || type === 'cortez') this.emit('cast', type);
      this.spawnIn = this.stage === 0 ? 1.7 + this.random() * 0.35 : 1.5 + this.random() * 0.35;
    }
    tick(dt, input = {}) {
      if (this.phase !== 'running' || !Number.isFinite(dt) || dt <= 0) return;
      let remaining = Math.min(dt, 0.12);
      while (remaining > 0.000001 && this.phase === 'running') {
        const step = Math.min(remaining, 1 / 120);
        this.update(step, input);
        remaining -= step;
      }
    }
    update(dt, input) {
      const p = this.player;
      this.time += dt;
      this.speed = 305 + this.progress * 52;
      this.distance = Math.min(LENGTH, this.distance + this.speed * dt);
      const nextStage = this.progress >= 0.7 ? 2 : this.progress >= 0.34 ? 1 : 0;
      if (nextStage !== this.stage) {
        this.stage = nextStage;
        if (nextStage === 2) {
          this.obstacles = this.obstacles.filter(o => o.x < 800);
          this.spawnIn = 99;
          this.bossShotIn = 2.1;
        }
        this.emit('stage', this.stage);
      }
      p.invincible = Math.max(0, p.invincible - dt);
      p.cooldown = Math.max(0, p.cooldown - dt);
      p.dash = Math.max(0, p.dash - dt);
      const direction = Number(!!input.right) - Number(!!input.left);
      p.x = clamp(p.x + (direction * 285 + (p.dash > 0 ? 140 : 0)) * dt, 100, 700);
      p.vy += 1850 * dt;
      p.y += p.vy * dt;
      if (p.y + p.h >= GROUND) {
        p.y = GROUND - p.h;
        p.vy = 0;
        p.jumps = 0;
        p.grounded = true;
      }
      this.spawnIn -= dt;
      if (this.spawnIn <= 0 && this.stage < 2) this.spawn();
      if (this.stage === 2) {
        this.bossShotIn -= dt;
        if (this.bossShotIn <= 0) {
          const n = this.bossShots++;
          const high = n % 4 === 2;
          this.addObstacle('bubble', 1050, high ? GROUND - 200 : GROUND - 58, { extraSpeed: 90, w: 162, h: 56, meme: true, ...MEMES[n % MEMES.length] });
          this.bossShotIn = 1.65 + this.random() * 0.25;
          this.emit('bossShot', high);
        }
      }
      this.tokenIn -= dt;
      if (this.tokenIn <= 0) {
        const y = GROUND - (this.random() > 0.45 ? 172 : 95);
        for (let i = 0; i < 3; i++) this.pickups.push({ x: 1320 + i * 58, y: y - Math.sin(i / 2 * Math.PI) * 25, w: 28, h: 28 });
        this.tokenIn = 3.6 + this.random() * 0.9;
      }
      for (const o of this.obstacles) {
        o.x -= (this.speed + (o.extraSpeed || 0)) * dt;
        if (o.type === 'janones' && !o.posted && o.x < 880) {
          o.posted = true;
          this.addObstacle('bubble', o.x - 55, GROUND - 182, { extraSpeed: 90, text: 'POSTOU!' });
        }
        if ((o.type === 'erika' || o.type === 'cortez') && !o.posted && o.x < 880) {
          o.posted = true;
          this.addObstacle('bubble', o.x - 55, GROUND - 184, { extraSpeed: 80, w: 116, h: 44, text: o.type === 'erika' ? 'NA TRIBUNA!' : 'ATENÇÃO!', caption: 'CARTUM' });
        }
        if (overlaps(p, o, o.type === 'cone' ? 10 : 8) && p.invincible <= 0) {
          this.lives--;
          p.invincible = 1.7;
          this.emit('hit', this.lives);
          if (this.lives <= 0) {
            this.phase = 'lost';
            this.emit('lost');
            return;
          }
        }
        if (!o.passed && o.x + o.w < p.x) {
          o.passed = true;
          this.bonus += 25;
          this.emit('dodge');
        }
      }
      this.obstacles = this.obstacles.filter(o => o.x + o.w > -100);
      for (const token of this.pickups) {
        token.x -= this.speed * dt;
        if (!token.taken && overlaps(p, token, 2)) {
          token.taken = true;
          this.tokens++;
          this.bonus += 100;
          if (this.tokens % 9 === 0 && this.lives < 4) { this.lives++; this.emit('heal'); }
          this.emit('token');
        }
      }
      this.pickups = this.pickups.filter(t => !t.taken && t.x > -50);
      this.score = Math.floor(this.distance / 10) + this.bonus;
      if (this.distance >= LENGTH) {
        this.bonus += this.lives * 250;
        this.score = Math.floor(this.distance / 10) + this.bonus;
        this.phase = 'won';
        this.emit('won');
      }
    }
    get progress() { return this.distance / LENGTH; }
    get bossRemaining() { return Math.max(0, Math.min(1, (1 - this.progress) / 0.3)); }
  }
  root.TravessiaEngine = { Game, GROUND, LENGTH, MEMES, overlaps };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.TravessiaEngine;
})(typeof window !== 'undefined' ? window : globalThis);
