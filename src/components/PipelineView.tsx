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
  Trash2,
  CheckSquare,
  Square,
  UserCheck,
  Check,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgencySettings, Lead, LeadStatus } from '../types';
import { formatMoney } from '../utils/currency';

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteNotice, setDeleteNotice] = useState<string>('');

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  // Delete selected leads
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (confirm(`Are you sure you want to permanently delete ${count} selected lead(s) from Journey CRM?`)) {
      setLeads((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
      setSelectedIds([]);
      setDeleteNotice(`Successfully deleted ${count} lead(s).`);
      setTimeout(() => setDeleteNotice(''), 3000);
    }
  };

  // Delete single lead
  const handleDeleteSingle = (lead: Lead) => {
    if (confirm(`Permanently remove "${lead.name}" from Journey CRM?`)) {
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      setSelectedIds((prev) => prev.filter((id) => id !== lead.id));
      setDeleteNotice(`Removed "${lead.name}" from CRM.`);
      setTimeout(() => setDeleteNotice(''), 3000);
    }
  };

  // Status change handler
  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    if (newStatus === 'won') {
      confetti({
        particleCount: 120,
        spread: 80,
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
                title: `Status Changed to ${statusLabels[newStatus]}`,
                description: `Pipeline stage updated to ${statusLabels[newStatus]}.`,
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

  const curSymbol = settings.currency || '₹';

  return (
    <div className="space-y-6 pb-12">
      {/* Control Bar - Light Theme Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
              Pipeline Automation
            </span>
            <span className="text-xs text-slate-500 font-medium">Multi-channel response tracking</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-['Outfit'] flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            <span>Lead Journey CRM & Activity Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Select, manage, and track each prospect from Google Maps discovery through audits, pitches, and closed deals.
          </p>
        </div>

        {/* Buttons shifted below description instead of on the right side */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="Delete selected leads"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <div className="text-xs text-slate-500 ml-auto font-medium hidden sm:flex items-center gap-3">
            <span>Total: <strong>{leads.length}</strong></span>
            <span>Audited: <strong>{leads.filter((l) => l.status === 'audit_ready' || l.status === 'proposal_ready').length}</strong></span>
            <span>Contacted: <strong>{leads.filter((l) => l.status.startsWith('contacted')).length}</strong></span>
          </div>
        </div>

        {deleteNotice && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold flex items-center gap-2 animate-in fade-in">
            <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
            <span>{deleteNotice}</span>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, city, phone, category..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white font-medium"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2 overflow-x-auto py-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
            >
              <option value="all">All Stages ({leads.length})</option>
              <option value="discovered">Discovered ({leads.filter((l) => l.status === 'discovered').length})</option>
              <option value="audited">Audited / Ready ({leads.filter((l) => l.status === 'audit_ready' || l.status === 'proposal_ready').length})</option>
              <option value="contacted">Contacted ({leads.filter((l) => l.status.startsWith('contacted')).length})</option>
              <option value="replied">Replied ({leads.filter((l) => l.status === 'replied').length})</option>
              <option value="won">Won Deals 🏆 ({leads.filter((l) => l.status === 'won').length})</option>
            </select>

            <select
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
            >
              <option value="all">All Web Status</option>
              <option value="has_website">With Website ({leads.filter((l) => l.hasWebsite).length})</option>
              <option value="no_website">No Website ({leads.filter((l) => !l.hasWebsite).length})</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center justify-end gap-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Contacted: {leads.filter((l) => l.status.startsWith('contacted')).length}
            </span>
            <span className="flex items-center gap-1 font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Won: {leads.filter((l) => l.status === 'won').length}
            </span>
          </div>
        </div>
      </div>

      {/* Select All Bar */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
            id="crm-select-all"
          />
          <label htmlFor="crm-select-all" className="cursor-pointer font-bold text-slate-800">
            Select All ({filteredLeads.length} leads)
          </label>
          {selectedIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[11px]">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="text-red-600 hover:text-red-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>
        )}
      </div>

      {/* VIEW MODE 1: CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-500" />
              <p className="font-bold text-slate-800">No leads match the filters</p>
              <p className="text-xs text-slate-500 mt-1">Adjust search terms or scrape new leads from Maps.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);
              const stepIndex = getJourneyStepIndex(lead.status);
              const hasAudit = Boolean(lead.auditReport);
              const hasProp = Boolean(lead.websiteProposal);

              return (
                <div
                  key={lead.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-500 ring-2 ring-orange-400/20 bg-orange-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Header Card */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(lead.id)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer mt-0.5"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">
                            {lead.name}
                          </h3>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{lead.category}</span>
                            <span>•</span>
                            <span className="flex items-center text-amber-600 font-bold">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                              {lead.rating} ({lead.reviewsCount})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete single button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(lead)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Contact & Location Info */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Phone:</span>
                        <span className="font-bold text-slate-800">{lead.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">City:</span>
                        <span className="text-slate-700">{lead.city}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Website:</span>
                        {lead.hasWebsite ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5 max-w-[130px] truncate font-semibold"
                          >
                            <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-amber-700 font-bold text-[10px] bg-amber-100 px-1.5 py-0.2 rounded">
                            Pitch Website
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI Calculated Lead Valuation Preview */}
                    {lead.auditReport?.pitch && (
                      <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-700 font-medium">AI Ticket Value:</span>
                        <span className="font-black text-emerald-900">
                          {formatMoney(lead.auditReport.pitch.estimatedLeadValue, curSymbol)}
                        </span>
                      </div>
                    )}

                    {/* Visual Journey Stepper */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                        <span>Lead Journey</span>
                        <span className="text-orange-600">Step {stepIndex} / 5</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map((step) => {
                          const isDone = step <= stepIndex;
                          const isCurrent = step === stepIndex;
                          return (
                            <div
                              key={step}
                              className={`h-1.5 rounded-full transition-all ${
                                isCurrent
                                  ? 'bg-orange-500'
                                  : isDone
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
                        <span>Scraped</span>
                        <span>Audit</span>
                        <span>Pitch</span>
                        <span>Reply</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Stage:
                      </label>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className={`flex-1 text-xs font-bold rounded-lg px-2 py-1.5 border focus:outline-none cursor-pointer ${
                          lead.status === 'won'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : lead.status === 'replied'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : lead.status.startsWith('contacted')
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-slate-50 text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="discovered">Discovered</option>
                        <option value="audit_ready">Audit & PDF Ready</option>
                        <option value="proposal_ready">Proposal Ready</option>
                        <option value="contacted_whatsapp">Contacted WhatsApp</option>
                        <option value="contacted_email">Contacted Email</option>
                        <option value="replied">Client Replied 👍</option>
                        <option value="follow_up">Follow-Up Scheduled</option>
                        <option value="meeting_booked">Meeting Booked</option>
                        <option value="won">Deal Won 🏆</option>
                        <option value="lost">Lost / No Interest</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {hasAudit || hasProp ? (
                        <button
                          type="button"
                          onClick={() => onOpenAuditModal(lead)}
                          className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 transition-all cursor-pointer"
                          title="View Audit Report PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-orange-600" />
                          <span>PDF</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenAuditModal(lead)}
                          className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Audit</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenOutreachModal(lead, 'whatsapp')}
                        className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-all cursor-pointer"
                        title="Open WhatsApp Outreach"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pitch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenJourneyDrawer(lead)}
                        className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
                        title="View Full Journey Timeline"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span>Timeline</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 min-w-[200px]">Business & Niche</th>
                  <th className="py-3 px-4 min-w-[150px]">Website</th>
                  <th className="py-3 px-4 min-w-[150px]">Phone & City</th>
                  <th className="py-3 px-4 min-w-[180px]">Pipeline Stage</th>
                  <th className="py-3 px-4 text-right min-w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <p className="font-bold text-slate-700">No leads match current filter</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedIds.includes(lead.id);
                    const hasAudit = Boolean(lead.auditReport);
                    const hasProp = Boolean(lead.websiteProposal);

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-orange-50/60' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(lead.id)}
                            className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{lead.category}</span>
                            <span>•</span>
                            <span className="flex items-center text-amber-600 font-bold">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                              {lead.rating} ({lead.reviewsCount})
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {lead.hasWebsite ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 font-semibold max-w-[160px] truncate"
                            >
                              <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                              No Website
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{lead.phone || 'N/A'}</div>
                          <div className="text-[11px] text-slate-500">{lead.city}</div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="text-xs font-bold rounded-lg px-2 py-1 border bg-slate-50 border-slate-300 focus:outline-none cursor-pointer"
                          >
                            <option value="discovered">Discovered</option>
                            <option value="audit_ready">Audit & PDF Ready</option>
                            <option value="proposal_ready">Proposal Ready</option>
                            <option value="contacted_whatsapp">Contacted WhatsApp</option>
                            <option value="contacted_email">Contacted Email</option>
                            <option value="replied">Client Replied 👍</option>
                            <option value="follow_up">Follow-Up Scheduled</option>
                            <option value="meeting_booked">Meeting Booked</option>
                            <option value="won">Deal Won 🏆</option>
                            <option value="lost">Lost</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {hasAudit || hasProp ? (
                              <button
                                type="button"
                                onClick={() => onOpenAuditModal(lead)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 transition-all cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-orange-600" />
                                <span>PDF</span>
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => onOpenOutreachModal(lead, 'whatsapp')}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
                              title="Outreach"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onOpenJourneyDrawer(lead)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                              title="Journey"
                            >
                              <History className="w-3.5 h-3.5 text-slate-500" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(lead)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-all cursor-pointer"
                              title="Delete lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
