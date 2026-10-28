'use client';

import React, { useState } from 'react';
import { composeOutreachMessage, type OutreachLanguage } from '@/lib/sales/outreach-composer';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  contactName: string;
  city: string;
}

export function OutreachModal({
  isOpen,
  onClose,
  partnerName,
  contactName,
  city,
}: OutreachModalProps) {
  const [lang, setLang] = useState<OutreachLanguage>('fr');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const context = {
    partnerName,
    contactName: contactName || 'Madame, Monsieur',
    sdgTarget: 'ODD 4: Éducation de Qualité',
    city: city || 'Rabat',
    senderName: 'Mehdi Benjelloun',
    senderRole: 'Vice-Président Partenariats iGV',
    lcName: 'AIESEC à Rabat',
  };

  const message = composeOutreachMessage(lang, context);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${message.subject}\n\n${message.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Multi-Lingual Outreach Composer
            </h3>
            <p className="text-xs text-slate-500">Official LC Rabat Partnership Outreach Templates (REQ-016)</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* Language Tabs */}
        <div className="flex space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <button
            onClick={() => setLang('fr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              lang === 'fr'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
            }`}
          >
            🇫🇷 Français (Official B2B)
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              lang === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
            }`}
          >
            🇬🇧 English (Diplomatic / Multinationals)
          </button>
          <button
            onClick={() => setLang('ar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              lang === 'ar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300'
            }`}
          >
            🇲🇦 Darija / العربية (Local Associations)
          </button>
        </div>

        {/* Message Content */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-500">Subject</label>
            <div className="mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
              {message.subject}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-500">Body</label>
            <textarea
              readOnly
              rows={10}
              value={message.body}
              className={`mt-1 w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-mono text-xs border border-slate-200 dark:border-slate-700 leading-relaxed ${
                lang === 'ar' ? 'text-right font-sans text-sm' : ''
              }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-400">
            {message.missingTags.length === 0 ? (
              <span className="text-emerald-600 font-medium">✓ All merge tags cleanly substituted.</span>
            ) : (
              <span className="text-rose-500">Missing tags: {message.missingTags.join(', ')}</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Formatted Outreach'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
