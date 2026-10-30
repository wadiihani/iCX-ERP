'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { EPRecord } from '@/lib/ep/ep-data';
import {
  generateEpMessage,
  generateEpWhatsAppUrl,
  generateEpEmailUrl,
  type EpCommunicationTemplate,
} from '@/lib/automation/communication-copilot';

interface CommunicationCopilotMenuProps {
  ep: EPRecord;
  className?: string;
  variant?: 'compact' | 'full';
}

const TEMPLATE_OPTIONS: Array<{
  id: EpCommunicationTemplate;
  label: string;
  desc: string;
}> = [
  {
    id: 'INTERVIEW_INVITE',
    label: 'Interview Invite',
    desc: 'Invite EP to 25-min role expectation interview',
  },
  {
    id: 'VISA_AEVM_INSTRUCTIONS',
    label: 'Visa & AEVM Instructions',
    desc: '4 mandatory Moroccan consular documents list',
  },
  {
    id: 'AIRPORT_PICKUP_BRIEFING',
    label: 'Arrival & Pickup Briefing',
    desc: 'Standard #6 airport meeting & buddy logistics',
  },
  {
    id: 'STANDARDS_DISCREPANCY',
    label: 'Quality Check-in / Dispute',
    desc: 'Urgent 24h standards escalation message',
  },
];

export function CommunicationCopilotMenu({
  ep,
  className = '',
  variant = 'compact',
}: CommunicationCopilotMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCopy = (template: EpCommunicationTemplate) => {
    const msg = generateEpMessage(ep, template);
    navigator.clipboard.writeText(msg.body);
    setCopiedTemplate(template);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  const handleOpenWhatsApp = (template: EpCommunicationTemplate) => {
    const url = generateEpWhatsAppUrl(ep, template);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleOpenEmail = (template: EpCommunicationTemplate) => {
    const url = generateEpEmailUrl(ep, template);
    window.location.href = url;
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      {variant === 'compact' ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          title="Open Communication Copilot"
          className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-subtle hover:border-aiesec-blue hover:text-aiesec-blue dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-blue-400 transition"
        >
          <Sparkles className="h-3 w-3 text-amber-500" />
          <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:border-aiesec-blue hover:text-aiesec-blue dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Outreach Copilot</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      )}

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 z-50 mt-1.5 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Outreach to {ep.full_name.split(' ')[0]}</span>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {ep.product}
            </span>
          </div>

          <div className="space-y-1.5 pt-2 max-h-72 overflow-y-auto">
            {TEMPLATE_OPTIONS.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-left dark:border-slate-800/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(t.id)}
                      title="Copy formatted text"
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                    >
                      {copiedTemplate === t.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenWhatsApp(t.id)}
                      title="Send on WhatsApp"
                      className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEmail(t.id)}
                      title="Send via Email"
                      className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-2 border-t border-slate-100 pt-1.5 px-2 text-[10px] text-slate-400 dark:border-slate-800 flex justify-between items-center">
            <span>Click icon to trigger 1-click action</span>
            <span className="text-emerald-600 font-semibold">Ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
