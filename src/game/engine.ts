import {
  GameMode,
  PlayerState,
  Pickup,
  Projectile,
  SkinOption,
  GameSettings,
} from '../types/game';
import { ParticleSystem } from './particles';
import { LevelManager } from './levels';
import { sound } from './audio';
import { StorageManager } from './storage';

export interface GameCallbacks {
  onScoreUpdate: (score: number, combo: number, multiplier: number, overdrive: number, shields: number) => void;
  onGameOver: (runData: {
    score: number;
    distance: number;
    maxCombo: number;
    shards: number;
    bossesDefeated: number;
    grade: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C';
    isNewHighScore: boolean;
  }) => void;
  onPauseChange: (isPaused: boolean) => void;
}

export class GameEngine {
  public mode: GameMode = 'endless';
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;

  // Level & Particles
  public levelManager: LevelManager;
  public particleSystem: ParticleSystem;

  // Player Entity
  public player = {
    x: 100,
    y: 350,
    width: 32,
    height: 48,
    velX: 7.0,
    velY: 0,
    state: 'RUNNING' as PlayerState,
    isGrounded: false,
    onRail: false,
    canDoubleJump: true,
    dashTimer: 0,
    slideTimer: 0,
    invincibleTimer: 0,
    skin: StorageManager.loadData().skins[0] as SkinOption,
  };

  // Stats & Scoring
  public stats = {
    score: 0,
    distance: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    comboMaxTimer: 3.5, // seconds
    multiplier: 1,
    shardsCollected: 0,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    overdriveCharge: 0,
    isOverdrive: false,
    overdriveTimer: 0,
    shields: 3,
    maxShields: 3,
    magnetTimer: 0,
    timeRemaining: 60, // For Rush 60s
  };

  // Screen shake & Hit-stop
  public shake = { x: 0, y: 0, rotation: 0, intensity: 0 };
  public hitStopTimer: number = 0;
  public gameTime: number = 0;

  // Projectiles
  public projectiles: Projectile[] = [];

  // Settings
  public settings: GameSettings;
  private callbacks: GameCallbacks;

  constructor(callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.levelManager = new LevelManager();
    this.particleSystem = new ParticleSystem();
    const data = StorageManager.loadData();
    this.settings = data.settings;
    this.player.skin = data.skins.find((s: SkinOption) => s.id === data.equippedSkin) || data.skins[0];
  }

  public init(mode: GameMode = 'endless') {
    this.mode = mode;
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;

    // Reset Player
    this.player.x = 100;
    this.player.y = 350;
    this.player.velX = 7.0;
    this.player.velY = 0;
    this.player.state = 'RUNNING';
    this.player.isGrounded = false;
    this.player.onRail = false;
    this.player.canDoubleJump = true;
    this.player.dashTimer = 0;
    this.player.slideTimer = 0;
    this.player.invincibleTimer = 0;

    // Reset Stats
    this.stats.score = 0;
    this.stats.distance = 0;
    this.stats.combo = 0;
    this.stats.maxCombo = 0;
    this.stats.comboTimer = 0;
    this.stats.multiplier = 1;
    this.stats.shardsCollected = 0;
    this.stats.enemiesDefeated = 0;
    this.stats.bossesDefeated = 0;
    this.stats.overdriveCharge = 0;
    this.stats.isOverdrive = false;
    this.stats.overdriveTimer = 0;
    this.stats.shields = this.mode === 'zen' ? 999 : 3;
    this.stats.magnetTimer = 0;
    this.stats.timeRemaining = 60;

    this.projectiles = [];
    this.shake = { x: 0, y: 0, rotation: 0, intensity: 0 };
    this.hitStopTimer = 0;
    this.gameTime = 0;

    const data = StorageManager.loadData();
    this.settings = data.settings;
    this.player.skin = data.skins.find((s: SkinOption) => s.id === data.equippedSkin) || data.skins[0];

    this.levelManager.reset(mode);
    this.particleSystem.clear();

    sound.setTrack(mode === 'zen' ? 'zen' : mode === 'boss_rush' ? 'boss' : 'cyber');
    sound.startMusic(mode === 'zen' ? 'zen' : mode === 'boss_rush' ? 'boss' : 'cyber');

    this.notifyHUD();
  }

  public update(dt: number) {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;

    // Cap delta time to prevent tunneling
    const cappedDt = Math.min(0.05, Math.max(0.001, dt));

    // Handle Hit-Stop
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= cappedDt;
      return;
    }

    this.gameTime += cappedDt;

    // Mode timer check (60s Rush)
    if (this.mode === 'rush60') {
      this.stats.timeRemaining -= cappedDt;
      if (this.stats.timeRemaining <= 0) {
        this.triggerGameOver();
        return;
      }
    }

    // Overdrive Countdown
    if (this.stats.isOverdrive) {
      this.stats.overdriveTimer -= cappedDt;
      if (this.stats.overdriveTimer <= 0) {
        this.stats.isOverdrive = false;
        sound.setTrack(this.levelManager.boss ? 'boss' : this.mode === 'zen' ? 'zen' : 'cyber');
      }
    }

    // Magnet Countdown
    if (this.stats.magnetTimer > 0) {
      this.stats.magnetTimer -= cappedDt;
    }

    // Combo Timer Decay
    if (this.stats.combo > 0) {
      this.stats.comboTimer -= cappedDt;
      if (this.stats.comboTimer <= 0) {
        this.stats.combo = 0;
        this.stats.multiplier = 1;
      }
    }

    // Distance & Speed Progression
    const baseSpeed = 7.0 + Math.min(6.0, this.stats.distance / 400);
    const speedBoost = this.stats.isOverdrive ? 4.0 : 0;
    this.player.velX = baseSpeed + speedBoost;

    // Move Player Forward
    const moveStepX = this.player.velX * cappedDt * 60;
    this.player.x += moveStepX;
    this.stats.distance += moveStepX / 30; // 30 units = ~1 meter

    // Add passive distance score
    const scoreAdd = Math.floor(moveStepX * 0.5 * this.stats.multiplier * (this.stats.isOverdrive ? 5 : 1));
    this.stats.score += scoreAdd;

    // Update Player Timers & State
    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer -= cappedDt;
    }

    if (this.player.dashTimer > 0) {
      this.player.dashTimer -= cappedDt;
      if (this.player.dashTimer <= 0 && this.player.state === 'AIR_DASHING') {
        this.player.state = this.player.isGrounded ? 'RUNNING' : 'JUMPING';
      }
    }

    if (this.player.slideTimer > 0) {
      this.player.slideTimer -= cappedDt;
      if (this.player.slideTimer <= 0 && this.player.state === 'SLIDING') {
        this.player.state = 'RUNNING';
        this.player.height = 48;
      }
    }

    // Player Gravity & Physics
    if (!this.player.onRail) {
      this.player.velY += 0.55 * cappedDt * 60;
      this.player.y += this.player.velY * cappedDt * 60;
    }

    // Platform Collisions
    this.checkPlatformCollisions();

    // Rail Collisions
    this.checkRailCollisions();

    // Hazard Collisions
    this.checkHazardCollisions();

    // Pickups Collisions
    this.checkPickupCollisions();

    // Projectile Updates & Collisions
    this.updateProjectiles(cappedDt);

    // Boss Updates
    if (this.levelManager.boss) {
      this.updateBoss(cappedDt);
    }

    // Level Generator update
    this.levelManager.update(this.player.x, this.stats.distance, this.mode);

    // Particles & Screen Shake
    this.updateScreenShake(cappedDt);
    this.particleSystem.update(cappedDt, this.player.velX / 7.0);

    // Spawn Ghost Trails
    if (this.stats.isOverdrive || this.player.state === 'AIR_DASHING' || this.player.state === 'SLIDING') {
      this.particleSystem.addGhostTrail(
        this.player.x,
        this.player.y,
        this.player.width,
        this.player.height,
        this.player.state,
        this.player.skin.glowColor
      );
    }

    // Fall below screen check
    if (this.player.y > 680) {
      if (this.mode === 'zen') {
        this.player.y = 350;
        this.player.velY = 0;
      } else {
        this.takeDamage(999);
      }
    }

    this.notifyHUD();
  }

  // --- INPUT CONTROLS ---

  public handleJump() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;

    if (this.player.isGrounded || this.player.onRail) {
      // First Jump
      this.player.velY = -12.5;
      this.player.isGrounded = false;
      this.player.onRail = false;
      this.player.canDoubleJump = true;
      this.player.state = 'JUMPING';
      this.player.height = 48;
      sound.playJump();
      this.particleSystem.emitJumpPuff(this.player.x, this.player.y + this.player.height, this.player.skin.glowColor);
    } else if (this.player.canDoubleJump) {
      // Double Jump
      this.player.velY = -11.5;
      this.player.canDoubleJump = false;
      this.player.state = 'DOUBLE_JUMPING';
      sound.playDoubleJump();
      this.particleSystem.emitJumpPuff(this.player.x, this.player.y + this.player.height, '#ffffff');
    }
  }

  public handleSlide() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;

    if (this.player.isGrounded) {
      this.player.state = 'SLIDING';
      this.player.slideTimer = 0.55; // 0.55s slide
      this.player.height = 24; // Lower hitbox!
      sound.playSlide();
      this.particleSystem.emitRailSparks(this.player.x, this.player.y + this.player.height, this.player.skin.glowColor, 6);
    } else {
      // Fast fall dive down
      this.player.velY = 16.0;
      sound.playSlide();
    }
  }

  public handleSlash() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;

    this.player.state = 'AIR_DASHING';
    this.player.dashTimer = 0.25;
    this.player.invincibleTimer = 0.25;
    this.player.velY = 0; // Freeze vertical drop during dash
    sound.playSlash();
    this.addScreenShake(3);

    const slashX = this.player.x + this.player.width + 20;
    const slashY = this.player.y + this.player.height / 2;
    this.particleSystem.emitSlashArc(slashX, slashY, this.player.skin.glowColor);

    // Check Deflect Projectiles
    for (const proj of this.projectiles) {
      if (!proj.isDeflected && Math.hypot(proj.x - slashX, proj.y - slashY) < 70) {
        proj.isDeflected = true;
        proj.vx = 18.0; // Shoot back at boss/enemies!
        proj.vy = (Math.random() - 0.5) * 4;
        sound.playDeflect();
        this.addCombo(1, 'PERFECT PARRY! +800', 800, proj.x, proj.y);
        this.addHitStop(0.06);
        this.addScreenShake(6);
      }
    }

    // Check Slash Hazards in front
    for (const h of this.levelManager.hazards) {
      if (!h.active) continue;
      if (
        h.x < slashX + 50 &&
        h.x + h.width > slashX - 30 &&
        Math.abs(h.y + h.height / 2 - slashY) < 55
      ) {
        if (h.type === 'hover_drone' || h.type === 'turret_drone' || h.type === 'laser_spike' || this.stats.isOverdrive) {
          h.active = false;
          this.stats.enemiesDefeated++;
          this.player.canDoubleJump = true; // Reset double jump on air-kill!
          sound.playEnemyExplode();
          this.particleSystem.emitExplosion(h.x + h.width / 2, h.y + h.height / 2, '#ec4899', 16);
          this.addCombo(1, 'DRONE SLICED! +500', 500, h.x, h.y);
          this.chargeOverdrive(15);
          this.addHitStop(0.06);
          this.addScreenShake(5);
        }
      }
    }

    // Check Boss Slash Hit
    const boss = this.levelManager.boss;
    if (boss && Math.hypot(boss.x + boss.width / 2 - slashX, boss.y + boss.height / 2 - slashY) < 90) {
      this.damageBoss(2);
    }
  }

  public handleOverdrive() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    if (this.stats.overdriveCharge < 100 && !this.stats.isOverdrive) return;

    this.stats.isOverdrive = true;
    this.stats.overdriveTimer = 8.0; // 8 seconds
    this.stats.overdriveCharge = 0;
    this.player.invincibleTimer = 8.0;

    sound.playOverdrive();
    sound.setTrack('overdrive');
    this.particleSystem.flash('#fbbf24', 0.6, 0.04);
    this.particleSystem.addFloatingText('★ HYPER OVERDRIVE! ★', this.player.x, this.player.y - 40, '#fbbf24', 24);
    this.addScreenShake(10);
  }

  // --- COLLISION LOGIC ---

  private checkPlatformCollisions() {
    const p = this.player;
    p.isGrounded = false;

    const footX = p.x + p.width / 2;
    const footY = p.y + p.height;

    for (const plat of this.levelManager.platforms) {
      if (
        footX >= plat.x &&
        footX <= plat.x + plat.width &&
        footY >= plat.y &&
        footY <= plat.y + 24 &&
        p.velY >= 0
      ) {
        p.y = plat.y - p.height;
        p.velY = 0;
        p.isGrounded = true;
        p.onRail = false;
        p.canDoubleJump = true;
        if (p.state === 'JUMPING' || p.state === 'DOUBLE_JUMPING') {
          p.state = 'RUNNING';
        }
        break;
      }
    }
  }

  private checkRailCollisions() {
    const p = this.player;
    const footX = p.x + p.width / 2;
    const footY = p.y + p.height;

    let hitRail = false;

    for (const rail of this.levelManager.rails) {
      if (
        footX >= rail.x1 &&
        footX <= rail.x2 &&
        footY >= rail.y1 - 10 &&
        footY <= rail.y1 + 18 &&
        p.velY >= 0
      ) {
        p.y = rail.y1 - p.height;
        p.velY = 0;
        p.onRail = true;
        p.isGrounded = false;
        p.canDoubleJump = true;
        p.state = 'RAIL_GRINDING';
        hitRail = true;

        // Rail grinding perks
        this.particleSystem.emitRailSparks(p.x + p.width / 2, rail.y1, rail.color, 2);
        this.stats.score += Math.floor(10 * this.stats.multiplier * (this.stats.isOverdrive ? 5 : 1));
        this.chargeOverdrive(0.2);
        sound.startRailSound();
        break;
      }
    }

    if (!hitRail && p.onRail) {
      p.onRail = false;
      p.state = 'JUMPING';
      sound.stopRailSound();
    }
  }

  private checkHazardCollisions() {
    const p = this.player;
    const isInvincible = p.invincibleTimer > 0 || this.stats.isOverdrive;

    for (const h of this.levelManager.hazards) {
      if (!h.active) continue;

      const hit =
        p.x < h.x + h.width &&
        p.x + p.width > h.x &&
        p.y < h.y + h.height &&
        p.y + p.height > h.y;

      if (hit) {
        if (isInvincible) {
          // Smash obstacle during Overdrive or Slash!
          h.active = false;
          sound.playEnemyExplode();
          this.particleSystem.emitExplosion(h.x + h.width / 2, h.y + h.height / 2, '#fbbf24', 16);
          this.addCombo(1, 'DESTROYED! +600', 600, h.x, h.y);
          this.addScreenShake(5);
        } else {
          // Player took hit!
          this.takeDamage(1);
          h.active = false;
          this.particleSystem.emitExplosion(h.x + h.width / 2, h.y + h.height / 2, '#ef4444', 12);
        }
      }
    }
  }

  private checkPickupCollisions() {
    const p = this.player;
    const px = p.x + p.width / 2;
    const py = p.y + p.height / 2;

    const magnetActive = this.stats.magnetTimer > 0 || this.stats.isOverdrive;
    const magnetRange = this.stats.isOverdrive ? 260 : 160;

    for (const pickup of this.levelManager.pickups) {
      if (pickup.collected) continue;

      // Magnet pull
      const dist = Math.hypot(pickup.x - px, pickup.y - py);
      if (magnetActive && dist < magnetRange) {
        pickup.x += (px - pickup.x) * 0.15;
        pickup.y += (py - pickup.y) * 0.15;
      }

      // Collect Check
      if (dist < pickup.radius + p.width / 2 + 8) {
        pickup.collected = true;
        this.handlePickupCollect(pickup);
      }
    }
  }

  private handlePickupCollect(pickup: Pickup) {
    if (pickup.type === 'shard') {
      this.stats.shardsCollected++;
      const val = 150 * this.stats.multiplier * (this.stats.isOverdrive ? 5 : 1);
      this.stats.score += val;
      this.chargeOverdrive(3);
      sound.playCollectShard(this.stats.combo);
      this.particleSystem.emitShardCollect(pickup.x, pickup.y, '#06b6d4');
      this.addCombo(1, `+${val}`, 0, pickup.x, pickup.y);
    } else if (pickup.type === 'hyper_shard') {
      this.stats.shardsCollected += 5;
      const val = 1000 * this.stats.multiplier * (this.stats.isOverdrive ? 5 : 1);
      this.stats.score += val;
      this.chargeOverdrive(20);
      sound.playHyperShard();
      this.particleSystem.emitExplosion(pickup.x, pickup.y, '#fbbf24', 12);
      this.particleSystem.addFloatingText('HYPER SHARD! +1000', pickup.x, pickup.y - 20, '#fbbf24', 20);
      this.addCombo(2, '', 0, pickup.x, pickup.y);
    } else if (pickup.type === 'shield') {
      if (this.stats.shields < this.stats.maxShields) {
        this.stats.shields++;
      }
      this.stats.score += 500;
      sound.playHyperShard();
      this.particleSystem.addFloatingText('SHIELD RECHARGED!', pickup.x, pickup.y - 20, '#3b82f6', 18);
    } else if (pickup.type === 'multiplier_orb') {
      this.stats.multiplier = Math.min(16, this.stats.multiplier * 2);
      this.stats.comboTimer = this.stats.comboMaxTimer;
      sound.playHyperShard();
      this.particleSystem.addFloatingText(`MULTIPLIER x${this.stats.multiplier}!`, pickup.x, pickup.y - 20, '#ec4899', 22);
      this.addScreenShake(4);
    } else if (pickup.type === 'magnet') {
      this.stats.magnetTimer = 8.0;
      sound.playHyperShard();
      this.particleSystem.addFloatingText('MAGNET ON!', pickup.x, pickup.y - 20, '#a855f7', 18);
    } else if (pickup.type === 'boost_pad') {
      this.player.velY = -14.0;
      this.player.isGrounded = false;
      this.player.canDoubleJump = true;
      this.stats.score += 300;
      sound.playJump();
      this.particleSystem.emitJumpPuff(pickup.x, pickup.y, '#10b981');
      this.particleSystem.addFloatingText('SUPER BOOST!', pickup.x, pickup.y - 20, '#10b981', 18);
    }
  }

  // --- PROJECTILES & BOSS ---

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt * 60;
      proj.y += proj.vy * dt * 60;

      // Deflected projectile hitting boss
      const boss = this.levelManager.boss;
      if (proj.isDeflected && boss) {
        if (
          proj.x >= boss.x &&
          proj.x <= boss.x + boss.width &&
          proj.y >= boss.y &&
          proj.y <= boss.y + boss.height
        ) {
          this.damageBoss(proj.damage * 3);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Hit player check
      if (!proj.isDeflected && this.player.invincibleTimer <= 0 && !this.stats.isOverdrive) {
        const hit = Math.hypot(proj.x - (this.player.x + this.player.width / 2), proj.y - (this.player.y + this.player.height / 2)) < proj.radius + 14;
        if (hit) {
          this.takeDamage(1);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Remove out of bounds
      if (proj.x < this.player.x - 400 || proj.x > this.player.x + 1200 || proj.y > 700 || proj.y < -100) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateBoss(dt: number) {
    const boss = this.levelManager.boss;
    if (!boss) return;

    // Boss follows player camera smoothly
    const targetX = this.player.x + 650;
    boss.x += (targetX - boss.x) * 0.05;

    boss.attackTimer += dt;
    if (boss.attackTimer >= 2.2) {
      boss.attackTimer = 0;
      boss.attackPattern = (boss.attackPattern + 1) % 3;

      if (boss.attackPattern === 0) {
        // Shoot 3 spread projectiles
        sound.playBossWarning();
        for (let i = -1; i <= 1; i++) {
          this.projectiles.push({
            id: Math.random().toString(),
            x: boss.x,
            y: boss.y + boss.height / 2 + i * 20,
            vx: -7.0,
            vy: i * 1.5,
            radius: 8,
            color: '#ec4899',
            isDeflected: false,
            damage: 1,
          });
        }
      } else if (boss.attackPattern === 1) {
        // High-low laser burst
        sound.playBossWarning();
        this.projectiles.push({
          id: Math.random().toString(),
          x: boss.x,
          y: boss.y + boss.height / 2,
          vx: -9.5,
          vy: 0,
          radius: 12,
          color: '#f59e0b',
          isDeflected: false,
          damage: 1,
        });
      }
    }
  }

  public damageBoss(amount: number) {
    const boss = this.levelManager.boss;
    if (!boss) return;

    boss.hp -= amount;
    sound.playHit();
    this.addScreenShake(6);
    this.addHitStop(0.08);
    this.particleSystem.emitExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ec4899', 14);
    this.particleSystem.addFloatingText(`-${amount * 500}`, boss.x, boss.y - 20, '#f43f5e', 22);

    if (boss.hp <= 0) {
      // Boss Defeated!
      this.stats.bossesDefeated++;
      this.stats.score += 10000;
      this.stats.shardsCollected += 25;
      sound.playEnemyExplode();
      sound.setTrack(this.mode === 'zen' ? 'zen' : 'cyber');

      this.particleSystem.flash('#ffffff', 0.8, 0.03);
      this.particleSystem.emitExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#fbbf24', 40);
      this.particleSystem.addFloatingText('★ BOSS ANNIHILATED! +10,000 ★', boss.x - 50, boss.y - 40, '#fbbf24', 28);
      this.addScreenShake(14);

      this.levelManager.boss = null;
    }
  }

  // --- DAMAGE & GAME OVER ---

  public takeDamage(amount: number) {
    if (this.player.invincibleTimer > 0 || this.stats.isOverdrive || this.mode === 'zen') return;

    this.stats.shields -= amount;
    this.player.invincibleTimer = 1.2; // 1.2s mercy invulnerability
    sound.playHit();
    this.addScreenShake(8);
    this.particleSystem.flash('#ef4444', 0.4, 0.08);
    this.particleSystem.emitExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ef4444', 15);

    // Reset combo streak
    this.stats.combo = 0;
    this.stats.multiplier = 1;

    if (this.stats.shields <= 0) {
      this.triggerGameOver();
    }
  }

  public triggerGameOver() {
    this.isRunning = false;
    this.isGameOver = true;
    sound.stopRailSound();
    sound.stopMusic();
    sound.playGameOver();

    // Calculate Grade
    let grade: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' = 'C';
    if (this.stats.score > 30000) grade = 'SSS';
    else if (this.stats.score > 20000) grade = 'SS';
    else if (this.stats.score > 12000) grade = 'S';
    else if (this.stats.score > 6000) grade = 'A';
    else if (this.stats.score > 2500) grade = 'B';

    const result = StorageManager.recordRun(
      this.stats.score,
      this.mode,
      this.stats.distance,
      this.stats.maxCombo,
      this.stats.shardsCollected,
      this.stats.bossesDefeated,
      grade
    );

    this.callbacks.onGameOver({
      score: this.stats.score,
      distance: Math.floor(this.stats.distance),
      maxCombo: this.stats.maxCombo,
      shards: this.stats.shardsCollected,
      bossesDefeated: this.stats.bossesDefeated,
      grade,
      isNewHighScore: result.isNewHighScore,
    });
  }

  // --- COMBO & OVERDRIVE HELPERS ---

  public addCombo(amount: number, text: string = '', bonusScore: number = 0, x: number = 0, y: number = 0) {
    this.stats.combo += amount;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);
    this.stats.comboTimer = this.stats.comboMaxTimer;

    // Multiplier scaling: 1x, 2x, 4x, 8x, 16x
    if (this.stats.combo >= 25) this.stats.multiplier = 16;
    else if (this.stats.combo >= 15) this.stats.multiplier = 8;
    else if (this.stats.combo >= 8) this.stats.multiplier = 4;
    else if (this.stats.combo >= 3) this.stats.multiplier = 2;
    else this.stats.multiplier = 1;

    if (bonusScore > 0) {
      this.stats.score += bonusScore * this.stats.multiplier * (this.stats.isOverdrive ? 5 : 1);
    }

    if (text) {
      this.particleSystem.addFloatingText(text, x || this.player.x, (y || this.player.y) - 20, '#38bdf8', 16);
    }

    // High combo flavor badges
    if (this.stats.combo === 5) {
      this.particleSystem.addFloatingText('NICE! x2 MULTIPLIER', this.player.x, this.player.y - 40, '#06b6d4', 20);
    } else if (this.stats.combo === 10) {
      this.particleSystem.addFloatingText('RADICAL! x4 MULTIPLIER', this.player.x, this.player.y - 40, '#ec4899', 22);
    } else if (this.stats.combo === 20) {
      this.particleSystem.addFloatingText('★ UNSTOPPABLE! x8 ★', this.player.x, this.player.y - 40, '#fbbf24', 26);
    } else if (this.stats.combo === 30) {
      this.particleSystem.addFloatingText('⚡ GODLIKE! x16 MAX ⚡', this.player.x, this.player.y - 40, '#a855f7', 28);
    }
  }

  public chargeOverdrive(amount: number) {
    if (this.stats.isOverdrive) return;
    this.stats.overdriveCharge = Math.min(100, this.stats.overdriveCharge + amount);
    if (this.stats.overdriveCharge >= 100) {
      this.particleSystem.addFloatingText('⚡ OVERDRIVE READY! ⚡', this.player.x, this.player.y - 30, '#fbbf24', 18);
    }
  }

  public addScreenShake(intensity: number) {
    if (!this.settings.screenShake) return;
    this.shake.intensity = Math.min(25, this.shake.intensity + intensity * this.settings.shakeStrength);
  }

  public addHitStop(duration: number) {
    this.hitStopTimer = duration;
  }

  private updateScreenShake(dt: number) {
    if (this.shake.intensity > 0.1) {
      this.shake.x = (Math.random() - 0.5) * this.shake.intensity * 2;
      this.shake.y = (Math.random() - 0.5) * this.shake.intensity * 2;
      this.shake.rotation = (Math.random() - 0.5) * 0.02 * this.shake.intensity;
      this.shake.intensity = Math.max(0, this.shake.intensity - dt * 25);
    } else {
      this.shake = { x: 0, y: 0, rotation: 0, intensity: 0 };
    }
  }

  public togglePause(): boolean {
    if (this.isGameOver || !this.isRunning) return this.isPaused;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      sound.stopMusic();
      sound.stopRailSound();
    } else {
      sound.startMusic(this.stats.isOverdrive ? 'overdrive' : this.levelManager.boss ? 'boss' : this.mode === 'zen' ? 'zen' : 'cyber');
    }
    this.callbacks.onPauseChange(this.isPaused);
    return this.isPaused;
  }

  public setPaused(paused: boolean) {
    if (this.isGameOver || !this.isRunning) return;
    this.isPaused = paused;
    if (this.isPaused) {
      sound.stopMusic();
      sound.stopRailSound();
    } else {
      sound.startMusic(this.stats.isOverdrive ? 'overdrive' : this.levelManager.boss ? 'boss' : this.mode === 'zen' ? 'zen' : 'cyber');
    }
    this.callbacks.onPauseChange(this.isPaused);
  }

  private notifyHUD() {
    this.callbacks.onScoreUpdate(
      this.stats.score,
      this.stats.combo,
      this.stats.multiplier,
      this.stats.isOverdrive ? (this.stats.overdriveTimer / 8) * 100 : this.stats.overdriveCharge,
      this.stats.shields
    );
  }
}
