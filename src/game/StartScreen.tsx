import React from 'react';
import { Play, Trophy } from 'lucide-react';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ highScore, onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20 bg-background/95">
      <div className="text-center space-y-8">
        {/* Game Title */}
        <div className="space-y-2">
          <h1 className="game-title text-6xl text-primary animate-float">
            ICY
          </h1>
          <h1 className="game-title text-6xl text-accent">
            TOWER
          </h1>
        </div>

        {/* Character Preview */}
        <div className="relative w-24 h-24 mx-auto animate-bounce">
          <svg viewBox="0 0 48 64" className="w-full h-full">
            {/* Body */}
            <ellipse cx="24" cy="48" rx="12" ry="14" fill="#22c55e" />
            {/* Head */}
            <circle cx="24" cy="22" r="10" fill="#fcd34d" />
            {/* Hat */}
            <ellipse cx="24" cy="16" rx="12" ry="8" fill="#3b82f6" />
            <path d="M 32 10 Q 42 5 38 14" fill="#3b82f6" />
            {/* Eye */}
            <circle cx="27" cy="22" r="2" fill="#000" />
            {/* Legs */}
            <rect x="16" y="56" width="6" height="8" rx="2" fill="#1e3a8a" />
            <rect x="26" y="56" width="6" height="8" rx="2" fill="#1e3a8a" />
          </svg>
        </div>

        {/* High Score */}
        {highScore > 0 && (
          <div className="bg-card/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-border inline-flex items-center gap-3">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-muted-foreground">Best:</span>
            <span className="score-display text-2xl text-accent">{highScore}</span>
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={onStart}
          className="control-btn px-10 py-5 rounded-2xl flex items-center gap-4 mx-auto text-primary-foreground text-xl font-bold animate-pulse-glow"
        >
          <Play className="w-8 h-8" fill="currentColor" />
          PLAY
        </button>

        {/* Instructions */}
        <div className="text-muted-foreground text-sm space-y-2 max-w-xs mx-auto">
          <p>⬅️ ➡️ Move left/right</p>
          <p>⬆️ Jump (run faster = jump higher!)</p>
          <p>🏆 Climb as high as you can!</p>
        </div>
      </div>
    </div>
  );
};
