import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
  Trophy,
  Calendar,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgencySettings, Lead, LeadStatus } from '../types';

interface OutreachModalProps {
  lead: Lead | null;
  onClose: () => void;
  settings: AgencySettings;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  initialChannel?: 'email' | 'whatsapp';
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  lead,
  onClose,
  settings,
  setLeads,
  initialChannel = 'email',
}) => {
  if (!lead) return null;

  const [activeChannel, setActiveChannel] = useState<'email' | 'whatsapp'>(initialChannel);
  const [whatsAppType, setWhatsAppType] = useState<'first_touch' | 'follow_up'>('first_touch');

  // Fill tags helper
  const replaceTags = (text: string) => {
    return text
      .replace(/{{business_name}}/g, lead.name)
      .replace(/{{category}}/g, lead.category)
      .replace(/{{location}}/g, lead.city || lead.address || 'your city')
      .replace(/{{agency_name}}/g, settings.agencyName)
      .replace(/{{currency}}/g, settings.currency || '₹')
      .replace(/{{annual_fee}}/g, (settings.yearlyFee || 35000).toLocaleString());
  };

  // Email form state
  const [recipientEmail, setRecipientEmail] = useState(lead.email || '');
  const [emailSubject, setEmailSubject] = useState(
    replaceTags(settings.firstEmailSubjectTemplate || 'Quick question regarding {{business_name}} in {{location}}')
  );
  const [emailBody, setEmailBody] = useState(
    replaceTags(
      settings.firstEmailBodyTemplate ||
        'Hi {{business_name}} team,\n\nI was looking at your listing on Google Maps for {{category}} in {{location}}.\n\nAre you currently accepting new client bookings this month?\n\nBest regards,\n{{agency_name}}'
    )
  );

  // WhatsApp form state
  const [recipientPhone, setRecipientPhone] = useState(lead.phone || '');
  const defaultFirstTouchMsg = replaceTags(
    settings.firstWhatsAppMessageTemplate ||
      'Hi {{business_name}}! Found your profile on Google Maps for {{category}} in {{location}}. Are you currently taking on new clients this week?'
  );
  const defaultFollowUpMsg = replaceTags(
    settings.followUpWhatsAppMessageTemplate ||
      'Thanks for replying! We ran a quick diagnostic on your Google Maps 3-Pack ranking in {{location}} and noticed 3 quick fixes to bring 15-20 more calls a month. Can I share a quick 1-page visual breakdown?'
  );

  const [whatsAppMessage, setWhatsAppMessage] = useState(defaultFirstTouchMsg);
  const [copied, setCopied] = useState(false);

  // Switch between first touch (no fee, no pdf) and follow up
  const handleSwitchWhatsAppType = (type: 'first_touch' | 'follow_up') => {
    setWhatsAppType(type);
    if (type === 'first_touch') {
      setWhatsAppMessage(defaultFirstTouchMsg);
    } else {
      setWhatsAppMessage(defaultFollowUpMsg);
    }
  };

  // Helper to sanitize phone for WhatsApp wa.me links
  const getCleanPhoneDigits = (rawPhone: string) => {
    const cleaned = rawPhone.replace(/\D/g, '');
    // If 10 digits and starts with 9/8/7/6 (India), prepend 91 if needed
    if (cleaned.length === 10) {
      if (['9', '8', '7', '6'].includes(cleaned[0])) {
        return `91${cleaned}`;
      }
      return `1${cleaned}`;
    }
    return cleaned;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchEmailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    recordOutreach('email');
  };

  const handleLaunchWhatsApp = () => {
    const digits = getCleanPhoneDigits(recipientPhone);
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(whatsAppMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    recordOutreach('whatsapp');
  };

  const recordOutreach = (channel: 'email' | 'whatsapp') => {
    const newStatus: LeadStatus = channel === 'email' ? 'contacted_email' : 'contacted_whatsapp';

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === lead.id) {
          return {
            ...l,
            status: newStatus,
            email: recipientEmail || l.email,
            phone: recipientPhone || l.phone,
            updatedAt: new Date().toISOString(),
            journey: [
              ...l.journey,
              {
                id: `j-outreach-${Date.now()}`,
                timestamp: new Date().toISOString(),
                stage: channel === 'email' ? 'Contacted (Email)' : 'Contacted (WhatsApp)',
                title: `Dispatched ${channel.toUpperCase()} Message (${whatsAppType === 'first_touch' ? 'First Warm Touch' : 'Follow-Up'})`,
                description:
                  channel === 'email'
                    ? `Sent email to ${recipientEmail || 'prospect'}. Subject: "${emailSubject}"`
                    : `Sent WhatsApp message to ${recipientPhone}: "${whatsAppMessage.slice(0, 80)}..."`,
                type: channel,
              },
            ],
          };
        }
        return l;
      })
    );
  };

  const handleMarkReplied = () => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === lead.id) {
          return {
            ...l,
            status: 'replied',
            updatedAt: new Date().toISOString(),
            journey: [
              ...l.journey,
              {
                id: `j-replied-${Date.now()}`,
                timestamp: new Date().toISOString(),
                stage: 'Client Replied',
                title: 'Prospect Replied to Icebreaker!',
                description: 'Client responded to WhatsApp/email. Ready for follow-up audit delivery.',
                type: 'status_change',
              },
            ],
          };
        }
        return l;
      })
    );
  };

  const handleMarkWon = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === lead.id) {
          return {
            ...l,
            status: 'won',
            updatedAt: new Date().toISOString(),
            journey: [
              ...l.journey,
              {
                id: `j-won-${Date.now()}`,
                timestamp: new Date().toISOString(),
                stage: 'Deal Won',
                title: '🎉 Client Signed & Deal Won!',
                description: `Successfully closed ${lead.name} for ${settings.currency || '₹'}${settings.yearlyFee.toLocaleString()}/yr agency retainer!`,
                type: 'status_change',
              },
            ],
          };
        }
        return l;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm font-['Outfit']">
                Multi-Channel Outreach Hub
              </h3>
              <p className="text-xs text-slate-400">
                {lead.name} • {lead.city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Tabs */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveChannel('whatsapp')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeChannel === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Outreach</span>
            </button>

            <button
              onClick={() => setActiveChannel('email')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeChannel === 'email'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Cold Email Outreach</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
            Status: <span className="text-orange-400 capitalize">{lead.status.replace('_', ' ')}</span>
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
          {activeChannel === 'whatsapp' ? (
            /* WhatsApp Channel */
            <div className="space-y-4">
              {/* WhatsApp Message Type Selector */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSwitchWhatsAppType('first_touch')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    whatsAppType === 'first_touch'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>1. First Touch (Zero Fees & No PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchWhatsAppType('follow_up')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    whatsAppType === 'follow_up'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>2. Follow-Up (Deliver Audit Pitch)</span>
                </button>
              </div>

              {whatsAppType === 'first_touch' && (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Simple conversational icebreaker: does NOT mention any fee, pricing, or unsolicited PDF. High reply rate!
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Recipient WhatsApp / Mobile Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210 or (512) 555-0199"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                {recipientPhone && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    WhatsApp click-to-chat target: <code className="text-emerald-400 font-mono">+{getCleanPhoneDigits(recipientPhone)}</code>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    WhatsApp Message Text
                  </label>
                  <button
                    onClick={() => handleCopy(whatsAppMessage)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={whatsAppMessage}
                  onChange={(e) => setWhatsAppMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => recordOutreach('whatsapp')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Mark as Sent (Without Launching)
                </button>

                <button
                  onClick={handleLaunchWhatsApp}
                  disabled={!recipientPhone}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Launch WhatsApp Web & Send</span>
                </button>
              </div>
            </div>
          ) : (
            /* Email Channel */
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Recipient Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. contact@business.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {!recipientEmail && (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    No email listed on Google Maps. Enter manually or click to open website.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Conversational Cold Email Body
                  </label>
                  <button
                    onClick={() => handleCopy(emailBody)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => recordOutreach('email')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Mark as Sent (Without Launching)
                </button>

                <button
                  onClick={handleLaunchEmailClient}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Open in Email App & Send</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Reaction & Outcome Logger */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Log Prospect Reaction & Outcomes
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleMarkReplied}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Mark as "Replied / In Dialogue"</span>
              </button>

              <button
                onClick={handleMarkWon}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark as "Won Deal" 🏆</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
