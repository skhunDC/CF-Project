import { describe, expect, it } from 'vitest';
import { createBriefSchema, updateStatusSchema } from '../src/server/validation/brief';

describe('brief validation', () => {
  it('accepts a valid service brief payload', () => {
    const result = createBriefSchema.safeParse({
      customerName: 'Anna Park',
      serviceType: 'Dry Cleaning',
      dueDate: '2026-03-23',
      priority: 2,
      notes: 'Cream wool coat with same-day ready request.',
    });

    expect(result.success).toBe(true);
  });

  it('rejects short notes and invalid priorities', () => {
    const result = createBriefSchema.safeParse({
      customerName: 'A',
      serviceType: 'Dry Cleaning',
      dueDate: '2026-03-23',
      priority: 8,
      notes: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('restricts status updates to the enum', () => {
    expect(updateStatusSchema.safeParse({ status: 'ready' }).success).toBe(true);
    expect(updateStatusSchema.safeParse({ status: 'done' }).success).toBe(false);
  });
});
