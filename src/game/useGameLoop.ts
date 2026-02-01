import { useRef, useCallback, useEffect, useState } from 'react';
import { GameState, TouchControls, Platform, Player } from './types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  JUMP_FORCE,
  SUPER_JUMP_FORCE,
  MAX_FALL_SPEED,
  MOVE_SPEED,
  MAX_SPEED,
  FRICTION,
  AIR_FRICTION,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLATFORM_HEIGHT,
  MIN_PLATFORM_WIDTH,
  MAX_PLATFORM_WIDTH,
  PLATFORM_GAP_MIN,
  PLATFORM_GAP_MAX,
  FLOOR_HEIGHT,
  CAMERA_THRESHOLD,
  COMBO_TIMEOUT,
  COMBO_MULTIPLIER,
} from './constants';
import {
  playJumpSound,
  playSuperJumpSound,
  playLandSound,
  playScoreSound,
  playComboSound,
  playGameOverSound,
  initAudio,
} from '@/lib/sounds';

const generatePlatforms = (startFloor: number, count: number, existingPlatforms: Platform[] = []): Platform[] => {
  const platforms: Platform[] = [...existingPlatforms];

  // Find the highest (smallest Y) platform or start from floor
  let currentY = startFloor === 0
    ? GAME_HEIGHT - FLOOR_HEIGHT - 80
    : existingPlatforms.length > 0
      ? Math.min(...existingPlatforms.map(p => p.y))
      : GAME_HEIGHT - FLOOR_HEIGHT - 80;

  for (let i = 0; i < count; i++) {
    const floor = startFloor + i;
    const width = MIN_PLATFORM_WIDTH + Math.random() * (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH);
    const x = Math.random() * (GAME_WIDTH - width);
    const gap = PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
    currentY -= gap;

    platforms.push({
      id: Date.now() + i + Math.random(),
      x,
      y: currentY,
      width,
      floor: floor + 1,
    });
  }

  return platforms;
};

const createInitialState = (): GameState => {
  const platforms = generatePlatforms(0, 20);

  return {
    player: {
      x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
      // Player Y is in WORLD coordinates (not screen coordinates)
      y: GAME_HEIGHT - FLOOR_HEIGHT - PLAYER_HEIGHT,
      vx: 0,
      vy: 0,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      isJumping: false,
      isFalling: false,
      direction: 'idle',
      combo: 0,
      lastFloor: 0,
    },
    platforms,
    cameraY: 0, // Camera offset - positive means we've scrolled up
    score: 0,
    highScore: parseInt(localStorage.getItem('icyTowerHighScore') || '0'),
    floor: 0,
    gameOver: false,
    isPlaying: false,
    combo: 0,
    comboTimer: 0,
  };
};

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const gameStateRef = useRef<GameState>(gameState);
  const controlsRef = useRef<TouchControls>({ left: false, right: false, jump: false });
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const jumpPressedRef = useRef(false);

  const setControls = useCallback((controls: Partial<TouchControls>) => {
    controlsRef.current = { ...controlsRef.current, ...controls };
  }, []);

  const startGame = useCallback(() => {
    initAudio();
    lastTimeRef.current = 0;
    jumpPressedRef.current = false;
    const highScore = gameStateRef.current.highScore;
    const newState = {
      ...createInitialState(),
      highScore,
      isPlaying: true,
    };
    gameStateRef.current = newState;
    setGameState(newState);
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
    lastTimeRef.current = timestamp;

    const prev = gameStateRef.current;
    if (!prev.isPlaying || prev.gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const controls = controlsRef.current;
    let { player, platforms, cameraY, score, floor, combo, comboTimer } = prev;

    // Create new player state
    let newPlayer: Player = { ...player };

    // Sound events for this frame
    let soundJump = false;
    let soundSuperJump = false;
    let soundLand = false;
    let soundScore = false;
    let soundCombo = 0;
    let soundGameOver = false;

    // Handle horizontal movement
    if (controls.left) {
      newPlayer.vx -= MOVE_SPEED * deltaTime;
      newPlayer.direction = 'left';
    } else if (controls.right) {
      newPlayer.vx += MOVE_SPEED * deltaTime;
      newPlayer.direction = 'right';
    } else {
      newPlayer.direction = 'idle';
    }

    // Apply friction
    const friction = newPlayer.isJumping ? AIR_FRICTION : FRICTION;
    newPlayer.vx *= Math.pow(friction, deltaTime);

    // Clamp horizontal speed
    newPlayer.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, newPlayer.vx));

    // Handle jumping - only when on ground/platform
    if (controls.jump && !newPlayer.isJumping && !jumpPressedRef.current) {
      const speed = Math.abs(newPlayer.vx);
      // Higher speed = higher jump
      const isSuper = speed > MAX_SPEED * 0.7;
      const jumpForce = isSuper ? SUPER_JUMP_FORCE : JUMP_FORCE;
      newPlayer.vy = jumpForce;
      newPlayer.isJumping = true;
      jumpPressedRef.current = true;
      if (isSuper) {
        soundSuperJump = true;
      } else {
        soundJump = true;
      }
    }

    if (!controls.jump) {
      jumpPressedRef.current = false;
    }

    // Apply gravity
    newPlayer.vy += GRAVITY * deltaTime;
    newPlayer.vy = Math.min(newPlayer.vy, MAX_FALL_SPEED);

    // Update position (in world coordinates)
    newPlayer.x += newPlayer.vx * deltaTime;
    newPlayer.y += newPlayer.vy * deltaTime;

    // Screen wrapping (horizontal)
    if (newPlayer.x + newPlayer.width < 0) {
      newPlayer.x = GAME_WIDTH;
    } else if (newPlayer.x > GAME_WIDTH) {
      newPlayer.x = -newPlayer.width;
    }

    // Floor collision (world coordinates)
    const floorWorldY = GAME_HEIGHT - FLOOR_HEIGHT - newPlayer.height;
    if (newPlayer.y >= floorWorldY && newPlayer.vy >= 0) {
      newPlayer.y = floorWorldY;
      newPlayer.vy = 0;
      newPlayer.isJumping = false;
      newPlayer.isFalling = false;
      combo = 0;
      comboTimer = 0;
      newPlayer.lastFloor = 0;
    }

    // Platform collision (all in world coordinates)
    let landedFloor = 0;
    for (const platform of platforms) {
      const playerBottom = newPlayer.y + newPlayer.height;
      const playerTop = newPlayer.y;
      const platformTop = platform.y;
      const platformBottom = platform.y + PLATFORM_HEIGHT;

      // Check horizontal overlap
      const horizontalOverlap =
        newPlayer.x + newPlayer.width > platform.x &&
        newPlayer.x < platform.x + platform.width;

      // Check if player is falling and feet are at platform level
      if (
        newPlayer.vy > 0 &&
        horizontalOverlap &&
        playerBottom >= platformTop &&
        playerBottom <= platformBottom + newPlayer.vy * deltaTime &&
        playerTop < platformTop // Was above the platform
      ) {
        newPlayer.y = platformTop - newPlayer.height;
        newPlayer.vy = 0;
        newPlayer.isJumping = false;
        newPlayer.isFalling = false;
        landedFloor = platform.floor;
        break;
      }
    }

    // Update combo and score when landing on a higher platform
    if (landedFloor > 0 && landedFloor > newPlayer.lastFloor) {
      const floorsJumped = landedFloor - newPlayer.lastFloor;
      soundLand = true;
      if (floorsJumped > 1) {
        combo += floorsJumped;
        comboTimer = COMBO_TIMEOUT;
        score += floorsJumped * COMBO_MULTIPLIER * combo;
        soundCombo = combo;
      } else {
        score += 10;
        soundScore = true;
      }
      newPlayer.lastFloor = landedFloor;
      floor = Math.max(floor, landedFloor);
    }

    // Update combo timer
    if (comboTimer > 0) {
      comboTimer -= 16.67 * deltaTime;
      if (comboTimer <= 0) {
        combo = 0;
        comboTimer = 0;
      }
    }

    // CAMERA MOVEMENT
    const playerScreenY = newPlayer.y + cameraY;

    if (playerScreenY < CAMERA_THRESHOLD) {
      const targetCameraY = CAMERA_THRESHOLD - newPlayer.y;
      cameraY += (targetCameraY - cameraY) * 0.15;
    }

    // Generate more platforms as player climbs
    if (platforms.length > 0 && platforms.length < 50) {
      const highestPlatformY = Math.min(...platforms.map(p => p.y));
      const visibleTop = -cameraY;

      if (highestPlatformY > visibleTop - 400) {
        const highestFloor = Math.max(...platforms.map(p => p.floor));
        const newPlatforms: Platform[] = [];
        let currentY = highestPlatformY;

        for (let i = 0; i < 8; i++) {
          const width = MIN_PLATFORM_WIDTH + Math.random() * (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH);
          const x = Math.random() * (GAME_WIDTH - width);
          const gap = PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
          currentY -= gap;

          newPlatforms.push({
            id: Date.now() + i + Math.random(),
            x,
            y: currentY,
            width,
            floor: highestFloor + i + 1,
          });
        }
        platforms = [...platforms, ...newPlatforms];
      }
    }

    // Remove platforms that are far below the screen (cleanup)
    const visibleBottom = -cameraY + GAME_HEIGHT;
    platforms = platforms.filter(p => p.y < visibleBottom + 300);

    // Game over - player fell below the visible screen
    const playerBottomScreenY = newPlayer.y + newPlayer.height + cameraY;
    const gameOver = playerBottomScreenY > GAME_HEIGHT + 100;
    if (gameOver) {
      soundGameOver = true;
    }

    // Update high score
    let highScore = prev.highScore;
    if (gameOver && score > highScore) {
      highScore = score;
      localStorage.setItem('icyTowerHighScore', score.toString());
    }

    const newState: GameState = {
      ...prev,
      player: newPlayer,
      platforms,
      cameraY,
      score,
      highScore,
      floor,
      gameOver,
      combo,
      comboTimer,
    };

    gameStateRef.current = newState;
    setGameState(newState);

    // Play sounds based on events from this frame
    if (soundGameOver) {
      playGameOverSound();
    } else {
      if (soundSuperJump) playSuperJumpSound();
      else if (soundJump) playJumpSound();
      if (soundCombo > 0) playComboSound(soundCombo);
      else if (soundScore) playScoreSound();
      else if (soundLand) playLandSound();
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.gameOver, gameLoop]);

  return {
    gameState,
    setControls,
    startGame,
  };
};
