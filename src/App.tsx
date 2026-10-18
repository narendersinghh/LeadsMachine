import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { ScraperView } from './components/ScraperView';
import { PipelineView } from './components/PipelineView';
import { PromptsManagerView } from './components/PromptsManagerView';
import { AIConnectionView } from './components/AIConnectionView';
import { UpdatesView } from './components/UpdatesView';
import { SettingsView } from './components/SettingsView';
import { AuditReportModal } from './components/AuditReportModal';
import { OutreachModal } from './components/OutreachModal';
import { JourneyDrawer } from './components/JourneyDrawer';
import { DEFAULT_SETTINGS, DEFAULT_PROMPTS, INITIAL_LEADS } from './utils/defaults';
import { AgencySettings, AuditPrompt, Lead } from './types';
import { Zap, Layers, Flame, Send, Star, ShieldCheck } from 'lucide-react';

export default function App() {
  // Load state from localStorage with safe fallbacks
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('leadsak47_leads');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading leads from storage:', e);
    }
    return INITIAL_LEADS;
  });

  const [settings, setSettings] = useState<AgencySettings>(() => {
    try {
      const saved = localStorage.getItem('leadsak47_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings from storage:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [prompts, setPrompts] = useState<AuditPrompt[]>(() => {
    try {
      const saved = localStorage.getItem('leadsak47_prompts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading prompts from storage:', e);
    }
    return DEFAULT_PROMPTS;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('scraper');

  // Modal / Drawer states
  const [auditModalLead, setAuditModalLead] = useState<Lead | null>(null);
  const [outreachModalData, setOutreachModalData] = useState<{
    lead: Lead;
    channel?: 'email' | 'whatsapp';
  } | null>(null);
  const [journeyDrawerLead, setJourneyDrawerLead] = useState<Lead | null>(null);

  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('leadsak47_leads', JSON.stringify(leads));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }, [leads]);

  useEffect(() => {
    try {
      localStorage.setItem('leadsak47_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('leadsak47_prompts', JSON.stringify(prompts));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }, [prompts]);

  // Keep modal states in sync with updated leads
  useEffect(() => {
    if (auditModalLead) {
      const updated = leads.find((l) => l.id === auditModalLead.id);
      if (updated) setAuditModalLead(updated);
    }
    if (outreachModalData) {
      const updated = leads.find((l) => l.id === outreachModalData.lead.id);
      if (updated) {
        setOutreachModalData((prev) => (prev ? { ...prev, lead: updated } : null));
      }
    }
    if (journeyDrawerLead) {
      const updated = leads.find((l) => l.id === journeyDrawerLead.id);
      if (updated) setJourneyDrawerLead(updated);
    }
  }, [leads]);

  // Process a single lead through the AK47 automation pipeline
  const processLead = async (leadToProcess: Lead) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadToProcess.id
          ? {
              ...l,
              status: 'auditing',
              isProcessing: true,
              updatedAt: new Date().toISOString(),
              journey: [
                ...l.journey,
                {
                  id: `j-audit-start-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  stage: 'Initiated Process',
                  title: 'Process Initiated',
                  description: leadToProcess.hasWebsite
                    ? `Crawling ${leadToProcess.website} for SEO weaknesses, Google Maps rank deficiencies, and calculating break-even ROI formula.`
                    : 'Generating Turnkey Website Proposal Deck (missing website on Google Maps profile).',
                  type: 'system',
                },
              ],
            }
          : l
      )
    );

    try {
      const activePrompt = prompts.find((p) => p.id === settings.activePromptId) || prompts[0];

      if (leadToProcess.hasWebsite) {
        // Audit Website & Pitch
        const response = await fetch('/api/leads/audit-and-pitch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead: leadToProcess,
            agencySettings: settings,
            customPrompt: activePrompt?.userTemplate,
            promptId: activePrompt?.id,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to audit website');
        }

        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadToProcess.id
              ? {
                  ...l,
                  status: 'audit_ready',
                  isProcessing: false,
                  auditReport: data.auditReport,
                  emailDraft: data.emailDraft,
                  whatsappDraft: data.whatsappDraft,
                  updatedAt: new Date().toISOString(),
                  journey: [
                    ...l.journey,
                    {
                      id: `j-audit-done-${Date.now()}`,
                      timestamp: new Date().toISOString(),
                      stage: 'Audit Ready',
                      title: 'Audit & Break-Even ROI Report Ready',
                      description: `Identified negative SEO points. Computed break-even at ${data.auditReport.pitch.leadsNeededToBreakEven} converted leads (${settings.currency || '₹'}${data.auditReport.pitch.estimatedLeadValue.toLocaleString()} value each). First touch outreach staged.`,
                      type: 'audit',
                    },
                  ],
                }
              : l
          )
        );
      } else {
        // Generate Website Proposal for No-Website Listing
        const response = await fetch('/api/leads/generate-website-proposal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead: leadToProcess,
            agencySettings: settings,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to generate website proposal');
        }

        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadToProcess.id
              ? {
                  ...l,
                  status: 'proposal_ready',
                  isProcessing: false,
                  websiteProposal: data.websiteProposal,
                  emailDraft: data.emailDraft,
                  whatsappDraft: data.whatsappDraft,
                  updatedAt: new Date().toISOString(),
                  journey: [
                    ...l.journey,
                    {
                      id: `j-prop-done-${Date.now()}`,
                      timestamp: new Date().toISOString(),
                      stage: 'Proposal Ready',
                      title: 'Website Proposal Staged',
                      description: `Prepared turnkey digital storefront proposal for ${settings.currency || '₹'}${data.websiteProposal.estimatedPrice.toLocaleString()}. Highlighted ${data.websiteProposal.missedRevenueEstimate}.`,
                      type: 'audit',
                    },
                  ],
                }
              : l
          )
        );
      }
    } catch (err: any) {
      console.error(`Error processing lead ${leadToProcess.name}:`, err);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadToProcess.id
            ? {
                ...l,
                status: 'discovered',
                isProcessing: false,
                journey: [
                  ...l.journey,
                  {
                    id: `j-err-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    stage: 'Processing Notice',
                    title: 'Audit Notice',
                    description: `Notice during audit: ${err.message || 'Check connection'}. Ready to retry.`,
                    type: 'system',
                  },
                ],
              }
            : l
        )
      );
    }
  };

  // Batch process handler
  const handleInitiateBatch = async (selectedIds?: string[]) => {
    setIsBatchProcessing(true);

    const targetLeads = leads.filter((l) => {
      if (selectedIds && selectedIds.length > 0) {
        return selectedIds.includes(l.id);
      }
      return l.status === 'discovered' || (!l.auditReport && !l.websiteProposal);
    });

    for (const lead of targetLeads) {
      await processLead(lead);
    }

    setIsBatchProcessing(false);
  };

  // Top stats counters
  const totalLeads = leads.length;
  const auditedCount = leads.filter(
    (l) => l.status === 'audit_ready' || l.status === 'proposal_ready' || l.auditReport || l.websiteProposal
  ).length;
  const contactedCount = leads.filter((l) => l.status.startsWith('contacted') || l.status === 'replied' || l.status === 'won').length;
  const wonCount = leads.filter((l) => l.status === 'won').length;
  const pendingCount = leads.filter((l) => l.status === 'discovered' && !l.auditReport && !l.websiteProposal).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* SaaS Left Sidebar Panel */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leads={leads}
        settings={settings}
        onInitiateProcess={() => handleInitiateBatch()}
        isBatchProcessing={isBatchProcessing}
      />

      {/* Main SaaS Content Workspace */}
      <div className="flex-1 ml-20 sm:ml-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Top SaaS Status Header */}
        <header className="h-18 px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Workspace / {settings.agencyName}
              </span>
              <h2 className="text-base font-extrabold text-slate-100 capitalize font-['Outfit']">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
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
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400">Won:</span>
                <span className="font-bold text-emerald-400">{wonCount}</span>
              </div>
            </div>

            {pendingCount > 0 && (
              <button
                onClick={() => handleInitiateBatch()}
                disabled={isBatchProcessing}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all ${
                  isBatchProcessing
                    ? 'bg-orange-600/70 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 active:scale-95 shadow-orange-950/60'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 text-amber-200 ${isBatchProcessing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isBatchProcessing ? 'Processing...' : `Initiate Process (${pendingCount})`}
                </span>
                <span className="sm:hidden">
                  {isBatchProcessing ? '...' : `Initiate (${pendingCount})`}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'scraper' && (
            <ScraperView
              leads={leads}
              setLeads={setLeads}
              settings={settings}
              onInitiateSingleLead={processLead}
              onInitiateBatch={handleInitiateBatch}
              onOpenAuditModal={(lead) => setAuditModalLead(lead)}
              onOpenOutreachModal={(lead, initialChannel) =>
                setOutreachModalData({ lead, channel: initialChannel })
              }
              onOpenJourneyDrawer={(lead) => setJourneyDrawerLead(lead)}
              isProcessingBatch={isBatchProcessing}
            />
          )}

          {activeTab === 'pipeline' && (
            <PipelineView
              leads={leads}
              setLeads={setLeads}
              settings={settings}
              onOpenAuditModal={(lead) => setAuditModalLead(lead)}
              onOpenOutreachModal={(lead, initialChannel) =>
                setOutreachModalData({ lead, channel: initialChannel })
              }
              onOpenJourneyDrawer={(lead) => setJourneyDrawerLead(lead)}
            />
          )}

          {activeTab === 'prompts' && (
            <PromptsManagerView
              prompts={prompts}
              setPrompts={setPrompts}
              settings={settings}
              setSettings={setSettings}
            />
          )}

          {activeTab === 'ai-connection' && (
            <AIConnectionView settings={settings} setSettings={setSettings} />
          )}

          {activeTab === 'updates' && <UpdatesView />}

          {activeTab === 'settings' && (
            <SettingsView settings={settings} setSettings={setSettings} />
          )}
        </main>
      </div>

      {/* Audit & Proposal Report Modal */}
      {auditModalLead && (
        <AuditReportModal
          lead={auditModalLead}
          onClose={() => setAuditModalLead(null)}
          settings={settings}
          onOpenOutreachModal={(lead, channel) => {
            setAuditModalLead(null);
            setOutreachModalData({ lead, channel });
          }}
        />
      )}

      {/* Outreach Hub Modal */}
      {outreachModalData && (
        <OutreachModal
          lead={outreachModalData.lead}
          onClose={() => setOutreachModalData(null)}
          settings={settings}
          setLeads={setLeads}
          initialChannel={outreachModalData.channel}
        />
      )}

      {/* Lead Journey Timeline Drawer */}
      {journeyDrawerLead && (
        <JourneyDrawer
          lead={journeyDrawerLead}
          onClose={() => setJourneyDrawerLead(null)}
          setLeads={setLeads}
        />
      )}
    </div>
  );
}
