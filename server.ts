import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: safe JSON parse from LLM markdown fences
function extractJsonFromText(text: string): any {
  if (!text) return null;
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt to extract the first JSON block {...} or [...]
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
      } catch (err2) {}
    }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch (err3) {}
    }
    return null;
  }
}

// 1. Search Google Maps & Places leads with real business data
app.post('/api/leads/search', async (req: Request, res: Response) => {
  try {
    const { keyword, location, limit = 10 } = req.body;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const targetLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const searchQuery = location ? `${keyword} in ${location}` : keyword;

    const systemInstruction = `You are a real-time Google Maps and local business discovery engine.
Your task is to identify and return a high-quality list of real local business listings from Google Maps for the query "${searchQuery}".
Target quantity: exactly or up to ${targetLimit} distinct local business entries.

For every business listing, extract:
- name: The accurate official business name
- address: Full street address or area location
- city: City name
- state: State or province code
- phone: Official direct contact phone number (format e.g. (xxx) xxx-xxxx or +1 xxx...). If NOT visible on Maps, check their online web presence or leave empty "" so we can flag it for website phone extraction.
- website: Official website URL (e.g. "https://example.com"). If they do NOT have a website, specify "" (empty string). Note: some local businesses truly do not have a website, which is important because we offer website development!
- rating: Google rating between 3.0 and 5.0 (e.g., 4.7)
- reviewsCount: Estimated number of Google reviews (integer, e.g. 48)
- category: Specific business category (e.g. "Emergency Plumber", "Commercial Roofing Contractor", "Cosmetic Dentistry")
- verified: boolean (whether verified Google Business Profile)

Return STRICTLY a JSON array of objects with the exact schema:
[
  {
    "name": "Acme Services",
    "address": "123 Main St, Austin, TX 78701",
    "city": "Austin",
    "state": "TX",
    "phone": "(512) 555-0199",
    "website": "https://acmeservices.com",
    "rating": 4.6,
    "reviewsCount": 85,
    "category": "Plumbing Contractor",
    "verified": true
  }
]`;

    const userPrompt = `Search Google Maps for "${searchQuery}". Find up to ${targetLimit} real businesses with full details (website, phone, address, rating, reviews, category). Include businesses both with websites and those without websites.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const parsed = extractJsonFromText(response.text || '');

    let listings: any[] = [];
    if (Array.isArray(parsed)) {
      listings = parsed;
    } else if (parsed && Array.isArray(parsed.listings)) {
      listings = parsed.listings;
    } else if (parsed && Array.isArray(parsed.businesses)) {
      listings = parsed.businesses;
    }

    // Format listings into standard Lead structure
    const processedLeads = listings.slice(0, targetLimit).map((item, index) => {
      const hasWeb = Boolean(item.website && item.website.trim() !== '' && item.website !== 'N/A' && item.website !== 'none');
      const hasPhone = Boolean(item.phone && item.phone.trim() !== '' && item.phone !== 'N/A');
      const websiteUrl = hasWeb ? (item.website.startsWith('http') ? item.website : `https://${item.website}`) : '';

      return {
        id: `lead-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
        name: item.name || `Business #${index + 1}`,
        address: item.address || (location ? `${location}` : 'Address on request'),
        city: item.city || location || 'Local Area',
        state: item.state || '',
        phone: item.phone || '',
        phoneSource: hasPhone ? 'maps' : 'missing',
        website: websiteUrl,
        hasWebsite: hasWeb,
        rating: Number(item.rating) || 4.5,
        reviewsCount: Number(item.reviewsCount) || 12,
        category: item.category || keyword,
        placeUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name || keyword} ${item.address || location || ''}`)}`,
        status: 'discovered',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        journey: [
          {
            id: `j-${Date.now()}-init-${index}`,
            timestamp: new Date().toISOString(),
            stage: 'Discovered',
            title: 'Lead Discovered on Google Maps',
            description: `Found for query "${searchQuery}" with rating ${item.rating || 4.5}⭐ (${item.reviewsCount || 0} reviews). ${hasWeb ? `Website: ${websiteUrl}` : 'No website listed on Google Maps profile.'}`,
            type: 'system',
          },
        ],
      };
    });

    res.json({
      success: true,
      query: searchQuery,
      totalFound: processedLeads.length,
      leads: processedLeads,
    });
  } catch (error: any) {
    console.error('Error in /api/leads/search:', error);
    res.status(500).json({ error: error.message || 'Failed to search Google Maps leads' });
  }
});

// 2. Enrich Phone from Website if missing on Google Maps
app.post('/api/leads/enrich-phone', async (req: Request, res: Response) => {
  try {
    const { businessName, website, location } = req.body;
    if (!website) {
      return res.status(400).json({ error: 'Website is required for phone enrichment' });
    }

    const prompt = `Visit and analyze the web presence of the local business "${businessName}" at URL "${website}" located around "${location || ''}".
Your mission is to find their direct contact phone number, direct contact email, and owner/manager name if available.
Return STRICTLY JSON:
{
  "phone": "Extracted phone or null",
  "email": "Extracted email or null",
  "contactPerson": "Contact name or null",
  "sourceUrl": "${website}"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const parsed = extractJsonFromText(response.text || '') || {};

    res.json({
      success: true,
      phone: parsed.phone || null,
      email: parsed.email || null,
      contactPerson: parsed.contactPerson || null,
    });
  } catch (error: any) {
    console.error('Error in /api/leads/enrich-phone:', error);
    res.status(500).json({ error: error.message || 'Failed to enrich phone' });
  }
});

// 3. Initiate Audit, Weakness Analysis, and Financial ROI Pitch Report
app.post('/api/leads/audit-and-pitch', async (req: Request, res: Response) => {
  try {
    const { lead, agencySettings, customPrompt } = req.body;
    if (!lead) {
      return res.status(400).json({ error: 'Lead data is required' });
    }

    const agency = agencySettings || {
      agencyName: 'Apex Growth Digital',
      yearlyFee: 3600,
      monthlyFee: 400,
      currency: '$',
      slogan: 'Hyper-Local SEO & Customer Lead Systems',
    };

    // Calculate or infer lead value for their industry
    const industryKey = (lead.category || '').toLowerCase();
    let assumedLeadValue = 850; // default average conversion value

    const leadValueTable: Record<string, number> = agency.industryLeadValues || {
      roofing: 5500,
      plumbing: 750,
      hvac: 3200,
      dental: 1800,
      dentist: 1800,
      legal: 4500,
      lawyer: 4500,
      medspa: 950,
      solar: 6500,
      auto: 600,
      electrician: 650,
      construction: 6000,
      realtor: 7000,
      chiropractor: 1200,
    };

    for (const [k, val] of Object.entries(leadValueTable)) {
      if (industryKey.includes(k) || (lead.name || '').toLowerCase().includes(k)) {
        assumedLeadValue = val;
        break;
      }
    }

    const yearlyFee = Number(agency.yearlyFee) || 3600;
    const leadsNeeded = Math.max(1, Math.ceil(yearlyFee / assumedLeadValue));

    const systemInstruction = `You are an elite Local SEO Technical Auditor & High-Converting Agency Strategist.
You are generating a comprehensive, highly persuasive SEO Audit & Service Pitch Report for a business owner.
Agency Name: "${agency.agencyName}"
Agency Annual Fee: ${agency.currency || '$'}${yearlyFee.toLocaleString()}
Agency Monthly Retainer: ${agency.currency || '$'}${(agency.monthlyFee || Math.round(yearlyFee / 12)).toLocaleString()}
Assumed Client's Average Converted Customer Value: ${agency.currency || '$'}${assumedLeadValue.toLocaleString()}
Critical Break-even Math: Exactly ${leadsNeeded} converted leads covers the ENTIRE ${agency.currency || '$'}${yearlyFee.toLocaleString()} yearly fee. Any leads beyond that are 100% pure profit!

Target Business:
- Name: ${lead.name}
- Category / Niche: ${lead.category}
- Website: ${lead.website || 'No website'}
- Address / City: ${lead.address}, ${lead.city}
- Google Maps Rating: ${lead.rating} (${lead.reviewsCount} reviews)
- Phone: ${lead.phone}

AUDIT FOCUS:
Highlight critical negative points where the business is currently losing money, failing to rank in Google Maps 3-pack, suffering slow mobile speeds, missing local schema markup, lacking geo-targeted landing pages, or losing calls to local competitors.
Then, build an irresistible ROI pitch proving how recovering just ${leadsNeeded} customer leads completely pays for the service.

OUTPUT FORMAT: Return STRICTLY JSON with this exact structure:
{
  "overallScore": 48,
  "seoScore": 42,
  "mapsScore": 51,
  "mobileSpeedScore": 45,
  "summary": "Executive summary of audit findings in 2-3 compelling sentences highlighting revenue leakage.",
  "negativePoints": [
    {
      "category": "Google Maps Search",
      "issue": "Specific critical issue (e.g. Missing Local Schema & NAP inconsistencies across citations)",
      "impact": "Losing 40%+ of high-intent mobile searchers in their city to top 3 competitors",
      "fix": "Implement LocalBusiness JSON-LD markup and sync Google Maps business attributes"
    },
    {
      "category": "SEO Deficiencies",
      "issue": "Specific technical SEO flaw (e.g. Missing geo-targeted H1 tags and thin localized content)",
      "impact": "Google cannot associate the domain with high-value search queries like '${lead.category} near me'",
      "fix": "Re-architect on-page hierarchy with dedicated city-suburb landing pages"
    },
    {
      "category": "Mobile & Speed",
      "issue": "Slow mobile Core Web Vitals and lack of prominent tap-to-call click buttons",
      "impact": "High bounce rate; 60% of mobile phone searchers abandon before dialing",
      "fix": "Optimize asset delivery and embed sticky mobile quick-action booking bar"
    },
    {
      "category": "Conversion Leaks",
      "issue": "Lack of social proof widget and instant WhatsApp / SMS quote mechanism",
      "impact": "Prospects unable to get immediate quotes after hours",
      "fix": "Deploy instant booking capture and automated review velocity engine"
    }
  ],
  "pitch": {
    "headline": "How Capturing Just ${leadsNeeded} Additional ${lead.category} Jobs Completely Covers Your Yearly Investment",
    "body": "Persuasive breakdown of the numbers explaining why working with ${agency.agencyName} is a zero-risk revenue multiplier.",
    "estimatedLeadValue": ${assumedLeadValue},
    "leadsNeededToBreakEven": ${leadsNeeded},
    "yearlyFee": ${yearlyFee},
    "roiStatement": "At an estimated ticket value of ${agency.currency || '$'}${assumedLeadValue.toLocaleString()} per converted client, just ${leadsNeeded} closed customer(s) totally pays for your entire year of service.",
    "phases": [
      {
        "phase": "Phase 1: Quick Wins",
        "title": "Google 3-Pack Foundation & Schema Overhaul",
        "timeline": "Days 1 - 15",
        "deliverable": "Local schema injection, Google Maps category optimization, and NAP audit."
      },
      {
        "phase": "Phase 2: Authority Sprint",
        "title": "Geo-Targeted Content & Citation Velocity",
        "timeline": "Days 16 - 45",
        "deliverable": "Creation of high-intent service area pages and localized backlink acquisition."
      },
      {
        "phase": "Phase 3: Lead Dominance",
        "title": "Conversion Rate Optimization & Lead AK47 Engine",
        "timeline": "Days 46 - 90",
        "deliverable": "Review generation automation, mobile click-to-call funnels, and monthly ranking reports."
      }
    ]
  },
  "emailOutreach": {
    "subject": "Quick question regarding ${lead.name}'s Google Maps rank in ${lead.city}",
    "body": "Hi ${lead.name} team,\n\nI was looking at your listing on Google Maps for ${lead.category} in ${lead.city}.\n\nAre you currently accepting new client bookings this month?\n\nBest regards,\n${agency.agencyName}"
  },
  "whatsappOutreach": {
    "message": "Hi ${lead.name}! Found your profile on Google Maps for ${lead.category} in ${lead.city}. Are you currently taking on new clients this week?"
  }
}`;

    const promptText = customPrompt
      ? `${customPrompt}\n\nTarget business: ${JSON.stringify(lead)}`
      : `Audit this business website: "${lead.website}" (${lead.name}, ${lead.category} in ${lead.city}). Provide negative SEO / Google Maps search points and the exact ROI pitch.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const parsed = extractJsonFromText(response.text || '');
    if (!parsed || !parsed.negativePoints) {
      throw new Error('Failed to parse audit results from AI');
    }

    const auditReport = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      businessName: lead.name,
      website: lead.website,
      overallScore: parsed.overallScore || 45,
      seoScore: parsed.seoScore || 40,
      mapsScore: parsed.mapsScore || 50,
      mobileSpeedScore: parsed.mobileSpeedScore || 48,
      summary: parsed.summary || 'Comprehensive website and local SEO audit report.',
      negativePoints: parsed.negativePoints || [],
      pitch: parsed.pitch || {
        headline: `How Just ${leadsNeeded} Converted Clients Pays For Your Entire Yearly Retainer`,
        body: `Working with ${agency.agencyName} generates positive cash flow with minimal conversion threshold.`,
        estimatedLeadValue: assumedLeadValue,
        leadsNeededToBreakEven: leadsNeeded,
        yearlyFee,
        roiStatement: `Just ${leadsNeeded} converted jobs pays for the entire year.`,
        phases: [],
      },
      generatedWithPromptId: req.body.promptId || 'default-prompt',
      generatedAt: new Date().toISOString(),
    };

    const emailDraft = parsed.emailOutreach || {
      subject: `SEO Audit & Google Maps ranking for ${lead.name}`,
      body: `Hi ${lead.name} team, we audited your site and found several quick wins.`,
    };

    const whatsappDraft = parsed.whatsappOutreach || {
      message: `Hi ${lead.name}, we reviewed your Google Maps profile and have a quick 1-page audit for you.`,
    };

    res.json({
      success: true,
      auditReport,
      emailDraft,
      whatsappDraft,
    });
  } catch (error: any) {
    console.error('Error in /api/leads/audit-and-pitch:', error);
    res.status(500).json({ error: error.message || 'Failed to generate audit and pitch' });
  }
});

// 4. Generate Website Proposal for leads WITHOUT a website
app.post('/api/leads/generate-website-proposal', async (req: Request, res: Response) => {
  try {
    const { lead, agencySettings } = req.body;
    if (!lead) {
      return res.status(400).json({ error: 'Lead data is required' });
    }

    const agency = agencySettings || {
      agencyName: 'Apex Growth Digital',
      yearlyFee: 2400,
      currency: '$',
    };

    const systemInstruction = `You are an expert sales strategist for web design and local lead generation.
Target Business: "${lead.name}", ${lead.category} located in "${lead.address}, ${lead.city}".
This business currently HAS NO WEBSITE on their Google Maps listing!
This is a massive emergency for them: they are losing over 70% of potential customers searching on Google Maps and mobile browsers because modern consumers demand a credible website with instant booking and pricing.

Your goal is to generate a compelling Website Proposal Pitch.
Return STRICTLY JSON:
{
  "pitchHeadline": "Why ${lead.name} Is Losing 70% of Local ${lead.category} Inquiries on Google Maps Every Single Month",
  "problemStatement": "Consumers finding you on Google Maps cannot verify your pricing, view your past work, or book an appointment online without a professional website.",
  "missedRevenueEstimate": "Estimated 15 - 35 lost client inquiries per month",
  "proposedFeatures": [
    "Ultra-Fast Mobile First Architecture with Click-to-Call & WhatsApp Chat",
    "Google Maps Local Business Schema & NAP SEO Sync",
    "Customer Showcase Gallery & Instant Quote Request Funnel",
    "Automated Google Review Collection System"
  ],
  "estimatedPrice": 1499,
  "timeline": "Ready in 7 business days",
  "emailOutreach": {
    "subject": "Missing website on Google Maps for ${lead.name} (${lead.city})",
    "body": "Hi ${lead.name} team,\n\nI was looking for ${lead.category} services in ${lead.city} on Google Maps and noticed your listing has great reviews (${lead.rating}⭐), but currently has NO website linked.\n\nRight now, over 65% of local customers skip listings without a website and go straight to competitors. We build high-converting, mobile-ready local websites in under 7 days that hook directly into Google Maps.\n\nWe prepared a custom website proposal for ${lead.name}. Would you like me to send over the PDF mockup preview?\n\nBest regards,\n${agency.agencyName}"
  },
  "whatsappOutreach": {
    "message": "Hey ${lead.name}! Noticed your Google Maps profile has good ratings (${lead.rating}⭐), but no website linked. You're likely losing dozens of local calls in ${lead.city} to competitors. We build quick-turnaround local websites that rank #1 on Google Maps. Can I share a quick 1-page proposal and preview with you?"
  }
}`;

    const promptText = `Generate high-converting website proposal for ${lead.name} (${lead.category} in ${lead.city}) who currently has no website.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const parsed = extractJsonFromText(response.text || '');

    const websiteProposal = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      businessName: lead.name,
      pitchHeadline: parsed.pitchHeadline || `Complete Web Presence for ${lead.name}`,
      problemStatement: parsed.problemStatement || 'Missing digital presence is losing high-ticket customers.',
      missedRevenueEstimate: parsed.missedRevenueEstimate || '10-25 inquiries/month',
      proposedFeatures: parsed.proposedFeatures || [
        'Mobile-First Website Architecture',
        'Google Maps Local Schema Integration',
        'Direct WhatsApp & Call Booking Buttons',
      ],
      estimatedPrice: parsed.estimatedPrice || 1499,
      timeline: parsed.timeline || '7 business days',
      generatedAt: new Date().toISOString(),
    };

    const emailDraft = parsed.emailOutreach || {
      subject: `Missing website on Google Maps for ${lead.name}`,
      body: `Hi ${lead.name}, we noticed you don't have a website listed on your Google profile.`,
    };

    const whatsappDraft = parsed.whatsappOutreach || {
      message: `Hi ${lead.name}, noticed you don't have a website on Google Maps. We have a custom proposal ready.`,
    };

    res.json({
      success: true,
      websiteProposal,
      emailDraft,
      whatsappDraft,
    });
  } catch (error: any) {
    console.error('Error in /api/leads/generate-website-proposal:', error);
    res.status(500).json({ error: error.message || 'Failed to generate website proposal' });
  }
});

// Vite middleware for development, or static build for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Leads AK47 Machine server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
