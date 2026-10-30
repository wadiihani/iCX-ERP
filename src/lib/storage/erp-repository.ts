/**
 * AIESEC iCX ERP — Persistent Local Storage Repository
 * Provides offline-first persistence for operational records:
 * - EPs, B2B Organizations, Deals, Opportunities, Invoices, Tasks, and Handoffs
 * - Falls back seamlessly to statutory seed datasets
 * - Emits change events so components stay synchronized across tabs
 */

import { INITIAL_EPS, type EPRecord } from '@/lib/ep/ep-data';
import { INITIAL_B2B_ORGANIZATIONS, type B2BOrganization } from '@/lib/crm/organizations-data';
import { INITIAL_B2B_DEALS, type B2bDealRecord } from '@/lib/sales/deals-data';
import { INITIAL_OPPORTUNITIES, type ExtendedOpportunity } from '@/lib/opportunity/opportunity-data';
import { INITIAL_INVOICES, type B2BInvoice } from '@/lib/finance/finance-types';
import { INITIAL_TASKS, INITIAL_HANDOFFS, type WorkloadTask, type StakeholderHandoff } from '@/lib/workload/handoff-types';

const STORAGE_KEYS = {
  EPS: 'icx_repo_eps_v1',
  ORGS: 'icx_repo_orgs_v1',
  DEALS: 'icx_repo_deals_v1',
  OPPS: 'icx_repo_opps_v1',
  INVOICES: 'icx_repo_invoices_v1',
  TASKS: 'icx_repo_tasks_v1',
  HANDOFFS: 'icx_repo_handoffs_v1',
};

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[ErpRepository] Failed to read ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('icx_repo_update', { detail: { key } }));
  } catch (err) {
    console.warn(`[ErpRepository] Failed to write ${key} to localStorage:`, err);
  }
}

export const ErpRepository = {
  // Exchange Participants
  getEps(): EPRecord[] {
    return safeGetItem<EPRecord[]>(STORAGE_KEYS.EPS, INITIAL_EPS);
  },
  saveEps(eps: EPRecord[]): void {
    safeSetItem(STORAGE_KEYS.EPS, eps);
  },
  updateEp(ep: EPRecord): void {
    const all = this.getEps();
    const updated = all.map((e) => (e.id === ep.id ? ep : e));
    this.saveEps(updated);
  },

  // B2B Organizations
  getOrganizations(): B2BOrganization[] {
    return safeGetItem<B2BOrganization[]>(STORAGE_KEYS.ORGS, INITIAL_B2B_ORGANIZATIONS);
  },
  saveOrganizations(orgs: B2BOrganization[]): void {
    safeSetItem(STORAGE_KEYS.ORGS, orgs);
  },
  updateOrganization(org: B2BOrganization): void {
    const all = this.getOrganizations();
    const updated = all.map((o) => (o.id === org.id ? org : o));
    this.saveOrganizations(updated);
  },

  // B2B Deals
  getDeals(): B2bDealRecord[] {
    return safeGetItem<B2bDealRecord[]>(STORAGE_KEYS.DEALS, INITIAL_B2B_DEALS);
  },
  saveDeals(deals: B2bDealRecord[]): void {
    safeSetItem(STORAGE_KEYS.DEALS, deals);
  },
  updateDeal(deal: B2bDealRecord): void {
    const all = this.getDeals();
    const updated = all.map((d) => (d.id === deal.id ? deal : d));
    this.saveDeals(updated);
  },

  // Opportunities & Slots
  getOpportunities(): ExtendedOpportunity[] {
    return safeGetItem<ExtendedOpportunity[]>(STORAGE_KEYS.OPPS, INITIAL_OPPORTUNITIES);
  },
  saveOpportunities(opps: ExtendedOpportunity[]): void {
    safeSetItem(STORAGE_KEYS.OPPS, opps);
  },

  // Invoices
  getInvoices(): B2BInvoice[] {
    return safeGetItem<B2BInvoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  },
  saveInvoices(invoices: B2BInvoice[]): void {
    safeSetItem(STORAGE_KEYS.INVOICES, invoices);
  },

  // Workload Tasks
  getTasks(): WorkloadTask[] {
    return safeGetItem<WorkloadTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },
  saveTasks(tasks: WorkloadTask[]): void {
    safeSetItem(STORAGE_KEYS.TASKS, tasks);
  },

  // Handoffs
  getHandoffs(): StakeholderHandoff[] {
    return safeGetItem<StakeholderHandoff[]>(STORAGE_KEYS.HANDOFFS, INITIAL_HANDOFFS);
  },
  saveHandoffs(handoffs: StakeholderHandoff[]): void {
    safeSetItem(STORAGE_KEYS.HANDOFFS, handoffs);
  },

  // Factory Reset
  resetToStatutoryDefaults(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent('icx_repo_update', { detail: { key: 'ALL' } }));
  },
};
