import { z } from 'zod';

export const biteScoreQuerySchema = z.object({
  region: z.string().min(2).max(64),
  speciesId: z.string().optional(),
});
