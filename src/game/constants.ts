// Game dimensions (will be scaled)
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;

// Physics
export const GRAVITY = 0.5;
export const JUMP_FORCE = -14;
export const SUPER_JUMP_FORCE = -18;
export const MAX_FALL_SPEED = 15;
export const MOVE_SPEED = 0.8;
export const MAX_SPEED = 8;
export const FRICTION = 0.92;
export const AIR_FRICTION = 0.98;

// Player
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;

// Platforms
export const PLATFORM_HEIGHT = 16;
export const MIN_PLATFORM_WIDTH = 70;
export const MAX_PLATFORM_WIDTH = 140;
export const PLATFORM_GAP_MIN = 60;
export const PLATFORM_GAP_MAX = 100;
export const PLATFORMS_PER_SCREEN = 8;

// Floor (ground platform)
export const FLOOR_HEIGHT = 50;

// Camera
export const CAMERA_THRESHOLD = 300;
export const CAMERA_SPEED = 0.1;

// Combo
export const COMBO_TIMEOUT = 1500;
export const COMBO_MULTIPLIER = 10;

// Colors for rendering
export const COLORS = {
  background: '#1a1f3a',
  brickDark: '#252d4a',
  brickLight: '#3a4570',
  platform: '#d4d8e8',
  platformShadow: '#a8afc5',
  floor: '#6b7280',
  floorDark: '#4b5563',
  playerBody: '#22c55e',
  playerHat: '#3b82f6',
  playerFace: '#fcd34d',
};
