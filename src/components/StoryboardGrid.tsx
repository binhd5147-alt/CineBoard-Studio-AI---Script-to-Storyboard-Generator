import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  RotateCw,
  Eye,
  Sliders,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Volume2,
  Sun,
  Edit3,
  Check,
  Film,
  X,
  Plus,
} from 'lucide-react';
import { Shot, ImageResolution, AspectRatioOption, VisualStyle } from '../types/storyboard';

interface StoryboardGridProps {
  shots: Shot[];
  activeShotId: string | null;
  onSelectShot: (shot: Shot) => void;
  onGenerateShotImage: (shotId: string) => void;
  onUpdateShot: (updatedShot: Shot) => void;
  onDeleteShot: (shotId: string) => void;
  onDuplicateShot: (shotId: string) => void;
  onMoveShot: (index: number, direction: 'left' | 'right') => void;
  onOpenPreVizForShot: (shot: Shot) => void;
  onAddNewShotAt: (index: number) => void;
  currentResolution: ImageResolution;
  aspectRatio: AspectRatioOption;
  visualStyle: VisualStyle;
}

export const StoryboardGrid: React.FC<StoryboardGridProps> = ({
  shots,
  activeShotId,
  onSelectShot,
  onGenerateShotImage,
  onUpdateShot,
  onDeleteShot,
  onDuplicateShot,
  onMoveShot,
  onOpenPreVizForShot,
  onAddNewShotAt,
  currentResolution,
  aspectRatio,
  visualStyle,
}) => {
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  const [lightboxShot, setLightboxShot] = useState<Shot | null>(null);
  const [copiedShotId, setCopiedShotId] = useState<string | null>(null);

  const getAspectClass = (ratio: AspectRatioOption) => {
    switch (ratio) {
      case '16:9':
        return 'aspect-video';
      case '2.39:1':
        return 'aspect-[21/9]';
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-video';
    }
  };

  const handleCopyPrompt = (shot: Shot) => {
    navigator.clipboard.writeText(shot.visualPrompt);
    setCopiedShotId(shot.id);
    setTimeout(() => setCopiedShotId(null), 2000);
  };

  const handleDownloadImage = (shot: Shot) => {
    if (!shot.imageUrl) return;
    const link = document.createElement('a');
    link.href = shot.imageUrl;
    link.download = `Shot_${String(shot.shotNumber).padStart(2, '0')}_${shot.shotType.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (shots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-slate-400">
        <Film className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-200">No Storyboard Shots Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
          Upload a screenplay script to automatically generate visual keyframes, or create shots manually.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Shots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {shots.map((shot, index) => {
          const isActive = shot.id === activeShotId;
          const isEditing = shot.id === editingShotId;

          return (
            <div
              key={shot.id}
              onClick={() => onSelectShot(shot)}
              className={`flex flex-col bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200 group relative ${
                isActive
                  ? 'border-amber-500/80 ring-2 ring-amber-500/30 shadow-xl shadow-amber-950/20'
                  : 'border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    SHOT {String(shot.shotNumber).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide truncate max-w-[130px]">
                    {shot.shotType}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {shot.estimatedDurationSec}s
                  </span>
                  {/* Move Left / Right Controls */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveShot(index, 'left');
                    }}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-800"
                    title="Move earlier in sequence"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveShot(index, 'right');
                    }}
                    disabled={index === shots.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-800"
                    title="Move later in sequence"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Storyboard Visual Image Area */}
              <div
                className={`relative w-full ${getAspectClass(
                  aspectRatio
                )} bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-800`}
              >
                {shot.imageUrl ? (
                  <div className="relative w-full h-full group/img">
                    <img
                      src={shot.imageUrl}
                      alt={`Shot ${shot.shotNumber}: ${shot.action}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
                    />
                    {/* Hover Overlay with Lightbox and Re-roll */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxShot(shot);
                        }}
                        className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-lg"
                        title="Enlarge 4K Viewport"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateShotImage(shot.id);
                        }}
                        className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg"
                        title="Re-generate Frame (Gemini 3 Pro)"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(shot);
                        }}
                        className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-lg"
                        title="Download High-Res PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Resolution Tag Badge */}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 border border-slate-700 text-[9px] font-mono font-bold text-amber-400 shadow-md">
                      {currentResolution}
                    </div>
                  </div>
                ) : shot.isGenerating ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                      <Sparkles className="w-4 h-4 text-amber-400 absolute inset-0 m-auto" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-300">
                        Generating {currentResolution} Frame...
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        gemini-3-pro-image-preview
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                      <Camera className="w-6 h-6 text-slate-500" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateShotImage(shot.id);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-950/40 transition-transform active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Frame ({currentResolution})</span>
                    </button>
                    {shot.generationError && (
                      <p className="text-[10px] text-red-400 max-w-[240px] line-clamp-2">
                        {shot.generationError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Shot Details & Direction Notes */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                {/* Camera & Lens metadata */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {shot.lensFocalLength || '35mm Lens'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {shot.cameraMovement || 'Static'}
                  </span>
                </div>

                {/* Action & Dialogue */}
                <div className="space-y-1.5">
                  <p className="text-slate-200 font-medium leading-relaxed line-clamp-3">
                    {shot.action}
                  </p>

                  {shot.dialogue && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border-l-2 border-amber-500 text-amber-200 italic text-[11px] font-serif">
                      {shot.dialogue}
                    </div>
                  )}
                </div>

                {/* Lighting and Sound cue badges */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                  {shot.lightingMood && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Sun className="w-3 h-3 text-yellow-400 shrink-0" />
                      <span className="truncate">{shot.lightingMood}</span>
                    </div>
                  )}
                  {shot.soundEffect && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Volume2 className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{shot.soundEffect}</span>
                    </div>
                  )}
                </div>

                {/* Shot Card Actions Toolbar */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPreVizForShot(shot);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-750 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-[10px] font-medium"
                      title="Open 3D Director's Viewfinder to test angles"
                    >
                      <Camera className="w-3 h-3" />
                      <span>3D Pre-Viz</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPrompt(shot);
                      }}
                      className="p-1 rounded hover:bg-slate-800 hover:text-slate-200"
                      title="Copy Visual Prompt"
                    >
                      {copiedShotId === shot.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateShot(shot.id);
                      }}
                      className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 text-slate-400"
                      title="Duplicate Shot"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteShot(shot.id);
                      }}
                      className="p-1 rounded hover:bg-slate-800 hover:text-red-400 text-slate-400"
                      title="Delete Shot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal for Full-Screen 4K Inspection */}
      {lightboxShot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxShot(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-amber-400 text-sm">
                  SHOT {String(lightboxShot.shotNumber).padStart(2, '0')}
                </span>
                <span className="text-sm font-semibold text-slate-200 uppercase">
                  {lightboxShot.shotType}
                </span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  {currentResolution} Native
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadImage(lightboxShot)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res</span>
                </button>
                <button
                  onClick={() => setLightboxShot(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Image */}
            <div className="p-4 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={lightboxShot.imageUrl}
                alt={`Shot ${lightboxShot.shotNumber}`}
                className="max-h-[66vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Lightbox Description */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2 text-xs">
              <p className="text-slate-200 font-medium">{lightboxShot.action}</p>
              {lightboxShot.dialogue && (
                <p className="text-amber-300 italic font-serif">"{lightboxShot.dialogue}"</p>
              )}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]">
                <strong className="text-slate-300 block mb-0.5">Visual Prompt Formulation:</strong>
                {lightboxShot.visualPrompt}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
