export const jsonOk = <T>(data: T, init?: ResponseInit) =>
  Response.json({ ok: true, data }, init);

export const jsonError = (message: string, status = 400, details?: unknown) =>
  Response.json({ ok: false, error: message, details }, { status });
