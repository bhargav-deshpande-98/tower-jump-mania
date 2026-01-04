import React, { useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';

interface TouchControlsProps {
  onControlChange: (controls: { left?: boolean; right?: boolean; jump?: boolean }) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onControlChange }) => {
  const handleTouchStart = useCallback((control: 'left' | 'right' | 'jump') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onControlChange({ [control]: true });
  }, [onControlChange]);

  const handleTouchEnd = useCallback((control: 'left' | 'right' | 'jump') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onControlChange({ [control]: false });
  }, [onControlChange]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 flex justify-between items-end p-4 pb-6 pointer-events-none">
      {/* Left/Right Controls */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          className="control-btn w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground"
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onMouseDown={handleTouchStart('left')}
          onMouseUp={handleTouchEnd('left')}
          onMouseLeave={handleTouchEnd('left')}
        >
          <ChevronLeft className="w-10 h-10" strokeWidth={3} />
        </button>
        <button
          className="control-btn w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground"
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onMouseDown={handleTouchStart('right')}
          onMouseUp={handleTouchEnd('right')}
          onMouseLeave={handleTouchEnd('right')}
        >
          <ChevronRight className="w-10 h-10" strokeWidth={3} />
        </button>
      </div>

      {/* Jump Control */}
      <button
        className="control-btn w-20 h-20 rounded-full flex items-center justify-center text-primary-foreground pointer-events-auto"
        onTouchStart={handleTouchStart('jump')}
        onTouchEnd={handleTouchEnd('jump')}
        onMouseDown={handleTouchStart('jump')}
        onMouseUp={handleTouchEnd('jump')}
        onMouseLeave={handleTouchEnd('jump')}
      >
        <ArrowUp className="w-12 h-12" strokeWidth={3} />
      </button>
    </div>
  );
};
