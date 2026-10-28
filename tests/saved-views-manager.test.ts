import { describe, it, expect, beforeEach } from 'vitest';
import { SavedViewsManager } from '../src/lib/saved-views-manager';

describe('SavedViewsManager Persistence Engine', () => {
  beforeEach(() => {
    SavedViewsManager.clearMemoryStore();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('provides default standard views for EPs', () => {
    const defaultViews = SavedViewsManager.getDefaultViews('EP');
    expect(defaultViews.length).toBeGreaterThanOrEqual(2);
    expect(defaultViews.some(v => v.isDefault)).toBe(true);
    expect(defaultViews.find(v => v.id === 'ep_default_all')?.name).toBe('All Exchange Participants');
  });

  it('saves and retrieves custom tracker views', () => {
    const newView = SavedViewsManager.saveView({
      name: 'Custom Q4 Pipeline',
      entityType: 'ORGANIZATION',
      filters: { stage: 'CONTRACT_NEGOTIATION' },
      sorting: { columnId: 'updated_at', direction: 'desc' },
    });

    expect(newView.id).toBeDefined();
    expect(newView.name).toBe('Custom Q4 Pipeline');

    const retrieved = SavedViewsManager.getViews('ORGANIZATION');
    expect(retrieved.some(v => v.id === newView.id)).toBe(true);
  });

  it('updates an existing custom view', () => {
    const created = SavedViewsManager.saveView({
      name: 'Initial Name',
      entityType: 'TASK',
      filters: {},
    });

    const updated = SavedViewsManager.updateView(created.id, 'TASK', {
      name: 'Updated Urgent Tasks',
      filters: { isOverdue: true },
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Updated Urgent Tasks');
    expect(updated?.filters).toEqual({ isOverdue: true });
  });

  it('deletes custom view correctly', () => {
    const created = SavedViewsManager.saveView({
      name: 'To Delete',
      entityType: 'EP',
      filters: {},
    });

    const deleted = SavedViewsManager.deleteView(created.id, 'EP');
    expect(deleted).toBe(true);

    const afterDelete = SavedViewsManager.getViews('EP');
    expect(afterDelete.some(v => v.id === created.id)).toBe(false);
  });
});
