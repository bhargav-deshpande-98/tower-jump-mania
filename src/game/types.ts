export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  floor: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isJumping: boolean;
  isFalling: boolean;
  direction: 'left' | 'right' | 'idle';
  combo: number;
  lastFloor: number;
}

export interface GameState {
  player: Player;
  platforms: Platform[];
  cameraY: number;
  score: number;
  highScore: number;
  floor: number;
  gameOver: boolean;
  isPlaying: boolean;
  combo: number;
  comboTimer: number;
}

export interface TouchControls {
  left: boolean;
  right: boolean;
  jump: boolean;
}
