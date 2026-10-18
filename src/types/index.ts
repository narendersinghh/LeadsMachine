export type LeadStatus =
  | 'discovered'
  | 'auditing'
  | 'audit_ready'
  | 'proposal_ready'
  | 'contacted_email'
  | 'contacted_whatsapp'
  | 'replied'
  | 'follow_up'
  | 'meeting_booked'
  | 'won'
  | 'lost';

export interface JourneyEvent {
  id: string;
  timestamp: string;
  stage: string;
  title: string;
  description: string;
  type: 'system' | 'email' | 'whatsapp' | 'status_change' | 'audit' | 'note';
}

export interface NegativePoint {
  category: 'SEO Deficiencies' | 'Google Maps Search' | 'Mobile & Speed' | 'Conversion Leaks' | string;
  issue: string;
  impact: string;
  fix: string;
}

export interface ServicePhase {
  phase: string;
  title: string;
  timeline: string;
  deliverable: string;
}

export interface PitchDetails {
  headline: string;
  body: string;
  estimatedLeadValue: number; // Calculated automatically by AI based on industry & city
  leadsNeededToBreakEven: number;
  yearlyFee: number;
  roiStatement: string;
  phases: ServicePhase[];
}

export interface AuditReport {
  id: string;
  businessName: string;
  website: string;
  overallScore: number;
  seoScore: number;
  mapsScore: number;
  mobileSpeedScore: number;
  summary: string;
  negativePoints: NegativePoint[];
  pitch: PitchDetails;
  generatedWithPromptId?: string;
  generatedAt: string;
}

export interface WebsiteProposal {
  id: string;
  businessName: string;
  pitchHeadline: string;
  problemStatement: string;
  missedRevenueEstimate: string;
  proposedFeatures: string[];
  estimatedPrice: number;
  timeline: string;
  customDeckName?: string;
  generatedAt: string;
}

export interface OutreachDraft {
  subject?: string;
  body?: string;
  message?: string;
}

export interface Lead {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  phone: string;
  phoneSource: 'maps' | 'website_enriched' | 'manual' | 'missing';
  website: string;
  hasWebsite: boolean;
  rating: number;
  reviewsCount: number;
  category: string;
  placeUrl: string;
  email?: string;
  contactPerson?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  journey: JourneyEvent[];
  auditReport?: AuditReport;
  websiteProposal?: WebsiteProposal;
  emailDraft?: OutreachDraft;
  whatsappDraft?: OutreachDraft;
  notes?: string;
  isProcessing?: boolean;
}

export interface AuditPrompt {
  id: string;
  title: string;
  description: string;
  isDefault: boolean;
  systemInstruction?: string;
  userTemplate: string;
  tags: string[];
  createdAt: string;
}

export interface ProviderSetting {
  apiKey?: string;
  model?: string;
  customModel?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgencySettings {
  agencyName: string;
  slogan: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  brandColorPrimary: string;
  brandColorAccent: string;
  fontFamily: string;
  yearlyFee: number;
  monthlyFee: number;
  currency: string; // Defaults to '₹'
  uploadedProposalFile?: {
    name: string;
    size: number;
    dataUrl?: string;
    uploadDate: string;
  };
  activePromptId: string;
  defaultEmailSignature: string;
  defaultWhatsAppGreeting: string;

  // Configurable First Outreach & Follow-up templates (NO fee, NO pdf in first touch)
  firstWhatsAppMessageTemplate: string;
  followUpWhatsAppMessageTemplate: string;
  firstEmailSubjectTemplate: string;
  firstEmailBodyTemplate: string;

  // Active AI Provider
  activeAIProvider: 'gemini' | 'openai' | 'claude' | 'openrouter';
  providerConfigs: Record<string, ProviderSetting>;
  githubRepo: string;
}

export interface AppRelease {
  version: string;
  releaseDate: string;
  title: string;
  changes: string[];
  isLatest?: boolean;
}
