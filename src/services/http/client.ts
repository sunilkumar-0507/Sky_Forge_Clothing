import { env } from '@/config/env';

/** Mirrors ASP.NET Core ProblemDetails (RFC 7807). */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public problem?: ProblemDetails,
  ) {
    super(problem?.detail ?? problem?.title ?? `Request failed with status ${status}`);
  }
}

export const TOKEN_KEY = 'skyforge-token';

type Params = Record<string, string | number | boolean | (string | number)[] | undefined | null>;

/** Arrays become repeated keys (?sizes=S&sizes=M), which ASP.NET Core binds to string[]. */
export const toQueryString = (params: Params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, String(v)));
    else qs.append(key, String(value));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
};

async function request<T>(method: string, path: string, body?: unknown, params?: Params): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${env.apiBaseUrl}${path}${params ? toQueryString(params) : ''}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let problem: ProblemDetails | undefined;
    try {
      problem = await res.json();
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, problem);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string, params?: Params) => request<T>('GET', path, undefined, params),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
