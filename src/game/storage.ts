import { HighScoreEntry, SkinOption, TrailOption, Achievement, GameSettings, GameMode } from '../types/game';

const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.8,
  musicVolume: 0.6,
  screenShake: true,
  shakeStrength: 1.0,
  particleQuality: 'high',
  touchControls: true,
  touchLayout: 'split',
  touchButtonScale: 1.0,
  showFps: false,
};

const DEFAULT_SKINS: SkinOption[] = [
  {
    id: 'sk_default',
    name: 'CYBER RUNNER',
    description: 'Standard issue prototype neon kinetic exo-suit.',
    price: 0,
    primaryColor: '#06b6d4',
    glowColor: '#38bdf8',
    trailColor: '#06b6d4',
    unlocked: true,
    suitClass: 'neon',
  },
  {
    id: 'sk_synth_pink',
    name: 'NEON PHANTOM',
    description: 'Hyper-tuned synthwave agility suit with chromatic trails.',
    price: 150,
    primaryColor: '#ec4899',
    glowColor: '#f43f5e',
    trailColor: '#ec4899',
    unlocked: false,
    suitClass: 'cyber',
  },
  {
    id: 'sk_solar',
    name: 'SOLAR SURGE',
    description: 'Blazing exo-frame forged in high-energy plasma.',
    price: 350,
    primaryColor: '#f59e0b',
    glowColor: '#fbbf24',
    trailColor: '#f59e0b',
    unlocked: false,
    suitClass: 'solar',
  },
  {
    id: 'sk_matrix',
    name: 'GLITCH MATRIX',
    description: 'Anomalous runner manifested from raw source code.',
    price: 600,
    primaryColor: '#10b981',
    glowColor: '#34d399',
    trailColor: '#10b981',
    unlocked: false,
    suitClass: 'matrix',
  },
  {
    id: 'sk_void',
    name: 'VOID REAPER',
    description: 'Shadow cloaked frame from the dark digital expanse.',
    price: 900,
    primaryColor: '#8b5cf6',
    glowColor: '#a855f7',
    trailColor: '#8b5cf6',
    unlocked: false,
    suitClass: 'void',
  },
  {
    id: 'sk_gold',
    name: 'GOLD SOVEREIGN',
    description: 'Pure gilded kinetic master frame. The pinnacle of speed.',
    price: 1500,
    primaryColor: '#fbbf24',
    glowColor: '#fef08a',
    trailColor: '#fbbf24',
    unlocked: false,
    suitClass: 'gold',
  },
];

const DEFAULT_TRAILS: TrailOption[] = [
  {
    id: 'trail_cyan',
    name: 'Cyan Ribbon',
    description: 'Classic high-velocity laser streamer.',
    price: 0,
    color: '#06b6d4',
    type: 'laser',
    unlocked: true,
  },
  {
    id: 'trail_rainbow',
    name: 'Prism Spectrum',
    description: 'Shifting chromatic rainbow light.',
    price: 200,
    color: '#ec4899',
    type: 'rainbow',
    unlocked: false,
  },
  {
    id: 'trail_plasma',
    name: 'Plasma Torch',
    description: 'Scorching fiery jet streams.',
    price: 400,
    color: '#f97316',
    type: 'plasma',
    unlocked: false,
  },
  {
    id: 'trail_lightning',
    name: 'Volt Arc',
    description: 'Crackling electric spark discharge.',
    price: 700,
    color: '#38bdf8',
    type: 'lightning',
    unlocked: false,
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    title: 'Kinetic Ignition',
    description: 'Complete your first run in SK.',
    icon: 'Zap',
    rewardShards: 50,
    progress: 0,
    target: 1,
    unlocked: false,
  },
  {
    id: 'combo_10',
    title: 'Flow State',
    description: 'Achieve a 10x Combo streak.',
    icon: 'Flame',
    rewardShards: 100,
    progress: 0,
    target: 10,
    unlocked: false,
  },
  {
    id: 'combo_25',
    title: 'Unstoppable Momentum',
    description: 'Achieve a 25x Combo streak.',
    icon: 'Award',
    rewardShards: 250,
    progress: 0,
    target: 25,
    unlocked: false,
  },
  {
    id: 'distance_1000',
    title: 'Kilometer Glide',
    description: 'Travel 1,000 meters in a single run.',
    icon: 'Compass',
    rewardShards: 150,
    progress: 0,
    target: 1000,
    unlocked: false,
  },
  {
    id: 'distance_3000',
    title: 'Skyline Legend',
    description: 'Travel 3,000 meters in a single run.',
    icon: 'Trophy',
    rewardShards: 400,
    progress: 0,
    target: 3000,
    unlocked: false,
  },
  {
    id: 'shards_500',
    title: 'Shard Harvester',
    description: 'Collect a total of 500 Shards.',
    icon: 'Gem',
    rewardShards: 200,
    progress: 0,
    target: 500,
    unlocked: false,
  },
  {
    id: 'boss_defeat_1',
    title: 'Vortex Breaker',
    description: 'Defeat your first Boss encounter.',
    icon: 'Crosshair',
    rewardShards: 300,
    progress: 0,
    target: 1,
    unlocked: false,
  },
  {
    id: 'overdrive_5',
    title: 'Hyper Driver',
    description: 'Trigger Overdrive 5 times.',
    icon: 'Activity',
    rewardShards: 150,
    progress: 0,
    target: 5,
    unlocked: false,
  },
];

export class StorageManager {
  private static STORAGE_KEY = 'SK_GAME_DATA_V1';

  public static loadData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          highScores: parsed.highScores || [],
          shardsBank: parsed.shardsBank ?? 0,
          equippedSkin: parsed.equippedSkin || 'sk_default',
          equippedTrail: parsed.equippedTrail || 'trail_cyan',
          skins: parsed.skins || DEFAULT_SKINS,
          trails: parsed.trails || DEFAULT_TRAILS,
          achievements: parsed.achievements || DEFAULT_ACHIEVEMENTS,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          stats: parsed.stats || {
            totalRuns: 0,
            totalDistance: 0,
            totalShards: 0,
            maxCombo: 0,
            bossesDefeated: 0,
            overdriveCount: 0,
          },
        };
      }
    } catch {
      // Fallback
    }

    return {
      highScores: [
        { id: '1', name: 'NEXUS_9', score: 25400, mode: 'endless' as GameMode, distance: 2150, maxCombo: 24, shards: 180, grade: 'SSS' as const, date: '2026-03-28' },
        { id: '2', name: 'CYBER_KID', score: 18200, mode: 'endless' as GameMode, distance: 1620, maxCombo: 18, shards: 120, grade: 'SS' as const, date: '2026-03-27' },
        { id: '3', name: 'GLITCH_RUNNER', score: 12900, mode: 'endless' as GameMode, distance: 1140, maxCombo: 14, shards: 85, grade: 'S' as const, date: '2026-03-26' },
        { id: '4', name: 'BLADE_VIPER', score: 8700, mode: 'endless' as GameMode, distance: 820, maxCombo: 9, shards: 60, grade: 'A' as const, date: '2026-03-25' },
      ] as HighScoreEntry[],
      shardsBank: 50,
      equippedSkin: 'sk_default',
      equippedTrail: 'trail_cyan',
      skins: DEFAULT_SKINS,
      trails: DEFAULT_TRAILS,
      achievements: DEFAULT_ACHIEVEMENTS,
      settings: DEFAULT_SETTINGS,
      stats: {
        totalRuns: 0,
        totalDistance: 0,
        totalShards: 0,
        maxCombo: 0,
        bossesDefeated: 0,
        overdriveCount: 0,
      },
    };
  }

  public static saveData(data: ReturnType<typeof StorageManager.loadData>) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  public static recordRun(
    score: number,
    mode: GameMode,
    distance: number,
    maxCombo: number,
    shards: number,
    bossesDefeated: number,
    grade: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C'
  ) {
    const data = this.loadData();
    data.shardsBank += shards;

    // Record high score
    const newEntry: HighScoreEntry = {
      id: Math.random().toString(),
      name: 'YOU',
      score,
      mode,
      distance: Math.floor(distance),
      maxCombo,
      shards,
      grade,
      date: new Date().toISOString().split('T')[0],
    };

    data.highScores.push(newEntry);
    data.highScores.sort((a: HighScoreEntry, b: HighScoreEntry) => b.score - a.score);
    // Keep top 20
    data.highScores = data.highScores.slice(0, 20);

    // Update stats
    data.stats.totalRuns++;
    data.stats.totalDistance += Math.floor(distance);
    data.stats.totalShards += shards;
    data.stats.maxCombo = Math.max(data.stats.maxCombo, maxCombo);
    data.stats.bossesDefeated += bossesDefeated;

    // Check achievements
    for (const ach of data.achievements) {
      if (ach.unlocked) continue;
      if (ach.id === 'first_run') {
        ach.progress = data.stats.totalRuns;
      } else if (ach.id === 'combo_10' || ach.id === 'combo_25') {
        ach.progress = Math.max(ach.progress, maxCombo);
      } else if (ach.id === 'distance_1000' || ach.id === 'distance_3000') {
        ach.progress = Math.max(ach.progress, Math.floor(distance));
      } else if (ach.id === 'shards_500') {
        ach.progress = data.stats.totalShards;
      } else if (ach.id === 'boss_defeat_1') {
        ach.progress = data.stats.bossesDefeated;
      }

      if (ach.progress >= ach.target && !ach.unlocked) {
        ach.unlocked = true;
        data.shardsBank += ach.rewardShards;
      }
    }

    this.saveData(data);
    return { data, isNewHighScore: data.highScores[0]?.id === newEntry.id };
  }
}
