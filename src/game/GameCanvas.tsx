import React, { useRef, useEffect } from 'react';
import { GameState } from './types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLATFORM_HEIGHT,
  FLOOR_HEIGHT,
  COLORS,
} from './constants';

interface GameCanvasProps {
  gameState: GameState;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle scaling
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const scale = Math.min(containerWidth / GAME_WIDTH, containerHeight / GAME_HEIGHT);
    
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    canvas.style.width = `${GAME_WIDTH * scale}px`;
    canvas.style.height = `${GAME_HEIGHT * scale}px`;

    const { player, platforms, cameraY } = gameState;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw brick pattern background
    // cameraY is positive when scrolled up, so we subtract it to move bricks down
    const brickWidth = 50;
    const brickHeight = 25;
    const worldOffsetY = -cameraY; // Convert camera to world offset
    const startBrickY = Math.floor(worldOffsetY / brickHeight) * brickHeight;
    
    for (let worldY = startBrickY; worldY < worldOffsetY + GAME_HEIGHT + brickHeight; worldY += brickHeight) {
      const screenY = worldY + cameraY; // Convert world to screen
      const row = Math.floor(worldY / brickHeight);
      const offset = row % 2 === 0 ? 0 : brickWidth / 2;
      
      for (let x = -brickWidth; x < GAME_WIDTH + brickWidth; x += brickWidth) {
        ctx.fillStyle = (row + Math.floor((x + offset) / brickWidth)) % 2 === 0 ? COLORS.brickDark : COLORS.brickLight;
        ctx.fillRect(x + offset, screenY, brickWidth - 2, brickHeight - 2);
      }
    }

    // Draw floor (in world coordinates, converted to screen)
    const floorWorldY = GAME_HEIGHT - FLOOR_HEIGHT;
    const floorScreenY = floorWorldY + cameraY;
    
    if (floorScreenY < GAME_HEIGHT + 100) {
      ctx.fillStyle = COLORS.floorDark;
      ctx.fillRect(0, floorScreenY, GAME_WIDTH, FLOOR_HEIGHT + 500);
      
      // Stone pattern on floor
      ctx.fillStyle = COLORS.floor;
      for (let x = 0; x < GAME_WIDTH; x += 40) {
        ctx.fillRect(x + 2, floorScreenY + 2, 36, 20);
        ctx.fillRect(x + 22, floorScreenY + 24, 36, 20);
      }
    }

    // Draw platforms (world coordinates -> screen coordinates)
    for (const platform of platforms) {
      const screenY = platform.y + cameraY; // Convert world Y to screen Y
      
      if (screenY < GAME_HEIGHT + 50 && screenY > -50) {
        // Platform shadow
        ctx.fillStyle = COLORS.platformShadow;
        ctx.fillRect(platform.x, screenY + 4, platform.width, PLATFORM_HEIGHT);
        
        // Platform main
        const gradient = ctx.createLinearGradient(0, screenY, 0, screenY + PLATFORM_HEIGHT);
        gradient.addColorStop(0, '#e8ecf5');
        gradient.addColorStop(0.3, COLORS.platform);
        gradient.addColorStop(1, COLORS.platformShadow);
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.roundRect(platform.x, screenY, platform.width, PLATFORM_HEIGHT, 4);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(platform.x + 4, screenY + 2, platform.width - 8, 3);

        // Floor number
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(platform.floor.toString(), platform.x + platform.width / 2, screenY + 12);
      }
    }

    // Draw player (world coordinates -> screen coordinates)
    const playerScreenY = player.y + cameraY;
    const facingRight = player.direction === 'right' || (player.direction === 'idle' && player.vx >= 0);
    
    ctx.save();
    if (!facingRight) {
      ctx.translate(player.x + player.width, 0);
      ctx.scale(-1, 1);
      ctx.translate(-player.x, 0);
    }

    // Body (green shirt)
    ctx.fillStyle = COLORS.playerBody;
    ctx.beginPath();
    ctx.ellipse(
      player.x + player.width / 2,
      playerScreenY + player.height - 15,
      12,
      18,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Head
    ctx.fillStyle = COLORS.playerFace;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, playerScreenY + 18, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hat (blue beanie)
    ctx.fillStyle = COLORS.playerHat;
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, playerScreenY + 12, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hat tip
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2 + 8, playerScreenY + 5);
    ctx.quadraticCurveTo(
      player.x + player.width / 2 + 20,
      playerScreenY - 5,
      player.x + player.width / 2 + 15,
      playerScreenY + 8
    );
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 + 3, playerScreenY + 18, 2, 0, Math.PI * 2);
    ctx.fill();

    // Legs animation
    const legOffset = player.isJumping ? 5 : Math.sin(Date.now() / 100) * 3 * Math.abs(player.vx);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(player.x + 8, playerScreenY + player.height - 12, 6, 12);
    ctx.fillRect(player.x + player.width - 14, playerScreenY + player.height - 12 + legOffset, 6, 12);

    ctx.restore();

    // Draw combo text
    if (gameState.combo > 1) {
      ctx.save();
      ctx.font = 'bold 28px Bangers, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      const comboText = `${gameState.combo}x COMBO!`;
      ctx.strokeText(comboText, GAME_WIDTH / 2, 120);
      ctx.fillText(comboText, GAME_WIDTH / 2, 120);
      ctx.restore();
    }
  }, [gameState]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
