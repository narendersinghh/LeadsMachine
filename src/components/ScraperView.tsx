import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Globe,
  Phone,
  Star,
  ExternalLink,
  Zap,
  FileText,
  Send,
  MessageSquare,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react';
import { AgencySettings, Lead } from '../types';
import { formatMoney } from '../utils/currency';

interface ScraperViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  settings: AgencySettings;
  onInitiateSingleLead: (lead: Lead) => Promise<void>;
  onInitiateBatch: (selectedIds?: string[]) => Promise<void>;
  onOpenAuditModal: (lead: Lead) => void;
  onOpenOutreachModal: (lead: Lead, initialChannel?: 'email' | 'whatsapp') => void;
  onOpenJourneyDrawer: (lead: Lead) => void;
  isProcessingBatch: boolean;
}

export const ScraperView: React.FC<ScraperViewProps> = ({
  leads,
  setLeads,
  settings,
  onInitiateSingleLead,
  onInitiateBatch,
  onOpenAuditModal,
  onOpenOutreachModal,
  onOpenJourneyDrawer,
  isProcessingBatch,
}) => {
  const [keyword, setKeyword] = useState('Plumbers');
  const [location, setLocation] = useState('Austin, TX');
  // Option to enter any number of maps details to be fetched
  const [quantity, setQuantity] = useState<number>(20);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [tableFilter, setTableFilter] = useState<'all' | 'has_web' | 'no_web' | 'pending'>('all');

  // Search Google Maps handler
  const handleSearchGoogleMaps = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;

    const targetQty = Math.max(1, Math.min(100, Number(quantity) || 20));

    setIsSearching(true);
    setSearchStatus(`Scanning Google Maps for "${keyword}" in "${location}" (Fetching top ${targetQty} listings)...`);

    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          location,
          limit: targetQty,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to search Google Maps');
      }

      const newLeads: Lead[] = data.leads || [];

      setSearchStatus(`Discovered ${newLeads.length} listings. Checking website contacts & phones...`);

      // Merge newly found leads
      setLeads((prev) => {
        const existingNames = new Set(prev.map((l) => l.name.toLowerCase()));
        const filteredNew = newLeads.filter((nl) => !existingNames.has(nl.name.toLowerCase()));
        return [...filteredNew, ...prev];
      });

      // Background phone enrichment for leads missing phone but having a website
      const leadsNeedingPhone = newLeads.filter((l) => !l.phone && l.hasWebsite);
      if (leadsNeedingPhone.length > 0) {
        leadsNeedingPhone.slice(0, 5).forEach(async (lead) => {
          try {
            const enrichRes = await fetch('/api/leads/enrich-phone', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                businessName: lead.name,
                website: lead.website,
                location: lead.city,
              }),
            });
            const enrichData = await enrichRes.json();
            if (enrichData.phone || enrichData.email) {
              setLeads((current) =>
                current.map((item) => {
                  if (item.id === lead.id) {
                    return {
                      ...item,
                      phone: enrichData.phone || item.phone,
                      phoneSource: enrichData.phone ? 'website_enriched' : item.phoneSource,
                      email: enrichData.email || item.email,
                      journey: [
                        ...item.journey,
                        {
                          id: `j-enrich-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          stage: 'Enriched Contact',
                          title: 'Found Contact Details on Website',
                          description: `Extracted: ${enrichData.phone || 'Phone verified'}${enrichData.email ? ` | Email: ${enrichData.email}` : ''}`,
                          type: 'system',
                        },
                      ],
                    };
                  }
                  return item;
                })
              );
            }
          } catch (err) {
            console.error('Phone enrichment error:', err);
          }
        });
      }

      setTimeout(() => {
        setSearchStatus(`Added ${newLeads.length} listings ready for website audit and outreach!`);
      }, 1500);
    } catch (error: any) {
      console.error('Google Maps Search error:', error);
      setSearchStatus(`Search notice: ${error.message}. Loaded sample data for workflow testing.`);
    } finally {
      setIsSearching(false);
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  // Delete selected leads
  const handleDeleteSelected = () => {
    if (selectedLeadIds.length === 0) return;
    if (confirm(`Delete ${selectedLeadIds.length} selected lead(s)?`)) {
      setLeads((prev) => prev.filter((l) => !selectedLeadIds.includes(l.id)));
      setSelectedLeadIds([]);
    }
  };

  // Delete single lead
  const handleDeleteSingle = (leadId: string, leadName: string) => {
    if (confirm(`Remove "${leadName}" from leads?`)) {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));
    }
  };

  // Filtered leads for table
  const filteredLeads = leads.filter((l) => {
    if (tableFilter === 'has_web') return l.hasWebsite;
    if (tableFilter === 'no_web') return !l.hasWebsite;
    if (tableFilter === 'pending') return l.status === 'discovered' && !l.auditReport && !l.websiteProposal;
    return true;
  });

  const quickPresets = [
    { k: 'Roofing Contractors', loc: 'Dallas, TX', qty: 25 },
    { k: 'Dentists & Orthodontics', loc: 'Miami, FL', qty: 20 },
    { k: 'Emergency Plumbers', loc: 'Austin, TX', qty: 30 },
    { k: 'HVAC AC Repair', loc: 'Phoenix, AZ', qty: 20 },
    { k: 'Car Detailing & Wrap', loc: 'Gurugram', qty: 15 },
  ];

  const quantityPresets = [10, 20, 30, 40, 50, 100];

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Control Card - Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
                Google Maps Extraction
              </span>
              <span className="text-xs text-slate-500 font-medium">Auto-phone enrichment included</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-['Outfit']">
              Maps Scraper & Lead Harvester
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {selectedLeadIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-all cursor-pointer"
                title="Delete selected leads"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Delete Selected ({selectedLeadIds.length})</span>
              </button>
            )}

            <button
              onClick={() => onInitiateBatch(selectedLeadIds.length > 0 ? selectedLeadIds : undefined)}
              disabled={isProcessingBatch || leads.length === 0}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all active:scale-95 cursor-pointer ${
                isProcessingBatch
                  ? 'bg-orange-600/70 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:via-orange-700 hover:to-red-700 shadow-orange-950/20'
              }`}
            >
              <Zap className={`w-4 h-4 text-amber-200 ${isProcessingBatch ? 'animate-spin' : ''}`} />
              <span>
                {isProcessingBatch
                  ? 'Processing Pipeline...'
                  : selectedLeadIds.length > 0
                  ? `Initiate Process (${selectedLeadIds.length} Selected)`
                  : `Initiate Process (${leads.length} Leads)`}
              </span>
            </button>
          </div>
        </div>

        {/* Search Form with Prominent Number Input */}
        <form onSubmit={handleSearchGoogleMaps} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Keyword / Niche
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Plumbers, Roofing Contractors, Dentists"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white font-medium"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Location / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Austin TX, Dallas, London, Mumbai"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* User Requested: Prominent option to enter number of maps details to fetch */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Number of Maps Details to Fetch
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-white text-center"
                    title="Enter any number between 1 and 100"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 uppercase font-bold">
                    leads
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span className="text-xs uppercase tracking-wider">Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-white" />
                      <span className="text-xs uppercase tracking-wider">Scrape Maps</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Quantity Chips & Suggestions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Count:
              </span>
              {quantityPresets.map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setQuantity(qty)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    quantity === qty
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Presets:
              </span>
              {quickPresets.slice(0, 3).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setKeyword(preset.k);
                    setLocation(preset.loc);
                    setQuantity(preset.qty);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-700 border border-slate-200 transition-all cursor-pointer font-medium"
                >
                  {preset.k} ({preset.loc})
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Status Alert Banner */}
        {searchStatus && (
          <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0 animate-pulse" />
            <span>{searchStatus}</span>
          </div>
        )}
      </div>

      {/* Clean, Readable Professional Table Card - Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              title="Select all leads"
            />
            <span className="text-sm font-bold text-slate-900">
              Scraped Business Listings ({filteredLeads.length})
            </span>
            {selectedLeadIds.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-bold">
                {selectedLeadIds.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setTableFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  tableFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setTableFilter('has_web')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  tableFilter === 'has_web' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Website ({leads.filter((l) => l.hasWebsite).length})
              </button>
              <button
                type="button"
                onClick={() => setTableFilter('no_web')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  tableFilter === 'no_web' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No Web ({leads.filter((l) => !l.hasWebsite).length})
              </button>
              <button
                type="button"
                onClick={() => setTableFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  tableFilter === 'pending' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({leads.filter((l) => l.status === 'discovered' && !l.auditReport && !l.websiteProposal).length})
              </button>
            </div>
          </div>
        </div>

        {/* Structured High-Legibility Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">Business & Reputation</th>
                <th className="py-3 px-4 min-w-[170px]">Website Status</th>
                <th className="py-3 px-4 min-w-[180px]">Contact & Location</th>
                <th className="py-3 px-4 min-w-[140px]">Audit Status</th>
                <th className="py-3 px-4 text-right min-w-[200px]">AK47 Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="font-semibold text-sm text-slate-700">No leads match current filter</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter a keyword, target location, and count above to scrape Google Maps.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const hasAudit = Boolean(lead.auditReport);
                  const hasProp = Boolean(lead.websiteProposal);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-orange-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(lead.id)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* Business & Rating */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {lead.category || 'Local Business'}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {lead.rating || 4.5} ({lead.reviewsCount || 0})
                          </span>
                        </div>
                      </td>

                      {/* Website */}
                      <td className="py-3 px-4">
                        {lead.hasWebsite ? (
                          <div className="space-y-1">
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-semibold max-w-[180px] truncate"
                              title={lead.website}
                            >
                              <Globe className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                              <span className="truncate">{lead.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                            </a>
                            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Website Active</span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>No Website (Pitch Web)</span>
                          </span>
                        )}
                      </td>

                      {/* Contact & Location */}
                      <td className="py-3 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{lead.phone || 'Phone searching...'}</span>
                          {lead.phoneSource === 'website_enriched' && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                              Site Enriched
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.address || lead.city}</span>
                        </div>
                      </td>

                      {/* Audit Status */}
                      <td className="py-3 px-4">
                        {hasAudit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Audit & Pitch Ready</span>
                          </span>
                        ) : hasProp ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            <span>Proposal Ready</span>
                          </span>
                        ) : lead.isProcessing ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 text-orange-600 animate-spin" />
                            <span>Auditing...</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-600 bg-slate-100 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Discovered</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasAudit || hasProp ? (
                            <button
                              type="button"
                              onClick={() => onOpenAuditModal(lead)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 transition-all cursor-pointer"
                              title="View and download PDF report"
                            >
                              <FileText className="w-3.5 h-3.5 text-orange-600" />
                              <span>View PDF</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onInitiateSingleLead(lead)}
                              disabled={lead.isProcessing}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                              title="Audit website & calculate break-even ROI"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-200" />
                              <span>Audit</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenOutreachModal(lead, 'whatsapp')}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
                            title="Open WhatsApp Outreach"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenJourneyDrawer(lead)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                            title="View Lead Journey & Timeline"
                          >
                            <History className="w-3.5 h-3.5 text-slate-500" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(lead.id, lead.name)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-all cursor-pointer"
                            title="Delete this lead"
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
    </div>
  );
};
