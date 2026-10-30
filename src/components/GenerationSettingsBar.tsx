import React from 'react';
import {
  Sparkles,
  Maximize,
  Sliders,
  Palette,
  Play,
  RotateCw,
  Plus,
  Tv,
  CheckCircle2,
} from 'lucide-react';
import { ImageResolution, AspectRatioOption, VisualStyle } from '../types/storyboard';

interface GenerationSettingsBarProps {
  resolution: ImageResolution;
  onResolutionChange: (res: ImageResolution) => void;
  aspectRatio: AspectRatioOption;
  onAspectRatioChange: (ratio: AspectRatioOption) => void;
  visualStyle: VisualStyle;
  onVisualStyleChange: (style: VisualStyle) => void;
  model: string;
  onModelChange: (model: string) => void;
  onGenerateAllPending: () => void;
  onAddNewShot: () => void;
  isBatchGenerating: boolean;
  pendingCount: number;
  totalCount: number;
}

export const GenerationSettingsBar: React.FC<GenerationSettingsBarProps> = ({
  resolution,
  onResolutionChange,
  aspectRatio,
  onAspectRatioChange,
  visualStyle,
  onVisualStyleChange,
  model,
  onModelChange,
  onGenerateAllPending,
  onAddNewShot,
  isBatchGenerating,
  pendingCount,
  totalCount,
}) => {
  const resolutions: ImageResolution[] = ['1K', '2K', '4K'];
  const ratios: { label: string; value: AspectRatioOption; sub: string }[] = [
    { label: '16:9', value: '16:9', sub: 'Cinematic Widescreen' },
    { label: '2.39:1', value: '2.39:1', sub: 'Anamorphic Scope' },
    { label: '4:3', value: '4:3', sub: 'Classic Academy' },
    { label: '1:1', value: '1:1', sub: 'Square Keyframe' },
    { label: '9:16', value: '9:16', sub: 'Vertical Mobile' },
  ];

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 px-6 py-3 shadow-md flex flex-wrap items-center justify-between gap-4">
      {/* Left: Resolution & Aspect Ratio controls */}
      <div className="flex flex-wrap items-center gap-5">
        {/* Affordance for User to Specify Image Size (1K, 2K, 4K) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5 text-amber-400" />
            <span>Image Size:</span>
          </span>
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {resolutions.map((res) => (
              <button
                key={res}
                onClick={() => onResolutionChange(res)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  resolution === res
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Generate high-fidelity ${res} resolution frames with Gemini 3 Pro`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ratio:</span>
          </span>
          <select
            value={aspectRatio}
            onChange={(e) => onAspectRatioChange(e.target.value as AspectRatioOption)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500"
          >
            {ratios.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label} ({r.sub})
              </option>
            ))}
          </select>
        </div>

        {/* Visual Style */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>Style:</span>
          </span>
          <select
            value={visualStyle}
            onChange={(e) => onVisualStyleChange(e.target.value as VisualStyle)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none focus:border-purple-500 max-w-[210px] truncate"
          >
            <option value="Cinematic Film Still (35mm Anamorphic)">Cinematic 35mm Film Still</option>
            <option value="Graphic Novel Noir (High-Contrast Ink)">Graphic Novel Noir (Ink)</option>
            <option value="Hollywood Production Pencil Sketch">Hollywood Pencil Sketch</option>
            <option value="Anime & Animation Keyframe">Anime / Animation Keyframe</option>
            <option value="Hyper-Realistic Concept Matte">Hyper-Realistic Matte Art</option>
          </select>
        </div>

        {/* Model Selection Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Model:</span>
          <strong className="text-amber-300 font-mono">gemini-3-pro-image-preview</strong>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAddNewShot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Insert Shot</span>
        </button>

        <button
          onClick={onGenerateAllPending}
          disabled={isBatchGenerating || totalCount === 0}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md shadow-orange-950/40 transition-all active:scale-95"
        >
          {isBatchGenerating ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Images ({pendingCount} pending)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {pendingCount > 0 ? `Generate All Images (${pendingCount})` : 'Re-Generate All'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
