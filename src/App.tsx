import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';
import { sound } from './game/audio';
import { StorageManager } from './game/storage';
import { GameMode, GameSettings, SkinOption, TrailOption } from './types/game';

// UI Components
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CosmeticsModal } from './components/CosmeticsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const reqAnimRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // App State
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'gameover'>('start');
  const [selectedMode, setSelectedMode] = useState<GameMode>('endless');
  const [activeModal, setActiveModal] = useState<
    'none' | 'leaderboard' | 'cosmetics' | 'achievements' | 'howtoplay' | 'settings'
  >('none');

  // Persistence State
  const [storageData, setStorageData] = useState(() => StorageManager.loadData());
  const [isMuted, setIsMuted] = useState(false);

  // HUD Realtime State
  const [hudData, setHudData] = useState({
    score: 0,
    combo: 0,
    multiplier: 1,
    overdriveCharge: 0,
    shields: 3,
    distance: 0,
    timeRemaining: 60,
    isOverdrive: false,
  });

  // Game Over Run Summary State
  const [gameOverData, setGameOverData] = useState<{
    score: number;
    distance: number;
    maxCombo: number;
    shards: number;
    bossesDefeated: number;
    grade: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C';
    isNewHighScore: boolean;
  } | null>(null);

  // FPS Counter
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);

  // Touch gesture state
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Initialize Game Engine
  useEffect(() => {
    const data = StorageManager.loadData();
    setStorageData(data);
    sound.setVolumes(data.settings.soundVolume, data.settings.musicVolume);

    const engine = new GameEngine({
      onScoreUpdate: (score, combo, multiplier, overdrive, shields) => {
        setHudData((prev) => ({
          ...prev,
          score,
          combo,
          multiplier,
          overdriveCharge: overdrive,
          shields,
          distance: engine.stats.distance,
          timeRemaining: engine.stats.timeRemaining,
          isOverdrive: engine.stats.isOverdrive,
        }));
      },
      onGameOver: (runData) => {
        setGameOverData(runData);
        setGameState('gameover');
        setStorageData(StorageManager.loadData());
      },
      onPauseChange: (isPaused) => {
        if (isPaused) {
          setGameState('paused');
        } else {
          setGameState('playing');
        }
      },
    });

    engineRef.current = engine;

    return () => {
      if (reqAnimRef.current) {
        cancelAnimationFrame(reqAnimRef.current);
      }
      sound.stopMusic();
      sound.stopRailSound();
    };
  }, []);

  // Handle Resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    if (rendererRef.current) {
      rendererRef.current.resize(width, height);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx, canvas.width, canvas.height);

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Calculate FPS
      frameCountRef.current++;
      if (timestamp - lastFpsUpdateRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = timestamp;
      }

      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (engine && renderer) {
        // Poll Gamepad API
        pollGamepad(engine);

        // Update Physics
        engine.update(dt);

        // Camera Follows Player
        const cameraX = engine.player.x - 180;

        // Render Scene
        renderer.render(
          cameraX,
          {
            x: engine.player.x,
            y: engine.player.y,
            width: engine.player.width,
            height: engine.player.height,
            state: engine.player.state,
            velY: engine.player.velY,
            isGrounded: engine.player.isGrounded,
            overdrive: engine.stats.isOverdrive,
            shields: engine.stats.shields,
            skin: engine.player.skin,
            combo: engine.stats.combo,
          },
          engine.levelManager.platforms,
          engine.levelManager.rails,
          engine.levelManager.hazards,
          engine.levelManager.pickups,
          engine.projectiles,
          engine.levelManager.boss,
          engine.particleSystem,
          engine.shake,
          engine.gameTime,
          engine.player.velX / 7.0
        );
      }

      reqAnimRef.current = requestAnimationFrame(gameLoop);
    };

    reqAnimRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (reqAnimRef.current) {
        cancelAnimationFrame(reqAnimRef.current);
      }
    };
  }, []);

  // Gamepad Controller Polling
  const pollGamepad = (engine: GameEngine) => {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];
    if (!gp) return;

    // A button or D-pad Up (Jump)
    if (gp.buttons[0]?.pressed || gp.buttons[12]?.pressed) {
      engine.handleJump();
    }
    // B button or D-pad Down (Slide)
    if (gp.buttons[1]?.pressed || gp.buttons[13]?.pressed) {
      engine.handleSlide();
    }
    // X button or Right Bumper (Slash)
    if (gp.buttons[2]?.pressed || gp.buttons[5]?.pressed) {
      engine.handleSlash();
    }
    // Y button or Left Bumper (Overdrive)
    if (gp.buttons[3]?.pressed || gp.buttons[4]?.pressed) {
      engine.handleOverdrive();
    }
    // Start / Pause button
    if (gp.buttons[9]?.pressed) {
      engine.togglePause();
    }
  };

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      // Start Screen controls
      if (gameState === 'start' && activeModal === 'none') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          startGame();
          return;
        }
      }

      // Game Over Screen restart
      if (gameState === 'gameover') {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyR') {
          e.preventDefault();
          startGame();
          return;
        }
      }

      // Pause toggle
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'paused') {
          engine.togglePause();
        }
        return;
      }

      if (gameState === 'paused' && e.code === 'KeyR') {
        e.preventDefault();
        startGame();
        return;
      }

      if (gameState !== 'playing') return;

      // Gameplay Action Keys
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        e.preventDefault();
        engine.handleJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        engine.handleSlide();
      } else if (
        e.code === 'ShiftLeft' ||
        e.code === 'ShiftRight' ||
        e.code === 'KeyJ' ||
        e.code === 'KeyX' ||
        e.code === 'KeyF'
      ) {
        e.preventDefault();
        engine.handleSlash();
      } else if (e.code === 'KeyE' || e.code === 'KeyK') {
        e.preventDefault();
        engine.handleOverdrive();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeModal, selectedMode]);

  // Touch Gesture Listeners (for direct canvas swipes)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (gameState !== 'playing' || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const engine = engineRef.current;
    if (!engine) return;

    if (dt < 350) {
      if (absY > 30 && absY > absX) {
        // Vertical Swipe
        if (dy < 0) {
          engine.handleJump();
        } else {
          engine.handleSlide();
        }
      } else if (absX > 30 && dx > 0) {
        // Swipe Right (Slash)
        engine.handleSlash();
      }
    }
    touchStartRef.current = null;
  };

  // Actions
  const startGame = () => {
    sound.init();
    const engine = engineRef.current;
    if (!engine) return;

    engine.init(selectedMode);
    setGameState('playing');
    setActiveModal('none');
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    const current = StorageManager.loadData();
    const updated = { ...current.settings, ...newSettings };
    current.settings = updated;
    StorageManager.saveData(current);
    setStorageData(current);

    if (newSettings.soundVolume !== undefined || newSettings.musicVolume !== undefined) {
      sound.setVolumes(updated.soundVolume, updated.musicVolume);
    }
    if (engineRef.current) {
      engineRef.current.settings = updated;
    }
  };

  const handleEquipSkin = (skinId: string) => {
    const data = StorageManager.loadData();
    data.equippedSkin = skinId;
    StorageManager.saveData(data);
    setStorageData(data);
    if (engineRef.current) {
      engineRef.current.player.skin = data.skins.find((s: SkinOption) => s.id === skinId) || data.skins[0];
    }
  };

  const handleEquipTrail = (trailId: string) => {
    const data = StorageManager.loadData();
    data.equippedTrail = trailId;
    StorageManager.saveData(data);
    setStorageData(data);
  };

  const handleBuySkin = (skinId: string) => {
    const data = StorageManager.loadData();
    const skin = data.skins.find((s: SkinOption) => s.id === skinId);
    if (skin && data.shardsBank >= skin.price) {
      data.shardsBank -= skin.price;
      skin.unlocked = true;
      data.equippedSkin = skinId;
      StorageManager.saveData(data);
      setStorageData(data);
      if (engineRef.current) {
        engineRef.current.player.skin = skin;
      }
    }
  };

  const handleBuyTrail = (trailId: string) => {
    const data = StorageManager.loadData();
    const trail = data.trails.find((t: TrailOption) => t.id === trailId);
    if (trail && data.shardsBank >= trail.price) {
      data.shardsBank -= trail.price;
      trail.unlocked = true;
      data.equippedTrail = trailId;
      StorageManager.saveData(data);
      setStorageData(data);
    }
  };

  const handleClearScores = () => {
    const data = StorageManager.loadData();
    data.highScores = [];
    StorageManager.saveData(data);
    setStorageData(data);
  };

  const bestScore = storageData.highScores[0]?.score || 0;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 2D Canvas Viewport */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />

      {/* FPS Counter */}
      {storageData.settings.showFps && (
        <div className="absolute top-2 left-2 z-40 bg-slate-950/80 px-2 py-1 rounded text-[10px] font-code text-cyan-400 border border-cyan-500/30 pointer-events-none">
          {fps} FPS
        </div>
      )}

      {/* In-Game HUD */}
      {gameState === 'playing' && (
        <HUD
          score={hudData.score}
          combo={hudData.combo}
          multiplier={hudData.multiplier}
          overdriveCharge={hudData.overdriveCharge}
          shields={hudData.shields}
          distance={hudData.distance}
          mode={selectedMode}
          timeRemaining={hudData.timeRemaining}
          isMuted={isMuted}
          isOverdrive={hudData.isOverdrive}
          onToggleMute={handleToggleMute}
          onPause={() => engineRef.current?.togglePause()}
          onJump={() => engineRef.current?.handleJump()}
          onSlide={() => engineRef.current?.handleSlide()}
          onSlash={() => engineRef.current?.handleSlash()}
          onOverdrive={() => engineRef.current?.handleOverdrive()}
          touchControls={storageData.settings.touchControls}
        />
      )}

      {/* Start Screen */}
      {gameState === 'start' && activeModal === 'none' && (
        <StartScreen
          selectedMode={selectedMode}
          onSelectMode={(mode) => setSelectedMode(mode)}
          onStartGame={startGame}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onOpenCosmetics={() => setActiveModal('cosmetics')}
          onOpenAchievements={() => setActiveModal('achievements')}
          onOpenHowToPlay={() => setActiveModal('howtoplay')}
          onOpenSettings={() => setActiveModal('settings')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          highScore={bestScore}
          shardsBank={storageData.shardsBank}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => engineRef.current?.setPaused(false)}
          onRestart={startGame}
          onHome={() => {
            engineRef.current?.setPaused(false);
            setGameState('start');
            sound.stopMusic();
            sound.stopRailSound();
          }}
          settings={storageData.settings}
          onUpdateSettings={handleUpdateSettings}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && gameOverData && (
        <GameOverModal
          runData={gameOverData}
          mode={selectedMode}
          onRestart={startGame}
          onHome={() => {
            setGameState('start');
            sound.stopMusic();
            sound.stopRailSound();
          }}
        />
      )}

      {/* Modals from Start Screen */}
      {activeModal === 'leaderboard' && (
        <LeaderboardModal
          highScores={storageData.highScores}
          onClose={() => setActiveModal('none')}
          onClearScores={handleClearScores}
        />
      )}

      {activeModal === 'cosmetics' && (
        <CosmeticsModal
          skins={storageData.skins}
          trails={storageData.trails}
          equippedSkin={storageData.equippedSkin}
          equippedTrail={storageData.equippedTrail}
          shardsBank={storageData.shardsBank}
          onEquipSkin={handleEquipSkin}
          onEquipTrail={handleEquipTrail}
          onBuySkin={handleBuySkin}
          onBuyTrail={handleBuyTrail}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'achievements' && (
        <AchievementsModal
          achievements={storageData.achievements}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'howtoplay' && (
        <HowToPlayModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={storageData.settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
