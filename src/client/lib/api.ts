export async function api<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json()) as { ok?: boolean; error?: string; data?: T };
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.data as T;
}
