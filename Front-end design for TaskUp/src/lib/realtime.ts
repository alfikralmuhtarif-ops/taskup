// Real-time transport for chat messages and notification badges.
//
// The backend has published to a SignalR hub since it was first built
// (`NotificationsHub` at /hubs/notifications, one group per user id), but nothing
// on the client ever connected to it: ChatScreen fetched its messages once on mount
// and never again, so an incoming message stayed invisible until you left the
// conversation and came back. This module is the missing half.
//
// One shared connection for the whole app — a hub connection is per-user, not
// per-screen, and several screens want the same events at once (the open chat, the
// conversations list, and the header's unread badge).
import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'
import { getAccessToken } from './api'

const BASE_URL = import.meta.env.VITE_API_URL as string

/** Payload of the `message:new` event — mirrors the backend's MessageDto. */
export interface RealtimeMessage {
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

/** Payload of the `notification:new` event. */
export interface RealtimeNotification {
  id: string
  category: string
  title: string
  body: string | null
  relatedEntityType: string | null
  relatedEntityId: string | null
  createdAt: string
}

type EventName = 'message:new' | 'notification:new'
type Handler = (payload: never) => void

let connection: HubConnection | null = null
const handlers: Record<EventName, Set<Handler>> = {
  'message:new': new Set(),
  'notification:new': new Set(),
}

function dispatch(event: EventName, payload: unknown) {
  // Copied before iterating: a handler may unsubscribe itself (React StrictMode
  // double-invokes effects, so this happens in normal development).
  for (const handler of [...handlers[event]]) {
    try {
      (handler as (p: unknown) => void)(payload)
    } catch {
      // One bad subscriber must not stop the others from seeing the event.
    }
  }
}

function ensureConnection(): HubConnection {
  if (connection) return connection

  connection = new HubConnectionBuilder()
    .withUrl(`${BASE_URL}/hubs/notifications`, {
      // A browser WebSocket can't set an Authorization header, which is why the
      // backend also reads the token from an `access_token` query parameter
      // (see the JwtBearerEvents.OnMessageReceived handler in Program.cs).
      // This factory is re-invoked on every reconnect, so it naturally picks up a
      // token that lib/api.ts refreshed in the meantime.
      accessTokenFactory: () => getAccessToken() ?? '',
    })
    // Access tokens live 15 minutes; a dropped connection must come back with a
    // fresh one rather than staying dead and silently losing every later message.
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('message:new', (payload: unknown) => dispatch('message:new', payload))
  connection.on('notification:new', (payload: unknown) => dispatch('notification:new', payload))

  return connection
}

/** Opens the shared connection. Safe to call repeatedly; a no-op once connected. */
export async function startRealtime(): Promise<void> {
  if (!getAccessToken()) return
  const conn = ensureConnection()
  if (conn.state !== HubConnectionState.Disconnected) return
  try {
    await conn.start()
  } catch {
    // Real-time is an enhancement, never a requirement: every screen that uses it
    // also fetches over HTTP, so a failed hub connection degrades to the previous
    // fetch-on-mount behaviour instead of breaking the screen.
  }
}

/** Closes the connection and drops all subscribers — called on logout. */
export async function stopRealtime(): Promise<void> {
  const conn = connection
  connection = null
  for (const set of Object.values(handlers)) set.clear()
  if (conn) {
    try { await conn.stop() } catch { /* already gone */ }
  }
}

/**
 * Subscribes to a hub event. Returns the unsubscribe function, so a React effect
 * can just `return subscribe(...)`.
 */
export function subscribe(event: 'message:new', handler: (m: RealtimeMessage) => void): () => void
export function subscribe(event: 'notification:new', handler: (n: RealtimeNotification) => void): () => void
export function subscribe(event: EventName, handler: (payload: never) => void): () => void {
  handlers[event].add(handler)
  return () => { handlers[event].delete(handler) }
}
