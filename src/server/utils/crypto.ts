const encoder = new TextEncoder();

export const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('');
};
