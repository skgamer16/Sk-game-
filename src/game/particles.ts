import { Particle, FloatingText } from '../types/game';

export class ParticleSystem {
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public ghostTrails: { x: number; y: number; width: number; height: number; state: string; alpha: number; color: string; rotation: number }[] = [];
  public speedLines: { x: number; y: number; length: number; speed: number; alpha: number }[] = [];
  public screenFlashes: { color: string; alpha: number; decay: number }[] = [];

  constructor() {
    this.initSpeedLines();
  }

  private initSpeedLines() {
    this.speedLines = [];
    for (let i = 0; i < 25; i++) {
      this.speedLines.push({
        x: Math.random() * 1200,
        y: Math.random() * 700,
        length: 30 + Math.random() * 80,
        speed: 15 + Math.random() * 25,
        alpha: 0.1 + Math.random() * 0.3,
      });
    }
  }

  public update(dt: number, speedMultiplier: number = 1.0) {
    // Update regular particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      if (p.vRot) p.rotation = (p.rotation || 0) + p.vRot * dt * 60;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      // Light gravity on spark / square particles
      if (p.shape === 'spark' || p.shape === 'square') {
        p.vy += 0.25 * dt * 60;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt * 60;
      ft.alpha -= 0.02 * dt * 60;
      ft.scale = Math.min(1.4, ft.scale + 0.03 * dt * 60);

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update ghost trails
    for (let i = this.ghostTrails.length - 1; i >= 0; i--) {
      const g = this.ghostTrails[i];
      g.alpha -= 0.08 * dt * 60;
      if (g.alpha <= 0) {
        this.ghostTrails.splice(i, 1);
      }
    }

    // Update speed lines
    for (const line of this.speedLines) {
      line.x -= line.speed * speedMultiplier * dt * 60;
      if (line.x < -line.length) {
        line.x = 1200 + Math.random() * 200;
        line.y = Math.random() * 700;
        line.length = 40 + Math.random() * 100 * speedMultiplier;
      }
    }

    // Update screen flashes
    for (let i = this.screenFlashes.length - 1; i >= 0; i--) {
      const f = this.screenFlashes[i];
      f.alpha -= f.decay * dt * 60;
      if (f.alpha <= 0) {
        this.screenFlashes.splice(i, 1);
      }
    }
  }

  // --- Particle Spawners ---

  public emitRailSparks(x: number, y: number, color: string = '#06b6d4', count: number = 3) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * 0.5 + 0.75) * Math.PI; // shoots backwards & upward
      const speed = 4 + Math.random() * 7;
      this.particles.push({
        x: x + (Math.random() * 10 - 5),
        y: y,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle) * speed),
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.4 ? color : '#ffffff',
        alpha: 1,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.4,
        shape: 'spark',
      });
    }
  }

  public emitSlashArc(x: number, y: number, color: string = '#ec4899') {
    // Slicing wave shockwave
    this.particles.push({
      x,
      y,
      vx: 4,
      vy: 0,
      size: 40,
      color,
      alpha: 1,
      life: 0.2,
      maxLife: 0.2,
      shape: 'ring',
    });

    for (let i = 0; i < 12; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 6 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: i % 2 === 0 ? color : '#ffffff',
        alpha: 1,
        life: 0.2 + Math.random() * 0.15,
        maxLife: 0.35,
        shape: 'spark',
      });
    }
  }

  public emitExplosion(x: number, y: number, color: string = '#f59e0b', count: number = 20) {
    // Shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 15,
      color: '#ffffff',
      alpha: 1,
      life: 0.25,
      maxLife: 0.25,
      shape: 'ring',
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 9;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: [color, '#ffffff', '#38bdf8', '#fbbf24'][Math.floor(Math.random() * 4)],
        alpha: 1,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        shape: Math.random() > 0.5 ? 'square' : 'spark',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  public emitShardCollect(x: number, y: number, color: string = '#06b6d4') {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 2,
        color: Math.random() > 0.3 ? color : '#ffffff',
        alpha: 1,
        life: 0.25 + Math.random() * 0.15,
        maxLife: 0.4,
        shape: 'circle',
      });
    }
  }

  public emitJumpPuff(x: number, y: number, color: string = '#38bdf8') {
    for (let i = 0; i < 6; i++) {
      const vx = (Math.random() - 0.5) * 5 - 2;
      const vy = Math.random() * 2 + 1;
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y,
        vx,
        vy,
        size: 3 + Math.random() * 3,
        color,
        alpha: 0.8,
        life: 0.2,
        maxLife: 0.2,
        shape: 'circle',
      });
    }
  }

  public addGhostTrail(x: number, y: number, width: number, height: number, state: string, color: string, rotation: number = 0) {
    this.ghostTrails.push({
      x,
      y,
      width,
      height,
      state,
      alpha: 0.6,
      color,
      rotation,
    });
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#38bdf8', size: number = 18) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      size,
      alpha: 1,
      vy: -1.8,
      scale: 0.8,
    });
  }

  public flash(color: string = '#ffffff', alpha: number = 0.4, decay: number = 0.05) {
    this.screenFlashes.push({ color, alpha, decay });
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.ghostTrails = [];
    this.screenFlashes = [];
  }
}
