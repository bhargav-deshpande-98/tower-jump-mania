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

const generatePlatforms = (startFloor: number, count: number, existingPlatforms: Platform[] = []): Platform[] => {
  const platforms: Platform[] = [...existingPlatforms];
  let currentY = startFloor === 0 ? GAME_HEIGHT - FLOOR_HEIGHT - 20 : 
    existingPlatforms.length > 0 ? 
    Math.min(...existingPlatforms.map(p => p.y)) - PLATFORM_GAP_MIN : 
    GAME_HEIGHT - FLOOR_HEIGHT - 80;

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
  const platforms = generatePlatforms(0, 15);
  
  return {
    player: {
      x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
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
    cameraY: 0,
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
  const controlsRef = useRef<TouchControls>({ left: false, right: false, jump: false });
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const jumpPressedRef = useRef(false);

  const setControls = useCallback((controls: Partial<TouchControls>) => {
    controlsRef.current = { ...controlsRef.current, ...controls };
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...createInitialState(),
      highScore: prev.highScore,
      isPlaying: true,
    }));
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
    lastTimeRef.current = timestamp;

    setGameState(prev => {
      if (!prev.isPlaying || prev.gameOver) return prev;

      const controls = controlsRef.current;
      let { player, platforms, cameraY, score, floor, combo, comboTimer } = prev;

      // Create new player state
      let newPlayer: Player = { ...player };

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

      // Handle jumping
      if (controls.jump && !newPlayer.isJumping && !jumpPressedRef.current) {
        const speed = Math.abs(newPlayer.vx);
        const jumpForce = speed > MAX_SPEED * 0.7 ? SUPER_JUMP_FORCE : JUMP_FORCE;
        newPlayer.vy = jumpForce;
        newPlayer.isJumping = true;
        jumpPressedRef.current = true;
      }
      
      if (!controls.jump) {
        jumpPressedRef.current = false;
      }

      // Apply gravity
      newPlayer.vy += GRAVITY * deltaTime;
      newPlayer.vy = Math.min(newPlayer.vy, MAX_FALL_SPEED);

      // Update position
      newPlayer.x += newPlayer.vx * deltaTime;
      newPlayer.y += newPlayer.vy * deltaTime;

      // Screen wrapping
      if (newPlayer.x + newPlayer.width < 0) {
        newPlayer.x = GAME_WIDTH;
      } else if (newPlayer.x > GAME_WIDTH) {
        newPlayer.x = -newPlayer.width;
      }

      // Check floor collision
      const floorY = GAME_HEIGHT - FLOOR_HEIGHT - newPlayer.height - cameraY;
      if (newPlayer.y >= floorY && newPlayer.vy >= 0) {
        newPlayer.y = floorY;
        newPlayer.vy = 0;
        newPlayer.isJumping = false;
        newPlayer.isFalling = false;
        combo = 0;
        comboTimer = 0;
      }

      // Platform collision
      let landedFloor = 0;
      for (const platform of platforms) {
        const platformScreenY = platform.y - cameraY;
        
        // Check if player is falling and above platform
        if (
          newPlayer.vy > 0 &&
          newPlayer.x + newPlayer.width > platform.x &&
          newPlayer.x < platform.x + platform.width &&
          newPlayer.y + newPlayer.height >= platformScreenY &&
          newPlayer.y + newPlayer.height <= platformScreenY + PLATFORM_HEIGHT + newPlayer.vy * deltaTime
        ) {
          newPlayer.y = platformScreenY - newPlayer.height;
          newPlayer.vy = 0;
          newPlayer.isJumping = false;
          newPlayer.isFalling = false;
          landedFloor = platform.floor;
          break;
        }
      }

      // Update combo and score when landing
      if (landedFloor > 0 && landedFloor > newPlayer.lastFloor) {
        const floorsJumped = landedFloor - newPlayer.lastFloor;
        if (floorsJumped > 1) {
          combo += floorsJumped;
          comboTimer = COMBO_TIMEOUT;
          score += floorsJumped * COMBO_MULTIPLIER * combo;
        } else {
          score += 10;
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

      // Camera movement
      const playerScreenY = newPlayer.y;
      if (playerScreenY < CAMERA_THRESHOLD) {
        const targetCameraY = cameraY + (CAMERA_THRESHOLD - playerScreenY);
        cameraY += (targetCameraY - cameraY) * 0.1;
      }

      // Generate more platforms
      const highestPlatform = Math.min(...platforms.map(p => p.y));
      if (highestPlatform > cameraY - 200) {
        const newPlatforms = generatePlatforms(
          Math.max(...platforms.map(p => p.floor)),
          10,
          platforms
        );
        platforms = newPlatforms;
      }

      // Remove platforms below screen
      platforms = platforms.filter(p => p.y - cameraY < GAME_HEIGHT + 100);

      // Check game over (fell below screen)
      const gameOver = newPlayer.y - cameraY > GAME_HEIGHT + 50;

      // Update high score
      let highScore = prev.highScore;
      if (gameOver && score > highScore) {
        highScore = score;
        localStorage.setItem('icyTowerHighScore', score.toString());
      }

      return {
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
    });

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
