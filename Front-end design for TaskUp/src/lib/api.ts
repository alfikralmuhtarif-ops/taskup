// Real backend client. Every primary flow goes through here: auth, profile (incl. phone
// change), people/block/report, conversations (list + messages), tasks, projects, notes,
// notifications (incl. preferences and delivery settings), global search, the team
// activity feed, and invites/contacts. The seeded CONVERSATIONS/PEOPLE_LIST arrays still
// exist in App.tsx only as initial-state placeholders for `useState`, not as displayed data.
const BASE_URL = import.meta.env.VITE_API_URL as string

export function absoluteStorageUrl(storageUrl: string): string {
  return `${BASE_URL}${storageUrl}`
}

const ACCESS_TOKEN_KEY = 'taskup_access_token'
const REFRESH_TOKEN_KEY = 'taskup_refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setSession(accessToken: string | null, refreshToken: string | null) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  else localStorage.removeItem(ACCESS_TOKEN_KEY)

  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  else localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Access tokens last 15 minutes (Jwt:AccessTokenMinutes) — with no refresh handling, any
// screen open longer than that had every real-data fetch silently fail into empty/mock
// fallback state (see e.g. ProjectsScreen's `.catch(() => setProjects([]))`), which looked
// exactly like "you have no projects" instead of "your session expired". Rather than forcing
// a full re-login like the admin panel does, the refresh token (30 days) lets this recover
// silently: on a 401, refresh once and retry the original request before giving up.
let refreshInFlight: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async res => {
        if (!res.ok) return false
        const result = await res.json()
        setSession(result.accessToken, result.refreshToken)
        return true
      })
      .catch(() => false)
      .finally(() => { refreshInFlight = null })
  }

  return refreshInFlight
}

async function request<T>(path: string, init: RequestInit = {}, isRetry = false): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    if (res.status === 401 && !isRetry) {
      const refreshed = await refreshSession()
      if (refreshed) return request<T>(path, init, true)
      setSession(null, null)
    }

    let message = res.statusText
    try {
      const body = await res.json()
      message = body.detail ?? body.title ?? message
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export interface BackendUserProfile {
  id: string
  phone: string
  name: string
  avatarUrl: string | null
  language: string
  taskCount: number
  projectCount: number
  completedTaskCount: number
}

export interface BackendPerson {
  id: string
  name: string
  avatarUrl: string | null
  phone: string
}

export interface BackendBlockedUser {
  userId: string
  name: string
  avatarUrl: string | null
  blockedAt: string
}

export interface BackendConversation {
  id: string
  otherParticipant: { userId: string; name: string; avatarUrl: string | null }
  lastMessageText: string | null
  lastMessageAt: string | null
}

export interface BackendMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatarUrl: string | null
  type: string
  text: string | null
  createdAt: string
  readAt: string | null
}

export const authApi = {
  requestOtp: (countryCode: string, phone: string, isLogin: boolean = false) =>
    request<{ requestId: string; expiresInSeconds: number }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ countryCode, phone, isLogin }),
    }),
  verifyOtp: (requestId: string, code: string) =>
    request<{ accessToken: string; refreshToken: string; isNewUser: boolean }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ requestId, code }),
    }),
}

export const usersApi = {
  getMe: () => request<BackendUserProfile>('/users/me'),
  updateMe: (patch: { name?: string; avatarUrl?: string }) =>
    request<BackendUserProfile>('/users/me', { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteMe: () => request<void>('/users/me', { method: 'DELETE' }),
  // Phone change is a two-step OTP flow against the *new* number, same as registration:
  // request returns a requestId, verify swaps User.Phone/PhoneHash once the code matches.
  requestPhoneChange: (countryCode: string, phone: string) =>
    request<{ requestId: string; expiresInSeconds: number }>('/users/me/phone/change/request', {
      method: 'POST',
      body: JSON.stringify({ countryCode, phone }),
    }),
  verifyPhoneChange: (requestId: string, code: string) =>
    request<BackendUserProfile>('/users/me/phone/change/verify', {
      method: 'POST',
      body: JSON.stringify({ requestId, code }),
    }),
}

export const peopleApi = {
  search: (q: string) => request<BackendPerson[]>(`/people/search?q=${encodeURIComponent(q)}`),
  block: (userId: string) => request<void>(`/people/${userId}/block`, { method: 'POST' }),
  unblock: (userId: string) => request<void>(`/people/${userId}/block`, { method: 'DELETE' }),
  listBlocked: () => request<BackendBlockedUser[]>('/people/blocked'),
  report: (userId: string, reason: string, messageId?: string) =>
    request<void>(`/people/${userId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, messageId: messageId ?? null }),
    }),
}

export const conversationsApi = {
  list: () => request<BackendConversation[]>('/conversations'),
  getOrCreate: (target: { userId?: string; phone?: string }) =>
    request<BackendConversation>('/conversations', { method: 'POST', body: JSON.stringify(target) }),
  getMessages: (conversationId: string) =>
    request<{ items: BackendMessage[] }>(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, text: string) =>
    request<BackendMessage>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ type: 'Text', text }),
    }),
}

export interface BackendTaskListItem {
  id: string
  title: string
  status: 'NotStarted' | 'InProgress' | 'Done'
  projectId: string | null
  projectName: string | null
  ownerId: string | null
  ownerName: string | null
  dueDate: string | null
  isOverdue: boolean
  progress: number | null
}

export interface BackendTaskParticipant {
  userId: string
  name: string
  avatarUrl: string | null
}

export interface BackendTaskDetail extends BackendTaskListItem {
  description: string | null
  createdById: string
  createdByName: string
  createdAt: string
  completedAt: string | null
  participants: BackendTaskParticipant[]
}

export interface BackendTaskUpdate {
  id: string
  authorId: string
  authorName: string
  authorAvatarUrl: string | null
  type: string
  text: string | null
  createdAt: string
}

export const tasksApi = {
  list: (params: { section?: string; projectId?: string; status?: string } = {}) =>
    request<BackendTaskListItem[]>(`/tasks?${qs(params)}`),
  get: (id: string) => request<BackendTaskDetail>(`/tasks/${id}`),
  create: (body: { title: string; ownerId?: string; participantIds?: string[]; dueDate?: string; description?: string; projectId?: string }) =>
    request<BackendTaskDetail>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { title?: string; ownerId?: string; dueDate?: string; description?: string }) =>
    request<BackendTaskDetail>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  changeStatus: (id: string, status: 'NotStarted' | 'InProgress' | 'Done') =>
    request<BackendTaskDetail>(`/tasks/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  getUpdates: (id: string) => request<{ items: BackendTaskUpdate[] }>(`/tasks/${id}/updates`),
  addUpdate: (id: string, text: string) =>
    request<BackendTaskUpdate>(`/tasks/${id}/updates`, { method: 'POST', body: JSON.stringify({ text }) }),
}

export interface BackendProjectListItem {
  id: string
  name: string
  description: string | null
  color: string
  status: 'Active' | 'Archived'
  progress: number | null
  taskCount: number
  memberCount: number
  createdAt: string
}

export interface BackendProjectMember {
  userId: string
  name: string
  avatarUrl: string | null
  role: string
}

export interface BackendProjectDetail {
  id: string
  name: string
  description: string | null
  color: string
  status: 'Active' | 'Archived'
  progress: number | null
  taskCount: number
  createdAt: string
  members: BackendProjectMember[]
}

export const projectsApi = {
  list: () => request<BackendProjectListItem[]>('/projects'),
  get: (id: string) => request<BackendProjectDetail>(`/projects/${id}`),
  getTasks: (id: string) => request<BackendTaskListItem[]>(`/projects/${id}/tasks`),
  create: (body: { name: string; description?: string; color: string; memberIds?: string[] }) =>
    request<BackendProjectDetail>('/projects', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { name?: string; description?: string; color?: string }) =>
    request<BackendProjectDetail>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
}

export interface BackendNoteListItem {
  id: string
  title: string
  contentPreview: string
  isPinned: boolean
  taskId: string | null
  taskTitle: string | null
  updatedAt: string
}

export interface BackendNoteDetail {
  id: string
  title: string
  content: string
  isPinned: boolean
  taskId: string | null
  taskTitle: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export const notesApi = {
  list: (params: { q?: string; includeDeleted?: boolean } = {}) =>
    request<BackendNoteListItem[]>(`/notes?${qs({ q: params.q, includeDeleted: params.includeDeleted ? 'true' : undefined })}`),
  get: (id: string) => request<BackendNoteDetail>(`/notes/${id}`),
  create: (body: { title: string; content?: string; taskId?: string }) =>
    request<BackendNoteDetail>('/notes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { title?: string; content?: string; isPinned?: boolean; taskId?: string }) =>
    request<BackendNoteDetail>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' }),
  restore: (id: string) => request<BackendNoteDetail>(`/notes/${id}/restore`, { method: 'POST' }),
}

export interface BackendNotification {
  id: string
  category: string
  title: string
  body: string | null
  relatedEntityType: string | null
  relatedEntityId: string | null
  readAt: string | null
  createdAt: string
}

export const notificationsApi = {
  list: (filter?: string) => request<BackendNotification[]>(`/notifications${filter ? `?filter=${filter}` : ''}`),
  markRead: (id: string) => request<void>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request<void>('/notifications/read-all', { method: 'POST' }),
}

export interface BackendUploadedFile {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  storageUrl: string
}

export const filesApi = {
  // Multipart upload — bypasses `request()` because that helper always sets
  // Content-Type: application/json, but a FormData body needs the browser to set its
  // own multipart boundary in Content-Type instead.
  upload: async (file: File): Promise<BackendUploadedFile> => {
    const token = getAccessToken()
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${BASE_URL}/files`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    })

    if (!res.ok) {
      let message = res.statusText
      try {
        const body = await res.json()
        message = body.detail ?? body.title ?? message
      } catch {
        // ignore non-JSON error bodies
      }
      throw new ApiError(res.status, message)
    }

    return res.json()
  },
}

function qs(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, value)
  }
  return search.toString()
}

// ─── Search ───────────────────────────────────────────────────────────────────
// `GET /search` was fully built server-side (PostgresSearchProvider, visibility-scoped)
// but nothing ever called it — Home's search bar was a static <span> with no onClick.

export type SearchResultType = 'Task' | 'Project' | 'Person' | 'File' | 'Conversation'

export interface BackendSearchResult {
  type: SearchResultType
  id: string
  title: string
  snippet: string | null
}

export const searchApi = {
  search: (q: string, types?: string) =>
    request<{ items: BackendSearchResult[] }>(`/search?${qs({ q, types })}`),
}

// ─── Activity feed ────────────────────────────────────────────────────────────

export interface BackendActivityItem {
  taskId: string
  taskTitle: string
  authorId: string
  authorName: string
  authorAvatarUrl: string | null
  text: string | null
  createdAt: string
}

export const activityApi = {
  list: () => request<BackendActivityItem[]>('/activity'),
}

// ─── Notification preferences / delivery settings ─────────────────────────────
// Preferences are enforced server-side by NotificationPublisher before a notification
// row is even written, so these toggles are real, not cosmetic.

export interface BackendNotificationPreferences {
  taskAssigned: boolean
  taskUpdated: boolean
  mention: boolean
  dueDateOverdue: boolean
  projectUpdates: boolean
  newMessage: boolean
}

export interface BackendNotificationDeliverySettings {
  sound: boolean
  vibration: boolean
  preview: boolean
  weeklyEmail: boolean
}

export const notificationSettingsApi = {
  getPreferences: () => request<BackendNotificationPreferences>('/notifications/preferences'),
  updatePreferences: (patch: Partial<BackendNotificationPreferences>) =>
    request<BackendNotificationPreferences>('/notifications/preferences', { method: 'PATCH', body: JSON.stringify(patch) }),
  getDeliverySettings: () => request<BackendNotificationDeliverySettings>('/notifications/delivery-settings'),
  updateDeliverySettings: (patch: Partial<BackendNotificationDeliverySettings>) =>
    request<BackendNotificationDeliverySettings>('/notifications/delivery-settings', { method: 'PATCH', body: JSON.stringify(patch) }),
}

// ─── Invites / contacts ───────────────────────────────────────────────────────

export interface BackendInvite {
  id: string
  phone: string
  label: string | null
  contextType: 'Task' | 'Project' | 'Direct'
  contextId: string | null
  status: 'Pending' | 'Joined'
  sentAt: string
}

export const invitesApi = {
  // Context 'Direct' is the "just invite them to the app" case — Task/Project contexts
  // additionally require ManageParticipants/ManageMembers on the target, server-side.
  create: (phone: string, name?: string, context: { type: 'Task' | 'Project' | 'Direct'; id?: string } = { type: 'Direct' }) =>
    request<BackendInvite>('/invites', {
      method: 'POST',
      body: JSON.stringify({ phone, name: name ?? null, context: { type: context.type, id: context.id ?? null } }),
    }),
  // Pending invites this user has sent (joined ones drop off the list server-side).
  listPending: () => request<BackendInvite[]>('/contacts'),
}
