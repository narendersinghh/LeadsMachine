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
} from 'lucide-react';
import { AgencySettings, Lead } from '../types';
import { downloadAuditPdf, downloadWebsiteProposalPdf } from '../utils/pdfExport';

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

  const handleDownload = () => {
    if (report) {
      downloadAuditPdf(lead, report, settings);
    } else if (proposal) {
      downloadWebsiteProposalPdf(lead, proposal, settings);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const primaryColor = settings.brandColorPrimary || '#f97316';
  const accentColor = settings.brandColorAccent || '#e11d48';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
              {report ? 'Executive Audit & ROI Pitch Report' : 'Custom Website Proposal Deck'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              title="Print or Save as System PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title="Download branded PDF file"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenOutreachModal(lead, 'email');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send Pitch</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Report Canvas */}
        <div
          className="p-6 sm:p-10 space-y-8 bg-slate-900 print:bg-white print:text-black print:p-8"
          style={{ fontFamily: settings.fontFamily || 'inherit' }}
        >
          {/* Branded Header Section */}
          <div className="border-b-2 border-orange-500 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.agencyName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-500/30 print:ring-0 shadow-md"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  {settings.agencyName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white print:text-black">
                  {settings.agencyName}
                </h1>
                <p className="text-xs text-orange-400 font-semibold print:text-orange-600">
                  {settings.slogan}
                </p>
                <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                  {settings.website} • {settings.contactEmail} • {settings.contactPhone}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 print:border-black print:text-black">
                {report ? 'Confidential SEO Audit' : 'Official Web Proposal'}
              </span>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          {/* Client Identification Card */}
          <div className="bg-slate-950/70 print:bg-slate-100 rounded-2xl p-5 border border-slate-800 print:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                  Prepared Specifically For:
                </span>
                <h2 className="text-xl font-extrabold text-slate-100 print:text-black mt-0.5">
                  {lead.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 print:text-slate-700 mt-1">
                  <span>Category: <strong>{lead.category}</strong></span>
                  <span>•</span>
                  <span>Location: <strong>{lead.address || lead.city}</strong></span>
                  <span>•</span>
                  <span>Google Rating: <strong>{lead.rating}⭐ ({lead.reviewsCount} reviews)</strong></span>
                </div>
              </div>

              <div className="text-xs">
                {lead.hasWebsite ? (
                  <span className="text-blue-400 print:text-blue-600 font-medium flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {lead.website}
                  </span>
                ) : (
                  <span className="text-amber-400 print:text-amber-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 mb-3">
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
                      className="bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-2xl p-4 text-center"
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                        {s.label}
                      </div>
                      <div
                        className={`text-2xl font-black mt-1 ${
                          s.score < 50
                            ? 'text-red-400 print:text-red-600'
                            : s.score < 75
                            ? 'text-amber-400 print:text-amber-600'
                            : 'text-emerald-400 print:text-emerald-600'
                        }`}
                      >
                        {s.score} <span className="text-xs font-normal text-slate-500">/ 100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-slate-950/40 print:bg-slate-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 print:text-orange-700 mb-1">
                  Executive Findings Summary
                </h4>
                <p className="text-sm text-slate-200 print:text-slate-800 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Critical Negative Points (Revenue Leaks) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-red-400 print:text-red-600" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-red-400 print:text-red-700">
                    Critical Negative Points & Revenue Deficiencies
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {report.negativePoints.map((point, index) => (
                    <div
                      key={index}
                      className="bg-slate-950/80 print:bg-slate-50 border border-red-500/30 print:border-red-200 rounded-2xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 text-red-400 print:text-red-700 border border-red-500/20">
                          {point.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">Deficiency #{index + 1}</span>
                      </div>

                      <h5 className="font-bold text-slate-100 print:text-black text-xs leading-snug">
                        {point.issue}
                      </h5>

                      <div className="text-[11px] text-slate-400 print:text-slate-700 bg-red-950/20 print:bg-red-50 p-2 rounded-lg border border-red-900/30 print:border-red-100">
                        <strong className="text-red-300 print:text-red-800">Impact: </strong>
                        {point.impact}
                      </div>

                      <div className="text-[11px] text-emerald-300 print:text-emerald-800 bg-emerald-950/20 print:bg-emerald-50 p-2 rounded-lg border border-emerald-900/30 print:border-emerald-100">
                        <strong className="text-emerald-400 print:text-emerald-700">Our Fix: </strong>
                        {point.fix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mathematical Break-Even ROI Formula Pitch (User's Core Requirement) */}
              <div className="bg-gradient-to-br from-emerald-950/50 via-slate-950 to-slate-950 print:bg-emerald-50 border-2 border-emerald-500/40 print:border-emerald-500 rounded-3xl p-6 sm:p-7 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400 print:text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 print:text-emerald-700">
                    Guaranteed Return on Investment Mathematics
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-100 print:text-black font-['Outfit']">
                  {report.pitch.headline}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 print:text-slate-700 mt-2 leading-relaxed">
                  {report.pitch.body}
                </p>

                {/* Visual Break-Even Formula Card */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/90 print:bg-white rounded-2xl p-4 border border-emerald-500/30 print:border-emerald-200">
                  <div className="text-center p-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                      Est. Converted Lead Value
                    </div>
                    <div className="text-xl font-extrabold text-slate-100 print:text-black mt-1">
                      {settings.currency || '₹'}{report.pitch.estimatedLeadValue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">Based on {lead.category}</div>
                  </div>

                  <div className="text-center p-2 border-y sm:border-y-0 sm:border-x border-slate-800 print:border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                      Break-Even Threshold
                    </div>
                    <div className="text-xl font-extrabold text-emerald-400 print:text-emerald-600 mt-1">
                      Just {report.pitch.leadsNeededToBreakEven} Converted Job{report.pitch.leadsNeededToBreakEven > 1 ? 's' : ''}
                    </div>
                    <div className="text-[10px] text-emerald-500 font-semibold">100% Retainer Offset</div>
                  </div>

                  <div className="text-center p-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                      Total Annual Agency Fee
                    </div>
                    <div className="text-xl font-extrabold text-orange-400 print:text-orange-600 mt-1">
                      {settings.currency || '₹'}{report.pitch.yearlyFee.toLocaleString()} / yr
                    </div>
                    <div className="text-[10px] text-slate-500">
                      (or {settings.currency || '₹'}{settings.monthlyFee}/mo)
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 print:text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{report.pitch.roiStatement}</span>
                </div>
              </div>

              {/* 3-Phase Roadmap */}
              {report.pitch.phases && report.pitch.phases.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 mb-3">
                    90-Day Dominance Sprint Roadmap
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {report.pitch.phases.map((p, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-2xl p-4"
                      >
                        <div className="text-[10px] font-black text-orange-400 print:text-orange-600 uppercase">
                          {p.phase} • {p.timeline}
                        </div>
                        <h5 className="font-bold text-slate-200 print:text-black text-xs mt-1">
                          {p.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 print:text-slate-600 mt-1">
                          {p.deliverable}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Render Website Proposal (For leads with NO website) */}
          {proposal && (
            <div className="space-y-6">
              <div className="bg-red-950/20 print:bg-red-50 border border-red-500/30 print:border-red-200 rounded-2xl p-5">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 print:text-red-700">
                  Critical Emergency: Zero Web Presence on Google Maps
                </span>
                <h3 className="text-xl font-black text-slate-100 print:text-black mt-1">
                  {proposal.pitchHeadline}
                </h3>
                <p className="text-xs text-slate-300 print:text-slate-700 mt-2 leading-relaxed">
                  {proposal.problemStatement}
                </p>
                <div className="mt-3 p-3 bg-red-950/40 print:bg-red-100/60 rounded-xl text-xs font-bold text-red-300 print:text-red-800">
                  ⚠️ Estimated Revenue Bleed: {proposal.missedRevenueEstimate}
                </div>
              </div>

              {/* Turnkey Features Package */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 mb-3">
                  Turnkey Website Package Deliverables
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {proposal.proposedFeatures.map((feat, i) => (
                    <div
                      key={i}
                      className="bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-3.5 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-slate-200 print:text-slate-800">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Guarantee */}
              <div className="bg-slate-950 print:bg-slate-100 rounded-2xl p-5 border border-slate-800 print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                    All-Inclusive Project Investment
                  </div>
                  <div className="text-2xl font-black text-emerald-400 print:text-emerald-700 mt-0.5">
                    {settings.currency || '₹'}{proposal.estimatedPrice.toLocaleString()} Turnkey
                  </div>
                  <div className="text-xs text-slate-400 print:text-slate-600">
                    Includes responsive design, hosting setup, local schema, and Google Maps verification.
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200 print:text-black">
                    Timeline: {proposal.timeline}
                  </div>
                  <div className="text-[11px] text-orange-400 print:text-orange-600 font-semibold mt-0.5">
                    100% Mobile & Speed Performance Guarantee
                  </div>
                </div>
              </div>

              {/* Uploaded Settings Custom Proposal Deck Notice if exists */}
              {settings.uploadedProposalFile && (
                <div className="p-4 rounded-xl bg-slate-950 border border-orange-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Standard Attached Deck: {settings.uploadedProposalFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Configured in agency settings for instant client dispatch.
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
                    Included
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Agency Sign-off & Next Steps Footer */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400 print:text-slate-600">
            <div>
              <p className="font-bold text-slate-200 print:text-black">
                Authorized by: {settings.agencyName}
              </p>
              <p className="text-[11px] mt-0.5">
                Questions or ready to initiate? Email {settings.contactEmail} or call {settings.contactPhone}
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={() => {
                  onClose();
                  onOpenOutreachModal(lead, 'whatsapp');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Text on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
