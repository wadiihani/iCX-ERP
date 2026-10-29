'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  User,
  Plus,
  ExternalLink,
} from 'lucide-react';
import {
  INITIAL_UNIFIED_TASKS,
  isTaskOverdue,
  type UnifiedTask,
  type TaskDepartment,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/tasks/unified-task-engine';

export interface UnifiedTaskQueueProps {
  initialTasks?: UnifiedTask[];
}

export function UnifiedTaskQueue({
  initialTasks = INITIAL_UNIFIED_TASKS,
}: UnifiedTaskQueueProps) {
  const [tasks, setTasks] = useState<UnifiedTask[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (departmentFilter !== 'ALL' && t.department !== departmentFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.relatedRecordTitle.toLowerCase().includes(q) ||
        t.assignedMemberName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleStatus = (taskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const nextStatus: TaskStatus =
            t.status === 'PENDING'
              ? 'IN_PROGRESS'
              : t.status === 'IN_PROGRESS'
              ? 'COMPLETED'
              : 'PENDING';

          const completed = nextStatus === 'COMPLETED';
          return {
            ...t,
            status: nextStatus,
            isOverdue: completed ? false : t.isOverdue,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const getRecordUrl = (task: UnifiedTask) => {
    switch (task.relatedRecordType) {
      case 'INVOICE':
        return '/dashboards';
      case 'EP':
        return '/crm';
      case 'DEAL':
      case 'ORGANIZATION':
        return '/sales';
      case 'OPPORTUNITY':
        return '/opportunities';
      case 'IR_PARTNER':
        return '/opportunities/irm';
      default:
        return '/admin';
    }
  };

  const overdueCount = tasks.filter((t) => t.isOverdue && t.status !== 'COMPLETED').length;
  const criticalCount = tasks.filter((t) => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length;

  return (
    <div className="space-y-4">
      {/* Top Banner KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Tasks</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {tasks.filter((t) => t.status !== 'COMPLETED').length} Pending
          </div>
          <span className="text-[10px] text-slate-500">Cross-module operational queue</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Critical Priority</span>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {criticalCount} Critical
          </div>
          <span className="text-[10px] text-slate-500">Overdue invoices & urgent visa gates</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Overdue Actions</span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {overdueCount} Overdue
          </div>
          <span className="text-[10px] text-slate-500">In Africa/Casablanca timezone</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title, record, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Departments</option>
            <option value="BD">Business Development (BD)</option>
            <option value="CXP">Customer Experience (CXP)</option>
            <option value="IR">International Relations (IR)</option>
            <option value="FNL">Finance & Legal (FNL)</option>
            <option value="TM">Talent Management (TM)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((t) => {
          const isDone = t.status === 'COMPLETED';

          return (
            <div
              key={t.id}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                  : t.isOverdue
                  ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900 shadow-subtle'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-subtle'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleStatus(t.id)}
                    className="mt-0.5 text-slate-400 hover:text-aiesec-blue transition"
                    title="Toggle task status"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <div className="h-4 w-4 rounded border-2 border-slate-300 dark:border-slate-600 hover:border-aiesec-blue" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-xs ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {t.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        t.priority === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {t.priority}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {t.department}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      <span>Linked Record: <strong className="text-slate-700 dark:text-slate-300">{t.relatedRecordTitle}</strong></span>
                      <span>•</span>
                      <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{t.assignedMemberName}</strong></span>
                      <span>•</span>
                      <span>Escalation: {t.escalationPath}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1.5">
                  <div className="flex items-center gap-1 justify-end text-[11px]">
                    <Clock className={`h-3 w-3 ${t.isOverdue && !isDone ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span className={`font-mono ${t.isOverdue && !isDone ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                      {t.displayDeadlineCasablanca}
                    </span>
                  </div>

                  <Link
                    href={getRecordUrl(t)}
                    className="text-[11px] font-bold text-aiesec-blue hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Record</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
