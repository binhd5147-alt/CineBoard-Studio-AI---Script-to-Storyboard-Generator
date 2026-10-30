import React, { useState } from 'react';
import {
  FileText,
  User,
  Sparkles,
  Camera,
  Layers,
  Save,
  Check,
  Film,
  Plus,
  Trash2,
} from 'lucide-react';
import { StoryboardProject, Shot } from '../types/storyboard';

interface ScriptEditorViewProps {
  project: StoryboardProject;
  activeShotId: string | null;
  onSelectShot: (shot: Shot) => void;
  onUpdateShot: (shot: Shot) => void;
  onUpdateRawScript: (script: string) => void;
}

export const ScriptEditorView: React.FC<ScriptEditorViewProps> = ({
  project,
  activeShotId,
  onSelectShot,
  onUpdateShot,
  onUpdateRawScript,
}) => {
  const [scriptContent, setScriptContent] = useState(project.rawScript);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveScript = () => {
    onUpdateRawScript(scriptContent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 h-full overflow-y-auto">
      {/* Left: Raw Screenplay Text Editor (5 cols) */}
      <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Screenplay Source</h3>
          </div>
          <button
            onClick={handleSaveScript}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved' : 'Save Script'}</span>
          </button>
        </div>

        <div className="flex-1 p-4 bg-slate-950 flex flex-col">
          <textarea
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            className="w-full flex-1 min-h-[420px] bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-none leading-relaxed"
            placeholder="Screenplay scene..."
          />
        </div>

        {/* Characters Detected */}
        {project.characters && project.characters.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Character Visual Continuity</span>
            </h4>
            <div className="space-y-2">
              {project.characters.map((char, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                >
                  <span className="font-bold text-amber-300 block">{char.name}</span>
                  <span className="text-slate-400 text-[11px] leading-snug">
                    {char.visualDescription}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Structured Shot Breakdown Details (7 cols) */}
      <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Shot Breakdown ({project.shots.length} Key Beats)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {project.genre} · {project.recommendedAspectRatio || '16:9'}
          </span>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 max-h-[700px]">
          {project.shots.map((shot) => {
            const isSelected = shot.id === activeShotId;
            return (
              <div
                key={shot.id}
                onClick={() => onSelectShot(shot)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850 border-amber-500/70 ring-1 ring-amber-500/40 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-750'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      SHOT {String(shot.shotNumber).padStart(2, '0')}
                    </span>
                    <span className="font-bold text-xs text-slate-200 uppercase">
                      {shot.shotType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span className="text-cyan-400">{shot.lensFocalLength}</span>
                    <span>·</span>
                    <span>{shot.cameraMovement}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium mb-2 leading-relaxed">
                  {shot.action}
                </p>

                {shot.dialogue && (
                  <div className="mb-2 p-2 rounded bg-amber-500/10 text-amber-200 text-xs italic font-serif border-l-2 border-amber-500">
                    "{shot.dialogue}"
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Visual Prompt for Gemini 3 Pro
                  </label>
                  <textarea
                    value={shot.visualPrompt}
                    onChange={(e) =>
                      onUpdateShot({
                        ...shot,
                        visualPrompt: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
