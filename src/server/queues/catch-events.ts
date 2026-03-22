import type { MessageBatch } from '@cloudflare/workers-types';
import type { Env } from '../../shared/types/env';
import { processCatchEvent } from '../services/leaderboard-room';

export const consumeCatchEvents = async (batch: MessageBatch<any>, env: Env) => {
  for (const message of batch.messages) {
    try {
      await processCatchEvent(env, message.body);
      message.ack();
    } catch (error) {
      console.error('Queue processing failed', error);
      message.retry();
    }
  }
};
