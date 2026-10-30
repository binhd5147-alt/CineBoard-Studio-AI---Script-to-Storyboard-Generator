export type ShotType =
  | 'EXTREME WIDE SHOT'
  | 'WIDE SHOT'
  | 'FULL SHOT'
  | 'MEDIUM SHOT'
  | 'MEDIUM CLOSE-UP'
  | 'CLOSE-UP'
  | 'EXTREME CLOSE-UP'
  | 'OVER THE SHOULDER'
  | 'DUTCH ANGLE'
  | 'LOW ANGLE'
  | 'HIGH ANGLE'
  | 'BIRDS EYE VIEW'
  | 'POV SHOT'
  | 'TRACKING SHOT';

export type CameraMovement =
  | 'Static'
  | 'Slow Dolly In'
  | 'Dolly Out'
  | 'Pan Left'
  | 'Pan Right'
  | 'Tilt Up'
  | 'Tilt Down'
  | 'Tracking Steadicam'
  | 'Handheld Jitter'
  | 'Crane Boom Down'
  | 'Orbit 360';

export interface Shot {
  id: string;
  shotNumber: number;
  shotType: ShotType | string;
  cameraMovement: CameraMovement | string;
  lensFocalLength: string;
  action: string;
  dialogue?: string;
  soundEffect?: string;
  lightingMood: string;
  visualPrompt: string;
  estimatedDurationSec: number;
  imageUrl?: string;
  isGenerating?: boolean;
  generationError?: string;
}

export interface Character {
  name: string;
  visualDescription: string;
}

export interface StoryboardProject {
  id: string;
  title: string;
  logline: string;
  genre: string;
  rawScript: string;
  recommendedAspectRatio: string;
  characters: Character[];
  shots: Shot[];
  createdAt: number;
  updatedAt: number;
}

export type VisualStyle =
  | 'Cinematic Film Still (35mm Anamorphic)'
  | 'Graphic Novel Noir (High-Contrast Ink)'
  | 'Hollywood Production Pencil Sketch'
  | 'Anime & Animation Keyframe'
  | 'Hyper-Realistic Concept Matte';

export type ImageResolution = '1K' | '2K' | '4K';

export type AspectRatioOption = '16:9' | '2.39:1' | '4:3' | '1:1' | '9:16';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

export type ChatRole = 'director' | 'cinematographer' | 'script_doctor';
