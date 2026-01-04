import React, { useEffect } from 'react';
import { useGameLoop } from './useGameLoop';
import { GameCanvas } from './GameCanvas';
import { TouchControls } from './TouchControls';
import { GameUI } from './GameUI';
import { GameOver } from './GameOver';
import { StartScreen } from './StartScreen';

export const IcyTowerGame: React.FC = () => {
  const { gameState, setControls, startGame } = useGameLoop();

  // Keyboard controls for testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setControls({ left: true });
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setControls({ right: true });
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        setControls({ jump: true });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setControls({ left: false });
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setControls({ right: false });
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        setControls({ jump: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setControls]);

  // Prevent default touch behaviors
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.target instanceof HTMLButtonElement) return;
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('touchstart', preventDefault, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('touchstart', preventDefault);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background overflow-hidden select-none">
      {/* Game Canvas */}
      <div className="absolute inset-0">
        <GameCanvas gameState={gameState} />
      </div>

      {/* Start Screen */}
      {!gameState.isPlaying && !gameState.gameOver && (
        <StartScreen highScore={gameState.highScore} onStart={startGame} />
      )}

      {/* Game UI (score, floor) */}
      {gameState.isPlaying && !gameState.gameOver && (
        <GameUI gameState={gameState} />
      )}

      {/* Touch Controls */}
      {gameState.isPlaying && !gameState.gameOver && (
        <TouchControls onControlChange={setControls} />
      )}

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <GameOver gameState={gameState} onRestart={startGame} />
      )}
    </div>
  );
};
