import type { CareBrief, Env } from '../../shared/types/env';
import type { CreateBriefInput } from '../validation/brief';

const selectColumns = `
  id,
  customer_name as customerName,
  service_type as serviceType,
  due_date as dueDate,
  priority,
  status,
  notes,
  created_at as createdAt,
  updated_at as updatedAt,
  created_by as createdBy,
  updated_by as updatedBy
`;

export const listBriefs = async (env: Env): Promise<CareBrief[]> => {
  const result = await env.DB.prepare(
    `SELECT ${selectColumns}
     FROM service_briefs
     ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
              priority DESC,
              due_date ASC,
              updated_at DESC`
  ).all<CareBrief>();

  return result.results;
};

export const createBrief = async (env: Env, input: CreateBriefInput, actorEmail: string): Promise<void> => {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO service_briefs (
      id, customer_name, service_type, due_date, priority, status, notes,
      created_at, updated_at, created_by, updated_by
    ) VALUES (?1, ?2, ?3, ?4, ?5, 'new', ?6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?7, ?7)`
  )
    .bind(id, input.customerName, input.serviceType, input.dueDate, input.priority, input.notes, actorEmail)
    .run();
};

export const updateBriefStatus = async (
  env: Env,
  id: string,
  status: CareBrief['status'],
  actorEmail: string,
): Promise<boolean> => {
  const result = await env.DB.prepare(
    `UPDATE service_briefs
     SET status = ?1, updated_at = CURRENT_TIMESTAMP, updated_by = ?2
     WHERE id = ?3`
  )
    .bind(status, actorEmail, id)
    .run();

  return Boolean(result.meta.changes);
};

export const getBriefMetrics = async (env: Env) => {
  const row = await env.DB.prepare(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as newCount,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressCount,
      SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as readyCount
     FROM service_briefs`
  ).first<{ total: number; newCount: number; inProgressCount: number; readyCount: number }>();

  return {
    total: Number(row?.total ?? 0),
    newCount: Number(row?.newCount ?? 0),
    inProgressCount: Number(row?.inProgressCount ?? 0),
    readyCount: Number(row?.readyCount ?? 0),
  };
};
