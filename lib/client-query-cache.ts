type CacheEntry = { expiresAt: number; value: unknown };
const values = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<unknown>>();

/** Per-tab cache for low-volatility public Supabase reads. */
export async function getClientCached<T>(key: string, load: () => Promise<T>, ttlMs = 60_000): Promise<T> {
  const cached = values.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  const inFlight = pending.get(key);
  if (inFlight) return inFlight as Promise<T>;
  const request = load().then((value) => {
    values.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }).finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}

/** Clear matching cache entries after a successful edit when immediate refresh is needed. */
export function clearClientCached(keyPrefix: string) {
  for (const key of values.keys()) if (key.startsWith(keyPrefix)) values.delete(key);
}
