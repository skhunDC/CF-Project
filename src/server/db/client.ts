import type { Env } from '../../shared/types/env';

export const first = async <T>(stmt: D1PreparedStatement) => (await stmt.first<T>()) ?? null;

export const all = async <T>(stmt: D1PreparedStatement) => {
  const result = await stmt.all<T>();
  return result.results;
};

export const withPagination = (limit = 20) => Math.min(Math.max(limit, 1), 50);

export const db = (env: Env) => env.DB;
