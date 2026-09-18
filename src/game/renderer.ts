import { Platform, Rail, Hazard, Pickup, Projectile, Boss, SkinOption } from '../types/game';
import { ParticleSystem } from './particles';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 1000;
  private height: number = 600;

  // Background parallax layers
  private bgStars: { x: number; y: number; size: number; alpha: number; pulse: number }[] = [];
  private bgBuildings: { x: number; width: number; height: number; windows: { x: number; y: number; on: boolean }[]; color: string; billboard?: string }[] = [];
  private bgTraffic: { x: number; y: number; speed: number; color: string; length: number }[] = [];

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.initBackground();
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initBackground();
  }

  private initBackground() {
    // Stars / cyber grid nodes
    this.bgStars = [];
    for (let i = 0; i < 70; i++) {
      this.bgStars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.7),
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Parallax Cityscape Buildings
    this.bgBuildings = [];
    let currentX = 0;
    const billboards = ['SK // 99', 'OVERDRIVE', 'CYBER-X', 'HYPER-PULSE', 'NEO VORTEX', 'SYNTH 2088'];

    while (currentX < this.width + 1200) {
      const bWidth = 80 + Math.random() * 120;
      const bHeight = 180 + Math.random() * 260;
      const windows: { x: number; y: number; on: boolean }[] = [];

      for (let r = 20; r < bHeight - 30; r += 24) {
        for (let c = 12; c < bWidth - 12; c += 18) {
          windows.push({
            x: c,
            y: r,
            on: Math.random() > 0.35,
          });
        }
      }

      this.bgBuildings.push({
        x: currentX,
        width: bWidth,
        height: bHeight,
        windows,
        color: ['#090d1f', '#0c1229', '#0d1633', '#111b40'][Math.floor(Math.random() * 4)],
        billboard: Math.random() > 0.65 ? billboards[Math.floor(Math.random() * billboards.length)] : undefined,
      });

      currentX += bWidth + Math.random() * 20;
    }

    // Hover traffic in distance
    this.bgTraffic = [];
    for (let i = 0; i < 15; i++) {
      this.bgTraffic.push({
        x: Math.random() * this.width * 2,
        y: 80 + Math.random() * 220,
        speed: (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 3),
        color: Math.random() > 0.5 ? '#06b6d4' : '#ec4899',
        length: 20 + Math.random() * 30,
      });
    }
  }

  public render(
    cameraX: number,
    player: {
      x: number;
      y: number;
      width: number;
      height: number;
      state: string;
      velY: number;
      isGrounded: boolean;
      overdrive: boolean;
      shields: number;
      skin: SkinOption;
      combo: number;
    },
    platforms: Platform[],
    rails: Rail[],
    hazards: Hazard[],
    pickups: Pickup[],
    projectiles: Projectile[],
    boss: Boss | null,
    particleSystem: ParticleSystem,
    shake: { x: number; y: number; rotation: number },
    gameTime: number,
    speedMultiplier: number
  ) {
    const ctx = this.ctx;
    ctx.save();

    // Clear Screen
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, this.width, this.height);

    // Apply Screen Shake
    if (shake.x !== 0 || shake.y !== 0 || shake.rotation !== 0) {
      ctx.translate(shake.x, shake.y);
      ctx.rotate(shake.rotation);
    }

    // 1. Draw Sky Gradient & Cyber Grid Horizon
    this.drawSkyBackground(gameTime);

    // 2. Draw Distant Parallax Stars & Aurora
    this.drawStarsAndAurora(gameTime);

    // 3. Draw Parallax City Skyline
    this.drawParallaxCity(cameraX, gameTime);

    // 4. Draw Parallax Flying Traffic
    this.drawHoverTraffic(cameraX);

    // 5. Draw Platforms & Rails
    this.drawPlatforms(platforms, cameraX);
    this.drawRails(rails, cameraX);

    // 6. Draw Pickups
    this.drawPickups(pickups, cameraX, gameTime);

    // 7. Draw Hazards
    this.drawHazards(hazards, cameraX, gameTime);

    // 8. Draw Projectiles
    this.drawProjectiles(projectiles, cameraX);

    // 9. Draw Boss (if active)
    if (boss) {
      this.drawBoss(boss, cameraX, gameTime);
    }

    // 10. Draw Ghost Trails
    this.drawGhostTrails(particleSystem, cameraX);

    // 11. Draw Player Character
    this.drawPlayer(player, cameraX, gameTime);

    // 12. Draw Particles (Sparks, Slashes, Explosions)
    this.drawParticles(particleSystem, cameraX);

    // 13. Draw Speed Lines
    this.drawSpeedLines(particleSystem, speedMultiplier);

    // 14. Draw Floating Texts
    this.drawFloatingTexts(particleSystem, cameraX);

    // 15. Draw Screen Flashes
    this.drawFlashes(particleSystem);

    ctx.restore();
  }

  // --- RENDERING SUBSYSTEMS ---

  private drawSkyBackground(_gameTime: number) {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#02040a');
    grad.addColorStop(0.5, '#070d24');
    grad.addColorStop(1, '#0d1b3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Cyber Horizon Sun / Moon
    const sunX = this.width * 0.75;
    const sunY = this.height * 0.45;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
    sunGrad.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
    sunGrad.addColorStop(0.4, 'rgba(147, 51, 234, 0.2)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
    ctx.fill();

    // Sun disc with scanlines
    ctx.save();
    ctx.beginPath();
    ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 30;
    ctx.fill();
    // Scanline cuts
    ctx.fillStyle = '#070d24';
    for (let y = sunY - 50; y < sunY + 60; y += 12) {
      const sliceHeight = 2 + (y - (sunY - 50)) * 0.05;
      ctx.fillRect(sunX - 70, y, 140, sliceHeight);
    }
    ctx.restore();
  }

  private drawStarsAndAurora(gameTime: number) {
    const ctx = this.ctx;
    for (const star of this.bgStars) {
      const alpha = star.alpha * (0.6 + 0.4 * Math.sin(gameTime * 2 + star.pulse));
      ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawParallaxCity(cameraX: number, gameTime: number) {
    const ctx = this.ctx;
    const parallaxFactor = 0.15;
    // Animate city glow
    const ambientPulse = Math.sin(gameTime * 2) * 0.1;
    ctx.save();
    ctx.fillStyle = `rgba(147, 51, 234, ${0.05 + ambientPulse * 0.02})`;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();

    for (const b of this.bgBuildings) {
      const renderX = (b.x - cameraX * parallaxFactor) % (this.width + 1200) - 200;
      const renderY = this.height - b.height - 40;

      // Building Body
      ctx.fillStyle = b.color;
      ctx.fillRect(renderX, renderY, b.width, b.height);

      // Building top glowing edge
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.strokeRect(renderX, renderY, b.width, b.height);

      // Windows
      for (const w of b.windows) {
        if (w.on) {
          ctx.fillStyle = Math.sin(gameTime + w.x) > 0 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(236, 72, 153, 0.35)';
          ctx.fillRect(renderX + w.x, renderY + w.y, 8, 12);
        }
      }

      // Billboard
      if (b.billboard) {
        const bbY = renderY + 30;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(renderX + 6, bbY, b.width - 12, 32);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(renderX + 6, bbY, b.width - 12, 32);

        ctx.font = 'bold 10px Orbitron, sans-serif';
        ctx.fillStyle = '#f43f5e';
        ctx.textAlign = 'center';
        ctx.fillText(b.billboard, renderX + b.width / 2, bbY + 20);
      }
    }
  }

  private drawHoverTraffic(cameraX: number) {
    const ctx = this.ctx;
    for (const t of this.bgTraffic) {
      const renderX = ((t.x - cameraX * 0.3) % (this.width * 2) + this.width * 2) % (this.width * 2) - 200;
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(renderX, t.y, t.length, 2.5);
      ctx.shadowBlur = 0;
    }
  }

  private drawPlatforms(platforms: Platform[], cameraX: number) {
    const ctx = this.ctx;

    for (const p of platforms) {
      const rx = p.x - cameraX;
      if (rx + p.width < -100 || rx > this.width + 100) continue;

      // Platform body gradient
      const pGrad = ctx.createLinearGradient(0, p.y, 0, p.y + p.height);
      pGrad.addColorStop(0, '#0f172a');
      pGrad.addColorStop(0.3, '#0b0f19');
      pGrad.addColorStop(1, '#020617');
      ctx.fillStyle = pGrad;
      ctx.fillRect(rx, p.y, p.width, p.height);

      // Top Neon Surface Line
      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(rx, p.y);
      ctx.lineTo(rx + p.width, p.y);
      ctx.stroke();

      // Moving Grid Markings
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      const gridSpacing = 60;
      const offset = (rx + cameraX * 0.5) % gridSpacing;
      for (let gx = rx - offset; gx < rx + p.width; gx += gridSpacing) {
        if (gx >= rx && gx <= rx + p.width) {
          ctx.beginPath();
          ctx.moveTo(gx, p.y);
          ctx.lineTo(gx - 25, p.y + p.height);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Mirror reflection below track
      ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.fillRect(rx, p.y + 4, p.width, 20);
    }
  }

  private drawRails(rails: Rail[], cameraX: number) {
    const ctx = this.ctx;

    for (const r of rails) {
      const rx1 = r.x1 - cameraX;
      const rx2 = r.x2 - cameraX;

      if (Math.max(rx1, rx2) < -100 || Math.min(rx1, rx2) > this.width + 100) continue;

      ctx.save();
      // Outer Glow Rail
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 6;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(rx1, r.y1);
      ctx.lineTo(rx2, r.y2);
      ctx.stroke();

      // Inner Core White Line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(rx1, r.y1);
      ctx.lineTo(rx2, r.y2);
      ctx.stroke();

      // Rail End Pylons
      ctx.fillStyle = r.color;
      ctx.fillRect(rx1 - 4, r.y1 - 4, 8, 8);
      ctx.fillRect(rx2 - 4, r.y2 - 4, 8, 8);
      ctx.restore();
    }
  }

  private drawPickups(pickups: Pickup[], cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    for (const p of pickups) {
      if (p.collected) continue;
      const rx = p.x - cameraX;
      if (rx < -50 || rx > this.width + 50) continue;

      const hoverY = p.y + Math.sin(gameTime * 4 + p.pulsePhase) * 5;

      ctx.save();
      ctx.translate(rx, hoverY);

      if (p.type === 'shard' || p.type === 'hyper_shard') {
        const isHyper = p.type === 'hyper_shard';
        const color = isHyper ? '#fbbf24' : '#06b6d4';
        const size = isHyper ? p.radius * 1.4 : p.radius;

        // Rotating Diamond
        ctx.rotate(gameTime * (isHyper ? 4 : 2.5));
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = isHyper ? 22 : 12;

        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.75, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.75, 0);
        ctx.closePath();
        ctx.fill();

        // Inner Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.4);
        ctx.lineTo(size * 0.3, 0);
        ctx.lineTo(0, size * 0.4);
        ctx.lineTo(-size * 0.3, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'shield') {
        // Shield Orb
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.fill();

        // Icon
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', 0, 0);
      } else if (p.type === 'multiplier_orb') {
        // Multiplier Orb
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2X', 0, 0);
      } else if (p.type === 'magnet') {
        // Magnet Pickup
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();
      } else if (p.type === 'boost_pad') {
        // Speed Boost Pad
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.moveTo(-12, 6);
        ctx.lineTo(0, -10);
        ctx.lineTo(12, 6);
        ctx.lineTo(6, 6);
        ctx.lineTo(0, -2);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawHazards(hazards: Hazard[], cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    for (const h of hazards) {
      if (!h.active) continue;
      const rx = h.x - cameraX;
      if (rx < -100 || rx > this.width + 100) continue;

      ctx.save();

      if (h.type === 'laser_spike') {
        // Laser Spikes
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(rx, h.y + h.height);
        ctx.lineTo(rx + h.width / 2, h.y);
        ctx.lineTo(rx + h.width, h.y + h.height);
        ctx.closePath();
        ctx.fill();

        // Warning core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(rx + h.width / 2 - 3, h.y + h.height);
        ctx.lineTo(rx + h.width / 2, h.y + 8);
        ctx.lineTo(rx + h.width / 2 + 3, h.y + h.height);
        ctx.closePath();
        ctx.fill();
      } else if (h.type === 'low_beam') {
        // Low clearance beam
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rx, h.y, h.width, h.height);

        // Pulsing barrier laser
        const alpha = 0.6 + 0.4 * Math.sin(gameTime * 8);
        ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.lineWidth = 5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.strokeRect(rx, h.y, h.width, h.height);

        // Slide arrow hint
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('SLIDE ↓', rx + h.width / 2, h.y + h.height / 2 + 4);
      } else if (h.type === 'hover_drone') {
        // Hover Drone
        const floatY = h.y + (h.speedY ? Math.sin(gameTime * 3 + (h.animationPhase || 0)) * 20 : 0);
        ctx.translate(rx + h.width / 2, floatY + h.height / 2);

        // Drone Body
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eye Sensor
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(Math.sin(gameTime * 5) * 4, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Thruster glow
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-8, 14, 16, 4 + Math.sin(gameTime * 10) * 3);
      } else if (h.type === 'turret_drone') {
        // Turret Drone
        ctx.translate(rx + h.width / 2, h.y + h.height / 2);

        ctx.fillStyle = '#312e81';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.rect(-18, -16, 36, 32);
        ctx.fill();
        ctx.stroke();

        // Cannon barrel facing left
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-26, -4, 10, 8);
      }

      ctx.restore();
    }
  }

  private drawProjectiles(projectiles: Projectile[], cameraX: number) {
    const ctx = this.ctx;

    for (const p of projectiles) {
      const rx = p.x - cameraX;
      if (rx < -50 || rx > this.width + 50) continue;

      ctx.save();
      ctx.translate(rx, p.y);

      ctx.fillStyle = p.isDeflected ? '#06b6d4' : p.color;
      ctx.shadowColor = p.isDeflected ? '#06b6d4' : p.color;
      ctx.shadowBlur = 16;

      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Tail
      ctx.strokeStyle = p.isDeflected ? '#38bdf8' : '#f87171';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-p.vx * 3, -p.vy * 3);
      ctx.stroke();

      ctx.restore();
    }
  }

  private drawBoss(boss: Boss, cameraX: number, gameTime: number) {
    const ctx = this.ctx;
    const rx = boss.x - cameraX;

    ctx.save();
    ctx.translate(rx + boss.width / 2, boss.y + boss.height / 2);

    // Floating animation
    const hoverY = Math.sin(gameTime * 2) * 12;
    ctx.translate(0, hoverY);

    // Boss Hull
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = boss.hp < boss.maxHp * 0.3 ? '#ef4444' : '#a855f7';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 24;

    ctx.beginPath();
    ctx.moveTo(-boss.width / 2, 0);
    ctx.lineTo(-boss.width / 4, -boss.height / 2);
    ctx.lineTo(boss.width / 2, -boss.height / 3);
    ctx.lineTo(boss.width / 2, boss.height / 3);
    ctx.lineTo(-boss.width / 4, boss.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Boss Glowing Core
    const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 25);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, '#ec4899');
    coreGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    // Thruster Flairs
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 18;
    ctx.fillRect(boss.width / 2, -15, 20 + Math.sin(gameTime * 15) * 8, 8);
    ctx.fillRect(boss.width / 2, 8, 20 + Math.sin(gameTime * 15 + 1) * 8, 8);

    ctx.restore();

    // Boss Health Bar on top
    const hpPercent = Math.max(0, boss.hp / boss.maxHp);
    const barWidth = 260;
    const barX = this.width / 2 - barWidth / 2;
    const barY = 30;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(barX - 4, barY - 4, barWidth + 8, 20);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX - 4, barY - 4, barWidth + 8, 20);

    ctx.fillStyle = hpPercent > 0.3 ? '#a855f7' : '#ef4444';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.fillRect(barX, barY, barWidth * hpPercent, 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Orbitron';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 0;
    ctx.fillText(`${boss.name}`, this.width / 2, barY - 8);
  }

  private drawPlayer(
    player: {
      x: number;
      y: number;
      width: number;
      height: number;
      state: string;
      velY: number;
      isGrounded: boolean;
      overdrive: boolean;
      shields: number;
      skin: SkinOption;
      combo: number;
    },
    cameraX: number,
    gameTime: number
  ) {
    const ctx = this.ctx;
    const rx = player.x - cameraX;
    const ry = player.y;

    ctx.save();
    ctx.translate(rx + player.width / 2, ry + player.height / 2);

    // Overdrive Super Aura
    if (player.overdrive) {
      ctx.save();
      const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 50);
      auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
      auraGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.4)');
      auraGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Shield Bubble
    if (player.shields > 0) {
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + 0.3 * Math.sin(gameTime * 6)})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dynamic rotation based on state
    if (player.state === 'JUMPING' || player.state === 'DOUBLE_JUMPING') {
      const rot = Math.min(Math.PI * 2, (player.velY < 0 ? -0.3 : 0.4));
      ctx.rotate(rot);
    } else if (player.state === 'SLIDING') {
      ctx.rotate(-0.35);
    }

    const primaryColor = player.skin.primaryColor || '#06b6d4';
    const glowColor = player.skin.glowColor || '#38bdf8';

    // 1. Cyber Hoverboard / Skates
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;

    const boardY = player.height / 2 - 4;
    ctx.beginPath();
    ctx.roundRect(-22, boardY, 44, 7, 3);
    ctx.fill();
    ctx.stroke();

    // Thruster Jets beneath board
    ctx.fillStyle = player.overdrive ? '#fbbf24' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(-14, boardY + 7, 3 + Math.sin(gameTime * 20) * 1.5, 0, Math.PI * 2);
    ctx.arc(14, boardY + 7, 3 + Math.sin(gameTime * 20 + 1) * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Character Body
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    // Torso
    ctx.roundRect(-10, -14, 20, 26, 4);
    ctx.fill();

    // Cyber Helmet / Head
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -20, 11, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Visor
    ctx.fillStyle = player.overdrive ? '#fbbf24' : glowColor;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.fillRect(1, -22, 10, 5);

    // 3. Blade / Energy Katana during Air-Dash / Slash
    if (player.state === 'AIR_DASHING') {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(44, -2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Scarf / Energy Streamer
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, -16);
    ctx.quadraticCurveTo(-24, -20 + Math.sin(gameTime * 12) * 6, -38, -14 + Math.sin(gameTime * 12 + 1) * 8);
    ctx.stroke();

    ctx.restore();
  }

  private drawGhostTrails(particleSystem: ParticleSystem, cameraX: number) {
    const ctx = this.ctx;
    for (const g of particleSystem.ghostTrails) {
      const rx = g.x - cameraX;
      ctx.save();
      ctx.translate(rx + g.width / 2, g.y + g.height / 2);
      ctx.rotate(g.rotation);
      ctx.fillStyle = g.color;
      ctx.globalAlpha = g.alpha * 0.45;
      ctx.fillRect(-g.width / 2, -g.height / 2, g.width, g.height);
      ctx.restore();
    }
  }

  private drawParticles(particleSystem: ParticleSystem, cameraX: number) {
    const ctx = this.ctx;

    for (const p of particleSystem.particles) {
      const rx = p.x - cameraX;
      if (rx < -50 || rx > this.width + 50) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.shape === 'ring') {
        const radius = p.size * (1 - p.life / p.maxLife) * 1.5;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(rx, p.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(rx, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.translate(rx, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(rx, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawSpeedLines(particleSystem: ParticleSystem, speedMultiplier: number) {
    const ctx = this.ctx;
    if (speedMultiplier < 1.1) return;

    ctx.save();
    for (const line of particleSystem.speedLines) {
      ctx.strokeStyle = `rgba(186, 230, 253, ${line.alpha * Math.min(1, speedMultiplier - 0.8)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x - line.length, line.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawFloatingTexts(particleSystem: ParticleSystem, cameraX: number) {
    const ctx = this.ctx;

    for (const ft of particleSystem.floatingTexts) {
      const rx = ft.x - cameraX;
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.translate(rx, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = `bold ${ft.size}px Orbitron, sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    }
  }

  private drawFlashes(particleSystem: ParticleSystem) {
    const ctx = this.ctx;
    for (const f of particleSystem.screenFlashes) {
      ctx.save();
      ctx.fillStyle = f.color;
      ctx.globalAlpha = f.alpha;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }
  }
}
