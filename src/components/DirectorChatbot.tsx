import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Brain,
  Film,
  Camera,
  BookOpen,
  PlusCircle,
  RotateCcw,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { ChatMessage, ChatRole, StoryboardProject, Shot } from '../types/storyboard';

interface DirectorChatbotProps {
  project?: StoryboardProject | null;
  activeShot?: Shot | null;
  onAddShotFromSuggestion?: (suggestedShot: Partial<Shot>) => void;
  onApplyPromptImprovement?: (newPrompt: string) => void;
}

export const DirectorChatbot: React.FC<DirectorChatbotProps> = ({
  project,
  activeShot,
  onAddShotFromSuggestion,
  onApplyPromptImprovement,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to CineBoard Copilot. I'm your virtual production partner. 

Whether you need to brainstorm shot coverage, optimize your prompts for **Gemini 3 Pro (1K/2K/4K)**, or get feedback on scene blocking, I'm here to help. Select a role and model above, or ask me anything!`,
      timestamp: Date.now(),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRole>('director');
  const [selectedModel, setSelectedModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            text: m.content,
          })),
          modelPreference: selectedModel,
          role: selectedRole,
          currentSceneContext: {
            projectTitle: project?.title || 'Untitled Scene',
            genre: project?.genre || 'Cinematic',
            totalShots: project?.shots?.length || 0,
            activeShotNumber: activeShot?.shotNumber,
            activeShotType: activeShot?.shotType,
            activeShotAction: activeShot?.action,
            activeShotVisualPrompt: activeShot?.visualPrompt,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response returned.',
        timestamp: Date.now(),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to connect to AI server.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    {
      label: 'Suggest Coverage',
      text: 'Analyze our current scene shots and suggest 2 missing coverage angles (like reaction inserts or establishing shots) that would elevate the edit.',
    },
    {
      label: 'Enhance Prompt for 4K',
      text: activeShot
        ? `Improve the visual prompt for Shot #${activeShot.shotNumber} (${activeShot.shotType}) to maximize detail for Gemini 3 Pro 4K image generation.`
        : 'Give me tips to craft high-impact 4K cinematic visual prompts for storyboard shots.',
    },
    {
      label: 'Lighting Consultation',
      text: 'What lighting setup, color temperature contrast, and atmosphere would best accentuate the emotional tone of this scene?',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-200">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                <span>AI Director Copilot</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  Multi-Turn
                </span>
              </h3>
              <p className="text-xs text-slate-400">Collaborative Screenplay & Visual Consultant</p>
            </div>
          </div>
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'welcome-reset',
                  role: 'assistant',
                  content: 'Chat reset. How can I assist with your scene or storyboard today?',
                  timestamp: Date.now(),
                },
              ])
            }
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Role & Model Selectors */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Persona Role */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
              {selectedRole === 'director' && <Film className="w-3 h-3 text-amber-400" />}
              {selectedRole === 'cinematographer' && <Camera className="w-3 h-3 text-cyan-400" />}
              {selectedRole === 'script_doctor' && <BookOpen className="w-3 h-3 text-emerald-400" />}
              <span>Persona</span>
            </span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ChatRole)}
              className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="director">Director (Vision)</option>
              <option value="cinematographer">Cinematographer (Lenses/Light)</option>
              <option value="script_doctor">Script Doctor (Story/Pacing)</option>
            </select>
          </div>

          {/* Model Selector (Required: gemini-4-argon, gemini-3.8-flash, gemini-3.1-flash-lite) */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
              {selectedModel === 'gemini-4-argon' && <Brain className="w-3 h-3 text-purple-400" />}
              {selectedModel === 'gemini-3.8-flash' && <Sparkles className="w-3 h-3 text-amber-400" />}
              {selectedModel === 'gemini-3.1-flash-lite' && <Zap className="w-3 h-3 text-cyan-400" />}
              <span>Model</span>
            </span>
            <select
              value={selectedModel}
              onChange={(e) =>
                setSelectedModel(
                  e.target.value as 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'
                )
              }
              className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="gemini-4-argon">Gemini 4 Argon (Deep Reasoning)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (General)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Message Thread (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 text-sm ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-cyan-300 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-750'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{message.content}</div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/50 pt-1">
                  <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {message.modelUsed && (
                    <span className="font-mono text-[9px] px-1 rounded bg-slate-900 text-slate-400">
                      {message.modelUsed}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 text-sm">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/80 border border-slate-750 rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
              <span>Thinking with {selectedModel}...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/40 flex flex-wrap gap-1.5">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.text)}
            disabled={isLoading}
            className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask the ${selectedRole}... (Shift+Enter for newline)`}
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 pr-10 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 bottom-2.5 p-1.5 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
