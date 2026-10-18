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
        return <FileText className="w-4 h-4 text-orange-600" />;
      case 'email':
        return <Send className="w-4 h-4 text-blue-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
      case 'note':
        return <StickyNote className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700 border border-orange-200">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">{lead.name}</h3>
              <p className="text-xs text-slate-500">Lead Journey & Activity Log</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Summary Mini Card */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-slate-500 font-medium">Pipeline Stage:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold capitalize border border-orange-200">
              {lead.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-slate-600 truncate text-[11px]">
            📍 {lead.address || lead.city} • 📞 {lead.phone || 'No phone'}
          </div>
        </div>

        {/* Timeline Event List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {lead.journey.map((event, idx) => (
              <div key={event.id || idx} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-orange-500 transition-colors shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                </div>

                {/* Event Card */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 hover:border-slate-300 transition-all space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      {getEventIcon(event.type)}
                      <span>{event.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>

                  <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider pt-0.5">
                    Stage: {event.stage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Note Input Bar */}
        <form onSubmit={handleAddNote} className="p-4 bg-slate-50 border-t border-slate-200">
          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Log Internal Lead Note / Call Summary
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Spoke to owner Mike; follow up Friday at 2 PM..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!noteText.trim()}
              className="p-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
