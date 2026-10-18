import jsPDF from 'jspdf';
import { AgencySettings, AuditReport, Lead, WebsiteProposal } from '../types';

export function downloadAuditPdf(lead: Lead, report: AuditReport, settings: AgencySettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = settings.brandColorPrimary || '#f97316';
  const accentColor = settings.brandColorAccent || '#e11d48';

  const curSym = settings.currency === '₹' ? 'Rs. ' : (settings.currency || 'Rs. ');
  const formatCur = (num: number) => `${curSym}${num.toLocaleString()}`;

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const pRgb = hexToRgb(primaryColor);
  const aRgb = hexToRgb(accentColor);

  // Background / Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 42, 'F');

  // Accent Line
  doc.setFillColor(pRgb.r, pRgb.g, pRgb.b);
  doc.rect(0, 42, 210, 2.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.agencyName.toUpperCase(), 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(settings.slogan, 14, 25);
  doc.text(`Contact: ${settings.contactEmail} | ${settings.contactPhone}`, 14, 32);

  // Date & Tag
  doc.setFontSize(9);
  doc.setTextColor(249, 115, 22); // amber
  doc.text('CONFIDENTIAL AUDIT & ROI REPORT', 210 - 14, 18, { align: 'right' });
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date(report.generatedAt).toLocaleDateString()}`, 210 - 14, 25, { align: 'right' });

  // Client Info Section
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, 50, 182, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 50, 182, 26, 2, 2, 'S');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(lead.name, 20, 60);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Industry / Category: ${lead.category}`, 20, 66);
  doc.text(`Website: ${lead.website || 'No Website Listed'}  |  Location: ${lead.address || lead.city}`, 20, 71);

  // Score Badges
  const drawScoreBox = (x: number, y: number, label: string, score: number) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, 42, 22, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 21, y + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    if (score < 50) doc.setTextColor(225, 29, 72); // red
    else if (score < 75) doc.setTextColor(217, 119, 6); // amber
    else doc.setTextColor(16, 185, 129); // green
    doc.text(`${score} / 100`, x + 21, y + 17, { align: 'center' });
  };

  drawScoreBox(14, 82, 'OVERALL HEALTH', report.overallScore);
  drawScoreBox(60, 82, 'LOCAL MAPS 3-PACK', report.mapsScore);
  drawScoreBox(107, 82, 'ON-PAGE SEO', report.seoScore);
  drawScoreBox(154, 82, 'MOBILE & SPEED', report.mobileSpeedScore);

  // Executive Summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE DIAGNOSTIC SUMMARY', 14, 114);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(report.summary, 182);
  doc.text(splitSummary, 14, 120);

  let currentY = 120 + splitSummary.length * 5 + 4;

  // Critical Negative Points Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72); // Crimson red
  doc.text('CRITICAL NEGATIVE POINTS (REVENUE LEAKS)', 14, currentY);
  currentY += 6;

  (report.negativePoints || []).slice(0, 3).forEach((item, idx) => {
    doc.setFillColor(254, 242, 242); // red-50
    doc.roundedRect(14, currentY, 182, 22, 1.5, 1.5, 'F');
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(14, currentY, 182, 22, 1.5, 1.5, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(153, 27, 27);
    doc.text(`[${item.category}] ${item.issue}`, 18, currentY + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const impactText = doc.splitTextToSize(`Impact: ${item.impact}`, 174);
    doc.text(impactText, 18, currentY + 12);

    const fixText = doc.splitTextToSize(`Solution: ${item.fix}`, 174);
    doc.setTextColor(15, 23, 42);
    doc.text(fixText, 18, currentY + 17);

    currentY += 25;
  });

  // Break-even Mathematical ROI Pitch Box
  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(240, 253, 244); // green-50
  doc.roundedRect(14, currentY, 182, 34, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, currentY, 182, 34, 2, 2, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // green-800
  doc.text(`THE ROI PROMISE: BREAK-EVEN IN JUST ${report.pitch.leadsNeededToBreakEven} CLIENTS`, 20, currentY + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(21, 128, 61);
  const roiText = doc.splitTextToSize(
    `${report.pitch.roiStatement} With our complete Google Maps ranking system (${formatCur(report.pitch.yearlyFee)}/yr), every subsequent client after job #${report.pitch.leadsNeededToBreakEven} translates into direct bottom-line margin.`,
    170
  );
  doc.text(roiText, 20, currentY + 16);

  currentY += 40;

  // Implementation Roadmap
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3-PHASE REVENUE & RANKING ROADMAP', 14, currentY);
  currentY += 6;

  (report.pitch.phases || []).forEach((p) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, 182, 15, 1, 1, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${p.phase}: ${p.title} (${p.timeline})`, 18, currentY + 5.5);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(p.deliverable, 18, currentY + 11);
    currentY += 17;
  });

  // Footer CTA
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 280, 210, 17, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`READY TO DOMINATE YOUR LOCAL MARKET? CONTACT ${settings.agencyName.toUpperCase()}`, 105, 287, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Email: ${settings.contactEmail}   |   Phone: ${settings.contactPhone}   |   Web: ${settings.website}`, 105, 292, { align: 'center' });

  // Save the PDF
  const cleanFilename = `${lead.name.replace(/[^a-zA-Z0-9]/g, '_')}_SEO_Audit_Report.pdf`;
  doc.save(cleanFilename);
}

export function downloadWebsiteProposalPdf(lead: Lead, proposal: WebsiteProposal, settings: AgencySettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = settings.brandColorPrimary || '#f97316';
  const pRgb = {
    r: parseInt(primaryColor.slice(1, 3), 16) || 249,
    g: parseInt(primaryColor.slice(3, 5), 16) || 115,
    b: parseInt(primaryColor.slice(5, 7), 16) || 22,
  };

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 42, 'F');
  doc.setFillColor(pRgb.r, pRgb.g, pRgb.b);
  doc.rect(0, 42, 210, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.agencyName.toUpperCase(), 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(settings.slogan, 14, 25);
  doc.text(`Email: ${settings.contactEmail} | Phone: ${settings.contactPhone}`, 14, 32);

  doc.setFontSize(9);
  doc.setTextColor(249, 115, 22);
  doc.text('CUSTOM WEBSITE PROPOSAL', 210 - 14, 18, { align: 'right' });
  doc.setTextColor(148, 163, 184);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 210 - 14, 25, { align: 'right' });

  // Target Client Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 52, 182, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 52, 182, 26, 2, 2, 'S');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(lead.name, 20, 62);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Category: ${lead.category}  |  Google Maps Rating: ${lead.rating} (${lead.reviewsCount} reviews)`, 20, 68);
  doc.setTextColor(225, 29, 72);
  doc.text('STATUS: Currently No Official Website Listed on Google Maps', 20, 73);

  // Pitch Headline
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const headline = doc.splitTextToSize(proposal.pitchHeadline, 182);
  doc.text(headline, 14, 88);

  // Problem / Revenue Leak
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14, 102, 182, 30, 2, 2, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, 102, 182, 30, 2, 2, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('THE PROBLEM: WHY CUSTOMERS ARE CHOOSING COMPETITORS', 20, 110);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const prob = doc.splitTextToSize(
    `${proposal.problemStatement} Estimated Lost Inquiries: ${proposal.missedRevenueEstimate}.`,
    170
  );
  doc.text(prob, 20, 118);

  // Proposed Turnkey Package
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PROPOSED TURNKEY WEB SOLUTION', 14, 142);

  let currentY = 148;
  (proposal.proposedFeatures || []).forEach((feat, i) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, 182, 12, 1.5, 1.5, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`✓ ${feat}`, 20, currentY + 7.5);
    currentY += 15;
  });

  // Pricing & Timeline
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, currentY + 5, 182, 28, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, currentY + 5, 182, 28, 2, 2, 'S');

  const propCur = settings.currency === '₹' ? 'Rs. ' : (settings.currency || 'Rs. ');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(`INVESTMENT: ${propCur}${proposal.estimatedPrice.toLocaleString()} (All-Inclusive Turnkey)`, 20, currentY + 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Timeline: ${proposal.timeline} from kickoff. Includes full Google Maps integration & mobile speed guarantee.`, 20, currentY + 24);

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 280, 210, 17, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`TO APPROVE THIS PROPOSAL, CONTACT ${settings.agencyName.toUpperCase()}`, 105, 287, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Email: ${settings.contactEmail}   |   Phone: ${settings.contactPhone}   |   Web: ${settings.website}`, 105, 292, { align: 'center' });

  const cleanFilename = `${lead.name.replace(/[^a-zA-Z0-9]/g, '_')}_Website_Proposal.pdf`;
  doc.save(cleanFilename);
}
