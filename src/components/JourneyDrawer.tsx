import React, { useState } from 'react';
import {
  X,
  History,
  Clock,
  Send,
  MessageSquare,
  FileText,
  CheckCircle2,
  Plus,
  StickyNote,
  Star,
  MapPin,
  Globe,
  Phone,
} from 'lucide-react';
import { Lead } from '../types';

interface JourneyDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

export const JourneyDrawer: React.FC<JourneyDrawerProps> = ({ lead, onClose, setLeads }) => {
  if (!lead) return null;

  const [noteText, setNoteText] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newEvent = {
      id: `j-note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Internal Note',
      title: 'Note Logged',
      description: noteText.trim(),
      type: 'note' as const,
    };

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === lead.id) {
          return {
            ...l,
            journey: [...l.journey, newEvent],
            updatedAt: new Date().toISOString(),
          };
        }
        return l;
      })
    );

    setNoteText('');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'audit':
        return <FileText className="w-4 h-4 text-orange-400" />;
      case 'email':
        return <Send className="w-4 h-4 text-blue-400" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-amber-400" />;
      case 'note':
        return <StickyNote className="w-4 h-4 text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">{lead.name}</h3>
              <p className="text-xs text-slate-400">Lead Journey & Activity Log</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Summary Mini Card */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Current Pipeline Stage:</span>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold capitalize">
              {lead.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-slate-400 truncate">
            📍 {lead.address || lead.city} • 📞 {lead.phone || 'No phone'}
          </div>
        </div>

        {/* Timeline Event List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {lead.journey.map((event, idx) => (
              <div key={event.id || idx} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 border-2 border-slate-700 group-hover:border-orange-500 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                </div>

                {/* Event Card */}
                <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 hover:border-slate-700 transition-all space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                      {getEventIcon(event.type)}
                      <span>{event.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="uppercase font-semibold tracking-wider text-slate-400">
                      Stage: {event.stage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="p-4 bg-slate-950 border-t border-slate-800">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Add Journey Note / Update
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Spoke with owner, sent proposal PDF..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!noteText.trim()}
              className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
