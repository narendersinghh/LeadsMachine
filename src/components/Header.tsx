import React from 'react';
import { Crosshair, Zap, Settings, BookOpen, Send, Layers, Flame } from 'lucide-react';
import { AgencySettings, Lead } from '../types';

interface HeaderProps {
  activeTab: 'scraper' | 'pipeline' | 'prompts' | 'settings';
  setActiveTab: (tab: 'scraper' | 'pipeline' | 'prompts' | 'settings') => void;
  leads: Lead[];
  settings: AgencySettings;
  onInitiateProcess: () => void;
  isBatchProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  leads,
  settings,
  onInitiateProcess,
  isBatchProcessing,
}) => {
  const totalLeads = leads.length;
  const auditedCount = leads.filter((l) => l.status === 'audit_ready' || l.status === 'proposal_ready' || l.auditReport || l.websiteProposal).length;
  const contactedCount = leads.filter((l) => l.status === 'contacted_email' || l.status === 'contacted_whatsapp' || l.status === 'replied' || l.status === 'won').length;
  const repliedCount = leads.filter((l) => l.status === 'replied' || l.status === 'won' || l.status === 'meeting_booked').length;
  const wonCount = leads.filter((l) => l.status === 'won').length;

  const pendingAuditCount = leads.filter((l) => l.status === 'discovered' && !l.auditReport && !l.websiteProposal).length;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('scraper')}>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-lg shadow-orange-600/30 ring-1 ring-orange-400/40">
              <Crosshair className="w-6 h-6 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-red-400 bg-clip-text text-transparent font-['Outfit']">
                  LEADS AK47 MACHINE
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 tracking-wider">
                  RAPID AI FIRE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                {settings.agencyName} • Google Maps Audit & Acquisition Engine
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Total:</span>
              <span className="font-bold text-slate-100">{totalLeads}</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-slate-400">Audited:</span>
              <span className="font-bold text-orange-400">{auditedCount}</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Contacted:</span>
              <span className="font-bold text-blue-400">{contactedCount}</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Replied/Won:</span>
              <span className="font-bold text-emerald-400">{repliedCount} ({wonCount} Won)</span>
            </div>
          </div>

          {/* Master "Initiate Process" Trigger & Tab Nav */}
          <div className="flex items-center gap-3">
            {pendingAuditCount > 0 && (
              <button
                onClick={onInitiateProcess}
                disabled={isBatchProcessing}
                className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-xl transition-all duration-200 ${
                  isBatchProcessing
                    ? 'bg-orange-600/70 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:via-orange-500 hover:to-red-500 hover:scale-[1.02] shadow-orange-950/50 active:scale-[0.98]'
                }`}
                title="Automatically audit pending leads, calculate break-even ROI, and stage outreach"
              >
                <Zap className={`w-4 h-4 text-amber-200 ${isBatchProcessing ? 'animate-spin' : ''}`} />
                <span>{isBatchProcessing ? 'Initiating AK47 Fire...' : `Initiate Process (${pendingAuditCount})`}</span>
              </button>
            )}

            {/* Navigation Tabs */}
            <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('scraper')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'scraper'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Maps Scraper</span>
              </button>

              <button
                onClick={() => setActiveTab('pipeline')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'pipeline'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Journey CRM</span>
                {leads.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-slate-200">
                    {leads.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('prompts')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'prompts'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Prompts</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Settings</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
