import React, { useState, useEffect } from 'react';
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
  Cpu,
  Coins,
} from 'lucide-react';
import { AgencySettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/defaults';
import { SUPPORTED_CURRENCIES, formatMoney } from '../utils/currency';

interface SettingsViewProps {
  settings: AgencySettings;
  setSettings: React.Dispatch<React.SetStateAction<AgencySettings>>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings }) => {
  const [form, setForm] = useState<AgencySettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currencyChangedMsg, setCurrencyChangedMsg] = useState('');

  // Sync form when settings changes externally
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleInputChange = (field: keyof AgencySettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Immediate, fully reactive currency switch that updates both state and localStorage immediately
  const handleCurrencySelect = (newCur: string) => {
    const updatedForm = { ...form, currency: newCur };
    setForm(updatedForm);
    setSettings((prev) => {
      const updated = { ...prev, currency: newCur };
      try {
        localStorage.setItem('leadsak47_settings', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save currency to localStorage:', err);
      }
      return updated;
    });

    setCurrencyChangedMsg(`Currency switched to ${newCur}`);
    setTimeout(() => setCurrencyChangedMsg(''), 2500);
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

  // Proposal PDF file upload handler (for prospects without websites)
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

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSettings(form);
    try {
      localStorage.setItem('leadsak47_settings', JSON.stringify(form));
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all agency settings, outreach templates, and currency to defaults (₹ INR)?')) {
      setForm(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      try {
        localStorage.setItem('leadsak47_settings', JSON.stringify(DEFAULT_SETTINGS));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const colorPresets = [
    { name: 'Tactical Fire', p: '#f97316', a: '#e11d48' },
    { name: 'Cyber Crimson', p: '#ef4444', a: '#f59e0b' },
    { name: 'Titanium Gold', p: '#eab308', a: '#ea580c' },
    { name: 'Emerald Vault', p: '#10b981', a: '#059669' },
    { name: 'Executive Cobalt', p: '#3b82f6', a: '#6366f1' },
  ];

  const currentCurrency = form.currency || '₹';

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header Banner - Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
              Agency Configuration
            </span>
            <span className="text-xs text-slate-500 font-medium">Currency, Templates, & Branding</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1 font-['Outfit']">
            Settings & Outreach Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Manage your currency (default: ₹ INR), agency pricing, cold WhatsApp icebreakers, and branded PDF styles.
          </p>
        </div>

        {/* Buttons shifted below description instead of on the right side */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleSave()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{saveSuccess ? 'Saved Changes!' : 'Save Settings'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <span className="text-xs text-slate-400 ml-auto font-medium hidden sm:inline">
            Active Currency: <strong className="text-slate-800">{currentCurrency}</strong>
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2 font-medium animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All agency settings, pricing, currency, and outreach templates saved successfully!</span>
        </div>
      )}

      {currencyChangedMsg && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2 font-bold animate-in fade-in">
          <Coins className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{currencyChangedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Currency & Agency Pricing */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">
                Currency & Retainer Pricing
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active: {currentCurrency} ({SUPPORTED_CURRENCIES.find((c) => c.symbol === currentCurrency)?.name || currentCurrency})
            </span>
          </div>

          {/* Quick Currency Selection Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Currency (Click to Switch Instantly)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_CURRENCIES.map((cur) => {
                const isActive = currentCurrency === cur.symbol;
                return (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => handleCurrencySelect(cur.symbol)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-400/30 text-orange-950 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-black flex items-center gap-1.5">
                        <span className="text-base text-orange-600">{cur.symbol}</span>
                        <span>{cur.code}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{cur.name}</div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom currency or manual selector */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Custom Currency Symbol
              </label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => handleCurrencySelect(e.target.value)}
                placeholder="e.g. ₹, $, €, £"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Yearly Agency Retainer ({currentCurrency})
              </label>
              <input
                type="number"
                value={form.yearlyFee}
                onChange={(e) => handleInputChange('yearlyFee', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monthly Retainer ({currentCurrency})
              </label>
              <input
                type="number"
                value={form.monthlyFee}
                onChange={(e) => handleInputChange('monthlyFee', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          {/* AI Automatic Valuation Notice (User's requirement: removed manual niche input) */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automated AI Client Valuation Active:</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Manual niche input has been eliminated. During each website audit, our AI automatically determines the prospect's average converted client ticket value in <strong>{currentCurrency}</strong> based on their specific niche, services listed on their website, and local city economy. It then calculates the break-even threshold (how many converted leads offset your yearly fee).
            </p>
          </div>
        </div>

        {/* Section 2: WhatsApp & Outreach Messaging */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">
                WhatsApp Messaging Rules (Cold Icebreaker First Touch)
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
              Configurable Outreach
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Non-Intrusive Outreach Protocol:</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              The first message does <strong>NOT</strong> mention any fees or pricing, and does <strong>NOT</strong> cover or attach an unsolicited PDF report. It is a simple, conversational inquiry to confirm if they are currently taking new client work.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  First WhatsApp Icebreaker (No fee, No PDF)
                </label>
                <span className="text-[10px] text-slate-500 font-mono">{'{{business_name}}'}, {'{{category}}'}, {'{{location}}'}</span>
              </div>
              <textarea
                rows={3}
                value={form.firstWhatsAppMessageTemplate}
                onChange={(e) => handleInputChange('firstWhatsAppMessageTemplate', e.target.value)}
                placeholder="Hi {{business_name}}! Found your profile on Google Maps for {{category}} in {{location}}. Are you currently taking on new clients this week?"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-sans leading-relaxed"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Follow-Up WhatsApp Message (Sent After Prospect Replies)
                </label>
                <span className="text-[10px] text-slate-500 font-semibold text-emerald-600">Pitches Audit & ROI</span>
              </div>
              <textarea
                rows={3}
                value={form.followUpWhatsAppMessageTemplate}
                onChange={(e) => handleInputChange('followUpWhatsAppMessageTemplate', e.target.value)}
                placeholder="Thanks for replying! We ran a quick diagnostic on your Google Maps 3-Pack ranking in {{location}} and noticed 3 quick fixes to bring 15-20 more calls a month. Can I share a quick 1-page visual breakdown?"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-sans leading-relaxed"
              />
            </div>

            {/* Email Templates */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cold Email Subject Line
              </label>
              <input
                type="text"
                value={form.firstEmailSubjectTemplate}
                onChange={(e) => handleInputChange('firstEmailSubjectTemplate', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cold Email Body Template
              </label>
              <textarea
                rows={3}
                value={form.firstEmailBodyTemplate}
                onChange={(e) => handleInputChange('firstEmailBodyTemplate', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-sans leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Agency Profile & Logo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">
              Agency Details & Logo (Embedded in PDF Reports)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Agency Name
              </label>
              <input
                type="text"
                value={form.agencyName}
                onChange={(e) => handleInputChange('agencyName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Agency Tagline / Slogan
              </label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Agency Contact Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Agency Logo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {form.logoUrl ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-orange-400 bg-slate-100 shrink-0 shadow-xs">
                  <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                  <Image className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="Paste direct Image URL (e.g. https://.../logo.png)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Logo File</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <span className="text-[11px] text-slate-500">PNG, JPG, or SVG</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Brand Colors & Fonts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Palette className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">
              PDF Document Styling (Colors & Fonts)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandColorPrimary}
                  onChange={(e) => handleInputChange('brandColorPrimary', e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.brandColorPrimary}
                  onChange={(e) => handleInputChange('brandColorPrimary', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Accent Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandColorAccent}
                  onChange={(e) => handleInputChange('brandColorAccent', e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.brandColorAccent}
                  onChange={(e) => handleInputChange('brandColorAccent', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                PDF Font Family
              </label>
              <select
                value={form.fontFamily}
                onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">
              Website Proposal Pitch Deck (For Prospects With No Website)
            </h3>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Custom Pitch PDF</h4>
              <p className="text-[11px] text-slate-500">
                When a business has no website, this proposal document is pitched to them.
              </p>
              {form.uploadedProposalFile ? (
                <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {form.uploadedProposalFile.name} ({(form.uploadedProposalFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-slate-400">
                  Using default "High-Converting Local Website Blueprint Deck"
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleProposalFileUpload}
                  className="hidden"
                />
              </label>

              {form.uploadedProposalFile && (
                <button
                  type="button"
                  onClick={handleRemoveProposalFile}
                  className="p-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
                  title="Remove custom proposal file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:via-orange-700 hover:to-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save All Agency Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
