import React, { useState } from 'react';
import {
  Settings,
  Upload,
  FileText,
  DollarSign,
  Palette,
  Building,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Image,
  Trash2,
  MessageSquare,
  Mail,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { AgencySettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/defaults';

interface SettingsViewProps {
  settings: AgencySettings;
  setSettings: React.Dispatch<React.SetStateAction<AgencySettings>>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings }) => {
  const [form, setForm] = useState<AgencySettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (field: keyof AgencySettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLeadValueChange = (industry: string, val: number) => {
    setForm((prev) => ({
      ...prev,
      industryLeadValues: {
        ...prev.industryLeadValues,
        [industry]: val,
      },
    }));
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleInputChange('logoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Proposal PDF file upload handler (for leads without websites)
  const handleProposalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleInputChange('uploadedProposalFile', {
          name: file.name,
          size: file.size,
          dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
          uploadDate: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProposalFile = () => {
    handleInputChange('uploadedProposalFile', undefined);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all agency settings, outreach templates, and currency to defaults (INR)?')) {
      setForm(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const colorPresets = [
    { name: 'Tactical Fire', p: '#f97316', a: '#e11d48' },
    { name: 'Cyber Crimson', p: '#ef4444', a: '#f59e0b' },
    { name: 'Titanium Gold', p: '#eab308', a: '#ea580c' },
    { name: 'Emerald Vault', p: '#10b981', a: '#059669' },
    { name: 'Executive Cobalt', p: '#3b82f6', a: '#6366f1' },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Agency Configuration
            </span>
            <span className="text-xs text-slate-400">PDF Branding, Currency, Outreach & Pricing</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1 font-['Outfit']">
            Settings & Outreach Templates
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure default currency (INR), WhatsApp messaging rules (zero-fee first touch), PDF branding, and proposal files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-950/50 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{saveSuccess ? 'Saved Changes!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Agency settings, currency, and WhatsApp templates successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: WhatsApp & Outreach Messaging (User Requirement) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-sm font-['Outfit']">
                WhatsApp Outreach Configuration (Zero-Fee First Touch)
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              High-Conversion Standard
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Outreach Rule Enforced:</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Default first contact message does <strong>NOT</strong> include any fee or pricing information, and does <strong>NOT</strong> mention or attach an unsolicited PDF report. It is a simple, warm check to verify availability and start a real dialogue.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  First WhatsApp Message Template (Cold Icebreaker)
                </label>
                <span className="text-[10px] text-slate-500">Tags: {'{{business_name}}'}, {'{{category}}'}, {'{{location}}'}</span>
              </div>
              <textarea
                rows={3}
                value={form.firstWhatsAppMessageTemplate}
                onChange={(e) => handleInputChange('firstWhatsAppMessageTemplate', e.target.value)}
                placeholder="Hi {{business_name}}! Found your profile on Google Maps for {{category}} in {{location}}. Are you currently taking on new clients this week?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                This simple question gets up to a 64% response rate compared to lengthy sales pitches.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Follow-Up WhatsApp Message (Sent After They Reply)
                </label>
                <span className="text-[10px] text-slate-500">Delivers Audit / Pitch</span>
              </div>
              <textarea
                rows={3}
                value={form.followUpWhatsAppMessageTemplate}
                onChange={(e) => handleInputChange('followUpWhatsAppMessageTemplate', e.target.value)}
                placeholder="Thanks for replying! We ran a quick diagnostic on your Google Maps 3-Pack ranking in {{location}} and noticed 3 quick fixes to bring 15-20 more calls a month. Can I share a quick 1-page visual breakdown?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>

            {/* Email Templates */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                First Cold Email Subject
              </label>
              <input
                type="text"
                value={form.firstEmailSubjectTemplate}
                onChange={(e) => handleInputChange('firstEmailSubjectTemplate', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Currency & ROI Economics (INR Default) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-sm font-['Outfit']">
                Currency & Break-Even Lead Conversion Economics
              </h3>
            </div>
            <span className="text-xs text-orange-400 font-bold">
              Default Currency: {form.currency} (INR)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Select Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 font-black text-sm"
              >
                <option value="₹">₹ - Indian Rupee (INR) [Default]</option>
                <option value="$">$ - US / Canadian Dollar (USD)</option>
                <option value="€">€ - Euro (EUR)</option>
                <option value="£">£ - British Pound (GBP)</option>
                <option value="A$">A$ - Australian Dollar (AUD)</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Yearly Agency Retainer ({form.currency})
              </label>
              <input
                type="number"
                value={form.yearlyFee}
                onChange={(e) => handleInputChange('yearlyFee', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Monthly Retainer Fee ({form.currency})
              </label>
              <input
                type="number"
                value={form.monthlyFee}
                onChange={(e) => handleInputChange('monthlyFee', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Industry values */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Assumed Average Client Value by Niche ({form.currency})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {Object.entries(form.industryLeadValues).map(([industry, val]) => (
                <div key={industry} className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 capitalize">
                    {industry}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                      {form.currency}
                    </span>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleLeadValueChange(industry, Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Agency Profile & Logo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-slate-100 text-sm font-['Outfit']">
              Agency Information & Logo (For PDF Reports)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Agency Name
              </label>
              <input
                type="text"
                value={form.agencyName}
                onChange={(e) => handleInputChange('agencyName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Slogan / Subtitle
              </label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Agency Logo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {form.logoUrl ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-orange-500/30 bg-slate-950 shrink-0">
                  <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                  <Image className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="Paste direct Image URL (e.g. https://.../logo.png)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Logo File</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <span className="text-[11px] text-slate-400">PNG, JPG, or SVG</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Brand Colors & Fonts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Palette className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-slate-100 text-sm font-['Outfit']">
              PDF Document Styling (Colors & Typography)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandColorPrimary}
                  onChange={(e) => handleInputChange('brandColorPrimary', e.target.value)}
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.brandColorPrimary}
                  onChange={(e) => handleInputChange('brandColorPrimary', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Accent Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandColorAccent}
                  onChange={(e) => handleInputChange('brandColorAccent', e.target.value)}
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.brandColorAccent}
                  onChange={(e) => handleInputChange('brandColorAccent', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                PDF Typography Font
              </label>
              <select
                value={form.fontFamily}
                onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500 font-medium"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Executive)</option>
                <option value="Outfit">Outfit (High-Impact Tech)</option>
                <option value="Inter">Inter (Ultra Clean)</option>
                <option value="Space Grotesk">Space Grotesk (Tactical Precision)</option>
                <option value="Roboto">Roboto (Classic Sans)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: No-Website Proposal File */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm font-['Outfit']">
              Website Proposal PDF (For Prospects With No Website)
            </h3>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">
                {form.uploadedProposalFile ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Uploaded: {form.uploadedProposalFile.name} ({(form.uploadedProposalFile.size / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  <span>Using Built-in Turnkey Web Proposal Deck</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Automatically attached/offered when leads with no website are discovered.
              </div>
            </div>

            <div className="flex items-center gap-2">
              {form.uploadedProposalFile && (
                <button
                  type="button"
                  onClick={handleRemoveProposalFile}
                  className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/50"
                  title="Remove uploaded deck"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span>Upload PDF Deck</span>
                <input type="file" accept=".pdf" onChange={handleProposalFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-950/50 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
