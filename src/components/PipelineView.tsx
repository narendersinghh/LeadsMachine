import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Star,
  ExternalLink,
  Phone,
  Mail,
  Send,
  MessageSquare,
  FileText,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Globe,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgencySettings, Lead, LeadStatus } from '../types';

interface PipelineViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  settings: AgencySettings;
  onOpenAuditModal: (lead: Lead) => void;
  onOpenOutreachModal: (lead: Lead, initialChannel?: 'email' | 'whatsapp') => void;
  onOpenJourneyDrawer: (lead: Lead) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  setLeads,
  settings,
  onOpenAuditModal,
  onOpenOutreachModal,
  onOpenJourneyDrawer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [websiteFilter, setWebsiteFilter] = useState<'all' | 'has_website' | 'no_website'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Trigger confetti for won deals
  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    if (newStatus === 'won') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const statusLabels: Record<LeadStatus, string> = {
            discovered: 'Discovered',
            auditing: 'Auditing Website',
            audit_ready: 'Audit & PDF Ready',
            proposal_ready: 'Website Proposal Ready',
            contacted_email: 'Contacted via Email',
            contacted_whatsapp: 'Contacted via WhatsApp',
            replied: 'Client Replied / In Dialogue',
            follow_up: 'Follow-Up Scheduled',
            meeting_booked: 'Discovery Call Booked',
            won: 'Deal Won / Client Signed! 🎉',
            lost: 'Not Interested / Lost',
          };

          return {
            ...lead,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            journey: [
              ...lead.journey,
              {
                id: `j-status-${Date.now()}`,
                timestamp: new Date().toISOString(),
                stage: statusLabels[newStatus],
                title: `Status Updated to ${statusLabels[newStatus]}`,
                description: `Manually changed pipeline stage to ${statusLabels[newStatus]}.`,
                type: 'status_change',
              },
            ],
          };
        }
        return lead;
      })
    );
  };

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchQuery));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'audited'
        ? lead.status === 'audit_ready' || lead.status === 'proposal_ready' || Boolean(lead.auditReport) || Boolean(lead.websiteProposal)
        : statusFilter === 'contacted'
        ? lead.status === 'contacted_email' || lead.status === 'contacted_whatsapp'
        : lead.status === statusFilter;

    const matchesWebsite =
      websiteFilter === 'all'
        ? true
        : websiteFilter === 'has_website'
        ? lead.hasWebsite
        : !lead.hasWebsite;

    return matchesSearch && matchesStatus && matchesWebsite;
  });

  const getJourneyStepIndex = (status: LeadStatus) => {
    switch (status) {
      case 'discovered':
      case 'auditing':
        return 1;
      case 'audit_ready':
      case 'proposal_ready':
        return 2;
      case 'contacted_email':
      case 'contacted_whatsapp':
      case 'follow_up':
        return 3;
      case 'replied':
      case 'meeting_booked':
        return 4;
      case 'won':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              <span>Lead Journey & Outreach Pipeline</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track the exact lifecycle of each prospect from Google Maps discovery through audit, pitch, multi-channel outreach, and replies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'cards' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'table' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, city, phone, category..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2 overflow-x-auto py-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-medium"
            >
              <option value="all">All Stages ({leads.length})</option>
              <option value="discovered">Discovered ({leads.filter((l) => l.status === 'discovered').length})</option>
              <option value="audited">Audited / PDF Ready ({leads.filter((l) => l.status === 'audit_ready' || l.status === 'proposal_ready').length})</option>
              <option value="contacted">Contacted ({leads.filter((l) => l.status.startsWith('contacted')).length})</option>
              <option value="replied">Replied / In Dialogue ({leads.filter((l) => l.status === 'replied').length})</option>
              <option value="meeting_booked">Meeting Booked ({leads.filter((l) => l.status === 'meeting_booked').length})</option>
              <option value="won">Won Deals 🏆 ({leads.filter((l) => l.status === 'won').length})</option>
            </select>

            <select
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-medium"
            >
              <option value="all">All Web Presence</option>
              <option value="has_website">Has Website ({leads.filter((l) => l.hasWebsite).length})</option>
              <option value="no_website">No Website ({leads.filter((l) => !l.hasWebsite).length})</option>
            </select>
          </div>

          <div className="md:col-span-3 text-right text-xs text-slate-400">
            Showing <span className="font-bold text-orange-400">{filteredLeads.length}</span> of {leads.length} leads
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const stepIdx = getJourneyStepIndex(lead.status);
            const hasAudit = Boolean(lead.auditReport);
            const hasProp = Boolean(lead.websiteProposal);

            return (
              <div
                key={lead.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Top accent badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">
                      {lead.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span>{lead.category}</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-400 gap-0.5 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {lead.rating}
                      </span>
                      <span className="text-slate-500">({lead.reviewsCount})</span>
                    </div>
                  </div>

                  <a
                    href={lead.placeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded bg-slate-800 text-slate-400 hover:text-orange-400 shrink-0"
                    title="Google Maps listing"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Contact & Web details */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs mb-4">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" /> Phone:
                    </span>
                    <span className="font-mono font-medium">
                      {lead.phone || <span className="text-red-400 italic">Missing</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-blue-400" /> Web:
                    </span>
                    {lead.hasWebsite ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline truncate max-w-[150px]"
                      >
                        {lead.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="text-amber-400 font-bold text-[10px]">No Website Listed</span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">
                    📍 {lead.address || lead.city}
                  </div>
                </div>

                {/* Visual Journey Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <span>Journey Stage</span>
                    <span className="text-orange-400 font-extrabold">{stepIdx} / 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { step: 1, label: 'Discovered' },
                      { step: 2, label: 'Audited' },
                      { step: 3, label: 'Contacted' },
                      { step: 4, label: 'Replied' },
                      { step: 5, label: 'Won' },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className={`h-1.5 rounded-full transition-all ${
                          stepIdx >= s.step
                            ? s.step === 5
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-slate-800'
                        }`}
                        title={s.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Score & Financial Pitch Callout if ready */}
                {lead.auditReport && (
                  <div className="mb-4 p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs">
                    <div className="flex items-center justify-between font-bold text-orange-300">
                      <span>Audit Score: {lead.auditReport.overallScore}/100</span>
                      <span className="text-emerald-400">
                        Break-even: {lead.auditReport.pitch.leadsNeededToBreakEven} leads
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                      {lead.auditReport.pitch.roiStatement}
                    </p>
                  </div>
                )}

                {lead.websiteProposal && (
                  <div className="mb-4 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-300">
                      <span>Website Proposal Ready</span>
                      <span className="text-emerald-400">
                        {settings.currency || '₹'}{lead.websiteProposal.estimatedPrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                      {lead.websiteProposal.pitchHeadline}
                    </p>
                  </div>
                )}

                {/* Journey Status Selector */}
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Current Status
                  </label>
                  <div className="relative">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-orange-500"
                    >
                      <option value="discovered">Discovered</option>
                      <option value="auditing">Auditing Website</option>
                      <option value="audit_ready">Audit & PDF Ready</option>
                      <option value="proposal_ready">Website Proposal Ready</option>
                      <option value="contacted_email">Contacted via Email</option>
                      <option value="contacted_whatsapp">Contacted via WhatsApp</option>
                      <option value="follow_up">Follow-Up Scheduled</option>
                      <option value="replied">Client Replied / Interested</option>
                      <option value="meeting_booked">Discovery Call Booked</option>
                      <option value="won">Won Deal 🏆</option>
                      <option value="lost">Lost / Not Interested</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
                  {(hasAudit || hasProp) && (
                    <button
                      onClick={() => onOpenAuditModal(lead)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all"
                      title="View PDF Report"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => onOpenOutreachModal(lead, 'email')}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-all"
                      title="Send Email Pitch"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenOutreachModal(lead, 'whatsapp')}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all"
                      title="Send WhatsApp Pitch"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenJourneyDrawer(lead)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                      title="View Journey Timeline"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Audit / Break-Even</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{lead.name}</div>
                    <div className="text-slate-400 text-[11px]">{lead.category} • {lead.city}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <div>{lead.phone || 'No phone'}</div>
                    <div className="text-[11px] text-blue-400">{lead.website ? lead.website.replace(/^https?:\/\//, '') : 'No Website'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {lead.auditReport ? (
                      <span className="text-emerald-400 font-bold">
                        Score: {lead.auditReport.overallScore}/100 • Break-even in {lead.auditReport.pitch.leadsNeededToBreakEven} leads
                      </span>
                    ) : lead.websiteProposal ? (
                      <span className="text-amber-400 font-bold">
                        Website Proposal ({settings.currency || '₹'}{lead.websiteProposal.estimatedPrice.toLocaleString()})
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Not audited yet</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                    >
                      <option value="discovered">Discovered</option>
                      <option value="audit_ready">Audit Ready</option>
                      <option value="contacted_email">Contacted Email</option>
                      <option value="contacted_whatsapp">Contacted WhatsApp</option>
                      <option value="replied">Replied</option>
                      <option value="meeting_booked">Meeting Booked</option>
                      <option value="won">Won Deal 🏆</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(lead.auditReport || lead.websiteProposal) && (
                        <button
                          onClick={() => onOpenAuditModal(lead)}
                          className="px-2 py-1 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold"
                        >
                          Report
                        </button>
                      )}
                      <button
                        onClick={() => onOpenOutreachModal(lead, 'email')}
                        className="p-1.5 rounded bg-slate-800 hover:bg-blue-600 text-slate-300"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenOutreachModal(lead, 'whatsapp')}
                        className="p-1.5 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenJourneyDrawer(lead)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
