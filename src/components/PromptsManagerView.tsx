import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Copy,
  Trash2,
  Edit2,
  Sparkles,
  HelpCircle,
  Tag,
  Save,
  Check,
} from 'lucide-react';
import { AgencySettings, AuditPrompt } from '../types';

interface PromptsManagerViewProps {
  prompts: AuditPrompt[];
  setPrompts: React.Dispatch<React.SetStateAction<AuditPrompt[]>>;
  settings: AgencySettings;
  setSettings: React.Dispatch<React.SetStateAction<AgencySettings>>;
}

export const PromptsManagerView: React.FC<PromptsManagerViewProps> = ({
  prompts,
  setPrompts,
  settings,
  setSettings,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [newTags, setNewTags] = useState('Local SEO, Custom');
  const [isCreating, setIsCreating] = useState(false);

  const availableVariables = [
    { tag: '{{business_name}}', desc: 'Prospect business name' },
    { tag: '{{industry}}', desc: 'Business category / niche' },
    { tag: '{{location}}', desc: 'City and state' },
    { tag: '{{website}}', desc: 'Target website URL' },
    { tag: '{{phone}}', desc: 'Contact phone number' },
    { tag: '{{rating}}', desc: 'Google Maps rating (e.g. 4.7)' },
    { tag: '{{reviews_count}}', desc: 'Google reviews count' },
    { tag: '{{annual_fee}}', desc: 'Agency annual price' },
    { tag: '{{agency_name}}', desc: 'Your agency brand name' },
    { tag: '{{currency}}', desc: 'Currency symbol (₹, $, £, etc.)' },
  ];

  const handleSetActive = (promptId: string) => {
    setSettings((prev) => ({
      ...prev,
      activePromptId: promptId,
    }));
  };

  const handleInsertTag = (tag: string) => {
    if (isCreating) {
      setNewTemplate((prev) => `${prev} ${tag}`);
    }
  };

  const handleSaveNewPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTemplate.trim()) return;

    const newPrompt: AuditPrompt = {
      id: `prompt-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Custom audit and pitch prompt.',
      isDefault: false,
      userTemplate: newTemplate.trim(),
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    setPrompts((prev) => [...prev, newPrompt]);
    setSettings((prev) => ({ ...prev, activePromptId: newPrompt.id }));

    setNewTitle('');
    setNewDescription('');
    setNewTemplate('');
    setIsCreating(false);
  };

  const handleDeletePrompt = (id: string) => {
    if (prompts.find((p) => p.id === id)?.isDefault) {
      alert('Default prompt cannot be deleted.');
      return;
    }
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    if (settings.activePromptId === id) {
      setSettings((prev) => ({ ...prev, activePromptId: 'prompt-default-audit-roi' }));
    }
  };

  const handleDuplicatePrompt = (prompt: AuditPrompt) => {
    const dup: AuditPrompt = {
      ...prompt,
      id: `prompt-${Date.now()}`,
      title: `${prompt.title} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    setPrompts((prev) => [...prev, dup]);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner - Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
              Prompt Engineering
            </span>
            <span className="text-xs text-slate-500 font-medium">PDF Report & Pitch AI Prompts</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1 font-['Outfit']">
            AI Prompts Library & Customizer
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Configure the instructions AI uses to audit websites, pinpoint negative ranking issues, and calculate break-even ROI in {settings.currency || '₹'}.
          </p>
        </div>

        {/* Button shifted below description instead of on the right side */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Cancel Creation' : 'Add New Custom Prompt'}</span>
          </button>

          <span className="text-xs text-slate-400 font-medium ml-auto hidden sm:inline">
            Active Prompt ID: <strong className="text-slate-800">{settings.activePromptId}</strong>
          </span>
        </div>
      </div>

      {/* New Prompt Creator Modal/Drawer */}
      {isCreating && (
        <form onSubmit={handleSaveNewPrompt} className="bg-white border border-orange-300 rounded-2xl p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base font-['Outfit'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Create New Audit & Pitch Prompt</span>
            </h3>
            <span className="text-xs text-slate-500">Saved to library</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prompt Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Ultra-Aggressive 3-Pack Takeover Pitch"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="e.g. Aggressive, Roofing, High Ticket"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Description / Strategy
            </label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g. Compares their listing with top competitor and emphasizes lost calls."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          {/* Variable tag insertion pills */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-orange-600" />
              <span>Click to Insert Dynamic Placeholder Tags:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableVariables.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleInsertTag(v.tag)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-orange-100 text-orange-800 border border-slate-200 hover:border-orange-300 text-[11px] font-mono transition-all cursor-pointer"
                  title={v.desc}
                >
                  {v.tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Prompt Instructions & Strategy Template
            </label>
            <textarea
              rows={8}
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              placeholder="Conduct an in-depth technical Local SEO audit for {{business_name}} located in {{location}}..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:bg-white leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Save Prompt to Library
            </button>
          </div>
        </form>
      )}

      {/* Prompts Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prompts.map((prompt) => {
          const isActive = settings.activePromptId === prompt.id;

          return (
            <div
              key={prompt.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all relative ${
                isActive
                  ? 'border-orange-500 ring-2 ring-orange-200'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">{prompt.title}</h3>
                      {prompt.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          System Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prompt.description}</p>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-600 text-white shadow-xs shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In-Use
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActive(prompt.id)}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 shrink-0 transition-all cursor-pointer"
                    >
                      Set as In-Use
                    </button>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {prompt.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Prompt Template Preview */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] font-mono text-slate-700 line-clamp-4 leading-relaxed mb-4">
                  {prompt.userTemplate}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  Added {new Date(prompt.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicatePrompt(prompt)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                    title="Duplicate prompt"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {!prompt.isDefault && (
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                      title="Delete prompt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
