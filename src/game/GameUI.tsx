import React from 'react';
import { GameState } from './types';
import { Trophy, Layers } from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
}

export const GameUI: React.FC<GameUIProps> = ({ gameState }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
      {/* Score Display */}
      <div className="flex justify-between items-start">
        <div className="bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-border">
          <div className="flex items-center gap-2 text-accent">
            <Trophy className="w-5 h-5" />
            <span className="score-display text-2xl">{gameState.score}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Best: {gameState.highScore}
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-border">
          <div className="flex items-center gap-2 text-primary">
            <Layers className="w-5 h-5" />
            <span className="score-display text-2xl">{gameState.floor}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Floor</div>
        </div>
      </div>

      {/* Combo indicator */}
      {gameState.combo > 1 && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <div 
            className="bg-accent/90 text-accent-foreground px-4 py-2 rounded-full animate-bounce-custom"
            style={{
              boxShadow: '0 0 20px hsl(45 100% 55% / 0.5)',
            }}
          >
            <span className="font-bold text-lg">{gameState.combo}x COMBO!</span>
          </div>
        </div>
      )}
    </div>
  );
};
