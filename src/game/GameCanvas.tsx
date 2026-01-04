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
    const brickWidth = 50;
    const brickHeight = 25;
    const startY = Math.floor(cameraY / brickHeight) * brickHeight;
    
    for (let y = startY; y < cameraY + GAME_HEIGHT + brickHeight; y += brickHeight) {
      const row = Math.floor(y / brickHeight);
      const offset = row % 2 === 0 ? 0 : brickWidth / 2;
      
      for (let x = -brickWidth; x < GAME_WIDTH + brickWidth; x += brickWidth) {
        const screenY = y - cameraY;
        ctx.fillStyle = (row + Math.floor((x + offset) / brickWidth)) % 2 === 0 ? COLORS.brickDark : COLORS.brickLight;
        ctx.fillRect(x + offset, screenY, brickWidth - 2, brickHeight - 2);
      }
    }

    // Draw floor
    const floorY = GAME_HEIGHT - FLOOR_HEIGHT - cameraY;
    if (floorY < GAME_HEIGHT) {
      ctx.fillStyle = COLORS.floorDark;
      ctx.fillRect(0, floorY, GAME_WIDTH, FLOOR_HEIGHT + 100);
      
      // Stone pattern on floor
      ctx.fillStyle = COLORS.floor;
      for (let x = 0; x < GAME_WIDTH; x += 40) {
        ctx.fillRect(x + 2, floorY + 2, 36, 20);
        ctx.fillRect(x + 22, floorY + 24, 36, 20);
      }
    }

    // Draw platforms
    for (const platform of platforms) {
      const screenY = platform.y - cameraY;
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
        if (platform.floor % 5 === 0) {
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(platform.floor.toString(), platform.x + platform.width / 2, screenY + 12);
        }
      }
    }

    // Draw player
    const screenPlayerY = player.y;
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
      screenPlayerY + player.height - 15,
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
    ctx.arc(player.x + player.width / 2, screenPlayerY + 18, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hat (blue beanie)
    ctx.fillStyle = COLORS.playerHat;
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, screenPlayerY + 12, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hat tip
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2 + 8, screenPlayerY + 5);
    ctx.quadraticCurveTo(
      player.x + player.width / 2 + 20,
      screenPlayerY - 5,
      player.x + player.width / 2 + 15,
      screenPlayerY + 8
    );
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 + 3, screenPlayerY + 18, 2, 0, Math.PI * 2);
    ctx.fill();

    // Legs animation
    const legOffset = player.isJumping ? 5 : Math.sin(Date.now() / 100) * 3 * Math.abs(player.vx);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(player.x + 8, screenPlayerY + player.height - 12, 6, 12);
    ctx.fillRect(player.x + player.width - 14, screenPlayerY + player.height - 12 + legOffset, 6, 12);

    ctx.restore();

    // Draw combo text
    if (gameState.combo > 1) {
      ctx.save();
      ctx.font = 'bold 24px Bangers, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      const comboText = `${gameState.combo}x COMBO!`;
      ctx.strokeText(comboText, GAME_WIDTH / 2, 100);
      ctx.fillText(comboText, GAME_WIDTH / 2, 100);
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
