import { AgencySettings, AuditPrompt, Lead, AppRelease } from '../types';

export const DEFAULT_SETTINGS: AgencySettings = {
  agencyName: 'AK47 Growth Agency',
  slogan: 'Precision Google Maps 3-Pack Ranking & High-Intent Client Acquisition',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  contactEmail: 'hq@leadsak47.com',
  contactPhone: '+91 98765 43210',
  website: 'https://leadsak47.com',
  address: 'Level 4, Cyber City, Gurugram / Austin TX',
  brandColorPrimary: '#f97316', // Tactical Amber/Orange
  brandColorAccent: '#e11d48', // Crimson Fire
  fontFamily: 'Plus Jakarta Sans',
  yearlyFee: 35000, // in INR
  monthlyFee: 3500, // in INR
  currency: '₹', // Default to INR per user specification
  industryLeadValues: {
    roofing: 25000,
    plumbing: 3500,
    hvac: 18000,
    dental: 12000,
    dentist: 12000,
    legal: 25000,
    lawyer: 25000,
    medspa: 8500,
    solar: 35000,
    auto: 4500,
    electrician: 3000,
    construction: 50000,
    realtor: 40000,
    chiropractor: 6000,
    landscaping: 7500,
    general: 5000,
  },
  activePromptId: 'prompt-default-audit-roi',
  defaultEmailSignature: 'Best regards,\nGrowth Partner | Leads AK47 Machine\nhttps://leadsak47.com',
  defaultWhatsAppGreeting: 'Hi! Quick question regarding your Google Maps listing.',

  // Configurable First Outreach & Follow-Up WhatsApp messages (NO fee, NO pdf in first touch)
  firstWhatsAppMessageTemplate: 'Hi {{business_name}}! Found your profile on Google Maps for {{category}} in {{location}}. Are you currently taking on new clients this week?',
  followUpWhatsAppMessageTemplate: 'Thanks for replying! We ran a quick diagnostic on your Google Maps 3-Pack ranking in {{location}} and noticed 3 quick fixes to bring 15-20 more calls a month. Can I share a quick 1-page visual breakdown?',

  firstEmailSubjectTemplate: 'Quick question regarding {{business_name}}\'s Google Maps ranking in {{location}}',
  firstEmailBodyTemplate: 'Hi {{business_name}} team,\n\nI noticed your listing while checking {{category}} businesses in {{location}} on Google Maps.\n\nAre you currently accepting new client bookings this month?\n\nBest regards,\n{{agency_name}}',

  activeAIProvider: 'gemini',
  providerConfigs: {
    gemini: { model: 'gemini-3.8-flash' },
    openai: { model: 'gpt-4o' },
    claude: { model: 'claude-3-5-sonnet-20241022' },
    openrouter: { model: 'anthropic/claude-3.5-sonnet' },
  },
};

export const DEFAULT_PROMPTS: AuditPrompt[] = [
  {
    id: 'prompt-default-audit-roi',
    title: 'Precision Negative SEO & Break-Even ROI Audit (Default)',
    description: 'Pinpoints critical negative SEO & Google Maps deficiencies, and proves that N converted leads completely pays for the yearly fee.',
    isDefault: true,
    userTemplate: `Conduct an elite Local SEO Technical Audit & Service Pitch for:
Business: {{business_name}}
Category: {{industry}}
Location: {{location}}
Website: {{website}}
Google Rating: {{rating}} ({{reviews_count}} reviews)
Phone: {{phone}}

Agency Pricing:
Annual Fee: {{currency}}{{annual_fee}}
Assumed Average Converted Client Value: {{currency}}{{lead_value}}

INSTRUCTIONS:
1. Identify 4 critical negative points (Google Maps Search ranking signals missing, On-page SEO deficiencies, Mobile/Speed friction, and Conversion leaks).
2. Compute the exact break-even ROI formula: Show that getting just N closed clients completely offsets the entire {{currency}}{{annual_fee}} yearly fee.
3. Outline a 3-phase 90-day action plan to dominate the local Google 3-pack.
4. Draft a warm initial Cold Email and a conversational WhatsApp message (first touch without mentioning fees or unsolicited files).`,
    tags: ['Negative Audit', 'ROI Break-Even', 'Local SEO', 'Default'],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prompt-competitor-assault',
    title: 'Aggressive Competitor Bleed & 3-Pack Takeover',
    description: 'Highlights how top 3 Google Maps competitors are draining customer calls, with high-urgency conversion copy.',
    isDefault: false,
    userTemplate: `Analyze why {{business_name}} in {{location}} is getting outranked by local competitors in the Google Maps 3-Pack.
Focus heavily on lost call volume, missing LocalBusiness schema, thin location pages, and negative friction on mobile.
Prove how capturing back just {{leads_needed}} customer jobs pays for our {{currency}}{{annual_fee}} yearly system.`,
    tags: ['Aggressive', 'Competitor Analysis', 'High Urgency'],
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'prompt-friendly-consultative',
    title: 'Consultative Diagnostic for High-End Clinics & Practices',
    description: 'Polite, data-backed technical diagnostic tailored for medical, legal, and professional practices.',
    isDefault: false,
    userTemplate: `Generate an executive diagnostic memo for {{business_name}}.
Adopt a respectful, high-level consultant tone. Focus on patient/client acquisition efficiency, Google Maps trust signals, and demonstrate that a single case/patient value ({{currency}}{{lead_value}}) pays for the full yearly optimization fee.`,
    tags: ['Medical/Legal', 'Consultative', 'Executive'],
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-sample-1',
    name: 'Precision Pro Plumbing & Drain',
    address: '4512 Industrial Blvd, Austin, TX 78745',
    city: 'Austin',
    state: 'TX',
    phone: '+1 (512) 402-9118',
    phoneSource: 'maps',
    website: 'https://precisionproplumb-austin.example.com',
    hasWebsite: true,
    rating: 4.6,
    reviewsCount: 38,
    category: 'Emergency Plumbing Contractor',
    placeUrl: 'https://maps.google.com/?q=Precision+Pro+Plumbing+Austin',
    email: 'contact@precisionproplumb-austin.example.com',
    status: 'audit_ready',
    createdAt: '2026-10-18T01:10:00.000Z',
    updatedAt: '2026-10-18T01:30:00.000Z',
    journey: [
      {
        id: 'j-1',
        timestamp: '2026-10-18T01:10:00.000Z',
        stage: 'Discovered',
        title: 'Discovered on Google Maps',
        description: 'Captured for search "Plumbers in Austin TX" at position #7 with 4.6⭐ rating.',
        type: 'system',
      },
      {
        id: 'j-2',
        timestamp: '2026-10-18T01:12:00.000Z',
        stage: 'Website Inspected',
        title: 'Website Crawled & Analyzed',
        description: 'Audited homepage for technical SEO, mobile score, and missing local schema.',
        type: 'audit',
      },
      {
        id: 'j-3',
        timestamp: '2026-10-18T01:15:00.000Z',
        stage: 'Audit Ready',
        title: 'Executive PDF Audit Report Generated',
        description: 'Identified 4 negative ranking leaks. Calculated break-even at 10 plumbing jobs.',
        type: 'audit',
      },
    ],
    auditReport: {
      id: 'audit-demo-1',
      businessName: 'Precision Pro Plumbing & Drain',
      website: 'https://precisionproplumb-austin.example.com',
      overallScore: 48,
      seoScore: 42,
      mapsScore: 52,
      mobileSpeedScore: 46,
      summary: 'Precision Pro Plumbing has solid customer ratings but suffers from missing Local Schema markup, zero dedicated neighborhood landing pages, and a 4.1s mobile load time that causes over 55% of urgent callers to bounce.',
      negativePoints: [
        {
          category: 'Google Maps Search',
          issue: 'Missing LocalBusiness JSON-LD Schema & Inconsistent Secondary Categories',
          impact: 'Google Maps algorithm favors competitors who explicitly declare geo-coordinates and emergency services in schema.',
          fix: 'Embed rich LocalBusiness Schema with serviceArea, geo-coordinates, and openingHoursSpecification.',
        },
        {
          category: 'SEO Deficiencies',
          issue: 'Thin On-Page Content & Missing Suburb Service Pages (Round Rock, Pflugerville, Oak Hill)',
          impact: 'Currently only ranking within a 1.2 mile radius; invisible to high-ticket suburbs.',
          fix: 'Publish 8 dedicated geo-targeted landing pages with unique localized project case studies.',
        },
        {
          category: 'Mobile & Speed',
          issue: 'Uncompressed hero assets causing 4.1s mobile Largest Contentful Paint (LCP)',
          impact: 'Emergency plumbing callers on mobile abandon before the phone call button loads.',
          fix: 'Convert hero images to WebP, implement sticky bottom "Tap to Call Plumber" instant dialer.',
        },
        {
          category: 'Conversion Leaks',
          issue: 'No Instant WhatsApp or SMS Dispatch widget for after-hours quote requests',
          impact: 'Losing an estimated 8 - 14 weekend and evening emergency calls every month.',
          fix: 'Integrate automated two-way SMS and WhatsApp dispatch booking funnel.',
        },
      ],
      pitch: {
        headline: 'How 10 Converted Plumbing Jobs Totally Pays For Your Entire Yearly Retainer',
        body: 'At an estimated ticket value of ₹3,500 for plumbing repairs, converting just 10 extra emergency or replacement jobs throughout the entire year generates ₹35,000—completely covering our entire ₹35,000 annual fee. Every client after job #10 is 100% pure profit.',
        estimatedLeadValue: 3500,
        leadsNeededToBreakEven: 10,
        yearlyFee: 35000,
        roiStatement: 'At ₹3,500 per job, just 10 converted leads covers your entire ₹35,000 yearly fee.',
        phases: [
          {
            phase: 'Phase 1: Quick Wins',
            title: 'Google 3-Pack Schema & Mobile Speed Overhaul',
            timeline: 'Days 1 - 15',
            deliverable: 'Implement LocalBusiness schema, Google Maps category audit, and sticky mobile call button.',
          },
          {
            phase: 'Phase 2: Geo-Dominance',
            title: 'Local Suburb Pages & Citation Expansion',
            timeline: 'Days 16 - 45',
            deliverable: 'Roll out 8 localized service pages and sync 60+ Tier-1 local citations.',
          },
          {
            phase: 'Phase 3: Lead Machine',
            title: 'Automated Review Velocity & WhatsApp Lead Funnel',
            timeline: 'Days 46 - 90',
            deliverable: 'Automate SMS review requests to reach 100+ 5-star ratings and launch local conversion funnel.',
          },
        ],
      },
      generatedWithPromptId: 'prompt-default-audit-roi',
      generatedAt: '2026-10-18T01:15:00.000Z',
    },
    emailDraft: {
      subject: 'Quick question regarding Precision Pro Plumbing in Austin',
      body: 'Hi Precision Pro Plumbing team,\n\nI was looking at your listing on Google Maps. Are you currently taking on new plumbing projects in Austin this week?\n\nBest,\nAK47 Growth Agency',
    },
    whatsappDraft: {
      message: 'Hi Precision Pro Plumbing! Found your profile on Google Maps for Emergency Plumbing Contractor in Austin. Are you currently taking on new clients this week?',
    },
  },
  {
    id: 'lead-sample-2',
    name: 'Apex Roof Shield & Restoration',
    address: '8800 S Congress Ave, Austin, TX 78748',
    city: 'Austin',
    state: 'TX',
    phone: '+1 (512) 710-3320',
    phoneSource: 'maps',
    website: 'https://apexroofshield-tx.example.com',
    hasWebsite: true,
    rating: 4.8,
    reviewsCount: 64,
    category: 'Commercial & Residential Roofing',
    placeUrl: 'https://maps.google.com/?q=Apex+Roof+Shield+Austin',
    email: 'info@apexroofshield-tx.example.com',
    status: 'contacted_email',
    createdAt: '2026-10-18T01:20:00.000Z',
    updatedAt: '2026-10-18T02:00:00.000Z',
    journey: [
      {
        id: 'j-21',
        timestamp: '2026-10-18T01:20:00.000Z',
        stage: 'Discovered',
        title: 'Discovered on Google Maps',
        description: 'Found for query "Roofing Austin" at position #9.',
        type: 'system',
      },
      {
        id: 'j-22',
        timestamp: '2026-10-18T01:25:00.000Z',
        stage: 'Audit Ready',
        title: 'Negative Audit Report Created',
        description: 'Estimated roofing lead value at ₹25,000. Just 2 closed roof replacements pays for the entire year.',
        type: 'audit',
      },
      {
        id: 'j-23',
        timestamp: '2026-10-18T02:00:00.000Z',
        stage: 'Contacted',
        title: 'Cold Outreach Dispatched',
        description: 'Sent initial message to info@apexroofshield-tx.example.com.',
        type: 'email',
      },
    ],
    auditReport: {
      id: 'audit-demo-2',
      businessName: 'Apex Roof Shield & Restoration',
      website: 'https://apexroofshield-tx.example.com',
      overallScore: 54,
      seoScore: 48,
      mapsScore: 58,
      mobileSpeedScore: 51,
      summary: 'Apex Roof Shield has exceptional reviews, but is being outranked by competitors on major keywords like "roof replacement Austin" due to lack of localized hail damage landing pages and missing storm response schema.',
      negativePoints: [
        {
          category: 'Google Maps Search',
          issue: 'Missing Geotagged Project Photos & Stale Google Business Posts',
          impact: 'Google Maps rewards active profiles that upload geo-stamped roof completion photos weekly.',
          fix: 'Deploy weekly geo-targeted project photo workflow and Google Posts cadence.',
        },
        {
          category: 'SEO Deficiencies',
          issue: 'Zero Dedicated Hail & Storm Damage Insurance Claims Pages',
          impact: 'Missing out on the highest-ticket storm restoration searches in Central Texas.',
          fix: 'Build comprehensive Storm & Hail Insurance claims hub with client case studies.',
        },
      ],
      pitch: {
        headline: 'Just 2 Roof Replacement Jobs Pays For Your Entire Yearly Agency Investment',
        body: 'With an estimated residential roof replacement ticket of ₹25,000+, closing literally two additional clients from Google Maps pays for our full ₹35,000 annual fee with surplus profit.',
        estimatedLeadValue: 25000,
        leadsNeededToBreakEven: 2,
        yearlyFee: 35000,
        roiStatement: 'At ₹25,000 per roof replacement, just 2 converted leads covers your entire ₹35,000 yearly fee.',
        phases: [],
      },
      generatedWithPromptId: 'prompt-default-audit-roi',
      generatedAt: '2026-10-18T01:25:00.000Z',
    },
    emailDraft: {
      subject: 'Quick question regarding Apex Roof Shield in Austin',
      body: 'Hi Apex Roof Shield team,\n\nI noticed your strong 4.8⭐ reputation in Austin. Are you currently booking new roofing consultations this week?\n\nBest,\nAK47 Growth Agency',
    },
    whatsappDraft: {
      message: 'Hi Apex Roof Shield! Found your profile on Google Maps for Roofing in Austin. Are you currently taking on new clients this week?',
    },
  },
  {
    id: 'lead-sample-3',
    name: 'Hill Country Custom Cabinets & Trim',
    address: '1401 E 6th St, Austin, TX 78702',
    city: 'Austin',
    state: 'TX',
    phone: '+1 (512) 555-0814',
    phoneSource: 'maps',
    website: '',
    hasWebsite: false,
    rating: 4.9,
    reviewsCount: 19,
    category: 'Custom Cabinet Maker & Woodworking',
    placeUrl: 'https://maps.google.com/?q=Hill+Country+Custom+Cabinets+Austin',
    status: 'proposal_ready',
    createdAt: '2026-10-18T01:40:00.000Z',
    updatedAt: '2026-10-18T01:45:00.000Z',
    journey: [
      {
        id: 'j-31',
        timestamp: '2026-10-18T01:40:00.000Z',
        stage: 'Discovered',
        title: 'Discovered on Google Maps (No Website)',
        description: 'Found high-rating 4.9⭐ business with NO website listed on Google Maps profile.',
        type: 'system',
      },
      {
        id: 'j-32',
        timestamp: '2026-10-18T01:45:00.000Z',
        stage: 'Proposal Ready',
        title: 'Custom Website Proposal Generated',
        description: 'Created pitch highlighting 25+ lost monthly inquiries due to absence of online portfolio & quote funnel.',
        type: 'audit',
      },
    ],
    websiteProposal: {
      id: 'prop-sample-3',
      businessName: 'Hill Country Custom Cabinets & Trim',
      pitchHeadline: 'Why Hill Country Custom Cabinets Is Losing 20+ High-Ticket Kitchen Remodels Every Month',
      problemStatement: 'Despite your 4.9⭐ Google rating, affluent homeowners looking for custom cabinetry in Austin cannot see your past kitchen transformations, request a quote, or verify your license without a modern website.',
      missedRevenueEstimate: '15 - 30 lost inquiries / ₹3,00,000+ in potential pipeline every month',
      proposedFeatures: [
        'High-Resolution Visual Project Gallery with Before & After Sliders',
        'Direct "Request a 3D Cabinet Estimate" Multi-Step Funnel',
        'Google Maps Local Business Schema & Location Integration',
        'Instant WhatsApp & Mobile Tap-to-Call Floating Action Bar',
        'Google Review Carousel with Real Verified Customer Testimonials',
      ],
      estimatedPrice: 15000,
      timeline: 'Turnkey Launch in 7 Business Days',
      generatedAt: '2026-10-18T01:45:00.000Z',
    },
    emailDraft: {
      subject: 'Quick question for Hill Country Custom Cabinets',
      body: 'Hi Hill Country Custom Cabinets,\n\nI was browsing Google Maps for custom woodwork in Austin and saw your 4.9⭐ reviews. Are you currently accepting new custom projects this month?\n\nBest,\nAK47 Growth Agency',
    },
    whatsappDraft: {
      message: 'Hi Hill Country Custom Cabinets! Found your profile on Google Maps for Custom Woodworking in Austin. Are you currently taking on new clients this week?',
    },
  },
];

export const APP_RELEASES: AppRelease[] = [
  {
    version: 'v1.2.0',
    releaseDate: '2026-10-18',
    title: 'SaaS Left Navigation & Multi-AI Engine Release',
    isLatest: true,
    changes: [
      'Added full collapsible SaaS left side panel navigation with status indicators',
      'Configurable currency in settings with ₹ (INR) as default',
      'Zero-fee, zero-PDF conversational first touch for WhatsApp & Email outreach',
      'New "AI Connection" hub supporting Google Gemini, OpenAI ChatGPT, Anthropic Claude, and OpenRouter',
      'New "Updates" hub with GitHub automatic update checking and safe in-place upgrades without data loss',
      'Exportable lightweight Shared Hosting (PHP & MySQL/SQLite) deployment kit with cPanel guide',
    ],
  },
  {
    version: 'v1.1.0',
    releaseDate: '2026-10-10',
    title: 'Precision ROI Break-Even Engine',
    changes: [
      'Automated Google Maps scraping with 10, 20, 30, 40, 50, 100 listing limits',
      'Missing phone enrichment scraper from business websites',
      'Negative SEO audit engine highlighting 3-Pack rank deficiencies',
      'Executive printable/downloadable PDF report generator with custom agency branding',
      'Turnkey website proposal generator for listings without websites',
    ],
  },
  {
    version: 'v1.0.0',
    releaseDate: '2026-09-28',
    title: 'Initial Core Release',
    changes: [
      'Core Leads AK47 pipeline architecture',
      '5-stage CRM journey tracking',
      'Multi-channel outreach drafts (Email + WhatsApp wa.me links)',
    ],
  },
];
