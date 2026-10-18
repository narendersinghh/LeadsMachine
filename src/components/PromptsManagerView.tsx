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
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [newTags, setNewTags] = useState('Local SEO, Custom');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const availableVariables = [
    { tag: '{{business_name}}', desc: 'Prospect business name' },
    { tag: '{{industry}}', desc: 'Business category / niche' },
    { tag: '{{location}}', desc: 'City and state' },
    { tag: '{{website}}', desc: 'Target website URL' },
    { tag: '{{phone}}', desc: 'Contact phone number' },
    { tag: '{{rating}}', desc: 'Google Maps rating (e.g. 4.7)' },
    { tag: '{{reviews_count}}', desc: 'Google reviews count' },
    { tag: '{{annual_fee}}', desc: 'Agency annual price' },
    { tag: '{{lead_value}}', desc: 'Industry avg converted lead value' },
    { tag: '{{agency_name}}', desc: 'Your agency brand name' },
    { tag: '{{currency}}', desc: 'Currency symbol ($, £, etc.)' },
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
    // Optionally make it active immediately
    setSettings((prev) => ({ ...prev, activePromptId: newPrompt.id }));

    // Reset
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
    <div className="space-y-6 pb-12">
      {/* Header banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Prompt Engineering
            </span>
            <span className="text-xs text-slate-400">PDF Report & Pitch AI Prompts</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1 font-['Outfit']">
            AI Prompts Library & Customizer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Configure the exact instructions the AI uses to audit websites, pinpoint negative ranking issues, and calculate the break-even ROI formula. Select the active prompt in-use or add new ones.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel' : 'Add New Prompt'}</span>
        </button>
      </div>

      {/* New Prompt Creator Modal/Drawer */}
      {isCreating && (
        <form onSubmit={handleSaveNewPrompt} className="bg-slate-900 border border-orange-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-100 text-base font-['Outfit'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Create New Audit & Pitch Prompt</span>
            </h3>
            <span className="text-xs text-slate-400">Will be saved to your library</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Prompt Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Ultra-Aggressive 3-Pack Takeover Pitch"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="e.g. Aggressive, Roofing, High Ticket"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Short Description / Strategy
            </label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g. Compares their listing with the #1 competitor and emphasizes emergency call loss."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Variable tag insertion pills */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-orange-400" />
              <span>Click to Insert Dynamic Placeholder Tags:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableVariables.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleInsertTag(v.tag)}
                  className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-orange-500/20 text-orange-300 border border-slate-800 hover:border-orange-500/40 text-[11px] font-mono transition-all"
                  title={v.desc}
                >
                  {v.tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Prompt Instructions & Strategy Template
            </label>
            <textarea
              rows={8}
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              placeholder="Conduct an in-depth technical Local SEO audit for {{business_name}} located in {{location}}..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-orange-500 leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs"
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
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all relative ${
                isActive
                  ? 'border-orange-500 ring-1 ring-orange-500/50 bg-gradient-to-b from-orange-950/20 to-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-100 text-sm">{prompt.title}</h3>
                      {prompt.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          System Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prompt.description}</p>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-md shadow-orange-950/50 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In-Use
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActive(prompt.id)}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 transition-all"
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
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Prompt Template Preview */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-[11px] font-mono text-slate-300 line-clamp-4 leading-relaxed mb-4">
                  {prompt.userTemplate}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500">
                  Added {new Date(prompt.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicatePrompt(prompt)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Duplicate prompt"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {!prompt.isDefault && (
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-all"
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
