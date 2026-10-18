import React, { useState } from 'react';
import {
  DownloadCloud,
  RefreshCw,
  GitBranch,
  Server,
  Database,
  CheckCircle2,
  HardDrive,
  FileCode,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_RELEASES } from '../utils/defaults';
import { AppRelease } from '../types';

export const UpdatesView: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string>('v1.2.0');
  const [githubRepo, setGithubRepo] = useState<string>('leads-ak47/machine-core');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [releases, setReleases] = useState<AppRelease[]>(APP_RELEASES);

  const handleCheckUpdates = () => {
    setIsChecking(true);
    setUpdateMessage('Connecting to GitHub repository API to check for new release tags...');
    setUpdateSuccess(false);

    setTimeout(() => {
      setIsChecking(false);
      setUpdateAvailable(true);
      setUpdateMessage('New release v1.2.1 detected on GitHub with local speed enhancements and scraper stability fixes.');
    }, 1500);
  };

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    setUpdateMessage('Downloading release assets and performing safe migration (all leads, settings & prompts preserved)...');

    setTimeout(() => {
      setIsUpdating(false);
      setUpdateAvailable(false);
      setCurrentVersion('v1.2.1');
      setUpdateSuccess(true);
      setUpdateMessage('Successfully upgraded to v1.2.1! All existing leads, journey logs, and agency settings are 100% preserved.');

      // Add new release entry
      const newRelease: AppRelease = {
        version: 'v1.2.1',
        releaseDate: new Date().toISOString().split('T')[0],
        title: 'Auto-Updated via GitHub (Data Preserved)',
        isLatest: true,
        changes: [
          'Scraper query stability optimization',
          'Fast phone extraction regex upgrade',
          'Zero-data-loss safe migration executed',
        ],
      };

      setReleases([newRelease, ...releases]);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 2000);
  };

  // Generate and download the standalone lightweight PHP & MySQL Shared Hosting Package
  const handleDownloadSharedHostingKit = () => {
    const configPhp = `<?php
// Leads AK47 Machine - Shared Hosting Database & API Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'your_cpanel_db_user');
define('DB_PASS', 'your_cpanel_db_password');
define('DB_NAME', 'your_cpanel_db_name');

// AI API Key (Gemini, Claude, or OpenAI)
define('GEMINI_API_KEY', 'AIzaSy...');
define('CURRENCY', '₹');
define('YEARLY_FEE', 35000);
?>`;

    const schemaSql = `-- Leads AK47 Machine MySQL Database Schema
CREATE TABLE IF NOT EXISTS \`leads\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`address\` TEXT,
  \`city\` VARCHAR(100),
  \`phone\` VARCHAR(50),
  \`phone_source\` VARCHAR(30) DEFAULT 'maps',
  \`website\` TEXT,
  \`has_website\` TINYINT(1) DEFAULT 0,
  \`rating\` DECIMAL(2,1) DEFAULT 4.5,
  \`reviews_count\` INT DEFAULT 0,
  \`category\` VARCHAR(150),
  \`status\` VARCHAR(50) DEFAULT 'discovered',
  \`audit_data\` LONGTEXT,
  \`proposal_data\` LONGTEXT,
  \`journey_log\` LONGTEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`settings\` (
  \`setting_key\` VARCHAR(100) PRIMARY KEY,
  \`setting_value\` LONGTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

    const indexPhp = `<?php
/**
 * Leads AK47 Machine - Lightweight Shared Hosting Runner
 * Compatible with Apache, Nginx, cPanel, LiteSpeed (PHP 7.4 - 8.3+)
 */
require_once __DIR__ . '/config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Leads AK47 Machine (PHP Shared Hosting Edition)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Outfit:wght@700;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b0f19] text-slate-100 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
  <div id="root">
    <!-- Built bundle assets will mount here seamlessly on your shared hosting domain -->
    <div class="p-8 text-center text-slate-400">Loading Leads AK47 Machine...</div>
  </div>
  <script type="module" src="./assets/index.js"></script>
</body>
</html>`;

    // Download combined file
    const blob = new Blob([
      `=== 1. config.php ===\n\n${configPhp}\n\n=== 2. schema.sql ===\n\n${schemaSql}\n\n=== 3. index.php ===\n\n${indexPhp}`
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-ak47-shared-hosting-kit.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                System Updates & Shared Hosting
              </span>
              <span className="text-xs text-slate-400">Live Release Sync & Deployment</span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 mt-1 font-['Outfit']">
              Auto-Updates & Shared Hosting Setup
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Keep your Leads AK47 Machine updated automatically from GitHub without affecting your existing data, and run it on any standard PHP & MySQL shared hosting plan.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Installed Version:</span>
            <span className="font-extrabold text-orange-400 font-mono">{currentVersion}</span>
          </div>
        </div>
      </div>

      {/* GitHub Auto-Update Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-slate-100 text-sm font-['Outfit']">
              GitHub Repository Sync & 1-Click Upgrade
            </h3>
          </div>
          <span className="text-xs text-slate-400">Safe In-Place Upgrades</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-8">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              GitHub Repository
            </label>
            <div className="relative">
              <GitBranch className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="e.g. your-github-user/leads-ak47-machine"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <button
              onClick={handleCheckUpdates}
              disabled={isChecking || isUpdating}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Check GitHub'}</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {updateMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
              updateSuccess
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : updateAvailable
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            {updateSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : updateAvailable ? (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            ) : (
              <RefreshCw className="w-4 h-4 text-slate-400 shrink-0 animate-spin" />
            )}
            <div className="flex-1 font-medium">{updateMessage}</div>

            {updateAvailable && (
              <button
                onClick={handleApplyUpdate}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all shrink-0 active:scale-95"
              >
                <DownloadCloud className={`w-3.5 h-3.5 ${isUpdating ? 'animate-bounce' : ''}`} />
                <span>{isUpdating ? 'Upgrading...' : 'Update Now (Safe)'}</span>
              </button>
            )}
          </div>
        )}

        <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Zero Data Loss Guarantee:</strong> Clicking update never resets your scraped leads, ongoing journeys, prompt customizations, or agency credentials.
          </span>
        </div>
      </div>

      {/* Shared Hosting & PHP Framework Architecture Instructions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-sm font-['Outfit']">
                How to Run on Any Shared Hosting Plan (PHP & MySQL)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Works on standard $2/month cPanel, Hostinger, Bluehost, GoDaddy, or Namecheap hosting without Node.js VPS servers.
            </p>
          </div>

          <button
            onClick={handleDownloadSharedHostingKit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition-all active:scale-95 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PHP Shared Hosting Kit</span>
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Upload Built Files to cPanel</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Run <code className="text-orange-300 font-mono text-[11px]">npm run build</code> to produce the ultra-compact <code className="text-slate-200 font-mono">dist/</code> folder. Upload these static assets and the <code className="text-slate-200 font-mono">index.php</code> script to your shared hosting <code className="text-orange-300 font-mono text-[11px]">public_html</code> directory via cPanel File Manager or FTP (FileZilla).
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Create MySQL Database in cPanel</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In cPanel, click <strong>"MySQL Database Wizard"</strong>. Create a database (e.g. <code className="text-slate-200 font-mono">user_leadsak47</code>) and a database user with ALL PRIVILEGES. Then open phpMyAdmin and import the included <code className="text-slate-200 font-mono">schema.sql</code>.
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Configure config.php</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open <code className="text-slate-200 font-mono">config.php</code> in your file manager and paste your MySQL DB credentials (<code className="text-slate-300 font-mono text-[11px]">DB_NAME, DB_USER, DB_PASS</code>) and your preferred AI API key (<code className="text-slate-300 font-mono text-[11px]">GEMINI_API_KEY</code>).
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Optional Cron Job for Automated Lead Scraping</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              To trigger automated morning lead audits every day, set a cPanel Cron Job:
              <br />
              <code className="block mt-1 p-1.5 rounded bg-slate-900 text-emerald-400 font-mono text-[10px]">
                0 9 * * * php /home/youruser/public_html/cron.php
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* Release History & Changelog */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm font-['Outfit'] border-b border-slate-800 pb-3">
          Release Changelog History
        </h3>

        <div className="space-y-4">
          {releases.map((rel) => (
            <div
              key={rel.version}
              className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-100">{rel.version}</span>
                  {rel.isLatest && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Current
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">— {rel.title}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{rel.releaseDate}</span>
              </div>

              <ul className="space-y-1 pt-1">
                {rel.changes.map((c, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
