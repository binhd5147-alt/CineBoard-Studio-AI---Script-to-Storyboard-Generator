import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  Film,
  X,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  Brain,
} from 'lucide-react';
import { SAMPLE_SCRIPTS, SampleScript } from '../data/sampleScripts';
import { VisualStyle } from '../types/storyboard';

interface ScriptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScriptParsed: (data: any, originalScript: string) => void;
}

export const ScriptUploadModal: React.FC<ScriptUploadModalProps> = ({
  isOpen,
  onClose,
  onScriptParsed,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'sample'>('upload');
  const [scriptText, setScriptText] = useState('');
  const [selectedSample, setSelectedSample] = useState<SampleScript>(SAMPLE_SCRIPTS[0]);
  const [targetShotCount, setTargetShotCount] = useState<number>(6);
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>('Cinematic Film Still (35mm Anamorphic)');
  const [modelPreference, setModelPreference] = useState<'gemini-3.8-flash' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setScriptText(content || '');
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file. Please paste your script text directly.');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sample: SampleScript) => {
    setSelectedSample(sample);
    setScriptText(sample.script);
    if (sample.recommendedStyle) {
      setSelectedStyle(sample.recommendedStyle as VisualStyle);
    }
  };

  const handleSubmit = async () => {
    const textToBreakdown = activeTab === 'sample' ? selectedSample.script : scriptText.trim();
    if (!textToBreakdown) {
      setErrorMessage('Please provide a screenplay script or select one of the samples.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/breakdown-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptText: textToBreakdown,
          targetShotCount,
          modelPreference,
          visualStyle: selectedStyle,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to breakdown script');
      }

      onScriptParsed(json.data, textToBreakdown);
      onClose();
    } catch (err: any) {
      console.error('Breakdown error:', err);
      setErrorMessage(err.message || 'Error parsing script. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const styleOptions: VisualStyle[] = [
    'Cinematic Film Still (35mm Anamorphic)',
    'Graphic Novel Noir (High-Contrast Ink)',
    'Hollywood Production Pencil Sketch',
    'Anime & Animation Keyframe',
    'Hyper-Realistic Concept Matte',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Upload & Breakdown Screenplay</span>
                <span className="text-xs font-mono font-normal bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  AI Storyboard Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transforms script scenes into an episodic sequence of production-ready visual storyboard shots.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 pb-2 gap-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-colors border-b-2 -mb-2.5 ${
                activeTab === 'upload'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Paste or Upload Script</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sample');
                setScriptText(selectedSample.script);
              }}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-colors border-b-2 -mb-2.5 ${
                activeTab === 'sample'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Load Sample Screenplay</span>
            </button>
          </div>

          {activeTab === 'sample' ? (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Choose a Sample Screenplay
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SAMPLE_SCRIPTS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleLoadSample(sample)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      selectedSample.id === sample.id
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-100">{sample.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
                        {sample.genre}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{sample.logline}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Style: {sample.recommendedStyle.split(' ')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Screenplay Preview
                </label>
                <pre className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-300 max-h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {selectedSample.script}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File upload drag drop zone */}
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl cursor-pointer bg-slate-800/40 hover:bg-slate-800/70 transition-all">
                <Upload className="w-8 h-8 text-amber-400 mb-2" />
                <span className="text-sm font-medium text-slate-200">
                  Drop screenplay file here, or browse
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports .txt, .fountain, .fdx, .md, standard screenplay format
                </span>
                <input
                  type="file"
                  accept=".txt,.fountain,.fdx,.md,.pdf,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Or Paste Screenplay Scene Text
                  </label>
                  <span className="text-xs text-slate-400 font-mono">
                    {scriptText.length} characters
                  </span>
                </div>
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder={`EXT. CYBERPUNK ALLEYWAY - NIGHT\n\nRain pours down slick neon-lit concrete...\n\nJACK (40s) checks his neural scanner.`}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            {/* Visual Style Preset */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Visual Style Preset</span>
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as VisualStyle)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {styleOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Shot Count */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target Shots</span>
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {targetShotCount} shots
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="1"
                value={targetShotCount}
                onChange={(e) => setTargetShotCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>4 (Fast Beat)</span>
                <span>8 (Standard)</span>
                <span>12 (Comprehensive)</span>
              </div>
            </div>

            {/* Script Breakdown Model */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Screenplay AI Engine</span>
              </label>
              <select
                value={modelPreference}
                onChange={(e) => setModelPreference(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Rapid Breakdown)</option>
                <option value="gemini-4-argon">Gemini 4 Argon (Deep Cinematography Analysis)</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-orange-950/40 transition-all active:scale-95 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>Decomposing Screenplay into Storyboard...</span>
              </>
            ) : (
              <>
                <span>Generate Storyboard Sequence</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
