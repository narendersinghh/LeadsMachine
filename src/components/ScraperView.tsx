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
} from 'lucide-react';
import { AgencySettings, Lead } from '../types';

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
  const [quantity, setQuantity] = useState<number>(20);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Search Google Maps handler
  const handleSearchGoogleMaps = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;

    setIsSearching(true);
    setSearchStatus(`Scanning Google Maps for "${keyword}" in "${location}" (Target: ${quantity} listings)...`);

    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          location,
          limit: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to search Google Maps');
      }

      const newLeads: Lead[] = data.leads || [];

      // Check for leads missing phones that have websites to auto-enrich
      setSearchStatus(`Found ${newLeads.length} listings. Enriching missing phone numbers...`);

      // Merge newly found leads (preventing exact duplicates by name & phone)
      setLeads((prev) => {
        const existingNames = new Set(prev.map((l) => l.name.toLowerCase()));
        const filteredNew = newLeads.filter((nl) => !existingNames.has(nl.name.toLowerCase()));
        return [...filteredNew, ...prev];
      });

      // Background phone enrichment for leads missing phone but with website
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
                          stage: 'Enriched Phone',
                          title: 'Extracted Phone from Website',
                          description: `Found contact number: ${enrichData.phone || 'N/A'}${enrichData.email ? ` | Email: ${enrichData.email}` : ''}`,
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

      setSearchStatus(`Successfully loaded ${newLeads.length} Google Maps listings! Ready to initiate process.`);
      setTimeout(() => setSearchStatus(''), 6000);
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchStatus(`Search failed: ${error.message || 'Check server connection'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const quickPresets = [
    { k: 'Roofing Contractors', loc: 'Dallas, TX', qty: 20 },
    { k: 'Plumbers', loc: 'Austin, TX', qty: 20 },
    { k: 'Cosmetic Dentists', loc: 'Miami, FL', qty: 30 },
    { k: 'HVAC Contractors', loc: 'Atlanta, GA', qty: 20 },
    { k: 'Personal Injury Lawyers', loc: 'Chicago, IL', qty: 20 },
    { k: 'Auto Repair Shops', loc: 'Phoenix, AZ', qty: 20 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Trigger Control Center */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Background tactical pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-red-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Target Acquisition
                </span>
                <span className="text-xs text-slate-400">Live Google Maps & Places Grounding</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 mt-1 font-['Outfit']">
                Scrape High-Intent Local Business Leads
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Google Maps 3-Pack and organic search. Extracts verified phone, website, address, reviews, and initiates automated audit.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onInitiateBatch(selectedLeadIds.length > 0 ? selectedLeadIds : undefined)}
                disabled={isProcessingBatch || leads.length === 0}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:via-orange-500 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-950/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
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

          {/* Search Form */}
          <form onSubmit={handleSearchGoogleMaps} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Keyword / Niche
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Plumbers, Roofing, Dentists, HVAC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Location / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dallas, TX or Chicago, IL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-semibold"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span className="text-xs uppercase tracking-wider">Scraping...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-white" />
                    <span className="text-xs uppercase tracking-wider">Search Maps</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick preset chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Popular Niches:</span>
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setKeyword(preset.k);
                  setLocation(preset.loc);
                  setQuantity(preset.qty);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
              >
                {preset.k} ({preset.loc})
              </button>
            ))}
          </div>

          {/* Status Alert Banner */}
          {searchStatus && (
            <div className="mt-4 p-3 rounded-xl bg-orange-950/40 border border-orange-500/30 text-xs text-orange-200 flex items-center gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0 animate-pulse" />
              <span>{searchStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedLeadIds.length > 0 && selectedLeadIds.length === leads.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
            <span className="text-sm font-bold text-slate-200">
              Discovered Leads ({leads.length})
            </span>
            {selectedLeadIds.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {selectedLeadIds.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Website Found: {leads.filter((l) => l.hasWebsite).length}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Missing Website: {leads.filter((l) => !l.hasWebsite).length}
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Business & Google Rating</th>
                <th className="py-3 px-4">Website Presence</th>
                <th className="py-3 px-4">Contact Phone & Address</th>
                <th className="py-3 px-4">Journey Status</th>
                <th className="py-3 px-4 text-right">AK47 Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-medium text-sm text-slate-400">No leads found yet</p>
                    <p className="text-xs text-slate-500 mt-1">Enter a keyword and location above to unleash the scraper.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const hasAudit = Boolean(lead.auditReport);
                  const hasProp = Boolean(lead.websiteProposal);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-orange-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectLead(lead.id)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* Business & Rating */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          <span>{lead.name}</span>
                          <a
                            href={lead.placeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-orange-400"
                            title="Open Google Maps listing"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-slate-400">
                          <span className="text-slate-300 font-medium">{lead.category}</span>
                          <span>•</span>
                          <span className="flex items-center text-amber-400 font-semibold gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {lead.rating}
                          </span>
                          <span className="text-slate-500">({lead.reviewsCount} reviews)</span>
                        </div>
                      </td>

                      {/* Website */}
                      <td className="py-3.5 px-4">
                        {lead.hasWebsite ? (
                          <div>
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-400 hover:underline max-w-[180px] truncate font-medium"
                              title={lead.website}
                            >
                              <Globe className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                              <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                              ✓ Ready for SEO & Maps Audit
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <AlertCircle className="w-3 h-3" />
                              No Website Listed
                            </span>
                            <div className="text-[10px] text-amber-300/80 mt-0.5">
                              Target for Web Design Proposal
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Phone & Address */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-200 font-mono font-medium">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {lead.phone ? (
                            <span>{lead.phone}</span>
                          ) : (
                            <span className="text-red-400 italic text-[11px]">No phone on Maps</span>
                          )}
                          {lead.phoneSource === 'website_enriched' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" title="Found via website scraper">
                              Enriched
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px] truncate max-w-[200px] mt-0.5">
                          {lead.address}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            lead.status === 'discovered'
                              ? 'bg-slate-800 text-slate-300'
                              : lead.status === 'auditing'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                              : lead.status === 'audit_ready' || lead.status === 'proposal_ready'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : lead.status === 'contacted_email'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : lead.status === 'contacted_whatsapp'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : lead.status === 'replied'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : lead.status === 'won'
                              ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {lead.status === 'discovered' && <Clock className="w-3 h-3" />}
                          {lead.status === 'auditing' && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {(lead.status === 'audit_ready' || lead.status === 'proposal_ready') && <FileText className="w-3 h-3" />}
                          {lead.status === 'contacted_email' && <Send className="w-3 h-3" />}
                          {lead.status === 'contacted_whatsapp' && <MessageSquare className="w-3 h-3" />}
                          {(lead.status === 'replied' || lead.status === 'won') && <CheckCircle2 className="w-3 h-3" />}

                          <span className="capitalize">{lead.status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If not audited yet, single click "Initiate" button */}
                          {!hasAudit && !hasProp ? (
                            <button
                              onClick={() => onInitiateSingleLead(lead)}
                              disabled={lead.isProcessing}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600/80 hover:bg-orange-500 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
                              title={lead.hasWebsite ? 'Audit Website & Generate ROI Report' : 'Generate Website Proposal Pitch'}
                            >
                              <Zap className={`w-3.5 h-3.5 ${lead.isProcessing ? 'animate-spin' : ''}`} />
                              <span>{lead.isProcessing ? 'Auditing...' : 'Initiate'}</span>
                            </button>
                          ) : (
                            /* If audit / proposal ready, view PDF report */
                            <button
                              onClick={() => onOpenAuditModal(lead)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-all shadow-sm"
                              title="View & Download Executive PDF Report"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              <span>PDF Report</span>
                            </button>
                          )}

                          {/* Quick Outreach Buttons */}
                          <button
                            onClick={() => onOpenOutreachModal(lead, 'email')}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white transition-all"
                            title="Contact via Email"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenOutreachModal(lead, 'whatsapp')}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all"
                            title="Contact via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Journey History Drawer */}
                          <button
                            onClick={() => onOpenJourneyDrawer(lead)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                            title="View Lead Journey & Timeline"
                          >
                            <History className="w-3.5 h-3.5" />
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
