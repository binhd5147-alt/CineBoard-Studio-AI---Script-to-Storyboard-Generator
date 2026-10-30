import React from 'react';
import {
  Film,
  Upload,
  Play,
  Share2,
  Video,
  Grid,
  FileText,
  MessageSquare,
  Sparkles,
  Maximize2,
  Download,
} from 'lucide-react';
import { StoryboardProject } from '../types/storyboard';

interface NavbarProps {
  project: StoryboardProject;
  activeView: 'grid' | 'script' | 'previz';
  onViewChange: (view: 'grid' | 'script' | 'previz') => void;
  onOpenUpload: () => void;
  onOpenAnimatic: () => void;
  onOpenExport: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  totalImagesGenerated: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  activeView,
  onViewChange,
  onOpenUpload,
  onOpenAnimatic,
  onOpenExport,
  isChatOpen,
  onToggleChat,
  totalImagesGenerated,
}) => {
  const totalShots = project.shots.length;
  const totalDuration = project.shots.reduce(
    (acc, s) => acc + (s.estimatedDurationSec || 3),
    0
  );

  return (
    <header className="bg-slate-950 border-b border-slate-800 px-5 py-3 flex items-center justify-between select-none">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-950/50">
            <Film className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wider text-slate-100 uppercase font-sans">
                CineBoard <span className="text-amber-400">AI</span>
              </span>
              <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                PRO 4K
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200 truncate max-w-[160px] md:max-w-[240px]">
                {project.title || 'Untitled Script'}
              </span>
              <span>·</span>
              <span className="text-[11px] font-mono text-cyan-400">
                {totalImagesGenerated}/{totalShots} frames
              </span>
              <span>·</span>
              <span className="text-[11px] font-mono text-slate-400">
                ~{totalDuration.toFixed(1)}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center View Mode Switcher */}
      <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner">
        <button
          onClick={() => onViewChange('grid')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'grid'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Storyboard Grid</span>
        </button>

        <button
          onClick={() => onViewChange('script')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'script'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Script & Beats</span>
        </button>

        <button
          onClick={() => onViewChange('previz')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'previz'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>3D Pre-Viz Stage</span>
        </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenAnimatic}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold shadow-sm transition-all active:scale-95"
          title="Play animatic slideshow"
        >
          <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
          <span className="hidden sm:inline">Play Animatic</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold shadow-sm transition-all"
          title="Upload or change screenplay"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Upload Script</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold shadow-sm transition-all"
          title="Export Call Sheet / PDF / JSON"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Export</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* AI Director Copilot Toggle */}
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isChatOpen
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
              : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
          }`}
          title="Toggle Gemini Director Copilot"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">AI Director</span>
        </button>
      </div>
    </header>
  );
};
