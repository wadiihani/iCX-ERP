export interface SavedViewDefinition {
  id: string;
  name: string;
  entityType: 'EP' | 'ORGANIZATION' | 'OPPORTUNITY' | 'SLOT' | 'DEAL' | 'TASK' | 'INVOICE' | 'AUDIT';
  filters: Record<string, unknown>;
  sorting?: {
    columnId: string;
    direction: 'asc' | 'desc';
  };
  visibleColumns?: string[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_PREFIX = 'aiesec_saved_views_';

export class SavedViewsManager {
  private static memoryStore = new Map<string, string>();

  private static getKey(entityType: string): string {
    return `${STORAGE_PREFIX}${entityType.toLowerCase()}`;
  }

  private static getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return this.memoryStore.get(key) || null;
      }
    }
    return this.memoryStore.get(key) || null;
  }

  private static setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        this.memoryStore.set(key, value);
      }
    } else {
      this.memoryStore.set(key, value);
    }
  }

  public static clearMemoryStore(): void {
    this.memoryStore.clear();
  }

  public static getViews(entityType: string): SavedViewDefinition[] {
    const raw = this.getItem(this.getKey(entityType));
    if (!raw) return this.getDefaultViews(entityType);
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : this.getDefaultViews(entityType);
    } catch {
      return this.getDefaultViews(entityType);
    }
  }

  public static saveView(view: Omit<SavedViewDefinition, 'id' | 'createdAt' | 'updatedAt'>): SavedViewDefinition {
    const existing = this.getViews(view.entityType);
    const now = new Date().toISOString();
    const newView: SavedViewDefinition = {
      ...view,
      id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...existing, newView];
    this.setItem(this.getKey(view.entityType), JSON.stringify(updated));
    return newView;
  }

  public static updateView(id: string, entityType: string, updates: Partial<Omit<SavedViewDefinition, 'id' | 'createdAt'>>): SavedViewDefinition | null {
    const existing = this.getViews(entityType);
    const index = existing.findIndex(v => v.id === id);
    if (index === -1) return null;

    const updatedView: SavedViewDefinition = {
      ...existing[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    existing[index] = updatedView;
    this.setItem(this.getKey(entityType), JSON.stringify(existing));
    return updatedView;
  }

  public static deleteView(id: string, entityType: string): boolean {
    const existing = this.getViews(entityType);
    const filtered = existing.filter(v => v.id !== id);
    if (filtered.length === existing.length) return false;

    this.setItem(this.getKey(entityType), JSON.stringify(filtered));
    return true;
  }

  public static getDefaultViews(entityType: string): SavedViewDefinition[] {
    const now = '2026-10-27T00:00:00Z';
    switch (entityType.toUpperCase()) {
      case 'EP':
        return [
          {
            id: 'ep_default_all',
            name: 'All Exchange Participants',
            entityType: 'EP',
            filters: {},
            sorting: { columnId: 'created_at', direction: 'desc' },
            isDefault: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'ep_pending_arrival',
            name: 'Approved - Pending Arrival (< 14 days)',
            entityType: 'EP',
            filters: { status: 'APPROVED', arrivalWithinDays: 14 },
            sorting: { columnId: 'start_date', direction: 'asc' },
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'ep_realized_active',
            name: 'Currently Realized & In-Country',
            entityType: 'EP',
            filters: { status: 'REALIZED' },
            sorting: { columnId: 'end_date', direction: 'asc' },
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          },
        ];
      case 'ORGANIZATION':
      case 'DEAL':
        return [
          {
            id: 'b2b_active_pipeline',
            name: 'Active Pipeline & Proposals',
            entityType: 'ORGANIZATION',
            filters: { stage: ['QUALIFICATION', 'PROPOSAL_SENT', 'CONTRACT_NEGOTIATION'] },
            sorting: { columnId: 'updated_at', direction: 'desc' },
            isDefault: true,
            createdAt: now,
            updatedAt: now,
          },
        ];
      case 'TASK':
        return [
          {
            id: 'task_overdue_urgent',
            name: 'Urgent & Overdue Tasks',
            entityType: 'TASK',
            filters: { isOverdue: true },
            sorting: { columnId: 'due_date', direction: 'asc' },
            isDefault: true,
            createdAt: now,
            updatedAt: now,
          },
        ];
      default:
        return [];
    }
  }
}
