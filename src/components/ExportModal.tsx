import React, { useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  FileJson,
  FileText,
  X,
  Check,
  Film,
  Sparkles,
} from 'lucide-react';
import { StoryboardProject } from '../types/storyboard';

interface ExportModalProps {
  project: StoryboardProject;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    let md = `# ${project.title}\n`;
    md += `**Genre:** ${project.genre}\n`;
    md += `**Logline:** ${project.logline}\n\n`;
    md += `## Production Storyboard Sequence (${project.shots.length} Shots)\n\n`;

    project.shots.forEach((shot) => {
      md += `### SHOT ${String(shot.shotNumber).padStart(2, '0')}: ${shot.shotType}\n`;
      md += `- **Lens / Movement:** ${shot.lensFocalLength} | ${shot.cameraMovement}\n`;
      md += `- **Action:** ${shot.action}\n`;
      if (shot.dialogue) md += `- **Dialogue:** "${shot.dialogue}"\n`;
      if (shot.lightingMood) md += `- **Lighting:** ${shot.lightingMood}\n`;
      if (shot.soundEffect) md += `- **Sound Cue:** ${shot.soundEffect}\n`;
      md += `- **Visual Synthesis Prompt:** \`${shot.visualPrompt}\`\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_storyboard.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Export Storyboard Package</h3>
              <p className="text-xs text-slate-400">Share with production crew, director, or clients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-6 space-y-4">
          {/* Print / PDF Call Sheet */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">Printable Call Sheet & PDF</h4>
                <p className="text-xs text-slate-400">
                  Clean printable storyboard layout formatted for paper or PDF export.
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              Print / Save PDF
            </button>
          </div>

          {/* Markdown Shot List */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">Copy Shotlist (Markdown)</h4>
                <p className="text-xs text-slate-400">
                  Formatted list of scene beats, camera types, prompts, and dialogue.
                </p>
              </div>
            </div>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              {copiedType === 'markdown' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          {/* JSON Project Backup */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">Project JSON Backup</h4>
                <p className="text-xs text-slate-400">
                  Full project state including image data URLs and camera setups.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              Download JSON
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
