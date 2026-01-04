import React from 'react';
import { GameState } from './types';
import { Trophy, RotateCcw, Layers } from 'lucide-react';

interface GameOverProps {
  gameState: GameState;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ gameState, onRestart }) => {
  const isNewHighScore = gameState.score >= gameState.highScore && gameState.score > 0;

  return (
    <div className="game-over-overlay absolute inset-0 flex flex-col items-center justify-center p-8 z-20">
      <div className="text-center space-y-6">
        <h2 className="game-title text-5xl text-destructive">GAME OVER</h2>
        
        {isNewHighScore && (
          <div className="animate-pulse-glow bg-accent/20 rounded-2xl px-6 py-3 border-2 border-accent">
            <span className="text-accent font-bold text-xl">🎉 NEW HIGH SCORE! 🎉</span>
          </div>
        )}

        <div className="bg-card/90 rounded-2xl p-6 space-y-4 border border-border">
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-accent mb-1">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="score-display text-4xl text-foreground">{gameState.score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary mb-1">
                <Layers className="w-6 h-6" />
              </div>
              <div className="score-display text-4xl text-foreground">{gameState.floor}</div>
              <div className="text-sm text-muted-foreground">Floor</div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="text-muted-foreground text-sm">
              High Score: <span className="text-accent font-bold">{gameState.highScore}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="control-btn px-8 py-4 rounded-2xl flex items-center gap-3 mx-auto text-primary-foreground text-lg font-bold"
        >
          <RotateCcw className="w-6 h-6" />
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};
