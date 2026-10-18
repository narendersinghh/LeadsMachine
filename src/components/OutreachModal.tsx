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
import { formatMoney } from '../utils/currency';

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
  initialChannel = 'whatsapp',
}) => {
  if (!lead) return null;

  const [activeChannel, setActiveChannel] = useState<'email' | 'whatsapp'>(initialChannel);
  const [whatsAppType, setWhatsAppType] = useState<'first_touch' | 'follow_up'>('first_touch');

  const curSymbol = settings.currency || '₹';

  // Fill tags helper
  const replaceTags = (text: string) => {
    return text
      .replace(/{{business_name}}/g, lead.name)
      .replace(/{{category}}/g, lead.category)
      .replace(/{{location}}/g, lead.city || lead.address || 'your city')
      .replace(/{{agency_name}}/g, settings.agencyName)
      .replace(/{{currency}}/g, curSymbol)
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
                title: `Sent ${channel.toUpperCase()} Message (${whatsAppType === 'first_touch' ? 'Cold Icebreaker' : 'Follow-Up'})`,
                description:
                  channel === 'email'
                    ? `Sent email to ${recipientEmail || 'prospect'}. Subject: "${emailSubject}"`
                    : `Dispatched WhatsApp message to ${recipientPhone}: "${whatsAppMessage.slice(0, 80)}..."`,
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
                description: 'Client responded to message. Ready for follow-up audit delivery.',
                type: 'status_change',
              },
            ],
          };
        }
        return l;
      })
    );
  };

  const handleMarkMeetingBooked = () => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === lead.id) {
          return {
            ...l,
            status: 'meeting_booked',
            updatedAt: new Date().toISOString(),
            journey: [
              ...l.journey,
              {
                id: `j-meet-${Date.now()}`,
                timestamp: new Date().toISOString(),
                stage: 'Meeting Booked',
                title: 'Discovery Call Scheduled!',
                description: `Arranged strategy session with ${lead.name}.`,
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
                title: '🎉 Client Signed & Retainer Won!',
                description: `Successfully closed ${lead.name} for ${curSymbol}${settings.yearlyFee.toLocaleString()}/yr retainer!`,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm font-['Outfit']">
                Multi-Channel Outreach Hub
              </h3>
              <p className="text-xs text-slate-500">
                {lead.name} • {lead.city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Tabs */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveChannel('whatsapp')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChannel === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Outreach</span>
            </button>

            <button
              onClick={() => setActiveChannel('email')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChannel === 'email'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email Pitch</span>
            </button>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Stage
            </span>
            <span className="text-xs font-bold text-slate-800 capitalize">
              {lead.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-white">
          {/* WHATSAPP TAB */}
          {activeChannel === 'whatsapp' && (
            <div className="space-y-4">
              {/* Type Switcher */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => handleSwitchWhatsAppType('first_touch')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    whatsAppType === 'first_touch'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. First Cold Touch (No Fee, No PDF)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchWhatsAppType('follow_up')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    whatsAppType === 'follow_up'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2. Follow-Up (Deliver Audit & Pitch)
                </button>
              </div>

              {/* Messaging rule notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {whatsAppType === 'first_touch' ? (
                    <>
                      <strong>Non-Intrusive Cold Touch:</strong> This message does <em>not</em> include any fee information and does <em>not</em> attach an unsolicited PDF report. It checks whether the business is currently taking on new clients.
                    </>
                  ) : (
                    <>
                      <strong>Audit Delivery:</strong> Sent after the prospect replies. Mentions the 3 quick fixes discovered in their Google Maps ranking.
                    </>
                  )}
                </p>
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+91 98765 43210 or (512) 555-0199"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Message Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    WhatsApp Message Text
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(whatsAppMessage)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={whatsAppMessage}
                  onChange={(e) => setWhatsAppMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white leading-relaxed font-sans"
                />
              </div>

              {/* WhatsApp Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLaunchWhatsApp}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open in WhatsApp Web / App</span>
                </button>
              </div>
            </div>
          )}

          {/* EMAIL TAB */}
          {activeChannel === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="contact@business.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Body
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(emailBody)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Body'}</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLaunchEmailClient}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Launch Default Email Client (mailto)</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Lead Journey Status Transitions */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Update Response State in CRM:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleMarkReplied}
                className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Client Replied</span>
              </button>

              <button
                type="button"
                onClick={handleMarkMeetingBooked}
                className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Call Booked</span>
              </button>

              <button
                type="button"
                onClick={handleMarkWon}
                className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deal Won! 🎉</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
