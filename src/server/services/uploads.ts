import type { Env } from '../../shared/types/env';
import { createId } from '../utils/id';

export const createUploadUrl = async (env: Env, userId: string, contentType = 'image/jpeg') => {
  const key = `catches/${userId}/${createId('photo')}.jpg`;
  return {
    key,
    uploadUrl: `${env.APP_URL}/api/catches/upload/${key}`,
    contentType,
  };
};

export const saveImageToR2 = async (env: Env, key: string, body: ArrayBuffer, contentType: string) => {
  await env.CATCH_UPLOADS.put(key, body, {
    httpMetadata: {
      contentType,
    },
  });

  return key;
};
