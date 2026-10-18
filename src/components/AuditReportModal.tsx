import React from 'react';
import {
  X,
  Download,
  Printer,
  Send,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  MapPin,
  Globe,
  DollarSign,
  Calendar,
  Layers,
  Coins,
} from 'lucide-react';
import { AgencySettings, Lead } from '../types';
import { downloadAuditPdf, downloadProposalPdf } from '../utils/pdfExport';
import { formatMoney } from '../utils/currency';

interface AuditReportModalProps {
  lead: Lead | null;
  onClose: () => void;
  settings: AgencySettings;
  onOpenOutreachModal: (lead: Lead, initialChannel?: 'email' | 'whatsapp') => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  lead,
  onClose,
  settings,
  onOpenOutreachModal,
}) => {
  if (!lead) return null;

  const report = lead.auditReport;
  const proposal = lead.websiteProposal;
  const primaryColor = settings.brandColorPrimary || '#f97316';
  const curSymbol = settings.currency || '₹';

  const handleDownload = () => {
    if (report) {
      downloadAuditPdf(lead, report, settings);
    } else if (proposal) {
      downloadProposalPdf(lead, proposal, settings);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top Floating Action Bar (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
              {report ? 'Executive Audit & ROI Pitch Report' : 'Custom Website Proposal Deck'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
              title="Print or Save as System PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Download branded PDF file"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenOutreachModal(lead, 'whatsapp');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-all ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Report Canvas - Modern Clean Executive White Theme */}
        <div
          className="p-6 sm:p-10 space-y-8 bg-white text-slate-900 print:p-8"
          style={{ fontFamily: settings.fontFamily || 'inherit' }}
        >
          {/* Branded Header Section */}
          <div className="border-b-2 border-orange-500 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.agencyName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-400/40 shadow-xs"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {settings.agencyName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 font-['Outfit']">
                  {settings.agencyName}
                </h1>
                <p className="text-xs text-orange-600 font-bold">
                  {settings.slogan}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {settings.website} • {settings.contactEmail} • {settings.contactPhone}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
                {report ? 'Confidential SEO Audit' : 'Official Web Proposal'}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          {/* Client Identification Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Prepared Exclusively For:
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5 font-['Outfit']">
                  {lead.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 mt-1">
                  <span>Category: <strong>{lead.category}</strong></span>
                  <span>•</span>
                  <span>Location: <strong>{lead.address || lead.city}</strong></span>
                  <span>•</span>
                  <span>Google Rating: <strong>{lead.rating}⭐ ({lead.reviewsCount} reviews)</strong></span>
                </div>
              </div>

              <div className="text-xs">
                {lead.hasWebsite ? (
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {lead.website}
                  </span>
                ) : (
                  <span className="text-amber-800 font-bold flex items-center gap-1 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    No Website Listed on Google Maps
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Render Audit Report (For leads with website) */}
          {report && (
            <div className="space-y-8">
              {/* Score Badges */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 font-bold">
                  Technical Diagnostic Scorecard
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Overall Digital Health', score: report.overallScore },
                    { label: 'Google Maps 3-Pack Rank', score: report.mapsScore },
                    { label: 'Local On-Page SEO', score: report.seoScore },
                    { label: 'Mobile Speed & UX', score: report.mobileSpeedScore },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shadow-xs"
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        {s.label}
                      </div>
                      <div
                        className={`text-2xl font-black mt-1 ${
                          s.score < 50
                            ? 'text-red-600'
                            : s.score < 75
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {s.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-orange-50/70 border-l-4 border-orange-500 p-4 rounded-r-xl border-y border-r border-orange-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">
                  Executive Findings Summary
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {report.summary}
                </p>
              </div>

              {/* Critical Negative Points (Revenue Leaks) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-red-700">
                    Critical Negative Points & Revenue Deficiencies
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {report.negativePoints.map((point, index) => (
                    <div
                      key={index}
                      className="bg-white border border-red-200 rounded-2xl p-4 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                          {point.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">Deficiency #{index + 1}</span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-xs leading-snug">
                        {point.issue}
                      </h5>

                      <div className="text-[11px] text-slate-700 bg-red-50 p-2.5 rounded-xl border border-red-100">
                        <strong className="text-red-800">Impact: </strong>
                        {point.impact}
                      </div>

                      <div className="text-[11px] text-slate-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                        <strong className="text-emerald-700">Our Fix: </strong>
                        {point.fix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guaranteed Return on Investment Mathematics */}
              <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-2 border-emerald-400 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Guaranteed Return on Investment Mathematics
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                  {report.pitch.headline}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed font-medium">
                  {report.pitch.body}
                </p>

                {/* Visual Break-Even Formula Card */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs">
                  <div className="text-center p-2">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      AI Estimated Lead Value
                    </div>
                    <div className="text-xl font-black text-slate-900 mt-1">
                      {formatMoney(report.pitch.estimatedLeadValue, curSymbol)}
                    </div>
                    <div className="text-[10px] text-slate-500">Auto-estimated for {lead.category}</div>
                  </div>

                  <div className="text-center p-2 border-y sm:border-y-0 sm:border-x border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      Break-Even Threshold
                    </div>
                    <div className="text-xl font-black text-emerald-600 mt-1">
                      Just {report.pitch.leadsNeededToBreakEven} Converted Job{report.pitch.leadsNeededToBreakEven > 1 ? 's' : ''}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">100% Retainer Offset</div>
                  </div>

                  <div className="text-center p-2">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      Total Annual Agency Fee
                    </div>
                    <div className="text-xl font-black text-orange-600 mt-1">
                      {formatMoney(report.pitch.yearlyFee, curSymbol)} / yr
                    </div>
                    <div className="text-[10px] text-slate-500">
                      (or {formatMoney(settings.monthlyFee, curSymbol)}/mo)
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-emerald-100/70 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{report.pitch.roiStatement}</span>
                </div>
              </div>

              {/* 3-Phase Roadmap */}
              {report.pitch.phases && report.pitch.phases.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                    90-Day Dominance Sprint Roadmap
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {report.pitch.phases.map((p, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5"
                      >
                        <span className="text-[10px] font-black uppercase text-orange-600 font-mono">
                          {p.phase} • {p.timeline}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{p.title}</h4>
                        <p className="text-[11px] text-slate-600 leading-snug">{p.deliverable}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Render Website Proposal (For prospects without website) */}
          {proposal && !report && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-3xl">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900">
                  Turnkey Website Package
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-['Outfit'] mt-2">
                  {proposal.pitchHeadline}
                </h3>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {proposal.problemStatement}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Included High-Converting Features
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {proposal.proposedFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Website Setup Investment
                    </h4>
                    <div className="text-3xl font-black text-orange-600 font-['Outfit'] mt-2">
                      {formatMoney(proposal.estimatedPrice, curSymbol)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Delivery Timeframe: {proposal.timeline}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600">
                    Includes responsive design, instant WhatsApp click-to-chat, and Google Maps schema markup.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Branded Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              <span>Presented by <strong>{settings.agencyName}</strong></span>
              <span className="mx-2">•</span>
              <span>{settings.contactEmail}</span>
            </div>
            <div className="font-semibold text-slate-600">
              Generated with Leads AK47 Machine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
