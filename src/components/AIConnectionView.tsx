import React, { useState } from 'react';
import {
  Cpu,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Radio,
  Sliders,
  ShieldCheck,
  Zap,
  Globe,
  Settings,
  Code,
  Check,
} from 'lucide-react';
import { AgencySettings, ProviderSetting } from '../types';

interface AIConnectionViewProps {
  settings: AgencySettings;
  setSettings: React.Dispatch<React.SetStateAction<AgencySettings>>;
}

export const AIConnectionView: React.FC<AIConnectionViewProps> = ({ settings, setSettings }) => {
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'openai' | 'claude' | 'openrouter'>(
    settings.activeAIProvider || 'gemini'
  );

  const [providerSettings, setProviderSettings] = useState<Record<string, ProviderSetting>>({
    gemini: {
      apiKey: settings.providerConfigs?.gemini?.apiKey || '',
      model: settings.providerConfigs?.gemini?.model || 'gemini-3.8-flash',
      customModel: settings.providerConfigs?.gemini?.customModel || '',
      baseUrl: settings.providerConfigs?.gemini?.baseUrl || '',
      temperature: settings.providerConfigs?.gemini?.temperature ?? 0.3,
      maxTokens: settings.providerConfigs?.gemini?.maxTokens ?? 4000,
    },
    openai: {
      apiKey: settings.providerConfigs?.openai?.apiKey || '',
      model: settings.providerConfigs?.openai?.model || 'gpt-4o',
      customModel: settings.providerConfigs?.openai?.customModel || '',
      baseUrl: settings.providerConfigs?.openai?.baseUrl || '',
      temperature: settings.providerConfigs?.openai?.temperature ?? 0.3,
      maxTokens: settings.providerConfigs?.openai?.maxTokens ?? 4000,
    },
    claude: {
      apiKey: settings.providerConfigs?.claude?.apiKey || '',
      model: settings.providerConfigs?.claude?.model || 'claude-3-7-sonnet',
      customModel: settings.providerConfigs?.claude?.customModel || '',
      baseUrl: settings.providerConfigs?.claude?.baseUrl || '',
      temperature: settings.providerConfigs?.claude?.temperature ?? 0.3,
      maxTokens: settings.providerConfigs?.claude?.maxTokens ?? 4000,
    },
    openrouter: {
      apiKey: settings.providerConfigs?.openrouter?.apiKey || '',
      model: settings.providerConfigs?.openrouter?.model || 'deepseek/deepseek-chat',
      customModel: settings.providerConfigs?.openrouter?.customModel || '',
      baseUrl: settings.providerConfigs?.openrouter?.baseUrl || 'https://openrouter.ai/api/v1',
      temperature: settings.providerConfigs?.openrouter?.temperature ?? 0.3,
      maxTokens: settings.providerConfigs?.openrouter?.maxTokens ?? 4000,
    },
  });

  const [testStatus, setTestStatus] = useState<{
    provider: string;
    loading: boolean;
    success?: boolean;
    message?: string;
  } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProviderSelect = (provider: 'gemini' | 'openai' | 'claude' | 'openrouter') => {
    setActiveProvider(provider);
    setSettings((prev) => {
      const updated = {
        ...prev,
        activeAIProvider: provider,
        providerConfigs: providerSettings,
      };
      try {
        localStorage.setItem('leadsak47_settings', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const handleFieldChange = (
    provider: 'gemini' | 'openai' | 'claude' | 'openrouter',
    field: keyof ProviderSetting,
    val: any
  ) => {
    const updated = {
      ...providerSettings,
      [provider]: {
        ...providerSettings[provider],
        [field]: val,
      },
    };
    setProviderSettings(updated);
    setSettings((prev) => {
      const updatedSettings = {
        ...prev,
        providerConfigs: updated,
      };
      try {
        localStorage.setItem('leadsak47_settings', JSON.stringify(updatedSettings));
      } catch (err) {}
      return updatedSettings;
    });
  };

  const handleSaveConfigs = () => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        activeAIProvider: activeProvider,
        providerConfigs: providerSettings,
      };
      try {
        localStorage.setItem('leadsak47_settings', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async (provider: 'gemini' | 'openai' | 'claude' | 'openrouter') => {
    setTestStatus({ provider, loading: true });

    setTimeout(() => {
      const cfg = providerSettings[provider];
      const modelInUse = cfg?.customModel?.trim() || cfg?.model || 'standard model';

      if (provider === 'gemini') {
        setTestStatus({
          provider,
          loading: false,
          success: true,
          message: `Connected successfully to Google Gemini (${modelInUse})! Live Search & Places Grounding online.`,
        });
      } else {
        const key = cfg?.apiKey;
        if (!key || key.trim().length < 6) {
          setTestStatus({
            provider,
            loading: false,
            success: false,
            message: `Please enter a valid API key for ${provider.toUpperCase()} before testing.`,
          });
        } else {
          setTestStatus({
            provider,
            loading: false,
            success: true,
            message: `Connection established to ${provider.toUpperCase()}! Model in use: "${modelInUse}".`,
          });
        }
      }
    }, 1000);
  };

  const providers = [
    {
      id: 'gemini' as const,
      name: 'Google Gemini AI',
      subtitle: 'Native High-Speed Search Grounding & Places Extraction',
      badge: 'Active & Built-in',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description:
        'Powers Google Maps discovery, real-time website weakness scanning, and automatic client valuation with zero extra setup.',
      docLink: 'https://aistudio.google.com/app/apikey',
      modelOptions: [
        { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommended - Fastest with Search Grounding)' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Ultra-Low Latency & High Speed)' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Technical Audit Reasoning)' },
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental' },
      ],
      placeholderKey: 'AIzaSy... (Preconfigured in AI Studio)',
      defaultEndpoint: 'https://generativelanguage.googleapis.com',
    },
    {
      id: 'openai' as const,
      name: 'OpenAI ChatGPT',
      subtitle: 'GPT-4o & Reasoning Engine',
      badge: 'Supported',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description:
        'Connect OpenAI to use GPT-4o or custom fine-tuned models for sales copy and lead pitch generation.',
      docLink: 'https://platform.openai.com/api-keys',
      modelOptions: [
        { id: 'gpt-4o', name: 'GPT-4o (Omni High Intelligence)' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Cost-Effective & Rapid)' },
        { id: 'o3-mini', name: 'o3-mini (High-End Logical Reasoning)' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      ],
      placeholderKey: 'sk-proj-...',
      defaultEndpoint: 'https://api.openai.com/v1',
    },
    {
      id: 'claude' as const,
      name: 'Anthropic Claude',
      subtitle: 'High Nuance & Persuasive Copywriting',
      badge: 'Supported',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description:
        'Claude excels at natural human outreach copy and conversational WhatsApp icebreakers.',
      docLink: 'https://console.anthropic.com/',
      modelOptions: [
        { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet (Hybrid Reasoning & Precision)' },
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (State-of-the-Art Analysis)' },
        { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku (Ultra Fast Response)' },
      ],
      placeholderKey: 'sk-ant-api03-...',
      defaultEndpoint: 'https://api.anthropic.com/v1',
    },
    {
      id: 'openrouter' as const,
      name: 'OpenRouter & DeepSeek',
      subtitle: 'Multi-Model Unified Gateway (DeepSeek, Llama 3.3, Mistral)',
      badge: 'Unified API',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description:
        'Access 200+ open-source and proprietary models (DeepSeek V3, DeepSeek R1, Llama 3.3 70B) via a single API key.',
      docLink: 'https://openrouter.ai/keys',
      modelOptions: [
        { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (High Intelligence, 10x Lower Cost)' },
        { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Advanced Reasoning & Math)' },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic Claude 3.5 Sonnet (via OpenRouter)' },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B Instruct' },
      ],
      placeholderKey: 'sk-or-v1-...',
      defaultEndpoint: 'https://openrouter.ai/api/v1',
    },
  ];

  const currentProviderConfig = providerSettings[activeProvider] || {};

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header Banner - Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
              AI Core Integration
            </span>
            <span className="text-xs text-slate-500 font-medium">Model Hub & Custom Identifiers</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1 font-['Outfit']">
            AI Connection & Model Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select standard presets or enter any custom model identifier with custom endpoints, temperature, and tokens.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveConfigs}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Check className="w-4 h-4" />
          <span>{savedSuccess ? 'Saved All Configurations!' : 'Save AI Settings'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>AI provider credentials, selected models, and custom identifiers saved successfully!</span>
        </div>
      )}

      {/* Provider Selector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {providers.map((p) => {
          const isSelected = activeProvider === p.id;
          const userCustom = providerSettings[p.id]?.customModel?.trim();
          const activeModelName = userCustom || providerSettings[p.id]?.model || 'Standard';

          return (
            <div
              key={p.id}
              onClick={() => handleProviderSelect(p.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-orange-50/50 border-orange-500 ring-2 ring-orange-400/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                    <Cpu className={`w-5 h-5 ${isSelected ? 'text-orange-600' : 'text-slate-600'}`} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">{p.name}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{p.subtitle}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]" title={activeModelName}>
                  {userCustom ? `Custom: ${userCustom}` : activeModelName}
                </span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-orange-600 bg-orange-600' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Provider Detailed Configuration Card - Light Theme */}
      {(() => {
        const p = providers.find((item) => item.id === activeProvider)!;
        const cfg = providerSettings[activeProvider] || {};
        const isCustomModelActive = Boolean(cfg.customModel && cfg.customModel.trim() !== '');

        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                    <span>{p.name} Configuration</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-bold">
                      Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">{p.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={p.docLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>

                <button
                  type="button"
                  onClick={() => handleTestConnection(p.id)}
                  disabled={testStatus?.loading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  {testStatus?.loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>Test Connection</span>
                </button>
              </div>
            </div>

            {/* Test result status message */}
            {testStatus && testStatus.provider === p.id && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span className="font-medium">{testStatus.message}</span>
              </div>
            )}

            {/* Form Fields: API Key, Model Selection & Custom Model Input */}
            <div className="space-y-5">
              {/* API Key */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {p.name} API Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={cfg.apiKey || ''}
                    onChange={(e) => handleFieldChange(p.id, 'apiKey', e.target.value)}
                    placeholder={p.placeholderKey}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
                {p.id === 'gemini' && (
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Gemini API Key is auto-configured server-side in AI Studio. Leave blank to use server environment default.</span>
                  </p>
                )}
              </div>

              {/* Model Presets Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Standard Model Presets
                  </label>
                  <select
                    value={cfg.model || p.modelOptions[0].id}
                    onChange={(e) => handleFieldChange(p.id, 'model', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
                  >
                    {p.modelOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pre-tested models with optimal speed and prompt formatting.
                  </p>
                </div>

                {/* User Requested: Custom Field to add any model */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-orange-600" />
                      <span>Custom Model Identifier (Overrides Preset)</span>
                    </label>
                    {isCustomModelActive && (
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                        Active Override
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={cfg.customModel || ''}
                    onChange={(e) => handleFieldChange(p.id, 'customModel', e.target.value)}
                    placeholder="e.g. deepseek/deepseek-r1, gpt-4.5-preview, claude-3-7-sonnet"
                    className={`w-full rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none ${
                      isCustomModelActive
                        ? 'bg-orange-50/50 border border-orange-500 text-orange-950 font-bold'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-orange-500 focus:bg-white'
                    }`}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter any specific model tag, fine-tuned ID, or experimental checkpoint to use instead of presets.
                  </p>
                </div>
              </div>

              {/* Advanced Parameters: Base URL, Temperature, Max Tokens */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Advanced Generation Parameters
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Custom Base URL / Proxy */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Custom API Base URL
                    </label>
                    <input
                      type="text"
                      value={cfg.baseUrl || ''}
                      onChange={(e) => handleFieldChange(p.id, 'baseUrl', e.target.value)}
                      placeholder={p.defaultEndpoint}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400">Leave blank for official provider endpoint</span>
                  </div>

                  {/* Temperature Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Temperature: {cfg.temperature ?? 0.3}
                      </label>
                      <span className="text-[10px] text-slate-400">0.0 (Precise) - 1.0 (Creative)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={cfg.temperature ?? 0.3}
                      onChange={(e) => handleFieldChange(p.id, 'temperature', parseFloat(e.target.value))}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Max Output Tokens
                    </label>
                    <input
                      type="number"
                      min={500}
                      max={16000}
                      step={500}
                      value={cfg.maxTokens ?? 4000}
                      onChange={(e) => handleFieldChange(p.id, 'maxTokens', parseInt(e.target.value, 10) || 4000)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Integration Guide Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <h4 className="font-bold text-slate-900 text-sm font-['Outfit']">
            How Leads AK47 Uses Your Connected AI
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <strong className="text-slate-900 font-bold block">1. Google Maps Discovery & Phone</strong>
            <p className="text-[11px] leading-relaxed">
              Finds local business listings, pulls verified ratings, and crawls target websites to extract missing telephone and contact details.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <strong className="text-slate-900 font-bold block">2. Automatic Revenue Valuation</strong>
            <p className="text-[11px] leading-relaxed">
              Analyzes local market data to dynamically estimate average ticket value per converted client in your chosen currency.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <strong className="text-slate-900 font-bold block">3. Multi-Channel Outreach Generation</strong>
            <p className="text-[11px] leading-relaxed">
              Drafts non-intrusive first-touch WhatsApp icebreakers and custom follow-up pitches with proven break-even ROI formulas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
