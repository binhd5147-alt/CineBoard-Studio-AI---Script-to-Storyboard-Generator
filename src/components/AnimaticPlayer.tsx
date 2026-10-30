import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  X,
  Volume2,
  Maximize,
  Minimize,
  Sliders,
  Film,
} from 'lucide-react';
import { Shot } from '../types/storyboard';

interface AnimaticPlayerProps {
  shots: Shot[];
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: string;
}

export const AnimaticPlayer: React.FC<AnimaticPlayerProps> = ({
  shots,
  isOpen,
  onClose,
  aspectRatio,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [elapsedInShot, setElapsedInShot] = useState(0);

  const activeShot = shots[currentIndex] || shots[0];

  useEffect(() => {
    if (!isOpen || !isPlaying || !activeShot) return;

    const targetDurationMs = (activeShot.estimatedDurationSec || 3.0) * 1000 * (1 / speedMultiplier);
    const intervalMs = 50;

    const timer = setInterval(() => {
      setElapsedInShot((prev) => {
        const next = prev + intervalMs;
        if (next >= targetDurationMs) {
          // Advance to next shot
          setCurrentIndex((idx) => (idx + 1) % shots.length);
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentIndex, speedMultiplier, activeShot, shots.length]);

  if (!isOpen || shots.length === 0) return null;

  const currentDurationSec = activeShot?.estimatedDurationSec || 3.0;
  const progressRatio = Math.min(1, elapsedInShot / ((currentDurationSec * 1000) / speedMultiplier));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>CineBoard Animatic Playback</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  {currentIndex + 1} / {shots.length}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value={0.75}>0.75x Speed</option>
              <option value={1.0}>1.0x (Standard)</option>
              <option value={1.25}>1.25x Speed</option>
              <option value={1.5}>1.5x Speed</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cinematic Main Viewport */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {activeShot?.imageUrl ? (
            <img
              src={activeShot.imageUrl}
              alt={`Shot ${activeShot.shotNumber}`}
              className="w-full h-full object-contain transition-all duration-700"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Film className="w-12 h-12 text-slate-700" />
              <p className="text-xs font-mono">Frame Not Generated Yet (Using Placeholder)</p>
            </div>
          )}

          {/* Camera Framing HUD Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded shadow">
                SHOT {String(activeShot?.shotNumber).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-slate-200 bg-slate-900/80 px-2.5 py-0.5 rounded border border-slate-700 uppercase tracking-wider backdrop-blur-sm">
                {activeShot?.shotType}
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-sm self-start">
              {activeShot?.lensFocalLength} · {activeShot?.cameraMovement}
            </span>
          </div>

          {/* Audio cue badge if available */}
          {activeShot?.soundEffect && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/85 border border-slate-700 px-3 py-1 rounded-full text-xs text-cyan-300 font-mono shadow backdrop-blur-sm">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeShot.soundEffect}</span>
            </div>
          )}

          {/* Subtitles & Action Bar */}
          <div className="absolute bottom-6 inset-x-8 text-center pointer-events-none flex flex-col items-center gap-1">
            {activeShot?.dialogue && (
              <div className="inline-block bg-black/85 border border-amber-500/40 rounded-xl px-5 py-2 shadow-2xl backdrop-blur-md max-w-2xl">
                <p className="text-sm md:text-base font-serif italic text-amber-200 tracking-wide">
                  "{activeShot.dialogue}"
                </p>
              </div>
            )}
            <div className="inline-block bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-1 text-xs text-slate-300 max-w-xl truncate mt-1">
              {activeShot?.action}
            </div>
          </div>
        </div>

        {/* Timeline Scrub & Progress */}
        <div className="px-5 py-2 bg-slate-950 border-t border-slate-800">
          <div className="flex gap-1.5 h-2 w-full my-2">
            {shots.map((s, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setElapsedInShot(0);
                  }}
                  className={`flex-1 rounded-full cursor-pointer transition-all overflow-hidden bg-slate-800 relative h-2 ${
                    isCurrent ? 'ring-1 ring-amber-400' : ''
                  }`}
                  title={`Shot ${s.shotNumber}: ${s.shotType}`}
                >
                  {isPast && <div className="w-full h-full bg-amber-500" />}
                  {isCurrent && (
                    <div
                      className="h-full bg-amber-400 transition-all duration-75"
                      style={{ width: `${progressRatio * 100}%` }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentIndex((prev) => (prev > 0 ? prev - 1 : shots.length - 1));
                  setElapsedInShot(0);
                }}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Previous Shot"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-transform active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  setCurrentIndex((prev) => (prev + 1) % shots.length);
                  setElapsedInShot(0);
                }}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Next Shot"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setElapsedInShot(0);
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Restart from Shot 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Shot duration: <strong className="text-slate-200">{currentDurationSec}s</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
