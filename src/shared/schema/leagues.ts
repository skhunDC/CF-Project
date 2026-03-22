import { z } from 'zod';

export const leagueListQuerySchema = z.object({
  scope: z.enum(['friends', 'local', 'state', 'species']).optional(),
  metric: z.enum(['biggest_fish', 'most_fish', 'mixed']).optional(),
});

export const joinLeagueSchema = z.object({
  leagueId: z.string().min(1),
});
