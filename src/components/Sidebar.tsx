import React, { useState } from 'react';
import {
  Crosshair,
  Layers,
  BookOpen,
  Cpu,
  DownloadCloud,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  ShieldCheck,
  Send,
  HelpCircle,
} from 'lucide-react';
import { AgencySettings, Lead } from '../types';

export type NavTab = 'scraper' | 'pipeline' | 'prompts' | 'ai-connection' | 'updates' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  leads: Lead[];
  settings: AgencySettings;
  onInitiateProcess: () => void;
  isBatchProcessing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  leads,
  settings,
  onInitiateProcess,
  isBatchProcessing,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const pendingAuditCount = leads.filter(
    (l) => l.status === 'discovered' && !l.auditReport && !l.websiteProposal
  ).length;

  const navItems = [
    {
      id: 'scraper' as NavTab,
      label: 'Maps Scraper',
      icon: Crosshair,
      badge: leads.length > 0 ? `${leads.length}` : undefined,
    },
    {
      id: 'pipeline' as NavTab,
      label: 'Journey CRM',
      icon: Layers,
      badge: leads.filter((l) => l.status.startsWith('contacted') || l.status === 'replied').length
        ? `${leads.filter((l) => l.status.startsWith('contacted') || l.status === 'replied').length}`
        : undefined,
    },
    {
      id: 'prompts' as NavTab,
      label: 'AI Prompts',
      icon: BookOpen,
    },
    {
      id: 'ai-connection' as NavTab,
      label: 'AI Connection',
      icon: Cpu,
      statusDot: 'bg-emerald-400',
    },
    {
      id: 'updates' as NavTab,
      label: 'Updates & Deploy',
      icon: DownloadCloud,
      tag: 'v1.2.0',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      currencyTag: settings.currency || '₹',
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Brand */}
      <div>
        <div className="h-18 px-4 flex items-center justify-between border-b border-slate-800/80">
          <div
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => setActiveTab('scraper')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-md shadow-orange-600/30 ring-1 ring-orange-400/40 shrink-0">
              <Crosshair className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </div>
            </div>

            {!collapsed && (
              <div className="animate-in fade-in duration-200">
                <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-red-400 bg-clip-text text-transparent font-['Outfit'] whitespace-nowrap">
                  LEADS AK47
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  AI Lead Machine
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Launch Action Button */}
        {pendingAuditCount > 0 && (
          <div className="p-3">
            <button
              onClick={onInitiateProcess}
              disabled={isBatchProcessing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all ${
                isBatchProcessing
                  ? 'bg-orange-600/70 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:via-orange-500 hover:to-red-500 hover:scale-[1.02] shadow-orange-950/60 active:scale-[0.98]'
              }`}
              title="Audit pending leads and generate break-even ROI reports"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-200 ${isBatchProcessing ? 'animate-spin' : ''}`} />
              {!collapsed && (
                <span className="truncate">
                  {isBatchProcessing ? 'Firing AK47...' : `Initiate (${pendingAuditCount})`}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 via-orange-600/20 to-transparent text-orange-400 border-l-3 border-orange-500'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && (
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                        {item.badge}
                      </span>
                    )}
                    {item.tag && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {item.tag}
                      </span>
                    )}
                    {item.currencyTag && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.currencyTag}
                      </span>
                    )}
                    {item.statusDot && (
                      <span className={`w-2 h-2 rounded-full ${item.statusDot}`}></span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status Panel */}
      {!collapsed ? (
        <div className="p-3 m-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Engine:</span>
            <span className="font-mono text-[11px] text-orange-400 font-bold uppercase">
              {settings.activeAIProvider || 'Gemini'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Currency:</span>
            <span className="font-bold text-emerald-400">
              {settings.currency || '₹'} ({settings.yearlyFee ? `${settings.currency}${settings.yearlyFee.toLocaleString()}` : ''})
            </span>
          </div>

          <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>Leads AK47 v1.2.0</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 text-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" title="System Live"></span>
        </div>
      )}
    </aside>
  );
};
