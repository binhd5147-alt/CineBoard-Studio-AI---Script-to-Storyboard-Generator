import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GenerationSettingsBar } from './components/GenerationSettingsBar';
import { StoryboardGrid } from './components/StoryboardGrid';
import { ThreeStagePreViz } from './components/ThreeStagePreViz';
import { DirectorChatbot } from './components/DirectorChatbot';
import { ScriptUploadModal } from './components/ScriptUploadModal';
import { AnimaticPlayer } from './components/AnimaticPlayer';
import { ExportModal } from './components/ExportModal';
import { ScriptEditorView } from './components/ScriptEditorView';
import { SAMPLE_SCRIPTS } from './data/sampleScripts';
import {
  StoryboardProject,
  Shot,
  ImageResolution,
  AspectRatioOption,
  VisualStyle,
} from './types/storyboard';

export default function App() {
  // Initial default project loaded with rich sample scene
  const initialSample = SAMPLE_SCRIPTS[0];
  const [project, setProject] = useState<StoryboardProject>({
    id: 'project-default',
    title: initialSample.title,
    logline: initialSample.logline,
    genre: initialSample.genre,
    rawScript: initialSample.script,
    recommendedAspectRatio: '16:9',
    characters: [
      {
        name: 'KIRA',
        visualDescription: 'Cyberpunk operative, matte-black tactical cloak, glowing amber neural optic temple implants, dual plasma daggers.',
      },
      {
        name: 'CYBERNETIC ENFORCER',
        visualDescription: 'Eight-foot towering armored combat android, heavy titanium plating, rotary coilgun arm, crimson optical visor.',
      },
    ],
    shots: [
      {
        id: 'shot-1',
        shotNumber: 1,
        shotType: 'EXTREME WIDE SHOT',
        cameraMovement: 'Slow Crane Downward',
        lensFocalLength: '18mm Ultra-Wide',
        action: 'Torrential rain lashes against Neo-Kowloon carbon-glass skyscrapers. Neon cyan and magenta holographic billboards reflect in slick puddles on the rooftop.',
        lightingMood: 'High contrast rainy cyberpunk night, cyan holographic glow and amber street vapor',
        visualPrompt: 'Cinematic film still, extreme wide establishing shot of futuristic cyberpunk megacity rooftop in pouring rain, neon signs in cyan and magenta, towering carbon architecture, 35mm anamorphic lens, volumetric steam, atmospheric depth.',
        estimatedDurationSec: 4.0,
      },
      {
        id: 'shot-2',
        shotNumber: 2,
        shotType: 'MEDIUM CLOSE-UP',
        cameraMovement: 'Static with Wind Gusts',
        lensFocalLength: '50mm Prime',
        action: 'Kira crouches near the exhaust vent edge, tactical hood drawn low, droplets beading on her skin. Amber neural optics glow faintly along her right temple.',
        dialogue: 'KIRA: "Security grid cycling in ten seconds. If the pulse drops, I\'m dropping with it."',
        lightingMood: 'Dim cool top-light with warm amber rim light from cybernetic implants',
        visualPrompt: 'Cinematic close-up of female cyberpunk operative Kira, rain-slick skin, glowing amber temple implants, tactical high-collar cloak, determined expression, dramatic rim lighting, shallow depth of field, anamorphic bokeh.',
        estimatedDurationSec: 3.5,
      },
      {
        id: 'shot-3',
        shotNumber: 3,
        shotType: 'LOW ANGLE HERO SHOT',
        cameraMovement: 'Fast Dolly-In',
        lensFocalLength: '24mm Wide Anamorphic',
        action: 'Kira lands in crouched three-point stance on obsidian sanctuary floor. Thousands of bioluminescent quantum server pods rise into the darkness.',
        lightingMood: 'Deep emerald bioluminescent floor arrays with dark atmospheric ceiling',
        visualPrompt: 'Dramatic low-angle shot of female assassin landing on glossy black sanctuary floor, green bioluminescent quantum servers towering into infinity, reflective obsidian floor, smoke swirls, cinematic action composition.',
        estimatedDurationSec: 3.0,
      },
      {
        id: 'shot-4',
        shotNumber: 4,
        shotType: 'OVER THE SHOULDER',
        cameraMovement: 'Tracking Push-In',
        lensFocalLength: '35mm Classic',
        action: 'From behind Kira\'s shoulder, a massive seven-foot Cybernetic Enforcer emerges through steam curtains, rotary coilgun spinning up.',
        dialogue: 'KIRA: "Took you long enough."',
        lightingMood: 'Menacing crimson laser targeting lights piercing dense white steam',
        visualPrompt: 'Over-the-shoulder framing looking at a massive menacing cybernetic war android emerging from dense steam, red laser sight glowing, dramatic chiaroscuro lighting, tense confrontation, cinematic filmstill.',
        estimatedDurationSec: 4.0,
      },
      {
        id: 'shot-5',
        shotNumber: 5,
        shotType: 'DUTCH ANGLE',
        cameraMovement: 'Whip Tilt',
        lensFocalLength: '28mm Wide Angle',
        action: 'Kira ignites twin electric blue plasma daggers, sparks crackling against the damp atmosphere as the Enforcer charges.',
        soundEffect: 'High-pitch plasma hum and heavy hydraulic footsteps',
        lightingMood: 'Vibrant electric cyan plasma flash illuminating the shadowed chamber',
        visualPrompt: 'Tilted Dutch angle dynamic shot, cyberpunk fighter activating glowing electric blue plasma blades, sparks flying, high kinetic action pose, metallic reflections, cinematic lighting, 8k detail.',
        estimatedDurationSec: 3.5,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Active view mode
  const [activeView, setActiveView] = useState<'grid' | 'script' | 'previz'>('grid');

  // Currently selected shot for inspection or 3D staging
  const [activeShotId, setActiveShotId] = useState<string | null>('shot-1');

  // Image Generation Settings (Affordance for 1K, 2K, 4K)
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('16:9');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('Cinematic Film Still (35mm Anamorphic)');
  const [modelPreference, setModelPreference] = useState<string>('gemini-3-pro-image-preview');

  // Modals & Panels
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAnimaticOpen, setIsAnimaticOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Batch Generation State
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  const activeShot = project.shots.find((s) => s.id === activeShotId) || project.shots[0];
  const totalImagesGenerated = project.shots.filter((s) => Boolean(s.imageUrl)).length;
  const pendingImagesCount = project.shots.filter((s) => !s.imageUrl).length;

  // Single shot image generation
  const handleGenerateShotImage = async (shotId: string) => {
    const targetShot = project.shots.find((s) => s.id === shotId);
    if (!targetShot) return;

    // Set generating flag on shot
    setProject((prev) => ({
      ...prev,
      shots: prev.shots.map((s) =>
        s.id === shotId ? { ...s, isGenerating: true, generationError: undefined } : s
      ),
    }));

    try {
      // Build character consistency notes
      const charNotes = project.characters
        ?.map((c) => `${c.name}: ${c.visualDescription}`)
        .join('; ');

      const response = await fetch('/api/generate-shot-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetShot.visualPrompt || targetShot.action,
          stylePreset: visualStyle,
          aspectRatio,
          imageSize: resolution, // Affordance for 1K, 2K, 4K
          modelPreference,
          characterConsistencyNotes: charNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate frame image');
      }

      setProject((prev) => ({
        ...prev,
        shots: prev.shots.map((s) =>
          s.id === shotId
            ? {
                ...s,
                imageUrl: data.imageUrl,
                isGenerating: false,
                generationError: undefined,
              }
            : s
        ),
      }));
    } catch (err: any) {
      console.error('Error generating shot image:', err);
      setProject((prev) => ({
        ...prev,
        shots: prev.shots.map((s) =>
          s.id === shotId
            ? {
                ...s,
                isGenerating: false,
                generationError: err.message || 'Generation failed',
              }
            : s
        ),
      }));
    }
  };

  // Batch generate all pending images sequentially
  const handleGenerateAllPending = async () => {
    if (isBatchGenerating) return;
    setIsBatchGenerating(true);

    const shotsToProcess = project.shots.filter((s) => !s.imageUrl);
    const targetQueue = shotsToProcess.length > 0 ? shotsToProcess : project.shots;

    for (const shot of targetQueue) {
      await handleGenerateShotImage(shot.id);
    }

    setIsBatchGenerating(false);
  };

  // Handle screenplay parsed from upload
  const handleScriptParsed = (data: any, originalScript: string) => {
    const newShots: Shot[] = (data.shots || []).map((s: any, idx: number) => ({
      id: `shot-${Date.now()}-${idx + 1}`,
      shotNumber: s.shotNumber || idx + 1,
      shotType: s.shotType || 'MEDIUM SHOT',
      cameraMovement: s.cameraMovement || 'Static',
      lensFocalLength: s.lensFocalLength || '35mm Classic',
      action: s.action || '',
      dialogue: s.dialogue || undefined,
      lightingMood: s.lightingMood || 'Cinematic chiaroscuro',
      visualPrompt: s.visualPrompt || s.action || '',
      estimatedDurationSec: s.estimatedDurationSec || 3.5,
      imageUrl: undefined,
    }));

    setProject({
      id: `project-${Date.now()}`,
      title: data.title || 'Screenplay Sequence',
      logline: data.logline || '',
      genre: data.genre || 'Cinematic Drama',
      rawScript: originalScript,
      recommendedAspectRatio: data.recommendedAspectRatio || '16:9',
      characters: data.characters || [],
      shots: newShots,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (newShots.length > 0) {
      setActiveShotId(newShots[0].id);
    }
    setActiveView('grid');
  };

  // Shot CRUD operations
  const handleUpdateShot = (updatedShot: Shot) => {
    setProject((prev) => ({
      ...prev,
      shots: prev.shots.map((s) => (s.id === updatedShot.id ? updatedShot : s)),
    }));
  };

  const handleDeleteShot = (shotId: string) => {
    setProject((prev) => {
      const filtered = prev.shots.filter((s) => s.id !== shotId);
      // Renumber shots
      const renumbered = filtered.map((s, idx) => ({ ...s, shotNumber: idx + 1 }));
      return { ...prev, shots: renumbered };
    });
  };

  const handleDuplicateShot = (shotId: string) => {
    const idx = project.shots.findIndex((s) => s.id === shotId);
    if (idx === -1) return;
    const target = project.shots[idx];
    const newShot: Shot = {
      ...target,
      id: `shot-${Date.now()}`,
      shotNumber: target.shotNumber + 1,
      action: `${target.action} (Continuation / Alternate angle)`,
      imageUrl: undefined,
    };

    const newShots = [...project.shots];
    newShots.splice(idx + 1, 0, newShot);
    const renumbered = newShots.map((s, i) => ({ ...s, shotNumber: i + 1 }));
    setProject((prev) => ({ ...prev, shots: renumbered }));
  };

  const handleAddNewShotAt = (index: number) => {
    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      shotNumber: index + 1,
      shotType: 'MEDIUM SHOT',
      cameraMovement: 'Static',
      lensFocalLength: '35mm Prime',
      action: 'New action description for scene beat...',
      lightingMood: 'Cinematic key light with subtle fill',
      visualPrompt: 'Cinematic film still, dynamic composition, dramatic lighting, detailed film production concept frame.',
      estimatedDurationSec: 3.0,
    };

    const newShots = [...project.shots];
    newShots.splice(index, 0, newShot);
    const renumbered = newShots.map((s, i) => ({ ...s, shotNumber: i + 1 }));
    setProject((prev) => ({ ...prev, shots: renumbered }));
    setActiveShotId(newShot.id);
  };

  const handleMoveShot = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.shots.length) return;

    const newShots = [...project.shots];
    const temp = newShots[index];
    newShots[index] = newShots[targetIndex];
    newShots[targetIndex] = temp;

    const renumbered = newShots.map((s, i) => ({ ...s, shotNumber: i + 1 }));
    setProject((prev) => ({ ...prev, shots: renumbered }));
  };

  // Apply 3D Camera framing to the active shot
  const handleApplyCameraToShot = (cameraData: {
    shotType: string;
    focalLength: string;
    cameraMovement: string;
    framingNotes: string;
  }) => {
    if (!activeShot) return;

    const updatedPrompt = `${activeShot.visualPrompt}. [Framing: ${cameraData.shotType}, ${cameraData.focalLength}, ${cameraData.framingNotes}]`;

    handleUpdateShot({
      ...activeShot,
      shotType: cameraData.shotType,
      lensFocalLength: cameraData.focalLength,
      cameraMovement: cameraData.cameraMovement,
      visualPrompt: updatedPrompt,
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Main Navigation */}
      <Navbar
        project={project}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAnimatic={() => setIsAnimaticOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        totalImagesGenerated={totalImagesGenerated}
      />

      {/* Generation Bar with 1K / 2K / 4K affordance and aspect ratio */}
      {activeView === 'grid' && (
        <GenerationSettingsBar
          resolution={resolution}
          onResolutionChange={setResolution}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          visualStyle={visualStyle}
          onVisualStyleChange={setVisualStyle}
          model={modelPreference}
          onModelChange={setModelPreference}
          onGenerateAllPending={handleGenerateAllPending}
          onAddNewShot={() => handleAddNewShotAt(project.shots.length)}
          isBatchGenerating={isBatchGenerating}
          pendingCount={pendingImagesCount}
          totalCount={project.shots.length}
        />
      )}

      {/* Main Workspace Body & Copilot Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeView === 'grid' && (
            <StoryboardGrid
              shots={project.shots}
              activeShotId={activeShotId}
              onSelectShot={(s) => setActiveShotId(s.id)}
              onGenerateShotImage={handleGenerateShotImage}
              onUpdateShot={handleUpdateShot}
              onDeleteShot={handleDeleteShot}
              onDuplicateShot={handleDuplicateShot}
              onMoveShot={handleMoveShot}
              onOpenPreVizForShot={(s) => {
                setActiveShotId(s.id);
                setActiveView('previz');
              }}
              onAddNewShotAt={handleAddNewShotAt}
              currentResolution={resolution}
              aspectRatio={aspectRatio}
              visualStyle={visualStyle}
            />
          )}

          {activeView === 'script' && (
            <ScriptEditorView
              project={project}
              activeShotId={activeShotId}
              onSelectShot={(s) => setActiveShotId(s.id)}
              onUpdateShot={handleUpdateShot}
              onUpdateRawScript={(raw) => setProject((prev) => ({ ...prev, rawScript: raw }))}
            />
          )}

          {activeView === 'previz' && (
            <ThreeStagePreViz
              activeShot={activeShot}
              onApplyCameraToShot={handleApplyCameraToShot}
            />
          )}
        </main>

        {/* Collapsible AI Director Copilot Right Drawer (Multi-turn Gemini Chatbot) */}
        {isChatOpen && (
          <aside className="w-80 md:w-96 h-full shrink-0 shadow-2xl relative z-30 transition-all">
            <DirectorChatbot
              project={project}
              activeShot={activeShot}
              onAddShotFromSuggestion={(suggested) => {
                handleAddNewShotAt(project.shots.length);
              }}
              onApplyPromptImprovement={(improvedPrompt) => {
                if (activeShot) {
                  handleUpdateShot({ ...activeShot, visualPrompt: improvedPrompt });
                }
              }}
            />
          </aside>
        )}
      </div>

      {/* Modals */}
      <ScriptUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onScriptParsed={handleScriptParsed}
      />

      <AnimaticPlayer
        shots={project.shots}
        isOpen={isAnimaticOpen}
        onClose={() => setIsAnimaticOpen(false)}
        aspectRatio={aspectRatio}
      />

      <ExportModal
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
