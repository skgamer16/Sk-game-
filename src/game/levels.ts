import { Platform, Rail, Hazard, Pickup, Boss, GameMode } from '../types/game';

export class LevelManager {
  public platforms: Platform[] = [];
  public rails: Rail[] = [];
  public hazards: Hazard[] = [];
  public pickups: Pickup[] = [];
  public boss: Boss | null = null;
  
  public nextSpawnX: number = 0;
  public bossEncounterDistance: number = 800; // First boss at 800m
  public bossCount: number = 0;

  // Track height baseline
  private readonly BASE_Y = 480;

  constructor() {
    this.reset();
  }

  public reset(mode: GameMode = 'endless') {
    this.platforms = [];
    this.rails = [];
    this.hazards = [];
    this.pickups = [];
    this.boss = null;
    this.nextSpawnX = 0;
    this.bossCount = 0;
    this.bossEncounterDistance = mode === 'boss_rush' ? 100 : 800;

    // Initial safe runway
    this.platforms.push({
      x: -200,
      y: this.BASE_Y,
      width: 1400,
      height: 200,
      type: 'neon_grid',
    });

    this.nextSpawnX = 1200;

    // Spawn initial starter shards
    for (let i = 0; i < 8; i++) {
      this.pickups.push({
        id: `start_shard_${i}`,
        x: 400 + i * 70,
        y: this.BASE_Y - 40,
        radius: 10,
        type: 'shard',
        collected: false,
        pulsePhase: i * 0.4,
      });
    }

    if (mode === 'boss_rush') {
      this.spawnBoss();
    }
  }

  public update(playerX: number, distance: number, mode: GameMode) {
    // Generate new segments ahead of player
    while (this.nextSpawnX < playerX + 1600) {
      this.generateChunk(distance);
    }

    // Boss trigger check (Endless mode)
    if (mode === 'endless' && !this.boss && distance >= this.bossEncounterDistance) {
      this.spawnBoss();
      this.bossEncounterDistance += 1200 + this.bossCount * 400;
    }

    // Clean up passed objects behind camera
    const cleanX = playerX - 600;
    this.platforms = this.platforms.filter(p => p.x + p.width > cleanX);
    this.rails = this.rails.filter(r => Math.max(r.x1, r.x2) > cleanX);
    this.hazards = this.hazards.filter(h => h.x + h.width > cleanX && h.active);
    this.pickups = this.pickups.filter(p => p.x + p.radius > cleanX && !p.collected);
  }

  private generateChunk(distance: number) {
    const chunkWidth = 600 + Math.random() * 300;
    const currentX = this.nextSpawnX;
    
    // Difficulty escalates with distance
    const difficulty = Math.min(3, 1 + distance / 1500);

    // Platform generation
    const gapSize = Math.random() > 0.4 ? 120 + Math.random() * 100 : 0;
    const startX = currentX + gapSize;
    const pWidth = chunkWidth - gapSize;
    const platformY = this.BASE_Y;

    this.platforms.push({
      x: startX,
      y: platformY,
      width: pWidth,
      height: 200,
      type: Math.random() > 0.5 ? 'neon_grid' : 'solid',
    });

    // Patterns
    const patternType = Math.floor(Math.random() * 6);

    switch (patternType) {
      case 0: // Rail grind section with airborne shards
        this.spawnRailSection(startX, platformY);
        break;

      case 1: // Low beam slide obstacle + speed pads
        this.spawnSlideSection(startX, platformY);
        break;

      case 2: // Drone air combat corridor
        this.spawnDroneSection(startX, platformY, difficulty);
        break;

      case 3: // High-low obstacle mix
        this.spawnMixedSection(startX, platformY);
        break;

      case 4: // Shard cascade with speed pads & boost
        this.spawnBoostShardCascade(startX, platformY);
        break;

      case 5: // Laser hurdles + parry drone
        this.spawnTurretChallenge(startX, platformY);
        break;
    }

    this.nextSpawnX = startX + pWidth;
  }

  private spawnRailSection(startX: number, baseY: number) {
    const railY = baseY - 140;
    const railLen = 420;
    
    this.rails.push({
      x1: startX + 60,
      y1: railY,
      x2: startX + 60 + railLen,
      y2: railY,
      color: '#06b6d4',
    });

    // Shards along the rail
    for (let i = 0; i < 6; i++) {
      this.pickups.push({
        id: `rail_shard_${Math.random()}`,
        x: startX + 90 + i * 65,
        y: railY - 25,
        radius: 10,
        type: i === 5 && Math.random() > 0.5 ? 'hyper_shard' : 'shard',
        collected: false,
        pulsePhase: i * 0.5,
      });
    }

    // Hazard underneath rail so you MUST rail grind or jump over
    this.hazards.push({
      id: `ground_laser_${Math.random()}`,
      x: startX + 180,
      y: baseY - 35,
      width: 140,
      height: 35,
      type: 'laser_spike',
      active: true,
    });
  }

  private spawnSlideSection(startX: number, baseY: number) {
    // Low beam barrier
    this.hazards.push({
      id: `low_beam_${Math.random()}`,
      x: startX + 180,
      y: baseY - 120,
      width: 90,
      height: 75,
      type: 'low_beam',
      active: true,
    });

    // Shards under the slide
    for (let i = 0; i < 4; i++) {
      this.pickups.push({
        id: `slide_shard_${Math.random()}`,
        x: startX + 160 + i * 40,
        y: baseY - 20,
        radius: 9,
        type: 'shard',
        collected: false,
        pulsePhase: i * 0.3,
      });
    }

    // Boost pad after the slide
    this.pickups.push({
      id: `boost_${Math.random()}`,
      x: startX + 360,
      y: baseY - 15,
      radius: 14,
      type: 'boost_pad',
      collected: false,
      pulsePhase: 0,
    });
  }

  private spawnDroneSection(startX: number, baseY: number, difficulty: number) {
    const droneCount = Math.min(3, Math.floor(difficulty));
    for (let i = 0; i < droneCount; i++) {
      this.hazards.push({
        id: `drone_${Math.random()}`,
        x: startX + 160 + i * 140,
        y: baseY - 90 - (i % 2) * 50,
        width: 38,
        height: 32,
        type: 'hover_drone',
        hp: 1,
        active: true,
        speedY: (i % 2 === 0 ? 1 : -1) * 1.5,
        initialY: baseY - 90 - (i % 2) * 50,
        animationPhase: i * 1.2,
      });
    }

    // Multiplier or Shield reward behind drones
    if (Math.random() > 0.6) {
      this.pickups.push({
        id: `powerup_${Math.random()}`,
        x: startX + 160 + droneCount * 140 + 50,
        y: baseY - 100,
        radius: 12,
        type: Math.random() > 0.5 ? 'multiplier_orb' : 'shield',
        collected: false,
        pulsePhase: 0,
      });
    }
  }

  private spawnMixedSection(startX: number, baseY: number) {
    // Jump hurdle
    this.hazards.push({
      id: `spike_${Math.random()}`,
      x: startX + 120,
      y: baseY - 45,
      width: 40,
      height: 45,
      type: 'laser_spike',
      active: true,
    });

    // Shards arc over hurdle
    for (let i = 0; i < 5; i++) {
      const arcY = baseY - 80 - Math.sin((i / 4) * Math.PI) * 60;
      this.pickups.push({
        id: `arc_shard_${Math.random()}`,
        x: startX + 80 + i * 40,
        y: arcY,
        radius: 9,
        type: 'shard',
        collected: false,
        pulsePhase: i * 0.4,
      });
    }

    // Followed by slide beam
    this.hazards.push({
      id: `mix_beam_${Math.random()}`,
      x: startX + 320,
      y: baseY - 110,
      width: 80,
      height: 65,
      type: 'low_beam',
      active: true,
    });
  }

  private spawnBoostShardCascade(startX: number, baseY: number) {
    this.pickups.push({
      id: `magnet_${Math.random()}`,
      x: startX + 80,
      y: baseY - 40,
      radius: 14,
      type: 'magnet',
      collected: false,
      pulsePhase: 0,
    });

    // Large chain of shards
    for (let i = 0; i < 8; i++) {
      this.pickups.push({
        id: `cascade_shard_${Math.random()}`,
        x: startX + 140 + i * 45,
        y: baseY - 40,
        radius: 10,
        type: i === 7 ? 'hyper_shard' : 'shard',
        collected: false,
        pulsePhase: i * 0.2,
      });
    }
  }

  private spawnTurretChallenge(startX: number, baseY: number) {
    this.hazards.push({
      id: `turret_${Math.random()}`,
      x: startX + 240,
      y: baseY - 80,
      width: 45,
      height: 40,
      type: 'turret_drone',
      hp: 2,
      active: true,
      initialY: baseY - 80,
      animationPhase: 0,
    });

    // Jump pad in front
    this.pickups.push({
      id: `boost_pad_${Math.random()}`,
      x: startX + 120,
      y: baseY - 12,
      radius: 14,
      type: 'boost_pad',
      collected: false,
      pulsePhase: 0,
    });
  }

  public spawnBoss() {
    this.bossCount++;
    const bossNames = ['CHRONO VORTEX', 'TITAN NEXUS', 'CYBER LEVIATHAN', 'VOID REAPER'];
    const name = bossNames[(this.bossCount - 1) % bossNames.length];
    
    this.boss = {
      name: `${name} MK-${this.bossCount}`,
      x: 1000,
      y: 200,
      width: 130,
      height: 90,
      hp: 10 + this.bossCount * 4,
      maxHp: 10 + this.bossCount * 4,
      state: 'entering',
      attackTimer: 0,
      attackPattern: 0,
    };
  }
}
