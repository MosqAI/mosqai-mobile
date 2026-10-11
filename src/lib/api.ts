import type { Session } from './types';

// EXPO_PUBLIC_* values are inlined at build time. On a phone, use your
// computer's LAN address (http://192.168.x.x:3000), not localhost.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

interface TokenStore {
  get(): Session | null;
  /** Called with the rotated session, or null when the refresh token is no longer valid. */
  set(session: Session | null): void;
}

let tokens: TokenStore = { get: () => null, set: () => {} };
let refreshing: Promise<Session | null> | null = null;

/** Wired up by AuthProvider so the client can read and rotate tokens. */
export function configureTokens(store: TokenStore) {
  tokens = store;
}

async function parse(res: Response) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new ApiError(res.status, message ?? `Request failed (${res.status})`);
  }
  return body;
}

async function refresh(): Promise<Session | null> {
  const current = tokens.get();
  if (!current) return null;
  // Share one refresh across concurrent 401s: the old refresh token is single-use.
  refreshing ??= fetch(`${API_URL}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  })
    .then(async (res) => (res.ok ? ((await res.json()) as Session) : null))
    .catch(() => null)
    .then((session) => {
      tokens.set(session);
      return session;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const send = (accessToken?: string) =>
    fetch(`${API_URL}/v1${path}`, {
      ...init,
      headers: {
        ...(init.json !== undefined && { 'content-type': 'application/json' }),
        ...(accessToken && { authorization: `Bearer ${accessToken}` }),
        ...init.headers,
      },
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });

  let res = await send(tokens.get()?.accessToken);
  if (res.status === 401 && tokens.get()) {
    const session = await refresh();
    if (!session) throw new ApiError(401, 'Your session has expired. Please log in again.');
    res = await send(session.accessToken);
  }
  return parse(res) as Promise<T>;
}
