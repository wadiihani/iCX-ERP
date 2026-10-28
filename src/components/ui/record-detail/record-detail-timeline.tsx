'use client';

import React, { useMemo } from 'react';
import { useRecordDetail } from './record-detail-context';
import type { TimelineEvent } from './record-detail-types';

export function RecordTimelinePanel() {
  const { record, timelineFilter, setTimelineFilter, openAuditDrawer } = useRecordDetail();

  const filterTabs = [
    { id: 'ALL', label: 'All Activity' },
    { id: 'STAGE_CHANGE', label: 'Stage Changes' },
    { id: 'HANDOFF', label: 'Handoffs' },
    { id: 'NOTE', label: 'Notes' },
    { id: 'MEETING', label: 'Meetings & Calls' },
    { id: 'DOCUMENT', label: 'Documents' },
  ];

  const filteredEvents = useMemo(() => {
    if (timelineFilter === 'ALL') return record.timeline;
    if (timelineFilter === 'MEETING') {
      return record.timeline.filter(e => e.eventType === 'MEETING' || e.eventType === 'CALL');
    }
    return record.timeline.filter(e => e.eventType === timelineFilter);
  }, [record.timeline, timelineFilter]);

  const eventIcons: Record<TimelineEvent['eventType'], string> = {
    STAGE_CHANGE: '⚡',
    NOTE: '📝',
    CALL: '📞',
    MEETING: '👥',
    APPROVAL: '✅',
    DOCUMENT: '📄',
    HANDOFF: '🤝',
    SYSTEM: '⚙️',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Chronological Activity Stream
        </h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTimelineFilter(tab.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                timelineFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 italic">
          No activity recorded in this category.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] select-none">
                {eventIcons[evt.eventType] || '•'}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {evt.title}
                    </span>
                    {evt.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${evt.badge.color}`}>
                        {evt.badge.text}
                      </span>
                    )}
                  </div>
                  <time className="text-[11px] font-mono text-slate-400" dateTime={evt.timestamp}>
                    {new Date(evt.timestamp).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {evt.actor.name}
                  </span>
                  {evt.actor.role && <span> ({evt.actor.role})</span>}
                  {evt.description && <p className="mt-1 text-slate-600 dark:text-slate-300">{evt.description}</p>}
                </div>

                {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                  <div className="mt-2 text-[11px] font-mono bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 overflow-x-auto">
                    {JSON.stringify(evt.metadata, null, 2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
