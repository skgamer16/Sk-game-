export type GameMode = 'endless' | 'rush60' | 'boss_rush' | 'zen';

export type PlayerState = 
  | 'RUNNING'
  | 'JUMPING'
  | 'DOUBLE_JUMPING'
  | 'SLIDING'
  | 'AIR_DASHING'
  | 'RAIL_GRINDING'
  | 'HURT'
  | 'DEAD';

export type HazardType = 
  | 'laser_spike'      // Jump over
  | 'plasma_barrier'   // High obstacle, jump over
  | 'low_beam'         // Low beam, slide under
  | 'trip_laser'       // Slide under
  | 'hover_drone'      // Hovering drone, can be slashed or jumped
  | 'turret_drone'     // Shoots slow projectiles that can be parried or dodged
  | 'shock_mine'       // Explodes if slashed without overdrive
  | 'energy_wall';     // Destructible with Air-Dash / Overdrive

export type PickupType = 
  | 'shard'            // +Score & Overdrive charge
  | 'hyper_shard'      // +5x Score & massive Overdrive
  | 'shield'           // Restores 1 shield
  | 'multiplier_orb'   // Multiplier boost
  | 'magnet'           // Shard magnet for 8s
  | 'boost_pad';       // Instant speed burst

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'neon_grid' | 'glass';
  hasRamp?: boolean;
  rampAngle?: number;
}

export interface Rail {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export interface Hazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: HazardType;
  hp?: number;
  active: boolean;
  speedY?: number;
  initialY?: number;
  animationPhase?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isDeflected: boolean;
  damage: number;
}

export interface Pickup {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: PickupType;
  collected: boolean;
  pulsePhase: number;
}

export interface Boss {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  state: 'entering' | 'attacking' | 'vulnerable' | 'defeated';
  attackTimer: number;
  attackPattern: number;
  defeatedTimer?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  vy: number;
  scale: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark' | 'ring' | 'line';
  rotation?: number;
  vRot?: number;
}

export interface PlayerStats {
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
  multiplier: number;
  distance: number;
  shardsCollected: number;
  enemiesDefeated: number;
  bossesDefeated: number;
  overdriveCharge: number; // 0 to 100
  isOverdrive: boolean;
  overdriveTimer: number;
  shields: number;
  maxShields: number;
  speed: number;
  magnetTimer: number;
}

export interface HighScoreEntry {
  id: string;
  name: string;
  score: number;
  mode: GameMode;
  distance: number;
  maxCombo: number;
  shards: number;
  grade: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C';
  date: string;
}

export interface SkinOption {
  id: string;
  name: string;
  description: string;
  price: number;
  primaryColor: string;
  glowColor: string;
  trailColor: string;
  unlocked: boolean;
  suitClass: 'neon' | 'cyber' | 'void' | 'solar' | 'matrix' | 'gold';
}

export interface TrailOption {
  id: string;
  name: string;
  description: string;
  price: number;
  color: string;
  type: 'laser' | 'rainbow' | 'plasma' | 'glitch' | 'lightning' | 'sakura';
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardShards: number;
  progress: number;
  target: number;
  unlocked: boolean;
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  screenShake: boolean;
  shakeStrength: number; // 0.5 to 1.5
  particleQuality: 'low' | 'medium' | 'high';
  touchControls: boolean;
  touchLayout: 'split' | 'right-cluster' | 'left-cluster';
  touchButtonScale: number;
  showFps: boolean;
}
