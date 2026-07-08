import { getSession, saveSession } from '../auth';
import { BASE_URL } from '../baseUrl';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function refreshToken(): Promise<boolean> {
  const session = await getSession();
  if (!session?.refresh_token) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refresh_token }),
    });

    if (!res.ok) {
      await saveSession(null);
      return false;
    }

    const data = await res.json();
    await saveSession({
      ...session,
      access_token: data.access,
      refresh_token: data.refresh ?? session.refresh_token,
    });
    return true;
  } catch (_error: unknown) {
    await saveSession(null);
    return false;
  }
}

function beginRefresh(): Promise<boolean> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }
  return refreshPromise as Promise<boolean>;
}

async function sendRequest(
  path: string,
  options: RequestInit,
  headers: Record<string, string>,
): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
}

async function parseErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (_error: unknown) {
    return null;
  }
}

async function readResponse<T>(
  response: Response,
  path: string,
  method: string | undefined,
): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;

  const body = await parseErrorBody(response);
  throw new ApiError(
    response.status,
    `API ${method ?? 'GET'} ${path} -> ${response.status}`,
    body,
  );
}

async function retryAfterRefresh<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  const refreshed = await beginRefresh();
  if (!refreshed) throw new ApiError(401, 'Session expired');

  const retry = await sendRequest(path, options, await getAuthHeaders());
  if (retry.status === 401) throw new ApiError(401, 'Session expired');
  return readResponse<T>(retry, path, options.method);
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await sendRequest(path, options, await getAuthHeaders());
  if (response.status === 401) return retryAfterRefresh<T>(path, options);
  return readResponse<T>(response, path, options.method);
}
