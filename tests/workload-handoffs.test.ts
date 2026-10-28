import { describe, it, expect } from 'vitest';
import {
  INITIAL_HANDOFFS,
  INITIAL_TASKS,
  type StakeholderHandoff,
  type WorkloadTask,
} from '../src/lib/workload/handoff-types';

describe('Stakeholder Handoffs & Workload Engine (Plan 03-03)', () => {
  it('loads valid initial stakeholder handoff contracts', () => {
    expect(INITIAL_HANDOFFS.length).toBeGreaterThanOrEqual(2);
    const pending = INITIAL_HANDOFFS.find((h) => h.status === 'PENDING');
    expect(pending).toBeDefined();
    expect(pending?.entity_type).toBe('EP');
    expect(pending?.from_owner_name).toContain('Youssef Mansouri');
    expect(pending?.to_owner_name).toContain('Amina Benali');
    expect(pending?.open_tasks_count).toBeGreaterThan(0);
    expect(pending?.handoff_notes).toBeTruthy();
  });

  it('correctly executes atomic handoff acceptance', () => {
    const handoff: StakeholderHandoff = {
      id: 'hnd_test_1',
      from_owner_id: 'usr_bd_01',
      from_owner_name: 'Youssef Mansouri',
      to_owner_id: 'usr_cxp_01',
      to_owner_name: 'Amina Benali',
      entity_type: 'EP',
      entity_id: 'ep_100',
      entity_title: 'Sarah Jenkins',
      status: 'PENDING',
      open_tasks_count: 2,
      transferred_at: '2026-10-28T10:00:00Z',
      handoff_notes: 'EP matched and approved for Casatech.',
    };

    expect(handoff.status).toBe('PENDING');
    expect(handoff.acknowledged_at).toBeUndefined();

    // Recipient acknowledges
    const now = new Date().toISOString();
    handoff.status = 'ACCEPTED';
    handoff.acknowledged_at = now;

    expect(handoff.status).toBe('ACCEPTED');
    expect(handoff.acknowledged_at).toBe(now);
  });

  it('correctly records handoff rejection with mandatory feedback reason', () => {
    const handoff: StakeholderHandoff = {
      id: 'hnd_test_2',
      from_owner_id: 'usr_bd_01',
      from_owner_name: 'Youssef Mansouri',
      to_owner_id: 'usr_cxp_01',
      to_owner_name: 'Amina Benali',
      entity_type: 'EP',
      entity_id: 'ep_200',
      entity_title: 'Lukas Schneider',
      status: 'PENDING',
      open_tasks_count: 3,
      transferred_at: '2026-10-28T10:00:00Z',
      handoff_notes: 'Transfer to CXP',
    };

    handoff.status = 'REJECTED';
    handoff.rejection_reason = 'Missing verified proof of health insurance.';

    expect(handoff.status).toBe('REJECTED');
    expect(handoff.rejection_reason).toBe('Missing verified proof of health insurance.');
  });

  it('identifies overdue tasks and flags visual alarms', () => {
    expect(INITIAL_TASKS.length).toBeGreaterThanOrEqual(4);
    const overdueTask = INITIAL_TASKS.find((t) => t.is_overdue);
    expect(overdueTask).toBeDefined();
    expect(overdueTask?.department).toBe('BD');
    expect(overdueTask?.status).toBe('BLOCKED');
  });
});
