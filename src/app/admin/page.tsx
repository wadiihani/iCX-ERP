'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Plus,
  Filter,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { HandoffModal } from '@/components/workload/handoff-modal';
import {
  INITIAL_HANDOFFS,
  INITIAL_TASKS,
  type StakeholderHandoff,
  type WorkloadTask,
} from '@/lib/workload/handoff-types';

export default function AdminWorkloadPage() {
  const [tasks, setTasks] = useState<WorkloadTask[]>(INITIAL_TASKS);
  const [handoffs, setHandoffs] = useState<StakeholderHandoff[]>(INITIAL_HANDOFFS);
  const [activeTab, setActiveTab] = useState<'tasks' | 'handoffs' | 'capacity'>('tasks');
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Computed KPIs
  const overdueTasksCount = tasks.filter((t) => t.is_overdue && t.status !== 'COMPLETED').length;
  const pendingHandoffsCount = handoffs.filter((h) => h.status === 'PENDING').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
          return { ...t, status: nextStatus, is_overdue: nextStatus === 'COMPLETED' ? false : t.is_overdue };
        }
        return t;
      })
    );
  };

  const handleAcceptHandoff = (handoffId: string) => {
    setHandoffs(
      handoffs.map((h) => {
        if (h.id === handoffId) {
          return { ...h, status: 'ACCEPTED', acknowledged_at: new Date().toISOString() };
        }
        return h;
      })
    );
    setAlertMsg({
      type: 'success',
      text: 'Transfer packet acknowledged and accepted. All linked operational tasks reassigned to your active queue.',
    });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleRejectHandoff = (handoffId: string) => {
    const reason = prompt('Please specify the reason for rejecting this handoff (e.g. missing signed documents):');
    if (!reason) return;

    setHandoffs(
      handoffs.map((h) => {
        if (h.id === handoffId) {
          return { ...h, status: 'REJECTED', rejection_reason: reason };
        }
        return h;
      })
    );
    setAlertMsg({
      type: 'error',
      text: `Handoff rejected and returned to sender with feedback: "${reason}"`,
    });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleInitiateHandoff = (newHandoff: Omit<StakeholderHandoff, 'id' | 'transferred_at'>) => {
    const created: StakeholderHandoff = {
      ...newHandoff,
      id: `hnd_${Date.now()}`,
      transferred_at: new Date().toISOString(),
    };
    setHandoffs([created, ...handoffs]);
    setAlertMsg({
      type: 'success',
      text: `Transfer packet generated for ${created.to_owner_name}. Retained in queue pending acceptance.`,
    });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Task table columns
  const taskColumns: ColumnDef<WorkloadTask>[] = [
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Blocked', value: 'BLOCKED' },
      ],
      cell: (task) => {
        const styles = {
          PENDING: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
          IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
          COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
          BLOCKED: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
        };
        return (
          <button
            onClick={() => handleToggleTaskStatus(task.id)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[task.status]} hover:opacity-80 transition`}
            title="Click to toggle status"
          >
            {task.status.replace('_', ' ')}
          </button>
        );
      },
    },
    {
      id: 'title',
      header: 'Task & Linked Record',
      accessorKey: 'title',
      sortable: true,
      cell: (task) => (
        <div>
          <span className={`font-semibold text-xs block ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
            {task.title}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Linked to {task.linked_record_type}: {task.linked_record_title}
          </span>
        </div>
      ),
    },
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'BD (Business Dev)', value: 'BD' },
        { label: 'CXP (Customer Exp)', value: 'CXP' },
        { label: 'FNL (Finance & Legal)', value: 'FNL' },
        { label: 'OGX (Outgoing Exch)', value: 'OGX' },
        { label: 'TM (Talent Mgmt)', value: 'TM' },
      ],
      cell: (task) => {
        const deptColors = {
          BD: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
          CXP: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300',
          FNL: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
          OGX: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
          TM: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${deptColors[task.department]}`}>
            {task.department}
          </span>
        );
      },
    },
    {
      id: 'assignee_name',
      header: 'Assignee Owner',
      accessorKey: 'assignee_name',
      sortable: true,
      cell: (task) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {task.assignee_name}
        </span>
      ),
    },
    {
      id: 'due_date',
      header: 'SLA Due Date',
      accessorKey: 'due_date',
      sortable: true,
      cell: (task) => (
        <div className="flex items-center gap-1.5">
          {task.is_overdue && task.status !== 'COMPLETED' && (
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          )}
          <span className={`text-xs font-mono font-medium ${task.is_overdue && task.status !== 'COMPLETED' ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
            {new Date(task.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-aiesec-blue mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>DEC-004 Governance & Protocol</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Workload & Stakeholder Handoffs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Department task execution and atomic stakeholder handoffs preventing lost delivery deadlines or orphaned records.
          </p>
        </div>

        <button
          onClick={() => setIsHandoffModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-aiesec-blue px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-aiesec-blue/90 transition self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Initiate Handoff Transfer</span>
        </button>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in ${
            alertMsg.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Open Tasks</span>
            <CheckSquare className="h-4 w-4 text-aiesec-blue" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {tasks.filter((t) => t.status !== 'COMPLETED').length} Tasks
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across 5 statutory departments
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue SLA Alarms</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {overdueTasksCount} Overdue
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Immediate escalation required
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Handoffs</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {pendingHandoffsCount} Awaiting
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Must be acknowledged by recipient
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Tasks</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {completedTasksCount} / {tasks.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {((completedTasksCount / (tasks.length || 1)) * 100).toFixed(0)}% completion rate
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>Department Tasks Tracker ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('handoffs')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'handoffs'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Handoffs Transfer Queue ({handoffs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('capacity')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'capacity'
              ? 'border-aiesec-blue text-aiesec-blue dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Department Capacity & Load</span>
        </button>
      </div>

      {/* Tab 1: Tasks Table */}
      {activeTab === 'tasks' && (
        <DataTable
          data={tasks}
          columns={taskColumns}
          keyExtractor={(t) => t.id}
          entityType="TASK"
          searchPlaceholder="Search tasks by title, department, assignee, linked record..."
          exportFileName="aiesec-rabat-department-tasks.csv"
        />
      )}

      {/* Tab 2: Handoffs Queue */}
      {activeTab === 'handoffs' && (
        <div className="space-y-4">
          {handoffs.map((h) => (
            <div
              key={h.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                    h.status === 'ACCEPTED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : h.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {h.status}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {h.entity_title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({h.entity_type})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Transferred:</span>
                  <time className="font-mono text-slate-600 dark:text-slate-300">
                    {new Date(h.transferred_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              </div>

              {/* Ownership transfer diagram */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">FROM OWNER</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{h.from_owner_name}</span>
                </div>
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-4 w-4 text-aiesec-blue" />
                  <span className="text-[10px] font-mono text-slate-400">{h.open_tasks_count} tasks transferred</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">TO RECIPIENT</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{h.to_owner_name}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {h.handoff_notes}
              </p>

              {h.rejection_reason && (
                <div className="rounded-md bg-rose-50 p-2.5 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
                  <span className="font-bold">Rejection Feedback: </span>
                  {h.rejection_reason}
                </div>
              )}

              {/* Action buttons if pending */}
              {h.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRejectHandoff(h.id)}
                    className="flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Reject Transfer Packet</span>
                  </button>
                  <button
                    onClick={() => handleAcceptHandoff(h.id)}
                    className="flex items-center gap-1 rounded-md bg-emerald-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Accept & Adopt Tasks</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Capacity Breakdown */}
      {activeTab === 'capacity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { dept: 'Business Development (BD)', head: 'Mehdi Benjelloun', count: 2, limit: 15 },
            { dept: 'Customer Experience (CXP)', head: 'Amina Benali', count: 2, limit: 20 },
            { dept: 'Finance & Legal (FNL)', head: 'Salma Tazi', count: 1, limit: 10 },
            { dept: 'Outgoing Exchange (OGX)', head: 'Yassine Alami', count: 0, limit: 15 },
            { dept: 'Talent Management (TM)', head: 'Kenza Filali', count: 0, limit: 10 },
          ].map((item) => (
            <div
              key={item.dept}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {item.dept}
                </span>
                <span className="text-xs font-mono font-bold text-aiesec-blue">
                  {item.count} / {item.limit} Active
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-aiesec-blue h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (item.count / item.limit) * 100)}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Department VP: {item.head}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Normal Bandwidth</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Handoff Modal */}
      <HandoffModal
        isOpen={isHandoffModalOpen}
        onClose={() => setIsHandoffModalOpen(false)}
        onInitiateHandoff={handleInitiateHandoff}
      />
    </div>
  );
}
