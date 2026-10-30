import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side Google GenAI client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Script Breakdown into Scene & Shots
app.post('/api/breakdown-script', async (req: Request, res: Response) => {
  try {
    const { scriptText, targetShotCount, modelPreference, visualStyle } = req.body;
    if (!scriptText || typeof scriptText !== 'string' || !scriptText.trim()) {
      return res.status(400).json({ error: 'Script text is required.' });
    }

    const ai = getAiClient();
    const modelToUse = modelPreference === 'gemini-4-argon' ? 'gemini-4-argon' : 'gemini-3.8-flash';

    const systemInstruction = `You are a world-class Hollywood film director, storyboard artist, and cinematographer.
Analyze the provided screenplay or story scene and decompose it into a sequence of compelling, cinematic storyboard shots.
The goal is to produce visual keyframe descriptions ready for image generation.

For each shot:
- shotNumber: sequential integer starting from 1
- shotType: e.g. "EXTREME WIDE SHOT", "WIDE SHOT", "MEDIUM CLOSE-UP", "EXTREME CLOSE-UP", "OVER THE SHOULDER", "DUTCH ANGLE", "LOW ANGLE HERO SHOT", "BIRDS EYE VIEW", "POV SHOT"
- cameraMovement: e.g. "Static camera", "Slow Push-In Dolly", "Whip Pan Left", "Tracking Steadicam", "Handheld Jitter", "Crane Boom Down"
- lensFocalLength: e.g. "18mm Ultra-Wide", "24mm Wide Anamorphic", "35mm Classic", "50mm Prime", "85mm Portrait", "135mm Telephoto"
- action: concise description of action happening in frame
- dialogue: spoken line if applicable (e.g. 'DETECTIVE: "We are out of time."') or ""
- lightingMood: atmospheric lighting description (e.g. "High-contrast chiaroscuro, neon cyan rim lights through pouring rain, warm amber street reflection")
- visualPrompt: Highly detailed, self-contained visual prompt engineered for image synthesis. Describe subject, exact composition, framing, posture, expression, costume details, environmental backdrop, color palette, lighting quality, and depth of field. Never use filler words. Avoid photorealistic camera artifact terms that might trigger filters. Integrate the chosen visual style (${visualStyle || 'Cinematic Film Still'}).
- estimatedDurationSec: float (e.g. 2.5 to 5.0)

Aim for around ${targetShotCount || 6} to 10 key storyboard beats that capture the emotional and visual progression of the sequence.`;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: `Please break down this screenplay script into a complete storyboard sequence:\n\n${scriptText}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Title or scene slugline' },
            logline: { type: Type.STRING, description: 'One-sentence summary of what happens in this scene' },
            genre: { type: Type.STRING, description: 'Film genre (e.g. Sci-Fi Noir, Cyberpunk, Drama, Thriller, Action)' },
            recommendedAspectRatio: { type: Type.STRING, description: 'e.g. 16:9 or 2.39:1' },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  visualDescription: { type: Type.STRING, description: 'Physical appearance, wardrobe, notable features for visual consistency' },
                },
                required: ['name', 'visualDescription'],
              },
            },
            shots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  shotNumber: { type: Type.INTEGER },
                  shotType: { type: Type.STRING },
                  cameraMovement: { type: Type.STRING },
                  lensFocalLength: { type: Type.STRING },
                  action: { type: Type.STRING },
                  dialogue: { type: Type.STRING },
                  lightingMood: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  estimatedDurationSec: { type: Type.NUMBER },
                },
                required: [
                  'shotNumber',
                  'shotType',
                  'cameraMovement',
                  'lensFocalLength',
                  'action',
                  'lightingMood',
                  'visualPrompt',
                  'estimatedDurationSec',
                ],
              },
            },
          },
          required: ['title', 'logline', 'genre', 'shots'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in script breakdown:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to breakdown script.',
    });
  }
});

// API: Generate Image for a Storyboard Shot
// Must support gemini-3-pro-image-preview and image sizes 1K, 2K, 4K
app.post('/api/generate-shot-image', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      stylePreset,
      aspectRatio = '16:9',
      imageSize = '1K',
      modelPreference = 'gemini-3-pro-image-preview',
      characterConsistencyNotes,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const ai = getAiClient();

    // Compose styled prompt
    let fullPrompt = prompt;
    if (stylePreset) {
      fullPrompt = `[Visual Style: ${stylePreset}] ${fullPrompt}`;
    }
    if (characterConsistencyNotes) {
      fullPrompt = `${fullPrompt}. Character consistency details: ${characterConsistencyNotes}`;
    }
    fullPrompt = `${fullPrompt}. Masterpiece cinematic storyboard frame, dynamic composition, dramatic lighting, rich textures, film production concept art.`;

    // Map aspect ratio to Gemini supported formats: "1:1", "3:4", "4:3", "9:16", "16:9", "1:4", "1:8", "4:1", "8:1"
    let mappedAspectRatio = aspectRatio;
    if (aspectRatio === '2.39:1' || aspectRatio === '21:9') {
      mappedAspectRatio = '16:9'; // Highest widescreen standard
    }
    if (!['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'].includes(mappedAspectRatio)) {
      mappedAspectRatio = '16:9';
    }

    // Valid sizes: "1K", "2K", "4K"
    const validImageSize = ['1K', '2K', '4K'].includes(imageSize) ? imageSize : '1K';

    // Model waterfall priority: gemini-3-pro-image-preview -> gemini-3-pro-image -> gemini-nano-banana-2.1 -> gemini-3.1-flash-lite-image
    const candidateModels = [
      modelPreference,
      'gemini-3-pro-image-preview',
      'gemini-3-pro-image',
      'gemini-nano-banana-2.1',
      'gemini-3.1-flash-lite-image',
    ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

    let lastError: any = null;
    let base64ImageUrl: string | null = null;
    let usedModel: string = '';

    for (const currentModel of candidateModels) {
      try {
        const isFlashLite = currentModel.includes('flash-lite');
        const config: any = {
          imageConfig: {
            aspectRatio: mappedAspectRatio,
            ...(!isFlashLite ? { imageSize: validImageSize } : {}),
          },
        };

        const response = await ai.models.generateContent({
          model: currentModel,
          contents: {
            parts: [{ text: fullPrompt }],
          },
          config,
        });

        // Scan parts for image data
        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            base64ImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            usedModel = currentModel;
            break;
          }
        }

        if (base64ImageUrl) {
          break; // Successfully got image
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${currentModel} failed for image generation:`, err?.message || err);
        // Continue loop to try next model in fallback chain
      }
    }

    if (!base64ImageUrl) {
      throw lastError || new Error('No image was returned by the generative model.');
    }

    return res.json({
      success: true,
      imageUrl: base64ImageUrl,
      modelUsed: usedModel,
      aspectRatio: mappedAspectRatio,
      imageSize: validImageSize,
    });
  } catch (error: any) {
    console.error('Error generating shot image:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate shot image.',
    });
  }
});

// API: Multi-turn Director / Screenplay AI Chatbot
// Supports gemini-4-argon for complex analysis, gemini-3.8-flash for general, gemini-3.1-flash-lite for fast tasks
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      modelPreference = 'gemini-3.8-flash',
      role = 'director',
      currentSceneContext,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAiClient();

    let modelToUse = 'gemini-3.8-flash';
    if (modelPreference === 'gemini-4-argon') {
      modelToUse = 'gemini-4-argon';
    } else if (modelPreference === 'gemini-3.1-flash-lite') {
      modelToUse = 'gemini-3.1-flash-lite';
    }

    let roleInstruction = '';
    if (role === 'cinematographer') {
      roleInstruction = `You are a legendary Director of Photography (Cinematographer). You specialize in camera angles, optical focal lengths, anamorphic vs spherical glass, key-fill ratios, color temperature, framing grammar (rule of thirds, leading lines, negative space), and camera movements (dolly, crane, tracking). Give concise, punchy, actionable advice to make shots more visually arresting.`;
    } else if (role === 'script_doctor') {
      roleInstruction = `You are a veteran Hollywood script doctor and story editor. You excel in dramatic tension, subtext, character arcs, pacing beats, cutting redundant dialogue, and visual storytelling ("show, don't tell"). Provide insightful critiques and concrete scene improvements.`;
    } else {
      // Default Director
      roleInstruction = `You are an accomplished film director and visual storyteller. You oversee the overall vision, tone, actor performance cues, pacing, and visual sequence of the storyboard. You help the user craft compelling shots, suggest missing coverage (inserts, reaction shots, establishing vistas), and refine visual prompts.`;
    }

    if (currentSceneContext) {
      roleInstruction += `\n\nCURRENT PRODUCTION CONTEXT:\n${JSON.stringify(currentSceneContext, null, 2)}`;
    }

    // Convert messages to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents,
      config: {
        systemInstruction: roleInstruction,
      },
    });

    const reply = response.text || '';
    return res.json({ success: true, reply, modelUsed: modelToUse });
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({
      error: error?.message || 'Chat generation failed.',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineBoard Studio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
