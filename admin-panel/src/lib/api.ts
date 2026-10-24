import type {
  ActivityFeedItem,
  AdminAccessLogItem,
  AdminProjectDetail,
  AdminProjectListItem,
  AdminReportListItem,
  AdminTaskDetail,
  AdminTaskListItem,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserProject,
  AdminUserTask,
  DashboardStats,
  PagedResult,
} from './types'

const BASE_URL = import.meta.env.VITE_API_URL as string

const TOKEN_KEY = 'taskup_admin_access_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    // The 15-minute access token can expire mid-session, not just before page load
    // (that case is caught by AuthProvider's expiry check). Bounce to login instead of
    // leaving a bare "Unauthorized" string on screen.
    if (res.status === 401) {
      setToken(null)
      window.location.href = '/login'
    }

    let message = res.statusText
    try {
      const body = await res.json()
      message = body.detail ?? body.title ?? message
    } catch {
      // ignore non-JSON error bodies
    }
    // Never throw an empty message. The OTP rate limiter answers 429 with no body at
    // all, and HTTP/2 carries no reason phrase, so res.statusText is "" too. Login
    // renders `{error && <div>{error}</div>}`, where the empty string is falsy — so the
    // button looked dead: no next step, no error, nothing. Callers localize further.
    if (!message) {
      message = `HTTP ${res.status}`
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const authApi = {
  requestOtp: (countryCode: string, phone: string) =>
    request<{ requestId: string; expiresInSeconds: number }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ countryCode, phone }),
    }),
  verifyOtp: (requestId: string, code: string) =>
    request<{ accessToken: string; refreshToken: string; isNewUser: boolean }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ requestId, code }),
    }),
}

export const adminApi = {
  dashboard: () => request<DashboardStats>('/admin/dashboard'),
  activity: (limit = 20) => request<ActivityFeedItem[]>(`/admin/dashboard/activity?limit=${limit}`),

  listUsers: (params: { search?: string; page?: number; pageSize?: number }) =>
    request<PagedResult<AdminUserListItem>>(`/admin/users?${qs(params)}`),
  getUser: (id: string) => request<AdminUserDetail>(`/admin/users/${id}`),
  setUserDisabled: (id: string, isDisabled: boolean) =>
    request<AdminUserDetail>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isDisabled }),
    }),
  getUserTasks: (id: string) => request<AdminUserTask[]>(`/admin/users/${id}/tasks`),
  getUserProjects: (id: string) => request<AdminUserProject[]>(`/admin/users/${id}/projects`),

  listTasks: (params: { search?: string; status?: string; projectId?: string; includeDeleted?: boolean; page?: number; pageSize?: number }) =>
    request<PagedResult<AdminTaskListItem>>(`/admin/tasks?${qs(params)}`),
  getTask: (id: string) => request<AdminTaskDetail>(`/admin/tasks/${id}`),
  deleteTask: (id: string) => request<void>(`/admin/tasks/${id}`, { method: 'DELETE' }),
  restoreTask: (id: string) => request<void>(`/admin/tasks/${id}/restore`, { method: 'POST' }),

  listProjects: (params: { search?: string; includeDeleted?: boolean; page?: number; pageSize?: number }) =>
    request<PagedResult<AdminProjectListItem>>(`/admin/projects?${qs(params)}`),
  getProject: (id: string) => request<AdminProjectDetail>(`/admin/projects/${id}`),
  deleteProject: (id: string) => request<void>(`/admin/projects/${id}`, { method: 'DELETE' }),
  restoreProject: (id: string) => request<void>(`/admin/projects/${id}/restore`, { method: 'POST' }),

  listReports: (params: { includeResolved?: boolean; page?: number; pageSize?: number }) =>
    request<PagedResult<AdminReportListItem>>(`/admin/reports?${qs(params)}`),
  resolveReport: (id: string) => request<void>(`/admin/reports/${id}/resolve`, { method: 'POST' }),
  reopenReport: (id: string) => request<void>(`/admin/reports/${id}/reopen`, { method: 'POST' }),

  listAuditLog: (params: { page?: number; pageSize?: number }) =>
    request<PagedResult<AdminAccessLogItem>>(`/admin/audit-log?${qs(params)}`),
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  return search.toString()
}
